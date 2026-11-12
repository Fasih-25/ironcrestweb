'use client';
import { useEffect, useState } from 'react';
import { plans, pricingCopy } from '@/content/pricing';
import { formatPrice, priceFor, type Billing } from '@/lib/pricing';

/**
 * Monthly / Annual segmented control. Prices are server-rendered for the default period;
 * this rewrites the `[data-price]` and `[data-per]` nodes inside `scopeId` when toggled.
 */
export function BillingToggle({ scopeId, className }: { scopeId: string; className?: string }) {
  const [billing, setBilling] = useState<Billing>(pricingCopy.defaultAnnual ? 'annual' : 'monthly');

  useEffect(() => {
    const scope = document.getElementById(scopeId);
    if (!scope) return;
    scope.querySelectorAll<HTMLElement>('[data-price]').forEach((el) => {
      const plan = plans.find((p) => p.id === el.dataset.price);
      if (plan?.monthly != null) el.textContent = formatPrice(priceFor(plan.monthly, billing));
    });
    scope.querySelectorAll<HTMLElement>('[data-per]').forEach((el) => {
      el.textContent = billing === 'annual' ? pricingCopy.perMonthYearly : pricingCopy.perMonth;
    });
  }, [billing, scopeId]);

  return (
    <div className={className} role="group" aria-label={pricingCopy.billingLabel} data-testid="billing">
      <button type="button" aria-pressed={billing === 'monthly'} onClick={() => setBilling('monthly')}>
        {pricingCopy.monthly}
      </button>
      <button type="button" aria-pressed={billing === 'annual'} onClick={() => setBilling('annual')}>
        {pricingCopy.annual}
      </button>
    </div>
  );
}
