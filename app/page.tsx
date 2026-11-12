import { AppSection } from '@/components/AppSection';
import { Cta } from '@/components/Cta';
import { Faq } from '@/components/Faq';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { JsonLd } from '@/components/JsonLd';
import { Hero } from '@/components/Hero';
import { Loader } from '@/components/Loader';
import { Marquee } from '@/components/Marquee';
import { Plate } from '@/components/Plate';
import { Pricing } from '@/components/Pricing';
import { Stats } from '@/components/Stats';
import { Modules } from '@/components/modules/Modules';
import { Reel } from '@/components/reel/Reel';
import { Story } from '@/components/story/Story';
import { WheelSection } from '@/components/wheel/WheelSection';

export default function Home() {
  return (
    <>
      <Loader plate={<Plate id="pp-loader" />} />
      <Header />
      <main id="top">
        <Hero />
        <Marquee />
        <WheelSection />
        <Story />
        <Stats />
        <Modules />
        <Reel />
        <AppSection />
        <Pricing />
        <Faq />
        <Cta />
      </main>
      <Footer />
      <JsonLd />
    </>
  );
}
