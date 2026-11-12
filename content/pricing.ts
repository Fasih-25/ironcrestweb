/**
 * Plans and prices. PLACEHOLDERS: edit freely; components read everything from here.
 * `monthly` is the monthly price in rupees; annual billing shows monthly × ANNUAL_FACTOR.
 * `monthly: null` renders `customPrice` instead (no toggle maths).
 */
import type { Rich } from './types';

export const ANNUAL_FACTOR = 0.83;
export const CURRENCY_PREFIX = 'Rs ';

export interface Plan {
  id: string;
  kicker: string;
  name: string;
  monthly: number | null;
  customPrice?: string;
  features: readonly string[];
  cta: { label: string; href: string; variant: 'red' | 'ghost' };
  highlighted?: boolean;
  tag?: string;
}

export const pricingCopy = {
  eyebrow: 'Plans',
  title: ['Pick your ', { em: 'weight.' }] as Rich,
  monthly: 'Monthly',
  annual: 'Annual · save 17%',
  perMonth: '/ month',
  perMonthYearly: '/ month, billed yearly',
  billingLabel: 'Billing period',
  defaultAnnual: true,
} as const;

export const plans: readonly Plan[] = [
  {
    id: 'studio',
    kicker: 'For studios',
    name: 'Studio',
    monthly: 14900,
    features: [
      'Up to 300 active members',
      '1 branch, unlimited staff logins',
      'Members, Subscriptions, Class Booking',
      'Attendance with QR check-in',
      'Payments and invoices',
      'Member app',
    ],
    cta: { label: 'Start with Studio', href: '#demo', variant: 'ghost' },
  },
  {
    id: 'club',
    kicker: 'For serious clubs',
    name: 'Club',
    monthly: 34900,
    highlighted: true,
    tag: 'Most chosen',
    features: [
      'Up to 1,500 active members',
      'Everything in Studio',
      'Trainers, Workout & Diet Plans',
      'Notifications and Reports',
      'Lockers and Shop',
      'Your colours and logo',
    ],
    cta: { label: 'Choose Club', href: '#demo', variant: 'red' },
  },
  {
    id: 'chain',
    kicker: 'For groups',
    name: 'Chain',
    monthly: null,
    customPrice: "Let's talk",
    features: [
      'Unlimited members and branches',
      'Everything in Club',
      'Multi-branch reporting and access rules',
      'Enforced multi-factor sign-in',
      'Audit log and data export',
      'Priority support',
    ],
    cta: { label: 'Talk to us', href: '#demo', variant: 'ghost' },
  },
];
