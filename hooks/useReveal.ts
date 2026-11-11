'use client';
import { useEffect } from 'react';
import { REVEAL_ROOT_MARGIN, REVEAL_THRESHOLD, shouldPreHide } from '@/lib/reveal';

/**
 * Global reveal-on-scroll controller for every `[data-r]` element on the page,
 * including ones mounted later (MutationObserver). The hidden state is only ever
 * added here, and only below the fold, so without JS everything is visible.
 */
export function useReveal(): void {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.remove('pre');
            io.unobserve(e.target);
          }
        }),
      { rootMargin: REVEAL_ROOT_MARGIN, threshold: REVEAL_THRESHOLD },
    );
    const seen = new WeakSet<Element>();
    const consider = (el: Element) => {
      if (seen.has(el)) return;
      seen.add(el);
      if (shouldPreHide(el.getBoundingClientRect().top, window.innerHeight)) {
        el.classList.add('pre');
        io.observe(el);
      }
    };
    const scan = (root: Element | Document) => {
      if (root instanceof Element && root.matches('[data-r]')) consider(root);
      root.querySelectorAll('[data-r]').forEach(consider);
    };
    scan(document);
    const mo = new MutationObserver((records) => {
      for (const r of records) r.addedNodes.forEach((n) => n instanceof Element && scan(n));
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
}
