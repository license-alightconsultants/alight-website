'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, BadgeCheck, Boxes, Briefcase, Building2, ChevronDown, Globe, Landmark, Layers, Mail,
  Menu, Newspaper, Phone, ShoppingBag, Star, Users, X,
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import Icon from '@/components/ui/Icon';
import { navigation } from '@/data/site';
import { productCategories } from '@/data/products';

const ease = [0.22, 1, 0.36, 1];

const categoryIcons = { 'gov-finance': Landmark, enterprise: Boxes, citizen: Globe, commerce: ShoppingBag };

// Icons and one-line descriptions for the Company dropdown, keyed by link.
const companyMeta = {
  '/about': [Building2, 'Who we are and how we work'],
  '/certifications': [BadgeCheck, 'ISO 9001, ISO 27001 and GeM'],
  '/our-work': [Briefcase, 'Platforms we have delivered'],
  '/case-studies': [Layers, 'Problems solved, in detail'],
  '/careers': [Users, 'Join the Alight team'],
  '/blogs': [Newspaper, 'Ideas, updates and guides'],
};

/* ─── Shared pieces ─────────────────────────────────────────── */

function PanelHeading({ eyebrow, title, href, cta }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-6 border-b border-navy-900/[0.06] pb-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-crimson-600">{eyebrow}</p>
        <p className="mt-1 font-display text-xl font-bold text-navy-900">{title}</p>
      </div>
      <Link href={href} className="group inline-flex items-center gap-1.5 rounded-full bg-surface px-4 py-2 text-sm font-semibold text-navy-900 transition hover:bg-navy-900 hover:text-white">
        {cta} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

function IconTile({ children, className = '' }) {
  return (
    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-surface to-white text-navy-700 ring-1 ring-navy-900/[0.06] transition-all duration-300 group-hover:from-crimson-600 group-hover:to-crimson-500 group-hover:text-white group-hover:shadow-red group-hover:ring-transparent ${className}`}>
      {children}
    </span>
  );
}

function PromoPanel({ eyebrow, title, body, href, cta, points = [] }) {
  return (
    <Link href={href} className="noise group relative isolate flex flex-col overflow-hidden rounded-2xl bg-navy-900 p-7 text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_100%_0%,#123D70_0%,#071A36_55%,#050F24_100%)]" />
      <div className="absolute inset-0 -z-10 bg-grid [background-size:22px_22px] opacity-50" />
      <div className="absolute -bottom-16 -right-16 -z-10 h-48 w-48 rounded-full bg-crimson-600/40 blur-3xl transition-transform duration-700 group-hover:scale-125" />
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-crimson-400">{eyebrow}</p>
      <p className="mt-3 font-display text-xl font-bold leading-snug">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-white/65">{body}</p>
      {points.length > 0 && (
        <ul className="mt-5 space-y-2">
          {points.map((p) => (
            <li key={p} className="flex items-center gap-2 text-xs font-medium text-white/80">
              <BadgeCheck className="h-4 w-4 text-brand-sky" /> {p}
            </li>
          ))}
        </ul>
      )}
      <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-navy-900 transition group-hover:bg-crimson-600 group-hover:text-white">
        {cta} <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

/* ─── Mega panels ───────────────────────────────────────────── */

function MegaServices({ services }) {
  return (
    <div className="grid grid-cols-[1fr_300px] gap-8">
      <div>
        <PanelHeading eyebrow="Services" title="What we build for you" href="/services" cta={`All ${services.length} services`} />
        <div className="grid grid-cols-3 gap-2">
          {services.map((s) => (
            <Link key={s.slug} href={`/services/${s.slug}`} className="group relative flex gap-3.5 rounded-2xl p-3.5 transition-colors duration-300 hover:bg-surface">
              <IconTile><Icon name={s.icon} className="h-5 w-5" /></IconTile>
              <span className="min-w-0 pr-4">
                <span className="block text-[0.92rem] font-semibold leading-snug text-navy-900">{s.title}</span>
                <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate">{s.summary}</span>
              </span>
              <ArrowUpRight className="absolute right-3 top-3.5 h-4 w-4 -translate-x-1 translate-y-1 text-crimson-600 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </div>
      <PromoPanel
        eyebrow="Free consultation"
        title="Not sure where to start?"
        body="Our consultants map your process and recommend the right solution."
        points={['Requirement workshop', 'Solution & cost estimate', 'No obligation']}
        href="/request-consultation"
        cta="Request a consultation"
      />
    </div>
  );
}

function MegaProducts({ products }) {
  const [cat, setCat] = useState(productCategories[0].id);
  const list = products.filter((p) => p.category === cat);
  const count = (id) => products.filter((p) => p.category === id).length;
  return (
    <div className="grid grid-cols-[260px_1fr] gap-8">
      <div className="flex flex-col gap-1.5 rounded-2xl bg-surface p-2.5">
        <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate">Categories</p>
        {productCategories.map((c) => {
          const CatIcon = categoryIcons[c.id] || Boxes;
          const active = cat === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onMouseEnter={() => setCat(c.id)}
              onFocus={() => setCat(c.id)}
              onClick={() => setCat(c.id)}
              aria-pressed={active}
              className={`relative flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition-colors ${active ? 'text-white' : 'text-navy-900 hover:bg-white'}`}
            >
              {active && <motion.span layoutId="product-cat" transition={{ duration: 0.35, ease }} className="absolute inset-0 -z-0 rounded-xl bg-navy-900 shadow-[0_10px_24px_-10px_rgba(7,26,54,0.7)]" />}
              <CatIcon className={`relative h-4 w-4 ${active ? 'text-crimson-400' : 'text-navy-700'}`} />
              <span className="relative flex-1">{c.label}</span>
              <span className={`relative rounded-full px-2 py-0.5 text-[11px] font-bold ${active ? 'bg-white/15 text-white' : 'bg-white text-slate'}`}>{count(c.id)}</span>
            </button>
          );
        })}
        <Link href="/products" className="group mt-auto inline-flex items-center gap-1.5 px-3 pb-2 pt-4 text-sm font-semibold text-crimson-600">
          View all {products.length} products <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
      </div>
      <div>
        <PanelHeading eyebrow="Products" title={productCategories.find((c) => c.id === cat)?.label} href="/products" cta="Explore products" />
        <AnimatePresence mode="wait">
          <motion.div
            key={cat}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease }}
            className="grid grid-cols-2 content-start gap-2"
          >
            {list.map((p) => (
              <Link key={p.slug} href={`/products/${p.slug}`} className="group relative rounded-2xl border border-navy-900/[0.06] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-crimson-600/20 hover:shadow-card">
                <span className="flex items-center gap-2">
                  <span className="truncate text-[0.92rem] font-semibold text-navy-900 transition group-hover:text-crimson-600">{p.name}</span>
                  {p.short && <span className="shrink-0 rounded-md bg-navy-900/[0.05] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy-700">{p.short}</span>}
                  {p.featured && <Star aria-label="Featured" className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />}
                </span>
                <span className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate">{p.summary}</span>
              </Link>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function MegaIndustries({ industries }) {
  return (
    <div className="grid grid-cols-[1fr_300px] gap-8">
      <div>
        <PanelHeading eyebrow="Industries" title="Sectors we serve" href="/industries" cta="All industries" />
        <div className="grid grid-cols-2 gap-2">
          {industries.map((i) => (
            <Link key={i.slug} href={`/industries/${i.slug}`} className="group relative flex items-center gap-3.5 rounded-2xl p-3.5 transition-colors duration-300 hover:bg-surface">
              <IconTile><Icon name={i.icon} className="h-5 w-5" /></IconTile>
              <span className="min-w-0 flex-1">
                <span className="block text-[0.92rem] font-semibold text-navy-900">{i.name}</span>
                {i.headline && <span className="mt-0.5 line-clamp-1 text-xs text-slate">{i.headline}</span>}
              </span>
              <ArrowRight className="h-4 w-4 -translate-x-1 text-crimson-600 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </div>
      <PromoPanel
        eyebrow="Trusted delivery"
        title="Built for regulated sectors"
        body="Certified processes and secure delivery for government, banking and enterprise."
        points={['ISO 9001:2015', 'ISO 27001', 'GeM registered']}
        href="/certifications"
        cta="View certifications"
      />
    </div>
  );
}

const megaPanels = { services: MegaServices, products: MegaProducts, industries: MegaIndustries };

function CompanyMenu({ items }) {
  return (
    <div className="w-[460px] overflow-hidden rounded-3xl border border-navy-900/[0.06] bg-white shadow-[0_40px_80px_-30px_rgba(7,26,54,0.45)]">
      <div className="h-1 bg-gradient-to-r from-crimson-600 via-crimson-400 to-brand-blue" />
      <div className="grid grid-cols-2 gap-1 p-3">
        {items.map((c) => {
          const [I = Building2, desc] = companyMeta[c.href] || [];
          return (
            <Link key={c.href} href={c.href} className="group flex items-start gap-3 rounded-2xl p-3 transition-colors hover:bg-surface">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-navy-700 transition group-hover:bg-crimson-600 group-hover:text-white"><I className="h-4 w-4" /></span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-navy-900">{c.label}</span>
                {desc && <span className="mt-0.5 block text-xs text-slate">{desc}</span>}
              </span>
            </Link>
          );
        })}
      </div>
      <Link href="/contact" className="group flex items-center justify-between border-t border-navy-900/[0.06] bg-surface/70 px-6 py-3.5 text-sm font-semibold text-navy-900 transition hover:bg-surface">
        <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-crimson-600" /> Get in touch with our team</span>
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

/* ─── Header ────────────────────────────────────────────────── */

export default function Header({ nav, site }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(null);
  const [mobile, setMobile] = useState(false);
  const closeTimer = useRef();

  useEffect(() => {
    // Hysteresis: separate on/off thresholds so the header can't flicker around one scroll position.
    const onScroll = () => setScrolled((was) => (was ? window.scrollY > 8 : window.scrollY > 40));
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(null);
    setMobile(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobile ? 'hidden' : '';
  }, [mobile]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && (setOpen(null), setMobile(false));
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (pathname.startsWith('/admin')) return null;

  // Only scrolling changes the header look; opening a menu does not.
  const solid = scrolled;
  const enter = (key) => { clearTimeout(closeTimer.current); setOpen(key); };
  const leave = () => { closeTimer.current = setTimeout(() => setOpen(null), 160); };
  const Panel = open && megaPanels[open];

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Transparent over the hero; once scrolled it becomes a floating glass bar. */}
      <div className={`container transition-[padding] duration-500 ${solid ? 'pt-3' : 'pt-0'}`}>
        <div
          className={`flex items-center justify-between gap-6 rounded-2xl border transition-all duration-500 ease-out ${
            solid
              ? 'h-[64px] border-white/70 bg-white/85 px-3 shadow-float backdrop-blur-xl backdrop-saturate-150 sm:px-5'
              : 'h-[76px] border-transparent bg-transparent px-0'
          }`}
        >
          <Logo onDark={!solid} />

          <nav aria-label="Primary" className="hidden lg:block" onMouseLeave={leave}>
            <ul className="flex items-center gap-0.5">
              {navigation.map((item) => {
                const key = item.mega || item.label;
                const hasMenu = item.mega || item.children;
                const active = pathname === item.href || pathname.startsWith(item.href + '/') || item.children?.some((c) => pathname === c.href || pathname.startsWith(c.href + '/'));
                return (
                  <li
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => (hasMenu ? enter(key) : setOpen(null))}
                  >
                    <Link
                      href={item.href}
                      aria-expanded={hasMenu ? open === key : undefined}
                      aria-current={active ? 'page' : undefined}
                      onFocus={() => hasMenu && enter(key)}
                      className={`relative flex items-center gap-1 px-4 py-2 text-[0.92rem] font-medium ${solid ? 'text-navy-900' : 'text-white'}`}
                    >
                      {item.label}
                      {hasMenu && <ChevronDown className={`h-3.5 w-3.5 opacity-70 transition-transform duration-300 ${open === key ? 'rotate-180' : ''}`} />}
                      {active && <span className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-crimson-500 shadow-[0_0_8px_rgba(234,83,97,0.9)]" />}
                    </Link>

                    {item.children && (
                      <AnimatePresence>
                        {open === item.label && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.98 }}
                            transition={{ duration: 0.22, ease }}
                            className="absolute right-0 top-full origin-top-right pt-4"
                          >
                            <CompanyMenu items={item.children} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </li>
                );
              })}
            </ul>

            <AnimatePresence>
              {Panel && (
                <motion.div
                  key="mega"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease }}
                  onMouseEnter={() => clearTimeout(closeTimer.current)}
                  className="absolute inset-x-0 top-full pt-3"
                >
                  <div className="container">
                    {/* Solid white: a translucent panel can't blur through the already-blurred header bar. */}
                    <div className="overflow-hidden rounded-3xl border border-navy-900/[0.06] bg-white shadow-[0_50px_100px_-30px_rgba(7,26,54,0.5)]">
                      <div className="h-1 bg-gradient-to-r from-crimson-600 via-crimson-400 to-brand-blue" />
                      <AnimatePresence mode="wait">
                        <motion.div key={open} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="p-8">
                          <Panel {...nav} />
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>

          <div className="flex items-center gap-3">
            <a href={site.phoneHref} className={`group hidden items-center gap-2 text-sm font-medium transition xl:flex ${solid ? 'text-navy-900' : 'text-white/85 hover:text-white'}`}>
              <span className={`grid h-8 w-8 place-items-center rounded-full transition ${solid ? 'bg-surface group-hover:bg-navy-900 group-hover:text-white' : 'bg-white/10 group-hover:bg-white/20'}`}><Phone className="h-3.5 w-3.5" /></span>
              {site.phone}
            </a>
            <Link href="/request-consultation" className="group hidden items-center gap-1.5 rounded-full bg-gradient-to-r from-crimson-600 to-crimson-500 px-5 py-2.5 text-sm font-semibold text-white shadow-red transition-all duration-300 hover:-translate-y-0.5 hover:shadow-red-lg sm:inline-flex">
              Get a Quote <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobile(true)}
              className={`grid h-11 w-11 place-items-center rounded-full transition lg:hidden ${solid ? 'bg-navy-900 text-white' : 'bg-white/10 text-white ring-1 ring-inset ring-white/15'}`}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>{mobile && <MobileMenu nav={nav} site={site} pathname={pathname} onClose={() => setMobile(false)} />}</AnimatePresence>
    </header>
  );
}

/* ─── Mobile menu ───────────────────────────────────────────── */

const mobileIcons = { Services: Layers, Products: Boxes, Industries: Building2, Technology: Globe, 'Hire Developers': Users, Company: Briefcase };

function MobileMenu({ nav, site, pathname, onClose }) {
  const [section, setSection] = useState(null);
  const { services, products, industries } = nav;
  const groups = {
    Services: services.map((s) => ({ label: s.title, href: `/services/${s.slug}` })),
    Products: products.map((p) => ({ label: p.name, href: `/products/${p.slug}` })),
    Industries: industries.map((i) => ({ label: i.name, href: `/industries/${i.slug}` })),
  };
  const items = [...navigation, { label: 'Contact', href: '/contact' }];
  return (
    <motion.div className="fixed inset-0 z-[70] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-navy-950/70 backdrop-blur-sm" onClick={onClose} />
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.45, ease }}
        className="noise absolute inset-y-0 right-0 isolate flex w-full max-w-sm flex-col overflow-y-auto bg-navy-900 p-6 text-white"
      >
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_100%_0%,#123D70_0%,#071A36_50%,#050F24_100%)]" />
        <div aria-hidden className="absolute -bottom-24 -left-24 -z-10 h-72 w-72 rounded-full bg-crimson-600/25 blur-[100px]" />

        <div className="flex items-center justify-between">
          <Logo onDark />
          <button type="button" aria-label="Close menu" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full bg-white/10 ring-1 ring-inset ring-white/15 transition hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Mobile" className="mt-8 flex-1 space-y-2">
          {items.map((item, idx) => {
            const sub = groups[item.label] || item.children;
            const ItemIcon = mobileIcons[item.label] || Mail;
            const isOpen = section === item.label;
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 + idx * 0.04, duration: 0.4, ease }}
                className={`overflow-hidden rounded-2xl ring-1 ring-inset transition-colors ${isOpen ? 'bg-white/[0.07] ring-white/15' : 'ring-white/[0.06]'}`}
              >
                <div className="flex items-center">
                  <Link href={item.href} className="flex flex-1 items-center gap-3 px-4 py-3.5">
                    <span className={`grid h-9 w-9 place-items-center rounded-xl ${active ? 'bg-crimson-600 text-white' : 'bg-white/[0.08] text-brand-sky'}`}><ItemIcon className="h-4 w-4" /></span>
                    <span className="font-display text-[1.05rem] font-semibold">{item.label}</span>
                  </Link>
                  {sub && (
                    <button
                      type="button"
                      aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${item.label}`}
                      aria-expanded={isOpen}
                      onClick={() => setSection(isOpen ? null : item.label)}
                      className="mr-2 grid h-10 w-10 place-items-center rounded-xl text-white/70 transition hover:bg-white/10"
                    >
                      <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
                <AnimatePresence initial={false}>
                  {isOpen && sub && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease }}
                      className="overflow-hidden px-4"
                    >
                      <ul className="mb-3 space-y-0.5 border-l border-white/10 pl-4">
                        {sub.map((s) => (
                          <li key={s.href}>
                            <Link href={s.href} className="flex items-center justify-between rounded-lg px-2 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white">
                              {s.label} <ArrowUpRight className="h-3.5 w-3.5 opacity-40" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </nav>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4, ease }} className="mt-8 space-y-3">
          <Link href="/request-consultation" className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-crimson-600 to-crimson-500 py-4 font-semibold shadow-red">
            Request a Consultation <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="grid grid-cols-2 gap-3">
            <a href={site.phoneHref} className="glass flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium text-white/85"><Phone className="h-4 w-4 text-brand-sky" /> Call us</a>
            {site.email && <a href={`mailto:${site.email}`} className="glass flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium text-white/85"><Mail className="h-4 w-4 text-brand-sky" /> Email us</a>}
          </div>
        </motion.div>
      </motion.aside>
    </motion.div>
  );
}
