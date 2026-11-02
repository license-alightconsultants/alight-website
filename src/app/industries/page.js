import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import FinalCta from '@/components/home/FinalCta';
import Icon from '@/components/ui/Icon';
import { Stagger, StaggerItem } from '@/components/ui/Reveal';
import { getIndustries } from '@/lib/content';
import Section from '@/components/ui/Section';
import { ctaProps, getPage, heroProps, pageMetadata } from '@/lib/pages';


export const revalidate = 300;

export const generateMetadata = () => pageMetadata('industries');

export default async function IndustriesPage() {
  const [industries, c] = await Promise.all([getIndustries(), getPage('industries')]);
  return (
    <>
      <PageHero icon="Landmark" layers={['Government', 'Enterprise', 'Citizens']} {...heroProps(c)} crumbs={[{ label: 'Industries', href: '/industries' }]} />
      <Section bg={c['list.bg']} fallback="bg-white" className="py-24">
        <Stagger className="container grid gap-px overflow-hidden rounded-[2rem] bg-navy-900/10 md:grid-cols-2 lg:grid-cols-3">
          {industries.map((ind) => (
            <StaggerItem key={ind.slug} className="bg-white">
              <Link href={`/industries/${ind.slug}`} className="group relative flex h-full min-h-[300px] flex-col overflow-hidden p-10 transition duration-500 hover:bg-navy-900">
                <Icon name={ind.icon} className="h-8 w-8 text-crimson-600" />
                <h2 className="mt-8 text-2xl font-bold transition group-hover:text-white">{ind.name}</h2>
                <p className="mt-3 flex-1 text-slate transition group-hover:text-white/65">{ind.headline}</p>
                <span className="mt-8 inline-flex items-center gap-1 text-sm font-semibold text-navy-900 transition group-hover:text-crimson-400">Explore <ArrowUpRight className="h-4 w-4" /></span>
                <Icon name={ind.icon} className="absolute -bottom-8 -right-8 h-40 w-40 text-navy-900/[0.03] transition group-hover:text-white/[0.05]" />
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>
      {c['cta.show'] && <FinalCta {...ctaProps(c)} />}
    </>
  );
}
