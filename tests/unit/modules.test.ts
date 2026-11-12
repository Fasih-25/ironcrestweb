import { DEFAULTS, countOn, resetModules, toggleModule } from '@/components/modules/moduleRules';

describe('module dependency rules', () => {
  it('defaults: everything on except Lockers, Shop, Multi-branch → 12 / 15', () => {
    expect(DEFAULTS.lockers || DEFAULTS.shop || DEFAULTS.branches).toBe(false);
    expect(countOn(DEFAULTS)).toBe(12);
  });

  it('turning a parent off cascades to its dependants with a note', () => {
    const r = toggleModule(DEFAULTS, 'subscriptions');
    expect(r.state.subscriptions).toBe(false);
    expect(r.state.payments).toBe(false);
    expect(r.note).toBe('Payments & Invoices switched off too. It needs Subscriptions & Plans.');
    expect(countOn(r.state)).toBe(10);
  });

  it('Trainers off also turns Workout & Diet off', () => {
    const r = toggleModule(DEFAULTS, 'trainers');
    expect(r.state.workouts).toBe(false);
    expect(r.note).toBe('Workout & Diet Plans switched off too. It needs Trainer Management.');
  });

  it('turning a dependant on turns its parent on', () => {
    const off = toggleModule(DEFAULTS, 'subscriptions').state;
    const r = toggleModule(off, 'payments');
    expect(r.state.payments).toBe(true);
    expect(r.state.subscriptions).toBe(true);
    expect(r.note).toBe('Subscriptions & Plans switched on too. Payments & Invoices needs it.');
  });

  it('a module with no dependants just says its data is kept', () => {
    const r = toggleModule(DEFAULTS, 'reports');
    expect(r.state.reports).toBe(false);
    expect(r.note).toBe('Reports is off. Its data is kept.');
  });

  it('turning a plain module on has no note', () => {
    const r = toggleModule(DEFAULTS, 'lockers');
    expect(r.state.lockers).toBe(true);
    expect(r.note).toBeNull();
    expect(countOn(r.state)).toBe(13);
  });

  it('turning a dependant off leaves its parent alone', () => {
    const r = toggleModule(DEFAULTS, 'payments');
    expect(r.state.subscriptions).toBe(true);
    expect(r.note).toBe('Payments & Invoices is off. Its data is kept.');
  });

  it('does not mutate the previous state', () => {
    const prev = { ...DEFAULTS };
    toggleModule(prev, 'subscriptions');
    expect(prev).toEqual(DEFAULTS);
  });

  it('reset restores the defaults with a note', () => {
    const r = resetModules();
    expect(r.state).toEqual(DEFAULTS);
    expect(r.note).toBe('Back to the defaults: 12 of 15 modules on.');
  });
});
