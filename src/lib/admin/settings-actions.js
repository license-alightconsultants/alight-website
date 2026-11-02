'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { authorize, AuthError } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { EMAIL_KEYS, SECRET_KEYS, SETTING_GROUPS } from '@/lib/settings';

const EMAIL_RE = /^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/;
import { sendTestEmail } from '@/lib/mailer';

export async function saveSettingsAction(_prev, formData) {
  try {
    const user = await authorize('settings.write');
    const ops = [];
    const changed = [];
    for (const f of SETTING_GROUPS.flatMap((g) => g.fields)) {
      const value = String(formData.get(f.key) ?? '').trim().slice(0, 2000);
      if (SECRET_KEYS.has(f.key)) {
        // Secrets are write-only: blank keeps the stored value; "clear" checkbox removes it.
        if (formData.get(`${f.key}__clear`) === 'on') { ops.push(prisma.siteSetting.deleteMany({ where: { key: f.key } })); changed.push(f.key); }
        else if (value) { ops.push(prisma.siteSetting.upsert({ where: { key: f.key }, update: { value, isSecret: true }, create: { key: f.key, value, isSecret: true } })); changed.push(f.key); }
        continue;
      }
      if (f.key.startsWith('social.') && value && !/^https?:\/\//i.test(value)) {
        return { error: `${f.label} must be a full URL starting with https://` };
      }
      if (EMAIL_KEYS.has(f.key) && value && !value.split(',').every((a) => EMAIL_RE.test(a.trim()))) {
        return { error: `${f.label}: enter valid email address(es), separated by commas.` };
      }
      ops.push(prisma.siteSetting.upsert({ where: { key: f.key }, update: { value }, create: { key: f.key, value } }));
    }
    await prisma.$transaction(ops);
    await audit(user.id, 'UPDATE', 'SiteSetting', null, { secretsChanged: changed });
    revalidatePath('/', 'layout');
    return { ok: true, message: 'Settings saved.' };
  } catch (err) {
    if (err instanceof AuthError) return { error: err.message };
    console.error('[admin/settings]', err);
    return { error: 'Could not save settings.' };
  }
}

export async function testEmailAction(_prev, formData) {
  try {
    const user = await authorize('settings.write');
    const to = String(formData.get('to') || user.email);
    await sendTestEmail(to);
    return { ok: true, message: `Test email sent to ${to}.` };
  } catch (err) {
    return { error: err instanceof AuthError ? err.message : `SMTP test failed: ${err.message}` };
  }
}
