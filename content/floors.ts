import type { Rich } from './types';

export const wheelCopy = {
  eyebrow: 'Built for every floor',
  title: ['Whatever you ', { em: 'lift' }, ', we run it.'] as Rich,
  lede: "Drag the plate, flick it, or use the arrows. Each kind of floor gets the tools it needs, with nothing it doesn't.",
  label: 'Types of gym floors',
} as const;

export interface Floor {
  title: string;
  description: string;
}

export const floors: readonly Floor[] = [
  { title: 'Strength floor', description: 'Assign programmes, track progress and book coaching slots from one member profile.' },
  { title: 'Boxing & combat', description: 'Cap every class, run a waitlist, and promote the next name the second a spot opens.' },
  { title: 'Yoga & mobility', description: 'Drop-in passes and recurring classes, with instructor availability built right in.' },
  { title: 'Cycling studios', description: 'Fill bars, late-cancel rules and booking windows keep peak hours full and fair.' },
  { title: 'Functional & CrossFit', description: 'Weekly schedules, coach rosters and attendance marking, all in a couple of taps.' },
  { title: 'Recovery & spa', description: 'Rent lockers, sell add-ons at the desk and bill everything on one invoice.' },
];
