import { BadgeCheck } from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import FinalCta from '@/components/home/FinalCta';
import Section from '@/components/ui/Section';
import { Stagger, StaggerItem } from '@/components/ui/Reveal';
import { ctaProps, getPage, heroProps, pageMetadata } from '@/lib/pages';
import { parseItems } from '@/lib/pages/registry';

export const revalidate = 300;
export const generateMetadata = () => pageMetadata('certifications');

export default async function CertificationsPage() {
  const c = await getPage('certifications');
  const certs = parseItems(c['certs.items']);
  return (
    <>
      <PageHero icon="ShieldCheck" layers={certs.slice(0, 3).map(([code]) => code)} {...heroProps(c)} crumbs={[{ label: 'Certifications', href: '/certifications' }]} />
      <Section bg={c['certs.bg']} fallback="bg-white" className="py-24">
        <Stagger className="container grid gap-6 lg:grid-cols-3">
          {certs.map(([code, title, body]) => (
            <StaggerItem key={code} className="group relative overflow-hidden rounded-[2rem] border border-navy-900/10 bg-white p-10 transition hover:border-transparent hover:bg-navy-900">
              <div className="grid h-28 w-28 place-items-center rounded-full border-2 border-dashed border-crimson-600/40 transition group-hover:border-crimson-400">
                <BadgeCheck className="h-12 w-12 text-crimson-600 transition group-hover:text-crimson-400" />
              </div>
              <p className="mt-10 font-display text-3xl font-extrabold text-navy-900 transition group-hover:text-white">{code}</p>
              {title && <p className="mt-1 font-semibold text-navy-700 transition group-hover:text-brand-sky">{title}</p>}
              {body && <p className="mt-5 text-slate transition group-hover:text-white/65">{body}</p>}
            </StaggerItem>
          ))}
        </Stagger>
        {c['certs.note'] && <p className="container mt-10 text-sm text-slate">{c['certs.note']}</p>}
      </Section>
      {c['cta.show'] && <FinalCta {...ctaProps(c)} />}
    </>
  );
}
