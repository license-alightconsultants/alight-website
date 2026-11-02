import 'server-only';
import { prisma } from '@/lib/db';
import { PENDING_STATUSES, ENQUIRY_STATUSES } from './enquiry-constants';

const DAY = 86400000;
const PIPELINE = ['NEW', 'CONTACTED', 'IN_DISCUSSION', 'PROPOSAL_SENT', 'CONVERTED'];

function delta(curr, prev) {
  if (!prev) return curr ? null : 0; // null → "new" (no baseline)
  return Math.round(((curr - prev) / prev) * 100);
}

/** Counts per week for the last `weeks` weeks (oldest first). */
function weekly(rows, weeks, now, pick = () => true) {
  const out = Array(weeks).fill(0);
  for (const r of rows) {
    if (!pick(r)) continue;
    const age = Math.floor((now - r.createdAt.getTime()) / (7 * DAY));
    if (age >= 0 && age < weeks) out[weeks - 1 - age] += 1;
  }
  return out;
}

// All dashboard metrics are computed live from PostgreSQL.
export async function getDashboardData({ includeEnquiries, includeContent = true }) {
  const now = Date.now();
  const [products, services, publishedBlogs, draftBlogs, productsNoImage, pendingTestimonials, activeJobs, newApplications] = await Promise.all([
    prisma.product.count(),
    prisma.service.count(),
    prisma.blog.count({ where: { status: 'PUBLISHED' } }),
    prisma.blog.count({ where: { status: 'DRAFT' } }),
    prisma.product.count({ where: { images: { none: {} } } }),
    prisma.testimonial.count({ where: { isApproved: false } }),
    prisma.job.count({ where: { isActive: true } }),
    prisma.jobApplication.count({ where: { status: 'NEW' } }),
  ]);
  const content = { products, services, publishedBlogs, draftBlogs, productsNoImage, pendingTestimonials, activeJobs, newApplications };
  if (!includeEnquiries) return { content };

  const since = new Date();
  since.setMonth(since.getMonth() - 11, 1);
  since.setHours(0, 0, 0, 0);
  const since84 = new Date(now - 84 * DAY);
  const earliest = since < since84 ? since : since84;

  const [total, byStatus, byService, recent, history, staleNew] = await Promise.all([
    prisma.enquiry.count(),
    prisma.enquiry.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.enquiry.groupBy({ by: ['service'], _count: { _all: true }, orderBy: { _count: { service: 'desc' } }, take: 7 }),
    prisma.enquiry.findMany({ orderBy: { createdAt: 'desc' }, take: 7, include: { assignee: { select: { name: true } } } }),
    prisma.enquiry.findMany({ where: { createdAt: { gte: earliest } }, select: { createdAt: true, status: true } }),
    prisma.enquiry.count({ where: { status: 'NEW', createdAt: { lt: new Date(now - 2 * DAY) } } }),
  ]);

  const statusCount = Object.fromEntries(ENQUIRY_STATUSES.map(([k]) => [k, 0]));
  for (const s of byStatus) statusCount[s.status] = s._count._all;

  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(since);
    d.setMonth(since.getMonth() + i);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('en-IN', { month: 'short' }), year: d.getFullYear(), value: 0 };
  });
  for (const e of history) {
    const m = months.find((x) => x.key === `${e.createdAt.getFullYear()}-${e.createdAt.getMonth()}`);
    if (m) m.value += 1;
  }

  const inWindow = (from, to) => history.filter((e) => e.createdAt.getTime() >= now - from * DAY && e.createdAt.getTime() < now - to * DAY);
  const last30 = inWindow(30, 0);
  const prev30 = inWindow(60, 30);
  const count = (rows, fn = () => true) => rows.filter(fn).length;
  const isNew = (e) => e.status === 'NEW';
  const isConv = (e) => e.status === 'CONVERTED';
  const isPend = (e) => PENDING_STATUSES.includes(e.status);

  const pending = PENDING_STATUSES.reduce((n, s) => n + statusCount[s], 0);
  // Pipeline: how many enquiries have reached at least each stage (closed ones excluded).
  const reached = PIPELINE.map((stage, i) => ({
    key: stage,
    label: ENQUIRY_STATUSES.find(([k]) => k === stage)[1],
    value: PIPELINE.slice(i).reduce((n, s) => n + statusCount[s], 0),
    current: statusCount[stage],
  }));

  return {
    content,
    enquiries: {
      total,
      new: statusCount.NEW,
      contacted: statusCount.CONTACTED,
      converted: statusCount.CONVERTED,
      closed: statusCount.CLOSED,
      pending,
      staleNew,
      conversionRate: total ? Math.round((statusCount.CONVERTED / total) * 100) : 0,
      trends: {
        total: { delta: delta(last30.length, prev30.length), spark: weekly(history, 12, now) },
        new: { delta: delta(count(last30, isNew), count(prev30, isNew)), spark: weekly(history, 12, now, isNew) },
        contacted: { delta: null, spark: weekly(history, 12, now, (e) => e.status === 'CONTACTED') },
        converted: { delta: delta(count(last30, isConv), count(prev30, isConv)), spark: weekly(history, 12, now, isConv) },
        pending: { delta: delta(count(last30, isPend), count(prev30, isPend)), spark: weekly(history, 12, now, isPend) },
      },
      pipeline: reached,
      byService: byService.map((s) => ({ label: s.service || 'Not specified', value: s._count._all })),
      monthly: months,
      recent,
    },
  };
}
