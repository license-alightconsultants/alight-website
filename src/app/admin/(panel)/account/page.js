import { requirePage } from '@/lib/auth';
import { Card, PageHeader } from '@/components/admin/ui';
import PasswordForm from './PasswordForm';

export const metadata = { title: 'My account' };

export default async function AccountPage() {
  const user = await requirePage();
  return (
    <>
      <PageHeader title="My account" />
      <div className="grid max-w-3xl gap-6">
        <Card title="Profile">
          <dl className="grid gap-4 sm:grid-cols-3 text-sm">
            <div><dt className="text-xs text-slate">Name</dt><dd className="font-medium text-navy-900">{user.name}</dd></div>
            <div><dt className="text-xs text-slate">Email</dt><dd className="font-medium text-navy-900">{user.email}</dd></div>
            <div><dt className="text-xs text-slate">Role</dt><dd className="font-medium text-navy-900">{user.role.name}</dd></div>
          </dl>
        </Card>
        <PasswordForm />
      </div>
    </>
  );
}
