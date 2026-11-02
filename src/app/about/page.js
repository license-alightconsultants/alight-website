import PageHero from '@/components/layout/PageHero';
import FinalCta from '@/components/home/FinalCta';
import Stats from '@/components/home/Stats';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';
import { getStats } from '@/lib/content';
import Section from '@/components/ui/Section';
import Accent from '@/components/ui/Accent';
import { ctaProps, getPage, heroProps, pageMetadata } from '@/lib/pages';
import { paragraphs, parseItems, parseLines } from '@/lib/pages/registry';

export const revalidate = 300;
export const generateMetadata = () => pageMetadata('about');

export default async function AboutPage() {
  const [stats, c] = await Promise.all([getStats(), getPage('about')]);
  const mission = parseItems(c['vision.mission']);
  const values = parseLines(c['values.list']);
  return (
    <>
      <PageHero icon="Building2" layers={['People', 'Process', 'Innovation']} {...heroProps(c)} crumbs={[{ label: 'About', href: '/about' }]} />

      <Section bg={c['story.bg']} fallback="bg-white" className="py-28">
        <div className="container grid gap-16 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            {c['story.eyebrow'] && <span className="eyebrow">{c['story.eyebrow']}</span>}
            <h2 className="mt-5 text-display-md font-bold"><Accent text={c['story.title']} /></h2>
          </Reveal>
          <Reveal delay={0.1} className="space-y-5 text-lg leading-relaxed text-slate lg:col-span-7">
            {paragraphs(c['story.body']).map((p) => <p key={p}>{p}</p>)}
          </Reveal>
        </div>
      </Section>

      <Section bg={c['vision.bg']} tone="dark" fallback="bg-navy-900" className="py-28 text-white">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2">
            <Reveal>
              <span className="eyebrow eyebrow-light">Vision</span>
              <p className="mt-6 font-display text-3xl font-bold leading-snug md:text-4xl">{c['vision.text']}</p>
            </Reveal>
            <Stagger className="space-y-px overflow-hidden rounded-3xl bg-white/10">
              {mission.map(([t, b]) => (
                <StaggerItem key={t} className="bg-white/[0.04] p-8 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-crimson-400">Mission · {t}</p>
                  <p className="mt-3 text-lg text-white/80">{b}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </Section>

      {c['values.show'] && (
      <Section bg={c['values.bg']} fallback="bg-surface" className="py-28">
        <div className="container">
          {c['values.eyebrow'] && <span className="eyebrow">{c['values.eyebrow']}</span>}
          <h2 className="mt-5 max-w-2xl text-display-md font-bold"><Accent text={c['values.title']} /></h2>
          <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v, i) => (
              <StaggerItem key={v} className="card-hover rounded-2xl border border-transparent bg-white p-8 shadow-card">
                <span className="font-display text-4xl font-extrabold text-navy-900/10">{String(i + 1).padStart(2, '0')}</span>
                <p className="mt-4 font-display text-xl font-semibold text-navy-900">{v}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>
      )}

      {c['stats.show'] && <Stats stats={stats} />}
      {c['cta.show'] && <FinalCta {...ctaProps(c)} />}
    </>
  );
}
