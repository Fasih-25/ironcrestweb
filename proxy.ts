import { NextResponse, type NextRequest } from 'next/server';
import { buildCsp, origin } from '@/lib/csp';

/**
 * Per-request CSP nonce (Node hosting). Next reads the nonce from the request's CSP header
 * and applies it to its own scripts; the layout passes it to our inline script.
 * Not used by the static export (see scripts/postexport.mjs).
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = buildCsp({
    scriptSources: [`'nonce-${nonce}'`],
    dev: process.env.NODE_ENV !== 'production',
    connect: [origin(process.env.NEXT_PUBLIC_DEMO_ENDPOINT), origin(process.env.NEXT_PUBLIC_ANALYTICS_SRC)].filter(
      (o): o is string => !!o,
    ),
  });
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);
  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set('Content-Security-Policy', csp);
  return res;
}

export const config = {
  // pages only: skip static assets, images, API and prefetches
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|img/|favicon|icon|apple-icon|og.png|robots.txt|sitemap.xml).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
