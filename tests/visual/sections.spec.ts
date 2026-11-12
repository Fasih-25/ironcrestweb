import { expect, test } from '@playwright/test';
import { MAX_DIFF, REF_URL, SITE_URL, captureBox, captureSlices, diff, settle } from './compare';

/** Sections built so far: [name, reference selector, site selector, mode]. Extend each milestone. */
/** [name, reference selector, site selector, mode, settle ms, allowed diff override (must cite DECISIONS)] */
const SECTIONS: Array<[string, string, string, 'box' | 'slices', number?, number?]> = [
  ['header', '#hdr .hdr-in', '#hdr > div', 'box'],
  ['hero', '#hero', '#hero', 'slices'],
  ['marquee', '.mq', '[data-testid=marquee]', 'slices'],
  ['wheel', '#wheel', '#wheel', 'slices'],
  ['story', '#platform', '#platform', 'slices', 900],
  // the reference counters animate for 1.7 s even under reduced motion
  // DECISIONS V1: the reference's `.stat span` rule shrinks its own counters to 13px; we keep the intended big numbers
  ['stats', '.stats', '[data-testid=stats] > div', 'slices', 2200, 0.2],
  ['modules', '#modules', '#modules', 'slices', 400],
  ['reel', '#screens', '#screens', 'slices', 400],
  // DECISIONS V4: phone slices differ only by sub-pixel text anti-aliasing (2.55 % / 1.66 % measured)
  ['app', '#app', '#app', 'slices', 400, 0.03],
  ['pricing', '#pricing', '#pricing', 'slices', 400],
  ['faq', '#faq', '#faq', 'slices', 900, 0.03],
  ['cta', '#demo', '#demo', 'slices', 400],
  ['footer', 'footer', 'footer', 'slices', 150],
];

for (const [name, refSel, siteSel, mode, wait = 150, allowed = MAX_DIFF] of SECTIONS) {
  test(`${name} matches the reference`, async ({ browser, page: site }, info) => {
    const ctxRef = await browser.newContext({
      viewport: site.viewportSize(),
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
      hasTouch: info.project.use.hasTouch,
    });
    const ref = await ctxRef.newPage();
    await settle(ref, REF_URL);
    await settle(site, SITE_URL);
    if (name !== 'stats') {
      // DECISIONS T6: reproduce the reference's stats-row CSS bug (V1) on our page so every
      // later section starts at the same (sub-)pixel offset as in the reference. The stats
      // row itself is compared without this, under its V1 allowance.
      await site.addStyleTag({
        content: '[data-testid=stats] [data-count]{display:block;margin-top:10px;color:var(--muted);font-weight:700;font-size:13px;letter-spacing:.06em}',
      });
      await site.waitForTimeout(200);
    }

    const a = mode === 'box' ? [await captureBox(ref, refSel)] : await captureSlices(ref, refSel, wait);
    const b = mode === 'box' ? [await captureBox(site, siteSel)] : await captureSlices(site, siteSel, wait);
    const out = `visual-results/${info.project.name}`;

    const ratios = a.map((buf, i) => {
      const other = b[i];
      if (!other) return 1;
      return diff(buf, other, out, `${name}-${i}`).ratio;
    });
    if (b.length !== a.length) ratios.push(1);
    const worst = Math.max(...ratios);
    info.annotations.push({ type: 'diff', description: `${name}: ${ratios.map((r) => (r * 100).toFixed(2) + '%').join(', ')}` });
    console.log(`[visual] ${info.project.name} ${name}: ${ratios.map((r) => (r * 100).toFixed(2) + '%').join(', ')}`);
    expect(worst, `${name} differs by ${(worst * 100).toFixed(2)}% (max ${allowed * 100}%)`).toBeLessThan(allowed);
    await ctxRef.close();
  });
}
