import 'server-only';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ipFromHeaders } from '@/lib/rate-limit';

export const SESSION_COOKIE = 'alight_session';
const SESSION_HOURS = 8;
const MAX_FAILS_PER_EMAIL = 5;
const MAX_FAILS_PER_IP = 20;
const LOCK_WINDOW_MS = 15 * 60 * 1000;

const sha256 = (v) => crypto.createHash('sha256').update(v).digest('hex');

export const hashPassword = (pw) => bcrypt.hash(pw, 12);
export const verifyPassword = (pw, hash) => bcrypt.compare(pw, hash);

export function passwordProblem(pw) {
  if (typeof pw !== 'string' || pw.length < 10) return 'Password must be at least 10 characters.';
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return 'Password must contain letters and numbers.';
  return null;
}

export async function requestMeta() {
  const h = await headers();
  return {
    ip: ipFromHeaders(h),
    userAgent: h.get('user-agent')?.slice(0, 300) || null,
  };
}

// ── Login throttling (persisted, so it survives restarts) ──────────────
export async function isLocked(email, ip) {
  const since = new Date(Date.now() - LOCK_WINDOW_MS);
  const [byEmail, byIp] = await Promise.all([
    prisma.loginAttempt.count({ where: { key: `email:${email}`, success: false, createdAt: { gte: since } } }),
    prisma.loginAttempt.count({ where: { key: `ip:${ip}`, success: false, createdAt: { gte: since } } }),
  ]);
  return byEmail >= MAX_FAILS_PER_EMAIL || byIp >= MAX_FAILS_PER_IP;
}

export async function recordAttempt(email, ip, success) {
  await prisma.loginAttempt.createMany({
    data: [{ key: `email:${email}`, success }, { key: `ip:${ip}`, success }],
  });
  if (success) await prisma.loginAttempt.deleteMany({ where: { key: `email:${email}`, success: false } });
}

// ── Sessions ───────────────────────────────────────────────────────────
export async function createSession(userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const { ip, userAgent } = await requestMeta();
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 3600 * 1000);
  await prisma.session.create({ data: { id: sha256(token), userId, expiresAt, ip, userAgent } });
  await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await prisma.session.deleteMany({ where: { id: sha256(token) } });
  jar.delete(SESSION_COOKIE);
}

/** Returns the signed-in admin with a `permissions` Set, or null. Validated against the DB on every call. */
export async function getCurrentUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { id: sha256(token) },
    include: { user: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
  });
  if (!session || session.expiresAt < new Date() || !session.user.isActive) return null;
  const { passwordHash, ...user } = session.user;
  return { ...user, roleKey: user.role.key, permissions: new Set(user.role.permissions.map((rp) => rp.permission.key)) };
}

export const can = (user, permission) => Boolean(user && (!permission || user.permissions.has(permission)));

/** For pages: redirect to login, or to the dashboard if the permission is missing. */
export async function requirePage(permission) {
  const user = await getCurrentUser();
  if (!user) redirect('/admin/login');
  if (!can(user, permission)) redirect('/admin?denied=1');
  return user;
}

export class AuthError extends Error {}

/** For server actions & route handlers: throws instead of redirecting. */
export async function authorize(permission) {
  const user = await getCurrentUser();
  if (!user) throw new AuthError('Your session has expired. Please sign in again.');
  if (!can(user, permission)) throw new AuthError('You do not have permission to perform this action.');
  return user;
}

export function safeEqual(a = '', b = '') {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
