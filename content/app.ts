import type { Rich } from './types';

export const appCopy = {
  eyebrow: 'The member app',
  title: ['Their pass. ', { em: 'Their pocket.' }] as Rich,
  lede: 'Members check in, book classes and renew from their phone. Staff scan a code that expires in seconds, so a screenshot is worthless.',
  chip: { label: 'Pass refreshes', value: 'every 60s' },
  phoneAlt: "The Ironcrest member app showing a membership pass with QR code and today's classes",
} as const;

export type TickIcon = 'shield' | 'calendar' | 'card' | 'lock';

export const appTicks: ReadonlyArray<{ icon: TickIcon; title: string; body: string }> = [
  { icon: 'shield', title: 'Rotating QR pass.', body: 'Signed, short-lived and single-use. Works for a moment offline.' },
  { icon: 'calendar', title: 'Book in two taps.', body: 'Waitlists promote automatically and tell the member straight away.' },
  { icon: 'card', title: 'Renew without calling.', body: 'Members see days left and pay from the same screen.' },
  { icon: 'lock', title: 'Face ID and fingerprint.', body: "The pass unlocks with a glance. Tokens live in the phone's secure storage." },
];
