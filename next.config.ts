import type { NextConfig } from 'next';

/**
 * BUILD_TARGET=export     → static HTML in out/ (Hostinger shared hosting)
 * BUILD_TARGET=standalone → .next/standalone Node server (VPS / Node hosting)
 * unset                   → regular `next start`
 */
const target = process.env.BUILD_TARGET;

const config: NextConfig = {
  output: target === 'export' ? 'export' : target === 'standalone' ? 'standalone' : undefined,
  // Separate build dir for the real-UI visual-regression build (see playwright.visual.config.ts).
  distDir: process.env.NEXT_DIST_DIR || '.next',
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
};

export default config;
