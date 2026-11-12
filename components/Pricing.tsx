import type { CSSProperties } from 'react';
import { plans, pricingCopy } from '@/content/pricing';
import { formatPrice, priceFor } from '@/lib/pricing';
import { BillingToggle } from './BillingToggle';
import { RichText } from './ui/RichText';
import s from './Pricing.module.css';

const initial = pricingCopy.defaultAnnual ? 'annual' : 'monthly';

export function Pricing() {
  return (
    <section className="sec" id="pricing" style={{ paddingTop: 0 }} aria-labelledby="pricing-title">
      <div className="wrap">
        <div className={s.head}>
          <div data-r="">
            <p className="eyebrow">{pricingCopy.eyebrow}</p>
            <h2 className="h2" id="pricing-title">
              <RichText value={pricingCopy.title} />
            </h2>
          </div>
          <BillingToggle scopeId="pricing" className={s.seg} />
        </div>
        <div className={s.plans}>
          {plans.map((p, i) => (
            <article
              key={p.id}
              className={`${s.plan} ${p.highlighted ? s.hot : ''}`}
              data-r=""
              data-tilt=""
              data-hov=""
              style={i ? ({ '--d': `${i * 120}ms` } as CSSProperties) : undefined}
            >
              {p.tag ? <span className={s.tag}>{p.tag}</span> : null}
              <div>
                <p className={s.nm}>{p.kicker}</p>
                <h3>{p.name}</h3>
              </div>
              <div className={s.price}>
                {p.monthly != null ? (
                  <>
                    <span data-price={p.id}>{formatPrice(priceFor(p.monthly, initial))}</span>
                    <small data-per="">{initial === 'annual' ? pricingCopy.perMonthYearly : pricingCopy.perMonth}</small>
                  </>
                ) : (
                  <span>{p.customPrice}</span>
                )}
              </div>
              <ul>
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <a className={`btn ${p.cta.variant === 'red' ? 'btn-red' : 'btn-ghost'}`} href={p.cta.href}>
                {p.cta.label}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
