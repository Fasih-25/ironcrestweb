'use client';
import { useEffect } from 'react';
import { onScrollFrame } from '@/lib/motion';
import { parallaxOffset } from '@/lib/hero';
import { matches, REDUCED_MOTION } from './useMediaQuery';

/** Global `data-par` parallax: translateY = (elementCentre - viewportCentre) * factor. */
export function useParallax(): void {
  useEffect(() => {
    return onScrollFrame(() => {
      const els = document.querySelectorAll<HTMLElement>('[data-par]');
      if (matches(REDUCED_MOTION)) {
        els.forEach((el) => (el.style.transform = ''));
        return;
      }
      const H = window.innerHeight;
      els.forEach((el) => {
        const b = el.getBoundingClientRect();
        const f = parseFloat(el.dataset.par ?? '0') || 0;
        el.style.transform = `translate3d(0,${parallaxOffset(b.top, b.height, H, f)}px,0)`;
      });
    });
  }, []);
}
