import { UserCheck, Clock, Repeat, ShieldCheck } from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import ContactForm from '@/components/forms/ContactForm';
import Section from '@/components/ui/Section';
import Accent from '@/components/ui/Accent';
import { Stagger, StaggerItem } from '@/components/ui/Reveal';
import { hireRoles } from '@/data/industries';
import { getPage, heroProps, pageMetadata } from '@/lib/pages';
import { parseItems } from '@/lib/pages/registry';

export const revalidate = 300;
export const generateMetadata = () => pageMetadata('hire-developers');

// Icons for the engagement-model points, in order (the text is edited in Admin → Pages).
const modelIcons = [UserCheck, Clock, Repeat, ShieldCheck];

export default async function HirePage() {
  const c = await getPage('hire-developers');
  const model = parseItems(c['model.items']);
  return (
    <>
      <PageHero icon="Code2" layers={['ASP.NET', 'React', 'Flutter']} {...heroProps(c)} crumbs={[{ label: 'Hire Developers', href: '/hire-developers' }]} />
      <Section bg={c['roles.bg']} fallback="bg-white" className="py-24">
        <div className="container">
          <Stagger className="grid gap-px overflow-hidden rounded-[2rem] bg-navy-900/10 md:grid-cols-2 lg:grid-cols-5">
            {hireRoles.map((r) => (
              <StaggerItem key={r.title} className="group bg-white p-8 transition hover:bg-navy-900">
                <h2 className="text-xl font-bold transition group-hover:text-white">{r.title}</h2>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {r.stack.map((s) => <li key={s} className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-navy-700 transition group-hover:bg-white/10 group-hover:text-white">{s}</li>)}
                </ul>
              </StaggerItem>
            ))}
          </Stagger>
          <div className="mt-20 grid gap-10 md:grid-cols-4">
            {model.map(([t, b], i) => {
              const I = modelIcons[i % modelIcons.length];
              return (
                <div key={t}><I className="h-7 w-7 text-crimson-600" /><p className="mt-4 font-display text-lg font-bold text-navy-900">{t}</p>{b && <p className="mt-2 text-sm text-slate">{b}</p>}</div>
              );
            })}
          </div>
        </div>
      </Section>
      <Section bg={c['form.bg']} fallback="bg-surface" className="py-24">
        <div className="container grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            {c['form.eyebrow'] && <span className="eyebrow">{c['form.eyebrow']}</span>}
            <h2 className="mt-4 text-display-md font-bold"><Accent text={c['form.title']} /></h2>
            <p className="mt-4 text-slate">{c['form.lead']}</p>
          </div>
          <div className="rounded-[2rem] bg-white p-8 shadow-card md:p-10"><ContactForm defaultService="Hire Developers" /></div>
        </div>
      </Section>
    </>
  );
}
