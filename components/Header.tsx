'use client';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { demoCta, nav, site } from '@/content/site';
import { onScrollFrame } from '@/lib/motion';
import { headerHidden, scrollProgress } from '@/lib/hero';
import { Burger, Crown } from './ui/Icons';
import s from './Header.module.css';

/** Floating glass header, scroll-progress bar and the ≤1000px overlay menu. */
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(menuOpen);
  const hdr = useRef<HTMLElement>(null);
  const prog = useRef<HTMLDivElement>(null);
  const burger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLElement>(null);

  useEffect(() => {
    menuRef.current = menuOpen;
  }, [menuOpen]);

  useEffect(() => {
    let lastY = window.scrollY;
    return onScrollFrame(() => {
      const y = window.scrollY;
      const H = window.innerHeight;
      prog.current?.style.setProperty('--sp', String(scrollProgress(y, document.documentElement.scrollHeight, H)));
      hdr.current?.toggleAttribute('data-hidden', headerHidden(y, lastY, menuRef.current));
      lastY = y;
    });
  }, []);

  const close = useCallback((focusBurger: boolean) => {
    setMenuOpen(false);
    if (focusBurger) burger.current?.focus();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    menu.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') close(true);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen, close]);

  /** Focus trap: Tab cycles between the burger and the menu links while the menu is open. */
  const trap = (e: KeyboardEvent) => {
    if (!menuOpen || e.key !== 'Tab') return;
    const items: HTMLElement[] = [burger.current, ...Array.from(menu.current?.querySelectorAll<HTMLElement>('a') ?? [])].filter(
      (x): x is HTMLElement => !!x,
    );
    const i = items.indexOf(document.activeElement as HTMLElement);
    const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : i === items.length - 1 ? 0 : i + 1;
    e.preventDefault();
    items[next]?.focus();
  };

  return (
    <>
      <div ref={prog} className={s.prog} data-testid="progress" aria-hidden="true" />
      <header ref={hdr} className={s.hdr} id="hdr" onKeyDown={trap}>
        <div className={s.in}>
          <a className={s.logo} href="#top" aria-label={`${site.name} home`}>
            <i>
              <Crown />
            </i>
            {site.wordmark}
          </a>
          <nav className={s.nav} aria-label="Primary">
            {nav.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className={s.end}>
            <a className={`btn btn-red ${s.cta}`} data-mag="" href={demoCta.href}>
              {demoCta.label}
            </a>
            <button
              ref={burger}
              type="button"
              className={s.burger}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <Burger />
            </button>
          </div>
        </div>
      </header>
      <nav
        ref={menu}
        id="menu"
        className={[s.menu, menuOpen ? s.on : ''].join(' ')}
        aria-label="Mobile"
        hidden={!menuOpen}
        onKeyDown={trap}
        onClick={(e) => {
          if ((e.target as Element).closest('a')) close(false);
        }}
      >
        {nav.map((l) => (
          <a key={l.href} href={l.href}>
            {l.label}
          </a>
        ))}
        <a className={s.menuCta} href={demoCta.href}>
          {demoCta.label}
        </a>
      </nav>
    </>
  );
}
