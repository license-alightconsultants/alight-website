import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, ArrowUpRight } from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import ContactForm from '@/components/forms/ContactForm';
import Icon from '@/components/ui/Icon';
import JsonLd from '@/components/ui/JsonLd';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';
import { services as staticServices, serviceVisual } from '@/data/services';
import ProductVisual from '@/components/products/ProductVisual';
import { getServices } from '@/lib/content';
import { site } from '@/data/site';

export const revalidate = 300;
export const generateStaticParams = () => staticServices.map((s) => ({ slug: s.slug }));

async function load(slug) {
  const services = await getServices();
  return { s: services.find((x) => x.slug === slug), services };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { s } = await load(slug);
  if (!s) return {};
  return { title: s.seoTitle || s.title, description: s.seoDescription || s.summary, alternates: { canonical: `/services/${slug}` } };
}

const process = ['Discover', 'Design', 'Build', 'Deploy', 'Support'];

export default async function ServicePage({ params }) {
  const { slug } = await params;
  const { s, services } = await load(slug);
  if (!s) notFound();
  const others = services.filter((x) => x.slug !== slug).slice(0, 4);

  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Service', name: s.title, description: s.summary, provider: { '@type': 'Organization', name: site.name, url: site.url }, areaServed: 'IN' }} />
      <PageHero
        eyebrow="Service"
        title={s.title}
        lead={s.summary}
        crumbs={[{ label: 'Services', href: '/services' }, { label: s.title, href: `/services/${slug}` }]}
        aside={
          <div className="relative mx-auto w-full max-w-md pb-6 pl-6 [perspective:1200px]">
            <div className="absolute -inset-6 -z-10 rounded-full bg-brand-blue/30 blur-[80px]" />
            <div className="[transform:rotateY(-10deg)_rotateX(6deg)]">
              <ProductVisual dark product={{ slug: `svc-${s.slug}`, name: s.title, short: s.title, visual: serviceVisual[s.slug] || 'dashboard' }} className="h-64 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)]" />
            </div>
            <span className="absolute bottom-0 left-0 grid h-16 w-16 animate-float place-items-center rounded-2xl bg-white text-navy-900 shadow-xl ring-4 ring-white/20">
              <Icon name={s.icon} className="h-7 w-7" />
            </span>
          </div>
        }
      />

      <section className="bg-white py-24">
        <div className="container grid gap-16 lg:grid-cols-2">
          <Reveal>
            <span className="eyebrow">What we deliver</span>
            <ul className="mt-8 space-y-4">
              {s.features.map((f) => (
                <li key={f} className="flex items-start gap-4 border-b border-navy-900/10 pb-4 text-lg font-medium text-navy-900">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-crimson-600" /> {f}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1} className="rounded-[2rem] bg-navy-900 p-10 text-white">
            <span className="eyebrow eyebrow-light">Business benefits</span>
            <ul className="mt-8 space-y-6">
              {s.benefits.map((b, i) => (
                <li key={b} className="flex gap-5">
                  <span className="font-display text-3xl font-extrabold text-white/20">{String(i + 1).padStart(2, '0')}</span>
                  <span className="pt-2 text-lg font-semibold">{b}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="bg-surface py-24">
        <div className="container">
          <span className="eyebrow">How we work</span>
          <Stagger className="mt-10 grid gap-4 md:grid-cols-5">
            {process.map((p, i) => (
              <StaggerItem key={p} className="relative rounded-2xl bg-white p-6 shadow-card">
                <span className="text-xs font-bold text-crimson-600">STEP {i + 1}</span>
                <p className="mt-3 font-display text-xl font-bold text-navy-900">{p}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section id="enquire" className="bg-white py-24">
        <div className="container grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <span className="eyebrow">Start a conversation</span>
            <h2 className="mt-4 text-display-md font-bold">Discuss your {s.title.toLowerCase()} needs.</h2>
            <div className="mt-10 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">Other services</p>
              {others.map((o) => (
                <Link key={o.slug} href={`/services/${o.slug}`} className="flex items-center justify-between rounded-xl px-4 py-3 font-medium text-navy-900 hover:bg-surface">
                  {o.title} <ArrowUpRight className="h-4 w-4 text-slate" />
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] bg-surface p-8 md:p-10">
            <ContactForm defaultService={s.title} />
          </div>
        </div>
      </section>
    </>
  );
}
