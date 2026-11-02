import Link from 'next/link';
import { prisma } from '@/lib/db';
import { requirePage } from '@/lib/auth';
import { Card, Empty, PageHeader, buttonClass, fmtDate } from '@/components/admin/ui';

export const metadata = { title: 'Audit log' };
const PAGE = 50;

export default async function AuditPage({ searchParams }) {
  await requirePage('users.write');
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const [rows, total] = await Promise.all([
    prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, skip: (page - 1) * PAGE, take: PAGE, include: { user: { select: { name: true } } } }),
    prisma.auditLog.count(),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE));
  return (
    <>
      <PageHeader title="Audit log" description="Every sign-in and administrative change is recorded here." />
      <Card padded={false}>
        {rows.length ? (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100 text-left text-[11px] uppercase tracking-wider text-slate"><th className="px-4 py-2.5 font-medium">When</th><th className="px-4 py-2.5 font-medium">User</th><th className="px-4 py-2.5 font-medium">Action</th><th className="px-4 py-2.5 font-medium">Item</th><th className="hidden px-4 py-2.5 font-medium lg:table-cell">Details</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-50">
                  <td className="whitespace-nowrap px-4 py-2.5 text-xs text-slate">{fmtDate(r.createdAt, true)}</td>
                  <td className="px-4 py-2.5 text-navy-900">{r.user?.name || '—'}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-navy-900">{r.action}</td>
                  <td className="px-4 py-2.5 text-xs text-slate">{r.entity}{r.entityId ? ` #${r.entityId}` : ''}</td>
                  <td className="hidden max-w-md truncate px-4 py-2.5 font-mono text-[11px] text-slate lg:table-cell">{r.meta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <Empty title="No activity yet" />}
        {pages > 1 && (
          <nav aria-label="Pagination" className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm">
            <span className="text-slate">Page {page} of {pages}</span>
            <div className="flex gap-2">
              {page > 1 && <Link href={`?page=${page - 1}`} className={buttonClass('outline', 'sm')}>Previous</Link>}
              {page < pages && <Link href={`?page=${page + 1}`} className={buttonClass('outline', 'sm')}>Next</Link>}
            </div>
          </nav>
        )}
      </Card>
    </>
  );
}
