export const clamp = (v: number, a: number, b: number): number => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
/** Positive modulo, so mod(-1, 6) === 5. */
export const mod = (a: number, n: number): number => ((a % n) + n) % n;

/** Loader counter easing (reference: p*p*(3-2p)). */
export const smoothstep = (p: number): number => {
  const t = clamp(p, 0, 1);
  return t * t * (3 - 2 * t);
};

/** Stats counter easing (reference: 1 - 2^(-10p), snapped to 1 at the end). */
export const expoOut = (p: number): number => {
  const t = clamp(p, 0, 1);
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

/** Hero frame easing (reference: 1 - (1-p)^3). */
export const cubicOut = (p: number): number => {
  const t = clamp(p, 0, 1);
  return 1 - Math.pow(1 - t, 3);
};

/** Frame-rate independent exponential approach factor (reference: 1 - k^dt). */
export const damp = (k: number, dt: number): number => 1 - Math.pow(k, dt);
