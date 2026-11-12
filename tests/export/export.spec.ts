// Run after `pnpm build:export`: `pnpm test:export` serves out/ with the generated CSP.
import { expect, test } from '@playwright/test';
test('static export runs under its hash CSP', async ({ page }) => {
  const bad: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') bad.push(m.text()); });
  page.on('pageerror', (e) => bad.push(e.message));
  await page.goto('http://localhost:3300/');
  await expect(page.locator('body')).toHaveClass(/ready/, { timeout: 15000 });
  await page.getByRole('button', { name: 'Next floor' }).click();
  await page.waitForTimeout(1000);
  expect(bad).toEqual([]);
});
