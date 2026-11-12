import { reel, reelCopy } from '@/content/media';
import { UiShot } from '../ui/UiShot';
import { ReelScroll } from './ReelScroll';
import s from './Reel.module.css';

/** "Look at all of it." Exactly the five approved screens (IP rule, content/media.ts). */
export function Reel() {
  return (
    <section className={s.reel} id="screens" aria-labelledby="screens-title">
      <div className={s.pin}>
        <div className={`wrap ${s.head}`}>
          <div>
            <p className="eyebrow">{reelCopy.eyebrow}</p>
            <h2 className="h2" id="screens-title">
              {reelCopy.title}
            </h2>
          </div>
          <div className={s.bar} data-bar="" aria-hidden="true" />
        </div>
        <div className={s.track} data-track="" data-testid="reel-track" tabIndex={0} role="region" aria-label="Product screens">
          {reel.map((r) => (
            <figure key={r.screen} className={s.card} data-reel={r.screen}>
              <div className={s.img}>
                <UiShot screen={r.screen} alt={r.alt} lazy uid="-reel" />
              </div>
              <figcaption>
                <b>{r.title}</b>
                <span>{r.caption}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      <ReelScroll sectionId="screens" />
    </section>
  );
}
