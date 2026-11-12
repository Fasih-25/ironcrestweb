import { clamp } from '@/lib/math';

/** Card offset from the viewport centre, in viewport widths, clamped to [-1, 1]. */
export function reelOffset(left: number, width: number, viewportW: number): number {
  return clamp((left + width / 2 - viewportW / 2) / viewportW, -1, 1);
}

/** Reference: rotateY(-o·16°), scale(1-|o|·.12), translateY(|o|·18px), opacity 1-|o|·.45. */
export function reelCardStyle(o: number): { transform: string; opacity: number } {
  const a = Math.abs(o);
  return {
    transform: `perspective(1400px) rotateY(${-o * 16}deg) scale(${1 - a * 0.12}) translateY(${a * 18}px)`,
    opacity: 1 - a * 0.45,
  };
}
