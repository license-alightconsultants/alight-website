import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { sendApplicationEmails } from '@/lib/mailer';

export const runtime = 'nodejs';

const schema = z.object({
  jobId: z.number().int().positive(),
  name: z.string().trim().min(2, 'Please enter your name').max(100),
  email: z.string().trim().email('Enter a valid email').max(150),
  mobile: z.string().trim().regex(/^[+\d][\d\s-]{6,18}$/, 'Enter a valid phone number'),
  resumeUrl: z.string().trim().url('Enter a full link to your CV (e.g. Google Drive)').max(500),
  coverNote: z.string().trim().max(3000).optional().or(z.literal('')),
  website: z.string().max(200).optional(),
});

export async function POST(request) {
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== request.headers.get('host')) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  if (!rateLimit(`apply:${clientIp(request)}`, { limit: 5, windowMs: 60 * 60 * 1000 }).ok) {
    return NextResponse.json({ error: 'Too many applications. Please try later.' }, { status: 429 });
  }
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const fields = Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message]));
    return NextResponse.json({ error: 'Please correct the highlighted fields.', fields }, { status: 422 });
  }
  if (parsed.data.website) return NextResponse.json({ ok: true });
  if (!/^https?:\/\//i.test(parsed.data.resumeUrl)) return NextResponse.json({ error: 'CV link must start with https://', fields: { resumeUrl: 'Invalid link' } }, { status: 422 });

  const job = await prisma.job.findFirst({ where: { id: parsed.data.jobId, isActive: true } });
  if (!job) return NextResponse.json({ error: 'This position is no longer open.' }, { status: 404 });

  const { website, coverNote, ...data } = parsed.data;
  const application = await prisma.jobApplication.create({ data: { ...data, coverNote: coverNote || null } });
  await sendApplicationEmails(application, job);
  return NextResponse.json({ ok: true }, { status: 201 });
}
