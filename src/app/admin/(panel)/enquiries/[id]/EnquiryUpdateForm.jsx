'use client';

import { useActionState } from 'react';
import { ENQUIRY_STATUSES } from '@/lib/admin/enquiry-constants';
import { ActionMessage, SubmitButton } from '@/components/admin/FormBits';
import { Card } from '@/components/admin/ui';

const control = 'mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-navy-900 focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/10';

// `action` is bound to the enquiry id by the server page, so its identity is stable across renders.
export default function EnquiryUpdateForm({ action: boundAction, status, assigneeId, team }) {
  const [state, action] = useActionState(boundAction, null);
  return (
    <Card title="Manage enquiry">
      <form action={action} className="space-y-4">
        <label className="block text-[13px] font-medium text-navy-900">Status
          <select name="status" defaultValue={status} className={control}>
            {ENQUIRY_STATUSES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </label>
        <label className="block text-[13px] font-medium text-navy-900">Assigned to
          <select name="assigneeId" defaultValue={assigneeId ?? ''} className={control}>
            <option value="">Unassigned</option>
            {team.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
        <label className="block text-[13px] font-medium text-navy-900">Internal remark
          <textarea name="remark" rows={4} className={control} placeholder="Visible to the admin team only" />
        </label>
        <ActionMessage state={state} />
        <SubmitButton variant="accent">Save update</SubmitButton>
      </form>
    </Card>
  );
}
