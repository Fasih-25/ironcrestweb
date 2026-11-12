'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ctaCopy } from '@/content/cta';
import { validateDemoRequest, type FieldErrors } from '@/lib/demoRequest';
import { ArrowRight } from './ui/Icons';
import s from './Cta.module.css';

/** Static export posts straight to the API; Node hosting uses the local route handler. */
const ENDPOINT = process.env.NEXT_PUBLIC_DEMO_ENDPOINT || '/api/demo-requests';
const TURNSTILE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

type Field = 'name' | 'gym' | 'email';
const FIELDS: ReadonlyArray<{ id: Field; type: string; autoComplete: string }> = [
  { id: 'name', type: 'text', autoComplete: 'name' },
  { id: 'gym', type: 'text', autoComplete: 'organization' },
  { id: 'email', type: 'email', autoComplete: 'email' },
];

/** Demo request form: floating labels, zod validation, honeypot, optional Turnstile. */
export function DemoForm() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);
  const [doneName, setDoneName] = useState<string | null>(null);
  const turnstile = useRef<HTMLDivElement>(null);

  // Load Turnstile only if configured, and only once the form is near the viewport.
  useEffect(() => {
    const el = turnstile.current;
    if (!TURNSTILE_KEY || !el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting) return;
      io.disconnect();
      if (!document.querySelector(`script[src="${TURNSTILE_SRC}"]`)) {
        const sc = document.createElement('script');
        sc.src = TURNSTILE_SRC;
        sc.async = true;
        sc.defer = true;
        document.head.append(sc);
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input = {
      name: String(fd.get('name') ?? ''),
      gym: String(fd.get('gym') ?? ''),
      email: String(fd.get('email') ?? ''),
      website: String(fd.get('website') ?? ''),
      turnstileToken: (fd.get('cf-turnstile-response') as string | null) ?? undefined,
    };
    const v = validateDemoRequest(input);
    if (!v.ok) {
      setErrors(v.errors);
      setStatus(ctaCopy.summaryError);
      const first = (['name', 'gym', 'email'] as const).find((k) => v.errors[k]);
      if (first) document.getElementById(`f-${first}`)?.focus();
      return;
    }
    setErrors({});
    setStatus('');
    setSending(true);
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(v.data),
      });
      if (res.status === 429) {
        setStatus(ctaCopy.rateLimited);
        return;
      }
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; fields?: FieldErrors };
      if (res.ok && body.ok) {
        setDoneName(v.data.name);
        return;
      }
      if (body.fields) {
        setErrors(body.fields);
        setStatus(ctaCopy.summaryError);
        return;
      }
      setStatus(ctaCopy.networkError);
    } catch {
      setStatus(ctaCopy.networkError);
    } finally {
      setSending(false);
    }
  }

  if (doneName !== null) {
    return (
      <p className={s.done} role="status" data-testid="form-success">
        {ctaCopy.success(doneName)}
      </p>
    );
  }

  return (
    <>
      <form className={s.form} data-r="scale" style={{ '--d': '200ms' } as React.CSSProperties} noValidate onSubmit={onSubmit} aria-describedby="form-status" data-testid="demo-form">
        {FIELDS.map((f) => (
          <label key={f.id}>
            <input
              id={`f-${f.id}`}
              name={f.id}
              type={f.type}
              placeholder={ctaCopy.fields[f.id]}
              autoComplete={f.autoComplete}
              required
              maxLength={f.id === 'email' ? 254 : f.id === 'gym' ? 120 : 80}
              aria-invalid={errors[f.id] ? true : undefined}
              aria-describedby={errors[f.id] ? `e-${f.id}` : undefined}
            />
            <span>{ctaCopy.fields[f.id]}</span>
            {errors[f.id] ? (
              <em id={`e-${f.id}`} className="sr-only">
                {errors[f.id]}
              </em>
            ) : null}
          </label>
        ))}
        <div className={s.hp} aria-hidden="true">
          <label>
            Website
            <input name="website" type="text" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <button className="btn btn-red" data-mag="" type="submit" disabled={sending}>
          {sending ? ctaCopy.sending : ctaCopy.submit} <ArrowRight />
        </button>
        {TURNSTILE_KEY ? <div ref={turnstile} className={`${s.turnstile} cf-turnstile`} data-sitekey={TURNSTILE_KEY} data-theme="dark" /> : null}
      </form>
      <p className={s.thanks} id="form-status" role="status" aria-live="polite" data-testid="form-status">
        {status}
      </p>
    </>
  );
}
