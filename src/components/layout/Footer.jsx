'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter, Youtube } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { certifications } from '@/data/site';

const socialIcons = { linkedin: Linkedin, facebook: Facebook, instagram: Instagram, x: Twitter, youtube: Youtube };

const company = [
  { label: 'About Alight', href: '/about' },
  { label: 'Case Studies', href: '/case-studies' },
  { label: 'Careers', href: '/careers' },
  { label: 'Insights & Blogs', href: '/blogs' },
  { label: 'Contact', href: '/contact' },
];

function Col({ title, links }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">{title}</p>
      <ul className="mt-4 space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-white/65 transition-colors hover:text-white">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer({ nav, site }) {
  const { services, products } = nav;
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="relative overflow-hidden bg-navy-950 text-white">
      <div className="absolute -left-40 top-0 h-72 w-72 rounded-full bg-brand-blue/20 blur-[120px]" />
      <div className="container relative pb-8 pt-14">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.3fr_1fr_1fr_0.8fr]">
          <div className="col-span-2 lg:col-span-1">
            <Logo onDark />
            <ul className="mt-6 space-y-3 text-sm text-white/70">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-crimson-400" />
                <span>{site.address.line1}, {site.address.line2}, {site.address.city} {site.address.postalCode}</span>
              </li>
              <li><a href={site.phoneHref} className="flex gap-3 hover:text-white"><Phone className="h-4 w-4 text-crimson-400" />{site.phone}</a></li>
              <li><a href={`mailto:${site.email}`} className="flex gap-3 hover:text-white"><Mail className="h-4 w-4 text-crimson-400" />{site.email}</a></li>
            </ul>
            <div className="mt-6 flex gap-2">
              {Object.entries(site.social).map(([key, href]) => {
                const S = socialIcons[key];
                return S ? (
                  <a key={key} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Alight Consultants on ${key}`} className="inline-grid h-9 w-9 place-items-center rounded-full border border-white/15 transition hover:border-white hover:bg-white hover:text-navy-900">
                    <S className="h-4 w-4" />
                  </a>
                ) : null;
              })}
            </div>
            {site.footerNote && <p className="mt-4 max-w-xs text-xs text-white/45">{site.footerNote}</p>}
          </div>
          <Col title="Services" links={services.slice(0, 5).map((s) => ({ label: s.title, href: `/services/${s.slug}` })).concat({ label: 'All services →', href: '/services' })} />
          <Col title="Products" links={products.filter((p) => p.featured).slice(0, 5).map((p) => ({ label: p.name, href: `/products/${p.slug}` })).concat({ label: 'All products →', href: '/products' })} />
          <div className="col-span-2 sm:col-span-1"><Col title="Company" links={company} /></div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/45 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {certifications.map((c) => (
              <span key={c.code} className="rounded-full border border-white/15 px-3 py-1 font-semibold tracking-wide text-white/65">{c.code}</span>
            ))}
            <span className="ml-1">© {new Date().getFullYear()} {site.name.replace(/\.$/, '')}. All rights reserved.</span>
          </div>
          <div className="flex gap-5">
            <Link href="/privacy-policy" className="hover:text-white">Privacy</Link>
            <Link href="/terms-and-conditions" className="hover:text-white">Terms</Link>
            <Link href="/sitemap.xml" className="hover:text-white">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
