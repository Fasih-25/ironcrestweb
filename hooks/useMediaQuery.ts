'use client';
import { useSyncExternalStore } from 'react';

export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

export const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
export const POINTER_FINE = '(hover: hover) and (pointer: fine)';

/** Non-hook check for code that runs inside event handlers or loops. */
export function matches(query: string): boolean {
  return typeof window !== 'undefined' && window.matchMedia(query).matches;
}
