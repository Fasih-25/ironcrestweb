import { expect, test, type Page } from '@playwright/test';

const wide = (page: Page) => (page.viewportSize()?.width ?? 0) > 1000;

async function ready(page: Page) {
  await page.goto('/');
  await expect(page.locator('body')).toHaveClass(/ready/, { timeout: 8000 });
  await expect(page.getByTestId('loader')).not.toBeAttached();
}

test.describe('S3 · story, stats, modules', () => {
  test('pinned story: scroll progress picks the active step (desktop)', async ({ page }) => {
    test.skip(!wide(page), 'story only pins above 1000px');
    await ready(page);
    const sec = page.locator('#platform');
    const { top, height } = await sec.evaluate((el) => ({ top: el.getBoundingClientRect().top + scrollY, height: el.getBoundingClientRect().height }));
    const H = page.viewportSize()!.height;
    for (const [p, step] of [
      [0.1, '0'],
      [0.4, '1'],
      [0.6, '2'],
      [0.95, '3'],
    ] as const) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top + (height - H) * p);
      await expect(sec).toHaveAttribute('data-step', step);
    }
    // only the active step's paragraph is shown
    await expect(sec.locator('li[data-step="3"] p')).toBeVisible();
    await expect(sec.locator('li[data-step="0"] p')).toBeHidden();
  });

  test('story un-pins into a plain list with inline pictures (≤1000px)', async ({ page }) => {
    test.skip(wide(page), 'mobile layout');
    await ready(page);
    const sec = page.locator('#platform');
    expect(await sec.evaluate((el) => el.getBoundingClientRect().height)).toBeLessThan(page.viewportSize()!.height * 5);
    for (let i = 0; i < 4; i++) await expect(sec.locator(`li[data-step="${i}"] p`)).toBeVisible();
    await expect(sec.locator('li [data-placeholder], li img')).toHaveCount(4);
  });

  test('stats count up to their values', async ({ page }) => {
    await ready(page);
    const stats = page.getByTestId('stats');
    await stats.scrollIntoViewIfNeeded();
    await expect(stats.locator('[data-count]')).toHaveText(['15', '5', '60', '0'], { timeout: 20_000 });
  });

  test('module switches cascade and the counter follows', async ({ page }) => {
    await ready(page);
    const list = page.getByTestId('module-switches');
    await list.scrollIntoViewIfNeeded();
    const sw = (name: string) => list.getByRole('switch', { name: new RegExp(`^${name}`) });
    const count = page.getByTestId('module-count').locator('span');
    await expect(list.getByRole('switch')).toHaveCount(12);
    await expect(count).toHaveText('12');

    await sw('Subscriptions & Plans').click();
    await expect(sw('Subscriptions & Plans')).toHaveAttribute('aria-checked', 'false');
    await expect(sw('Payments & Invoices')).toHaveAttribute('aria-checked', 'false');
    await expect(count).toHaveText('10');
    await expect(page.getByTestId('module-note')).toHaveText('Payments & Invoices switched off too. It needs Subscriptions & Plans.');

    await sw('Payments & Invoices').click();
    await expect(sw('Subscriptions & Plans')).toHaveAttribute('aria-checked', 'true');
    await expect(count).toHaveText('12');

    await sw('Lockers').click();
    await expect(count).toHaveText('13');
    await page.getByRole('button', { name: 'Reset to defaults' }).click();
    await expect(count).toHaveText('12');
    await expect(sw('Lockers')).toHaveAttribute('aria-checked', 'false');
  });

  test('mini app collapses the sidebar item and dims the tile of a switched-off module', async ({ page }) => {
    await ready(page);
    const mini = page.getByTestId('mini-app');
    await mini.scrollIntoViewIfNeeded();
    await page.getByTestId('module-switches').getByRole('switch', { name: /^Reports/ }).click();
    const tile = mini.locator('[data-k="reports"]').last();
    await expect.poll(async () => Number(await tile.evaluate((el) => getComputedStyle(el).opacity))).toBeLessThan(0.2);
    if ((page.viewportSize()?.width ?? 0) > 620) {
      const item = mini.locator('aside [data-k="reports"]');
      await expect.poll(async () => item.evaluate((el) => el.getBoundingClientRect().height)).toBeLessThan(1);
    }
  });
});
