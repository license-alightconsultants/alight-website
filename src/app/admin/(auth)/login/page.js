import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  if (await getCurrentUser()) redirect('/admin');
  const needsSetup = (await prisma.adminUser.count()) === 0;
  return (
    <>
      <h1 className="font-display text-2xl font-bold text-navy-900">Sign in</h1>
      <p className="mt-1 text-sm text-slate">Use your administrator account.</p>
      {needsSetup ? (
        <div className="mt-8 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          No administrator exists yet. <Link href="/admin/setup" className="font-semibold underline">Run the secure setup</Link> to create the first Super Admin.
        </div>
      ) : (
        <LoginForm />
      )}
    </>
  );
}
