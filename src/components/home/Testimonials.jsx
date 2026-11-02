'use client';

import Section from '@/components/ui/Section';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

// Renders approved testimonials only; returns nothing when there are none.
export default function Testimonials({ items, bg }) {
  const [i, setI] = useState(0);
  if (!items?.length) return null;
  const t = items[i];
  const go = (d) => setI((i + d + items.length) % items.length);

  return (
    <Section bg={bg} fallback="bg-surface" className="py-28">
      <div className="container max-w-4xl text-center">
        <Quote className="mx-auto h-10 w-10 text-crimson-600" />
        <AnimatePresence mode="wait">
          <motion.figure key={t.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }}>
            <blockquote className="mt-8 font-display text-2xl font-semibold leading-snug text-navy-900 md:text-3xl">“{t.content}”</blockquote>
            <figcaption className="mt-8 text-sm text-slate">
              <strong className="text-navy-900">{t.name}</strong>
              {t.designation && ` · ${t.designation}`}
              {t.organization && `, ${t.organization}`}
            </figcaption>
          </motion.figure>
        </AnimatePresence>
        {items.length > 1 && (
          <div className="mt-10 flex justify-center gap-3">
            <button type="button" aria-label="Previous testimonial" onClick={() => go(-1)} className="grid h-11 w-11 place-items-center rounded-full bg-white ring-1 ring-navy-900/10 hover:bg-navy-900 hover:text-white"><ChevronLeft className="h-5 w-5" /></button>
            <button type="button" aria-label="Next testimonial" onClick={() => go(1)} className="grid h-11 w-11 place-items-center rounded-full bg-white ring-1 ring-navy-900/10 hover:bg-navy-900 hover:text-white"><ChevronRight className="h-5 w-5" /></button>
          </div>
        )}
      </div>
    </Section>
  );
}
