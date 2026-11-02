'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import ParticleField from '@/components/graphics/ParticleField';
import { resolveBg } from '@/lib/pages/backgrounds';

function Counter({ value, prefix = '', suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    const c = animate(0, value, { duration: 2.2, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, value, reduce]);

  return (
    <span ref={ref} className="tabular-nums">
      <span className="text-[0.6em] text-white/50">{prefix}</span>{n.toLocaleString('en-IN')}<span className="text-[0.5em] text-crimson-400">{suffix}</span>
    </span>
  );
}

// Values come from the Statistic table (admin-managed). Section hides when none are visible.
export default function Stats({ stats, label = 'Impact, measured', bg }) {
  const custom = resolveBg(bg, 'dark');
  const ref = useRef(null);
  const reduce = useReducedMotion();
  // The dark band grows from an inset rounded card to full-bleed as it scrolls into view.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.25'] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const radius = useTransform(scrollYProgress, [0, 1], [48, 0]);
  if (!stats?.length) return null;
  return (
    <div ref={ref} className="bg-white">
    <motion.section aria-label="Alight in numbers" style={{ ...custom.style, ...(reduce ? {} : { scale, borderRadius: radius }) }} className={`relative isolate overflow-hidden py-24 text-white lg:py-32 ${custom.custom ? custom.className : 'bg-navy-950'}`}>
      {custom.overlay && <div aria-hidden className="absolute inset-0 -z-10" style={{ background: custom.overlay }} />}
      {!custom.custom && (
        <>
          <ParticleField density={0.8} tint="band" className="-z-10 opacity-70" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-950 via-transparent to-navy-950" />
        </>
      )}
      <div className="container">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45">{label}</p>
        <div className={`mt-12 grid gap-y-12 sm:grid-cols-2 ${({ 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3' })[stats.length] || 'lg:grid-cols-4'}`}>
          {stats.map((s, i) => (
            <div key={s.id} className={`relative px-6 text-center ${i ? 'lg:border-l lg:border-white/10' : ''}`}>
              <div className="whitespace-nowrap bg-gradient-to-b from-white to-white/60 bg-clip-text font-display text-6xl font-extrabold tracking-tight text-transparent xl:text-7xl">
                <Counter value={s.value} prefix={s.prefix || ''} suffix={s.suffix || ''} />
              </div>
              <p className="mx-auto mt-4 max-w-[14rem] text-sm uppercase tracking-[0.18em] text-white/55">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
    </div>
  );
}
