import {
  STEP,
  activeIndex,
  cardDelta,
  cardLook,
  chase,
  geometry,
  releaseTarget,
  targetFor,
} from '@/components/wheel/geometry';

describe('wheel geometry', () => {
  it('sizes cards from the stage width with clamps', () => {
    expect(geometry(500).cw).toBe(250);
    expect(geometry(2000).cw).toBe(430);
    const g = geometry(1000);
    expect(g.cw).toBe(340);
    expect(g.ch).toBeCloseTo(435.2);
    expect(g.R).toBeCloseTo(918);
    expect(g.sp).toBeCloseTo(306);
    expect(g.bottom).toBeCloseTo(505.2);
    expect(g.h).toBeCloseTo(755.2);
    expect(g.cy).toBeCloseTo(1423.2);
    expect(g.rp).toBeCloseTo(892);
  });

  it('uses a shorter skirt under 700px', () => {
    const g = geometry(690);
    expect(g.h - g.bottom).toBe(190);
    expect(geometry(700).h - geometry(700).bottom).toBe(250);
  });

  it('step angle is ~18.43° at every width', () => {
    expect(STEP).toBeCloseTo(18.4349, 3);
    for (const w of [320, 700, 1280, 3000]) expect(geometry(w).step).toBeCloseTo(STEP, 10);
  });
});

describe('cardDelta wraps into [-N/2, N/2)', () => {
  for (const n of [3, 4, 5, 6, 7, 8]) {
    it(`N=${n}`, () => {
      for (let r = -20; r <= 20; r += 0.25) {
        for (let i = 0; i < n; i++) {
          const d = cardDelta(i, r, n);
          expect(d).toBeGreaterThanOrEqual(-n / 2);
          expect(d).toBeLessThan(n / 2);
          // d is congruent to i - r modulo n
          const k = (i - r - d) / n;
          expect(Math.abs(k - Math.round(k))).toBeLessThan(1e-9);
        }
      }
    });
  }
  it('examples (N=6)', () => {
    expect(cardDelta(0, 0, 6)).toBe(0);
    expect(cardDelta(1, 0, 6)).toBe(1);
    expect(cardDelta(5, 0, 6)).toBe(-1);
    expect(cardDelta(3, 0, 6)).toBe(-3);
    expect(cardDelta(0, -1, 6)).toBe(1);
    expect(cardDelta(0, 7.5, 6)).toBe(-1.5);
  });
  it('active index handles negative positions', () => {
    expect(activeIndex(-1, 6)).toBe(5);
    expect(activeIndex(-6.4, 6)).toBe(0);
    expect(activeIndex(13.6, 6)).toBe(2);
  });
});

describe('card look', () => {
  it('centre card is full size and brightest', () => {
    expect(cardLook(0)).toEqual({ scale: 1, zIndex: 10, brightness: 1, saturate: 1, visible: true });
  });
  it('neighbours shrink, dim and drop behind; far cards hide', () => {
    const one = cardLook(1);
    expect(one.scale).toBeCloseTo(0.93);
    expect(one.zIndex).toBe(7);
    expect(one.brightness).toBeCloseTo(0.68);
    expect(one.saturate).toBeCloseTo(0.75);
    expect(cardLook(-2).scale).toBeCloseTo(0.88);
    expect(cardLook(2.5).scale).toBeCloseTo(0.855);
    expect(cardLook(2.69).visible).toBe(true);
    expect(cardLook(2.7).visible).toBe(false);
    expect(cardLook(-3).visible).toBe(false);
  });
});

describe('momentum and snap', () => {
  it('release target throws by clamped velocity', () => {
    expect(releaseTarget(0.2, 0)).toBe(0);
    expect(releaseTarget(0.2, 2)).toBe(1);
    expect(releaseTarget(0, 100)).toBe(2); // clamped to 6 → 1.68 → 2
    expect(releaseTarget(0, -100)).toBe(-2);
    expect(releaseTarget(-3.4, -1)).toBe(-4);
  });
  it('chase converges and snaps exactly onto the target', () => {
    let r = 0;
    for (let i = 0; i < 120; i++) r = chase(r, 3, 1 / 60);
    expect(r).toBe(3);
    expect(chase(0, 1, 0)).toBe(0);
    expect(chase(0.9999, 1, 1 / 60)).toBe(1);
  });
  it('chase is frame-rate independent', () => {
    let a = 0;
    let b = 0;
    for (let i = 0; i < 30; i++) a = chase(a, 1, 1 / 30);
    for (let i = 0; i < 60; i++) b = chase(b, 1, 1 / 60);
    expect(a).toBeCloseTo(b, 6);
  });
  it('targetFor takes the shortest way round', () => {
    expect(targetFor(5, 0, 6)).toBe(-1);
    expect(targetFor(1, 0, 6)).toBe(1);
    expect(targetFor(0, 11.2, 6)).toBe(12);
    expect(targetFor(3, -0.2, 6)).toBe(-3);
  });
});
