import type { HTMLAttributes } from 'react';

/** Small uppercase red label preceded by a 34×2 rule. */
export function Eyebrow({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={['eyebrow', className ?? ''].join(' ').trim()} {...rest} />;
}
