'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import ProductVisual from './ProductVisual';
import TiltCard from './TiltCard';
import { productCategories, categoryLabel } from '@/data/products';

const ease = [0.22, 1, 0.36, 1];

export default function ProductExplorer({ products, dark = false }) {
  const [cat, setCat] = useState('all');
  const list = useMemo(() => (cat === 'all' ? products : products.filter((p) => p.category === cat)), [cat, products]);
  const tabs = [{ id: 'all', label: 'All' }, ...productCategories.filter((c) => products.some((p) => p.category === c.id))];

  return (
    <div>
      <LayoutGroup>
        <div role="tablist" aria-label="Filter products by category" className={`flex w-fit max-w-full gap-1 overflow-x-auto rounded-full p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${dark ? 'bg-white/5 ring-1 ring-white/10' : 'bg-white ring-1 ring-navy-900/10'}`}>
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={cat === t.id}
              onClick={() => setCat(t.id)}
              className={`relative shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition sm:px-5 ${cat === t.id ? 'text-white' : dark ? 'text-white/60 hover:text-white' : 'text-slate hover:text-navy-900'}`}
            >
              {cat === t.id && <motion.span layoutId="prodTab" className="absolute inset-0 rounded-full bg-crimson-600" transition={{ duration: 0.4, ease }} />}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </div>
      </LayoutGroup>

      <motion.ul layout className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((p) => (
            <motion.li
              key={p.slug}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease }}
            >
              <TiltCard className="h-full">
                <Link
                  href={`/products/${p.slug}`}
                  className={`group flex h-full flex-col rounded-3xl p-5 transition duration-500 ${
                    dark ? 'bg-white/[0.04] ring-1 ring-white/10 hover:bg-white/[0.07] hover:ring-white/25' : 'bg-white shadow-card ring-1 ring-navy-900/5 hover:shadow-glow'
                  }`}
                >
                  <div className="h-40">
                    <ProductVisual product={p} dark={dark} className="h-full transition duration-500 group-hover:-translate-y-1" />
                  </div>
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <span className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${dark ? 'text-crimson-400' : 'text-crimson-600'}`}>{categoryLabel(p.category)}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${dark ? 'bg-white/10 text-white/70' : 'bg-surface text-navy-700'}`}>{p.short}</span>
                  </div>
                  <h3 className={`mt-3 text-xl font-bold ${dark ? 'text-white' : ''}`}>{p.name}</h3>
                  <p className={`mt-2 flex-1 text-sm leading-relaxed ${dark ? 'text-white/60' : 'text-slate'}`}>{p.summary}</p>
                  <span className={`mt-6 inline-flex items-center gap-1.5 text-sm font-semibold ${dark ? 'text-white' : 'text-navy-900'}`}>
                    View product <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-crimson-500" />
                  </span>
                </Link>
              </TiltCard>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
