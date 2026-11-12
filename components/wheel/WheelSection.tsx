import { floors, wheelCopy } from '@/content/floors';
import { FLOOR_SCENES } from '../illustrations/Floors';
import { RichText } from '../ui/RichText';
import { Wheel } from './Wheel';
import s from './Wheel.module.css';

/** "Built for every floor" section; the illustrations render on the server and are passed in. */
export function WheelSection() {
  const arts = FLOOR_SCENES.map((Scene, i) => <Scene key={i} n={i} />);
  return (
    <section className={`sec ${s.sec}`} id="wheel" aria-labelledby="wheel-title">
      <div className="wrap">
        <div className={s.head}>
          <div data-r="">
            <p className="eyebrow">{wheelCopy.eyebrow}</p>
            <h2 className="h2" id="wheel-title">
              <RichText value={wheelCopy.title} />
            </h2>
          </div>
          <p className="lede" data-r="" style={{ '--d': '120ms' } as React.CSSProperties}>
            {wheelCopy.lede}
          </p>
        </div>
        <Wheel floors={floors} arts={arts} label={wheelCopy.label} />
      </div>
    </section>
  );
}
