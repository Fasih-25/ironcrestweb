'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { smoothstep } from '@/lib/math';
import { matches, REDUCED_MOTION } from '@/hooks/useMediaQuery';
import s from './Loader.module.css';

export const LOADER_TIMING = {
  count: 1300, // counter 0 → 100
  pause: 160, // before the halves split
  failsafe: 3200, // force open
  remove: 1200, // unmount after opening
} as const;

/** Marks the page ready (triggers the hero h1 reveal). Safe to call repeatedly. */
export function markReady(): void {
  document.body.classList.add('ready');
}

/**
 * Full-screen loader: a spinning plate counts 0 → 100 KG, then the two halves slide away.
 * Skipped under reduced motion. `plate` is the server-rendered <Plate/>.
 */
export function Loader({ plate }: { plate: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [gone, setGone] = useState(false);
  const num = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let done = false;
    let raf = 0;
    const timers: number[] = [];
    const openLoader = () => {
      if (done) return;
      done = true;
      setOpen(true);
      markReady();
      timers.push(window.setTimeout(() => setGone(true), LOADER_TIMING.remove));
    };
    if (matches(REDUCED_MOTION)) {
      // CSS already hides the overlay under reduced motion; unmount it on the next tick.
      markReady();
      const t = window.setTimeout(() => setGone(true), 0);
      return () => clearTimeout(t);
    }
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, Math.max(0, (t - t0) / LOADER_TIMING.count));
      if (num.current) num.current.textContent = String(Math.round(smoothstep(p) * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else timers.push(window.setTimeout(openLoader, LOADER_TIMING.pause));
    };
    raf = requestAnimationFrame(tick);
    timers.push(window.setTimeout(openLoader, LOADER_TIMING.failsafe));
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, []);

  if (gone) return null;
  return (
    <div className={[s.loader, open ? s.open : ''].join(' ')} aria-hidden="true" data-testid="loader">
      <div className={`${s.half} ${s.ha}`} />
      <div className={`${s.half} ${s.hb}`} />
      <div className={s.mid}>
        <div className={s.lp}>{plate}</div>
        <div className={s.num}>
          <span ref={num}>0</span>
          <small>KG</small>
        </div>
      </div>
    </div>
  );
}
