'use client';
import { useReveal } from '@/hooks/useReveal';
import { useParallax } from '@/hooks/useParallax';
import { useMagnetic } from './Magnetic';
import { useTilt } from './Tilt';
import { Cursor } from './Cursor';

/**
 * Mounts the page-wide motion controllers once: reveal-on-scroll, `data-par` parallax,
 * magnetic buttons, tilt cards and the custom cursor. Sections stay server components
 * and opt in with data attributes.
 */
export function MotionRoot() {
  useReveal();
  useParallax();
  useMagnetic();
  useTilt();
  return <Cursor />;
}
