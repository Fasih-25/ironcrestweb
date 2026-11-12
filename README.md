# Ironcrest — marketing site

The public site for the Ironcrest gym-management SaaS: a single cinematic long-scroll page in black, red and white, built with Next.js 16 (App Router), React 19 and TypeScript (strict). It has no animation libraries; everything runs on `requestAnimationFrame`, `IntersectionObserver` and CSS.

The visual and behavioural source of truth is the reference page in [`design/site-reference/index.html`](design/site-reference/index.html). Every deviation from it is recorded in [`docs/DECISIONS.md`](docs/DECISIONS.md).

## Quick start

```bash
pnpm install
cp .env.example .env.local      # optional; defaults work for local dev
pnpm dev                        # http://localhost:3000
```

Node ≥ 22.18 (24 recommended) and pnpm 10.

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` / `pnpm build` / `pnpm start` | The usual Next.js loop |
| `pnpm build:standalone` | Node server bundle for a VPS (`.next/standalone`) |
| `pnpm build:export` | Static site in `out/` plus a generated `.htaccess` (CSP hashes, headers, caching) for Hostinger shared hosting |
| `pnpm lint` · `pnpm typecheck` · `pnpm test` | ESLint, `tsc --noEmit`, Vitest unit tests |
| `pnpm e2e` | Playwright e2e on Chromium desktop + phone, against a production build (`pnpm build` first). `pnpm e2e:all` adds Firefox and WebKit. |
| `pnpm visual` | Builds with real UI shown and compares every section with the reference, pixel by pixel (diffs in `visual-results/`) |
| `pnpm test:export` | Serves `out/` with its generated CSP and checks there are no errors (after `pnpm build:export`) |
| `pnpm og` | Regenerates `public/og.png` and `app/apple-icon.png` |

## Where to change things

| You want to… | Edit |
|---|---|
| Change prices, plan names or features | [`content/pricing.ts`](content/pricing.ts) (annual factor and currency are at the top) |
| Change any copy | `content/*.ts` (site, floors, steps, modules, faq, app, cta) |
| Swap product screenshots | `public/img/*.webp` + [`content/media.ts`](content/media.ts) |
| Show the real product UI | `NEXT_PUBLIC_SHOW_REAL_UI=true` at build time. The default `false` uses illustrated placeholders. |
| Change colours | [`app/tokens.css`](app/tokens.css) |

**IP rule:** the "Look at all of it" reel shows exactly five screens (Dashboard, Members, Subscriptions, Class booking, Payments). A unit test fails if anything else is added; see `REEL_SCREENS` in `content/media.ts`.

## Layout

```
app/            layout, page, robots, sitemap, icons, api/demo-requests (POST)
components/     one folder or file per section; ui/ for shared primitives
  wheel/        Plate Wheel slider (geometry.ts = pure maths, useWheelPhysics.ts = input + loop)
  story/ reel/  pinned scroll sections (pure maths + tiny scroll controllers)
  modules/      module-switch demo (moduleRules.ts = dependency rules)
content/        all copy and data, typed
lib/            pure logic: motion loop, maths, pricing, CSP, validation, rate limit
hooks/          reveal, parallax, media queries
proxy.ts        per-request CSP nonce (Node hosting)
tests/          unit/ (Vitest) · e2e/ · visual/ · export/ (Playwright)
docs/           DECISIONS · STATUS · DEPLOY_HOSTINGER
design/         the reference page (source of truth)
```

## Deploying

See [`docs/DEPLOY_HOSTINGER.md`](docs/DEPLOY_HOSTINGER.md) for both paths: a static export on shared hosting, or Node behind Nginx/Caddy.
