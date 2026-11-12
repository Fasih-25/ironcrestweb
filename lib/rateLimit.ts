/**
 * Fixed-window in-memory rate limiter (per process). Good enough for one Node instance;
 * behind several instances use the Ironcrest API's limiter instead (see DEPLOY_HOSTINGER.md).
 */
export class RateLimiter {
  private hits = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly max: number,
    private readonly windowMs: number,
  ) {}

  /** Returns true if the request is allowed. */
  take(key: string, now = Date.now()): boolean {
    const h = this.hits.get(key);
    if (!h || now >= h.resetAt) {
      this.hits.set(key, { count: 1, resetAt: now + this.windowMs });
      this.sweep(now);
      return true;
    }
    if (h.count >= this.max) return false;
    h.count++;
    return true;
  }

  retryAfter(key: string, now = Date.now()): number {
    const h = this.hits.get(key);
    return h ? Math.max(0, Math.ceil((h.resetAt - now) / 1000)) : 0;
  }

  private sweep(now: number): void {
    if (this.hits.size < 5_000) return;
    for (const [k, v] of this.hits) if (now >= v.resetAt) this.hits.delete(k);
  }
}
