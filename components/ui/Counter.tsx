'use client';
import { useEffect, useRef } from 'react';
import { expoOut } from '@/lib/math';
import { matches, REDUCED_MOTION } from '@/hooks/useMediaQuery';

export const COUNT_MS = 1700;

/**
 * Counts 0 → value (exponential ease-out, 1.7 s) once ≥60% visible.
 * Server-renders the final value, so the number is right without JS or under reduced motion.
 */
export function Counter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || matches(REDUCED_MOTION) || !('IntersectionObserver' in window)) return;
    el.textContent = '0';
    let raf = 0;
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          io.disconnect();
          const t0 = performance.now();
          const f = (t: number) => {
            const p = Math.min(1, (t - t0) / COUNT_MS);
            el.textContent = String(Math.round(value * expoOut(p)));
            if (p < 1) raf = requestAnimationFrame(f);
          };
          raf = requestAnimationFrame(f);
        }),
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = String(value);
    };
  }, [value]);
  return (
    <span ref={ref} data-count={value}>
      {value}
    </span>
  );
}
