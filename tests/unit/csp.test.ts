import { SECURITY_HEADERS, buildCsp, origin } from '@/lib/csp';

const dir = (csp: string, name: string) => csp.split('; ').find((d) => d.startsWith(name + ' ') || d === name);

describe('CSP builder', () => {
  it('nonce mode: strict-dynamic, no unsafe-inline scripts, framing denied', () => {
    const csp = buildCsp({ scriptSources: ["'nonce-abc'"] });
    expect(dir(csp, 'script-src')).toBe("script-src 'self' 'nonce-abc' 'strict-dynamic'");
    expect(dir(csp, 'frame-ancestors')).toBe("frame-ancestors 'none'");
    expect(dir(csp, 'object-src')).toBe("object-src 'none'");
    expect(dir(csp, 'base-uri')).toBe("base-uri 'none'");
    expect(csp).not.toMatch(/script-src[^;]*unsafe-inline/);
    expect(csp).not.toContain('unsafe-eval');
    expect(dir(csp, 'upgrade-insecure-requests')).toBe('upgrade-insecure-requests');
  });

  it('hash mode: no strict-dynamic, explicit Turnstile + analytics hosts', () => {
    const csp = buildCsp({ scriptSources: ["'sha256-x'"], strictDynamic: false, scriptHosts: ['https://stats.example'] });
    expect(dir(csp, 'script-src')).toBe("script-src 'self' 'sha256-x' https://challenges.cloudflare.com https://stats.example");
  });

  it('dev mode allows eval and websockets for HMR only', () => {
    const csp = buildCsp({ scriptSources: [], dev: true });
    expect(dir(csp, 'script-src')).toContain("'unsafe-eval'");
    expect(dir(csp, 'connect-src')).toContain('ws:');
    expect(csp).not.toContain('upgrade-insecure-requests');
  });

  it('adds connect origins (demo endpoint) and ignores junk', () => {
    expect(origin('https://api.ironcrest.example/api/v1/public/demo-requests')).toBe('https://api.ironcrest.example');
    expect(origin('not a url')).toBeNull();
    expect(origin(undefined)).toBeNull();
    const csp = buildCsp({ scriptSources: [], connect: ['https://api.ironcrest.example'] });
    expect(dir(csp, 'connect-src')).toContain('https://api.ironcrest.example');
  });

  it('security headers cover the prompt list', () => {
    const keys = SECURITY_HEADERS.map((h) => h.key);
    expect(keys).toEqual(expect.arrayContaining(['X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy', 'Strict-Transport-Security']));
    expect(SECURITY_HEADERS.find((h) => h.key === 'Referrer-Policy')?.value).toBe('strict-origin-when-cross-origin');
    expect(SECURITY_HEADERS.find((h) => h.key === 'Permissions-Policy')?.value).toMatch(/camera=\(\).*microphone=\(\).*geolocation=\(\)/);
  });
});
