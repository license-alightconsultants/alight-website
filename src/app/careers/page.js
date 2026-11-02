import { MapPin, Briefcase, Mail } from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import EmptyState from '@/components/ui/EmptyState';
import ApplyForm from '@/components/forms/ApplyForm';
import Section from '@/components/ui/Section';
import Accent from '@/components/ui/Accent';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';
import { getActiveJobs } from '@/lib/content';
import { getSite } from '@/lib/settings';
import { getPage, heroProps, pageMetadata } from '@/lib/pages';
import { parseItems } from '@/lib/pages/registry';

export const revalidate = 300;
export const generateMetadata = () => pageMetadata('careers');

/** Renders text with the careers address turned into a mailto link. */
function WithEmail({ text, email }) {
  const parts = String(text).split(email);
  return parts.map((p, i) => (
    <span key={i}>{p}{i < parts.length - 1 && <a href={`mailto:${email}?subject=Career%20enquiry`} className="font-semibold text-crimson-600 hover:underline">{email}</a>}</span>
  ));
}

export default async function CareersPage() {
  const [jobs, c, site] = await Promise.all([getActiveJobs(), getPage('careers'), getSite()]);
  const culture = parseItems(c['culture.items']);
  const email = site.careersEmail;
  return (
    <>
      <PageHero icon="Users" layers={['Learn', 'Build', 'Grow']} {...heroProps(c)} crumbs={[{ label: 'Careers', href: '/careers' }]} />
      {c['culture.show'] && culture.length > 0 && (
        <Section bg={c['culture.bg']} fallback="bg-white" className="py-24">
          <Stagger className="container grid gap-6 md:grid-cols-3">
            {culture.map(([t, b]) => (
              <StaggerItem key={t} className="rounded-[2rem] bg-surface p-10"><h2 className="text-2xl font-bold">{t}</h2>{b && <p className="mt-3 text-slate">{b}</p>}</StaggerItem>
            ))}
          </Stagger>
        </Section>
      )}
      <Section bg={c['jobs.bg']} fallback="bg-surface" className="py-24">
        <div className="container">
          <Reveal>
            <h2 className="text-display-md font-bold"><Accent text={c['jobs.title']} /></h2>
            {c['jobs.emailNote'] && (
              <p className="mt-4 flex items-center gap-2 text-slate"><Mail className="h-4 w-4 text-crimson-600" /><span><WithEmail text={c['jobs.emailNote']} email={email} /></span></p>
            )}
          </Reveal>
          <div className="mt-10">
            {jobs.length ? (
              <ul className="divide-y divide-navy-900/10 rounded-[2rem] bg-white shadow-card">
                {jobs.map((j) => (
                  <li key={j.id}>
                    <details className="group p-8">
                      <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-4">
                        <span className="font-display text-xl font-bold text-navy-900">{j.title}</span>
                        <span className="flex flex-wrap gap-4 text-sm text-slate">
                          <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{j.department} · {j.employmentType}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{j.location}</span>
                        </span>
                      </summary>
                      <div className="mt-6 grid gap-8 text-slate md:grid-cols-2">
                        <p className="whitespace-pre-line">{j.description}</p>
                        <div><p className="font-semibold text-navy-900">Requirements</p><p className="mt-2 whitespace-pre-line">{j.requirements}</p></div>
                      </div>
                      <ApplyForm jobId={j.id} jobTitle={j.title} />
                    </details>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title={c['jobs.emptyTitle']} body={c['jobs.emptyBody']} cta="Email your CV" href={`mailto:${email}?subject=Career%20enquiry`} />
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
