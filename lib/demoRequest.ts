import * as z from 'zod/mini';

/** Field limits (server caps; the client uses the same schema). */
export const LIMITS = { name: 80, gym: 120, email: 254, phone: 30, body: 8_000 } as const;

export const MESSAGES = {
  name: 'Please add your name.',
  gym: 'Please add your gym name.',
  email: 'Please add a valid email.',
  phone: 'Please check the phone number.',
} as const;

const text = (max: number, msg: string) => z.string().check(z.trim(), z.minLength(1, msg), z.maxLength(max, msg));

/** Shared by the browser form and the API route. */
export const demoRequestSchema = z.object({
  name: text(LIMITS.name, MESSAGES.name),
  gym: text(LIMITS.gym, MESSAGES.gym),
  email: z.string().check(z.trim(), z.maxLength(LIMITS.email, MESSAGES.email), z.email(MESSAGES.email)),
  phone: z.optional(z.string().check(z.trim(), z.maxLength(LIMITS.phone, MESSAGES.phone), z.regex(/^[+()\d\s-]*$/, MESSAGES.phone))),
  /** Honeypot: humans never see or fill this field. */
  website: z.optional(z.string()),
  turnstileToken: z.optional(z.string().check(z.maxLength(4096))),
});

export type DemoRequest = z.infer<typeof demoRequestSchema>;
export type FieldErrors = Partial<Record<'name' | 'gym' | 'email' | 'phone', string>>;

export function validateDemoRequest(input: unknown): { ok: true; data: DemoRequest } | { ok: false; errors: FieldErrors } {
  const r = demoRequestSchema.safeParse(input);
  if (r.success) return { ok: true, data: r.data };
  const errors: FieldErrors = {};
  for (const issue of r.error.issues) {
    const k = issue.path[0];
    if ((k === 'name' || k === 'gym' || k === 'email' || k === 'phone') && !errors[k]) errors[k] = issue.message;
  }
  return { ok: false, errors };
}

/** True when the honeypot was filled in (bot). */
export const isBot = (d: Pick<DemoRequest, 'website'>): boolean => !!d.website && d.website.trim() !== '';

/** Strip control characters (incl. CR/LF, so values are safe in mail headers and logs). */
export function clean(s: string): string {
  return s.replace(/[\u0000-\u001F\u007F]+/g, ' ').trim();
}

/** Escape for HTML contexts. */
export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
