import Section from '@/components/ui/Section';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import { Stagger, StaggerItem } from '@/components/ui/Reveal';

// Only published (verified) case studies from the database are shown; the section hides otherwise.
export default function CaseStudies({ items, eyebrow = 'Case studies', title = 'Outcomes, not just deliverables.', bg }) {
  if (!items?.length) return null;
  return (
    <Section bg={bg} tone="light" fallback="bg-white" className="py-28 lg:py-36">
      <div className="container">
        <SectionHeading eyebrow={eyebrow} title={title} />
        <Stagger className="mt-14 grid gap-6 lg:grid-cols-2">
          {items.map((c, i) => (
            <StaggerItem key={c.id} className={i === 0 ? 'lg:row-span-2' : ''}>
              <Link href={`/case-studies/${c.slug}`} className="group relative flex h-full min-h-[280px] flex-col justify-end overflow-hidden rounded-[2rem] bg-navy-900 p-10 text-white">
                <div className="absolute inset-0 bg-grid [background-size:32px_32px] transition duration-700 group-hover:scale-110" />
                <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-crimson-600/30 blur-3xl transition duration-700 group-hover:bg-crimson-600/50" />
                <span className="relative text-xs font-semibold uppercase tracking-[0.2em] text-crimson-400">{c.industry?.name || 'Project'}</span>
                <h3 className="relative mt-3 text-2xl font-bold text-white">{c.title}</h3>
                <p className="relative mt-3 max-w-md text-white/65">{c.summary}</p>
                <ArrowUpRight className="relative mt-6 h-5 w-5 transition group-hover:-translate-y-1 group-hover:translate-x-1" />
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>
  );
}
