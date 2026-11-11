/**
 * The page's single scroll handler and single animation loop (client only).
 * Mirrors the reference: one rAF-throttled `scroll` listener (also run on resize)
 * and one requestAnimationFrame loop shared by the cursor and, later, the wheel.
 */

type ScrollFn = () => void;
type LoopFn = (dt: number, now: number) => void;
type PointerFn = (e: PointerEvent) => void;

const scrollSubs = new Set<ScrollFn>();
const loopSubs = new Set<LoopFn>();
const pointerSubs = new Set<PointerFn>();

/** Shared pointer state; fx/fy are normalised to [-1, 1] across the viewport. */
export const pointer = { x: 0, y: 0, fx: 0, fy: 0 };
/** Cross-component flags (the wheel sets `dragging` in S2). */
export const motionFlags = { dragging: false };

let scrollBound = false;
let pointerBound = false;
let ticking = false;
let rafId = 0;
let lastFrame = 0;

function runScroll(): void {
  ticking = false;
  scrollSubs.forEach((fn) => fn());
}

function requestScroll(): void {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(runScroll);
  }
}

function bindScroll(): void {
  if (scrollBound || typeof window === 'undefined') return;
  scrollBound = true;
  window.addEventListener('scroll', requestScroll, { passive: true });
  window.addEventListener('resize', requestScroll);
}

function onPointerMove(e: PointerEvent): void {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  pointer.fx = (e.clientX / window.innerWidth - 0.5) * 2;
  pointer.fy = (e.clientY / window.innerHeight - 0.5) * 2;
  pointerSubs.forEach((fn) => fn(e));
}

function bindPointer(): void {
  if (pointerBound || typeof window === 'undefined') return;
  pointerBound = true;
  window.addEventListener('pointermove', onPointerMove, { passive: true });
}

function frame(now: number): void {
  const dt = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;
  loopSubs.forEach((fn) => fn(dt, now));
  rafId = loopSubs.size ? requestAnimationFrame(frame) : 0;
}

/** Subscribe to the throttled scroll/resize handler. Runs once immediately. */
export function onScrollFrame(fn: ScrollFn): () => void {
  bindScroll();
  scrollSubs.add(fn);
  fn();
  return () => {
    scrollSubs.delete(fn);
  };
}

/** Subscribe to the shared animation loop. `dt` is in seconds, capped at 50 ms. */
export function onLoop(fn: LoopFn): () => void {
  loopSubs.add(fn);
  if (!rafId && typeof window !== 'undefined') {
    lastFrame = performance.now();
    rafId = requestAnimationFrame(frame);
  }
  return () => {
    loopSubs.delete(fn);
  };
}

/** Subscribe to the shared window pointermove listener. */
export function onPointer(fn: PointerFn): () => void {
  bindPointer();
  pointerSubs.add(fn);
  return () => {
    pointerSubs.delete(fn);
  };
}

/** Force the scroll subscribers to run on the next frame (e.g. after layout changes). */
export function invalidateScroll(): void {
  if (typeof window !== 'undefined') requestScroll();
}
