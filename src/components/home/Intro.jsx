import Section from '@/components/ui/Section';
import { MapPin, BadgeCheck } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import Button from '@/components/ui/Button';

const defaultPrinciples = [
  ['Process-driven', 'Every engagement follows documented, ISO-certified quality processes.'],
  ['Specialised', 'Deep focus on financial technology, government systems and enterprise ERP.'],
  ['Committed to timelines', 'Discipline and accountability from requirement to rollout.'],
];

// "*word*" in the heading gets the red hand-drawn underline.
function UnderlinedTitle({ text }) {
  return String(text).split(/\*([^*]+)\*/g).map((p, i) =>
    i % 2 ? (
      <span key={i} className="relative whitespace-nowrap text-crimson-600">{p}<svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 10" preserveAspectRatio="none" aria-hidden><path d="M0 7 Q 100 0 200 7" stroke="currentColor" strokeWidth="3" fill="none" /></svg></span>
    ) : p,
  );
}

function Seal() {
  const text = 'ISO 9001:2015 • ISO 27001 • GEM REGISTERED • ';
  return (
    <div className="relative grid h-32 w-32 place-items-center rounded-full bg-white shadow-card ring-1 ring-navy-900/5">
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full animate-spin-slow" aria-hidden>
        <defs><path id="sealPath" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" /></defs>
        <text fontSize="9.2" fontWeight="700" letterSpacing="1.6" fill="#071A36"><textPath href="#sealPath">{text}{text.slice(0, 8)}</textPath></text>
      </svg>
      <span className="grid h-14 w-14 place-items-center rounded-full bg-crimson-600 text-white shadow-red"><BadgeCheck className="h-7 w-7" /></span>
    </div>
  );
}

function IntroVisual({ city }) {
  return (
    <div className="relative mt-12 h-[300px] max-w-xl">
      <div className="absolute inset-y-0 left-0 right-16 overflow-hidden rounded-[2rem] bg-navy-900 p-8 text-white">
        <div className="absolute inset-0 bg-grid [background-size:28px_28px]" />
        <div className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-crimson-600/40 blur-[80px]" />
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-brand-blue/50 blur-[80px]" />
        <div className="relative flex h-full flex-col justify-end">
          <span className="font-display text-6xl font-extrabold leading-none text-white/10">“</span>
          <p className="font-display text-2xl font-bold leading-snug">Believing<br />Innovations.</p>
          <p className="mt-2 max-w-[16rem] text-sm text-white/60">Continuous iteration and refinement of every idea — our motto since inception.</p>
        </div>
      </div>
      <div className="absolute -top-6 right-0"><Seal /></div>
      <div className="absolute -bottom-6 right-4 flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-card ring-1 ring-navy-900/5">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface text-crimson-600"><MapPin className="h-5 w-5" /></span>
        <span><span className="block text-[11px] uppercase tracking-wider text-slate">Head office</span><span className="font-display font-bold text-navy-900">{city}, India</span></span>
      </div>
    </div>
  );
}

export default function Intro({
  city = 'Ahmedabad',
  eyebrow = 'Who we are',
  title = 'Where Technology Meets *Business* Transformation.',
  lead = 'Alight Consultants is a process-driven organisation focused on innovation and digital transformation.',
  body,
  principles = defaultPrinciples,
  bg,
}) {
  const paras = body
    ? body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    : [`From our base in ${city}, we design and build next-generation technology — enterprise software, financial platforms, e-governance systems and digital products — that turn abstract ideas into products people rely on every day.`, 'Our philosophy is simple: iterate continuously, refine collaboratively and deliver with discipline.'];
  return (
    <Section bg={bg} fallback="bg-white" className="relative overflow-hidden py-28 lg:py-36">
      <div className="absolute right-0 top-0 h-full w-1/3 bg-grid-light [background-size:40px_40px] [mask-image:linear-gradient(to_left,black,transparent)]" />
      <div className="container relative grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-6">
          {eyebrow && <Reveal><span className="eyebrow">{eyebrow}</span></Reveal>}
          <Reveal delay={0.05}>
            <h2 className="mt-5 text-display-lg font-bold">
              <UnderlinedTitle text={title} />
            </h2>
          </Reveal>
          <Reveal delay={0.15}><IntroVisual city={city} /></Reveal>
        </div>
        <div className="lg:col-span-6 lg:pl-8 lg:pt-14">
          <Reveal delay={0.1}>
            <p className="text-xl leading-relaxed text-navy-900">{lead}</p>
            {paras.map((p) => <p key={p} className="mt-5 text-lg leading-relaxed text-slate">{p}</p>)}
            <Button href="/about" variant="outline" className="mt-8">More about Alight</Button>
          </Reveal>
          <div className="mt-12 space-y-3">
            {principles.map(([t, b], i) => {
              const n = String(i + 1).padStart(2, '0');
              return (
              <Reveal key={t} delay={0.1 + i * 0.08} className="group flex gap-5 rounded-2xl border border-navy-900/[0.07] p-6 transition duration-500 hover:-translate-y-0.5 hover:border-transparent hover:bg-navy-900 hover:shadow-glow">
                <span className="font-display text-sm font-bold text-crimson-600 transition group-hover:text-crimson-400">{n}</span>
                <span>
                  <span className="block font-display text-lg font-bold text-navy-900 transition group-hover:text-white">{t}</span>
                  {b && <span className="mt-1 block text-slate transition group-hover:text-white/65">{b}</span>}
                </span>
              </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
}
