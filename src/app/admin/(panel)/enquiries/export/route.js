import { prisma } from '@/lib/db';
import { authorize, AuthError } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { enquiryWhere } from '@/lib/admin/enquiry-query';
import { statusLabel } from '@/lib/admin/enquiry-constants';

export const runtime = 'nodejs';

const COLUMNS = [
  ['reference', 'Reference'], ['createdAt', 'Received'], ['type', 'Type'], ['status', 'Status'], ['name', 'Name'],
  ['company', 'Company'], ['designation', 'Designation'], ['email', 'Email'], ['mobile', 'Mobile'], ['service', 'Service'],
  ['product', 'Product'], ['industry', 'Industry'], ['companySize', 'Company size'], ['budget', 'Budget'], ['timeline', 'Timeline'],
  ['subject', 'Subject'], ['message', 'Message'], ['assignee', 'Assigned to'], ['sourcePage', 'Source page'], ['emailStatus', 'Email status'],
];

// Quote every cell; prefix formula-like values so spreadsheets don't execute them (CSV injection).
const cell = (v) => {
  let s = v == null ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(request) {
  let user;
  try {
    user = await authorize('enquiries.export');
  } catch (err) {
    return new Response(err instanceof AuthError ? err.message : 'Forbidden', { status: 403 });
  }
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const rows = await prisma.enquiry.findMany({
    where: enquiryWhere({ ...params, userId: user.id }),
    orderBy: { createdAt: 'desc' },
    include: { assignee: { select: { name: true } } },
  });

  const lines = [COLUMNS.map(([, h]) => cell(h)).join(',')];
  for (const r of rows) {
    lines.push(COLUMNS.map(([k]) => {
      if (k === 'createdAt') return cell(r.createdAt.toISOString());
      if (k === 'status') return cell(statusLabel(r.status));
      if (k === 'assignee') return cell(r.assignee?.name);
      return cell(r[k]);
    }).join(','));
  }
  await audit(user.id, 'EXPORT', 'Enquiry', null, { count: rows.length, filters: params });

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response('﻿' + lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="alight-enquiries-${stamp}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
