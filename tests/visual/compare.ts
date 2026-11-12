import fs from 'node:fs';
import path from 'node:path';
import type { Page } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

export const REF_URL = 'http://localhost:3200/index.html';
export const SITE_URL = 'http://localhost:3101/';

/** Allowed share of differing pixels per section (DECISIONS T1). */
export const MAX_DIFF = 0.015;

export async function settle(page: Page, url: string): Promise<void> {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    // remove the reference loader immediately (it is skipped under reduced motion anyway)
    document.querySelector('#loader')?.remove();
  });
  await page.waitForTimeout(400);
}

async function scrollTo(page: Page, y: number, wait = 150): Promise<void> {
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.waitForTimeout(wait);
}

/** Viewport-sized slices covering the whole element, top to bottom. */
export async function captureSlices(page: Page, selector: string, wait = 150): Promise<Buffer[]> {
  const vh = page.viewportSize()!.height;
  const vw = page.viewportSize()!.width;
  const box = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) throw new Error(`missing ${sel}`);
    const b = el.getBoundingClientRect();
    return { top: b.top + window.scrollY, height: b.height };
  }, selector);
  const out: Buffer[] = [];
  for (let off = 0; off < box.height - 1; off += vh) {
    const want = box.top + off;
    await scrollTo(page, want, wait);
    const actual = await page.evaluate(() => window.scrollY);
    const y = Math.max(0, want - actual);
    const h = Math.min(vh - y, box.height - off);
    if (h < 2) break;
    out.push(await page.screenshot({ clip: { x: 0, y, width: vw, height: h } }));
  }
  await scrollTo(page, 0);
  return out;
}

export async function captureBox(page: Page, selector: string): Promise<Buffer> {
  await scrollTo(page, 0);
  return page.locator(selector).first().screenshot();
}

export interface DiffResult {
  ratio: number;
  files: string[];
}

/** Compare two PNGs; size mismatch counts the non-overlapping area as different. */
export function diff(a: Buffer, b: Buffer, outDir: string, name: string): DiffResult {
  const A = PNG.sync.read(a);
  const B = PNG.sync.read(b);
  const w = Math.min(A.width, B.width);
  const h = Math.min(A.height, B.height);
  const crop = (p: PNG) => {
    const c = new PNG({ width: w, height: h });
    PNG.bitblt(p, c, 0, 0, w, h, 0, 0);
    return c;
  };
  const ca = crop(A);
  const cb = crop(B);
  const d = new PNG({ width: w, height: h });
  const n = pixelmatch(ca.data, cb.data, d.data, w, h, { threshold: 0.1 });
  const total = Math.max(A.width * A.height, B.width * B.height);
  const ratio = (n + (total - w * h)) / total;
  fs.mkdirSync(outDir, { recursive: true });
  const files = [
    path.join(outDir, `${name}-reference.png`),
    path.join(outDir, `${name}-site.png`),
    path.join(outDir, `${name}-diff.png`),
  ];
  fs.writeFileSync(files[0]!, a);
  fs.writeFileSync(files[1]!, b);
  fs.writeFileSync(files[2]!, PNG.sync.write(d));
  return { ratio, files };
}
