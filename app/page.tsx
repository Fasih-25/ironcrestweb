import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Loader } from '@/components/Loader';
import { Marquee } from '@/components/Marquee';
import { Plate } from '@/components/Plate';

export default function Home() {
  return (
    <>
      <Loader plate={<Plate id="pp-loader" />} />
      <Header />
      <main id="top">
        <Hero />
        <Marquee />
        {/* S2: Plate Wheel · S3: Story, stats, modules · S4: Reel, app, pricing, FAQ, CTA */}
      </main>
    </>
  );
}
