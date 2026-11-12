import type { CSSProperties } from 'react';
import { stats } from '@/content/steps';
import { Counter } from './ui/Counter';
import s from './Stats.module.css';

export function Stats() {
  return (
    <section className={`wrap ${s.wrap}`} aria-label="Ironcrest in numbers" data-testid="stats">
      <div className={s.stats}>
        {stats.map((st, i) => (
          <div key={st.label} className={s.stat} data-r="" style={{ '--d': `${i * 100}ms` } as CSSProperties}>
            <b>
              <Counter value={st.value} />
              {st.suffix ? <sup>{st.suffix}</sup> : null}
            </b>
            <span>{st.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
