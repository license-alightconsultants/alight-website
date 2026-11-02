import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import SetupForm from './SetupForm';

export const dynamic = 'force-dynamic';

export default async function SetupPage() {
  if ((await prisma.adminUser.count()) > 0) redirect('/admin/login');
  const enabled = (process.env.ADMIN_SETUP_TOKEN || '').length >= 16;
  return (
    <>
      <h1 className="font-display text-2xl font-bold text-navy-900">Create the first Super Admin</h1>
      <p className="mt-1 text-sm text-slate">This page works only once, and only with the setup token from the server’s environment.</p>
      {enabled ? <SetupForm /> : (
        <div className="mt-8 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          Setup is disabled. Add <code className="font-mono">ADMIN_SETUP_TOKEN</code> (at least 16 random characters) to the server <code className="font-mono">.env</code> and restart the app.
        </div>
      )}
    </>
  );
}
