import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import FinalCta from '@/components/home/FinalCta';
import Icon from '@/components/ui/Icon';
import { Stagger, StaggerItem } from '@/components/ui/Reveal';
import { getServices } from '@/lib/content';
import Section from '@/components/ui/Section';
import { ctaProps, getPage, heroProps, pageMetadata } from '@/lib/pages';


export const revalidate = 300;

export const generateMetadata = () => pageMetadata('services');

export default async function ServicesPage() {
  const services = await getServices();
  const c = await getPage('services', { count: services.length });
  return (
    <>
      <PageHero icon="Workflow" layers={['Strategy', 'Engineering', 'Support']}
        {...heroProps(c)}
        crumbs={[{ label: 'Services', href: '/services' }]}
      />
      <Section bg={c['list.bg']} fallback="bg-white" className="py-24">
        <Stagger className="container divide-y divide-navy-900/10 border-y border-navy-900/10">
          {services.map((s, i) => (
            <StaggerItem key={s.slug}>
              <Link href={`/services/${s.slug}`} className="group grid items-center gap-6 py-10 transition md:grid-cols-[80px_1fr_1.2fr_48px]">
                <span className="font-display text-sm font-bold text-crimson-600">{String(i + 1).padStart(2, '0')}</span>
                <span className="flex items-center gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-surface text-navy-700 transition group-hover:bg-navy-900 group-hover:text-white"><Icon name={s.icon} className="h-5 w-5" /></span>
                  <h2 className="text-2xl font-bold transition group-hover:text-crimson-600">{s.title}</h2>
                </span>
                <p className="text-slate">{s.summary}</p>
                <ArrowUpRight className="hidden h-6 w-6 text-slate transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-crimson-600 md:block" />
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>
      {c['cta.show'] && <FinalCta {...ctaProps(c)} />}
    </>
  );
}
