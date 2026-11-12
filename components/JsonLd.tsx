import { SITE_URL, site } from '@/content/site';
import { plans } from '@/content/pricing';

/** SoftwareApplication + Organization structured data (developer-authored constant). */
export function JsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#org`,
        name: site.name,
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}/icon.svg`,
        slogan: site.tagline,
      },
      {
        '@type': 'SoftwareApplication',
        name: site.name,
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Gym management software',
        operatingSystem: 'Web, iOS, Android',
        description: site.description,
        url: `${SITE_URL}/`,
        publisher: { '@id': `${SITE_URL}/#org` },
        offers: plans
          .filter((p) => p.monthly != null)
          .map((p) => ({ '@type': 'Offer', name: p.name, price: p.monthly, priceCurrency: 'PKR', url: `${SITE_URL}/#pricing` })),
      },
    ],
  };
  // JSON-LD is a non-executable data block. `<` is escaped so the content can never close the tag.
  // Prompt §8 allows dangerouslySetInnerHTML only for developer-authored constants; this is one (DECISIONS S6).
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
