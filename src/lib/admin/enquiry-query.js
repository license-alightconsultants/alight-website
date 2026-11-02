import 'server-only';
import { PENDING_STATUSES, ENQUIRY_STATUSES } from './enquiry-constants';

/** Builds a Prisma `where` from list filters. Shared by the list page and CSV export. */
export function enquiryWhere(params) {
  const where = {};
  const q = (params.q || '').trim();
  if (q) {
    where.OR = ['reference', 'name', 'email', 'company', 'mobile', 'subject'].map((f) => ({ [f]: { contains: q, mode: 'insensitive' } }));
  }
  if (params.status === 'PENDING') where.status = { in: PENDING_STATUSES };
  else if (ENQUIRY_STATUSES.some(([k]) => k === params.status)) where.status = params.status;
  if (params.service) where.service = params.service;
  if (params.type === 'CONTACT' || params.type === 'CONSULTATION') where.type = params.type;
  if (params.assignee === 'me' && params.userId) where.assigneeId = params.userId;
  const range = {};
  if (/^\d{4}-\d{2}-\d{2}$/.test(params.from || '')) range.gte = new Date(`${params.from}T00:00:00`);
  if (/^\d{4}-\d{2}-\d{2}$/.test(params.to || '')) range.lte = new Date(`${params.to}T23:59:59.999`);
  if (range.gte || range.lte) where.createdAt = range;
  return where;
}
