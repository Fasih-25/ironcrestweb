/**
 * Reveal-on-scroll rule from the reference: only elements whose top is below 98% of the
 * viewport get the hidden (`pre`) state. Everything already on screen, or anything when JS
 * or IntersectionObserver is missing, stays visible.
 */
export const REVEAL_FOLD = 0.98;
export const REVEAL_ROOT_MARGIN = '0px 0px -8% 0px';
export const REVEAL_THRESHOLD = 0.05;

export function shouldPreHide(elementTop: number, viewportHeight: number): boolean {
  return elementTop > viewportHeight * REVEAL_FOLD;
}
