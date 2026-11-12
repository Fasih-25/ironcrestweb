/**
 * Content-Security-Policy builder shared by proxy.ts (Node: per-request nonce) and
 * scripts/postexport.mjs (static export: sha256 hashes of the inline scripts).
 */
export interface CspOptions {
  /** 'nonce-…' or 'sha256-…' sources for inline scripts. */
  scriptSources: string[];
  dev?: boolean;
  /** Extra origins (demo endpoint, analytics) allowed for fetch/XHR. */
  connect?: string[];
  /**
   * Nonce mode (Node): 'strict-dynamic' trusts scripts loaded by nonce'd scripts.
   * Hash mode (static export): hashes can't cover <script src>, so 'self' + explicit hosts instead.
   */
  strictDynamic?: boolean;
  /** Script hosts allowed in hash mode (analytics). */
  scriptHosts?: string[];
}

const TURNSTILE = 'https://challenges.cloudflare.com';

export function origin(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

export function buildCsp({ scriptSources, dev = false, connect = [], strictDynamic = true, scriptHosts = [] }: CspOptions): string {
  const extraConnect = connect.filter(Boolean);
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    // strict-dynamic lets our nonce'd/hashed scripts load Turnstile or consented analytics
    'script-src': [
      "'self'",
      ...scriptSources,
      ...(strictDynamic ? ["'strict-dynamic'"] : [TURNSTILE, ...scriptHosts.filter(Boolean)]),
      ...(dev ? ["'unsafe-eval'"] : []),
    ],
    // React style props and next/font need inline styles; no script can be injected through them
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'", TURNSTILE, ...extraConnect, ...(dev ? ['ws:'] : [])],
    'frame-src': [TURNSTILE],
    'frame-ancestors': ["'none'"],
    'form-action': ["'self'"],
    'base-uri': ["'none'"],
    'object-src': ["'none'"],
    ...(dev ? {} : { 'upgrade-insecure-requests': [] }),
  };
  return Object.entries(directives)
    .map(([k, v]) => (v.length ? `${k} ${v.join(' ')}` : k))
    .join('; ');
}

/** Headers for every route (Node via next.config, static via .htaccess). */
export const SECURITY_HEADERS: ReadonlyArray<{ key: string; value: string }> = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  // Only honoured over HTTPS. See docs/DEPLOY_HOSTINGER.md before enabling preload.
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
];
