import type { NavLink, Rich } from './types';

export const site = {
  name: 'Ironcrest',
  wordmark: 'IRONCREST',
  title: 'Ironcrest — gym management software',
  description:
    'Memberships, bookings, trainers, QR check-ins and payments in a single, beautiful workspace. Built for gyms that want to feel as premium as they train.',
  tagline: 'The royal command centre for modern gyms.',
} as const;

export const nav: readonly NavLink[] = [
  { label: 'Floors', href: '#wheel' },
  { label: 'Platform', href: '#platform' },
  { label: 'Modules', href: '#modules' },
  { label: 'Screens', href: '#screens' },
  { label: 'Member app', href: '#app' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export const demoCta = { label: 'Book a demo', href: '#demo' } as const satisfies NavLink;

export const hero = {
  badge: { tag: 'New', text: 'Every module switches on or off, per gym' },
  lines: [
    ['Every member.'],
    ['Every class.'],
    ['One ', { em: 'command' }, ' centre.'],
  ] as readonly Rich[],
  lede: 'Memberships, bookings, trainers, QR check-ins and payments in a single, beautiful workspace. Built for gyms that want to feel as premium as they train.',
  primary: { label: 'Book a live demo', href: '#demo' },
  secondary: { label: 'Tour every screen', href: '#screens' },
  chips: {
    checkins: { label: 'Check-ins today', value: '318' },
    revenue: { label: 'Revenue this month', value: 'Rs 1.25M' },
    module: { label: 'Trainers module', value: 'Switched on' },
  },
} as const;

export const marqueeWords: readonly string[] = [
  'Members',
  'Classes',
  'Trainers',
  'QR check-in',
  'Payments',
  'Waitlists',
  'Reports',
  'Lockers',
];

export const plateLabels = {
  default: 'IRONCREST  ·  45 KG  ·  IRONCREST  ·  45 KG  ·  IRONCREST  ·  45 KG  ·',
  member: 'MEMBER  ·  PASS  ·  MEMBER  ·  PASS  ·  MEMBER  ·  PASS  ·  MEMBER  ·  PASS  ·',
} as const;
