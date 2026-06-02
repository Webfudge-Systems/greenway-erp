import { ACCOUNTS_SITE } from '../../lib/site';

export const metadata = {
  title: 'Sign in',
  description: `Sign in to ${ACCOUNTS_SITE.name} to manage your organization.`,
  alternates: {
    canonical: '/login',
  },
  openGraph: {
    title: `Sign in | ${ACCOUNTS_SITE.name}`,
    description: ACCOUNTS_SITE.tagline,
    url: `${ACCOUNTS_SITE.url}/login`,
  },
  robots: {
    index: true,
    follow: false,
  },
};

export default function LoginLayout({ children }) {
  return children;
}
