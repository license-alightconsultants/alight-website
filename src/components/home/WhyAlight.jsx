import Section from '@/components/ui/Section';
import { Target, Layers, Building, Code2, Users, ShieldCheck, LifeBuoy, Check } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import { Stagger, StaggerItem } from '@/components/ui/Reveal';

// Bento grid: each reason gets a small, purpose-drawn illustration. No figures are implied.
function MiniArch() {
  return (
    <div className="mt-6 grid grid-cols-3 gap-1.5" aria-hidden>
      {[3, 2, 1].map((n, row) => Array.from({ length: n }).map((_, i) => (
        <span key={`${row}-${i}`} className={`h-6 rounded-md ${row === 2 ? 'col-span-3 bg-crimson-600/80' : row === 1 ? 'bg-brand-sky/40' : 'bg-white/15'} ${row === 1 && i === 1 ? 'col-span-2' : ''}`} />
      )))}
    </div>
  );
}

function MiniCode() {
  return (
    <pre className="mt-6 overflow-hidden rounded-xl bg-navy-950/80 p-3 font-mono text-[11px] leading-relaxed text-white/70 ring-1 ring-white/10" aria-hidden>
      <span className="text-crimson-400">const</span> platform = <span className="text-brand-sky">build</span>({'{'}{'\n'}
      {'  '}process: <span className="text-emerald-300">&apos;yours&apos;</span>,{'\n'}
      {'  '}scale: <span className="text-emerald-300">&apos;enterprise&apos;</span>,{'\n'}
      {'}'});
    </pre>
  );
}

function MiniTeam() {
  return (
    <div className="mt-6 flex items-center" aria-hidden>
      {['ASP', 'RE', 'FL', 'UX', 'NG'].map((t, i) => (
        <span key={t} className={`-ml-2 grid h-10 w-10 place-items-center rounded-full border-2 border-white text-[10px] font-bold text-white first:ml-0 ${['bg-navy-700', 'bg-brand-blue', 'bg-crimson-600', 'bg-navy-900', 'bg-brand-mist'][i]}`}>{t}</span>
      ))}
      <span className="ml-3 text-xs font-medium text-slate">Dedicated specialists</span>
    </div>
  );
}

function MiniShield() {
  return (
    <div className="mt-6 flex flex-wrap gap-2" aria-hidden>
      {['ISO 9001:2015', 'ISO 27001'].map((c) => (
        <span key={c} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20"><Check className="h-3 w-3" />{c}</span>
      ))}
    </div>
  );
}

function MiniSupport() {
  return (
    <div className="mt-6 flex items-end gap-1" aria-hidden>
      {['Go-live', 'Month 1', 'Month 6', 'Year 1', 'Year 2+'].map((l, i) => (
        <div key={l} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="w-full rounded-t-md bg-gradient-to-t from-brand-blue to-brand-sky" style={{ height: 14 + i * 9 }} />
          <span className="text-[9px] font-medium text-slate">{l}</span>
        </div>
      ))}
    </div>
  );
}

const tiles = [
  { icon: Target, title: 'Business-focused engineering', body: 'We start from your process and outcomes, not from a technology preference.', span: 'lg:col-span-2 lg:row-span-2', dark: true, extra: MiniCode, big: true },
  { icon: Layers, title: 'Scalable architecture', body: 'Modular systems that grow with users, data and departments.', span: 'lg:col-span-2', dark: true, extra: MiniArch },
  { icon: Building, title: 'Enterprise expertise', body: 'Fund management, treasury, ERP and e-governance platforms.', span: '' },
  { icon: Code2, title: 'Custom development', body: 'Tailored where off-the-shelf software doesn’t fit.', span: '' },
  { icon: Users, title: 'Dedicated teams', body: 'ASP.NET, Flutter, React, AngularJS and UI/UX specialists.', span: 'lg:col-span-2', extra: MiniTeam },
  { icon: ShieldCheck, title: 'Quality assurance', body: 'Certified quality processes and information security.', span: '', extra: MiniShield },
  { icon: LifeBuoy, title: 'Long-term support', body: 'Maintenance and enhancements long after go-live.', span: 'lg:col-span-1', extra: MiniSupport },
];

export default function WhyAlight({ eyebrow = 'Why Alight', title = 'A partner engineered for the long term.', bg }) {
  return (
    <Section bg={bg} tone="light" fallback="bg-surface" className="relative overflow-hidden py-28 lg:py-36">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-navy-900/10 to-transparent" />
      <div className="container">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading eyebrow={eyebrow} title={title} />
          <p className="max-w-md text-lg text-slate">Disciplined delivery, specialised domain knowledge and a commitment that continues after launch.</p>
        </div>

        <Stagger className="mt-14 grid auto-rows-[minmax(200px,auto)] gap-4 md:grid-cols-2 lg:grid-cols-4" stagger={0.06}>
          {tiles.map(({ icon: I, title, body, span, dark, extra: Extra, big }) => (
            <StaggerItem key={title}
              className={`group relative overflow-hidden rounded-[1.75rem] p-7 transition duration-500 hover:-translate-y-1 ${span} ${dark ? 'bg-navy-900 text-white hover:shadow-glow' : 'bg-white shadow-card ring-1 ring-navy-900/5 hover:shadow-[0_24px_60px_-24px_rgba(7,26,54,0.25)]'}`}>
              {dark && <div className="absolute inset-0 bg-grid [background-size:26px_26px] opacity-70" />}
              {dark && <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-crimson-600/25 blur-[70px] transition duration-700 group-hover:bg-crimson-600/40" />}
              <div className="relative flex h-full flex-col">
                <span className={`grid h-11 w-11 place-items-center rounded-xl transition ${dark ? 'bg-white/10 text-brand-sky group-hover:bg-crimson-600 group-hover:text-white' : 'bg-surface text-navy-700 group-hover:bg-navy-900 group-hover:text-white'}`}>
                  <I className="h-5 w-5" />
                </span>
                <h3 className={`mt-5 font-display font-bold ${big ? 'text-3xl leading-tight' : 'text-xl'} ${dark ? 'text-white' : ''}`}>{title}</h3>
                <p className={`mt-2 ${big ? 'text-lg' : 'text-sm'} ${dark ? 'text-white/65' : 'text-slate'}`}>{body}</p>
                {Extra && <div className="mt-auto"><Extra /></div>}
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>
  );
}
