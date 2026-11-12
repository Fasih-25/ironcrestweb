'use client';
import { useState } from 'react';
import type { Faq } from '@/content/faq';
import s from './Faq.module.css';

/** One-open-at-a-time accordion; first item open by default. */
export function FaqList({ items }: { items: readonly Faq[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div data-testid="faqs">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q} className={s.q} data-open={isOpen ? '1' : '0'}>
            <h3>
              <button
                type="button"
                id={`faq-q${i}`}
                aria-expanded={isOpen}
                aria-controls={`faq-a${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span>{f.q}</span>
                <i className={s.pm} aria-hidden="true" />
              </button>
            </h3>
            <div className={s.a} id={`faq-a${i}`} role="region" aria-labelledby={`faq-q${i}`} inert={!isOpen}>
              <div>
                <p>{f.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
