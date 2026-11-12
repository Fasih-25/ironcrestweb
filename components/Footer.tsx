import { footer } from '@/content/cta';
import { site } from '@/content/site';
import { Crown } from './ui/Icons';
import s from './Footer.module.css';

export function Footer() {
  return (
    <footer className={s.ftr}>
      <div className="wrap">
        <div className={s.grid}>
          <div>
            <a className={s.logo} href="#top" aria-label={`${site.name} home`}>
              <i>
                <Crown />
              </i>
              {site.wordmark}
            </a>
            <p className={s.tagline}>{site.tagline}</p>
          </div>
          {footer.columns.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              {/* h2 for a valid outline; styled as the reference's small h4 label */}
              <h2>{c.title}</h2>
              <ul>
                {'links' in c
                  ? c.links.map((l) => (
                      <li key={l.href}>
                        <a href={l.href}>{l.label}</a>
                      </li>
                    ))
                  : c.items.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </nav>
          ))}
        </div>
        <div className={s.fine}>
          <span>{footer.copyright}</span>
          <span>{footer.motto}</span>
        </div>
      </div>
    </footer>
  );
}
