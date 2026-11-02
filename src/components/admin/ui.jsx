import Link from 'next/link';

export function PageHeader({ title, description, actions, back }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {back && <Link href={back.href} className="text-xs font-medium text-slate hover:text-navy-900">← {back.label}</Link>}
        <h1 className="mt-1 font-display text-[1.75rem] font-extrabold tracking-tight text-navy-900">{title}</h1>
        <span aria-hidden className="mt-2 block h-1 w-10 rounded-full bg-gradient-to-r from-crimson-600 to-brand-blue" />
        {description && <p className="mt-2.5 text-sm text-slate">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, actions, children, className = '', padded = true }) {
  return (
    <section className={`rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(7,26,54,0.03),0_8px_24px_-16px_rgba(7,26,54,0.12)] transition-shadow duration-300 hover:shadow-[0_1px_2px_rgba(7,26,54,0.04),0_16px_40px_-18px_rgba(7,26,54,0.2)] ${className}`}>
      {title && (
        <header className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-b from-slate-50/60 to-transparent px-5 py-4">
          <h2 className="font-display text-[15px] font-bold text-navy-900">{title}</h2>
          {actions}
        </header>
      )}
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </section>
  );
}

const btn = {
  primary: 'bg-gradient-to-b from-navy-700 to-navy-900 text-white shadow-[0_6px_16px_-8px_rgba(7,26,54,0.7)] hover:from-navy-600 hover:to-navy-800',
  accent: 'bg-gradient-to-b from-crimson-500 to-crimson-600 text-white shadow-[0_8px_20px_-8px_rgba(199,22,28,0.6)] hover:from-crimson-400 hover:to-crimson-500',
  outline: 'border border-slate-200 bg-white text-navy-900 shadow-[0_1px_2px_rgba(7,26,54,0.05)] hover:border-slate-300 hover:bg-slate-50',
  danger: 'border border-red-200 bg-white text-red-700 hover:bg-red-50',
  ghost: 'text-slate hover:bg-slate-100 hover:text-navy-900',
};

export const buttonClass = (variant = 'primary', size = 'md') =>
  `inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 ${size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm'} ${btn[variant]}`;

export function LinkButton({ href, variant, size, children, ...props }) {
  return <Link href={href} className={buttonClass(variant, size)} {...props}>{children}</Link>;
}

const tones = {
  NEW: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  CONTACTED: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  IN_DISCUSSION: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  PROPOSAL_SENT: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  CONVERTED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  CLOSED: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  PUBLISHED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  SCHEDULED: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  DRAFT: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  SENT: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  FAILED: 'bg-red-50 text-red-700 ring-red-600/20',
  SKIPPED: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  PENDING: 'bg-amber-50 text-amber-800 ring-amber-600/20',
};

// Status is always shown as text inside the badge, never by colour alone.
export function Badge({ value, label }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${tones[value] || tones.DRAFT}`}>
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label || value}
    </span>
  );
}

export function Empty({ title, body, action }) {
  return (
    <div className="px-6 py-14 text-center">
      <p className="font-semibold text-navy-900">{title}</p>
      {body && <p className="mt-1 text-sm text-slate">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export const fmtDate = (d, withTime = false) =>
  d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}) }) : '—';
