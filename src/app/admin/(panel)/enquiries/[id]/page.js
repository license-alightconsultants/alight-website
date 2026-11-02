import { notFound } from 'next/navigation';
import { Mail, Phone } from 'lucide-react';
import { prisma } from '@/lib/db';
import { can, requirePage } from '@/lib/auth';
import { statusLabel } from '@/lib/admin/enquiry-constants';
import { Badge, Card, PageHeader, buttonClass, fmtDate } from '@/components/admin/ui';
import EnquiryUpdateForm from './EnquiryUpdateForm';
import { updateEnquiryAction } from '@/lib/admin/enquiry-actions';

export const metadata = { title: 'Enquiry' };

const actionLabels = { CREATED: 'Enquiry received', STATUS_CHANGED: 'Status changed', REMARK: 'Remark added', ASSIGNED: 'Assigned', EMAIL_SENT: 'Notification email sent', EMAIL_FAILED: 'Notification email failed' };

export default async function EnquiryDetailPage({ params }) {
  const user = await requirePage('enquiries.read');
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const e = await prisma.enquiry.findUnique({
    where: { id },
    include: { assignee: true, activities: { orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } } } } },
  });
  if (!e) notFound();
  const team = can(user, 'enquiries.write')
    ? await prisma.adminUser.findMany({ where: { isActive: true, role: { permissions: { some: { permission: { key: 'enquiries.read' } } } } }, select: { id: true, name: true }, orderBy: { name: 'asc' } })
    : [];

  const fields = [
    ['Company', e.company], ['Designation', e.designation], ['Company size', e.companySize], ['Industry', e.industry],
    ['Service', e.service], ['Product', e.product], ['Budget', e.budget], ['Timeline', e.timeline],
    ['Source page', e.sourcePage], ['Consent given', e.consent ? 'Yes' : 'No'],
  ].filter(([, v]) => v);

  return (
    <>
      <PageHeader
        back={{ href: '/admin/enquiries', label: 'All enquiries' }}
        title={e.subject || `${e.type === 'CONSULTATION' ? 'Consultation request' : 'Enquiry'} from ${e.name}`}
        description={<span className="flex flex-wrap items-center gap-2"><span className="font-mono">{e.reference}</span> · {fmtDate(e.createdAt, true)} · <Badge value={e.status} label={statusLabel(e.status)} /> <Badge value={e.emailStatus} label={`Email ${e.emailStatus.toLowerCase()}`} /></span>}
        actions={<>
          <a href={`mailto:${e.email}?subject=${encodeURIComponent(`Re: ${e.subject || 'Your enquiry'} [${e.reference}]`)}`} className={buttonClass('outline')}><Mail className="h-4 w-4" /> Reply</a>
          {e.mobile && <a href={`tel:${e.mobile.replace(/\s/g, '')}`} className={buttonClass('outline')}><Phone className="h-4 w-4" /> Call</a>}
        </>}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card title="Contact">
            <dl className="grid gap-4 sm:grid-cols-3">
              <div><dt className="text-xs text-slate">Name</dt><dd className="font-medium text-navy-900">{e.name}</dd></div>
              <div><dt className="text-xs text-slate">Email</dt><dd className="break-all font-medium text-navy-900">{e.email}</dd></div>
              <div><dt className="text-xs text-slate">Mobile</dt><dd className="font-medium text-navy-900">{e.mobile || '—'}</dd></div>
            </dl>
          </Card>
          <Card title={e.type === 'CONSULTATION' ? 'Project requirements' : 'Message'}>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-navy-900">{e.message}</p>
          </Card>
          {fields.length > 0 && (
            <Card title="Details">
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {fields.map(([k, v]) => <div key={k}><dt className="text-xs text-slate">{k}</dt><dd className="text-sm font-medium text-navy-900">{v}</dd></div>)}
              </dl>
            </Card>
          )}
          <Card title="Activity history">
            <ol className="relative space-y-5 border-l border-slate-200 pl-5">
              {e.activities.map((a) => (
                <li key={a.id} className="relative">
                  <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full bg-white ring-2 ring-brand-blue" />
                  <p className="text-sm font-medium text-navy-900">{actionLabels[a.action] || a.action}{a.action === 'ASSIGNED' && a.detail ? `: ${a.detail}` : ''}{a.action === 'STATUS_CHANGED' ? `: ${a.detail}` : ''}</p>
                  {a.action === 'REMARK' && <p className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-navy-900">{a.detail}</p>}
                  {a.action === 'CREATED' && a.detail && <p className="text-xs text-slate">{a.detail}</p>}
                  <p className="mt-0.5 text-xs text-slate">{fmtDate(a.createdAt, true)}{a.user ? ` · ${a.user.name}` : ''}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="xl:sticky xl:top-6 xl:self-start">
          {can(user, 'enquiries.write') ? (
            <EnquiryUpdateForm action={updateEnquiryAction.bind(null, e.id)} status={e.status} assigneeId={e.assigneeId} team={team} />
          ) : (
            <Card title="Status"><p className="text-sm text-slate">You have read-only access to enquiries.</p></Card>
          )}
          <p className="mt-3 px-1 text-xs text-slate">IP {e.ip || 'unknown'} · {e.userAgent?.slice(0, 80)}</p>
        </div>
      </div>
    </>
  );
}
