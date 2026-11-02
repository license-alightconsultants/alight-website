import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import JsonLd from '@/components/ui/JsonLd';
import { site } from '@/data/site';
import HeroStack from './HeroStack';
import Accent from '@/components/ui/Accent';
import { isUploadUrl, resolveBg } from '@/lib/pages/backgrounds';

// bg / image / graphic come from Admin → Pages (see heroProps in src/lib/pages).
export default function PageHero({ eyebrow, title, lead, crumbs = [], children, aside, icon, layers, bg, image, graphic = true }) {
  const custom = resolveBg(bg, 'dark');
  const trail = [{ label: 'Home', href: '/' }, ...crumbs];
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, item: `${site.url}${c.href}` })),
  };

  return (
    <section className={`noise relative isolate overflow-hidden pb-20 pt-40 text-white lg:pb-28 lg:pt-48 ${custom.custom ? custom.className : 'bg-navy-900'}`} style={custom.style}>
      <JsonLd data={breadcrumbSchema} />
      {custom.overlay && <div aria-hidden className="absolute inset-0 -z-10" style={{ background: custom.overlay }} />}
      {!custom.custom && <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_80%_20%,#123D70_0%,#071A36_55%,#050F24_100%)]" />}
      {bg?.preset !== 'image' && <div className="absolute inset-0 -z-10 bg-grid [background-size:56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />}
      {!custom.custom && <div className="absolute -right-32 top-20 -z-10 h-80 w-80 animate-aurora rounded-full bg-crimson-600/25 blur-[120px]" />}
      {!custom.custom && <div aria-hidden className="absolute -left-40 bottom-0 -z-10 h-72 w-[36rem] animate-aurora-slow rounded-full bg-brand-blue/25 blur-[120px]" />}
      <div className="container grid items-end gap-12 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-white/50">
              {trail.map((c, i) => (
                <li key={c.href} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="h-3 w-3" />}
                  {i < trail.length - 1 ? <Link href={c.href} className="hover:text-white">{c.label}</Link> : <span aria-current="page" className="text-white/80">{c.label}</span>}
                </li>
              ))}
            </ol>
          </nav>
          <Reveal>
            {eyebrow && <span className="eyebrow eyebrow-light mt-8">{eyebrow}</span>}
            <h1 className="mt-5 text-display-xl font-extrabold text-white"><Accent text={title} accentClass="text-gradient" /></h1>
            {lead && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/65 md:text-xl">{lead}</p>}
            {children}
          </Reveal>
        </div>
        <Reveal delay={0.15}>
          {isUploadUrl(image)
            ? <img src={image} alt="" className="w-full rounded-[2rem] object-cover shadow-[0_40px_100px_-30px_rgba(0,0,0,0.7)] ring-1 ring-white/10" />
            : aside || (graphic !== false && <HeroStack icon={icon} labels={layers} />)}
        </Reveal>
      </div>
    </section>
  );
}
