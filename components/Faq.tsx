import { faqCopy, faqs } from '@/content/faq';
import { FaqList } from './FaqList';
import { RichText } from './ui/RichText';
import s from './Faq.module.css';

export function Faq() {
  return (
    <section className="sec" id="faq" style={{ paddingTop: 0 }} aria-labelledby="faq-title">
      <div className={`wrap ${s.grid}`}>
        <div data-r="">
          <p className="eyebrow">{faqCopy.eyebrow}</p>
          <h2 className="h2" id="faq-title">
            <RichText value={faqCopy.title} />
          </h2>
        </div>
        <FaqList items={faqs} />
      </div>
    </section>
  );
}
