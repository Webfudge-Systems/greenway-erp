import { WEBFUDGE_BRAND } from '@greenways/config';

const siteUrl = (process.env.NEXT_PUBLIC_PM_APP_URL || 'http://localhost:3002').replace(/\/$/, '');

export const PM_SITE = {
  ...WEBFUDGE_BRAND,
  productName: 'Fudge ERP',
  /** SEO / metadata product name */
  name: 'Greenways PM',
  shortName: 'Greenways PM',
  legalName: 'Greenway Mobility',
  description:
    'Greenways PM is a modern project management workspace for tracking projects, tasks, teams, messages, and delivery.',
  tagline: 'Projects, tasks, and team delivery in one workspace.',
  url: siteUrl,
  locale: 'en_US',
  themeColor: '#F5630F',
  backgroundColor: '#FFFAF7',
  twitterHandle: '@GreenwayMobility',
  keywords: [
    'Greenways PM',
    'project management',
    'task management',
    'team collaboration',
    'work management',
    'productivity',
    'Greenway Mobility',
  ],
};

export function pmJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: PM_SITE.name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: PM_SITE.description,
    url: PM_SITE.url,
    image: `${PM_SITE.url}${PM_SITE.ogImagePath}`,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      category: 'SaaS',
    },
    publisher: {
      '@type': 'Organization',
      name: PM_SITE.legalName,
      url: PM_SITE.url,
    },
  };
}
