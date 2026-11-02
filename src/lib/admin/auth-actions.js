'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import {
  createSession, destroySession, getCurrentUser, hashPassword, isLocked, passwordProblem,
  recordAttempt, requestMeta, safeEqual, verifyPassword,
} from '@/lib/auth';
import { audit } from '@/lib/audit';

const GENERIC = 'Invalid email or password.';
// Dummy hash so unknown emails take the same time as wrong passwords (no user enumeration).
let dummyHash;
const getDummyHash = async () => (dummyHash ??= await hashPassword('timing-equaliser-not-a-real-password'));

export async function loginAction(_prev, formData) {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  if (!email || !password) return { error: 'Enter your email and password.' };

  const { ip } = await requestMeta();
  if (await isLocked(email, ip)) {
    return { error: 'Too many failed attempts. Please wait 15 minutes and try again.' };
  }

  const user = await prisma.adminUser.findUnique({ where: { email } });
  const ok = await verifyPassword(password, user?.passwordHash || (await getDummyHash()));
  if (!user || !ok || !user.isActive) {
    await recordAttempt(email, ip, false);
    if (user) await audit(user.id, 'LOGIN_FAILED', 'AdminUser', user.id, { ip });
    return { error: GENERIC };
  }

  await recordAttempt(email, ip, true);
  await createSession(user.id);
  await prisma.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await audit(user.id, 'LOGIN', 'AdminUser', user.id, { ip });
  redirect('/admin');
}

export async function logoutAction() {
  const user = await getCurrentUser();
  await destroySession();
  if (user) await audit(user.id, 'LOGOUT', 'AdminUser', user.id);
  redirect('/admin/login');
}

const setupSchema = z.object({
  token: z.string().min(1, 'Setup token is required'),
  name: z.string().trim().min(2, 'Enter your name').max(100),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string(),
  confirm: z.string(),
});

/** One-time creation of the first Super Admin. Requires ADMIN_SETUP_TOKEN and an empty user table. */
export async function setupAction(_prev, formData) {
  const expected = process.env.ADMIN_SETUP_TOKEN;
  if (!expected || expected.length < 16) return { error: 'Setup is disabled. Set ADMIN_SETUP_TOKEN (16+ characters) in the server environment.' };
  if ((await prisma.adminUser.count()) > 0) return { error: 'Setup has already been completed.' };

  const parsed = setupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { token, name, email, password, confirm } = parsed.data;
  if (!safeEqual(token, expected)) return { error: 'Invalid setup token.' };
  const problem = passwordProblem(password);
  if (problem) return { error: problem };
  if (password !== confirm) return { error: 'Passwords do not match.' };

  const role = await prisma.role.findUnique({ where: { key: 'SUPER_ADMIN' } });
  if (!role) return { error: 'Roles are missing. Run the database seed first (npm run db:seed).' };

  const user = await prisma.adminUser.create({ data: { name, email, passwordHash: await hashPassword(password), roleId: role.id } });
  await audit(user.id, 'SETUP_SUPER_ADMIN', 'AdminUser', user.id);
  await createSession(user.id);
  redirect('/admin');
}
