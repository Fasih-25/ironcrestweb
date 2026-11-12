import { ANNUAL_FACTOR, CURRENCY_PREFIX } from '@/content/pricing';

export type Billing = 'monthly' | 'annual';

/** Monthly-equivalent price for the billing period, rounded to whole rupees. */
export function priceFor(monthly: number, billing: Billing, factor = ANNUAL_FACTOR): number {
  return Math.round(billing === 'annual' ? monthly * factor : monthly);
}

/** "Rs 12,367" — en-US grouping, as in the reference. */
export function formatPrice(n: number, prefix = CURRENCY_PREFIX): string {
  return prefix + Math.round(n).toLocaleString('en-US');
}
