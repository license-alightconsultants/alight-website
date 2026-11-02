import crypto from 'node:crypto';
import { prisma } from '@/lib/db';
import { sendEnquiryEmails } from '@/lib/mailer';

function makeReference() {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `ALC-${ymd}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

export async function createEnquiry(data, meta) {
  const { website, startedAt, consent, ...fields } = data;
  const clean = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, v === '' ? null : v]));

  let enquiry;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      enquiry = await prisma.enquiry.create({
        data: {
          ...clean,
          consent: Boolean(consent),
          type: meta.type,
          reference: makeReference(),
          ip: meta.ip,
          userAgent: meta.userAgent?.slice(0, 300),
          activities: { create: { action: 'CREATED', detail: `Submitted from ${clean.sourcePage || 'website'}` } },
        },
      });
      break;
    } catch (err) {
      if (err.code !== 'P2002' || attempt === 2) throw err; // retry only on reference collision
    }
  }

  const emailStatus = await sendEnquiryEmails(enquiry);
  await prisma.enquiry.update({
    where: { id: enquiry.id },
    data: {
      emailStatus,
      activities: emailStatus === 'SKIPPED' ? undefined : { create: { action: emailStatus === 'SENT' ? 'EMAIL_SENT' : 'EMAIL_FAILED' } },
    },
  });

  return enquiry;
}
