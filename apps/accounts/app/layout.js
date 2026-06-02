import './globals.css';
import { AuthProvider } from '@greenways/auth';
import LayoutContent from '../components/LayoutContent';
import { ACCOUNTS_SITE, accountsJsonLd } from '../lib/site';

export const viewport = {
  themeColor: ACCOUNTS_SITE.themeColor,
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  metadataBase: new URL(ACCOUNTS_SITE.url),
  title: {
    default: ACCOUNTS_SITE.name,
    template: `%s | ${ACCOUNTS_SITE.name}`,
  },
  description: ACCOUNTS_SITE.description,
  applicationName: ACCOUNTS_SITE.name,
  authors: [{ name: ACCOUNTS_SITE.legalName, url: ACCOUNTS_SITE.url }],
  creator: ACCOUNTS_SITE.legalName,
  publisher: ACCOUNTS_SITE.legalName,
  category: 'productivity',
  referrer: 'origin-when-cross-origin',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: ACCOUNTS_SITE.brandShortName,
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  keywords: ACCOUNTS_SITE.keywords,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: ACCOUNTS_SITE.locale,
    url: ACCOUNTS_SITE.url,
    siteName: ACCOUNTS_SITE.name,
    title: ACCOUNTS_SITE.name,
    description: ACCOUNTS_SITE.tagline,
    images: [
      {
        url: ACCOUNTS_SITE.ogImagePath,
        width: 512,
        height: 512,
        alt: `${ACCOUNTS_SITE.brandName} logo`,
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: ACCOUNTS_SITE.name,
    description: ACCOUNTS_SITE.tagline,
    images: [ACCOUNTS_SITE.ogImagePath],
    creator: ACCOUNTS_SITE.twitterHandle,
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  icons: {
    icon: [
      { url: ACCOUNTS_SITE.faviconPath, type: 'image/svg+xml' },
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [{ url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: [ACCOUNTS_SITE.faviconPath],
  },
  manifest: '/favicon/site.webmanifest',
};

export default function RootLayout({ children }) {
  const jsonLd = accountsJsonLd();

  return (
    <html lang="en">
      <body className="bg-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}
