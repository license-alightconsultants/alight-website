import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import TechSphere from '@/components/graphics/TechSphere';
import { Reveal } from '@/components/ui/Reveal';
import { technologies } from '@/data/industries';

export default function TechEcosystem({
  eyebrow = 'Technology ecosystem',
  title = 'Proven stacks. Modern engineering.',
  lead = 'We choose technology for longevity, security and the skills of the teams who will maintain it.',
  bg,
}) {
  const groups = [...new Set(technologies.map((t) => t.group))];
  return (
    <Section bg={bg} tone="dark" fallback="bg-navy-950" className="relative overflow-hidden py-28 text-white lg:py-36">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_50%,#123D70,transparent_55%)]" />
      <div className="absolute inset-0 bg-grid [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_70%_50%,black,transparent_70%)]" />
      <div className="container relative grid items-center gap-10 md:gap-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionHeading dark eyebrow={eyebrow} title={title} lead={lead} />
          <dl className="mt-12 grid grid-cols-2 gap-3">
            {groups.map((g, i) => (
              <Reveal key={g} delay={i * 0.05} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/25 hover:bg-white/[0.06]">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-crimson-400">{g}</dt>
                <dd className="mt-1.5 text-sm text-white/80">{technologies.filter((t) => t.group === g).map((t) => t.name).join(' · ')}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
        {/* The 3D sphere needs room; on phones the grouped list above already shows every technology. */}
        <div className="hidden md:block"><TechSphere items={technologies} /></div>
      </div>
    </Section>
  );
}
