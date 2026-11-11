'use client';
import { POINTER_FINE, useMediaQuery } from './useMediaQuery';

export function usePointerFine(): boolean {
  return useMediaQuery(POINTER_FINE);
}
