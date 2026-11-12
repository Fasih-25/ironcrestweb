import { clean, escapeHtml, type DemoRequest } from '@/lib/demoRequest';

export type Delivered = 'api' | 'resend' | 'smtp' | 'none';

const env = (k: string) => process.env[k]?.trim() || undefined;

/** Plain-text notification; every value is control-character-cleaned (safe for headers and logs). */
function message(d: DemoRequest) {
  const name = clean(d.name);
  const gym = clean(d.gym);
  const email = clean(d.email);
  const phone = d.phone ? clean(d.phone) : '';
  const subject = `Demo request: ${gym}`.slice(0, 150);
  const text = [`Name: ${name}`, `Gym: ${gym}`, `Email: ${email}`, phone ? `Phone: ${phone}` : null, '', `Received ${new Date().toISOString()}`]
    .filter((l) => l !== null)
    .join('\n');
  const html = `<p><b>Name:</b> ${escapeHtml(name)}<br><b>Gym:</b> ${escapeHtml(gym)}<br><b>Email:</b> ${escapeHtml(email)}${
    phone ? `<br><b>Phone:</b> ${escapeHtml(phone)}` : ''
  }</p>`;
  return { subject, text, html, replyTo: email };
}

/**
 * Deliver a validated request. Order: forward to the Ironcrest API (which stores it),
 * else Resend, else SMTP. Returns which channel was used.
 */
export async function deliver(d: DemoRequest): Promise<Delivered> {
  const payload = { name: clean(d.name), gym: clean(d.gym), email: clean(d.email), phone: d.phone ? clean(d.phone) : undefined };

  const api = env('IRONCREST_API_URL');
  if (api) {
    const res = await fetch(new URL('/api/v1/public/demo-requests', api), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`api ${res.status}`);
    return 'api';
  }

  const to = env('DEMO_NOTIFY_TO');
  const from = env('DEMO_NOTIFY_FROM');
  const m = message(d);

  const resendKey = env('RESEND_API_KEY');
  if (resendKey && to && from) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${resendKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject: m.subject, text: m.text, html: m.html, reply_to: m.replyTo }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`resend ${res.status}`);
    return 'resend';
  }

  const host = env('SMTP_HOST');
  if (host && to && from) {
    const nodemailer = await import('nodemailer');
    const port = Number(env('SMTP_PORT') ?? 587);
    const user = env('SMTP_USER');
    const transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user ? { user, pass: env('SMTP_PASS') ?? '' } : undefined,
    });
    await transport.sendMail({ from, to, subject: m.subject, text: m.text, html: m.html, replyTo: m.replyTo });
    return 'smtp';
  }

  return 'none';
}

/** Cloudflare Turnstile server-side check. Skipped (true) when no secret is configured. */
export async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  const secret = env('TURNSTILE_SECRET_KEY');
  if (!secret) return true;
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip !== 'unknown') body.set('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) return false;
  const json = (await res.json()) as { success?: boolean };
  return json.success === true;
}
