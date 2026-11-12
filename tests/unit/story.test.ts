import { lineFill, pinProgress, stepIndex } from '@/components/story/useScrollProgress';

describe('pinned story maths', () => {
  it('progress runs 0 → 1 across the pinned distance', () => {
    expect(pinProgress(100, 5200, 1000)).toBe(0);
    expect(pinProgress(0, 5200, 1000)).toBe(0);
    expect(pinProgress(-2100, 5200, 1000)).toBe(0.5);
    expect(pinProgress(-4200, 5200, 1000)).toBe(1);
    expect(pinProgress(-9000, 5200, 1000)).toBe(1);
    expect(pinProgress(-10, 800, 1000)).toBe(0);
  });

  it('picks one of four steps, never past the last', () => {
    expect(stepIndex(0, 4)).toBe(0);
    expect(stepIndex(0.249, 4)).toBe(0);
    expect(stepIndex(0.26, 4)).toBe(1);
    expect(stepIndex(0.5, 4)).toBe(1); // floor(0.5 * 4 * .999) = 1
    expect(stepIndex(0.51, 4)).toBe(2);
    expect(stepIndex(1, 4)).toBe(3);
  });

  it('line fill leads slightly and clamps', () => {
    expect(lineFill(0)).toBe(0);
    expect(lineFill(0.5)).toBeCloseTo(0.525);
    expect(lineFill(0.99)).toBe(1);
  });
});
