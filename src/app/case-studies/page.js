import PageHero from '@/components/layout/PageHero';
import CaseStudies from '@/components/home/CaseStudies';
import EmptyState from '@/components/ui/EmptyState';
import FinalCta from '@/components/home/FinalCta';
import { getCaseStudies } from '@/lib/content';
import { ctaProps, getPage, heroProps, pageMetadata } from '@/lib/pages';

export const revalidate = 300;
export const generateMetadata = () => pageMetadata('case-studies');

export default async function CaseStudiesPage() {
  const [items, c] = await Promise.all([getCaseStudies(), getPage('case-studies')]);
  return (
    <>
      <PageHero icon="Briefcase" layers={['Challenge', 'Solution', 'Results']} {...heroProps(c)} crumbs={[{ label: 'Case Studies', href: '/case-studies' }]} />
      {items.length ? <CaseStudies items={items} /> : (
        <section className="bg-white py-24"><EmptyState title={c['empty.title']} body={c['empty.body']} cta="Request references" /></section>
      )}
      {c['cta.show'] && <FinalCta {...ctaProps(c)} />}
    </>
  );
}
