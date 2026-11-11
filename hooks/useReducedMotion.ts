'use client';
import { REDUCED_MOTION, useMediaQuery } from './useMediaQuery';

export function useReducedMotion(): boolean {
  return useMediaQuery(REDUCED_MOTION);
}
