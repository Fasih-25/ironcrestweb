export type Consent = 'granted' | 'denied';
export const consentKey = 'ic-consent-v1';

/** Storage can throw (private mode, blocked site data); treat that as "not decided". */
export function readConsent(): Consent | null {
  try {
    const v = window.localStorage.getItem(consentKey);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

export function writeConsent(c: Consent): void {
  try {
    window.localStorage.setItem(consentKey, c);
  } catch {
    /* ignore: the choice still applies for this page view */
  }
}
