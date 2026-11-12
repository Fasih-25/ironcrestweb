# Deploying the Ironcrest site on Hostinger

There are two ways to host it. Pick one.

| | Path 1: Static export | Path 2: Node.js (Hostinger Node hosting or VPS) |
|---|---|---|
| Hostinger plan | Any shared web hosting | Business/Cloud plans with Node.js, or a VPS |
| Demo form | Posts straight to the Ironcrest API (`NEXT_PUBLIC_DEMO_ENDPOINT`) | Posts to this site's `/api/demo-requests`, which validates, rate-limits and delivers |
| CSP | sha256 hashes, written to `out/.htaccess` | Fresh nonce per request (`proxy.ts`) |
| Moving parts | Upload a folder | A Node process behind Nginx/Caddy |

## Environment variables

Copy `.env.example` to `.env.production.local` (never commit it) and fill in:

| Variable | Needed for | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | both | e.g. `https://ironcrest.pk`. Used for the canonical URL, sitemap and OG tags. |
| `NEXT_PUBLIC_SHOW_REAL_UI` | both | `false` (default) shows illustrated placeholders instead of product screenshots. Set `true` only when you're happy to show the real UI. |
| `NEXT_PUBLIC_DEMO_ENDPOINT` | static | Full URL of `POST /api/v1/public/demo-requests` on the Ironcrest API. Its origin must allow CORS from the site. |
| `IRONCREST_API_URL` | node (optional) | If set, the route forwards requests to `${IRONCREST_API_URL}/api/v1/public/demo-requests`, and the API stores them. |
| `RESEND_API_KEY` **or** `SMTP_HOST/PORT/USER/PASS` | node | Email notification, used when `IRONCREST_API_URL` isn't set. |
| `DEMO_NOTIFY_TO`, `DEMO_NOTIFY_FROM` | node | Recipient and verified sender address. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | optional | Cloudflare Turnstile. With no keys, the widget isn't loaded and the server check is skipped. |
| `NEXT_PUBLIC_ANALYTICS_SRC` | optional | Analytics script URL. Empty means no analytics and no cookie banner. When set, the script loads only after "Accept". |

`NEXT_PUBLIC_*` values are baked in at **build time**: rebuild after changing them.

In production, with no `IRONCREST_API_URL`, Resend or SMTP configured, the route answers `503` so a misconfiguration is noticed rather than silently dropping leads.

---

## Path 1: Static export (shared hosting)

```bash
pnpm install --frozen-lockfile
NEXT_PUBLIC_SITE_URL=https://ironcrest.pk \
NEXT_PUBLIC_DEMO_ENDPOINT=https://api.ironcrest.pk/api/v1/public/demo-requests \
pnpm build:export
```

`build:export` moves `app/api` and `proxy.ts` aside, runs `next build` with `output: 'export'`, restores them, and runs `scripts/postexport.mjs`. That writes `out/.htaccess` with:

- a Content-Security-Policy listing the sha256 of every inline script in the export
- `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`, COOP, HSTS
- `immutable` caching for hashed JS/CSS/fonts, 30 days for images, revalidation for HTML
- an HTTP → HTTPS redirect and gzip (`mod_deflate`)

Upload:

1. hPanel → **Files → File Manager** → `public_html/`. Back up and remove the old site files.
2. Upload the **contents** of `out/`, not the folder itself, including the hidden `.htaccess`. Turn on "show hidden files" if you can't see it.
3. hPanel → **Security → SSL**: make sure the certificate is active. Then open the site and check the response headers in DevTools → Network.

The form is a static page, so rate limiting, the honeypot and email delivery happen in the Ironcrest API's `POST /api/v1/public/demo-requests`. That endpoint must apply the same rules as `app/api/demo-requests/route.ts` (zod schema in `lib/demoRequest.ts`).

**Rollback:** keep the previous `out/` as a zip, e.g. `site-2026-11-12.zip`. To roll back, delete the files in `public_html/` and upload the old zip's contents.

---

## Path 2: Node.js hosting / VPS

### Build

```bash
pnpm install --frozen-lockfile
BUILD_TARGET=standalone pnpm build
# the standalone server doesn't copy static assets; add them:
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static
```

Deploy `.next/standalone/` to the server, e.g. `/srv/ironcrest/releases/2026-11-12/`, and point a `current` symlink at it.

### Run (pm2)

```bash
npm i -g pm2
cd /srv/ironcrest/current
PORT=3000 HOSTNAME=127.0.0.1 NODE_ENV=production pm2 start server.js --name ironcrest-site
pm2 save && pm2 startup
```

Put the environment variables in an `ecosystem.config.cjs` (or the systemd unit's `EnvironmentFile=`), with file mode `600`.

> **Rate limiting** is in-memory and per process. Run a single instance, or put the limit in the Ironcrest API or at the proxy (`limit_req` below) if you scale out.

### Nginx in front (TLS, compression, caching)

```nginx
limit_req_zone $binary_remote_addr zone=demo:10m rate=5r/h;

server {
  listen 443 ssl http2;
  server_name ironcrest.pk;
  ssl_certificate     /etc/letsencrypt/live/ironcrest.pk/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/ironcrest.pk/privkey.pem;

  gzip on; gzip_types text/css application/javascript image/svg+xml application/json;
  # brotli on; brotli_types ...;   # if the ngx_brotli module is installed

  location /_next/static/ {
    proxy_pass http://127.0.0.1:3000;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }
  location = /api/demo-requests {
    limit_req zone=demo burst=3 nodelay;
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header X-Forwarded-For $remote_addr;   # overwrite, never append (rate limiter trusts it)
    proxy_set_header X-Forwarded-Proto $scheme;
  }
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
server { listen 80; server_name ironcrest.pk; return 301 https://$host$request_uri; }
```

Caddy alternative: `ironcrest.pk { encode zstd gzip; reverse_proxy 127.0.0.1:3000 { header_up X-Forwarded-For {remote_host} } }`. Caddy handles TLS automatically.

**Important:** the route reads the client IP from `X-Forwarded-For`. The proxy must **overwrite** it with the real address, as above. Otherwise clients can spoof it and dodge the rate limit.

The app itself sends the CSP (with a per-request nonce) and the other security headers. Don't add a second CSP at the proxy, because two policies combine into the stricter one and will break scripts.

### HSTS

The site sends `Strict-Transport-Security: max-age=31536000; includeSubDomains`. Before submitting to the HSTS preload list, make sure **every** subdomain serves HTTPS, then add `; preload`. Preloading is hard to undo.

### Rollback

Releases live side by side in `/srv/ironcrest/releases/`. To roll back:

```bash
ln -sfn /srv/ironcrest/releases/<previous> /srv/ironcrest/current && pm2 reload ironcrest-site
```

Keep the last 3 releases.

---

## After every deploy

- `https://<site>/robots.txt` and `/sitemap.xml` load and show the right domain
- DevTools Console: no CSP errors. Network: `content-security-policy` header present.
- Submit the demo form once with a real address and confirm the email or API row arrives
- Check the OG preview with a social-card validator
