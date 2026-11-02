'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { authorize, AuthError, hashPassword, passwordProblem, verifyPassword, getCurrentUser } from '@/lib/auth';
import { audit } from '@/lib/audit';

const userSchema = z.object({
  name: z.string().trim().min(2, 'Enter a name').max(100),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  roleId: z.coerce.number().int().positive('Select a role'),
  isActive: z.boolean(),
  password: z.string().optional(),
});

async function superAdminCount(excludeId) {
  return prisma.adminUser.count({ where: { isActive: true, role: { key: 'SUPER_ADMIN' }, ...(excludeId ? { id: { not: excludeId } } : {}) } });
}

export async function saveUserAction(id, _prev, formData) {
  try {
    const actor = await authorize('users.write');
    const parsed = userSchema.safeParse({
      name: formData.get('name'), email: formData.get('email'), roleId: formData.get('roleId'),
      isActive: formData.get('isActive') === 'on', password: String(formData.get('password') || ''),
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const { password, ...data } = parsed.data;

    if (!id || password) {
      const problem = passwordProblem(password);
      if (problem) return { error: id ? `New password: ${problem}` : problem };
    }

    const role = await prisma.role.findUnique({ where: { id: data.roleId } });
    if (!role) return { error: 'Role not found.' };

    if (id) {
      // Never allow the last active Super Admin to be demoted or deactivated.
      const current = await prisma.adminUser.findUnique({ where: { id }, include: { role: true } });
      if (!current) return { error: 'User not found.' };
      const losesSuper = current.role.key === 'SUPER_ADMIN' && (role.key !== 'SUPER_ADMIN' || !data.isActive);
      if (losesSuper && (await superAdminCount(id)) === 0) return { error: 'At least one active Super Admin is required.' };

      await prisma.adminUser.update({ where: { id }, data: { ...data, ...(password ? { passwordHash: await hashPassword(password) } : {}) } });
      if (password || !data.isActive) await prisma.session.deleteMany({ where: { userId: id } });
      await audit(actor.id, 'UPDATE', 'AdminUser', id, { role: role.key, isActive: data.isActive, passwordReset: Boolean(password) });
    } else {
      const created = await prisma.adminUser.create({ data: { ...data, passwordHash: await hashPassword(password) } });
      await audit(actor.id, 'CREATE', 'AdminUser', created.id, { role: role.key });
    }
  } catch (err) {
    if (err instanceof AuthError) return { error: err.message };
    if (err.code === 'P2002') return { error: 'A user with this email already exists.' };
    console.error('[admin/users]', err);
    return { error: 'Could not save the user.' };
  }
  revalidatePath('/admin/users');
  redirect('/admin/users?saved=1');
}

export async function saveRolePermissionsAction(_prev, formData) {
  try {
    const actor = await authorize('users.write');
    const roles = await prisma.role.findMany();
    const perms = await prisma.permission.findMany();
    const ops = [];
    for (const role of roles) {
      if (role.key === 'SUPER_ADMIN') continue; // Super Admin always keeps every permission
      const granted = perms.filter((p) => formData.get(`${role.id}:${p.id}`) === 'on');
      ops.push(prisma.rolePermission.deleteMany({ where: { roleId: role.id } }));
      ops.push(prisma.rolePermission.createMany({ data: granted.map((p) => ({ roleId: role.id, permissionId: p.id })) }));
    }
    await prisma.$transaction(ops);
    await audit(actor.id, 'UPDATE', 'RolePermission', null);
    revalidatePath('/admin', 'layout');
    return { ok: true, message: 'Permissions updated.' };
  } catch (err) {
    if (err instanceof AuthError) return { error: err.message };
    console.error('[admin/roles]', err);
    return { error: 'Could not update permissions.' };
  }
}

export async function changeOwnPasswordAction(_prev, formData) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Please sign in again.' };
  const current = String(formData.get('current') || '');
  const next = String(formData.get('next') || '');
  const row = await prisma.adminUser.findUnique({ where: { id: user.id } });
  if (!(await verifyPassword(current, row.passwordHash))) return { error: 'Current password is incorrect.' };
  const problem = passwordProblem(next);
  if (problem) return { error: problem };
  if (next !== String(formData.get('confirm') || '')) return { error: 'New passwords do not match.' };
  await prisma.adminUser.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(next) } });
  await audit(user.id, 'PASSWORD_CHANGED', 'AdminUser', user.id);
  return { ok: true, message: 'Password changed.' };
}
