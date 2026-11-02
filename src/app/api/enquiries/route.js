import { NextResponse } from 'next/server';
import { contactSchema, consultationSchema, fieldErrors } from '@/lib/validation';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { createEnquiry } from '@/lib/enquiries';

export const runtime = 'nodejs';

const MIN_FILL_MS = 3000; // bots submit instantly

export async function POST(request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (origin && host && new URL(origin).host !== host) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }

  const ip = clientIp(request);
  const limit = rateLimit(`enquiry:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 });
  if (!limit.ok) {
    return NextResponse.json({ error: 'Too many submissions. Please try again later.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const type = body?.type === 'CONSULTATION' ? 'CONSULTATION' : 'CONTACT';
  const parsed = (type === 'CONSULTATION' ? consultationSchema : contactSchema).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please correct the highlighted fields.', fields: fieldErrors(parsed.error) }, { status: 422 });
  }

  // Spam: honeypot filled or impossibly fast. Respond as success so bots learn nothing.
  const tooFast = parsed.data.startedAt && Date.now() - parsed.data.startedAt < MIN_FILL_MS;
  if (body.website || tooFast) {
    return NextResponse.json({ ok: true, reference: 'ALC-RECEIVED' });
  }

  try {
    const enquiry = await createEnquiry(parsed.data, { type, ip, userAgent: request.headers.get('user-agent') });
    return NextResponse.json({ ok: true, reference: enquiry.reference }, { status: 201 });
  } catch (err) {
    console.error('[api/enquiries] save failed', err);
    return NextResponse.json({ error: 'We could not submit your enquiry. Please call or email us directly.' }, { status: 500 });
  }
}
