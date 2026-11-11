import type { CSSProperties } from 'react';
import { preload } from 'react-dom';
import { hero } from '@/content/site';
import { SHOW_REAL_UI, screens } from '@/content/media';
import { Plate } from './Plate';
import { Button } from './ui/Button';
import { CheckCircle, TrendUp } from './ui/Icons';
import { RichText } from './ui/RichText';
import { UiShot } from './ui/UiShot';
import { HeroFrame, ScrollRotate, Spotlight } from './hero/HeroMotion';
import s from './Hero.module.css';

const v = (vars: Record<string, string | number>) => vars as CSSProperties;

export function Hero() {
  if (SHOW_REAL_UI) preload(screens.dashboard.src, { as: 'image', fetchPriority: 'high' });
  const { chips } = hero;
  return (
    <section className={s.hero} id="hero" aria-labelledby="hero-title">
      <div className={`${s.orb} ${s.o1}`} data-par="-.05" aria-hidden="true" />
      <div className={`${s.orb} ${s.o2}`} data-par=".04" aria-hidden="true" />
      <ScrollRotate mode="scroll" factor={0.05} className={s.bigplate}>
        <Plate id="pp-hero" />
      </ScrollRotate>
      <Spotlight className={s.spot} />
      <div className="wrap">
        <div className={s.copy}>
          <div className={`${s.badge} ${s.fade}`} style={v({ '--t': '.5s' })}>
            <b>{hero.badge.tag}</b> {hero.badge.text}
          </div>
          <h1 className={s.h1} id="hero-title">
            {hero.lines.map((line, i) => (
              <span key={i} className={s.ln} style={v({ '--i': i })}>
                <span>
                  <RichText value={line} />
                </span>
              </span>
            ))}
          </h1>
          <p className={`lede ${s.lede} ${s.fade}`} style={v({ '--t': '.85s' })}>
            {hero.lede}
          </p>
          <div className={`${s.ctaRow} ${s.fade}`} style={v({ '--t': '1s' })}>
            <Button href={hero.primary.href} magnetic arrow>
              {hero.primary.label}
            </Button>
            <Button href={hero.secondary.href} variant="ghost" magnetic>
              {hero.secondary.label}
            </Button>
          </div>
        </div>
        <div className={`${s.stage} ${s.fade}`} style={v({ '--t': '1.1s' })}>
          <div className={`chip ${s.c1}`} data-par="-.09">
            <i>
              <CheckCircle />
            </i>
            <div>
              {chips.checkins.label}
              <b>{chips.checkins.value}</b>
            </div>
          </div>
          <div className={`chip ${s.c2}`} data-par=".07">
            <i>
              <TrendUp />
            </i>
            <div>
              {chips.revenue.label}
              <b>{chips.revenue.value}</b>
            </div>
          </div>
          <div className={`chip ${s.c3}`} data-par="-.05">
            <span className={s.sw} aria-hidden="true" />
            <div>
              {chips.module.label}
              <b className={s.chipText}>{chips.module.value}</b>
            </div>
          </div>
          <HeroFrame className={s.frame}>
            <UiShot
              className={s.shot}
              screen="dashboard"
              alt="The Ironcrest dashboard with KPIs, revenue chart and today's classes"
              priority
            />
          </HeroFrame>
        </div>
      </div>
    </section>
  );
}
