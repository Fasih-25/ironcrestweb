import type { ReactNode } from 'react';
import { SHOW_REAL_UI, screens, type ScreenKey } from '@/content/media';

interface UiShotProps {
  screen: ScreenKey;
  alt: string;
  className?: string;
  priority?: boolean;
  lazy?: boolean;
  /** Makes the placeholder's internal SVG ids unique when a screen appears more than once. */
  uid?: string;
  /** Override the build flag (tests only). */
  real?: boolean;
}

/**
 * A product screen: the real WebP when NEXT_PUBLIC_SHOW_REAL_UI=true, otherwise an
 * illustrated placeholder that shows no real UI (DECISIONS I2).
 */
export function UiShot({ screen, alt, className, priority, lazy, uid = '', real = SHOW_REAL_UI }: UiShotProps) {
  const m = screens[screen];
  if (real) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- pre-optimised WebP, export-friendly (DECISIONS I1)
      <img
        className={className}
        src={m.src}
        alt={alt}
        width={m.width}
        height={m.height}
        fetchPriority={priority ? 'high' : undefined}
        loading={lazy ? 'lazy' : undefined}
        decoding="async"
      />
    );
  }
  return (
    <svg
      className={className}
      viewBox="0 0 1440 900"
      role="img"
      aria-label={`Illustration of the Ironcrest ${m.name} screen`}
      data-placeholder={screen}
      preserveAspectRatio="xMidYMid slice"
    >
      <Placeholder screen={screen} uid={`${screen}${uid}`} />
    </svg>
  );
}

const W = '#F5F1F0';
const R = '#C21A2A';
const RH = '#E5283A';
const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const bar = (x: number, y: number, w: number, h: number, fill: string, o = 1, rx = 6) => (
  <rect key={`${x},${y},${w},${h}`} x={x} y={y} width={w} height={h} rx={rx} fill={fill} fillOpacity={o} />
);
const panel = (x: number, y: number, w: number, h: number, key?: string | number) => (
  <rect key={key} x={x} y={y} width={w} height={h} rx={18} fill="#fff" fillOpacity={0.045} stroke="#fff" strokeOpacity={0.09} />
);

function Placeholder({ screen, uid }: { screen: ScreenKey; uid: string }) {
  if (screen === 'login') {
    return (
      <>
        <rect width="1440" height="900" fill="#0F0F0F" />
        <defs>
          <linearGradient id={`ph-login-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#650A15" />
            <stop offset="1" stopColor="#1a0508" />
          </linearGradient>
        </defs>
        <rect width="720" height="900" fill={`url(#ph-login-${uid})`} />
        {[300, 230, 160, 60].map((r, i) => (
          <circle key={r} cx="360" cy="450" r={r} fill="none" stroke={RH} strokeOpacity={0.15 + i * 0.12} strokeWidth={i === 3 ? 10 : 2} />
        ))}
        {bar(900, 250, 220, 30, W, 0.85)}
        {bar(900, 300, 340, 14, W, 0.3)}
        {range(2).map((i) => (
          <g key={i}>{panel(900, 360 + i * 90, 380, 64)}</g>
        ))}
        {bar(900, 560, 380, 60, R, 1, 30)}
      </>
    );
  }
  const body: Record<Exclude<ScreenKey, 'login'>, ReactNode> = {
    dashboard: (
      <>
        {range(4).map((i) => (
          <g key={i}>
            {panel(270 + i * 290, 110, 268, 120)}
            {bar(296 + i * 290, 136, 90, 10, W, 0.35)}
            {bar(296 + i * 290, 166, 140, 30, W, 0.85)}
            {bar(450 + i * 290, 136, 60, 10, RH, 0.7)}
          </g>
        ))}
        {panel(270, 258, 760, 380)}
        <path d="M300 590 C380 560 420 470 500 500 S640 380 720 420 S860 330 1000 300" fill="none" stroke={RH} strokeWidth={5} />
        <path d="M300 590 C380 560 420 470 500 500 S640 380 720 420 S860 330 1000 300 V620 H300Z" fill={RH} fillOpacity={0.12} />
        {panel(1050, 258, 360, 380)}
        <circle cx="1230" cy="430" r="110" fill="none" stroke="#fff" strokeOpacity={0.1} strokeWidth={34} />
        <circle cx="1230" cy="430" r="110" fill="none" stroke={RH} strokeWidth={34} strokeDasharray="420 700" transform="rotate(-90 1230 430)" />
        {range(3).map((i) => (
          <g key={i}>
            {panel(270, 664 + i * 72, 1140, 58)}
            {bar(296, 686 + i * 72, 220, 14, W, 0.6)}
            {bar(1250, 682 + i * 72, 130, 22, R, 0.8, 11)}
          </g>
        ))}
      </>
    ),
    members: (
      <>
        {range(5).map((i) => bar(270 + i * 150, 110, 132, 40, i === 0 ? R : '#fff', i === 0 ? 1 : 0.07, 20))}
        {range(9).map((i) => (
          <g key={i}>
            {panel(270, 176 + i * 78, 1140, 64)}
            <circle cx="310" cy={208 + i * 78} r="20" fill={i % 3 ? '#3b3b3b' : RH} />
            {bar(346, 196 + i * 78, 200, 12, W, 0.8)}
            {bar(346, 216 + i * 78, 130, 10, W, 0.3)}
            {bar(760, 200 + i * 78, 160, 14, W, 0.35)}
            {bar(1250, 196 + i * 78, 120, 24, i % 4 ? R : '#fff', i % 4 ? 0.8 : 0.15, 12)}
          </g>
        ))}
      </>
    ),
    subscriptions: (
      <>
        {range(3).map((i) => (
          <g key={i}>
            {panel(270 + i * 385, 110, 360, 300)}
            {bar(300 + i * 385, 140, 120, 12, RH, 0.8)}
            {bar(300 + i * 385, 170, 200, 36, W, 0.85)}
            {range(4).map((k) => bar(300 + i * 385, 240 + k * 36, 260 - k * 30, 12, W, 0.3))}
          </g>
        ))}
        {panel(270, 440, 1140, 400)}
        {range(6).map((i) => (
          <g key={i}>
            {bar(310, 480 + i * 58, 160, 14, W, 0.5)}
            {bar(520, 476 + i * 58, 120 + ((i * 173) % 640), 22, RH, 0.35 + i * 0.1, 11)}
          </g>
        ))}
      </>
    ),
    bookings: (
      <>
        {range(7).map((d) => (
          <g key={d}>
            {bar(270 + d * 163, 110, 140, 16, W, 0.5)}
            {range(5).map((s) =>
              (d + s) % 3 === 0 ? null : (
                <g key={s}>
                  {panel(270 + d * 163, 150 + s * 140, 150, 120)}
                  {bar(286 + d * 163, 170 + s * 140, 100, 12, W, 0.75)}
                  {bar(286 + d * 163, 236 + s * 140, 118, 8, '#fff', 0.1, 4)}
                  {bar(286 + d * 163, 236 + s * 140, 30 + ((d * 37 + s * 23) % 88), 8, RH, 0.9, 4)}
                </g>
              ),
            )}
          </g>
        ))}
      </>
    ),
    payments: (
      <>
        {range(3).map((i) => (
          <g key={i}>
            {panel(270 + i * 385, 110, 360, 130)}
            {bar(300 + i * 385, 140, 110, 10, W, 0.35)}
            {bar(300 + i * 385, 170, 180, 34, i === 2 ? RH : W, 0.85)}
          </g>
        ))}
        {range(7).map((i) => (
          <g key={i}>
            {panel(270, 270 + i * 84, 1140, 68)}
            {bar(300, 294 + i * 84, 150, 14, W, 0.7)}
            {bar(520, 294 + i * 84, 220, 14, W, 0.3)}
            {bar(900, 290 + i * 84, 130, 22, W, 0.7)}
            {bar(1250, 288 + i * 84, 120, 26, i % 3 === 1 ? RH : '#fff', i % 3 === 1 ? 0.9 : 0.12, 13)}
          </g>
        ))}
      </>
    ),
  };
  return (
    <>
      <rect width="1440" height="900" fill="#111" />
      <defs>
        <linearGradient id={`ph-side-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A91421" stopOpacity=".28" />
          <stop offset="1" stopColor="#A91421" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="232" height="900" fill={`url(#ph-side-${uid})`} />
      <rect x="231" width="1" height="900" fill="#fff" fillOpacity=".08" />
      {bar(30, 34, 130, 14, W, 0.85)}
      {range(10).map((i) => bar(22, 90 + i * 48, 188, 34, i === 0 ? RH : '#fff', i === 0 ? 0.25 : 0.035, 10))}
      {range(10).map((i) => bar(42, 102 + i * 48, 80 + ((i * 41) % 60), 10, W, i === 0 ? 0.9 : 0.4, 5))}
      {bar(270, 40, 240, 28, W, 0.85)}
      {bar(1270, 34, 140, 42, R, 1, 21)}
      {body[screen]}
    </>
  );
}
