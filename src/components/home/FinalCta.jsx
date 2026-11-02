import Button from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import ParticleField from '@/components/graphics/ParticleField';
import Accent from '@/components/ui/Accent';
import { resolveBg } from '@/lib/pages/backgrounds';

export default function FinalCta({
  title = 'Let’s Turn Your Vision Into Reality.',
  lead = 'Tell us about your challenge. Our consultants will respond with a clear plan, timeline and team.',
  primary = 'Start a Project',
  secondary = 'Talk to Our Team',
  bg,
}) {
  const custom = resolveBg(bg, 'dark');
  return (
    <section className="bg-white py-24">
      <div className="container">
        <Reveal className={`relative isolate overflow-hidden rounded-[2.5rem] px-8 py-24 text-center text-white md:px-16 lg:py-32 ${custom.custom ? custom.className : 'bg-navy-950'}`}>
          <div aria-hidden className="absolute inset-0 -z-20" style={custom.style} />
          {custom.overlay && <div aria-hidden className="absolute inset-0 -z-10" style={{ background: custom.overlay }} />}
          {!custom.custom && (
            <>
              <ParticleField density={0.9} tint="band" className="-z-10" />
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(5,15,36,0.85)_20%,transparent_70%)]" />
              <div className="absolute -bottom-32 left-1/2 -z-10 h-72 w-[640px] -translate-x-1/2 rounded-full bg-crimson-600/40 blur-[110px]" />
            </>
          )}
          <div className="relative mx-auto max-w-3xl">
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-white/75">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Our consultants respond to every enquiry
            </span>
            <h2 className="mt-8 text-display-lg font-extrabold text-white"><Accent text={title} accentClass="text-gradient" /></h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-white/65">{lead}</p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              {primary && <Button href="/request-consultation">{primary}</Button>}
              {secondary && <Button href="/contact" variant="ghostLight">{secondary}</Button>}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
