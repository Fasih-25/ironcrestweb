import { plateLabels } from '@/content/site';
import s from './Plate.module.css';

export interface PlateProps {
  /** Unique id for the circular text path (required for the default variant). */
  id?: string;
  /** `wheel` = ticks on the rim, two rings and numerals near the rim; no ring text. */
  variant?: 'default' | 'wheel';
  label?: string;
  /** Numerals placed around the rim: [angleDeg, text]. */
  nums?: ReadonlyArray<readonly [number, string]>;
  className?: string;
}

const TICKS = Array.from({ length: 120 }, (_, i) => i);

/**
 * The iron weight plate (viewBox 1000×1000). Coloured with `currentColor`.
 * Ported 1:1 from the reference `plate()` generator.
 */
export function Plate({ id = 'plate', variant = 'default', label = plateLabels.default, nums = [], className }: PlateProps) {
  const wheel = variant === 'wheel';
  const ticks = (
    <g className={s.ticks}>
      {TICKS.map((i) => {
        const long = i % 5 === 0;
        return wheel ? (
          <line key={i} x1="500" y1="14" x2="500" y2={long ? 50 : 34} transform={`rotate(${i * 3} 500 500)`} />
        ) : (
          <line key={i} x1="500" y1="40" x2="500" y2={long ? 80 : 62} transform={`rotate(${i * 3} 500 500)`} />
        );
      })}
    </g>
  );
  const numerals = nums.map(([a, t]) => (
    <text key={t} className={s.num} x="500" y={wheel ? 108 : 168} textAnchor="middle" transform={`rotate(${a} 500 500)`}>
      {t}
    </text>
  ));
  const cls = [s.plate, wheel ? s.wheel : '', className ?? ''].join(' ').trim();

  if (wheel) {
    return (
      <svg className={cls} viewBox="0 0 1000 1000" aria-hidden="true" focusable="false">
        <circle className={s.disc} cx="500" cy="500" r="486" />
        <circle className={s.rim} cx="500" cy="500" r="486" />
        {ticks}
        <circle className={s.ring} cx="500" cy="500" r="388" />
        <circle className={s.ring} cx="500" cy="500" r="300" />
        {numerals}
        <circle className={s.hole} cx="500" cy="500" r="64" />
      </svg>
    );
  }

  return (
    <svg className={cls} viewBox="0 0 1000 1000" aria-hidden="true" focusable="false">
      <defs>
        <path id={id} d="M500 500 m-372 0 a372 372 0 1 1 744 0 a372 372 0 1 1 -744 0" />
      </defs>
      <circle className={s.disc} cx="500" cy="500" r="486" />
      <circle className={s.rim} cx="500" cy="500" r="486" />
      {ticks}
      <circle className={s.ring} cx="500" cy="500" r="420" />
      <circle className={s.ring} cx="500" cy="500" r="330" />
      <circle className={s.ring} cx="500" cy="500" r="236" />
      <text className={s.label}>
        <textPath href={`#${id}`} textLength={2330} lengthAdjust="spacing">
          {label}
        </textPath>
      </text>
      {numerals}
      <circle className={s.hole} cx="500" cy="500" r="64" />
      <circle className={s.ring} cx="500" cy="500" r="110" style={{ strokeWidth: 4, strokeOpacity: 0.6 }} />
    </svg>
  );
}
