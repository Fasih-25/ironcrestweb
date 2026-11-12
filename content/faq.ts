import type { Rich } from './types';

export const faqCopy = {
  eyebrow: 'Questions',
  title: ['Asked at ', { em: 'every demo.' }] as Rich,
} as const;

export interface Faq {
  q: string;
  a: string;
}

export const faqs: readonly Faq[] = [
  {
    q: 'Can we really switch modules off?',
    a: 'Yes. Switch any optional module off and it disappears from the menu, the member app and the API at once. Its data is kept, so switching it back on restores everything. Modules that depend on each other, like Payments and Subscriptions, warn you first.',
  },
  {
    q: "How is our members' data protected?",
    a: "Passwords use Argon2id hashing, admins sign in with multi-factor authentication, and every gym's data is kept strictly apart from every other gym's. Health notes are encrypted and every read is logged. Card numbers never touch our servers.",
  },
  {
    q: 'Which payment methods are supported?',
    a: 'Online cards through Stripe, plus manual entry for cash, bank transfer, card terminal and mobile wallet payments taken at the desk. Local gateways can be added without changing how invoices work.',
  },
  {
    q: 'Can we use our own brand colours?',
    a: 'Pick Royal Red, Neon or your own accent colour. Ironcrest checks contrast for you and chooses dark or light text on buttons so everything stays readable.',
  },
  {
    q: 'Does it work in Urdu?',
    a: "English is the default. Urdu with right-to-left layouts is supported by design, along with your gym's own currency and time zone.",
  },
];
