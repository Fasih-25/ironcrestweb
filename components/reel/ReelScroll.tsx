'use client';
import { useEffect } from 'react';
import { onScrollFrame } from '@/lib/motion';
import { matches, REDUCED_MOTION } from '@/hooks/useMediaQuery';
import { PIN_MIN_WIDTH, pinProgress } from '../story/useScrollProgress';
import { reelCardStyle, reelOffset } from './reelMath';

/** Vertical scroll drives the horizontal track; cards near the edges turn, shrink and fade. */
export function ReelScroll({ sectionId }: { sectionId: string }) {
  useEffect(() => {
    const sec = document.getElementById(sectionId);
    const track = sec?.querySelector<HTMLElement>('[data-track]');
    const bar = sec?.querySelector<HTMLElement>('[data-bar]');
    if (!sec || !track) return;
    const cards = Array.from(track.querySelectorAll<HTMLElement>('[data-reel]'));
    return onScrollFrame(() => {
      const W = window.innerWidth;
      if (W <= PIN_MIN_WIDTH) {
        track.style.transform = '';
        cards.forEach((c) => {
          c.style.transform = '';
          c.style.opacity = '';
        });
        return;
      }
      const b = sec.getBoundingClientRect();
      const p = pinProgress(b.top, b.height, window.innerHeight);
      const max = track.scrollWidth - W + W * 0.06;
      track.style.transform = `translate3d(${-p * max}px,0,0)`;
      bar?.style.setProperty('--rp', String(p));
      sec.dataset.progress = p.toFixed(3);
      const rm = matches(REDUCED_MOTION);
      cards.forEach((c) => {
        const cb = c.getBoundingClientRect();
        const st = reelCardStyle(reelOffset(cb.left, cb.width, W));
        c.style.transform = rm ? '' : st.transform;
        c.style.opacity = String(st.opacity);
      });
    });
  }, [sectionId]);
  return null;
}
