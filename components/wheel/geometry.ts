import { clamp, damp, mod } from '@/lib/math';

/** Wheel geometry for a stage of width `w` (reference `geo()`). */
export interface WheelGeometry {
  w: number;
  cw: number;
  ch: number;
  R: number;
  /** Degrees between neighbouring cards. */
  step: number;
  /** Pixels of drag per card. */
  sp: number;
  bottom: number;
  /** Stage height. */
  h: number;
  /** Wheel centre y (from the stage top). */
  cy: number;
  /** Plate radius. */
  rp: number;
}

export function geometry(w: number): WheelGeometry {
  const cw = clamp(w * 0.34, 250, 430);
  const ch = cw * 1.28;
  const R = cw * 2.7;
  const step = (Math.atan2(cw * 0.9, R) * 180) / Math.PI;
  const bottom = ch + 70;
  const h = bottom + (w < 700 ? 190 : 250);
  return { w, cw, ch, R, step, sp: cw * 0.9, bottom, h, cy: bottom + R, rp: R - 26 };
}

/** The step angle depends only on the cw:R ratio, so it is constant (~18.43°). */
export const STEP = (Math.atan2(0.9, 2.7) * 180) / Math.PI;

/** Signed distance of card `i` from the wheel position `r`, wrapped into [-N/2, N/2). */
export function cardDelta(i: number, r: number, n: number): number {
  return mod(i - r + n / 2, n) - n / 2;
}

export interface CardLook {
  scale: number;
  zIndex: number;
  brightness: number;
  saturate: number;
  visible: boolean;
}

export function cardLook(d: number): CardLook {
  const ad = Math.abs(d);
  return {
    scale: 1 - clamp(ad, 0, 1) * 0.07 - clamp(ad - 1, 0, 1.5) * 0.05,
    zIndex: 10 - Math.round(ad * 3),
    brightness: 1 - clamp(ad, 0, 1.6) * 0.32,
    saturate: 1 - clamp(ad, 0, 1) * 0.25,
    visible: ad < 2.7,
  };
}

/** Index of the card nearest the centre. */
export function activeIndex(r: number, n: number): number {
  return mod(Math.round(r), n);
}

/** Snap target after a drag, thrown by velocity (cards/second). */
export function releaseTarget(r: number, vel: number): number {
  return Math.round(r + clamp(vel, -6, 6) * 0.28);
}

/** One frame of the critically damped chase toward the target. */
export function chase(r: number, target: number, dt: number): number {
  const next = r + (target - r) * damp(0.0009, dt);
  return Math.abs(target - next) < 0.0004 ? target : next;
}

/** Shortest-path target that brings card `i` to the centre from position `r`. */
export function targetFor(i: number, r: number, n: number): number {
  const base = Math.round(r);
  return base + cardDelta(i, base, n);
}

export const AUTOPLAY_SECONDS = 4.2;
