import type { CSSProperties } from 'react';
import { appCopy, appTicks, type TickIcon } from '@/content/app';
import { SHOW_REAL_UI, memberApp } from '@/content/media';
import { plateLabels } from '@/content/site';
import { Plate } from './Plate';
import { ScrollRotate } from './hero/HeroMotion';
import { RichText } from './ui/RichText';
import s from './AppSection.module.css';

const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;
const ic = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;

const ICONS: Record<TickIcon, React.ReactNode> = {
  shield: (
    <svg {...ic}>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  calendar: (
    <svg {...ic}>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  ),
  card: (
    <svg {...ic}>
      <rect x="3" y="6" width="18" height="13" rx="3" />
      <path d="M3 11h18" />
    </svg>
  ),
  lock: (
    <svg {...ic}>
      <path d="M12 3a4 4 0 00-4 4v3H6a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2h-2V7a4 4 0 00-4-4z" />
    </svg>
  ),
};

/** Illustrated phone used when the real member-app screenshot is gated off (DECISIONS I2). */
function PhonePlaceholder() {
  const qr = Array.from({ length: 49 }, (_, i) => i).filter((i) => (i * 7 + (i % 5) * 3) % 3 !== 0);
  return (
    <svg viewBox="0 0 780 1688" role="img" aria-label="Illustration of the Ironcrest member app" data-placeholder="memberapp" data-r="scale">
      <rect width="780" height="1688" rx="96" fill="#0F0F0F" />
      <rect x="300" y="40" width="180" height="36" rx="18" fill="#000" />
      <rect x="64" y="150" width="260" height="34" rx="10" fill="#F5F1F0" fillOpacity=".85" />
      <rect x="64" y="200" width="180" height="20" rx="8" fill="#F5F1F0" fillOpacity=".3" />
      <rect x="64" y="270" width="652" height="760" rx="48" fill="#A91421" />
      <rect x="190" y="360" width="400" height="400" rx="28" fill="#F5F1F0" />
      {qr.map((i) => (
        <rect key={i} x={222 + (i % 7) * 50} y={392 + Math.floor(i / 7) * 50} width="40" height="40" rx="6" fill="#0A0A0A" />
      ))}
      <rect x="190" y="820" width="400" height="26" rx="10" fill="#F5F1F0" fillOpacity=".85" />
      <rect x="250" y="870" width="280" height="18" rx="8" fill="#F5F1F0" fillOpacity=".45" />
      <rect x="250" y="940" width="280" height="10" rx="5" fill="#000" fillOpacity=".3" />
      <rect x="250" y="940" width="190" height="10" rx="5" fill="#F5F1F0" />
      {[0, 1, 2].map((k) => (
        <g key={k}>
          <rect x="64" y={1080 + k * 150} width="652" height="124" rx="28" fill="#fff" fillOpacity=".06" />
          <rect x="100" y={1116 + k * 150} width="240" height="22" rx="8" fill="#F5F1F0" fillOpacity=".8" />
          <rect x="100" y={1152 + k * 150} width="160" height="16" rx="8" fill="#F5F1F0" fillOpacity=".3" />
          <rect x="560" y={1120 + k * 150} width="120" height="44" rx="22" fill="#E5283A" fillOpacity={k ? 0.25 : 1} />
        </g>
      ))}
    </svg>
  );
}

export function AppSection() {
  return (
    <section className="sec" id="app" aria-labelledby="app-title">
      <div className={`wrap ${s.app}`}>
        <div className={s.phoneW}>
          <ScrollRotate mode="rect" factor={0.05} className={s.halo}>
            <Plate id="pp-app" label={plateLabels.member} />
          </ScrollRotate>
          <div className={s.phone} data-par="-.06">
            {SHOW_REAL_UI ? (
              // eslint-disable-next-line @next/next/no-img-element -- pre-optimised WebP (DECISIONS I1)
              <img
                data-r="scale"
                src={memberApp.src}
                alt={appCopy.phoneAlt}
                width={memberApp.width}
                height={memberApp.height}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <PhonePlaceholder />
            )}
          </div>
          <div className={`chip ${s.qrpill}`} data-par="-.06">
            <i>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM20 14v3M14 20h3" />
              </svg>
            </i>
            <div>
              {appCopy.chip.label}
              <b>{appCopy.chip.value}</b>
            </div>
          </div>
        </div>
        <div>
          <p className="eyebrow" data-r="">
            {appCopy.eyebrow}
          </p>
          <h2 className={`h2 ${s.h2}`} id="app-title" data-r="" style={d(80)}>
            <RichText value={appCopy.title} />
          </h2>
          <p className={`lede ${s.lede}`} data-r="" style={d(140)}>
            {appCopy.lede}
          </p>
          <ul className={s.ticks}>
            {appTicks.map((t, i) => (
              <li key={t.title} data-r="" style={d(120 + i * 80)}>
                {ICONS[t.icon]}
                <span>
                  <b>{t.title}</b> {t.body}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
