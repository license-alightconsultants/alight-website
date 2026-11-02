import Link from 'next/link';
import { Download, Search } from 'lucide-react';
import { prisma } from '@/lib/db';
import { can, requirePage } from '@/lib/auth';
import { enquiryWhere } from '@/lib/admin/enquiry-query';
import { ENQUIRY_STATUSES, statusLabel } from '@/lib/admin/enquiry-constants';
import { Badge, Card, Empty, PageHeader, buttonClass, fmtDate } from '@/components/admin/ui';

export const metadata = { title: 'Enquiries' };
const PAGE_SIZE = 25;
const control = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-navy-900 focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/10';
const filterLabel = 'block space-y-1 text-[11px] font-semibold uppercase tracking-wider text-slate';
const initials = (n) => n.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export default async function EnquiriesPage({ searchParams }) {
  const user = await requirePage('enquiries.read');
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const where = enquiryWhere({ ...params, userId: user.id });

  const [rows, total, services] = await Promise.all([
    prisma.enquiry.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE, include: { assignee: { select: { name: true } } } }),
    prisma.enquiry.count({ where }),
    prisma.enquiry.findMany({ where: { service: { not: null } }, distinct: ['service'], select: { service: true }, orderBy: { service: 'asc' } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (extra) => {
    const p = new URLSearchParams(Object.entries({ ...params, ...extra }).filter(([, v]) => v));
    return `?${p}`;
  };
  const exportQs = new URLSearchParams(Object.entries(params).filter(([k, v]) => v && k !== 'page'));

  return (
    <>
      <PageHeader
        title="Enquiries"
        description={`${total.toLocaleString('en-IN')} matching enquir${total === 1 ? 'y' : 'ies'}`}
        actions={can(user, 'enquiries.export') && <a href={`/admin/enquiries/export?${exportQs}`} className={buttonClass('outline')}><Download className="h-4 w-4" /> Export CSV</a>}
      />

      <Card padded={false}>
        <form className="space-y-3 border-b border-slate-100 p-4" role="search">
          <div className="flex flex-wrap gap-2">
            <label className="relative min-w-[240px] flex-1">
              <span className="sr-only">Search</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate/60" />
              <input name="q" defaultValue={params.q} placeholder="Search reference, name, email, company…" className={`${control} w-full pl-9`} />
            </label>
            <button type="submit" className={buttonClass('primary')}>Apply filters</button>
            <Link href="/admin/enquiries" className={buttonClass('ghost')}>Reset</Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_1.4fr_1fr_auto_auto_auto] lg:items-end">
            <label className={filterLabel}>Status
              <select name="status" defaultValue={params.status || ''} className={`${control} w-full`}>
                <option value="">All statuses</option>
                <option value="PENDING">Pending (open)</option>
                {ENQUIRY_STATUSES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </label>
            <label className={filterLabel}>Service
              <select name="service" defaultValue={params.service || ''} className={`${control} w-full`}>
                <option value="">All services</option>
                {services.map((s) => <option key={s.service}>{s.service}</option>)}
              </select>
            </label>
            <label className={filterLabel}>Type
              <select name="type" defaultValue={params.type || ''} className={`${control} w-full`}>
                <option value="">All types</option>
                <option value="CONTACT">Contact</option>
                <option value="CONSULTATION">Consultation</option>
              </select>
            </label>
            <label className={filterLabel}>From<input type="date" name="from" defaultValue={params.from} className={`${control} w-full`} /></label>
            <label className={filterLabel}>To<input type="date" name="to" defaultValue={params.to} className={`${control} w-full`} /></label>
            <label className="flex h-[38px] items-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 text-sm text-navy-900">
              <input type="checkbox" name="assignee" value="me" defaultChecked={params.assignee === 'me'} className="accent-crimson-600" /> Assigned to me
            </label>
          </div>
        </form>

        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-[11px] uppercase tracking-wider text-slate">
                  <th className="px-4 py-2.5 font-medium">Reference</th><th className="px-4 py-2.5 font-medium">Contact</th>
                  <th className="px-4 py-2.5 font-medium">Service</th><th className="px-4 py-2.5 font-medium">Type</th>
                  <th className="px-4 py-2.5 font-medium">Status</th><th className="px-4 py-2.5 font-medium">Assigned</th>
                  <th className="px-4 py-2.5 font-medium">Received</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-4 py-3"><Link href={`/admin/enquiries/${r.id}`} className="whitespace-nowrap font-mono text-xs font-semibold text-brand-blue hover:underline">{r.reference}</Link></td>
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-navy-700 to-brand-blue text-[11px] font-bold text-white">{initials(r.name)}</span><div><p className="font-medium text-navy-900">{r.name}</p><p className="text-xs text-slate">{r.company || r.email}</p></div></div></td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-slate">{r.product || r.service || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate">{r.type === 'CONSULTATION' ? 'Consultation' : 'Contact'}</td>
                    <td className="px-4 py-3"><Badge value={r.status} label={statusLabel(r.status)} /></td>
                    <td className="px-4 py-3 text-xs text-slate">{r.assignee?.name || '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate">{fmtDate(r.createdAt, true)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty title="No enquiries found" body="Try changing the filters." />}

        {pages > 1 && (
          <nav aria-label="Pagination" className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm">
            <span className="text-slate">Page {page} of {pages}</span>
            <div className="flex gap-2">
              {page > 1 && <Link href={qs({ page: page - 1 })} className={buttonClass('outline', 'sm')}>Previous</Link>}
              {page < pages && <Link href={qs({ page: page + 1 })} className={buttonClass('outline', 'sm')}>Next</Link>}
            </div>
          </nav>
        )}
      </Card>
    </>
  );
}
