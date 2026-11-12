'use client';
import { useEffect, useRef, type RefObject } from 'react';
import { clamp, lerp } from '@/lib/math';
import { motionFlags, onLoop } from '@/lib/motion';
import { matches, REDUCED_MOTION } from '@/hooks/useMediaQuery';
import {
  AUTOPLAY_SECONDS,
  STEP,
  activeIndex,
  cardDelta,
  cardLook,
  chase,
  geometry,
  releaseTarget,
  targetFor,
} from './geometry';

export interface WheelRefs {
  root: RefObject<HTMLDivElement | null>;
  stage: RefObject<HTMLDivElement | null>;
  plate: RefObject<HTMLDivElement | null>;
  spokes: RefObject<(HTMLDivElement | null)[]>;
  cards: RefObject<(HTMLDivElement | null)[]>;
  dots: RefObject<(HTMLButtonElement | null)[]>;
}

export interface WheelApi {
  go: (dir: number) => void;
  goTo: (i: number) => void;
}

interface Classes {
  act: string;
  pop: string;
  drag: string;
}

/** Paint the wheel at position r (exported for SSR initial styles and tests). */
export function spokeTransform(d: number): string {
  return `rotate(${d * STEP}deg)`;
}
export function cardFilter(d: number): string {
  const l = cardLook(d);
  return `brightness(${l.brightness}) saturate(${l.saturate})`;
}

/**
 * Wheel physics and input, ported from the reference: drag with velocity (EMA 0.4), throw
 * and snap, critically damped chase, wheel/keys/buttons/dots, click-to-select, autoplay
 * every 4.2 s while ≥35% visible and not hovered/focused. Reduced motion: no autoplay, no inertia.
 */
export function useWheelPhysics(n: number, refs: WheelRefs, cls: Classes, onActive: (i: number) => void): WheelApi {
  const st = useRef({ r: 0, tgt: 0 });
  const api = useRef<WheelApi>({ go: () => {}, goTo: () => {} });
  const onActiveRef = useRef(onActive);
  useEffect(() => {
    onActiveRef.current = onActive;
  }, [onActive]);

  useEffect(() => {
    const stage = refs.stage.current;
    const root = refs.root.current;
    if (!stage || !root) return;
    const s = st.current;
    let vel = 0;
    let dragging = false;
    let hasDrag = false;
    let lastX = 0;
    let lastT = 0;
    let idle = 0;
    let cur = -1;
    let hover = false;
    let focused = false;
    let visW = false;
    let visAny = true;
    let wheelTimer = 0;
    let sp = geometry(stage.clientWidth).sp;
    const rm = () => matches(REDUCED_MOTION);

    const setActive = (i: number) => {
      if (i === cur) return;
      cur = i;
      refs.cards.current.forEach((c, k) => {
        if (!c) return;
        c.classList.toggle(cls.act, k === i);
        if (k === i) {
          c.classList.remove(cls.pop);
          void c.offsetWidth;
          c.classList.add(cls.pop);
        }
      });
      stage.dataset.active = String(i);
      onActiveRef.current(i);
      idle = 0;
    };

    let painted = Number.NaN;
    const paint = () => {
      if (s.r === painted) return;
      painted = s.r;
      const plate = refs.plate.current;
      if (plate) plate.style.transform = `rotate(${-s.r * STEP}deg)`;
      refs.cards.current.forEach((c, i) => {
        const sp_ = refs.spokes.current[i];
        if (!c || !sp_) return;
        const d = cardDelta(i, s.r, n);
        const look = cardLook(d);
        sp_.style.transform = spokeTransform(d);
        sp_.style.visibility = look.visible ? 'visible' : 'hidden';
        c.style.transform = `scale(${look.scale})`;
        c.style.zIndex = String(look.zIndex);
        c.style.filter = cardFilter(d);
      });
    };

    const go = (dir: number) => {
      s.tgt = Math.round(s.tgt) + dir;
      if (rm()) s.r = s.tgt;
      idle = 0;
    };
    const goTo = (i: number) => {
      s.tgt = targetFor(i, s.r, n);
      if (rm()) s.r = s.tgt;
      idle = 0;
    };
    api.current = { go, goTo };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      dragging = true;
      motionFlags.dragging = true;
      hasDrag = false;
      lastX = e.clientX;
      lastT = performance.now();
      vel = 0;
      stage.classList.add(cls.drag);
      try {
        stage.setPointerCapture(e.pointerId);
      } catch {
        /* synthetic events */
      }
    };
    const onMove = (e: PointerEvent) => {
      const b = stage.getBoundingClientRect();
      stage.style.setProperty('--px', String(((e.clientX - b.left) / b.width - 0.5) * 2));
      stage.style.setProperty('--py', String(((e.clientY - b.top) / b.height - 0.5) * 2));
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const now = performance.now();
      const dt = Math.max(1, now - lastT);
      if (Math.abs(dx) > 3) hasDrag = true;
      const dr = -dx / sp;
      s.r += dr;
      s.tgt = s.r;
      vel = lerp(vel, (dr / dt) * 1000, 0.4);
      lastX = e.clientX;
      lastT = now;
      idle = 0;
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      motionFlags.dragging = false;
      stage.classList.remove(cls.drag);
      if (!hasDrag && e.type === 'pointerup') {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const c = el?.closest<HTMLElement>('[data-card]');
        if (c) {
          const i = Number(c.dataset.card);
          if (i !== activeIndex(s.r, n)) {
            goTo(i);
            return;
          }
        }
      }
      s.tgt = rm() ? Math.round(s.r) : releaseTarget(s.r, vel);
      if (rm()) s.r = s.tgt;
      hasDrag = false;
    };
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 4) {
        e.preventDefault();
        s.tgt += (e.deltaX / sp) * 0.9;
        window.clearTimeout(wheelTimer);
        wheelTimer = window.setTimeout(() => {
          s.tgt = Math.round(s.tgt);
          if (rm()) s.r = s.tgt;
        }, 140);
        idle = 0;
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        go(1);
        e.preventDefault();
      }
      if (e.key === 'ArrowLeft') {
        go(-1);
        e.preventDefault();
      }
    };
    const onEnter = () => (hover = true);
    const onLeave = () => {
      hover = false;
      stage.style.setProperty('--px', '0');
      stage.style.setProperty('--py', '0');
    };
    const onFocusIn = () => (focused = true);
    const onFocusOut = (e: FocusEvent) => {
      if (!root.contains(e.relatedTarget as Node | null)) focused = false;
    };

    stage.addEventListener('pointerdown', onDown);
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerup', onUp);
    stage.addEventListener('pointercancel', onUp);
    stage.addEventListener('wheel', onWheel, { passive: false });
    stage.addEventListener('keydown', onKey);
    stage.addEventListener('pointerenter', onEnter);
    stage.addEventListener('pointerleave', onLeave);
    root.addEventListener('focusin', onFocusIn);
    root.addEventListener('focusout', onFocusOut);

    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          visAny = e.isIntersecting;
          // pause the card scene animations while the wheel is off-screen
          stage.toggleAttribute('data-offscreen', !visAny);
          visW = e.intersectionRatio >= 0.35;
        }),
      { threshold: [0, 0.35] },
    );
    io.observe(stage);
    const ro = new ResizeObserver(() => {
      sp = geometry(stage.clientWidth).sp;
    });
    ro.observe(stage);

    const offLoop = onLoop((dt) => {
      if (!dragging) s.r = chase(s.r, s.tgt, dt);
      const settled = !dragging && Math.abs(s.tgt - s.r) < 0.02;
      const why = rm() ? 'reduced-motion' : !visW ? 'offscreen' : hover ? 'hover' : focused ? 'focus' : !settled ? 'moving' : 'running';
      if (stage.dataset.autoplay !== why) stage.dataset.autoplay = why;
      if (why === 'running') {
        idle += dt;
        if (idle > AUTOPLAY_SECONDS) go(1);
      }
      const ai = activeIndex(s.r, n);
      setActive(ai);
      const frac = settled ? clamp(idle / AUTOPLAY_SECONDS, 0, 1) : 0;
      refs.dots.current[ai]?.style.setProperty('--ap', String(frac));
      if (visAny || dragging) paint();
    });

    return () => {
      offLoop();
      io.disconnect();
      ro.disconnect();
      window.clearTimeout(wheelTimer);
      motionFlags.dragging = false;
      stage.removeEventListener('pointerdown', onDown);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerup', onUp);
      stage.removeEventListener('pointercancel', onUp);
      stage.removeEventListener('wheel', onWheel);
      stage.removeEventListener('keydown', onKey);
      stage.removeEventListener('pointerenter', onEnter);
      stage.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('focusin', onFocusIn);
      root.removeEventListener('focusout', onFocusOut);
    };
  }, [n, refs, cls]);

  return {
    go: (d) => api.current.go(d),
    goTo: (i) => api.current.goTo(i),
  };
}

