'use client';

import { useActionState } from 'react';
import { setupAction } from '@/lib/admin/auth-actions';
import { ActionMessage, SubmitButton } from '@/components/admin/FormBits';

const input = 'mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/10';

export default function SetupForm() {
  const [state, action] = useActionState(setupAction, null);
  return (
    <form action={action} className="mt-8 space-y-4">
      <ActionMessage state={state} />
      <label className="block text-sm font-medium text-navy-900">Setup token
        <input name="token" type="password" autoComplete="off" required className={input} />
      </label>
      <label className="block text-sm font-medium text-navy-900">Full name
        <input name="name" required autoComplete="name" className={input} />
      </label>
      <label className="block text-sm font-medium text-navy-900">Email
        <input name="email" type="email" required autoComplete="username" className={input} />
      </label>
      <label className="block text-sm font-medium text-navy-900">Password
        <input name="password" type="password" required minLength={10} autoComplete="new-password" className={input} />
        <span className="mt-1 block text-xs font-normal text-slate">At least 10 characters, with letters and numbers.</span>
      </label>
      <label className="block text-sm font-medium text-navy-900">Confirm password
        <input name="confirm" type="password" required autoComplete="new-password" className={input} />
      </label>
      <SubmitButton variant="accent" pendingText="Creating…" style={{ width: '100%', paddingTop: 10, paddingBottom: 10 }}>Create Super Admin</SubmitButton>
    </form>
  );
}
