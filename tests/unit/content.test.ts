import { REEL_SCREENS, reel, screens } from '@/content/media';
import { formatPrice, priceFor } from '@/lib/pricing';
import { plans } from '@/content/pricing';
import { faqs } from '@/content/faq';

describe('IP rule: the reel', () => {
  it('shows exactly the five approved screens, in order', () => {
    expect(reel.map((r) => r.screen)).toEqual(['dashboard', 'members', 'subscriptions', 'bookings', 'payments']);
    expect([...REEL_SCREENS]).toEqual(reel.map((r) => r.screen));
  });
  it('no forbidden screens exist anywhere in the media registry', () => {
    const keys = Object.keys(screens).join(' ');
    expect(keys).not.toMatch(/trainer|attendance|module|checkin|check-in|settings/i);
  });
});

describe('price maths', () => {
  it('annual = monthly × 0.83, en-US grouping', () => {
    expect(formatPrice(priceFor(14900, 'annual'))).toBe('Rs 12,367');
    expect(formatPrice(priceFor(34900, 'annual'))).toBe('Rs 28,967');
    expect(formatPrice(priceFor(14900, 'monthly'))).toBe('Rs 14,900');
    expect(formatPrice(priceFor(34900, 'monthly'))).toBe('Rs 34,900');
  });
  it('plans are editable data with one highlighted plan', () => {
    expect(plans).toHaveLength(3);
    expect(plans.filter((p) => p.highlighted)).toHaveLength(1);
    expect(plans.find((p) => p.monthly === null)?.customPrice).toBe("Let's talk");
  });
});

describe('faq', () => {
  it('has five questions', () => expect(faqs).toHaveLength(5));
});
