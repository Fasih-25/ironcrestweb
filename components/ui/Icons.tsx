/* Stroke icons copied from the reference markup. All decorative (aria-hidden). */
import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;
const base = { viewBox: '0 0 24 24', fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;

export const Crown = (p: P) => (
  <svg {...base} stroke="#fff" strokeWidth={2} {...p}>
    <path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z" />
  </svg>
);
export const ArrowRight = (p: P) => (
  <svg {...base} stroke="currentColor" strokeWidth={2.2} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const ArrowLeft = (p: P) => (
  <svg {...base} stroke="currentColor" strokeWidth={2.2} {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);
export const Burger = (p: P) => (
  <svg {...base} width={20} height={20} stroke="currentColor" strokeWidth={2} {...p}>
    <path d="M4 8h16M4 16h16" />
  </svg>
);
export const Close = (p: P) => (
  <svg {...base} width={20} height={20} stroke="currentColor" strokeWidth={2} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
export const CheckCircle = (p: P) => (
  <svg {...base} stroke="#fff" strokeWidth={2} {...p}>
    <path d="M9 12l2 2 4-4" />
    <circle cx="12" cy="12" r="9" />
  </svg>
);
export const TrendUp = (p: P) => (
  <svg {...base} stroke="#fff" strokeWidth={2} {...p}>
    <path d="M3 17l5-5 4 4 8-9" />
  </svg>
);
export const PlateGlyph = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden {...p}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3.2" fill="currentColor" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
  </svg>
);
