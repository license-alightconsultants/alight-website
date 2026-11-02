'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { authorize } from '@/lib/auth';
import { audit } from '@/lib/audit';

import { APPLICATION_STATUSES } from './enquiry-constants';

export async function setApplicationStatus(id, formData) {
  const user = await authorize('careers.write');
  const status = String(formData.get('status'));
  if (!APPLICATION_STATUSES.includes(status)) return;
  await prisma.jobApplication.update({ where: { id }, data: { status } });
  await audit(user.id, 'UPDATE', 'JobApplication', id, { status });
  revalidatePath('/admin/applications');
}

export async function deleteApplication(id) {
  const user = await authorize('careers.write');
  await prisma.jobApplication.delete({ where: { id } });
  await audit(user.id, 'DELETE', 'JobApplication', id);
  revalidatePath('/admin/applications');
}
