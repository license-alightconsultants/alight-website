import { notFound } from 'next/navigation';
import PageHero from '@/components/layout/PageHero';
import FinalCta from '@/components/home/FinalCta';
import { Reveal } from '@/components/ui/Reveal';
import { getCaseStudy } from '@/lib/content';

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const c = await getCaseStudy(slug);
  return c ? { title: c.title, description: c.summary, alternates: { canonical: `/case-studies/${slug}` } } : {};
}

export default async function CaseStudyPage({ params }) {
  const { slug } = await params;
  const c = await getCaseStudy(slug);
  if (!c) notFound();
  const blocks = [['The challenge', c.challenge], ['Our solution', c.solution], ['Results', c.results]].filter(([, v]) => v);
  return (
    <>
      <PageHero eyebrow={c.industry?.name || 'Case study'} title={c.title} lead={c.summary} crumbs={[{ label: 'Case Studies', href: '/case-studies' }, { label: c.title, href: `/case-studies/${slug}` }]} />
      <section className="bg-white py-24">
        <div className="container grid gap-16 lg:grid-cols-[1fr_280px]">
          <div className="space-y-14">
            {blocks.map(([h, body]) => (
              <Reveal key={h}><h2 className="text-display-md font-bold">{h}</h2><p className="mt-5 whitespace-pre-line text-lg leading-relaxed text-slate">{body}</p></Reveal>
            ))}
          </div>
          {c.technology && (
            <aside className="h-fit rounded-2xl bg-surface p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">Technology</p>
              <ul className="mt-4 flex flex-wrap gap-2">{c.technology.split(',').map((t) => <li key={t} className="rounded-full bg-white px-3 py-1 text-sm font-medium text-navy-900">{t.trim()}</li>)}</ul>
            </aside>
          )}
        </div>
      </section>
      <FinalCta />
    </>
  );
}
