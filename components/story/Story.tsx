import type { CSSProperties } from 'react';
import { steps, storyCopy } from '@/content/steps';
import { RichText } from '../ui/RichText';
import { UiShot } from '../ui/UiShot';
import { StoryScroll } from './StoryScroll';
import s from './Story.module.css';

/** Pinned scroll story (520vh, sticky 100vh). ≤1000px: a plain list with inline pictures. */
export function Story() {
  return (
    <section className={s.story} id="platform" data-step="0" aria-labelledby="platform-title">
      <div className={s.pin}>
        <div className={`wrap ${s.grid}`}>
          <div>
            <p className="eyebrow" data-r="">
              {storyCopy.eyebrow}
            </p>
            <h2 className={`h2 ${s.h2}`} id="platform-title" data-r="" style={{ '--d': '80ms' } as CSSProperties}>
              <RichText value={storyCopy.title} />
            </h2>
            <ol className={s.steps} data-steps="">
              {steps.map((st, i) => (
                <li key={st.title} className={i === 0 ? s.on : undefined} data-step={i}>
                  <h3>{st.title}</h3>
                  <p>{st.body}</p>
                  <UiShot className={s.inline} screen={st.screen} alt={st.alt} lazy uid="-inline" />
                </li>
              ))}
            </ol>
          </div>
          <div className={s.device} aria-hidden="true">
            <div className={s.glow} />
            {steps.map((st, i) => (
              <div key={st.title} className={`${s.shot} ${i === 0 ? s.on : ''}`} data-shot={i}>
                <UiShot screen={st.screen} alt="" uid="-device" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <StoryScroll sectionId="platform" on={s.on ?? 'on'} past={s.past ?? 'past'} />
    </section>
  );
}
