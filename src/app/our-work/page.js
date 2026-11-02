import PageHero from '@/components/layout/PageHero';
import ProductExplorer from '@/components/products/ProductExplorer';
import CaseStudies from '@/components/home/CaseStudies';
import Stats from '@/components/home/Stats';
import FinalCta from '@/components/home/FinalCta';
import Section from '@/components/ui/Section';
import Accent from '@/components/ui/Accent';
import { getCaseStudies, getProducts, getStats } from '@/lib/content';
import { ctaProps, getPage, heroProps, pageMetadata } from '@/lib/pages';

export const revalidate = 300;
export const generateMetadata = () => pageMetadata('our-work');

export default async function OurWorkPage() {
  const [products, cases, stats, c] = await Promise.all([getProducts(), getCaseStudies(4), getStats(), getPage('our-work')]);
  return (
    <>
      <PageHero icon="Package" layers={['Products', 'Platforms', 'Outcomes']} {...heroProps(c)} crumbs={[{ label: 'Our Work', href: '/our-work' }]} />
      {c['stats.show'] && <Stats stats={stats} />}
      {c['cases.show'] && <CaseStudies items={cases} />}
      <Section bg={c['platforms.bg']} fallback="bg-surface" className="py-24">
        <div className="container">
          <h2 className="text-display-md font-bold"><Accent text={c['platforms.title']} /></h2>
          <div className="mt-10"><ProductExplorer products={products} /></div>
        </div>
      </Section>
      {c['cta.show'] && <FinalCta {...ctaProps(c)} />}
    </>
  );
}
