import PageHero from '@/components/layout/PageHero';
import TechEcosystem from '@/components/home/TechEcosystem';
import FinalCta from '@/components/home/FinalCta';
import Section from '@/components/ui/Section';
import { Stagger, StaggerItem } from '@/components/ui/Reveal';
import { ctaProps, getPage, heroProps, pageMetadata } from '@/lib/pages';
import { parseItems } from '@/lib/pages/registry';

export const revalidate = 300;
export const generateMetadata = () => pageMetadata('technology');

export default async function TechnologyPage() {
  const c = await getPage('technology');
  const principles = parseItems(c['principles.items']);
  return (
    <>
      <PageHero icon="Cpu" layers={['Frontend', 'Backend', 'Data']} {...heroProps(c)} crumbs={[{ label: 'Technology', href: '/technology' }]} />
      <Section bg={c['principles.bg']} fallback="bg-white" className="py-24">
        <Stagger className="container grid gap-6 md:grid-cols-2">
          {principles.map(([t, b], i) => (
            <StaggerItem key={t} className="flex gap-6 rounded-[2rem] bg-surface p-10">
              <span className="font-display text-5xl font-extrabold text-crimson-600/20">{i + 1}</span>
              <div><h2 className="text-2xl font-bold">{t}</h2>{b && <p className="mt-3 text-slate">{b}</p>}</div>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>
      {c['tech.show'] && <TechEcosystem eyebrow={c['tech.eyebrow']} title={c['tech.title']} lead={c['tech.lead']} bg={c['tech.bg']} />}
      {c['cta.show'] && <FinalCta {...ctaProps(c)} />}
    </>
  );
}
