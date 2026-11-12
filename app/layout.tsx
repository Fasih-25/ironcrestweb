import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { headers } from 'next/headers';
import { Manrope, Playfair_Display } from 'next/font/google';
import { SITE_URL, site } from '@/content/site';
import { MotionRoot } from '@/components/ui/Reveal';
import { CookieBanner } from '@/components/CookieBanner';
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
  metadataBase: new URL(SITE_URL),
  title: site.title,
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: site.name,
    title: site.title,
    description: site.description,
    locale: 'en_GB',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Ironcrest: Every member. Every class. One command centre.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.title,
    description: site.description,
    images: ['/og.png'],
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  colorScheme: 'dark',
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
};

const STATIC_EXPORT = process.env.BUILD_TARGET === 'export';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Node hosting: per-request CSP nonce from proxy.ts. Static export: hashed by scripts/postexport.mjs.
  const nonce = STATIC_EXPORT ? undefined : ((await headers()).get('x-nonce') ?? undefined);
  return (
    <html lang="en" className={`${playfair.variable} ${manrope.variable}`} suppressHydrationWarning>
      <body>
        {/* Same as the reference head script: enables the JS-only hidden states (DECISIONS M3/M4). */}
        <Script id="js-flag" strategy="beforeInteractive" nonce={nonce}>
          {`document.documentElement.classList.add('js')`}
        </Script>
        <a className="skip" href="#top">
          Skip to content
        </a>
        {children}
        <MotionRoot />
        <CookieBanner />
      </body>
    </html>
  );
}
