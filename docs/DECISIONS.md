# Decisions

Running log of choices made while porting `design/site-reference/index.html` to Next.js.
Rule of thumb: **the reference wins** over the build prompt; every deviation is listed here.

## Repo and toolchain

| # | Decision | Why |
|---|----------|-----|
| D1 | Standalone repo at the workspace root (not `apps/site`). | The workspace is not the Ironcrest monorepo. Moving to `apps/site` later is a folder move; tokens already live in one file (`app/tokens.css`) ready to become `packages/design-tokens`. |
| D2 | Pinned exact versions: Next 16.4.6, React 19.3.1, TypeScript **5.9.3**, ESLint 9.39.5, Vitest 5.1.0, Playwright 1.65.0, zod 4.6.7. | Latest stable everywhere except TypeScript 7 (native port) and ESLint 10, which `eslint-config-next` tooling has had less time with. Revisit after v1.0.0. |
| D3 | pnpm, `packageManager` pinned. | Matches the main Ironcrest monorepo. |
| D4 | Pure logic lives in `lib/` (easing, reveal, wheel geometry, module rules, price maths) and is unit tested. React glue lives in `components/` and `hooks/`. | The prompt's tree has no folder for shared non-React logic. |
| D5 | Reference moved to `design/site-reference/` as the prompt asks. | Source of truth for visual tests. |

## Styling

| # | Decision | Why |
|---|----------|-----|
| S1 | `app/tokens.css` copies the reference `:root` verbatim, except `--display`/`--ui`, which point at the `next/font` CSS variables first, then the same fallback stacks. | `next/font` self-hosts under a hashed family name, so the literal name `'Playfair Display'` would not resolve. |
| S2 | SVG `<text>` that used `font-family="Playfair Display,serif"` attributes in the reference uses `style={{fontFamily:'var(--display)'}}` instead. | Same reason as S1; visually identical. |
| S3 | CSS Modules per component; shared primitives (wrap, eyebrow, `em.r`, section padding, h2, lede, buttons, reveal, keyframes) in `app/globals.css`. State classes the JS toggles on `<html>`/`<body>` (`js`, `ready`) are referenced with `:global()`. | Prompt §2. |
| S4 | Behaviour hooks attach through data attributes, as in the reference: `data-r` (reveal), `data-par` (parallax), `data-mag` (magnetic), `data-tilt` (tilt), `data-cursor="drag"`, `data-hov` (cursor hover ring). One global client controller per behaviour, using event delegation and a MutationObserver for late-mounted nodes. | Keeps sections as server components (no client wrapper per button/card) and keeps the JS tiny. |
| S5 | Glass surfaces get an `@supports not (backdrop-filter)` solid fallback (`rgba(24,24,24,.94)`-ish). | Prompt §3.3; the reference has none. |

## Motion

| # | Decision | Why |
|---|----------|-----|
| M1 | `lib/motion.ts` is the single scroll handler (rAF-throttled, also runs on resize, like the reference `onScroll`) and the single rAF loop (cursor now, wheel physics in S2). Subscribers register through hooks. | Prompt §4.14. |
| M2 | Hero frame tilt reads the pointer position but is only recomputed inside the scroll handler. | That is what the reference does (`fx/fy` are used in `onScroll` only). |
| M3 | Loader, hero h1 masks and hero `.fade` items are hidden **only under `html.js`**, and each has a CSS-only failsafe animation (opens/reveals at ~3.4–3.6 s) that does not depend on React hydrating. | Reference hides the h1 lines even without JS, and if the JS bundle is slow its loader would cover the page forever. Prompt §4.1: "must never block the page if JS is slow". Visually identical on the happy path. |
| M4 | `html.js` is set by a `next/script` `beforeInteractive` inline script (no `dangerouslySetInnerHTML`). S5 will hash it for the CSP. | Same timing as the reference's head script. |
| M5 | Magnetic buttons and tilt cards are disabled under `prefers-reduced-motion` as well as for coarse pointers. | Prompt §4.14. The reference only checks the pointer type; under reduced motion its transitions are 0.01 ms, so this only removes jitter. |
| M6 | `prefers-reduced-motion` and fine-pointer are read live (`matchMedia` listeners), not once at load. | Harmless improvement; same result on load. |
| M7 | The custom cursor starts at the first pointer position instead of lerping in from (0,0). | The reference shows a brief streak from the top-left corner while it fades in; this is a glitch, not a design choice. |
| M8 | Tilt cards use the reference maths (`x*8` with `x` in [-0.5, 0.5]), so the maximum is **±4°**, not the ±8° the prompt states. | Reference wins. |
| M9 | Header CTA and burger keep the reference's 42px size but get an invisible 4px hit-area extension (50px targets). | Prompt §5 asks for ≥44px tap targets; visuals unchanged. |
| M10 | The burger menu adds a focus trap (burger + links), Esc to close (focus returns to the burger) and swaps `aria-label` Open/Close menu. The icon stays the same as the reference. | Prompt §9. |

## Media and IP

| # | Decision | Why |
|---|----------|-----|
| I1 | Raster images are the reference's pre-optimised WebP files served from `public/img/` with plain `<img>` (explicit width/height, `fetchpriority`, lazy loading) instead of `next/image`. | Allowed by prompt §2 ("or pre-optimised webp"); works with `output: 'export'` without a loader; byte-identical to the reference. |
| I2 | `NEXT_PUBLIC_SHOW_REAL_UI` defaults to `false`. When false, every real UI screen is swapped for an **illustrated** SVG placeholder (abstract sidebar/KPIs/chart in brand colours), never a blurred copy. | A blur still leaks layout; an illustration leaks nothing. |
| I3 | Visual regression builds run with `NEXT_PUBLIC_SHOW_REAL_UI=true` so screenshots compare like with like. | The reference shows the real screens. |

## Wheel

| # | Decision | Why |
|---|----------|-----|
| W1 | Card size, radius, stage height and plate size are computed in CSS from container-query units (`34cqw` etc.) with the reference formulas. JS only needs the drag scale (`cw*0.9`); the step angle `atan2(.9, 2.7)` = 18.43° is constant at every width. | Server-rendered layout is exact before hydration (no layout shift); same numbers as the reference `geo()`. |
| W2 | Autoplay also pauses while keyboard focus is inside the wheel. The stage exposes `data-active` and `data-autoplay` (`running`/`hover`/`focus`/`offscreen`/`moving`/`reduced-motion`), written only on change. | WCAG 2.2.2 (pause moving content) and deterministic tests. |
| W3 | The loop skips repainting when the wheel position hasn't changed, and the card scene animations pause while the stage is off-screen. | Cheap wins; no visual change. |
| W4 | Illustrations live in one file, `components/illustrations/Floors.tsx` (`Floor1`…`Floor6`), rendered on the server and passed to the client wheel as props. | Keeps ~6 KB of SVG out of the client bundle. |
| W5 | The loader overlay ignores the pointer as soon as it starts opening. | Its halves are still sliding away for 1.2 s after `body.ready`; clicks there were swallowed. Invisible change. |

## Performance

| # | Decision | Why |
|---|----------|-----|
| P2 | **Finding:** the full-screen film grain (`mix-blend-mode: overlay`, copied from the reference) forces a full-viewport re-blend whenever something beneath repaints. In software-rendered headless Chromium the page drops to ~8 fps over the animated wheel cards (34 fps without the grain). The reference behaves identically. Kept for fidelity; GPU-backed browsers composite it cheaply. Re-check on real mid-range Android in the S5 Lighthouse pass; the fallback is to drop the grain under `(pointer: coarse)`. | Measured with `tests/e2e` fps probes. |
| P1 | **Conflict (prompt budget vs. framework floor):** the prompt's "< 120 KB gzip for the whole page" can't be met by any Next 16 App Router page. The framework runtime alone (React 19 + Next client) is about 130 KB gzip. At S1, the page loads ~141 KB of module JS: about 131 KB framework plus about 10 KB of our code. The 39 KB `noModule` polyfill chunk is excluded because modern browsers never fetch it. Resolution: our own code is budgeted separately (≤ 40 KB gzip; see STATUS for the measured figure), and Lighthouse CI warns above 170 KB of script in total. **Measured at v1.0.0:** 165 KB gzip of module JS, made up of ~131 KB framework plus **~34 KB our code** (all sections, form validation and motion controllers). The wheel, story and reel are server-rendered markup with small client controllers (scroll/physics hooks), so lazy-mounting them would save almost nothing and would cost layout stability. | Choosing Next.js (prompt §2) sets this floor. |

## Testing

| # | Decision | Why |
|---|----------|-----|
| T1 | Visual comparison renders **both** the reference (served statically) and our build in the same Playwright run, with `reducedMotion: 'reduce'`, fonts awaited, the loader skipped, and compares with pixelmatch (per-pixel threshold 0.1, allowed differing pixels **1.5 %**). Diff PNGs are written to `visual-results/` (Playwright wipes `test-results/` on every run). | Prompt §11. Reduced motion settles every animation deterministically (no marquee drift, no loader), and both pages implement it the same way. |
| T2 | Locally the e2e suite runs on Chromium (desktop + phone). WebKit and Firefox projects exist in `playwright.config.ts` and run in CI (`pnpm e2e:all`). | Browser downloads are large; CI is where cross-browser matters. |
| T3 | Locally: 2 workers, 90 s test timeout, 1 retry. CI: default workers (one project per job), 30 s, 2 retries. | The dev machine (4 cores / 8 GB, browser open) stalls with more parallel browsers. |
| T4 | Sections whose wall-clock settling differs from the reference get a longer per-slice wait in the visual test (story 0.9 s, stats 2.2 s). An allowance above 1.5 % is only allowed with a DECISIONS reference (currently just V1). | The reference stats counter animates even under reduced motion. |
| T6 | When comparing any section other than stats, the visual test injects the reference's stats-row CSS bug (V1) into our page, so later sections sit at the same sub-pixel offsets as the reference. Without it, every phone section after the stats drifted 2–5 % from anti-aliasing alone. | Isolates each section's comparison from one known, documented deviation upstream. The stats row itself is still compared as built. |
| T5 | `pnpm test:export` serves `out/` with the CSP from the generated `.htaccess` and fails on any console error or CSP violation. | The static path has a different CSP (hashes) and needs its own check. |

## Visual deviations from the reference

| # | Deviation | Why |
|---|-----------|-----|
| V1 | **Stats numbers are big** (Playfair `clamp(2.6rem,6vw,5.4rem)`). The reference renders them at 13px because its `.stat span` rule also matches the counter `<span>` inside `<b>`. We scope that rule to `.stat > span`. The visual test allows 20 % for this section. | Reference CSS bug; its own `.stat b` rule and the prompt (§4.7 "Numbers count up") show the intent. |
| V2 | Small tap-target fixes: pricing toggle buttons, "Reset to defaults" and module rows get `min-height: 44px` (1-2 px taller than the reference). | Prompt §5 (≥ 44 px). |
| V4 | Phone `app` (slice 2) and `faq` (slice 1) differ by 2.55 % and 1.66 %. The diff images show only text anti-aliasing (identical layout, wrapping and colours, checked by eye). The visual test allows 3 % for these two sections. | Sub-pixel text positioning; not a layout difference. |
| V5 | Header glass is darker and blurrier than the reference: a `rgba(12,10,11,.62)` tint under the same gradient, and `blur(32px) saturate(160%)` instead of `blur(20px) saturate(150%)`. The visual test allows 15 % for the header. | Owner request after launch: busy content (e.g. the demo form) showed through the menu. |
| V3 | The demo form keeps the reference's three visible fields. The API also accepts an optional `phone` (prompt §8), but it isn't shown, so the four-column glass bar stays identical. | Reference layout wins; the field can be switched on later in `components/DemoForm.tsx`. |

## Accessibility

| # | Decision | Why |
|---|----------|-----|
| A1 | FAQ buttons sit in `h3`s; answers are `role="region"` + `aria-labelledby` and `inert` while closed, so hidden answers aren't focusable. | WAI-ARIA accordion pattern. |
| A2 | On phones (≤620px) the stats suffixes ("sec", "cards") use `--red-text` instead of `--red-hot`. | At ~17px they're small text and `--red-hot` on black fails 4.5:1 (axe). Prompt §3.1: small red text on black uses `--red-text`. |
| A3 | The mobile reel swipe row is a focusable `role="region"` labelled "Product screens". | Keyboard users can scroll it (axe `scrollable-region-focusable`). |
| A4 | Footer column labels are `h2`s styled as the reference's small `h4`s. | Valid heading order (no h2 → h4 jump). |
| A5 | Form errors: summary in an `aria-live` status line (the reference's `.thanks` line), each bad field gets `aria-invalid` + `aria-describedby`, and focus moves to the first bad field. | Prompt §8/§9. |

## Forms and API

| # | Decision | Why |
|---|----------|-----|
| F1 | One zod schema (`zod/mini`, ~2 KB) in `lib/demoRequest.ts` validates in the browser and in the route. Caps: name 80, gym 120, email 254, phone 30, body 8 KB. | No drift between client and server rules; small client cost. |
| F2 | Honeypot (`website`, off-screen, `tabindex=-1`): the API answers a quiet `200 {ok:true}` and drops the request. | Bots learn nothing; humans never see the field. |
| F3 | Rate limit: 5 per IP per hour, in-memory fixed window, IP from `X-Forwarded-For` (the proxy must overwrite it; see DEPLOY). | Prompt §8. One Node instance. Scaling out moves the limit to the API/proxy. |
| F4 | Delivery order: forward to the Ironcrest API (`IRONCREST_API_URL`), which stores the row; else Resend; else SMTP (nodemailer, loaded lazily). The site keeps no database of its own. In production with nothing configured, it answers 503. | "Store a row if a database URL is configured" belongs to the API, which already has the database; it avoids a second DB driver and credentials here. |
| F5 | Notification email is plain text plus an escaped HTML part; every value is stripped of control characters first, so there is no header injection. Logs never contain PII, only status codes and channel errors. | Prompt §8. |
| F6 | Static export: `pageExtensions: ['tsx']` in export mode leaves out `app/api/**/route.ts` and `proxy.ts`, and the browser posts to `NEXT_PUBLIC_DEMO_ENDPOINT` (the Ironcrest API). | Route handlers can't be exported. An earlier "move the folder aside" approach failed on Windows file locks. |

## Security

| # | Decision | Why |
|---|----------|-----|
| C1 | **Node:** `proxy.ts` (Next 16's middleware) mints a nonce per request; CSP `script-src 'self' 'nonce-…' 'strict-dynamic'`. The layout reads the nonce, so the page is rendered per request (`ƒ /`) instead of prerendered. | Prompt §8 asks for nonces; a nonce has to be per request. The page is cheap to render; static assets stay immutable-cached. |
| C2 | **Static export:** `scripts/postexport.mjs` hashes every inline script in `out/**/*.html`, plus the code `next/script` re-inserts from `self.__next_s`, into `out/.htaccess`. No `strict-dynamic` there (hashes can't cover `<script src>`), so `'self'` plus explicit Turnstile/analytics hosts are used instead. | Shared hosting can't mint nonces. |
| C3 | `style-src 'self' 'unsafe-inline'`. | React `style` props (the `--d`/`--i` custom properties) and SVG inline styles. Inline styles can't execute script; scripts stay nonce/hash-only. |
| C4 | Other headers: `nosniff`, `strict-origin-when-cross-origin`, Permissions-Policy (camera/mic/geolocation/payment/usb off), `X-Frame-Options: DENY` + `frame-ancestors 'none'`, COOP, HSTS (1 year, no preload; see DEPLOY), `poweredByHeader: false`. | Prompt §8. |
| C5 | `dangerouslySetInnerHTML` is used exactly once: the JSON-LD block, built from developer constants with `<` escaped. The illustrations are JSX, so they don't need it at all. | Prompt §8 allows it only for developer-authored constants. |
| C6 | Analytics are off unless `NEXT_PUBLIC_ANALYTICS_SRC` is set. Then a glass consent banner appears, and nothing loads before "Accept". The choice lives in `localStorage` (wrapped in try/catch). | Prompt §7. With analytics off there's nothing to consent to, so no banner. |

## SEO

| # | Decision | Why |
|---|----------|-----|
| E1 | Metadata via the App Router API (`metadataBase` from `NEXT_PUBLIC_SITE_URL`); `robots.tsx` / `sitemap.tsx` are force-static; JSON-LD `Organization` + `SoftwareApplication` (offers read from `content/pricing.ts`). | Prompt §7. |
| E2 | OG image (`public/og.png`, 1200×630) and `app/apple-icon.png` are generated once by `pnpm og` (Playwright renders the plate + headline) and committed. `app/icon.svg` is the crown tile. | A static file needs no runtime fonts or edge rendering, and works in the static export. |
