import Link from 'next/link';
import { Plus, Pencil } from 'lucide-react';
import { prisma } from '@/lib/db';
import { requirePage } from '@/lib/auth';
import { Badge, Card, LinkButton, PageHeader, buttonClass, fmtDate } from '@/components/admin/ui';
import PermissionMatrix from './PermissionMatrix';

export const metadata = { title: 'Users & roles' };

export default async function UsersPage() {
  await requirePage('users.write');
  const [users, roles, permissions] = await Promise.all([
    prisma.adminUser.findMany({ include: { role: true }, orderBy: { createdAt: 'asc' } }),
    prisma.role.findMany({ include: { permissions: true }, orderBy: { id: 'asc' } }),
    prisma.permission.findMany({ orderBy: { id: 'asc' } }),
  ]);

  return (
    <>
      <PageHeader title="Users & roles" description="Manage administrator accounts and what each role can do."
        actions={<LinkButton href="/admin/users/new" variant="accent"><Plus className="h-4 w-4" /> New user</LinkButton>} />
      <Card padded={false} className="mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-[11px] uppercase tracking-wider text-slate">
              <th className="px-4 py-2.5 font-medium">Name</th><th className="px-4 py-2.5 font-medium">Role</th>
              <th className="px-4 py-2.5 font-medium">Status</th><th className="hidden px-4 py-2.5 font-medium md:table-cell">Last login</th><th />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-4 py-3"><p className="font-medium text-navy-900">{u.name}</p><p className="text-xs text-slate">{u.email}</p></td>
                <td className="px-4 py-3 text-slate">{u.role.name}</td>
                <td className="px-4 py-3"><Badge value={u.isActive ? 'PUBLISHED' : 'DRAFT'} label={u.isActive ? 'Active' : 'Disabled'} /></td>
                <td className="hidden px-4 py-3 text-xs text-slate md:table-cell">{fmtDate(u.lastLoginAt, true)}</td>
                <td className="px-4 py-3 text-right"><Link href={`/admin/users/${u.id}`} className={buttonClass('outline', 'sm')}><Pencil className="h-3.5 w-3.5" /> Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <PermissionMatrix
        roles={roles.map((r) => ({ id: r.id, key: r.key, name: r.name, granted: r.permissions.map((p) => p.permissionId) }))}
        permissions={permissions.map((p) => ({ id: p.id, key: p.key, label: p.label }))}
      />
    </>
  );
}
