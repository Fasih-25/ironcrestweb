# IRONCREST MARKETING WEBSITE — Build Prompt for Claude Code

> Put the `site-reference/` folder (from the zip I gave you) at `design/site-reference/` in your repo, then paste this whole file into Claude Code, or save it as `WEBSITE_PROMPT.md` and say "Read WEBSITE_PROMPT.md and execute it".

---

## 0. ROLE AND RULES

You are a senior front-end engineer and creative developer. Build the **Ironcrest marketing website** (the public site that sells the Ironcrest gym-management SaaS) as a production-quality **Next.js** app that looks, moves and behaves **exactly** like the reference page in `design/site-reference/index.html`.

- **The reference is the source of truth.** Open it in a browser (Playwright) and compare constantly. Match layout, spacing, type, colours, copy, animation timing and interactions. Do not redesign, "improve", add sections, or swap fonts/colours. If the reference and this prompt disagree, the reference wins; note it in `docs/DECISIONS.md`.
- Port the reference's vanilla JS into typed, tested React hooks/components. **No animation libraries** (no GSAP / Framer Motion / Lenis): the reference runs on `requestAnimationFrame`, `IntersectionObserver`, CSS transitions and CSS keyframes, and the port must too (zero extra runtime weight, identical feel).
- Do not ask me questions. Decide, and record decisions in `docs/DECISIONS.md`.
- Work in the milestones of §14. After each milestone: lint, typecheck, tests, build, a Playwright visual comparison against the reference, commit, write a 5-line `docs/STATUS.md`, then **stop and wait** for me to say "start milestone N". At the start of every session read `docs/STATUS.md` and continue from the first unfinished item.
- Never commit secrets. Provide `.env.example`.

---

## 1. WHAT THE SITE IS

A single long-scroll, cinematic, dark marketing page in **black, red and white**. One recurring object ties it together: a gym **iron weight plate** (concentric rings, knurled tick marks, text on a circular path). It spins behind the hero, becomes the wheel the signature slider rides on, rings the member app, and closes the page.

Page order (anchor ids in brackets):
1. Loader (plate counts 0 → 100 KG, then splits open)
2. Floating glass header + scroll-progress bar
3. Hero `[#top]`
4. Tilted marquee
5. **Plate Wheel slider** "Built for every floor" `[#wheel]`
6. Pinned scroll story "From the front door to the bank deposit" `[#platform]`
7. Stats row (count-up)
8. **Paper band** (white section) with live module-switch demo `[#modules]`
9. Pinned horizontal reel "Look at all of it" `[#screens]`
10. Member app section `[#app]`
11. Pricing `[#pricing]`
12. FAQ `[#faq]`
13. CTA "Open the doors." with demo form `[#demo]`
14. Footer

Nav links: Floors, Platform, Modules, Screens, Member app, Pricing, FAQ, and a "Book a demo" button.

---

## 2. TECH STACK

- **Next.js (latest stable, App Router), React, TypeScript strict.** The page is mostly static: render server components where possible; interactive pieces are small client components. Static export (`output: 'export'`) must be possible so it can be hosted on Hostinger shared/Node hosting; also support `output: 'standalone'`.
- **Styling:** CSS Modules + a global `tokens.css` of CSS variables (copy the reference's `:root` tokens verbatim). No Tailwind needed; if you prefer Tailwind, tokens must still be the same CSS variables. Single dark theme (deliberate); set `color-scheme: dark`.
- **Fonts:** `next/font/google` self-hosted: **Playfair Display** (500, 600, 700, 800, italics 500–700) for display, **Manrope** (400–800) for UI. No runtime requests to Google.
- **Images:** `next/image` (or pre-optimised webp) for the few raster images; everything else is inline SVG.
- **Tests:** Vitest + Testing Library (unit), Playwright (e2e + visual regression + axe), Lighthouse CI.
- Monorepo-friendly: lives in `apps/site` if the repo is the main Ironcrest monorepo (pnpm + Turborepo), otherwise a standalone repo. Shared tokens can later move to `packages/design-tokens`.

---

## 3. DESIGN SYSTEM (copy exactly)

### 3.1 Colour tokens
```
--bg:#0A0A0A  --ink:#F5F1F0  --silver:#E0E0E0  --muted:#A49A9B  --line:rgba(255,255,255,.12)
--red:#A91421  --red-2:#C21A2A  --red-hot:#E5283A  --red-text:#FF6B76  --maroon:#650A15  --charcoal:#1D1D1D
--paper:#F7F3F2  --paper-ink:#160A0C  --paper-muted:#6B5C5E
```
Rules: large red italics use `--red-hot`; small red text on black uses `--red-text` (contrast). Primary buttons are a vertical gradient `--red-2 → --red` with white text, inner top highlight and a red glow shadow. Ghost buttons are 6% white with a 22% white border. The white "paper band" section uses `--paper` with `--paper-ink` text and `--red` accents.

### 3.2 Typography
- Headings `h1–h3`: Playfair Display, weight 600, `line-height:1.04`, `letter-spacing:-.01em`, `text-wrap:balance`.
- Body: Manrope 500, 16px/1.6. Lede: `clamp(1.02rem,1.5vw,1.25rem)`, colour `--muted`, max-width 56ch.
- Eyebrow: Manrope 800, 12px, uppercase, letter-spacing .22em, `--red-text`, preceded by a 34×2px line.
- Hero h1: `clamp(2.7rem,7.6vw,7.4rem)`, line-height .96, three lines: "Every member." / "Every class." / "One *command* centre." (*command* is `em.r`: Playfair italic 600, `--red-hot`).
- Section h2: `clamp(2.4rem,6vw,5.2rem)`. Accent words use `em.r`.
- Tabular numerals for all counters/prices.

### 3.3 Surfaces
- **Glass:** `linear-gradient(135deg, rgba(255,255,255,.09→.12), rgba(255,255,255,.02))`, `backdrop-filter: blur(18–22px) saturate(150%)`, 1px translucent border, inset top highlight, big soft shadow. Provide a solid fallback when `backdrop-filter` is unsupported.
- **Film grain:** fixed full-screen SVG-noise overlay at ~7% opacity, `mix-blend-mode:overlay`, `pointer-events:none`.
- Radii: pills 999px; cards 22–26px; inner images 14–18px.
- Spacing: sections `padding-block: clamp(80px, 11vw, 170px)`; content wrapper `width:min(100%,1320px)` with side gutters `max(20px, env(safe-area-inset-*))`.

### 3.4 The Plate (shared component `<Plate/>`)
Inline SVG, viewBox 1000×1000: outer disc + rim (r 486), **120 knurl ticks** (every 5th long), three inner rings, a hole (r 64), and text on a circular path (`textPath` with `textLength` so it fills the ring exactly; default "IRONCREST · 45 KG · …"). A `wheel` variant has ticks on the very rim, two inner rings and numerals "01–06" near the rim (these must be visible in the thin strip of plate under the slider cards). Colour comes from `currentColor`. Used in: loader, hero background, wheel slider, member-app halo, CTA background.

---

## 4. SECTION-BY-SECTION SPEC

Port every section from the reference file; copy text verbatim into `content/*.ts` (typed data), not hard-coded in JSX.

### 4.1 Loader
Full-screen overlay: two black halves (top/bottom) + a centred spinning red plate (`animation: spin 3.2s linear infinite`, width `min(52vw,230px)`) with a Playfair counter and "KG" label over it. Counter eases 0 → 100 over **1.3 s** (smoothstep), then 160 ms later the halves slide away (`translateY ∓101%`, 1 s, `cubic-bezier(.77,0,.18,1)`), the counter fades, and `body.ready` is set (this triggers the hero text reveal). Failsafe: force-open after 3.2 s. Removed from the DOM after 1.2 s. Skip entirely under `prefers-reduced-motion`. Must never block the page if JS is slow.

### 4.2 Header
Fixed pill (max 1180px) centred under the top safe-area inset: glass, logo tile (red gradient square with a white crown icon) + "IRONCREST" (Playfair, letter-spacing .2em), nav links (hover: 9% white pill), red "Book a demo" button. **Hides on scroll down (after 400px), reappears on scroll up.** ≤1000px: nav collapses to a burger that opens a full-screen overlay menu with big Playfair links. A 3px fixed progress bar at the very top (gradient maroon → red-hot → white) scales with page scroll progress.

### 4.3 Hero
- Background: two blurred red orbs (parallax at -0.05 / +0.04), a huge dim rotating plate (rotation = `scrollY × 0.05deg`, radial mask), a cursor-following red spotlight (radial gradient at the pointer, 520px).
- Content, centred: badge "**NEW** Every module switches on or off, per gym"; the three-line h1 whose lines **rise from behind masks** (`translateY(115% → 0)`, 1.2 s, `cubic-bezier(.16,1,.3,1)`, stagger .13 s) once the loader finishes; lede; two CTAs ("Book a live demo →" red, "Tour every screen" ghost) that are **magnetic** (translate toward the pointer ≈ 22%/30% of offset).
- Below: a 3D-tilted product frame (glass padding, 22px radius, big red glow) holding the dashboard image. Scroll-linked: `rotateX(20deg → 0)`, `scale(.93 → 1)`, `translateY(0 → -18px)` over the first 0.75 viewport heights, plus a pointer parallax (≤4°), and a diagonal sheen sweep (`--sh` 10 → 90%). Three floating glass chips with parallax drift: "Check-ins today 318", "Revenue this month Rs 1.25M", "Trainers module · Switched on" (with a small red switch). Chips hide below 620px.
- Hero is content-sized (no 100vh).

### 4.4 Marquee
Rotated −1.4°, 104% wide, bordered top/bottom, red-tinted gradient edges. Two repeated copies for a seamless loop (`translateX(0 → -50%)`, 38 s linear, pauses on hover). Words (Playfair, `clamp(1.8rem,4.2vw,3.6rem)`): Members, Classes, Trainers, QR check-in, Payments, Waitlists, Reports, Lockers; every other word is outlined (transparent fill, 1.4px red-hot stroke, italic). A small spinning plate glyph sits between words.

### 4.5 Plate Wheel slider (the signature piece)
**Concept:** a giant plate whose top arc is visible; six upright cards stand on its rim like a fan. Dragging spins the plate and swings the cards around it with inertia; the nearest card snaps to centre.

Geometry (recompute on resize), with `w` = stage width:
```
cw = clamp(w*0.34, 250, 430)        // card width
ch = cw*1.28                         // card height
R  = cw*2.7                          // radius from wheel centre to card bottoms
step = atan2(cw*0.9, R) in degrees   // angle between cards (~18°)
bottom = ch + 70
stageHeight = bottom + (w<700 ? 190 : 250)
centre y = bottom + R
plate radius = R - 26, centred at (50%, centre y), rotates by -r*step
```
Each card: a zero-size "spoke" pivot at (50%, centre y) rotated `d*step` where `d = ((i - r + N/2) mod N) - N/2`; the card is offset up by `R + ch`, `transform-origin: 50% 100%`. Per card: scale `1 - clamp(|d|,0,1)*.07 - clamp(|d|-1,0,1.5)*.05`; z-index `10 - round(|d|*3)`; filter `brightness(1 - clamp(|d|,0,1.6)*.32) saturate(1 - clamp(|d|,0,1)*.25)`; hidden when `|d| ≥ 2.7`. Active card: red-tinted border + glow; the others dim.

Interaction:
- Pointer drag (mouse + touch; `touch-action: pan-y`): `r += -dx / (cw*0.9)`, track velocity (EMA 0.4). On release: `target = round(r + clamp(vel,-6,6)*0.28)`. Between interactions: critically-damped chase `r += (target - r) * (1 - 0.0009^dt)`.
- Clicking a non-active card (without dragging) goes to it. Prev/Next round buttons, dot indicators, keyboard Left/Right, horizontal trackpad wheel (then snap after 140 ms).
- **Autoplay:** advance every **4.2 s** of idleness while the stage is ≥35% in view and not hovered; a progress bar fills the active dot.
- The active card plays an **iris reveal** (`clip-path: circle(0% at 50% 62%) → circle(150%)`, 1 s) whenever it becomes active. Pointer position sets `--px/--py` and each card's art layers (`.lyr`, `--d` depth) shift ±(6–20px) for parallax.
- Below the stage: the title (masked slide-up swap), description, counter "01 / 06", and arrows. Custom cursor turns into a 92px red "DRAG" disc over the stage.
- Six slides (copy from reference): Strength floor, Boxing & combat, Yoga & mobility, Cycling studios, Functional & CrossFit, Recovery & spa.
- **Card art = original SVG illustrations** (400×500 viewBox, duotone red/white on dark gradient, large ghost numeral, depth layers, small CSS animations: swaying heavy bag, spinning bike wheels, drifting steam). Port the six scene functions from the reference into `components/illustrations/Floor*.tsx` unchanged.
- A11y: stage is a labelled carousel (`aria-roledescription`), focusable, arrow-key operable; dots are a tablist; reduced motion disables autoplay and inertia (cards still change instantly).

### 4.6 Pinned scroll story
Section height **520vh**; inside, a sticky 100vh container with two columns: left = eyebrow, h2 "From the front door to the *bank deposit.*", and four steps (Sign in as who you are; See the whole day at a glance; Run members and plans; Get paid, every time); right = a "device" showing four product images that cross-fade with a 3D move (incoming: `translate3d(60px,30px,-120px) rotateY(-14deg) scale(.92)` → none; outgoing: `translate3d(-60px,-30px,-160px) rotateY(12deg) scale(.9)`). Scroll progress `p` picks the active step (`floor(p*4)`); a red vertical progress line with glow fills beside the steps; only the active step is fully opaque and shows its paragraph. **≤1000px:** collapse to a normal list with each step's image inline, no pinning.

### 4.7 Stats row
Four cells with hairline dividers: **15** Modules, 12 of them switchable · **5** Roles, from owner to member · **60 sec** Life of a QR pass, then it's void · **0 cards** Card numbers on your servers. Numbers count up (1.7 s, exponential ease-out) when ≥60% visible.

### 4.8 Paper band — module switch demo
White section (`--paper`) with faint red concentric rings in the corner. Eyebrow "Configurable by design", h2 "Don't need it? *Switch it off.*", lede. Two columns:
- Left: 3 locked "Always on" rows (Dashboard, Members, Roles & Settings) + **12 real switches** (Subscriptions & Plans, Class Booking, Trainer Management, Attendance & Check-in, Payments & Invoices, Workout & Diet Plans, Notifications, Reports, Lockers, Shop, Multi-branch, Member App). Defaults on: all except Lockers, Shop, Multi-branch. "Reset to defaults" button.
- Right (sticky): a dark mini app window with a sidebar whose items **collapse/fade** when their module is off, a live counter "N / 15", six KPI tiles that fade when their module is off, and a status note.
- Dependency rules (must match the real product): Payments needs Subscriptions; Workout & Diet needs Trainers. Turning a parent off also turns its dependants off and shows "Payments & Invoices switched off too. It needs Subscriptions & Plans."; turning a dependant on turns its parent on with a note. Notes auto-hide after 3.4 s. Switches are real `role="switch"` buttons with `aria-checked`.

### 4.8b Reel — "Look at all of it."
Section height **300vh**, sticky 100vh, vertical scroll drives a horizontal translate of a track of **five** 8:5 cards (width `min(66vw,820px)`): **Dashboard, Members, Subscriptions, Class booking, Payments**, each showing the real screen image (`img/dashboard.webp`, `members.webp`, `subscriptions.webp`, `bookings.webp`, `payments.webp`; 1440×900 top crops, `object-fit: cover`, 18px radius, 1px 18% white border, deep shadow) with a Playfair caption and one-line description. Cards near the edges are scaled down, faded and rotated in 3D (`rotateY(-o*16deg)`, `scale(1-|o|*.12)`, `opacity 1-|o|*.45`, where `o` is offset from viewport centre). A thin red progress bar sits top-right. **≤1000px:** becomes a native horizontal swipe row with scroll-snap.

> **IP-protection rule (important):** this reel shows **exactly these five screens and no others.** Do **not** add Trainers, Attendance or Module Settings screens (they expose the most distinctive parts of the product idea: QR check-in and the switchable-module console). Images come from `content/media.ts`; the `NEXT_PUBLIC_SHOW_REAL_UI=false` flag (§6) must also swap these five for blurred or illustrated placeholders so I can launch without exposing the UI.

### 4.9 Member app section
Two columns. Left: a phone image (rounded 44px, red glow, mild scroll parallax) inside a rotating plate halo ("MEMBER · PASS · …"), with a floating glass chip "Pass refreshes every 60s". Right: eyebrow "The member app", h2 "Their pass. *Their pocket.*", lede, and four icon bullets: Rotating QR pass · Book in two taps · Renew without calling · Face ID and fingerprint (copy from reference).

### 4.10 Pricing
Heading "Pick your *weight.*"; segmented control Monthly / **Annual · save 17%** (annual default; annual price = monthly × 0.83, formatted `Rs 12,367`). Three glass cards with 3D hover tilt (±8°): **Studio** (Rs 14,900), **Club** (Rs 34,900, highlighted, "Most chosen" tag, red-tinted glass + glow), **Chain** ("Let's talk"). Each has a bullet list with red check discs and a CTA to `#demo`. **Prices and limits are placeholders; read them from `content/pricing.ts` so I can edit them without touching components.**

### 4.11 FAQ
Five accordion items (one open at a time, first open by default): switching modules off; data protection; payment methods; brand colours; Urdu support. Plus/minus icon rotates; answer height animates via `grid-template-rows: 0fr → 1fr` (.6 s). Buttons have `aria-expanded`.

### 4.12 CTA + demo form
Big "Open the *doors.*" (up to 9rem) over a huge dim rotating plate and a red floor glow. Glass form with **floating labels**: Your name, Gym name, Email + "Book demo →" button. See §8 for real submission handling.

### 4.13 Footer
Logo + tagline "The royal command centre for modern gyms."; columns Product / Company / Built for; fine print "© 2026 Ironcrest. All rights reserved."

### 4.14 Global motion
- **Reveal on scroll:** elements with `data-r` fade + rise 44px (variants: left/right ±60px, scale .9), 1 s `cubic-bezier(.16,1,.3,1)`, optional `--d` delay. Implementation detail that matters: the hidden state is applied **by JS only to elements below the fold**, so with JS disabled or the observer failing everything is visible. IO `rootMargin: 0 0 -8% 0`.
- **Custom cursor** (fine pointer only): 8px red dot + 44px ring that lerps; grows to a 64px ring over links/buttons/cards; becomes the 92px "DRAG" disc over the wheel; fades in on first pointer move.
- **Magnetic buttons** and **3D tilt cards** (fine pointer only).
- **Parallax:** elements with `data-par` translate by `(elementCentre - viewportCentre) × factor`.
- Single scroll handler throttled with rAF; one rAF loop for wheel physics + cursor.
- `prefers-reduced-motion`: disable loader, marquee, autoplay, parallax, tilt, magnetic, and use instant transitions; layouts stay intact.

---

## 5. RESPONSIVE BEHAVIOUR

Breakpoints: 1000px and 620px.
- ≤1000: nav → burger; two-column sections → one column; pricing 1 column; story and reel un-pin (see above); form 2 columns; stats 2×2; footer 2 columns; mini app un-sticks.
- ≤620: hide floating chips; module list 1 column; mini-app sidebar hidden; form 1 column; hide header CTA; footer 1 column.
- Never any horizontal page scroll (use `overflow-x: clip` on `html, body`; **do not** use `overflow:hidden` on ancestors of sticky elements). Wheel stage and decorative plates are clipped by their own containers.
- Tap targets ≥ 44px; safe-area insets respected (top band painted under the status bar).

---

## 6. IMAGES AND ASSETS

- `design/site-reference/img/` contains the few raster images the reference uses: `dashboard.webp`, `login.webp`, `subscriptions.webp`, `payments.webp`, `members.webp`, `bookings.webp` (1440×900 crops of the admin UI) and `memberapp.webp` (780×1688 phone, rounded alpha).
- **IP caution:** these real UI screens are only used in the hero frame, the pinned story, the five-card reel and the phone. For the public production site, make them swappable through `content/media.ts`, and add a build-time flag `NEXT_PUBLIC_SHOW_REAL_UI=false` that swaps each for a blurred or illustrated placeholder, so I can launch without exposing the product UI. Default: **false**.
- All illustrations are inline SVG (no external images). Provide the OG image (`1200×630`) generated from the hero (plate + headline) via `next/og` or a static file.
- No stock photos, no hotlinking, no third-party embeds.

---

## 7. SEO, METADATA, ANALYTICS

- Title "Ironcrest — gym management software"; meta description; canonical; OpenGraph + Twitter cards; `robots.txt`, `sitemap.xml`; JSON-LD `SoftwareApplication` + `Organization`; favicon set from the crown logo tile; `theme-color #0A0A0A`.
- Semantic landmarks (`header`, `main`, `section` with headings, `footer`), one `h1`.
- Analytics: optional, **off by default**, loaded only after consent via a small cookie banner in the same glass style (accept / decline), no tracking before consent.
- Core Web Vitals budgets: LCP < 2.5 s, CLS < 0.05, INP < 200 ms on mobile; JS for the whole page < 120 KB gzip (no animation libs). Lazy-mount heavy client components (wheel, reel, story) when near the viewport; preload only the hero image and fonts.

---

## 8. REAL FORM HANDLING AND SECURITY

The reference form is a front-end preview only. In the real build:
- Fields: name, gym name, email (+ optional phone). Client validation with zod; same floating-label UI; accessible error messages; success state replaces the form ("Thanks, {name}. We'll be in touch within one business day.").
- Submit via `POST /api/demo-requests` (Next route handler; configurable to forward to the Ironcrest NestJS API `POST /api/v1/public/demo-requests`). Server-side: zod validation, trim/length caps, **honeypot field**, per-IP rate limit (e.g. 5/hour), optional **Cloudflare Turnstile** verification, sanitise before email, send notification email via SMTP/Resend (env-configured), store a row if a database URL is configured. Never trust client input, never reflect it unescaped, no PII in logs.
- Security headers on all routes: strict CSP (nonces; allow only self + the analytics host if enabled), `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera/mic/geolocation off), `frame-ancestors 'none'`, HSTS (document it for the host). No inline event handlers. No `dangerouslySetInnerHTML` except for the static SVG illustrations (which are developer-authored constants).
- Dependencies pinned; `pnpm audit` and gitleaks in CI.

---

## 9. ACCESSIBILITY

WCAG 2.2 AA: contrast ≥ 4.5:1 for text (red text on black uses `--red-text`), visible neon-red focus rings, full keyboard operation (wheel arrows, tabs, accordion, switches, burger menu with focus trap and Esc to close), `aria-live` for the module-demo note and form status, skip-to-content link, reduced-motion support, alt text for every image, decorative SVGs `aria-hidden`. axe must report zero violations in Playwright on every breakpoint.

---

## 10. CODE STRUCTURE

```
app/
  layout.tsx  page.tsx  globals.css  tokens.css  robots.ts  sitemap.ts  opengraph-image.tsx
  api/demo-requests/route.ts
components/
  Plate.tsx  Loader.tsx  Header.tsx  Hero.tsx  Marquee.tsx
  wheel/ Wheel.tsx  useWheelPhysics.ts  geometry.ts  FloorCard.tsx
  story/ Story.tsx  useScrollProgress.ts
  modules/ ModuleDemo.tsx  moduleRules.ts
  reel/ Reel.tsx
  AppSection.tsx  Pricing.tsx  Faq.tsx  Cta.tsx  Footer.tsx  CookieBanner.tsx
  illustrations/ Floor1..6.tsx  Reel1..8.tsx
  ui/ Button.tsx  Eyebrow.tsx  Reveal.tsx  Counter.tsx  Cursor.tsx  Magnetic.tsx  Tilt.tsx
content/  site.ts  floors.ts  steps.ts  modules.ts  pricing.ts  faq.ts  media.ts
hooks/    useReveal.ts  useParallax.ts  useReducedMotion.ts  usePointerFine.ts
tests/    unit/  e2e/  visual/
docs/     DECISIONS.md  STATUS.md  DEPLOY_HOSTINGER.md
```
Pure logic (wheel geometry, dependency rules, price math, counter easing, progress maths) lives in plain TS modules with unit tests.

---

## 11. TESTING (required)

- **Unit (Vitest):** `geometry.ts` (card sizes, step angle, wrap-around `d` for all N and r, including negative r), wheel momentum/snap, `moduleRules` (parent-off cascades to dependants, dependant-on enables parent, reset), price math (`14900 × .83 → "Rs 12,367"`, `34900 × .83 → "Rs 28,967"`), counter easing, reveal logic (only below-the-fold elements get the hidden state).
- **E2E (Playwright, Chromium + WebKit + Firefox; desktop 1440×900 and phone 390×844):** loader opens and disappears; header hides on scroll down and returns on scroll up; progress bar grows; wheel drag changes slide, arrow buttons/keys/dots work, autoplay advances and pauses on hover, click on side card navigates; story steps change with scroll; module switches cascade correctly and counter updates; pricing toggle changes prices; FAQ opens one at a time; form validation, honeypot rejection and success state (API mocked); burger menu focus trap; no horizontal scroll at any width; no console errors.
- **Visual regression:** screenshot each section at 1440×900 and 390×844 and compare against screenshots captured from `design/site-reference/index.html` (same fonts, animations settled, loader skipped). Document the allowed pixel-diff threshold (start at 1.5%) and keep all diffs under it. Any difference must be either fixed or recorded in DECISIONS.md.
- **Accessibility:** axe on every section state; keyboard-only run-through.
- **Performance:** Lighthouse CI budgets (Performance ≥ 90 mobile, Accessibility 100, Best Practices ≥ 95, SEO 100).
- **CI (GitHub Actions):** install → lint → typecheck → unit → build → Playwright (sharded) → visual → Lighthouse → security scans.

---

## 12. DEPLOYMENT (Hostinger)

Provide `docs/DEPLOY_HOSTINGER.md` covering two paths: (1) **static export** uploaded to Hostinger shared hosting (form posts to the Ironcrest API or a configured form endpoint, since shared hosting has no Node), (2) **Node.js hosting / VPS** running `next start` behind Nginx/Caddy with TLS, env vars, process manager, cache headers (immutable for hashed assets), gzip/brotli, and a rollback note. Include `.env.example` for SMTP/Resend, Turnstile keys, API URL and the `NEXT_PUBLIC_SHOW_REAL_UI` flag.

---

## 13. DEFINITION OF DONE

- Pixel-comparable to the reference at 1440 and 390 widths (visual tests green)
- All interactions and animation timings match §4; reduced-motion verified
- No animation library; JS budget met; Lighthouse budgets met
- Axe clean, keyboard complete, no console errors, no horizontal scroll
- Content in typed `content/` files, prices editable in one place
- Form works end to end with validation, honeypot, rate limit and Turnstile hook
- Reel shows only the five approved real screens (IP rule); all real UI images gated by the flag
- Docs written; CI green

---

## 14. MILESTONES (stop after each)

- **S1 — Foundation + top of page:** repo, tokens, fonts, `Plate`, `Reveal/Cursor/Magnetic/Tilt`, loader, header + progress, hero, marquee. Visual tests for these.
- **S2 — Plate Wheel:** geometry, physics hook, six illustrated cards, controls, autoplay, a11y, unit + e2e tests.
- **S3 — Story, stats, module demo:** pinned story with mobile fallback, counters, paper band with module rules and tests.
- **S4 — Reel, app, pricing, FAQ, CTA, footer:** reel (five real screens), member app section, pricing config, FAQ, CTA + real form + API route.
- **S5 — Hardening:** SEO/metadata/OG, cookie banner, security headers, full visual + axe + Lighthouse pass, deployment docs, v1.0.0.

Start now: read `design/site-reference/index.html` end to end, write `docs/DECISIONS.md`, then begin S1.
