import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const isPhone = (page: Page) => (page.viewportSize()?.width ?? 1440) <= 620;

async function scrollToY(page: Page, y: number) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
  await page.waitForTimeout(250);
}

test.describe('S1 · top of page', () => {
  test('loader counts up, opens, marks the page ready and leaves the DOM', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto('/');
    const loader = page.getByTestId('loader');
    await expect(loader).toBeAttached();
    await expect(page.locator('body')).toHaveClass(/ready/, { timeout: 4000 });
    await expect(loader).not.toBeAttached({ timeout: 3000 });
    await expect(page.locator('#hero h1')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('reduced motion skips the loader entirely', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page.locator('body')).toHaveClass(/ready/);
    await expect(page.getByTestId('loader')).not.toBeAttached();
    await ctx.close();
  });

  test('header hides on scroll down past 400px and returns on scroll up; progress bar grows', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toHaveClass(/ready/, { timeout: 4000 });
    // until later milestones add sections, make sure the page is tall enough to scroll 600px
    await page.evaluate(() => {
      const pad = document.createElement('div');
      pad.style.height = '200vh';
      document.querySelector('main')?.append(pad);
    });
    const hdr = page.locator('#hdr');
    const progress = async () =>
      page.getByTestId('progress').evaluate((el) => parseFloat(getComputedStyle(el).getPropertyValue('--sp') || '0'));
    expect(await progress()).toBe(0);

    await scrollToY(page, 200);
    await scrollToY(page, 600);
    await expect(hdr).toHaveAttribute('data-hidden', '');
    expect(await progress()).toBeGreaterThan(0);

    await scrollToY(page, 450);
    await expect(hdr).not.toHaveAttribute('data-hidden');
  });

  test('hero headline, CTAs and product frame render', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Every member.');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('command');
    await expect(page.getByRole('link', { name: 'Book a live demo' })).toHaveAttribute('href', '#demo');
    await expect(page.getByRole('link', { name: 'Tour every screen' })).toHaveAttribute('href', '#screens');
    await expect(page.getByTestId('hero-frame')).toBeVisible();
    // default build hides the real UI behind an illustration (IP rule)
    if (process.env.NEXT_PUBLIC_SHOW_REAL_UI !== 'true') {
      await expect(page.locator('[data-placeholder=dashboard]')).toBeVisible();
      await expect(page.locator('img[src*="dashboard.webp"]')).toHaveCount(0);
    }
  });

  test('marquee has two copies of every word and is hidden from assistive tech', async ({ page }) => {
    await page.goto('/');
    const mq = page.getByTestId('marquee');
    await expect(mq).toHaveAttribute('aria-hidden', 'true');
    await expect(mq.locator('span')).toHaveCount(16);
  });

  test('no horizontal scroll', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('burger menu traps focus and closes on Escape (≤1000px)', async ({ page }) => {
    test.skip(!isPhone(page), 'burger is only shown at ≤1000px');
    await page.goto('/');
    await expect(page.locator('body')).toHaveClass(/ready/, { timeout: 4000 });
    const burger = page.getByRole('button', { name: 'Open menu' });
    await burger.click();
    const menu = page.getByRole('navigation', { name: 'Mobile' });
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('link').first()).toBeFocused();

    // Tab through all 8 links + burger and wrap back to the first link
    for (let i = 0; i < 9; i++) await page.keyboard.press('Tab');
    await expect(menu.getByRole('link').first()).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(page.getByRole('button', { name: 'Close menu' })).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused();
  });

  test('skip link is the first focusable element', async ({ page }) => {
    test.skip(isPhone(page), 'keyboard check on desktop');
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  });

  test('axe: no violations at the top of the page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toHaveClass(/ready/, { timeout: 4000 });
    await page.waitForTimeout(1500);
    const results = await new AxeBuilder({ page }).include('#hdr').include('#hero').analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });
});
