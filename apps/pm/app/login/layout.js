import { PM_SITE } from '../../lib/site';

export const metadata = {
  title: 'Sign in',
  description: `Sign in to ${PM_SITE.name} to manage projects, tasks, and team delivery.`,
  alternates: {
    canonical: '/login',
  },
  openGraph: {
    title: `Sign in | ${PM_SITE.name}`,
    description: PM_SITE.tagline,
    url: `${PM_SITE.url}/login`,
  },
  robots: {
    index: true,
    follow: false,
  },
};

export default function LoginLayout({ children }) {
  return children;
}
