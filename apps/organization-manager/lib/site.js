import { WEBFUDGE_BRAND } from '@greenways/config';

const siteUrl = (
  process.env.NEXT_PUBLIC_ORG_MANAGER_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_ORG_MANAGER_APP_URL ||
  process.env.NEXT_PUBLIC_LANDING_APP_URL ||
  process.env.NEXT_PUBLIC_LANDING_URL ||
  'http://localhost:3000'
).replace(/\/$/, '');

/** Site metadata, SEO, and PWA config for the Organization Manager app */
export const ORG_MANAGER_SITE = {
  ...WEBFUDGE_BRAND,
  name: 'Greenways Organization Manager',
  shortName: 'Org Manager',
  legalName: 'Greenway Mobility',
  description:
    'Greenways Organization Manager is the platform super-admin workspace to create, configure, and manage tenant organizations, subscriptions, and access across the Greenway Mobility suite.',
  tagline: 'Create and manage organizations, tenants, and platform access.',
  url: siteUrl,
  locale: 'en_US',
  themeColor: '#F5630F',
  backgroundColor: '#FFFAF7',
  twitterHandle: '@GreenwayMobility',
  keywords: [
    'Greenways Organization Manager',
    'Greenway Mobility',
    'organization management',
    'tenant management',
    'platform administration',
    'multi-tenant SaaS',
    'super admin',
    'organization provisioning',
  ],
};

/** @deprecated Use ORG_MANAGER_SITE */
export const LANDING_SITE = ORG_MANAGER_SITE;

export function orgManagerJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: ORG_MANAGER_SITE.name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: ORG_MANAGER_SITE.description,
    url: ORG_MANAGER_SITE.url,
    image: `${ORG_MANAGER_SITE.url}${ORG_MANAGER_SITE.ogImagePath}`,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      category: 'SaaS',
    },
    publisher: {
      '@type': 'Organization',
      name: ORG_MANAGER_SITE.legalName,
      url: ORG_MANAGER_SITE.url,
    },
  };
}

/** @deprecated Use orgManagerJsonLd */
export function landingJsonLd() {
  return orgManagerJsonLd();
}
