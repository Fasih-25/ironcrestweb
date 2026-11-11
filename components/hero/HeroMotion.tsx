'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { onPointer, onScrollFrame, pointer } from '@/lib/motion';
import { frameTransform, heroFrame } from '@/lib/hero';
import { matches, REDUCED_MOTION } from '@/hooks/useMediaQuery';

/** Rotates its element on scroll by writing `--rot`. `scroll`: scrollY×k; `rect`: rect.top×k. */
export function ScrollRotate({
  mode,
  factor,
  className,
  children,
}: {
  mode: 'scroll' | 'rect';
  factor: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(
    () =>
      onScrollFrame(() => {
        const el = ref.current;
        if (!el || matches(REDUCED_MOTION)) return;
        const v = mode === 'scroll' ? window.scrollY * factor : el.getBoundingClientRect().top * factor;
        el.style.setProperty('--rot', `${v}deg`);
      }),
    [mode, factor],
  );
  return (
    <div ref={ref} className={className} aria-hidden="true">
      {children}
    </div>
  );
}

/** Cursor-following red spotlight; writes `--mx/--my` relative to its own box. */
export function Spotlight({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(
    () =>
      onPointer((e) => {
        const el = ref.current;
        if (!el) return;
        const b = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - b.left}px`);
        el.style.setProperty('--my', `${e.clientY - b.top}px`);
      }),
    [],
  );
  return <div ref={ref} className={className} aria-hidden="true" />;
}

/** Hero product frame: scroll-linked rotateX/scale/translate, pointer tilt and sheen sweep. */
export function HeroFrame({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(
    () =>
      onScrollFrame(() => {
        const el = ref.current;
        if (!el || matches(REDUCED_MOTION)) return;
        const st = heroFrame(window.scrollY, window.innerHeight, pointer.fx, pointer.fy);
        el.style.transform = frameTransform(st);
        el.style.setProperty('--sh', String(st.sheen));
      }),
    [],
  );
  return (
    <div ref={ref} className={className} id="frame" data-testid="hero-frame">
      {children}
    </div>
  );
}
