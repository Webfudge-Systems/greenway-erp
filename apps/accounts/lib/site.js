import { WEBFUDGE_BRAND } from '@greenways/config';

const siteUrl = (process.env.NEXT_PUBLIC_ACCOUNTS_APP_URL || 'http://localhost:3001').replace(/\/$/, '');

export const ACCOUNTS_SITE = {
  ...WEBFUDGE_BRAND,
  /** SEO / metadata product name */
  name: 'Greenway Accounts',
  shortName: 'Accounts',
  legalName: 'Greenway Mobility',
  description:
    'Greenway Accounts is the organization administration workspace for users, roles, teams, security, billing, app access, and audit logs.',
  tagline: 'Manage your organization—users, roles, security, billing, and compliance.',
  url: siteUrl,
  locale: 'en_US',
  themeColor: '#F5630F',
  backgroundColor: '#FFFAF7',
  twitterHandle: '@GreenwayMobility',
  keywords: [
    'Greenway Accounts',
    'organization admin',
    'user management',
    'roles and permissions',
    'RBAC',
    'teams',
    'billing',
    'audit logs',
    'Greenway Mobility',
  ],
};

export function accountsJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: ACCOUNTS_SITE.name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: ACCOUNTS_SITE.description,
    url: ACCOUNTS_SITE.url,
    image: `${ACCOUNTS_SITE.url}${ACCOUNTS_SITE.ogImagePath}`,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      category: 'SaaS',
    },
    publisher: {
      '@type': 'Organization',
      name: ACCOUNTS_SITE.legalName,
      url: ACCOUNTS_SITE.url,
    },
  };
}
