import { defineConfig, devices } from '@playwright/test';

import { REF_URL, SITE_URL } from './tests/visual/compare';

/**
 * Visual comparison: the reference (served statically) vs a build with the real UI
 * screenshots enabled (DECISIONS I3, T1). Run `pnpm visual`.
 */
export default defineConfig({
  testDir: 'tests/visual',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  timeout: 120_000,
  use: { reducedMotion: 'reduce' },
  webServer: [
    {
      command: 'node scripts/serve-static.mjs design/site-reference 3200',
      url: REF_URL,
      reuseExistingServer: !process.env.CI,
    },
    {
      command:
        'pnpm exec cross-env NEXT_DIST_DIR=.next-visual NEXT_PUBLIC_SHOW_REAL_UI=true next build && pnpm exec cross-env NEXT_DIST_DIR=.next-visual next start -p 3101',
      url: SITE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 600_000,
    },
  ],
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 } },
    {
      name: 'phone',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true },
    },
  ],
});
