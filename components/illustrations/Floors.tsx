/* The six wheel-card scenes, ported 1:1 from the reference SCENES (400×500, duotone red/white).
   Class names `lyr`, `sway`, `spin`, `steam` are styled by components/wheel/Wheel.module.css. */
import type { CSSProperties, ReactNode } from 'react';

const R_ = '#C21A2A';
const W_ = '#F5F1F0';
const DISPLAY: CSSProperties = { fontFamily: 'var(--display)' };

function Lyr({ depth, children, ...rest }: { depth: number; children: ReactNode } & React.SVGProps<SVGGElement>) {
  return (
    <g className="lyr" style={{ "--d": depth } as CSSProperties} {...rest}>
      {children}
    </g>
  );
}

function Bg({ n }: { n: number }) {
  return (
    <>
      <defs>
        <linearGradient id={`bg${n}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a0a14" />
          <stop offset=".6" stopColor="#1a0508" />
          <stop offset="1" stopColor="#0A0A0A" />
        </linearGradient>
      </defs>
      <rect width="400" height="500" fill={`url(#bg${n})`} />
    </>
  );
}

function Ghost({ s }: { s: string }) {
  return (
    <text x="-6" y="150" style={DISPLAY} fontWeight="800" fontSize="190" fill="none" stroke="#fff" strokeOpacity=".08" strokeWidth="2">
      {s}
    </text>
  );
}

function Spokes({ cx, cy, r, k }: { cx: number; cy: number; r: number; k: number }) {
  return (
    <>
      {Array.from({ length: k }, (_, i) => {
        const a = (i * Math.PI * 2) / k;
        return <line key={i} x1={cx} y1={cy} x2={(cx + Math.cos(a) * r).toFixed(1)} y2={(cy + Math.sin(a) * r).toFixed(1)} />;
      })}
    </>
  );
}

export function Floor1({ n = 0 }: { n?: number }) {
  return (
    <>
      <Bg n={n} />
      <Ghost s="01" />
      <Lyr depth={6}>
        <circle cx="200" cy="205" r="150" fill="#A91421" />
        <circle cx="200" cy="205" r="118" fill="none" stroke="#0A0A0A" strokeOpacity=".35" strokeWidth="3" />
        <circle cx="200" cy="205" r="86" fill="none" stroke="#0A0A0A" strokeOpacity=".25" strokeWidth="2" />
        <circle cx="200" cy="205" r="24" fill="#0A0A0A" />
      </Lyr>
      <rect x="0" y="392" width="400" height="108" fill="#0A0A0A" fillOpacity=".6" />
      <Lyr depth={16}>
        <rect x="14" y="330" width="372" height="9" rx="4.5" fill={W_} />
        <rect x="76" y="258" width="26" height="154" rx="7" fill={W_} />
        <rect x="106" y="278" width="20" height="114" rx="6" fill="#E0E0E0" />
        <rect x="130" y="298" width="14" height="74" rx="5" fill={R_} />
        <rect x="298" y="258" width="26" height="154" rx="7" fill={W_} />
        <rect x="274" y="278" width="20" height="114" rx="6" fill="#E0E0E0" />
        <rect x="256" y="298" width="14" height="74" rx="5" fill={R_} />
      </Lyr>
      <g fill={W_} fillOpacity=".5">
        <circle cx="64" cy="440" r="2.5" />
        <circle cx="150" cy="458" r="2" />
        <circle cx="262" cy="446" r="3" />
        <circle cx="338" cy="462" r="2" />
      </g>
    </>
  );
}

export function Floor2({ n = 1 }: { n?: number }) {
  return (
    <>
      <Bg n={n} />
      <Ghost s="02" />
      <defs>
        <linearGradient id={`bag${n}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#E5283A" />
          <stop offset="1" stopColor="#650A15" />
        </linearGradient>
      </defs>
      <path d="M-10 404 L410 360 M-10 436 L410 392 M-10 468 L410 424" stroke={R_} strokeWidth="5" opacity=".9" />
      <Lyr depth={12}>
        <g className="sway">
          <path d="M200 -6 V80" stroke={W_} strokeWidth="6" strokeDasharray="10 6" />
          <rect x="138" y="80" width="124" height="272" rx="48" fill={`url(#bag${n})`} />
          <rect x="138" y="132" width="124" height="14" fill="#0A0A0A" fillOpacity=".45" />
          <rect x="138" y="288" width="124" height="14" fill="#0A0A0A" fillOpacity=".45" />
          <rect x="156" y="98" width="14" height="236" rx="7" fill="#fff" fillOpacity=".22" />
        </g>
      </Lyr>
      <Lyr depth={20} stroke={W_} strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M290 186 L334 156" />
        <path d="M298 214 L352 214" />
        <path d="M290 242 L334 272" />
        <circle cx="292" cy="214" r="36" strokeWidth="3" strokeDasharray="4 9" />
      </Lyr>
    </>
  );
}

export function Floor3({ n = 2 }: { n?: number }) {
  return (
    <>
      <Bg n={n} />
      <Ghost s="03" />
      <Lyr depth={6}>
        <circle cx="200" cy="210" r="124" fill="#A91421" />
        <circle cx="200" cy="210" r="158" fill="none" stroke={R_} strokeOpacity=".5" strokeWidth="2" />
        <circle cx="200" cy="210" r="192" fill="none" stroke={R_} strokeOpacity=".25" strokeWidth="2" />
      </Lyr>
      <g fill="#0A0A0A">
        <rect x="60" y="262" width="280" height="6" />
        <rect x="60" y="280" width="280" height="9" />
        <rect x="60" y="300" width="280" height="12" />
        <rect x="60" y="324" width="280" height="15" />
      </g>
      <rect x="0" y="354" width="400" height="146" fill="#0A0A0A" />
      <Lyr depth={14} fill={W_}>
        <circle cx="200" cy="236" r="17" />
        <path d="M178 262 Q200 250 222 262 L230 322 L170 322Z" />
        <path d="M178 266 L150 326 L166 330 L186 294Z" />
        <path d="M222 266 L250 326 L234 330 L214 294Z" />
        <path d="M108 346 Q200 304 292 346 Q200 372 108 346Z" />
      </Lyr>
    </>
  );
}

function BikeWheel({ cx }: { cx: number }) {
  return (
    <g className="spin">
      <circle cx={cx} cy="330" r="84" stroke={R_} strokeWidth="10" />
      <circle cx={cx} cy="330" r="76" stroke={W_} strokeWidth="2" />
      <g stroke={W_} strokeWidth="1.6">
        <Spokes cx={cx} cy={330} r={76} k={18} />
      </g>
    </g>
  );
}

export function Floor4({ n = 3 }: { n?: number }) {
  return (
    <>
      <Bg n={n} />
      <Ghost s="04" />
      <Lyr depth={6}>
        <circle cx="200" cy="190" r="140" fill="#A91421" />
      </Lyr>
      <g stroke={W_} strokeWidth="3" strokeLinecap="round" opacity=".55">
        <path d="M16 160 H86" />
        <path d="M34 190 H100" />
        <path d="M10 220 H70" />
      </g>
      <Lyr depth={14} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <BikeWheel cx={104} />
        <BikeWheel cx={296} />
        <path
          d="M104 330 L206 330 L176 226 Z M176 226 L268 226 L206 330 M268 226 L296 330 M268 226 L262 202 L288 198"
          stroke={W_}
          strokeWidth="7"
        />
        <path d="M156 218 H198" stroke={W_} strokeWidth="9" />
        <circle cx="206" cy="330" r="16" stroke={R_} strokeWidth="5" />
        <circle cx="104" cy="330" r="7" fill={W_} />
        <circle cx="296" cy="330" r="7" fill={W_} />
      </Lyr>
    </>
  );
}

export function Floor5({ n = 4 }: { n?: number }) {
  return (
    <>
      <Bg n={n} />
      <Ghost s="05" />
      <g fill={W_}>
        <rect x="236" y="290" width="124" height="124" fillOpacity=".95" />
      </g>
      <rect x="252" y="306" width="92" height="92" fill="none" stroke="#0A0A0A" strokeWidth="3" opacity=".5" />
      <Lyr depth={14}>
        <path d="M150 262 C146 176 254 176 250 262" fill="none" stroke={W_} strokeWidth="24" strokeLinecap="round" />
        <circle cx="196" cy="326" r="88" fill="#A91421" />
        <path d="M130 300 A74 74 0 0 1 180 252" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="10" strokeLinecap="round" />
        <text x="196" y="344" textAnchor="middle" style={DISPLAY} fontWeight="700" fontSize="54" fill="#0A0A0A" fillOpacity=".8">
          24
        </text>
      </Lyr>
      <path
        d="M-10 458 C 36 424 82 492 128 458 S 220 424 266 458 S 358 492 410 458"
        fill="none"
        stroke={R_}
        strokeWidth="12"
        strokeLinecap="round"
      />
      <g fill={W_} fillOpacity=".5">
        <circle cx="60" cy="96" r="2.5" />
        <circle cx="330" cy="120" r="2" />
        <circle cx="90" cy="170" r="2" />
      </g>
    </>
  );
}

export function Floor6({ n = 5 }: { n?: number }) {
  return (
    <>
      <Bg n={n} />
      <Ghost s="06" />
      <defs>
        <radialGradient id={`hg${n}`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#E5283A" stopOpacity=".85" />
          <stop offset="1" stopColor="#E5283A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g stroke="#650A15" strokeWidth="10" opacity=".55">
        {Array.from({ length: 15 }, (_, i) => (
          <line key={i} x1={i * 28 + 8} y1="0" x2={i * 28 + 8} y2="500" />
        ))}
      </g>
      <circle cx="200" cy="400" r="190" fill={`url(#hg${n})`} />
      <Lyr depth={10} fill="none" stroke={W_} strokeWidth="6" strokeLinecap="round" opacity=".75">
        <path className="steam" d="M150 350 C128 310 172 290 150 250 C128 210 172 190 150 150" />
        <path className="steam" style={{ animationDelay: '-.7s' }} d="M200 340 C178 300 222 280 200 240 C178 200 222 180 200 140" />
        <path className="steam" style={{ animationDelay: '-1.4s' }} d="M250 350 C228 310 272 290 250 250 C228 210 272 190 250 150" />
      </Lyr>
      <Lyr depth={18}>
        <ellipse cx="200" cy="432" rx="96" ry="28" fill="#1D1D1D" />
        <ellipse cx="200" cy="402" rx="70" ry="23" fill="#2b2b2b" />
        <ellipse cx="200" cy="378" rx="44" ry="18" fill="#3b3b3b" />
        <ellipse cx="190" cy="372" rx="16" ry="5" fill="#fff" fillOpacity=".15" />
      </Lyr>
      <text x="200" y="104" textAnchor="middle" style={DISPLAY} fontWeight="700" fontSize="64" fill={W_}>
        85°
      </text>
    </>
  );
}

export const FLOOR_SCENES = [Floor1, Floor2, Floor3, Floor4, Floor5, Floor6] as const;
