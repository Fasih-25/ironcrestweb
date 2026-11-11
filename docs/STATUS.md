1. **S1 done** (foundation, tokens, fonts, Plate, motion controllers, loader, header + progress, hero, marquee): lint, typecheck, 17 unit, 16 e2e (Chromium desktop + phone), build all green.
2. Visual vs reference (`pnpm visual`, max 1.5 %): header 0.00 %, hero ≤ 0.34 %, marquee ≤ 0.36 % at both 1440×900 and 390×844.
3. Open: JS budget conflict (DECISIONS P1, framework alone ≈ 130 KB gzip); WebKit/Firefox e2e only run in CI so far (DECISIONS T2).
4. Next: **S2: Plate Wheel** (`lib/wheel.ts` geometry + physics, six Floor illustrations, controls, autoplay, a11y, tests). Hook the wheel `dragging` flag into `lib/motion.ts`'s `motionFlags`.
5. Waiting for "start milestone 2".
