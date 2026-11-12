import { expect, test, type Page } from '@playwright/test';

async function openWheel(page: Page) {
  await page.goto('/');
  await expect(page.locator('body')).toHaveClass(/ready/, { timeout: 8000 });
  await expect(page.getByTestId('loader')).not.toBeAttached();
  const stage = page.getByTestId('wheel-stage');
  await stage.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  // the physics loop has painted at least once
  await expect(stage).toHaveAttribute('data-autoplay', /.+/);
  await page.waitForTimeout(500);
  return stage;
}
const active = (page: Page) => page.getByTestId('wheel-stage').getAttribute('data-active');

test.describe('S2 · Plate Wheel', () => {
  test('arrow buttons step through floors and update title + counter', async ({ page }) => {
    const stage = await openWheel(page);
    await page.getByRole('button', { name: 'Next floor' }).click();
    await expect(stage).toHaveAttribute('data-active', '1');
    await expect(page.getByTestId('wheel-title')).toHaveText('Boxing & combat');
    await expect(page.getByTestId('wheel-count')).toContainText('02');
    await page.getByRole('button', { name: 'Previous floor' }).click();
    await page.getByRole('button', { name: 'Previous floor' }).click();
    await expect(stage).toHaveAttribute('data-active', '5');
    await expect(page.getByTestId('wheel-title')).toHaveText('Recovery & spa');
  });

  test('keyboard arrows turn the wheel', async ({ page }) => {
    const stage = await openWheel(page);
    await stage.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(stage).toHaveAttribute('data-active', '2');
    await page.keyboard.press('ArrowLeft');
    await expect(stage).toHaveAttribute('data-active', '1');
  });

  test('dots are a tablist that jumps to a floor', async ({ page }) => {
    const stage = await openWheel(page);
    const tabs = page.getByRole('tablist', { name: 'Choose a floor' }).getByRole('tab');
    await expect(tabs).toHaveCount(6);
    await tabs.nth(3).click();
    await expect(stage).toHaveAttribute('data-active', '3');
    await expect(tabs.nth(3)).toHaveAttribute('aria-selected', 'true');
    await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'false');
  });

  test('dragging spins the wheel', async ({ page }) => {
    const stage = await openWheel(page);
    const b = (await stage.boundingBox())!;
    const y = b.y + b.height * 0.4;
    const x0 = b.x + b.width * 0.75;
    await page.mouse.move(x0, y);
    await page.mouse.down();
    for (let i = 1; i <= 20; i++) await page.mouse.move(x0 - i * 25, y);
    await page.mouse.up();
    await expect.poll(() => active(page), { timeout: 30_000 }).not.toBe('0');
  });

  test('clicking a side card brings it to the centre', async ({ page }) => {
    const stage = await openWheel(page);
    const card = page.locator('[data-card="1"]');
    const b = (await card.boundingBox())!;
    await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
    await expect(stage).toHaveAttribute('data-active', '1');
  });

  test('autoplay runs while visible, advances, and pauses on hover', async ({ page }) => {
    test.setTimeout(120_000);
    const stage = await openWheel(page);
    await expect(stage).toHaveAttribute('data-autoplay', 'running');
    // the loop caps dt at 50 ms like the reference, so slow software-rendered CI frames stretch wall time
    await expect(stage).toHaveAttribute('data-active', '1', { timeout: 60_000 });
    const b = (await stage.boundingBox())!;
    await page.mouse.move(b.x + b.width / 2, b.y + 40);
    await expect(stage).toHaveAttribute('data-autoplay', 'hover');
    await page.mouse.move(2, 2);
    await expect(stage).toHaveAttribute('data-autoplay', 'running');
  });

  test('focus inside the wheel pauses autoplay', async ({ page }) => {
    const stage = await openWheel(page);
    await stage.focus();
    await expect(stage).toHaveAttribute('data-autoplay', 'focus');
  });

  test('reduced motion: no autoplay, buttons still work instantly', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const stage = await openWheel(page);
    await expect(stage).toHaveAttribute('data-autoplay', 'reduced-motion');
    await expect(stage).toHaveAttribute('data-active', '0');
    await page.getByRole('button', { name: 'Next floor' }).click();
    await expect(stage).toHaveAttribute('data-active', '1');
    await ctx.close();
  });
});
