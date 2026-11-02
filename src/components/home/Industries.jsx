'use client';

import Section from '@/components/ui/Section';
import Link from 'next/link';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import Icon from '@/components/ui/Icon';
import SectionHeading from '@/components/ui/SectionHeading';

const ease = [0.22, 1, 0.36, 1];

export default function Industries({ industries, products, eyebrow = 'Industries', title = 'Built for the sectors that can’t afford downtime.', lead, bg }) {
  const getProduct = (slug) => products.find((p) => p.slug === slug);
  const [i, setI] = useState(0);
  const ind = industries[i];

  return (
    <Section bg={bg} tone="light" fallback="bg-white" className="py-28 lg:py-36">
      <div className="container">
        <SectionHeading eyebrow={eyebrow} title={title} lead={lead} align="center" />

        <div role="tablist" aria-label="Industries" className="mt-14 flex snap-x gap-2 overflow-x-auto pb-2 lg:justify-center">
          {industries.map((item, n) => (
            <button
              key={item.slug}
              role="tab"
              aria-selected={i === n}
              onClick={() => setI(n)}
              className={`flex shrink-0 snap-start items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition ${
                i === n ? 'border-navy-900 bg-navy-900 text-white' : 'border-navy-900/10 text-navy-900 hover:border-navy-900/40'
              }`}
            >
              <Icon name={item.icon} className="h-4 w-4" /> {item.name}
            </button>
          ))}
        </div>

        <div className="relative mt-12 overflow-hidden rounded-[2rem] bg-surface">
          <AnimatePresence mode="wait">
            <motion.div
              key={ind.slug}
              role="tabpanel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="grid lg:grid-cols-2"
            >
              <div className="p-10 lg:p-16">
                <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="eyebrow">{ind.name}</motion.span>
                <motion.h3 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, ease, duration: 0.6 }}
                  className="mt-5 text-display-md font-bold">{ind.headline}</motion.h3>
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, ease, duration: 0.6 }}
                  className="mt-5 max-w-lg text-lg leading-relaxed text-slate">{ind.story}</motion.p>
                <Link href={`/industries/${ind.slug}`} className="mt-10 inline-flex items-center gap-2 font-semibold text-crimson-600 hover:text-navy-900">
                  Explore {ind.name} solutions <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="relative overflow-hidden bg-navy-900 p-10 lg:p-16">
                <div className="absolute inset-0 bg-grid [background-size:28px_28px]" />
                <Icon name={ind.icon} className="absolute -bottom-10 -right-10 h-64 w-64 text-white/[0.04]" />
                <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Relevant platforms</p>
                <ul className="relative mt-6 space-y-3">
                  {ind.products.map((slug, n) => {
                    const p = getProduct(slug);
                    if (!p) return null;
                    return (
                      <motion.li key={slug} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + n * 0.08, ease, duration: 0.6 }}>
                        <Link href={`/products/${slug}`} className="glass group flex items-center justify-between rounded-2xl px-5 py-4 transition hover:bg-white/10">
                          <span>
                            <span className="block font-display font-semibold text-white">{p.name}</span>
                            <span className="block text-xs text-white/50">{p.short}</span>
                          </span>
                          <ArrowUpRight className="h-4 w-4 text-white/40 transition group-hover:text-crimson-400" />
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}
