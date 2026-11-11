import { frameTransform, headerHidden, heroFrame, parallaxOffset, scrollProgress } from '@/lib/hero';
import { shouldPreHide } from '@/lib/reveal';
import { magneticOffset } from '@/components/ui/Magnetic';
import { tiltTransform } from '@/components/ui/Tilt';

describe('hero frame', () => {
  it('starts tilted and small, settles flat after 0.75 viewports', () => {
    const a = heroFrame(0, 900, 0, 0);
    expect(a).toMatchObject({ rotateX: 20, rotateY: 0, scale: 0.93, translateY: 0, sheen: 10 });
    const b = heroFrame(675, 900, 0, 0);
    expect(b).toMatchObject({ rotateX: 0, scale: 1, translateY: -18, sheen: 90 });
    expect(heroFrame(5000, 900, 0, 0)).toEqual(b);
  });

  it('adds pointer tilt of up to 4° yaw and 3° pitch', () => {
    const s = heroFrame(675, 900, 1, 1);
    expect(s.rotateY).toBe(4);
    expect(s.rotateX).toBe(-3);
    expect(frameTransform(s)).toBe('rotateX(-3deg) rotateY(4deg) scale(1) translateY(-18px)');
  });
});

describe('header + progress', () => {
  it('hides only when scrolling down past 400px with the menu closed', () => {
    expect(headerHidden(500, 450, false)).toBe(true);
    expect(headerHidden(390, 300, false)).toBe(false);
    expect(headerHidden(500, 600, false)).toBe(false);
    expect(headerHidden(500, 450, true)).toBe(false);
  });

  it('computes page progress in [0,1]', () => {
    expect(scrollProgress(0, 3000, 1000)).toBe(0);
    expect(scrollProgress(1000, 3000, 1000)).toBe(0.5);
    expect(scrollProgress(2000, 3000, 1000)).toBe(1);
    expect(scrollProgress(10, 800, 1000)).toBe(0);
  });
});

describe('parallax / magnetic / tilt', () => {
  it('parallax is zero when centred, signed by factor otherwise', () => {
    expect(parallaxOffset(400, 100, 900, 0.5)).toBe(0);
    expect(parallaxOffset(900, 100, 900, -0.05)).toBeCloseTo(-25);
  });

  it('magnetic pulls 22% / 30% of the pointer offset', () => {
    const r = { left: 100, top: 100, width: 200, height: 50 };
    expect(magneticOffset(300, 125, r)).toEqual({ x: 22, y: 0 });
    expect(magneticOffset(200, 225, r)).toEqual({ x: 0, y: 30 });
  });

  it('tilt matches the reference: x*8 over [-.5,.5], so ±4° at the edges', () => {
    const r = { left: 0, top: 0, width: 100, height: 100 };
    expect(tiltTransform(100, 50, r)).toBe('perspective(1000px) rotateY(4deg) rotateX(0deg) translateY(-6px)');
    expect(tiltTransform(0, 0, r)).toBe('perspective(1000px) rotateY(-4deg) rotateX(4deg) translateY(-6px)');
  });
});

describe('reveal rule', () => {
  it('only hides elements below 98% of the viewport', () => {
    expect(shouldPreHide(100, 900)).toBe(false);
    expect(shouldPreHide(882, 900)).toBe(false);
    expect(shouldPreHide(883, 900)).toBe(true);
    expect(shouldPreHide(-500, 900)).toBe(false);
  });
});
