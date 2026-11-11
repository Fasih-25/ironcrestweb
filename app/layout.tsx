import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Manrope, Playfair_Display } from 'next/font/google';
import { site } from '@/content/site';
import { MotionRoot } from '@/components/ui/Reveal';
import './globals.css';

// Variable fonts, self-hosted at build time (no runtime requests to Google).
const playfair = Playfair_Display({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});
const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
};

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  colorScheme: 'dark',
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${manrope.variable}`} suppressHydrationWarning>
      <body>
        {/* Same as the reference head script: enables the JS-only hidden states (DECISIONS M3/M4). */}
        <Script id="js-flag" strategy="beforeInteractive">
          {`document.documentElement.classList.add('js')`}
        </Script>
        <a className="skip" href="#top">
          Skip to content
        </a>
        {children}
        <MotionRoot />
      </body>
    </html>
  );
}
