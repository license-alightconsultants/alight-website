import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requirePage } from '@/lib/auth';
import { PageHeader } from '@/components/admin/ui';
import UserForm from '../UserForm';
import { saveUserAction } from '@/lib/admin/user-actions';

export const metadata = { title: 'Edit user' };

export default async function EditUserPage({ params }) {
  await requirePage('users.write');
  const id = Number((await params).id);
  const [user, roles] = await Promise.all([
    Number.isInteger(id) ? prisma.adminUser.findUnique({ where: { id }, select: { id: true, name: true, email: true, roleId: true, isActive: true } }) : null,
    prisma.role.findMany({ orderBy: { id: 'asc' } }),
  ]);
  if (!user) notFound();
  return (
    <>
      <PageHeader back={{ href: '/admin/users', label: 'Users & roles' }} title={user.name} description={user.email} />
      <UserForm action={saveUserAction.bind(null, user.id)} user={user} roles={roles} />
    </>
  );
}
