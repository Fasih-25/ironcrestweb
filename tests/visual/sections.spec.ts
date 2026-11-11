import { expect, test } from '@playwright/test';
import { MAX_DIFF, REF_URL, SITE_URL, captureBox, captureSlices, diff, settle } from './compare';

/** Sections built so far: [name, reference selector, site selector, mode]. Extend each milestone. */
const SECTIONS: Array<[string, string, string, 'box' | 'slices']> = [
  ['header', '#hdr .hdr-in', '#hdr > div', 'box'],
  ['hero', '#hero', '#hero', 'slices'],
  ['marquee', '.mq', '[data-testid=marquee]', 'slices'],
];

for (const [name, refSel, siteSel, mode] of SECTIONS) {
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

    const a = mode === 'box' ? [await captureBox(ref, refSel)] : await captureSlices(ref, refSel);
    const b = mode === 'box' ? [await captureBox(site, siteSel)] : await captureSlices(site, siteSel);
    const out = `test-results/visual/${info.project.name}`;

    const ratios = a.map((buf, i) => {
      const other = b[i];
      if (!other) return 1;
      return diff(buf, other, out, `${name}-${i}`).ratio;
    });
    if (b.length !== a.length) ratios.push(1);
    const worst = Math.max(...ratios);
    info.annotations.push({ type: 'diff', description: `${name}: ${ratios.map((r) => (r * 100).toFixed(2) + '%').join(', ')}` });
    console.log(`[visual] ${info.project.name} ${name}: ${ratios.map((r) => (r * 100).toFixed(2) + '%').join(', ')}`);
    expect(worst, `${name} differs by ${(worst * 100).toFixed(2)}% (max ${MAX_DIFF * 100}%)`).toBeLessThan(MAX_DIFF);
    await ctxRef.close();
  });
}
