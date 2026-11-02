import { prisma } from '@/lib/db';
import { requirePage } from '@/lib/auth';
import { PageHeader } from '@/components/admin/ui';
import UserForm from '../UserForm';
import { saveUserAction } from '@/lib/admin/user-actions';

export const metadata = { title: 'New user' };

export default async function NewUserPage() {
  await requirePage('users.write');
  const roles = await prisma.role.findMany({ orderBy: { id: 'asc' } });
  return (
    <>
      <PageHeader back={{ href: '/admin/users', label: 'Users & roles' }} title="New administrator" />
      <UserForm action={saveUserAction.bind(null, null)} roles={roles} />
    </>
  );
}
