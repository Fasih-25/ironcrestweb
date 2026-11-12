import { coreModules, modules, type ModuleDef, type ModuleKey } from '@/content/modules';

export type ModuleState = Record<ModuleKey, boolean>;

export const DEFAULTS: ModuleState = Object.fromEntries(modules.map((m) => [m.key, m.defaultOn])) as ModuleState;

const byKey = (k: ModuleKey): ModuleDef => modules.find((m) => m.key === k)!;

export interface ToggleResult {
  state: ModuleState;
  /** The note to show (the reference shows the last one raised), or null. */
  note: string | null;
}

/**
 * Toggle a module, applying the dependency rules exactly as the reference does:
 * - off: every dependant that is on goes off too ("X switched off too. It needs Y.");
 *   a module with no dependants affected says "Y is off. Its data is kept."
 * - on: every parent that is off goes on too ("X switched on too. Y needs it.").
 */
export function toggleModule(prev: ModuleState, key: ModuleKey, defs: readonly ModuleDef[] = modules): ToggleResult {
  const state: ModuleState = { ...prev, [key]: !prev[key] };
  const m = byKey(key);
  let note: string | null = null;
  if (!state[key]) {
    for (const o of defs) {
      if (o.needs.includes(key) && state[o.key]) {
        state[o.key] = false;
        note = `${o.name} switched off too. It needs ${m.name}.`;
      }
    }
    if (!defs.some((o) => o.needs.includes(key) && !state[o.key])) note = `${m.name} is off. Its data is kept.`;
  } else {
    for (const p of m.needs) {
      if (!state[p]) {
        state[p] = true;
        note = `${byKey(p).name} switched on too. ${m.name} needs it.`;
      }
    }
  }
  return { state, note };
}

export function resetModules(): ToggleResult {
  return { state: { ...DEFAULTS }, note: `Back to the defaults: ${countOn(DEFAULTS)} of ${coreModules.length + modules.length} modules on.` };
}

/** Modules on, including the always-on core. */
export function countOn(state: ModuleState): number {
  return coreModules.length + modules.filter((m) => state[m.key]).length;
}

export const NOTE_MS = 3400;
