'use client';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { Floor } from '@/content/floors';
import { Plate } from '../Plate';
import { ArrowLeft, ArrowRight } from '../ui/Icons';
import { STEP, cardDelta, cardLook } from './geometry';
import { cardFilter, spokeTransform, useWheelPhysics, type WheelRefs } from './useWheelPhysics';
import { matches, REDUCED_MOTION } from '@/hooks/useMediaQuery';
import s from './Wheel.module.css';

const CLS = { act: s.act ?? 'act', pop: s.pop ?? 'pop', drag: s.drag ?? 'drag' };
const pad = (i: number) => String(i).padStart(2, '0');

interface WheelProps {
  floors: readonly Floor[];
  /** Server-rendered card illustrations, one per floor. */
  arts: readonly ReactNode[];
  label: string;
}

/** The Plate Wheel: six cards standing on a giant plate's rim. */
export function Wheel({ floors, arts, label }: WheelProps) {
  const n = floors.length;
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const plate = useRef<HTMLDivElement>(null);
  const spokes = useRef<(HTMLDivElement | null)[]>([]);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const dots = useRef<(HTMLButtonElement | null)[]>([]);
  const refs = useMemo<WheelRefs>(() => ({ root, stage, plate, spokes, cards, dots }), []);

  const [active, setActiveState] = useState(0);
  const [shown, setShown] = useState(0);
  const [out, setOut] = useState(false);
  const swap = useRef(0);

  const onActive = useCallback((i: number) => {
    setActiveState(i);
    setOut(true);
    window.clearTimeout(swap.current);
    swap.current = window.setTimeout(
      () => {
        setShown(i);
        setOut(false);
      },
      matches(REDUCED_MOTION) ? 0 : 260,
    );
  }, []);
  useEffect(() => () => window.clearTimeout(swap.current), []);

  const { go, goTo } = useWheelPhysics(n, refs, CLS, onActive);
  const nums = useMemo(() => floors.map((_, i) => [i * STEP, pad(i + 1)] as const), [floors]);
  const floor = floors[shown] ?? floors[0]!;

  return (
    <div ref={root}>
      <div className={s.cq}>
        <div
          ref={stage}
          className={s.stage}
          data-cursor="drag"
          data-testid="wheel-stage"
          data-active="0"
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label={`${label}. Use the left and right arrow keys to turn the wheel.`}
        >
          <div ref={plate} className={s.plate}>
            <Plate variant="wheel" nums={nums} />
          </div>
          {floors.map((f, i) => {
            const d = cardDelta(i, 0, n);
            const look = cardLook(d);
            return (
              <div
                key={f.title}
                ref={(el) => {
                  spokes.current[i] = el;
                }}
                className={s.spoke}
                style={{ transform: spokeTransform(d), visibility: look.visible ? 'visible' : 'hidden' }}
              >
                <div
                  ref={(el) => {
                    cards.current[i] = el;
                  }}
                  className={`${s.card} ${i === 0 ? s.act : ''}`}
                  data-card={i}
                  data-hov=""
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${n}: ${f.title}`}
                  style={{ transform: `scale(${look.scale})`, zIndex: look.zIndex, filter: cardFilter(d) } as CSSProperties}
                >
                  <div className={s.art}>
                    <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
                      {arts[i]}
                    </svg>
                  </div>
                  <div className={s.glare} />
                  <div className={s.meta}>
                    <span>
                      {pad(i + 1)} / {pad(n)}
                    </span>
                    <b>{f.title}</b>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className={s.info}>
        <h3 className={`${s.title} ${out ? s.out : ''}`} data-testid="wheel-title">
          <span>{floor.title}</span>
        </h3>
        <p className={`${s.desc} ${out ? s.out : ''}`}>{floor.description}</p>
        <div className={s.ctrl}>
          <button type="button" className={s.rb} aria-label="Previous floor" onClick={() => go(-1)}>
            <ArrowLeft />
          </button>
          <div className={s.count} data-testid="wheel-count">
            {pad(shown + 1)} <small>/ {pad(n)}</small>
          </div>
          <button type="button" className={s.rb} aria-label="Next floor" onClick={() => go(1)}>
            <ArrowRight />
          </button>
        </div>
      </div>
      <div className={s.dots} role="tablist" aria-label="Choose a floor">
        {floors.map((f, i) => (
          <button
            key={f.title}
            ref={(el) => {
              dots.current[i] = el;
            }}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={f.title}
            className={`${s.dot} ${i === active ? s.on : ''}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
}
