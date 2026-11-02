import { Suspense } from 'react';
import { Clock, FileText, Users, Mail } from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import ConsultationForm from '@/components/forms/ConsultationForm';
import Section from '@/components/ui/Section';
import { getSite } from '@/lib/settings';
import { getPage, heroProps, pageMetadata } from '@/lib/pages';
import { parseItems } from '@/lib/pages/registry';

export const revalidate = 300;
export const generateMetadata = () => pageMetadata('request-consultation');

const expectIcons = [Clock, Users, FileText];

export default async function ConsultationPage() {
  const [c, site] = await Promise.all([getPage('request-consultation'), getSite()]);
  const expect = parseItems(c['expect.items']);
  const email = site.quoteEmail;
  const [before, after] = String(c['expect.emailNote'] || '').split(email);
  return (
    <>
      <PageHero icon="Sparkles" layers={['Discover', 'Plan', 'Deliver']} {...heroProps(c)} crumbs={[{ label: 'Request Consultation', href: '/request-consultation' }]} />
      <Section bg={c['main.bg']} fallback="bg-surface" className="py-24">
        <div className="container grid gap-10 lg:grid-cols-[1.6fr_0.8fr]">
          <div className="rounded-[2rem] bg-white p-8 shadow-card md:p-12">
            <Suspense fallback={<div className="h-96" />}><ConsultationForm /></Suspense>
          </div>
          <aside className="space-y-6 lg:pt-6">
            {c['expect.title'] && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">{c['expect.title']}</p>}
            {expect.map(([t, b], i) => {
              const I = expectIcons[i % expectIcons.length];
              return <div key={t} className="flex gap-4"><I className="h-6 w-6 shrink-0 text-crimson-600" /><div><p className="font-display font-bold text-navy-900">{t}</p>{b && <p className="text-sm text-slate">{b}</p>}</div></div>;
            })}
            {c['expect.emailNote'] && (
              <div className="card-hover flex gap-4 rounded-2xl border border-transparent bg-white p-5 shadow-card">
                <Mail className="h-6 w-6 shrink-0 text-crimson-600" />
                <p className="text-sm text-slate">
                  {before}
                  {after !== undefined && <a href={`mailto:${email}?subject=Quote%20request`} className="font-semibold text-crimson-600 hover:underline">{email}</a>}
                  {after}
                </p>
              </div>
            )}
          </aside>
        </div>
      </Section>
    </>
  );
}
