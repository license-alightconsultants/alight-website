import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const variants = {
  primary: 'bg-gradient-to-r from-crimson-600 via-crimson-500 to-crimson-600 bg-[length:200%_100%] bg-left text-white shadow-red hover:bg-right hover:shadow-red-lg',
  dark: 'bg-navy-900 text-white shadow-[0_10px_30px_-10px_rgba(7,26,54,0.6)] hover:bg-navy-700',
  outline: 'border border-navy-900/15 bg-white/60 text-navy-900 backdrop-blur hover:border-navy-900 hover:bg-navy-900 hover:text-white',
  ghostLight: 'border border-white/20 bg-white/[0.04] text-white backdrop-blur-md hover:border-white hover:bg-white hover:text-navy-900',
  light: 'bg-white text-navy-900 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)] hover:bg-surface',
};

// Light sweep across filled buttons on hover.
const shine = { primary: true, dark: true };

export default function Button({ href, children, variant = 'primary', arrow = true, className = '', ...props }) {
  const cls = `group relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3.5 text-sm font-semibold tracking-wide transition-all duration-500 hover:-translate-y-0.5 active:translate-y-0 ${variants[variant]} ${className}`;
  const inner = (
    <>
      {shine[variant] && (
        <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/2 -z-10 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 group-hover:left-full group-hover:opacity-100" />
      )}
      <span>{children}</span>
      {arrow && (
        <span className="grid h-5 w-5 place-items-center rounded-full transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-white/15">
          <ArrowRight className="h-4 w-4" />
        </span>
      )}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={cls} {...props}>
        {inner}
      </Link>
    );
  }
  return (
    <button className={cls} {...props}>
      {inner}
    </button>
  );
}
