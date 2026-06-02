import { PM_SITE } from '../lib/site';

/** Minimal sitemap for SaaS app shell (login + public entry points only). */
export default function sitemap() {
  const lastModified = new Date();
  const publicRoutes = ['/', '/login'];

  return publicRoutes.map((path) => ({
    url: `${PM_SITE.url}${path === '/' ? '' : path}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: path === '/login' ? 0.5 : 0.3,
  }));
}
