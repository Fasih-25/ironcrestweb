import { clamp } from '@/lib/math';

/** Progress [0,1] through a pinned section: 0 when its top hits the viewport top, 1 when its bottom hits the viewport bottom. */
export function pinProgress(top: number, height: number, viewportH: number): number {
  const total = height - viewportH;
  if (total <= 0) return 0;
  return clamp(-top / total, 0, 1);
}

/** Active step for progress p (reference: floor(p * n * .999)). */
export function stepIndex(p: number, n: number): number {
  return Math.min(n - 1, Math.floor(p * n * 0.999));
}

/** Fill of the red progress line beside the steps. */
export function lineFill(p: number): number {
  return clamp(p * 1.05, 0, 1);
}

/** Pinned layouts only apply above 1000px. */
export const PIN_MIN_WIDTH = 1000;
