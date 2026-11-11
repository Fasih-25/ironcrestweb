import { clamp, cubicOut, lerp } from './math';

export interface FrameState {
  rotateX: number;
  rotateY: number;
  scale: number;
  translateY: number;
  sheen: number;
}

/**
 * Hero product frame, ported from the reference scroll handler.
 * @param scrollY window.scrollY
 * @param viewportH window.innerHeight
 * @param fx pointer x in [-1, 1]
 * @param fy pointer y in [-1, 1]
 */
export function heroFrame(scrollY: number, viewportH: number, fx: number, fy: number): FrameState {
  const p = clamp(scrollY / (viewportH * 0.75), 0, 1);
  const e = cubicOut(p);
  return {
    rotateX: lerp(20, 0, e) + fy * -3,
    rotateY: fx * 4,
    scale: lerp(0.93, 1, e),
    translateY: lerp(0, -18, e),
    sheen: lerp(10, 90, p),
  };
}

export function frameTransform(s: FrameState): string {
  return `rotateX(${s.rotateX}deg) rotateY(${s.rotateY}deg) scale(${s.scale}) translateY(${s.translateY}px)`;
}

/** Parallax offset for `data-par` elements: (elementCentre - viewportCentre) * factor. */
export function parallaxOffset(top: number, height: number, viewportH: number, factor: number): number {
  return (top + height / 2 - viewportH / 2) * factor;
}

/** Header visibility: hide while scrolling down past 400px, unless the menu is open. */
export function headerHidden(y: number, lastY: number, menuOpen: boolean): boolean {
  return y > lastY && y > 400 && !menuOpen;
}

/** Page scroll progress for the top bar. */
export function scrollProgress(y: number, scrollHeight: number, viewportH: number): number {
  const doc = scrollHeight - viewportH;
  return doc > 0 ? clamp(y / doc, 0, 1) : 0;
}
