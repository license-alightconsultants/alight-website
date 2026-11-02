'use client';

import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { BadgeCheck, CheckCircle2, FileCheck2, LayoutDashboard, Landmark, PieChart, ShieldCheck, Wallet, Bell } from 'lucide-react';
import Button from '@/components/ui/Button';
import ParticleField from '@/components/graphics/ParticleField';
import { resolveBg } from '@/lib/pages/backgrounds';

const ease = [0.22, 1, 0.36, 1];
const defaultLines = ['Engineering', 'Tomorrow’s Digital', 'Enterprises.'];

// Illustrative interface only — labels and percentages, no invented business figures.
const toasts = [
  { icon: CheckCircle2, title: 'Payment reconciled', body: 'Treasury · just now', tone: 'text-emerald-400' },
  { icon: FileCheck2, title: 'File approved', body: 'e-File · 2 min ago', tone: 'text-brand-sky' },
  { icon: Bell, title: 'Funds released', body: 'SNA · 5 min ago', tone: 'text-crimson-400' },
];

function useParallax(mx, my, depth) {
  const x = useSpring(useTransform(mx, [-0.5, 0.5], [-depth, depth]), { stiffness: 70, damping: 20 });
  const y = useSpring(useTransform(my, [-0.5, 0.5], [-depth * 0.7, depth * 0.7]), { stiffness: 70, damping: 20 });
  return { x, y };
}

function Console() {
  const nav = [[LayoutDashboard, 'Overview'], [Wallet, 'Funds'], [Landmark, 'Treasury'], [PieChart, 'Reports']];
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0A1C3A]/95 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)] backdrop-blur">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <span className="flex gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-crimson-500" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /></span>
        <span className="ml-3 rounded-md bg-white/5 px-3 py-1 text-[10px] font-medium text-white/50">Enterprise Console</span>
        <span className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-400"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Live</span>
      </div>
      <div className="flex">
        <aside className="hidden w-32 shrink-0 border-r border-white/10 p-3 sm:block">
          {nav.map(([I, l], i) => (
            <div key={l} className={`mb-1 flex items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] font-medium ${i === 0 ? 'bg-white/10 text-white' : 'text-white/45'}`}>
              <I className={`h-3 w-3 ${i === 0 ? 'text-crimson-400' : ''}`} /> {l}
            </div>
          ))}
          <div className="mt-6 rounded-lg bg-gradient-to-br from-crimson-600/30 to-transparent p-2">
            <p className="text-[9px] font-semibold text-white/80">Audit ready</p>
            <div className="mt-1.5 h-1 rounded-full bg-white/10"><motion.div className="h-1 rounded-full bg-crimson-400" initial={{ width: 0 }} animate={{ width: '92%' }} transition={{ delay: 1.6, duration: 1.4, ease }} /></div>
          </div>
        </aside>
        <div className="flex-1 space-y-3 p-4">
          <div className="grid grid-cols-3 gap-2.5">
            {[['Released', 84, '#ABD2FF'], ['Utilised', 62, '#EA5361'], ['Reconciled', 97, '#34D399']].map(([l, v, c], i) => (
              <div key={l} className="rounded-xl bg-white/[0.05] p-3 ring-1 ring-white/5">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-white/40">{l}</p>
                <p className="mt-1 font-display text-xl font-bold text-white"><Count to={v} delay={1 + i * 0.15} />%</p>
                <div className="mt-2 h-1 rounded-full bg-white/10"><motion.div className="h-1 rounded-full" style={{ background: c }} initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ delay: 1 + i * 0.15, duration: 1.3, ease }} /></div>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-white/[0.05] p-3 ring-1 ring-white/5">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-white/40">Fund flow · this year</p>
              <div className="flex gap-3 text-[9px] text-white/40"><span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded bg-brand-sky" />Released</span><span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded bg-crimson-400" />Utilised</span></div>
            </div>
            <svg viewBox="0 0 320 110" className="mt-2 h-28 w-full" aria-hidden>
              <defs>
                <linearGradient id="heroArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#ABD2FF" stopOpacity="0.4" /><stop offset="1" stopColor="#ABD2FF" stopOpacity="0" /></linearGradient>
              </defs>
              {[25, 55, 85].map((y) => <line key={y} x1="0" x2="320" y1={y} y2={y} stroke="rgba(255,255,255,0.06)" />)}
              <motion.path d="M0,90 C30,84 45,62 75,64 C105,66 120,36 150,40 C180,44 195,70 225,58 C255,46 270,18 320,16 L320,110 L0,110 Z" fill="url(#heroArea)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 1 }} />
              <motion.path d="M0,90 C30,84 45,62 75,64 C105,66 120,36 150,40 C180,44 195,70 225,58 C255,46 270,18 320,16" fill="none" stroke="#ABD2FF" strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1, duration: 2, ease }} />
              <motion.path d="M0,100 C40,96 70,84 110,86 C150,88 190,70 230,72 C270,74 290,56 320,52" fill="none" stroke="#EA5361" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.3, duration: 2, ease }} />
              <motion.circle cx="320" cy="16" r="4" fill="#ABD2FF" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.9 }} />
            </svg>
          </div>
          <div className="space-y-1.5">
            {[['Scheme release', 'APPROVED', 'bg-emerald-500/15 text-emerald-300'], ['Agency utilisation', 'IN REVIEW', 'bg-amber-500/15 text-amber-300'], ['Bank reconciliation', 'MATCHED', 'bg-brand-sky/15 text-brand-sky']].map(([l, s, c], i) => (
              <motion.div key={l} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.8 + i * 0.12, ease }} className="flex items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-white/5"><FileCheck2 className="h-3 w-3 text-white/60" /></span>
                <span className="flex-1 text-[10px] font-medium text-white/75">{l}</span>
                <span className={`rounded px-1.5 py-0.5 text-[8px] font-bold tracking-wide ${c}`}>{s}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Count({ to, delay }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = setTimeout(() => {
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / 1300);
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay * 1000);
    return () => clearTimeout(start);
  }, [to, delay]);
  return <span className="tabular-nums">{n}</span>;
}

function Phone() {
  return (
    <div className="w-[150px] rounded-[26px] border border-white/15 bg-navy-950 p-1.5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
      <div className="overflow-hidden rounded-[20px] bg-white">
        <div className="bg-gradient-to-br from-crimson-600 to-crimson-500 px-3 pb-4 pt-3 text-white">
          <span className="mx-auto mb-3 block h-1 w-10 rounded-full bg-white/40" />
          <p className="text-[8px] font-semibold uppercase tracking-wider text-white/70">Citizen services</p>
          <p className="font-display text-sm font-bold">Track request</p>
        </div>
        <div className="space-y-1.5 p-2.5">
          {['Submitted', 'Assigned', 'Resolved'].map((s, i) => (
            <div key={s} className="flex items-center gap-2 rounded-lg bg-surface p-1.5">
              <span className={`grid h-4 w-4 place-items-center rounded-full ${i < 2 ? 'bg-emerald-500' : 'bg-navy-900/15'}`}>{i < 2 && <CheckCircle2 className="h-2.5 w-2.5 text-white" />}</span>
              <span className="text-[9px] font-semibold text-navy-900">{s}</span>
            </div>
          ))}
          <div className="rounded-lg bg-navy-900 py-1.5 text-center text-[9px] font-semibold text-white">View details</div>
        </div>
      </div>
    </div>
  );
}

function ToastStack() {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((v) => (v + 1) % toasts.length), 3200); return () => clearInterval(t); }, []);
  const t = toasts[i];
  return (
    <div className="relative h-[58px] w-[220px]">
      <AnimatePresence mode="popLayout">
        <motion.div key={i} initial={{ opacity: 0, y: 16, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -16, scale: 0.95 }} transition={{ duration: 0.5, ease }}
          className="glass absolute inset-0 flex items-center gap-3 rounded-2xl px-4 shadow-glow">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10"><t.icon className={`h-4 w-4 ${t.tone}`} /></span>
          <span><span className="block text-xs font-semibold text-white">{t.title}</span><span className="block text-[10px] text-white/50">{t.body}</span></span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Scene({ mx, my }) {
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [10, 2]), { stiffness: 60, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-16, -6]), { stiffness: 60, damping: 20 });
  const back = useParallax(mx, my, 10);
  const mid = useParallax(mx, my, 22);
  const front = useParallax(mx, my, 38);

  return (
    <div className="relative mx-auto w-full max-w-[640px] [perspective:1600px]">
      {/* ambient light */}
      <div className="absolute -inset-10 -z-10">
        <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-brand-blue/40 blur-[110px]" />
        <div className="absolute bottom-0 right-10 h-56 w-56 rounded-full bg-crimson-600/35 blur-[100px]" />
      </div>
      <motion.svg style={back} viewBox="0 0 600 600" className="absolute -inset-16 -z-10 h-[calc(100%+8rem)] w-[calc(100%+8rem)] opacity-70" aria-hidden>
        <circle cx="300" cy="300" r="270" fill="none" stroke="#ABD2FF" strokeOpacity="0.08" />
        <circle cx="300" cy="300" r="200" fill="none" stroke="#ABD2FF" strokeOpacity="0.1" strokeDasharray="2 8" className="origin-center animate-spin-slow" style={{ transformOrigin: '300px 300px' }} />
        <circle cx="570" cy="300" r="4" fill="#EA5361" />
      </motion.svg>

      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: 20 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1.2, delay: 0.3, ease }}
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
      >
        <motion.div style={mid}><Console /></motion.div>
      </motion.div>

      <motion.div style={front} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2, duration: 0.9, ease }}
        className="absolute -bottom-10 -left-6 hidden sm:block lg:-left-14">
        <div className="animate-float"><Phone /></div>
      </motion.div>

      <motion.div style={front} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6, duration: 0.8, ease }}
        className="absolute -right-4 -top-8 hidden sm:block lg:-right-10">
        <ToastStack />
      </motion.div>

      <motion.div style={mid} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2, duration: 0.7, ease }}
        className="glass absolute -bottom-6 right-6 hidden items-center gap-3 rounded-2xl px-4 py-3 shadow-glow sm:flex">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-blue to-navy-600"><ShieldCheck className="h-4 w-4 text-white" /></span>
        <span><span className="block text-xs font-semibold text-white">ISO 27001</span><span className="block text-[10px] text-white/50">Information security</span></span>
      </motion.div>
    </div>
  );
}

// Text, buttons and background are edited in Admin → Pages → Home.
export default function Hero({
  counts,
  badge = 'Certified',
  badgeText = 'ISO 9001:2015 · ISO 27001 · GeM Registered',
  lines: headline = defaultLines,
  lead = 'Transforming complex business challenges into intelligent, scalable and innovative technology solutions.',
  primary = 'Explore Our Solutions',
  primaryHref = '/products',
  secondary = 'Talk to Our Experts',
  secondaryHref = '/contact',
  showCounters = true,
  showTerrain = true,
  bg,
}) {
  const lines = headline.map((l) => l.split(/\s+/).filter(Boolean));
  const custom = resolveBg(bg, 'dark');
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yText = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const yVisual = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section ref={ref} onMouseMove={onMove} className={`noise relative isolate overflow-hidden pt-[76px] text-white ${custom.custom ? custom.className : 'bg-navy-900'}`} style={custom.style}>
      {custom.overlay && <div aria-hidden className="absolute inset-0 -z-10" style={{ background: custom.overlay }} />}
      {!custom.custom && <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_35%,#123D70_0%,#071A36_50%,#050F24_100%)]" />}
      {showTerrain && <ParticleField className="-z-10 opacity-90 [mask-image:linear-gradient(to_bottom,transparent_25%,black_70%)]" />}
      <div className="absolute inset-0 -z-10 bg-grid [background-size:64px_64px] opacity-50 [mask-image:radial-gradient(ellipse_at_60%_30%,black_10%,transparent_60%)]" />
      <div className="absolute -bottom-40 -left-40 -z-10 h-[520px] w-[520px] animate-aurora-slow rounded-full bg-crimson-600/25 blur-[140px]" />
      {/* drifting aurora light */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 right-[8%] h-[480px] w-[620px] animate-aurora rounded-full bg-[radial-gradient(closest-side,rgba(40,100,165,0.55),transparent)] blur-3xl" />
        <div className="absolute left-[22%] top-[38%] h-[360px] w-[460px] animate-aurora-slow rounded-full bg-[radial-gradient(closest-side,rgba(102,131,188,0.28),transparent)] blur-3xl" />
      </div>
      {/* light beam */}
      <div className="pointer-events-none absolute -top-40 left-[38%] -z-10 h-[700px] w-[260px] rotate-[24deg] bg-gradient-to-b from-brand-sky/20 via-brand-sky/5 to-transparent blur-2xl" />

      <div className="container grid min-h-[calc(100svh-76px)] items-center gap-16 pb-28 pt-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
        <motion.div style={{ y: yText, opacity: fade }} className="relative z-10">
          <motion.span initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}
            className="glass inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-xs font-medium text-white/80">
            <span className="flex items-center gap-1 rounded-full bg-crimson-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"><BadgeCheck className="h-3 w-3" /> {badge}</span>
            {badgeText}
          </motion.span>

          <h1 className="mt-8 font-display text-[clamp(2.5rem,4.6vw,4.15rem)] font-extrabold leading-[1.04] tracking-[-0.035em] text-white">
            {lines.map((line, li) => (
              <span key={li} className={`block lg:whitespace-nowrap ${li === lines.length - 1 ? 'text-gradient' : ''}`}>
                {line.map((word, wi) => (
                  <span key={wi} className="mr-[0.22em] inline-block overflow-hidden pb-[0.1em] align-bottom">
                    <motion.span className="inline-block" initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.15 + (li * 2 + wi) * 0.09, ease }}>
                      {word}
                    </motion.span>
                  </span>
                ))}
              </span>
            ))}
          </h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6, ease }}
            className="mt-7 max-w-xl text-lg leading-relaxed text-white/70 md:text-xl">
            {lead}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.75, ease }} className="mt-10 flex flex-wrap gap-4">
            {primary && <Button href={primaryHref || '/products'}>{primary}</Button>}
            {secondary && <Button href={secondaryHref || '/contact'} variant="ghostLight">{secondary}</Button>}
          </motion.div>

          {showCounters && <motion.dl initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }} className="border-glow mt-14 flex max-w-lg divide-x divide-white/10 rounded-2xl bg-white/[0.04] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur-md">
            {[[counts.products, 'Enterprise products'], [counts.services, 'Service lines'], [counts.industries, 'Industries served']].map(([n, l]) => (
              <div key={l} className="flex-1 px-5 py-4">
                <dt className="sr-only">{l}</dt>
                <dd className="bg-gradient-to-b from-white to-brand-sky bg-clip-text font-display text-3xl font-bold text-transparent">{n}</dd>
                <dd className="mt-0.5 text-[11px] uppercase tracking-wider text-white/50">{l}</dd>
              </div>
            ))}
          </motion.dl>}
        </motion.div>

        <motion.div style={{ y: yVisual }} className="relative">
          <Scene mx={mx} my={my} />
        </motion.div>
      </div>

      {/* curved transition into the next section */}
      <svg className="absolute inset-x-0 bottom-0 h-16 w-full text-white" viewBox="0 0 1440 64" preserveAspectRatio="none" aria-hidden>
        <path d="M0,64 C360,0 1080,0 1440,64 Z" fill="currentColor" />
      </svg>
    </section>
  );
}
