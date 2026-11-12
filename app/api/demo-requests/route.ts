import { NextResponse } from 'next/server';
import { LIMITS, isBot, validateDemoRequest } from '@/lib/demoRequest';
import { RateLimiter } from '@/lib/rateLimit';
import { deliver, verifyTurnstile } from '@/lib/server/deliver';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const limiter = new RateLimiter(5, 60 * 60 * 1000); // 5 per IP per hour

const json = (status: number, body: Record<string, unknown>, headers?: Record<string, string>) =>
  NextResponse.json(body, { status, headers: { 'cache-control': 'no-store', ...headers } });

function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  return (xff?.split(',')[0] ?? req.headers.get('x-real-ip') ?? 'unknown').trim().slice(0, 64) || 'unknown';
}

/**
 * POST /api/demo-requests
 * Never trusts the client: size cap, zod validation (trim + length caps), honeypot,
 * per-IP rate limit, optional Turnstile, then delivery. No PII is logged.
 */
export async function POST(req: Request) {
  if (!(req.headers.get('content-type') ?? '').includes('application/json')) return json(415, { ok: false, error: 'unsupported' });

  const ip = clientIp(req);
  if (!limiter.take(ip)) return json(429, { ok: false, error: 'rate_limited' }, { 'retry-after': String(limiter.retryAfter(ip)) });

  const raw = await req.text();
  if (raw.length > LIMITS.body) return json(413, { ok: false, error: 'too_large' });

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json(400, { ok: false, error: 'bad_json' });
  }

  const v = validateDemoRequest(body);
  if (!v.ok) return json(422, { ok: false, error: 'invalid', fields: v.errors });

  // Honeypot: pretend success so bots learn nothing, but do nothing.
  if (isBot(v.data)) return json(200, { ok: true });

  if (!(await verifyTurnstile(v.data.turnstileToken, ip))) return json(400, { ok: false, error: 'challenge_failed' });

  try {
    const via = await deliver(v.data);
    if (via === 'none' && process.env.NODE_ENV === 'production') {
      console.error('[demo-requests] no delivery channel configured');
      return json(503, { ok: false, error: 'unavailable' });
    }
    return json(200, { ok: true });
  } catch (e) {
    console.error('[demo-requests] delivery failed:', e instanceof Error ? e.message : 'unknown');
    return json(502, { ok: false, error: 'delivery_failed' });
  }
}

export function GET() {
  return json(405, { ok: false, error: 'method_not_allowed' }, { allow: 'POST' });
}
