import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('S5 · SEO, security, a11y', () => {
  test('security headers and a nonce CSP are sent, with no CSP violations', async ({ page }) => {
    const violations: string[] = [];
    page.on('console', (m) => {
      if (/Content Security Policy|Refused to/.test(m.text())) violations.push(m.text());
    });
    const res = await page.goto('/');
    const h = res!.headers();
    expect(h['content-security-policy']).toMatch(/script-src 'self' 'nonce-[^']+' 'strict-dynamic'/);
    expect(h['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(h['x-content-type-options']).toBe('nosniff');
    expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(h['permissions-policy']).toContain('camera=()');
    expect(h['x-powered-by']).toBeUndefined();
    await expect(page.locator('body')).toHaveClass(/ready/, { timeout: 8000 });
    await page.waitForTimeout(500);
    expect(violations).toEqual([]);
  });

  test('metadata, canonical, OG/Twitter, theme colour and JSON-LD', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Ironcrest — gym management software');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Memberships, bookings/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https?:\/\/[^/]+\/?$/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/og\.png$/);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#0A0A0A');
    await expect(page.locator('link[rel="icon"]').first()).toBeAttached();
    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}');
    expect(ld['@graph'].map((n: { '@type': string }) => n['@type'])).toEqual(['Organization', 'SoftwareApplication']);
    await expect(page.locator('h1')).toHaveCount(1);
  });

  test('robots.txt and sitemap.xml', async ({ request }) => {
    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toContain('Sitemap:');
    expect(robots).toContain('Disallow: /api/');
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.ok()).toBe(true);
    expect(await sitemap.text()).toContain('<loc>');
    expect((await request.get('/og.png')).ok()).toBe(true);
  });

  test('no cookie banner and no third-party requests when analytics are off', async ({ page }) => {
    const external: string[] = [];
    page.on('request', (r) => {
      if (!r.url().startsWith('http://localhost')) external.push(r.url());
    });
    await page.goto('/');
    await expect(page.locator('body')).toHaveClass(/ready/, { timeout: 8000 });
    await expect(page.getByTestId('cookie-banner')).toHaveCount(0);
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    await page.waitForTimeout(800);
    expect(external).toEqual([]);
  });

  test('axe: zero violations across the whole page', async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto('/');
    await expect(page.locator('body')).toHaveClass(/ready/, { timeout: 8000 });
    await expect(page.getByTestId('loader')).not.toBeAttached();
    // reveal everything below the fold so axe sees final colours
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += 700) await page.evaluate((t) => window.scrollTo({ top: t, behavior: 'instant' }), y);
    await page.evaluate(() => document.querySelectorAll('.pre').forEach((e) => e.classList.remove('pre')));
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(600);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([]);
  });

  test('keyboard: Tab reaches the wheel, switches, pricing toggle, FAQ and form', async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) <= 620, 'desktop keyboard run');
    test.setTimeout(120_000);
    await page.goto('/');
    await expect(page.getByTestId('loader')).not.toBeAttached({ timeout: 8000 });
    const seen = new Set<string>();
    for (let i = 0; i < 90; i++) {
      await page.keyboard.press('Tab');
      const id = await page.evaluate(() => {
        const a = document.activeElement as HTMLElement | null;
        if (!a) return '';
        return a.dataset.testid || a.getAttribute('role') || a.id || a.tagName;
      });
      seen.add(id);
    }
    for (const want of ['wheel-stage', 'switch', 'f-name', 'BUTTON']) expect([...seen]).toContain(want);
  });
});
