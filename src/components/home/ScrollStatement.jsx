'use client';

import { useRef } from 'react';
import Section from '@/components/ui/Section';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

function Word({ children, progress, range, accent }) {
  const reduce = useReducedMotion();
  const opacity = useTransform(progress, range, [0.12, 1]);
  const y = useTransform(progress, range, [6, 0]);
  return (
    <motion.span style={reduce ? undefined : { opacity, y }} className={`mr-[0.25em] inline-block ${accent ? 'text-crimson-600' : ''}`}>
      {children}
    </motion.span>
  );
}

// Words light up one by one as the statement scrolls through the viewport.
// Words wrapped in *asterisks* are shown in red.
export default function ScrollStatement({ text, eyebrow = 'Our promise', bg }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] });
  const words = String(text).split(/\s+/).filter(Boolean).map((w) => {
    const m = w.match(/^\*(.+)\*([.,;:!?—]*)$/);
    return m ? { w: m[1] + m[2], accent: true } : { w: w.replace(/\*/g, ''), accent: false };
  });
  return (
    <Section aria-label={eyebrow || 'Our promise'} bg={bg} fallback="bg-white" className="py-24 lg:py-32">
      <div className="container">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <p ref={ref} className="mt-6 max-w-5xl font-display text-[clamp(1.75rem,4.2vw,3.6rem)] font-bold leading-[1.15] tracking-tight text-navy-900">
          {words.map(({ w, accent }, i) => (
            <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} accent={accent}>
              {w}
            </Word>
          ))}
        </p>
      </div>
    </Section>
  );
}
