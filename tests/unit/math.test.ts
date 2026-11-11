import { clamp, cubicOut, damp, expoOut, lerp, mod, smoothstep } from '@/lib/math';

describe('math helpers', () => {
  it('clamps and lerps', () => {
    expect(clamp(5, 0, 1)).toBe(1);
    expect(clamp(-5, 0, 1)).toBe(0);
    expect(lerp(10, 20, 0.25)).toBe(12.5);
  });

  it('mod is always positive', () => {
    expect(mod(-1, 6)).toBe(5);
    expect(mod(7, 6)).toBe(1);
    expect(mod(-6.5, 6)).toBeCloseTo(5.5);
  });

  it('smoothstep matches the loader counter curve', () => {
    expect(smoothstep(0)).toBe(0);
    expect(smoothstep(0.5)).toBe(0.5);
    expect(smoothstep(1)).toBe(1);
    expect(smoothstep(2)).toBe(1);
    expect(Math.round(smoothstep(0.25) * 100)).toBe(16);
  });

  it('expoOut matches the stats counter curve and lands exactly on 1', () => {
    expect(expoOut(0)).toBe(0);
    expect(expoOut(1)).toBe(1);
    expect(expoOut(0.5)).toBeCloseTo(1 - 2 ** -5);
    expect(Math.round(15 * expoOut(0.3))).toBe(13);
  });

  it('cubicOut and damp', () => {
    expect(cubicOut(0)).toBe(0);
    expect(cubicOut(1)).toBe(1);
    expect(cubicOut(0.5)).toBe(0.875);
    expect(damp(0.0009, 0)).toBe(0);
    expect(damp(0.0009, 1)).toBeCloseTo(0.9991);
  });
});
