'use client';

import { useActionState } from 'react';
import { saveRolePermissionsAction } from '@/lib/admin/user-actions';
import { ActionMessage, SubmitButton } from '@/components/admin/FormBits';
import { Card } from '@/components/admin/ui';

export default function PermissionMatrix({ roles, permissions }) {
  const [state, action] = useActionState(saveRolePermissionsAction, null);
  return (
    <Card title="Role permissions" padded={false}>
      <form action={action}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate">
                <th className="px-4 py-2.5 text-left font-medium">Permission</th>
                {roles.map((r) => <th key={r.id} className="px-4 py-2.5 text-center font-medium">{r.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {permissions.map((p) => (
                <tr key={p.id} className="border-b border-slate-50">
                  <td className="px-4 py-2.5"><p className="text-navy-900">{p.label}</p><p className="font-mono text-[11px] text-slate">{p.key}</p></td>
                  {roles.map((r) => (
                    <td key={r.id} className="px-4 py-2.5 text-center">
                      <input type="checkbox" name={`${r.id}:${p.id}`} aria-label={`${r.name}: ${p.label}`}
                        defaultChecked={r.key === 'SUPER_ADMIN' || r.granted.includes(p.id)} disabled={r.key === 'SUPER_ADMIN'}
                        className="h-4 w-4 accent-crimson-600" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-3 p-4">
          <SubmitButton>Save permissions</SubmitButton>
          <p className="text-xs text-slate">Super Admin always has every permission.</p>
          <div className="flex-1"><ActionMessage state={state} /></div>
        </div>
      </form>
    </Card>
  );
}
