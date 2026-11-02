// Decorative isometric stack of glass "platform layers" for inner-page heroes (pure CSS, no JS).
import Icon from '@/components/ui/Icon';

export default function HeroStack({ icon = 'Layers', labels = ['Experience', 'Platform', 'Data'] }) {
  return (
    <div className="relative mx-auto hidden h-[340px] w-full max-w-[420px] lg:block" aria-hidden>
      <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-blue/40 blur-[90px]" />
      <div className="absolute left-[60%] top-[65%] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-crimson-600/40 blur-[80px]" />
      <div className="absolute inset-0 animate-float [perspective:1200px]">
        {labels.map((label, i) => (
          <div
            key={label}
            className="absolute left-1/2 top-1/2 h-48 w-48"
            style={{ transform: `translate(-50%, calc(-50% + ${(i - 1) * 62}px)) rotateX(58deg) rotateZ(-45deg)` }}
          >
            <div className={`relative h-full w-full rounded-[28px] border backdrop-blur-xl ${i === 0 ? 'border-white/30 bg-white/[0.14]' : i === 1 ? 'border-white/20 bg-brand-sky/[0.12]' : 'border-crimson-400/30 bg-crimson-600/[0.18]'} shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]`}>
              <div className="absolute inset-4 rounded-[20px] border border-white/10 bg-grid [background-size:16px_16px]" />
              <span className="absolute bottom-3 right-4 h-2 w-2 rounded-full bg-white/70" />
            </div>
          </div>
        ))}
        <span className="absolute left-1/2 top-[24%] grid h-16 w-16 -translate-x-1/2 place-items-center rounded-2xl bg-white text-navy-900 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] ring-4 ring-white/20">
          <Icon name={icon} className="h-7 w-7" />
        </span>
      </div>
      {labels.map((label, i) => (
        <span key={label} className="glass absolute right-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/70" style={{ top: `${32 + i * 26}%` }}>{label}</span>
      ))}
    </div>
  );
}
