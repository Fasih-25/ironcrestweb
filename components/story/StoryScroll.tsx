'use client';
import { useEffect } from 'react';
import { onScrollFrame } from '@/lib/motion';
import { PIN_MIN_WIDTH, lineFill, pinProgress, stepIndex } from './useScrollProgress';

/** Drives the pinned story: scroll progress picks the step, fills the line and swaps the device shots. */
export function StoryScroll({ sectionId, on, past }: { sectionId: string; on: string; past: string }) {
  useEffect(() => {
    const sec = document.getElementById(sectionId);
    if (!sec) return;
    const list = sec.querySelector<HTMLElement>('[data-steps]');
    const items = Array.from(sec.querySelectorAll<HTMLElement>('[data-step]'));
    const shots = Array.from(sec.querySelectorAll<HTMLElement>('[data-shot]'));
    let now = -1;
    let wasWide: boolean | null = null;
    return onScrollFrame(() => {
      const wide = window.innerWidth > PIN_MIN_WIDTH;
      if (wide !== wasWide) {
        wasWide = wide;
        now = -1;
      }
      if (!wide) return;
      const b = sec.getBoundingClientRect();
      const p = pinProgress(b.top, b.height, window.innerHeight);
      const idx = stepIndex(p, items.length);
      list?.style.setProperty('--p', String(lineFill(p)));
      if (idx !== now) {
        now = idx;
        sec.dataset.step = String(idx);
        items.forEach((s, k) => s.classList.toggle(on, k === idx));
        shots.forEach((s, k) => {
          s.classList.toggle(on, k === idx);
          s.classList.toggle(past, k < idx);
        });
      }
    });
  }, [sectionId, on, past]);
  return null;
}
