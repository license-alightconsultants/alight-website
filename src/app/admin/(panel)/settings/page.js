import { prisma } from '@/lib/db';
import { requirePage } from '@/lib/auth';
import { SECRET_KEYS, SETTING_GROUPS, getPublicSettings } from '@/lib/settings';
import { PageHeader } from '@/components/admin/ui';
import SettingsForm from './SettingsForm';

export const metadata = { title: 'Website settings' };

export default async function SettingsPage() {
  const user = await requirePage('settings.write');
  const values = await getPublicSettings(); // secrets are excluded here
  // For secrets we only tell the browser whether a value exists — never the value itself.
  const secretRows = await prisma.siteSetting.findMany({ where: { key: { in: [...SECRET_KEYS] } }, select: { key: true } });
  const secretsSet = Object.fromEntries(secretRows.map((r) => [r.key, true]));

  return (
    <>
      <PageHeader title="Website settings" description="Company details, contact information, social links, SEO defaults and email delivery." />
      <SettingsForm groups={SETTING_GROUPS} values={values} secretsSet={secretsSet} userEmail={user.email} />
    </>
  );
}
