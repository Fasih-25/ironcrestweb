'use client';
import { useEffect, useState } from 'react';
import { consentKey, readConsent, writeConsent, type Consent } from '@/lib/consent';
import s from './CookieBanner.module.css';

const ANALYTICS_SRC = process.env.NEXT_PUBLIC_ANALYTICS_SRC;

function loadAnalytics() {
  if (!ANALYTICS_SRC || document.querySelector(`script[data-analytics]`)) return;
  const sc = document.createElement('script');
  sc.src = ANALYTICS_SRC;
  sc.async = true;
  sc.defer = true;
  sc.dataset.analytics = '';
  document.head.append(sc);
}

/**
 * Consent banner. Analytics are OFF by default: with no NEXT_PUBLIC_ANALYTICS_SRC there is
 * nothing to consent to, so nothing renders. Nothing loads before "Accept".
 */
export function CookieBanner() {
  const [consent, setConsent] = useState<Consent | 'unknown' | 'pending'>('pending');

  useEffect(() => {
    if (!ANALYTICS_SRC) return;
    const c = readConsent();
    // reading browser storage must happen after hydration
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsent(c ?? 'unknown');
    if (c === 'granted') loadAnalytics();
  }, []);

  if (!ANALYTICS_SRC || consent !== 'unknown') return null;

  const choose = (c: Consent) => {
    writeConsent(c);
    setConsent(c);
    if (c === 'granted') loadAnalytics();
  };

  return (
    <div className={s.banner} role="region" aria-label="Cookie consent" data-testid="cookie-banner" data-key={consentKey}>
      <p>We use privacy-friendly analytics to see which parts of this page help. Nothing is tracked unless you accept.</p>
      <div className={s.actions}>
        <button type="button" className="btn btn-ghost" onClick={() => choose('denied')}>
          Decline
        </button>
        <button type="button" className="btn btn-red" onClick={() => choose('granted')}>
          Accept
        </button>
      </div>
    </div>
  );
}
