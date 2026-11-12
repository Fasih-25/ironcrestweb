/**
 * Every real product screenshot on the site goes through this file.
 * NEXT_PUBLIC_SHOW_REAL_UI is read at build time; default is false, which swaps each
 * screen for an illustrated placeholder (components/ui/UiShot.tsx) so the product UI
 * is never exposed. See DECISIONS I2.
 */
export const SHOW_REAL_UI = process.env.NEXT_PUBLIC_SHOW_REAL_UI === 'true';

export type ScreenKey = 'dashboard' | 'login' | 'members' | 'subscriptions' | 'bookings' | 'payments';

export interface ScreenMedia {
  src: string;
  width: number;
  height: number;
  /** Short name used in the placeholder illustration's accessible label. */
  name: string;
}

export const screens: Record<ScreenKey, ScreenMedia> = {
  dashboard: { src: '/img/dashboard.webp', width: 1440, height: 900, name: 'Dashboard' },
  login: { src: '/img/login.webp', width: 1440, height: 900, name: 'Sign-in' },
  members: { src: '/img/members.webp', width: 1440, height: 900, name: 'Members' },
  subscriptions: { src: '/img/subscriptions.webp', width: 1440, height: 900, name: 'Subscriptions' },
  bookings: { src: '/img/bookings.webp', width: 1440, height: 900, name: 'Class booking' },
  payments: { src: '/img/payments.webp', width: 1440, height: 900, name: 'Payments' },
};

export const memberApp: ScreenMedia = { src: '/img/memberapp.webp', width: 780, height: 1688, name: 'Member app' };

/**
 * IP rule (prompt §4.8b): the reel shows EXACTLY these five screens and no others.
 * Never add Trainers, Attendance or Module Settings (QR check-in and the module console
 * are the most distinctive parts of the product). Enforced by tests/unit/content.test.ts.
 */
export const REEL_SCREENS = ['dashboard', 'members', 'subscriptions', 'bookings', 'payments'] as const;
export type ReelScreen = (typeof REEL_SCREENS)[number];

export interface ReelItem {
  screen: ReelScreen;
  title: string;
  caption: string;
  alt: string;
}

export const reel: readonly ReelItem[] = [
  { screen: 'dashboard', title: 'Dashboard', caption: "KPIs, revenue, plan mix, today's classes", alt: 'Dashboard screen' },
  { screen: 'members', title: 'Members', caption: 'Filters, profiles, quick actions', alt: 'Members screen' },
  { screen: 'subscriptions', title: 'Subscriptions', caption: 'Plans, auto-renew, renewal pipeline', alt: 'Subscriptions screen' },
  { screen: 'bookings', title: 'Class booking', caption: 'Schedule, fill bars, booking rules', alt: 'Class booking screen' },
  { screen: 'payments', title: 'Payments', caption: 'Invoices, receipts, record payment', alt: 'Payments screen' },
];

export const reelCopy = { eyebrow: 'Every screen', title: 'Look at all of it.' } as const;
