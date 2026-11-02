import { ExternalLink, Mail } from 'lucide-react';
import { prisma } from '@/lib/db';
import { requirePage } from '@/lib/auth';
import { APPLICATION_STATUSES } from '@/lib/admin/enquiry-constants';
import { deleteApplication, setApplicationStatus } from '@/lib/admin/application-actions';
import { ConfirmButton, SubmitButton } from '@/components/admin/FormBits';
import { Card, Empty, PageHeader, buttonClass, fmtDate } from '@/components/admin/ui';

export const metadata = { title: 'Job applications' };

const label = (s) => s.charAt(0) + s.slice(1).toLowerCase();

export default async function ApplicationsPage({ searchParams }) {
  await requirePage('careers.write');
  const { job } = await searchParams;
  const jobId = Number(job) || undefined;
  const [rows, jobs] = await Promise.all([
    prisma.jobApplication.findMany({ where: { jobId }, orderBy: { createdAt: 'desc' }, include: { job: { select: { title: true } } }, take: 300 }),
    prisma.job.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, title: true } }),
  ]);

  return (
    <>
      <PageHeader title="Job applications" description={`${rows.length} application${rows.length === 1 ? '' : 's'}`} />
      <Card padded={false}>
        <form className="flex gap-2 border-b border-slate-100 p-4">
          <select name="job" defaultValue={jobId ?? ''} aria-label="Filter by job" className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">All positions</option>
            {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
          <button type="submit" className={buttonClass('primary')}>Filter</button>
        </form>
        {rows.length ? (
          <ul className="divide-y divide-slate-100">
            {rows.map((a) => (
              <li key={a.id} className="grid gap-4 p-4 lg:grid-cols-[1fr_auto]">
                <div>
                  <p className="font-medium text-navy-900">{a.name} <span className="text-xs font-normal text-slate">· {a.job.title} · {fmtDate(a.createdAt, true)}</span></p>
                  <p className="text-xs text-slate">{a.email} · {a.mobile}</p>
                  {a.coverNote && <p className="mt-2 whitespace-pre-wrap text-sm text-navy-900">{a.coverNote}</p>}
                  <div className="mt-2 flex gap-2">
                    {a.resumeUrl && <a href={a.resumeUrl} target="_blank" rel="noopener noreferrer nofollow" className={buttonClass('outline', 'sm')}><ExternalLink className="h-3.5 w-3.5" /> CV</a>}
                    <a href={`mailto:${a.email}?subject=${encodeURIComponent(`Your application: ${a.job.title}`)}`} className={buttonClass('outline', 'sm')}><Mail className="h-3.5 w-3.5" /> Email</a>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <form action={setApplicationStatus.bind(null, a.id)} className="flex gap-2">
                    <select name="status" defaultValue={a.status} aria-label="Status" className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs">
                      {APPLICATION_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
                    </select>
                    <SubmitButton size="sm" variant="outline" pendingText="…">Update</SubmitButton>
                  </form>
                  <form action={deleteApplication.bind(null, a.id)}><ConfirmButton message={`Delete the application from ${a.name}?`}>Delete</ConfirmButton></form>
                </div>
              </li>
            ))}
          </ul>
        ) : <Empty title="No applications yet" body="Applications submitted on the careers page appear here." />}
      </Card>
    </>
  );
}
