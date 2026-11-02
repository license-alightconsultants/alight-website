'use client';

import { useActionState } from 'react';
import { changeOwnPasswordAction } from '@/lib/admin/user-actions';
import { ActionMessage, SubmitButton } from '@/components/admin/FormBits';
import { Card } from '@/components/admin/ui';

const control = 'mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/10';

export default function PasswordForm() {
  const [state, action] = useActionState(changeOwnPasswordAction, null);
  return (
    <Card title="Change password">
      <form action={action} className="grid gap-4 sm:grid-cols-3">
        <label className="text-[13px] font-medium text-navy-900">Current password<input name="current" type="password" autoComplete="current-password" required className={control} /></label>
        <label className="text-[13px] font-medium text-navy-900">New password<input name="next" type="password" autoComplete="new-password" required minLength={10} className={control} /></label>
        <label className="text-[13px] font-medium text-navy-900">Confirm new password<input name="confirm" type="password" autoComplete="new-password" required className={control} /></label>
        <div className="space-y-3 sm:col-span-3">
          <ActionMessage state={state} />
          <SubmitButton>Update password</SubmitButton>
        </div>
      </form>
    </Card>
  );
}
