import { PM_SITE } from '../lib/site';

/** Private SaaS workspace — block indexing of authenticated app surfaces. */
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
    sitemap: `${PM_SITE.url}/sitemap.xml`,
    host: PM_SITE.url,
  };
}
