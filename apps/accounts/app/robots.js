import { ACCOUNTS_SITE } from '../lib/site';

/** Private SaaS workspace — block indexing of authenticated app surfaces. */
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
    sitemap: `${ACCOUNTS_SITE.url}/sitemap.xml`,
    host: ACCOUNTS_SITE.url,
  };
}
