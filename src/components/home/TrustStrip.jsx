import Image from 'next/image';
import { BadgeCheck } from 'lucide-react';
import { certifications } from '@/data/site';

// Client logos show only when marked visible in the CMS (i.e. permission confirmed).
// Below them, an editorial marquee of the sectors Alight serves.
export default function TrustStrip({ logos = [], sectors = [] }) {
  const hasLogos = logos.length > 0;
  const words = sectors.length ? sectors : ['Government', 'Banking', 'Education', 'Cooperatives', 'Enterprise', 'Retail', 'Tourism'];

  return (
    <section aria-label="Trust and sectors" className="relative overflow-hidden bg-white pb-8 pt-6">
      <div className="container flex flex-col items-center gap-8 lg:flex-row">
        <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.22em] text-slate lg:w-56">
          {hasLogos ? 'Trusted by organisations across India' : 'Certified. Registered. Accountable.'}
        </p>
        {hasLogos ? (
          <div className="relative w-full overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
            <div className="flex w-max animate-marquee items-center gap-16 hover:[animation-play-state:paused]">
              {[...logos, ...logos].map((l, i) => (
                <Image key={`${l.id}-${i}`} src={l.logoUrl} alt={l.name} width={140} height={48} unoptimized className="h-10 w-auto object-contain opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
              ))}
            </div>
          </div>
        ) : (
          <ul className="grid w-full gap-4 sm:grid-cols-3">
            {certifications.map((c) => (
              <li key={c.code} className="group flex items-center gap-3 rounded-2xl border border-navy-900/[0.06] bg-gradient-to-br from-white to-surface px-5 py-4 transition hover:-translate-y-0.5 hover:shadow-card">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-crimson-600/10 text-crimson-600 transition group-hover:bg-crimson-600 group-hover:text-white"><BadgeCheck className="h-5 w-5" /></span>
                <span>
                  <span className="block font-display text-sm font-bold text-navy-900">{c.code}</span>
                  <span className="block text-xs text-slate">{c.title}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="relative mt-12 overflow-hidden border-y border-navy-900/[0.06] py-6 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]" aria-hidden>
        <div className="flex w-max animate-marquee items-center gap-10 [animation-duration:55s]">
          {[...words, ...words].map((w, i) => (
            <span key={i} className="flex items-center gap-10 font-display text-5xl font-extrabold tracking-tight md:text-6xl">
              <span className={i % 2 ? 'text-navy-900' : 'text-transparent [-webkit-text-stroke:1.5px_rgba(7,26,54,0.35)]'}>{w}</span>
              <span className="h-3 w-3 rotate-45 rounded-[3px] bg-crimson-600" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
