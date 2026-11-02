'use client';

import { useActionState } from 'react';
import { ActionMessage, SubmitButton } from '@/components/admin/FormBits';
import { Card } from '@/components/admin/ui';

const control = 'mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-navy-900 focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/10';

export default function UserForm({ action: boundAction, user, roles }) {
  const [state, action] = useActionState(boundAction, null);
  return (
    <Card className="max-w-2xl">
      <form action={action} className="grid gap-5 sm:grid-cols-2">
        <label className="text-[13px] font-medium text-navy-900">Full name<input name="name" required defaultValue={user?.name} className={control} /></label>
        <label className="text-[13px] font-medium text-navy-900">Email<input name="email" type="email" required defaultValue={user?.email} className={control} /></label>
        <label className="text-[13px] font-medium text-navy-900">Role
          <select name="roleId" defaultValue={user?.roleId ?? ''} required className={control}>
            <option value="" disabled>Select a role</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </label>
        <label className="text-[13px] font-medium text-navy-900">{user ? 'Reset password (optional)' : 'Password'}
          <input name="password" type="password" autoComplete="new-password" required={!user} minLength={10} className={control} />
          <span className="mt-1 block text-xs font-normal text-slate">At least 10 characters with letters and numbers.{user && ' Resetting signs the user out everywhere.'}</span>
        </label>
        <label className="flex items-center gap-2 text-sm text-navy-900 sm:col-span-2">
          <input type="checkbox" name="isActive" defaultChecked={user ? user.isActive : true} className="h-4 w-4 accent-crimson-600" /> Account active
        </label>
        <div className="space-y-3 sm:col-span-2">
          <ActionMessage state={state} />
          <SubmitButton variant="accent">{user ? 'Save user' : 'Create user'}</SubmitButton>
        </div>
      </form>
    </Card>
  );
}
