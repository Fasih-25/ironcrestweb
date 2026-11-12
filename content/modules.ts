import type { Rich } from './types';

export type ModuleKey =
  | 'subscriptions'
  | 'bookings'
  | 'trainers'
  | 'attendance'
  | 'payments'
  | 'workouts'
  | 'notifications'
  | 'reports'
  | 'lockers'
  | 'shop'
  | 'branches'
  | 'memberapp';

export interface ModuleDef {
  key: ModuleKey;
  name: string;
  hint: string;
  defaultOn: boolean;
  /** Modules this one needs (must match the real product). */
  needs: readonly ModuleKey[];
}

export const coreModules: readonly string[] = ['Dashboard', 'Members', 'Roles & Settings'];

export const modules: readonly ModuleDef[] = [
  { key: 'subscriptions', name: 'Subscriptions & Plans', hint: 'Plans, renewals, freezes', defaultOn: true, needs: [] },
  { key: 'bookings', name: 'Class Booking', hint: 'Schedule and waitlists', defaultOn: true, needs: [] },
  { key: 'trainers', name: 'Trainer Management', hint: 'Coaches and availability', defaultOn: true, needs: [] },
  { key: 'attendance', name: 'Attendance & Check-in', hint: 'QR and live counters', defaultOn: true, needs: [] },
  { key: 'payments', name: 'Payments & Invoices', hint: 'Needs Subscriptions', defaultOn: true, needs: ['subscriptions'] },
  { key: 'workouts', name: 'Workout & Diet Plans', hint: 'Needs Trainers', defaultOn: true, needs: ['trainers'] },
  { key: 'notifications', name: 'Notifications', hint: 'Reminders and receipts', defaultOn: true, needs: [] },
  { key: 'reports', name: 'Reports', hint: 'Revenue and retention', defaultOn: true, needs: [] },
  { key: 'lockers', name: 'Lockers', hint: 'Rental and assignment', defaultOn: false, needs: [] },
  { key: 'shop', name: 'Shop', hint: 'Desk sales and stock', defaultOn: false, needs: [] },
  { key: 'branches', name: 'Multi-branch', hint: 'Many sites, one login', defaultOn: false, needs: [] },
  { key: 'memberapp', name: 'Member App', hint: 'Mobile and web portal', defaultOn: true, needs: [] },
];

/** Sidebar labels in the mini app window (Member App has no sidebar item). */
export const sidebar: ReadonlyArray<readonly [ModuleKey, string]> = [
  ['subscriptions', 'Subscriptions'],
  ['bookings', 'Class Booking'],
  ['trainers', 'Trainers'],
  ['attendance', 'Attendance'],
  ['payments', 'Payments'],
  ['workouts', 'Workout Plans'],
  ['notifications', 'Notifications'],
  ['reports', 'Reports'],
  ['lockers', 'Lockers'],
  ['shop', 'Shop'],
  ['branches', 'Branches'],
];

export const tiles: ReadonlyArray<readonly [ModuleKey, string, string]> = [
  ['subscriptions', 'Plans', '3 active'],
  ['bookings', 'Classes', '14 today'],
  ['attendance', 'Check-ins', '318'],
  ['payments', 'Collected', 'Rs 1.25M'],
  ['trainers', 'Trainers', '6 coaches'],
  ['reports', 'Reports', '7 ready'],
];

export const modulesCopy = {
  eyebrow: 'Configurable by design',
  title: ["Don't need it? ", { em: 'Switch it off.' }] as Rich,
  lede: 'Every gym is different. Turn modules on and off and the menu, the member app and the API follow instantly. The data stays safe, so switching back on brings everything home.',
  alwaysOn: 'Always on',
  reset: 'Reset to defaults',
  windowTitle: 'Module Settings',
  total: 15,
} as const;
