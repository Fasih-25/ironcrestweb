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

## Performance

| # | Decision | Why |
|---|----------|-----|
| P1 | **Open conflict, to settle in S5:** the prompt's "< 120 KB gzip for the whole page" can't be met by any Next 16 App Router page. The framework runtime alone (React 19 + Next client) is about 130 KB gzip. At S1, the page loads ~141 KB of module JS: about 131 KB framework plus about 10 KB of our code. The 39 KB `noModule` polyfill chunk is excluded because modern browsers never fetch it. Plan: keep our own code ≤ 40 KB gzip for the full page, lazy-mount the wheel, story and reel, and enforce this in Lighthouse CI. | Choosing Next.js (prompt §2) sets this floor. |

## Testing

| # | Decision | Why |
|---|----------|-----|
| T1 | Visual comparison renders **both** the reference (served statically) and our build in the same Playwright run, with `reducedMotion: 'reduce'`, fonts awaited, the loader skipped, and compares with pixelmatch (per-pixel threshold 0.1, allowed differing pixels **1.5 %**). Diff PNGs are written to `test-results/visual/`. | Prompt §11. Reduced motion settles every animation deterministically (no marquee drift, no loader), and both pages implement it the same way. |
| T2 | Locally the e2e suite runs on Chromium (desktop + phone). WebKit and Firefox projects exist in `playwright.config.ts` and run in CI (`pnpm e2e:all`). | Browser downloads are large; CI is where cross-browser matters. |
