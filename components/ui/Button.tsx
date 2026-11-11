import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { ArrowRight } from './Icons';

interface ButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: 'red' | 'ghost';
  magnetic?: boolean;
  arrow?: boolean;
  children: ReactNode;
}

/** Link styled as the reference `.btn` (red gradient or ghost); optional magnetic pull and arrow. */
export function Button({ variant = 'red', magnetic, arrow, className, children, ...rest }: ButtonProps) {
  return (
    <a
      className={['btn', variant === 'red' ? 'btn-red' : 'btn-ghost', className ?? ''].join(' ').trim()}
      data-mag={magnetic ? '' : undefined}
      {...rest}
    >
      {children}
      {arrow ? <ArrowRight /> : null}
    </a>
  );
}
