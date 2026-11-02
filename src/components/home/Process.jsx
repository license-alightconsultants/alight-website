'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ClipboardList, Code2, LifeBuoy, PenTool, Rocket } from 'lucide-react';

import Accent from '@/components/ui/Accent';
import { resolveBg } from '@/lib/pages/backgrounds';

// How an engagement runs — Alight's documented, ISO-aligned delivery process (editable in Admin → Pages).
const ICONS = [ClipboardList, PenTool, Code2, Rocket, LifeBuoy];
const defaultSteps = [
  ['Discover', 'Requirement engineering', 'Workshops with your stakeholders to map the process, rules and integrations before a line of code is written.'],
  ['Design', 'Architecture & UX', 'Architecture, data model and screen flows reviewed and signed off — so scope, cost and timeline are clear upfront.'],
  ['Build', 'Agile delivery', 'Iterative sprints with working software at every review, backed by code reviews and documented QA.'],
  ['Deploy', 'Go-live', 'Secure rollout on your cloud or on-premise servers, data migration and hands-on user training.'],
  ['Support', 'Continual improvement', 'Long-term maintenance, enhancements and responsive support as your organisation grows.'],
];

function Card({ step, i, fluid = false }) {
  const I = ICONS[i % ICONS.length];
  return (
    <article className={`group relative flex shrink-0 flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur transition duration-500 hover:border-white/25 hover:bg-white/[0.07] ${fluid ? 'w-full gap-5 p-6 sm:p-7' : 'h-[380px] w-[300px] p-8 sm:w-[360px]'}`}>
      <span className="pointer-events-none absolute -right-4 -top-8 font-display text-[9rem] font-extrabold leading-none text-white/[0.04]">{String(i + 1).padStart(2, '0')}</span>
      <div className="absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-crimson-600/0 blur-[80px] transition duration-700 group-hover:bg-crimson-600/30" />
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-crimson-500 to-crimson-700 text-white shadow-red">
        <I className="h-6 w-6" />
      </span>
      <p className={`${fluid ? '' : 'mt-auto'} text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-sky`}>Step {String(i + 1).padStart(2, '0')}{step.tag ? ` · ${step.tag}` : ''}</p>
      <h3 className={`font-display font-bold text-white ${fluid ? '-mt-3 text-2xl' : 'mt-3 text-3xl'}`}>{step.title}</h3>
      <p className={`${fluid ? '-mt-3' : 'mt-3'} text-sm leading-relaxed text-white/60`}>{step.body}</p>
    </article>
  );
}

export default function Process({
  eyebrow = 'How we deliver',
  title = 'A documented path from idea to *go-live.*',
  lead = 'Five stages, the same discipline every time — so you always know what happens next.',
  steps: rows = defaultSteps,
  bg,
}) {
  const steps = rows.map(([title, tag = '', body = '']) => ({ title, tag, body }));
  const custom = resolveBg(bg, 'dark');
  const bgClass = custom.custom ? custom.className : 'bg-navy-950';
  const ref = useRef(null);
  const track = useRef(null);
  const [dist, setDist] = useState(0);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });
  // Pins the section and slides the track horizontally as the page scrolls vertically.
  const x = useTransform(smooth, [0.05, 0.95], [0, -dist]);

  useEffect(() => {
    const measure = () => track.current && setDist(Math.max(0, track.current.scrollWidth - window.innerWidth));
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [reduce]);
  const bar = useTransform(smooth, [0.05, 0.95], [0, 1]);

  const heading = (
    <div className="max-w-xl">
      {eyebrow && <p className="eyebrow !text-brand-sky">{eyebrow}</p>}
      <h2 className="mt-4 text-display-md font-extrabold text-white"><Accent text={title} accentClass="text-gradient" /></h2>
      {lead && <p className="mt-5 text-white/60">{lead}</p>}
    </div>
  );

  // Phones/tablets (and reduced motion): a plain vertical timeline. No pinning, no sideways scrolling.
  const timeline = (
    <ol className="relative mt-10 space-y-4 before:absolute before:bottom-6 before:left-[52px] sm:before:left-[56px] before:top-6 before:w-px before:bg-gradient-to-b before:from-brand-sky/50 before:via-crimson-500/40 before:to-transparent sm:mt-12">
      {steps.map((s, i) => <li key={`${s.title}-${i}`} className="relative"><Card step={s} i={i} fluid /></li>)}
    </ol>
  );

  if (reduce) {
    return (
      <section className={`relative isolate py-24 ${bgClass}`} style={custom.style}>
        {custom.overlay && <div aria-hidden className="absolute inset-0 -z-10" style={{ background: custom.overlay }} />}
        <div className="container">{heading}{timeline}</div>
      </section>
    );
  }

  return (
    <>
    <section aria-label={eyebrow || 'How we deliver'} className={`relative isolate overflow-hidden py-20 sm:py-24 lg:hidden ${bgClass}`} style={custom.style}>
      {custom.overlay && <div aria-hidden className="absolute inset-0 -z-10" style={{ background: custom.overlay }} />}
      <div className="absolute -left-40 top-10 -z-10 h-80 w-80 rounded-full bg-brand-blue/25 blur-[120px]" />
      <div className="container">{heading}{timeline}</div>
    </section>
    <section ref={ref} aria-label={eyebrow || 'How we deliver'} className={`relative hidden h-[300vh] lg:block ${bgClass}`}>
      <div className={`sticky top-0 isolate flex h-screen flex-col justify-center overflow-hidden ${bgClass}`} style={custom.style}>
        {custom.overlay && <div aria-hidden className="absolute inset-0 -z-10" style={{ background: custom.overlay }} />}
        <div className="absolute inset-0 bg-grid [background-size:56px_56px] opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="absolute -left-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-brand-blue/25 blur-[140px]" />
        <div className="container relative">
          {heading}
          <div className="mt-10 h-px w-full max-w-md bg-white/10">
            <motion.div style={{ scaleX: bar }} className="h-px origin-left bg-gradient-to-r from-brand-sky to-crimson-500" />
          </div>
        </div>
        <motion.div ref={track} style={{ x }} className="relative mt-10 flex w-max gap-6 px-5 lg:px-[max(2rem,calc((100vw-1320px)/2+2rem))]">
          {steps.map((s, i) => <Card key={`${s.title}-${i}`} step={s} i={i} />)}
        </motion.div>
      </div>
    </section>
    </>
  );
}
