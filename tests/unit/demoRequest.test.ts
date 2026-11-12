import { clean, escapeHtml, isBot, validateDemoRequest } from '@/lib/demoRequest';
import { RateLimiter } from '@/lib/rateLimit';

describe('demo request validation', () => {
  it('accepts and trims a valid request', () => {
    const r = validateDemoRequest({ name: '  Ayesha ', gym: 'Iron Den', email: ' a@b.co ' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data).toMatchObject({ name: 'Ayesha', gym: 'Iron Den', email: 'a@b.co' });
  });

  it('reports each missing or bad field', () => {
    const r = validateDemoRequest({ name: ' ', gym: '', email: 'nope' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors).toEqual({ name: 'Please add your name.', gym: 'Please add your gym name.', email: 'Please add a valid email.' });
  });

  it('caps lengths', () => {
    const r = validateDemoRequest({ name: 'x'.repeat(81), gym: 'g', email: 'a@b.co' });
    expect(r.ok).toBe(false);
  });

  it('validates the optional phone', () => {
    expect(validateDemoRequest({ name: 'a', gym: 'g', email: 'a@b.co', phone: '+92 300-1234567' }).ok).toBe(true);
    expect(validateDemoRequest({ name: 'a', gym: 'g', email: 'a@b.co', phone: 'call me' }).ok).toBe(false);
  });

  it('rejects non-objects', () => {
    expect(validateDemoRequest('hello').ok).toBe(false);
    expect(validateDemoRequest(null).ok).toBe(false);
  });

  it('detects the honeypot', () => {
    expect(isBot({ website: '' })).toBe(false);
    expect(isBot({})).toBe(false);
    expect(isBot({ website: 'http://spam' })).toBe(true);
  });

  it('cleans control characters and escapes HTML', () => {
    expect(clean('Iron\r\nBcc: x@y.z')).toBe('Iron Bcc: x@y.z');
    expect(escapeHtml(`<img src=x onerror="a('b')">&`)).toBe('&lt;img src=x onerror=&quot;a(&#39;b&#39;)&quot;&gt;&amp;');
  });
});

describe('rate limiter', () => {
  it('allows 5 per window per key, then blocks until the window resets', () => {
    const rl = new RateLimiter(5, 3_600_000);
    for (let i = 0; i < 5; i++) expect(rl.take('1.2.3.4', 1000)).toBe(true);
    expect(rl.take('1.2.3.4', 1000)).toBe(false);
    expect(rl.take('5.6.7.8', 1000)).toBe(true);
    expect(rl.retryAfter('1.2.3.4', 1000)).toBe(3600);
    expect(rl.take('1.2.3.4', 3_601_000)).toBe(true);
  });
});
