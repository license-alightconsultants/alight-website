'use client';

import { useActionState } from 'react';
import { saveSettingsAction, testEmailAction } from '@/lib/admin/settings-actions';
import { ActionMessage, SubmitButton } from '@/components/admin/FormBits';
import { Card } from '@/components/admin/ui';

const control = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-navy-900 focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/10';

export default function SettingsForm({ groups, values, secretsSet, userEmail }) {
  const [state, action] = useActionState(saveSettingsAction, null);
  const [testState, testAction] = useActionState(testEmailAction, null);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <form action={action} className="space-y-6">
        {groups.map((g) => (
          <Card key={g.title} title={g.title}>
            <div className="grid gap-5 sm:grid-cols-2">
              {g.fields.map((f) => (
                <div key={f.key} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                  <label htmlFor={f.key} className="mb-1.5 block text-[13px] font-medium text-navy-900">{f.label}</label>
                  {f.secret ? (
                    <>
                      <input id={f.key} name={f.key} type="password" autoComplete="new-password" placeholder={secretsSet[f.key] ? '•••••••• (stored — leave blank to keep)' : 'Not set'} className={control} />
                      {secretsSet[f.key] && <label className="mt-1.5 flex items-center gap-2 text-xs text-slate"><input type="checkbox" name={`${f.key}__clear`} /> Clear stored value</label>}
                    </>
                  ) : f.type === 'textarea' ? (
                    <textarea id={f.key} name={f.key} rows={3} defaultValue={values[f.key]} className={control} />
                  ) : (
                    <input id={f.key} name={f.key} defaultValue={values[f.key]} className={control} />
                  )}
                  {f.hint && <p className="mt-1 text-xs text-slate">{f.hint}</p>}
                </div>
              ))}
            </div>
          </Card>
        ))}
        <div className="sticky bottom-4 z-10 flex items-center gap-3 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
          <SubmitButton variant="accent">Save settings</SubmitButton>
          <div className="flex-1"><ActionMessage state={state} /></div>
        </div>
      </form>

      <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <Card title="Test email delivery">
          <form action={testAction} className="space-y-3">
            <p className="text-xs text-slate">Save SMTP settings first, then send a test message.</p>
            <input name="to" type="email" defaultValue={userEmail} aria-label="Send test to" className={control} />
            <ActionMessage state={testState} />
            <SubmitButton variant="outline" pendingText="Sending…">Send test email</SubmitButton>
          </form>
        </Card>
        <Card title="Notes">
          <ul className="list-disc space-y-2 pl-4 text-xs text-slate">
            <li>Passwords are write-only. They are never shown again or sent to the browser.</li>
            <li>If SMTP is not configured here, the server environment variables are used.</li>
            <li>Enquiries are always saved, even if an email fails.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
