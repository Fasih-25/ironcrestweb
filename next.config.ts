import type { NextConfig } from 'next';
import { SECURITY_HEADERS } from './lib/csp';

/**
 * BUILD_TARGET=export     → static HTML in out/ (Hostinger shared hosting; use `pnpm build:export`)
 * BUILD_TARGET=standalone → .next/standalone Node server (VPS / Node hosting)
 * unset                   → regular `next start`
 */
const target = process.env.BUILD_TARGET;

const config: NextConfig = {
  output: target === 'export' ? 'export' : target === 'standalone' ? 'standalone' : undefined,
  // Static export can't include the POST route handler (route.ts) or the nonce proxy (proxy.ts).
  // Pages, layouts, robots and sitemap are .tsx, so dropping .ts from page extensions leaves them out.
  pageExtensions: target === 'export' ? ['tsx'] : ['tsx', 'ts'],
  // Separate build dir for the real-UI visual-regression build (see playwright.visual.config.ts).
  distDir: process.env.NEXT_DIST_DIR || '.next',
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  // headers() is ignored by `output: export`; scripts/postexport.mjs writes an .htaccess instead.
  ...(target === 'export'
    ? {}
    : {
        async headers() {
          return [
            { source: '/:path*', headers: [...SECURITY_HEADERS] },
            { source: '/img/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }] },
            { source: '/og.png', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }] },
          ];
        },
      }),
};

export default config;
