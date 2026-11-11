'use client';
import { useEffect, useRef } from 'react';
import { damp, lerp } from '@/lib/math';
import { motionFlags, onLoop, onPointer } from '@/lib/motion';
import { matches, POINTER_FINE } from '@/hooks/useMediaQuery';
import s from './Cursor.module.css';

const ON = s.on ?? 'on';
const BIG = s.big ?? 'big';
const HOV = s.hov ?? 'hov';

const HOVER_SEL = 'a,button,[data-hov]';

/** Custom cursor: red dot + lerping ring; 64px over interactive things, 92px "DRAG" disc over the wheel. */
export function Cursor() {
  const el = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = el.current;
    const l = label.current;
    if (!c || !l) return;
    let cx = 0;
    let cy = 0;
    let tx = 0;
    let ty = 0;
    let shown = false;

    const offPointer = onPointer((e) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!matches(POINTER_FINE)) return;
      if (!shown) {
        shown = true;
        cx = tx;
        cy = ty;
        c.classList.add(ON);
      }
      const target = e.target as Element | null;
      const dragging = motionFlags.dragging;
      const big = !!target?.closest?.('[data-cursor]') && !dragging;
      c.classList.toggle(BIG, big || dragging);
      l.textContent = big || dragging ? 'DRAG' : '';
      c.classList.toggle(HOV, !big && !dragging && !!target?.closest?.(HOVER_SEL));
    });

    const offLoop = onLoop((dt) => {
      if (!shown) return;
      const k = damp(0.0005, dt);
      cx = lerp(cx, tx, k);
      cy = lerp(cy, ty, k);
      c.style.transform = `translate3d(${cx}px,${cy}px,0)`;
    });

    return () => {
      offPointer();
      offLoop();
    };
  }, []);

  return (
    <div ref={el} className={s.cur} aria-hidden="true" data-testid="cursor">
      <div className={s.d} />
      <div ref={label} className={s.rg} />
    </div>
  );
}
