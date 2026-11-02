'use client';

import Section from '@/components/ui/Section';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Check } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import ProductVisual from '@/components/products/ProductVisual';
import { productCategories } from '@/data/products';

const ease = [0.22, 1, 0.36, 1];
const CYCLE_MS = 6000;

// Interactive product spotlight: category tabs → product list (auto-advancing) → large animated stage.
export default function FeaturedProducts({
  products,
  eyebrow = 'Featured products',
  title = 'Platforms already running critical operations.',
  lead = 'Ready-to-deploy products for public finance, cooperatives, institutions and commerce — configurable to your workflows.',
  bg,
}) {
  const cats = useMemo(() => productCategories.filter((c) => products.some((p) => p.category === c.id)), [products]);
  const [cat, setCat] = useState(cats[0]?.id);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const list = products.filter((p) => p.category === cat);
  const active = list[idx] || list[0];

  useEffect(() => {
    if (paused || reduce || list.length < 2) return;
    const t = setTimeout(() => setIdx((i) => (i + 1) % list.length), CYCLE_MS);
    return () => clearTimeout(t);
  }, [idx, paused, reduce, list.length]);

  if (!active) return null;

  return (
    <Section bg={bg} tone="dark" fallback="bg-navy-950" className="relative overflow-hidden py-28 text-white lg:py-36">
      <div className="absolute inset-0 bg-grid [background-size:56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <div className="absolute left-1/2 top-0 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-brand-blue/20 blur-[140px]" />
      <div className="container relative">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading dark eyebrow={eyebrow} title={title} lead={lead} />
          <Button href="/products" variant="ghostLight">Explore all products</Button>
        </div>

        <LayoutGroup>
          <div role="tablist" aria-label="Product categories" className="mt-12 flex w-fit max-w-full gap-1 overflow-x-auto rounded-full bg-white/5 p-1 ring-1 ring-white/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {cats.map((c) => (
              <button key={c.id} role="tab" aria-selected={cat === c.id} onClick={() => { setCat(c.id); setIdx(0); }}
                className={`relative shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition sm:px-5 ${cat === c.id ? 'text-white' : 'text-white/55 hover:text-white'}`}>
                {cat === c.id && <motion.span layoutId="spotTab" className="absolute inset-0 rounded-full bg-crimson-600" transition={{ duration: 0.4, ease }} />}
                <span className="relative">{c.label}</span>
              </button>
            ))}
          </div>
        </LayoutGroup>

        <div className="mt-10 grid gap-8 lg:grid-cols-[360px_1fr]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <ul className="space-y-2">
            {list.map((p, i) => {
              const on = p.slug === active.slug;
              return (
                <li key={p.slug}>
                  <button type="button" onClick={() => setIdx(i)} aria-current={on || undefined}
                    className={`group relative w-full overflow-hidden rounded-2xl px-5 py-4 text-left transition ${on ? 'bg-white/[0.08] ring-1 ring-white/15' : 'hover:bg-white/[0.04]'}`}>
                    <span className="flex items-center justify-between gap-3">
                      <span>
                        <span className={`block font-display text-base font-semibold transition ${on ? 'text-white' : 'text-white/60 group-hover:text-white/90'}`}>{p.name}</span>
                        <span className="mt-0.5 block text-xs text-white/40">{p.short}</span>
                      </span>
                      <ArrowUpRight className={`h-4 w-4 shrink-0 transition ${on ? 'text-crimson-400' : 'text-white/20'}`} />
                    </span>
                    {on && !reduce && list.length > 1 && (
                      <motion.span key={`${p.slug}-${paused}`} className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-crimson-500 to-brand-sky"
                        initial={{ width: '0%' }} animate={{ width: paused ? undefined : '100%' }} transition={{ duration: CYCLE_MS / 1000, ease: 'linear' }} />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="relative [perspective:1400px]">
            <AnimatePresence mode="wait">
              <motion.div key={active.slug}
                initial={{ opacity: 0, rotateY: -8, x: 40 }} animate={{ opacity: 1, rotateY: 0, x: 0 }} exit={{ opacity: 0, rotateY: 6, x: -30 }}
                transition={{ duration: 0.6, ease }}
                className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 ring-1 ring-white/10 md:p-8">
                <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-crimson-600/25 blur-[90px]" />
                <div className="relative grid gap-8 xl:grid-cols-[1.25fr_1fr]">
                  <ProductVisual product={active} dark className="h-[280px] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] md:h-[340px]" />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-crimson-400">{productCategories.find((c) => c.id === active.category)?.label}</span>
                    <h3 className="mt-3 font-display text-3xl font-bold leading-tight text-white">{active.name}</h3>
                    <p className="mt-3 text-white/65">{active.summary}</p>
                    <ul className="mt-6 space-y-2.5">
                      {active.features.slice(0, 4).map((f, i) => (
                        <motion.li key={f} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.07, ease }}
                          className="flex items-start gap-2.5 text-sm text-white/80">
                          <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-crimson-600/20"><Check className="h-2.5 w-2.5 text-crimson-400" /></span>{f}
                        </motion.li>
                      ))}
                    </ul>
                    <div className="mt-auto flex flex-wrap gap-3 pt-8">
                      <Link href={`/products/${active.slug}`} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-navy-900 transition hover:bg-crimson-600 hover:text-white">
                        View product <ArrowUpRight className="h-4 w-4" />
                      </Link>
                      <Link href={`/products/${active.slug}#enquire`} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white">
                        Request demo
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Section>
  );
}
