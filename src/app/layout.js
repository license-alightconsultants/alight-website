import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Providers from '@/components/layout/Providers';
import ScrollProgress from '@/components/layout/ScrollProgress';
import BackToTop from '@/components/layout/BackToTop';
import PublicOnly from '@/components/layout/PublicOnly';
import JsonLd from '@/components/ui/JsonLd';
import { getNavData } from '@/lib/content';
import { getPublicSettings, toSiteShape } from '@/lib/settings';

const display = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-display', weight: ['500', '600', '700', '800'], display: 'swap' });
const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

// SEO defaults are editable in Admin → Website settings.
export async function generateMetadata() {
  const s = await getPublicSettings();
  const site = toSiteShape(s);
  const title = s['seo.title'];
  const description = s['seo.description'];
  return {
    metadataBase: new URL(site.url),
    title: { default: title, template: `%s | ${site.shortName}` },
    description,
    applicationName: site.shortName,
    alternates: { canonical: '/' },
    openGraph: { type: 'website', siteName: site.name, locale: 'en_IN', url: site.url, title, description },
    twitter: { card: 'summary_large_image', title: site.shortName, description },
  };
}

export const viewport = { themeColor: '#071A36' };

function orgSchema(site) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    url: site.url,
    logo: `${site.url}/assets/logo/alight-logo.svg`,
    email: site.email,
    telephone: site.phone,
    slogan: site.motto,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${site.address.line1}, ${site.address.line2}`,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    sameAs: Object.values(site.social),
  };
}

export default async function RootLayout({ children }) {
  const [settings, nav] = await Promise.all([getPublicSettings(), getNavData()]);
  const site = toSiteShape(settings);

  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <JsonLd data={orgSchema(site)} />
        <Providers>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
            Skip to content
          </a>
          <PublicOnly><ScrollProgress /></PublicOnly>
          <Header nav={nav} site={site} />
          <main id="main">{children}</main>
          <Footer nav={nav} site={site} />
          <PublicOnly><BackToTop /></PublicOnly>
        </Providers>
      </body>
    </html>
  );
}
