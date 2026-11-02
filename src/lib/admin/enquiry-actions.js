'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { authorize, AuthError } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { ENQUIRY_STATUSES, statusLabel } from './enquiry-constants';

async function guard(fn) {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof AuthError) return { error: err.message };
    console.error('[admin/enquiries]', err);
    return { error: 'Could not update the enquiry.' };
  }
}

export async function updateEnquiryAction(id, _prev, formData) {
  return guard(async () => {
    const user = await authorize('enquiries.write');
    const enquiry = await prisma.enquiry.findUnique({ where: { id } });
    if (!enquiry) return { error: 'Enquiry not found.' };

    const status = String(formData.get('status') || enquiry.status);
    if (!ENQUIRY_STATUSES.some(([k]) => k === status)) return { error: 'Invalid status.' };
    const assigneeRaw = String(formData.get('assigneeId') || '');
    const assigneeId = assigneeRaw ? Number(assigneeRaw) : null;
    const remark = String(formData.get('remark') || '').trim().slice(0, 3000);

    if (assigneeId) {
      const assignee = await prisma.adminUser.findFirst({ where: { id: assigneeId, isActive: true } });
      if (!assignee) return { error: 'Selected team member is not available.' };
    }

    const activities = [];
    if (status !== enquiry.status) activities.push({ action: 'STATUS_CHANGED', detail: `${statusLabel(enquiry.status)} → ${statusLabel(status)}`, userId: user.id });
    if (assigneeId !== enquiry.assigneeId) {
      const name = assigneeId ? (await prisma.adminUser.findUnique({ where: { id: assigneeId } })).name : 'Unassigned';
      activities.push({ action: 'ASSIGNED', detail: name, userId: user.id });
    }
    if (remark) activities.push({ action: 'REMARK', detail: remark, userId: user.id });
    if (!activities.length) return { ok: true, message: 'No changes to save.' };

    await prisma.enquiry.update({
      where: { id },
      data: { status, assigneeId, remarks: remark || enquiry.remarks, activities: { create: activities } },
    });
    await audit(user.id, 'UPDATE', 'Enquiry', id, { status, assigneeId, remark: Boolean(remark) });
    revalidatePath('/admin', 'layout');
    return { ok: true, message: 'Enquiry updated.' };
  });
}
