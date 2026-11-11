'use client';
import { useEffect } from 'react';
import { matches, POINTER_FINE, REDUCED_MOTION } from '@/hooks/useMediaQuery';

/** 3D tilt for a card (reference: ±8° around the pointer, lifted 6px). */
export function tiltTransform(
  px: number,
  py: number,
  rect: { left: number; top: number; width: number; height: number },
): string {
  const x = (px - rect.left) / rect.width - 0.5;
  const y = (py - rect.top) / rect.height - 0.5;
  return `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`;
}

/** Delegated controller for every `[data-tilt]` element (fine pointer, motion allowed). */
export function useTilt(): void {
  useEffect(() => {
    let current: HTMLElement | null = null;
    const release = () => {
      if (current) current.style.transform = '';
      current = null;
    };
    const move = (e: PointerEvent) => {
      if (!matches(POINTER_FINE) || matches(REDUCED_MOTION)) return release();
      const el = (e.target as Element | null)?.closest?.<HTMLElement>('[data-tilt]') ?? null;
      if (el !== current) release();
      if (!el) return;
      current = el;
      el.style.transform = tiltTransform(e.clientX, e.clientY, el.getBoundingClientRect());
    };
    document.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', release);
    return () => {
      document.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', release);
    };
  }, []);
}
