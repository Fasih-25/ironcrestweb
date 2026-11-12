import type { ScreenKey } from './media';
import type { Rich } from './types';

export const storyCopy = {
  eyebrow: 'One platform, start to finish',
  title: ['From the front door to the ', { em: 'bank deposit.' }] as Rich,
} as const;

export interface Step {
  title: string;
  body: string;
  screen: ScreenKey;
  alt: string;
}

export const steps: readonly Step[] = [
  {
    title: 'Sign in as who you are',
    body: 'Admin, staff or member, each lands in the right place. Admins get multi-factor sign-in by default.',
    screen: 'login',
    alt: 'Ironcrest sign-in screen',
  },
  {
    title: 'See the whole day at a glance',
    body: 'Active members, check-ins, revenue and classes today. Plan mix and expiring memberships sit right beside them.',
    screen: 'dashboard',
    alt: 'Dashboard',
  },
  {
    title: 'Run members and plans',
    body: 'Filter, freeze and renew. Pick monthly or annual, switch auto-renew on, and watch the renewal pipeline fill.',
    screen: 'subscriptions',
    alt: 'Subscriptions and plans',
  },
  {
    title: 'Get paid, every time',
    body: 'Record cash, card, bank or wallet payments in seconds. Invoices, receipts and overdue accounts are tracked for you.',
    screen: 'payments',
    alt: 'Payments and invoices',
  },
];

export interface Stat {
  value: number;
  suffix?: string;
  label: string;
}

export const stats: readonly Stat[] = [
  { value: 15, label: 'Modules, 12 of them switchable' },
  { value: 5, label: 'Roles, from owner to member' },
  { value: 60, suffix: 'sec', label: "Life of a QR pass, then it's void" },
  { value: 0, suffix: 'cards', label: 'Card numbers on your servers' },
];
