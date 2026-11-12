import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;
const desktop = { viewport: { width: 1440, height: 900 } };
const phone = { viewport: { width: 390, height: 844 }, hasTouch: true };

/** E2E against a production build (`pnpm build` first). */
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  // small dev machines choke on many parallel browsers; CI shards per project instead
  workers: process.env.CI ? undefined : 2,
  timeout: process.env.CI ? 30_000 : 90_000,
  expect: { timeout: process.env.CI ? 5_000 : 15_000 },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure' },
  webServer: {
    command: `pnpm exec next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'], ...desktop } },
    { name: 'chromium-phone', use: { ...devices['Pixel 7'], ...phone, isMobile: true } },
    { name: 'firefox-desktop', use: { ...devices['Desktop Firefox'], ...desktop } },
    { name: 'firefox-phone', use: { ...devices['Desktop Firefox'], ...phone } },
    { name: 'webkit-desktop', use: { ...devices['Desktop Safari'], ...desktop } },
    { name: 'webkit-phone', use: { ...devices['iPhone 14'], ...phone, isMobile: true } },
  ],
});
