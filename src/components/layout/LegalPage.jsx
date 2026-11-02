import PageHero from './PageHero';
import Section from '@/components/ui/Section';
import { heroProps } from '@/lib/pages';
import { parseItems } from '@/lib/pages/registry';

// Legal pages are fully editable in Admin → Pages ("Heading | Text" per line).
export default function LegalPage({ content: c, href }) {
  const sections = parseItems(c['legal.sections']);
  return (
    <>
      <PageHero {...heroProps(c)} crumbs={[{ label: c['hero.title'], href }]} />
      <Section bg={c['legal.bg']} fallback="bg-white" className="py-20">
        <div className="container max-w-3xl space-y-10">
          {sections.map(([h, ...body]) => (
            <div key={h}>
              <h2 className="text-2xl font-bold">{h}</h2>
              {body.length > 0 && <p className="mt-3 leading-relaxed text-slate">{body.join(' | ')}</p>}
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
