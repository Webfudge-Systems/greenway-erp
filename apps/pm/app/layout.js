import './globals.css';
import { AuthProvider } from '@greenways/auth';
import LayoutContent from '../components/LayoutContent';
import { PM_SITE, pmJsonLd } from '../lib/site';

export const viewport = {
  themeColor: PM_SITE.themeColor,
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  metadataBase: new URL(PM_SITE.url),
  title: {
    default: PM_SITE.name,
    template: `%s | ${PM_SITE.name}`,
  },
  description: PM_SITE.description,
  applicationName: PM_SITE.name,
  authors: [{ name: PM_SITE.legalName, url: PM_SITE.url }],
  creator: PM_SITE.legalName,
  publisher: PM_SITE.legalName,
  category: 'productivity',
  referrer: 'origin-when-cross-origin',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: PM_SITE.brandShortName,
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  keywords: PM_SITE.keywords,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: PM_SITE.locale,
    url: PM_SITE.url,
    siteName: PM_SITE.name,
    title: PM_SITE.name,
    description: PM_SITE.tagline,
    images: [
      {
        url: PM_SITE.ogImagePath,
        width: 512,
        height: 512,
        alt: `${PM_SITE.brandName} logo`,
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: PM_SITE.name,
    description: PM_SITE.tagline,
    images: [PM_SITE.ogImagePath],
    creator: PM_SITE.twitterHandle,
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
      { url: PM_SITE.faviconPath, type: 'image/svg+xml' },
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [{ url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: [PM_SITE.faviconPath],
  },
  manifest: '/favicon/site.webmanifest',
};

export default function RootLayout({ children }) {
  const jsonLd = pmJsonLd();

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
