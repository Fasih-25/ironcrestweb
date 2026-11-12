import { defineConfig, devices } from '@playwright/test';

/** Static export smoke test: out/ served with the CSP from out/.htaccess (run `pnpm build:export` first). */
export default defineConfig({
  testDir: 'tests/export',
  timeout: 90_000,
  reporter: 'list',
  webServer: { command: 'node scripts/serve-export.mjs 3300', url: 'http://localhost:3300/', reuseExistingServer: !process.env.CI },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } }],
});
