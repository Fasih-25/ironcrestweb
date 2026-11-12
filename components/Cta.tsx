import type { CSSProperties } from 'react';
import { ctaCopy } from '@/content/cta';
import { DemoForm } from './DemoForm';
import { Plate } from './Plate';
import { ScrollRotate } from './hero/HeroMotion';
import { RichText } from './ui/RichText';
import s from './Cta.module.css';

const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

export function Cta() {
  return (
    <section className={`sec ${s.cta}`} id="demo" aria-labelledby="demo-title">
      <ScrollRotate mode="rect" factor={-0.04} className={s.bigplate}>
        <Plate id="pp-cta" />
      </ScrollRotate>
      <div className="wrap">
        <p className="eyebrow" data-r="">
          {ctaCopy.eyebrow}
        </p>
        <h2 className="h2" id="demo-title" data-r="" style={d(80)}>
          <RichText value={ctaCopy.title} />
        </h2>
        <p className="lede" data-r="" style={d(160)}>
          {ctaCopy.lede}
        </p>
        <DemoForm />
      </div>
    </section>
  );
}
