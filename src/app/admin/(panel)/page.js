import Link from 'next/link';
import {
  AlertTriangle, ArrowDownRight, ArrowUpRight, CheckCircle2, ChevronRight, Hourglass, ImageOff, Inbox, Layers,
  Newspaper, Package, PhoneCall, Quote, Sparkles, UserPlus, FileText,
} from 'lucide-react';
import { can, requirePage } from '@/lib/auth';
import { getDashboardData } from '@/lib/admin/dashboard';
import { statusLabel } from '@/lib/admin/enquiry-constants';
import { Badge, Card, Empty } from '@/components/admin/ui';
import { AreaTrend, BarList, Pipeline, Sparkline } from '@/components/admin/Charts';

export const metadata = { title: 'Dashboard' };

const tones = {
  blue: { tile: 'from-brand-blue to-navy-600 shadow-[0_8px_18px_-8px_rgba(40,100,165,0.8)]', glow: 'bg-brand-blue/15', bar: 'from-brand-blue to-brand-sky', spark: '#2864A5' },
  red: { tile: 'from-crimson-500 to-crimson-600 shadow-[0_8px_18px_-8px_rgba(199,22,28,0.8)]', glow: 'bg-crimson-500/15', bar: 'from-crimson-600 to-crimson-400', spark: '#C7161C' },
  sky: { tile: 'from-sky-500 to-sky-700 shadow-[0_8px_18px_-8px_rgba(3,105,161,0.8)]', glow: 'bg-sky-500/15', bar: 'from-sky-600 to-sky-300', spark: '#0369A1' },
  green: { tile: 'from-emerald-500 to-emerald-700 shadow-[0_8px_18px_-8px_rgba(4,120,87,0.8)]', glow: 'bg-emerald-500/15', bar: 'from-emerald-600 to-emerald-300', spark: '#047857' },
  amber: { tile: 'from-amber-400 to-amber-600 shadow-[0_8px_18px_-8px_rgba(180,83,9,0.8)]', glow: 'bg-amber-500/15', bar: 'from-amber-600 to-amber-300', spark: '#B45309' },
};

function Delta({ value, inverse = false }) {
  if (value === undefined) return null;
  if (value === null) return <span title="No enquiries in the previous 30 days to compare with" className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate">n/a</span>;
  const up = value >= 0;
  const good = inverse ? !up : up;
  const I = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${value === 0 ? 'bg-slate-100 text-slate' : good ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
      {value !== 0 && <I className="h-3 w-3" />}{Math.abs(value)}%
    </span>
  );
}

function Kpi({ label, value, icon: Icon, href, tone = 'blue', trend, note, inverse }) {
  const t = tones[tone];
  return (
    <Link href={href} className="group relative isolate overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-4 sm:p-5 shadow-[0_1px_2px_rgba(7,26,54,0.03),0_8px_24px_-16px_rgba(7,26,54,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-300/80 hover:shadow-[0_20px_40px_-18px_rgba(7,26,54,0.28)]">
      <span aria-hidden className={`absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r transition-transform duration-500 group-hover:scale-x-100 ${t.bar}`} />
      <span aria-hidden className={`absolute -right-10 -top-10 -z-10 h-32 w-32 rounded-full blur-2xl transition-opacity duration-500 ${t.glow} opacity-60 group-hover:opacity-100`} />
      <div className="flex items-start justify-between">
        <span className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-white ${t.tile}`}><Icon className="h-[18px] w-[18px]" /></span>
        {trend && <span className="hidden sm:block"><Sparkline values={trend.spark} color={t.spark} /></span>}
      </div>
      <p className="mt-4 text-xs font-medium text-slate">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="font-display text-2xl font-bold leading-none tabular-nums text-navy-900 sm:text-[28px]">{value.toLocaleString('en-IN')}</p>
        {trend && <Delta value={trend.delta} inverse={inverse} />}
      </div>
      <p className="mt-1.5 min-h-4 text-[11px] leading-tight text-slate/80">{note || (trend && trend.delta !== undefined ? 'vs previous 30 days' : '')}</p>
    </Link>
  );
}

function Ring({ value }) {
  const r = 34, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 84 84" className="h-24 w-24 -rotate-90" aria-hidden>
      <circle cx="42" cy="42" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" />
      <circle cx="42" cy="42" r={r} fill="none" stroke="url(#ringG)" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
      <defs><linearGradient id="ringG" x1="0" x2="1"><stop offset="0" stopColor="#ABD2FF" /><stop offset="1" stopColor="#EA5361" /></linearGradient></defs>
    </svg>
  );
}

const ago = (d) => {
  const s = Math.max(1, Math.round((Date.now() - new Date(d).getTime()) / 1000));
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  if (s < 30 * 86400) return `${Math.round(s / 86400)}d ago`;
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};
const initials = (n) => n.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export default async function DashboardPage() {
  const user = await requirePage('dashboard.read');
  const showEnquiries = can(user, 'enquiries.read');
  const canContent = can(user, 'content.write');
  const { content: c, enquiries: e } = await getDashboardData({ includeEnquiries: showEnquiries });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const attention = [
    showEnquiries && e.staleNew > 0 && { icon: AlertTriangle, tone: 'text-red-600 bg-red-50', text: `${e.staleNew} new enquir${e.staleNew === 1 ? 'y' : 'ies'} waiting more than 48 hours`, href: '/admin/enquiries?status=NEW' },
    canContent && c.productsNoImage > 0 && { icon: ImageOff, tone: 'text-amber-700 bg-amber-50', text: `${c.productsNoImage} products have no screenshots yet`, href: '/admin/content/products' },
    can(user, 'testimonials.write') && c.pendingTestimonials > 0 && { icon: Quote, tone: 'text-sky-700 bg-sky-50', text: `${c.pendingTestimonials} testimonial${c.pendingTestimonials === 1 ? '' : 's'} awaiting approval`, href: '/admin/content/testimonials' },
    canContent && c.draftBlogs > 0 && { icon: FileText, tone: 'text-slate-700 bg-slate-100', text: `${c.draftBlogs} draft blog post${c.draftBlogs === 1 ? '' : 's'}`, href: '/admin/content/blogs' },
    can(user, 'careers.write') && c.newApplications > 0 && { icon: UserPlus, tone: 'text-emerald-700 bg-emerald-50', text: `${c.newApplications} new job application${c.newApplications === 1 ? '' : 's'}`, href: '/admin/applications' },
    canContent && c.publishedBlogs === 0 && { icon: Newspaper, tone: 'text-slate-700 bg-slate-100', text: 'No blog posts published yet', href: '/admin/content/blogs/new' },
  ].filter(Boolean);

  return (
    <>
      {/* Welcome banner */}
      <section className="noise relative isolate mb-6 overflow-hidden rounded-3xl bg-[#06142B] bg-[radial-gradient(ellipse_at_85%_0%,#123D70_0%,#071A36_50%,#050F24_100%)] p-7 text-white shadow-[0_30px_60px_-30px_rgba(5,15,36,0.7)] md:p-8">
        <div className="absolute inset-0 bg-grid [background-size:32px_32px] opacity-70" />
        <div className="absolute -right-10 -top-24 h-72 w-72 animate-aurora rounded-full bg-brand-blue/40 blur-[90px]" />
        <div className="absolute -bottom-28 left-1/3 h-64 w-64 animate-aurora-slow rounded-full bg-crimson-600/30 blur-[90px]" />
        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-medium text-white/50">{today}</p>
            <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-white md:text-[2.1rem]">{greeting}, <span className="text-gradient">{user.name.split(' ')[0]}</span></h1>
            <p className="mt-2 max-w-xl text-sm text-white/65">
              {showEnquiries
                ? e.new > 0 ? <>You have <strong className="text-white">{e.new} new enquir{e.new === 1 ? 'y' : 'ies'}</strong> awaiting first contact and {e.pending} open in the pipeline.</> : 'All new enquiries have been picked up. Nice work.'
                : 'Here is an overview of the website content you manage.'}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {showEnquiries && <Link href="/admin/enquiries?status=NEW" className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-navy-900 transition hover:bg-crimson-600 hover:text-white"><Inbox className="h-4 w-4" /> Review new enquiries</Link>}
              {canContent && <Link href="/admin/content/products" className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white"><Package className="h-4 w-4" /> Manage products</Link>}
            </div>
          </div>
          {showEnquiries && (
            <div className="border-glow flex items-center gap-4 rounded-2xl bg-white/[0.05] p-4 backdrop-blur">
              <div className="relative"><Ring value={e.conversionRate} /><span className="absolute inset-0 grid place-items-center font-display text-xl font-bold">{e.conversionRate}%</span></div>
              <div><p className="text-xs uppercase tracking-wider text-white/50">Conversion rate</p><p className="mt-1 text-sm text-white/80">{e.converted} of {e.total} enquiries<br />converted to business</p></div>
            </div>
          )}
        </div>
      </section>

      {showEnquiries && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
          <Kpi label="Total enquiries" value={e.total} icon={Inbox} href="/admin/enquiries" tone="blue" trend={e.trends.total} />
          <Kpi label="New" value={e.new} icon={Sparkles} href="/admin/enquiries?status=NEW" tone="red" trend={e.trends.new} />
          <Kpi label="Contacted" value={e.contacted} icon={PhoneCall} href="/admin/enquiries?status=CONTACTED" tone="sky" trend={{ ...e.trends.contacted, delta: undefined }} note="Currently in this stage" />
          <Kpi label="Converted" value={e.converted} icon={CheckCircle2} href="/admin/enquiries?status=CONVERTED" tone="green" trend={e.trends.converted} />
          <Kpi label="Pending" value={e.pending} icon={Hourglass} href="/admin/enquiries?status=PENDING" tone="amber" trend={e.trends.pending} inverse />
        </div>
      )}

      <div className={`grid gap-4 sm:grid-cols-3 ${showEnquiries ? 'mt-4' : ''}`}>
        {[[Package, 'Products', c.products, '/admin/content/products'], [Layers, 'Services', c.services, '/admin/content/services'], [Newspaper, 'Published blogs', c.publishedBlogs, '/admin/content/blogs']].map(([I, l, v, href]) => (
          <Link key={l} href={canContent ? href : '#'} className="group flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white px-5 py-4 shadow-[0_1px_2px_rgba(7,26,54,0.03),0_8px_24px_-16px_rgba(7,26,54,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300/80 hover:shadow-[0_16px_36px_-18px_rgba(7,26,54,0.25)]">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200/70 text-navy-700 transition group-hover:from-navy-700 group-hover:to-navy-900 group-hover:text-white"><I className="h-[18px] w-[18px]" /></span>
            <span className="flex-1"><span className="block text-xs text-slate">{l}</span><span className="font-display text-xl font-bold tabular-nums text-navy-900">{v}</span></span>
            <ChevronRight className="h-4 w-4 text-slate/50 transition group-hover:translate-x-0.5 group-hover:text-navy-900" />
          </Link>
        ))}
      </div>

      {showEnquiries && (
        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <Card title="Enquiry trend" actions={<span className="text-xs text-slate">Last 12 months</span>} className="xl:col-span-2">
            <AreaTrend data={e.monthly} />
          </Card>
          <Card title="Sales pipeline" actions={<Link href="/admin/enquiries?status=PENDING" className="text-xs font-medium text-brand-blue">Open items</Link>}>
            <Pipeline stages={e.pipeline} closed={e.closed} />
          </Card>
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {showEnquiries && (
          <Card title="Recent enquiries" className="xl:col-span-2" padded={false} actions={<Link href="/admin/enquiries" className="flex items-center gap-1 text-xs font-medium text-brand-blue">View all <ArrowUpRight className="h-3 w-3" /></Link>}>
            {e.recent.length ? (
              <ul className="divide-y divide-slate-100">
                {e.recent.map((r) => (
                  <li key={r.id}>
                    <Link href={`/admin/enquiries/${r.id}`} className="flex items-center gap-4 px-5 py-3 transition hover:bg-slate-50">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-navy-700 to-brand-blue text-xs font-bold text-white">{initials(r.name)}</span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2"><span className="truncate text-sm font-semibold text-navy-900">{r.name}</span><span className="hidden whitespace-nowrap font-mono text-[10px] text-slate/70 sm:inline">{r.reference}</span></span>
                        <span className="block truncate text-xs text-slate">{[r.company, r.product || r.service].filter(Boolean).join(' · ') || r.email}</span>
                      </span>
                      <Badge value={r.status} label={statusLabel(r.status)} />
                      <span className="w-14 shrink-0 text-right text-[11px] text-slate">{ago(r.createdAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : <Empty title="No enquiries yet" body="Submissions from the contact and consultation forms will appear here." />}
          </Card>
        )}

        <div className="space-y-6">
          {showEnquiries && (
            <Card title="Top services requested">
              <BarList data={e.byService.slice(0, 5)} ranked emptyText="No enquiries yet" />
            </Card>
          )}
          <Card title="Needs attention">
            {attention.length ? (
              <ul className="space-y-2">
                {attention.map((a) => (
                  <li key={a.text}>
                    <Link href={a.href} className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50">
                      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${a.tone}`}><a.icon className="h-4 w-4" /></span>
                      <span className="flex-1 text-sm text-navy-900">{a.text}</span>
                      <ChevronRight className="h-4 w-4 text-slate/50" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="flex items-center gap-2 py-2 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Everything is up to date.</p>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
