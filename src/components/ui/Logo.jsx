import Link from 'next/link';

// Two versions of the official logo: the original (navy/grey text) for light surfaces and a light version
// (white/light-grey text, brand red and blue dot kept) for dark surfaces, so no white plate is needed.
// Both are stacked and cross-faded, so the header never shifts when it switches.
export default function Logo({ onDark = false, className = '', size = 'md' }) {
  const h = size === 'lg' ? 'h-12 sm:h-14' : 'h-9 sm:h-11';
  return (
    <Link href="/" aria-label="Alight Consultants — home" className={`relative inline-grid shrink-0 items-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/logo/alight-logo.svg" alt="Alight Consultants" width={118} height={65} className={`col-start-1 row-start-1 ${h} w-auto transition-opacity duration-300 ${onDark ? 'opacity-0' : 'opacity-100'}`} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/logo/alight-logo-light.svg" alt="" aria-hidden width={118} height={65} className={`col-start-1 row-start-1 ${h} w-auto drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] transition-opacity duration-300 ${onDark ? 'opacity-100' : 'opacity-0'}`} />
    </Link>
  );
}
