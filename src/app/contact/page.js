import { Mail, MapPin, Phone, Linkedin } from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import ContactForm from '@/components/forms/ContactForm';
import { getSite } from '@/lib/settings';
import Section from '@/components/ui/Section';
import { getPage, heroProps, pageMetadata } from '@/lib/pages';

export const revalidate = 300;

export const generateMetadata = () => pageMetadata('contact');

export default async function ContactPage() {
  const [site, c] = await Promise.all([getSite(), getPage('contact')]);
  const mapQuery = encodeURIComponent(site.mapQuery);
  const items = [
    { icon: Phone, label: 'Call', value: site.phone, href: site.phoneHref },
    { icon: Mail, label: 'Email', value: site.email, href: `mailto:${site.email}` },
    ...(site.social.linkedin ? [{ icon: Linkedin, label: 'LinkedIn', value: site.name, href: site.social.linkedin }] : []),
  ];
  return (
    <>
      <PageHero icon="Phone" layers={['Call', 'Email', 'Visit']} {...heroProps(c)} crumbs={[{ label: 'Contact', href: '/contact' }]} />
      <Section bg={c['main.bg']} fallback="bg-surface" className="py-24">
        <div className="container grid gap-10 lg:grid-cols-[0.9fr_1.4fr]">
          <div className="space-y-4">
            {items.map(({ icon: I, label, value, href }) => (
              <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="group flex items-center gap-5 rounded-2xl bg-white p-6 shadow-card transition hover:-translate-y-0.5">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-navy-900 text-white transition group-hover:bg-crimson-600"><I className="h-5 w-5" /></span>
                <span><span className="block text-xs uppercase tracking-wider text-slate">{label}</span><span className="font-semibold text-navy-900">{value}</span></span>
              </a>
            ))}
            <div className="overflow-hidden rounded-2xl bg-white shadow-card">
              <div className="flex gap-5 p-6">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-navy-900 text-white"><MapPin className="h-5 w-5" /></span>
                <address className="not-italic text-navy-900"><span className="block text-xs uppercase tracking-wider text-slate">Office</span>{site.address.line1}, {site.address.line2}, {site.address.city} {site.address.postalCode}</address>
              </div>
              {c['map.show'] && <iframe title="Office location map" className="h-64 w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={`https://www.google.com/maps?q=${mapQuery}&output=embed`} />}
            </div>
          </div>
          <div className="rounded-[2rem] bg-white p-8 shadow-card md:p-12">
            <h2 className="text-2xl font-bold">{c['form.title']}</h2>
            {c['form.lead'] && <p className="mt-2 text-slate">{c['form.lead']}</p>}
            <div className="mt-8"><ContactForm /></div>
          </div>
        </div>
      </Section>
    </>
  );
}
