import type { Rich } from './types';

export const ctaCopy = {
  eyebrow: 'See it on your floor',
  title: ['Open the ', { em: 'doors.' }] as Rich,
  lede: "Book a 30-minute walk-through. We'll set up a demo gym with your plans, your classes and your colours.",
  fields: { name: 'Your name', gym: 'Gym name', email: 'Email', phone: 'Phone (optional)' },
  submit: 'Book demo',
  sending: 'Sending…',
  summaryError: 'Please add your name, gym and a valid email.',
  networkError: "We couldn't send that just now. Please try again in a minute.",
  rateLimited: 'Too many requests from this connection. Please try again later.',
  success: (name: string) => `Thanks, ${name}. We'll be in touch within one business day.`,
} as const;

export const footer = {
  columns: [
    {
      title: 'Product',
      links: [
        { label: 'Platform', href: '#platform' },
        { label: 'Modules', href: '#modules' },
        { label: 'Screens', href: '#screens' },
        { label: 'Member app', href: '#app' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'Pricing', href: '#pricing' },
        { label: 'FAQ', href: '#faq' },
        { label: 'Book a demo', href: '#demo' },
      ],
    },
    { title: 'Built for', items: ['Strength floors', 'Boxing and combat', 'Yoga and cycling', 'Multi-branch clubs'] },
  ],
  copyright: '© 2026 Ironcrest. All rights reserved.',
  motto: 'Every member. Every class. One command centre.',
} as const;
