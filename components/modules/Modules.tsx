import type { CSSProperties } from 'react';
import { modulesCopy } from '@/content/modules';
import { RichText } from '../ui/RichText';
import { ModuleDemo } from './ModuleDemo';
import s from './Modules.module.css';

/** The white "paper band": configurable modules with a live demo. */
export function Modules() {
  return (
    <section className={`sec ${s.paper}`} id="modules" aria-labelledby="modules-title">
      <div className="wrap">
        <p className="eyebrow" data-r="">
          {modulesCopy.eyebrow}
        </p>
        <h2 className={`h2 ${s.h2}`} id="modules-title" data-r="" style={{ '--d': '80ms' } as CSSProperties}>
          <RichText value={modulesCopy.title} />
        </h2>
        <p className={`lede ${s.lede}`} data-r="" style={{ '--d': '140ms' } as CSSProperties}>
          {modulesCopy.lede}
        </p>
        <ModuleDemo />
      </div>
    </section>
  );
}
