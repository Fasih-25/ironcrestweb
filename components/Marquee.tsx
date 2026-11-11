import { marqueeWords } from '@/content/site';
import { PlateGlyph } from './ui/Icons';
import s from './Marquee.module.css';

/** Tilted, endlessly scrolling word strip (two copies for a seamless loop). Pure CSS. */
export function Marquee() {
  const row = (copy: number) =>
    marqueeWords.map((w, i) => (
      <span key={`${copy}-${w}`}>
        {i % 2 ? <em>{w}</em> : w}
        <PlateGlyph />
      </span>
    ));
  return (
    <div className={s.mq} aria-hidden="true" data-testid="marquee">
      <div className={s.track}>
        {row(0)}
        {row(1)}
      </div>
    </div>
  );
}
