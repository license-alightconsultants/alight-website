import Image from 'next/image';
import { BarChart3, Inbox, LayoutTemplate, ShieldCheck } from 'lucide-react';

export const metadata = { title: 'Admin', robots: { index: false, follow: false } };

const features = [
  [Inbox, 'Enquiries & leads', 'Track every enquiry from first contact to conversion.'],
  [LayoutTemplate, 'Pages & content', 'Edit products, services, blogs and page sections.'],
  [BarChart3, 'Live insights', 'Pipeline, trends and service demand at a glance.'],
];

export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <div className="noise relative isolate hidden overflow-hidden bg-navy-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_20%_10%,#123D70_0%,#071A36_45%,#050F24_100%)]" />
        <div className="absolute inset-0 -z-10 bg-grid [background-size:40px_40px] opacity-60 [mask-image:radial-gradient(ellipse_at_30%_40%,black,transparent_75%)]" />
        <div className="absolute -bottom-40 -left-20 -z-10 h-96 w-96 animate-aurora-slow rounded-full bg-crimson-600/30 blur-[120px]" />
        <div className="absolute -right-24 top-10 -z-10 h-80 w-80 animate-aurora rounded-full bg-brand-blue/30 blur-[120px]" />

        <Image src="/assets/logo/alight-logo-light.svg" alt="Alight Consultants" width={110} height={60} unoptimized className="relative h-14 w-auto self-start" />

        <div className="relative max-w-lg">
          <span className="eyebrow eyebrow-light">Control centre</span>
          <p className="mt-4 font-display text-5xl font-extrabold leading-[1.05] tracking-tight">
            Website <span className="text-gradient">administration</span>
          </p>
          <p className="mt-5 text-white/60">Manage enquiries, products, services, articles and website settings for Alight Consultants.</p>
          <ul className="mt-10 space-y-3">
            {features.map(([Icon, title, body]) => (
              <li key={title} className="glass flex items-start gap-4 rounded-2xl p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-crimson-600 to-crimson-500 shadow-red"><Icon className="h-5 w-5" /></span>
                <span>
                  <span className="block text-sm font-semibold">{title}</span>
                  <span className="mt-0.5 block text-xs text-white/55">{body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative flex items-center gap-2 text-xs text-white/40"><ShieldCheck className="h-4 w-4" /> Authorised personnel only. All activity is logged.</p>
      </div>

      <div className="relative flex items-center justify-center overflow-hidden bg-[#F5F7FB] p-6 sm:p-12">
        <div aria-hidden className="absolute inset-0 bg-grid-light [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
        <div aria-hidden className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-sky/40 blur-[100px]" />
        <div aria-hidden className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-crimson-400/15 blur-[100px]" />
        <div className="relative w-full max-w-[420px] rounded-3xl border border-white bg-white/85 p-8 shadow-lift backdrop-blur-xl sm:p-10">
          <span className="mb-6 inline-flex w-fit rounded-lg bg-white px-2 py-1 ring-1 ring-navy-900/5 lg:hidden">
            <Image src="/assets/logo/alight-logo.svg" alt="Alight Consultants" width={80} height={44} unoptimized className="h-8 w-auto" />
          </span>
          {children}
        </div>
      </div>
    </div>
  );
}
