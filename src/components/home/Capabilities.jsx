'use client';

import Section from '@/components/ui/Section';
import Link from 'next/link';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Check } from 'lucide-react';
import ProductVisual from '@/components/products/ProductVisual';
import Icon from '@/components/ui/Icon';
import SectionHeading from '@/components/ui/SectionHeading';
import { serviceVisual } from '@/data/services';

const ease = [0.22, 1, 0.36, 1];

// An interactive index: hover/focus a capability on the left, its detail composition animates on the right.
export default function Capabilities({ services, eyebrow = 'Core capabilities', title = 'Every discipline. One accountable partner.', lead, bg }) {
  const core = services.filter((s) => s.slug !== 'branding-print-media-design').slice(0, 8);
  const [active, setActive] = useState(0);
  const s = core[active];

  return (
    <Section bg={bg} tone="light" fallback="bg-surface" className="relative overflow-hidden py-28 lg:py-36">
      <div className="container">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading eyebrow={eyebrow} title={title} lead={lead} />
          <Link href="/services" className="inline-flex items-center gap-2 font-semibold text-navy-900 hover:text-crimson-600">
            All services <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <ol className="border-t border-navy-900/10">
            {core.map((item, i) => (
              <li key={item.slug} className="border-b border-navy-900/10">
                <Link
                  href={`/services/${item.slug}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className="group flex items-center gap-6 py-5"
                >
                  <span className={`font-display text-sm font-bold tabular-nums transition ${active === i ? 'text-crimson-600' : 'text-slate/50'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className={`flex-1 font-display text-xl font-semibold transition md:text-2xl ${active === i ? 'translate-x-2 text-navy-900' : 'text-navy-900/45'}`}>
                    {item.title}
                  </span>
                  <ArrowUpRight className={`h-5 w-5 transition ${active === i ? 'text-crimson-600 opacity-100' : 'opacity-0'}`} />
                </Link>
              </li>
            ))}
          </ol>

          <div className="relative min-h-[440px] overflow-hidden rounded-[2rem] bg-navy-900 p-10 text-white lg:sticky lg:top-28 lg:self-start">
            <div className="absolute inset-0 bg-grid [background-size:32px_32px]" />
            <motion.div
              className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-crimson-600/30 blur-[90px]"
              animate={{ x: active * 6, y: active * 4 }}
              transition={{ duration: 0.8, ease }}
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={s.slug}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease }}
                className="relative"
              >
                <span className="glass grid h-16 w-16 place-items-center rounded-2xl">
                  <Icon name={s.icon} className="h-7 w-7 text-brand-sky" />
                </span>
                <h3 className="mt-8 text-3xl font-bold text-white">{s.title}</h3>
                <p className="mt-4 max-w-md text-white/65">{s.summary}</p>
                <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                  {s.features.map((f, i) => (
                    <motion.li key={f} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.06 }}
                      className="flex items-start gap-2 text-sm text-white/80">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-crimson-400" /> {f}
                    </motion.li>
                  ))}
                </ul>
                <ProductVisual dark product={{ slug: `svc-${s.slug}`, name: s.title, short: s.title, visual: serviceVisual[s.slug] || 'dashboard' }} className="mt-8 h-44 opacity-95" />
                <Link href={`/services/${s.slug}`} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-crimson-400 hover:text-white">
                  Explore {s.title} <ArrowUpRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Section>
  );
}
