'use client';
import { useEffect } from 'react';
import { matches, POINTER_FINE, REDUCED_MOTION } from '@/hooks/useMediaQuery';

/** Offset a magnetic element toward the pointer (reference: 22% x, 30% y). */
export function magneticOffset(
  px: number,
  py: number,
  rect: { left: number; top: number; width: number; height: number },
): { x: number; y: number } {
  return {
    x: (px - rect.left - rect.width / 2) * 0.22,
    y: (py - rect.top - rect.height / 2) * 0.3,
  };
}

/** Delegated controller for every `[data-mag]` element (fine pointer, motion allowed). */
export function useMagnetic(): void {
  useEffect(() => {
    let current: HTMLElement | null = null;
    const release = () => {
      if (current) current.style.transform = '';
      current = null;
    };
    const move = (e: PointerEvent) => {
      if (!matches(POINTER_FINE) || matches(REDUCED_MOTION)) return release();
      const el = (e.target as Element | null)?.closest?.<HTMLElement>('[data-mag]') ?? null;
      if (el !== current) release();
      if (!el) return;
      current = el;
      const o = magneticOffset(e.clientX, e.clientY, el.getBoundingClientRect());
      el.style.transform = `translate(${o.x}px,${o.y}px)`;
    };
    document.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', release);
    return () => {
      document.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', release);
    };
  }, []);
}
