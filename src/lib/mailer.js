import nodemailer from 'nodemailer';
import { getAllSettingsServer } from '@/lib/settings';

let cached = { key: '', tx: null };

// SMTP config: admin settings (DB) take precedence, environment variables are the fallback.
async function getConfig() {
  const s = await getAllSettingsServer();
  const pick = (key, env) => s[key] || process.env[env] || '';
  return {
    host: pick('smtp.host', 'SMTP_HOST'),
    port: Number(pick('smtp.port', 'SMTP_PORT') || 587),
    secure: pick('smtp.secure', 'SMTP_SECURE') === 'true',
    user: pick('smtp.user', 'SMTP_USER'),
    pass: pick('smtp.pass', 'SMTP_PASS'),
    from: pick('mail.from', 'MAIL_FROM'),
    notifyTo: pick('mail.notifyTo', 'ENQUIRY_NOTIFY_TO'),
    // Quote requests and job applications can go to their own teams; blank falls back to notifyTo.
    notifyQuote: pick('mail.notifyQuote', 'QUOTE_NOTIFY_TO') || pick('mail.notifyTo', 'ENQUIRY_NOTIFY_TO'),
    notifyCareers: pick('mail.notifyCareers', 'CAREERS_NOTIFY_TO') || pick('mail.notifyTo', 'ENQUIRY_NOTIFY_TO'),
    contactEmail: s['contact.email'],
    quoteEmail: s['quote.email'] || s['contact.email'],
    careersEmail: s['careers.email'] || s['contact.email'],
    customerAck: pick('mail.customerAck', 'SEND_CUSTOMER_ACK') === 'true',
    companyName: s['company.name'],
    phone: s['contact.phone'],
  };
}

function transporterFor(c) {
  const key = JSON.stringify([c.host, c.port, c.secure, c.user, c.pass]);
  if (cached.key !== key) {
    cached = {
      key,
      tx: nodemailer.createTransport({ host: c.host, port: c.port, secure: c.secure, auth: c.user ? { user: c.user, pass: c.pass } : undefined }),
    };
  }
  return cached.tx;
}

const esc = (s = '') => String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

/**
 * Sends the internal notification and (optionally) the customer acknowledgement.
 * Never throws — the enquiry is already saved and email failure must not invalidate it.
 * @returns {Promise<'SENT'|'FAILED'|'SKIPPED'>}
 */
export async function sendEnquiryEmails(enquiry) {
  const c = await getConfig();
  const isQuote = enquiry.type === 'CONSULTATION';
  const to = isQuote ? c.notifyQuote : c.notifyTo;
  if (!c.host || !to) return 'SKIPPED';
  const tx = transporterFor(c);

  const rows = [
    ['Reference', enquiry.reference], ['Type', enquiry.type], ['Name', enquiry.name], ['Company', enquiry.company],
    ['Email', enquiry.email], ['Mobile', enquiry.mobile], ['Service', enquiry.service], ['Product', enquiry.product],
    ['Budget', enquiry.budget], ['Timeline', enquiry.timeline], ['Source page', enquiry.sourcePage],
  ].filter(([, v]) => v);
  const table = rows.map(([k, v]) => `<tr><td style="padding:6px 12px;color:#52647A">${k}</td><td style="padding:6px 12px">${esc(v)}</td></tr>`).join('');

  try {
    await tx.sendMail({
      from: c.from || c.user,
      to,
      replyTo: enquiry.email,
      subject: `[${enquiry.reference}] New ${enquiry.type.toLowerCase()} enquiry — ${enquiry.subject || enquiry.service || enquiry.name}`,
      html: `<table>${table}</table><p style="white-space:pre-wrap">${esc(enquiry.message)}</p>`,
    });
    if (c.customerAck) {
      await tx.sendMail({
        from: c.from || c.user,
        to: enquiry.email,
        replyTo: isQuote ? c.quoteEmail : c.contactEmail,
        subject: `We have received your enquiry — ${enquiry.reference}`,
        html: `<p>Dear ${esc(enquiry.name)},</p><p>Thank you for contacting ${esc(c.companyName)}. Your enquiry reference is <strong>${enquiry.reference}</strong>. Our team will get back to you shortly.</p><p>Regards,<br/>${esc(c.companyName)}<br/>${esc(c.phone)}</p>`,
      });
    }
    return 'SENT';
  } catch (err) {
    console.error('[mailer] enquiry email failed', enquiry.reference, err.message);
    return 'FAILED';
  }
}

/**
 * Notifies the careers inbox of a job application (and acknowledges the applicant when enabled).
 * Never throws — the application is already saved.
 * @returns {Promise<'SENT'|'FAILED'|'SKIPPED'>}
 */
export async function sendApplicationEmails(application, job) {
  const c = await getConfig();
  if (!c.host || !c.notifyCareers) return 'SKIPPED';
  const tx = transporterFor(c);
  const rows = [['Position', job.title], ['Name', application.name], ['Email', application.email], ['Mobile', application.mobile], ['CV link', application.resumeUrl]];
  const table = rows.map(([k, v]) => `<tr><td style="padding:6px 12px;color:#52647A">${k}</td><td style="padding:6px 12px">${esc(v)}</td></tr>`).join('');
  try {
    await tx.sendMail({
      from: c.from || c.user,
      to: c.notifyCareers,
      replyTo: application.email,
      subject: `New job application — ${job.title} — ${application.name}`,
      html: `<table>${table}</table>${application.coverNote ? `<p style="white-space:pre-wrap">${esc(application.coverNote)}</p>` : ''}`,
    });
    if (c.customerAck) {
      await tx.sendMail({
        from: c.from || c.user,
        to: application.email,
        replyTo: c.careersEmail,
        subject: `Application received — ${job.title}`,
        html: `<p>Dear ${esc(application.name)},</p><p>Thank you for applying for <strong>${esc(job.title)}</strong> at ${esc(c.companyName)}. Our team will review your profile and contact you if it matches the role.</p><p>Regards,<br/>${esc(c.companyName)}<br/>${esc(c.careersEmail)}</p>`,
      });
    }
    return 'SENT';
  } catch (err) {
    console.error('[mailer] application email failed', job.id, err.message);
    return 'FAILED';
  }
}

/** Used by the settings page "send test email" button. */
export async function sendTestEmail(to) {
  const c = await getConfig();
  if (!c.host) throw new Error('SMTP host is not configured.');
  await transporterFor(c).sendMail({ from: c.from || c.user, to, subject: 'Alight website — SMTP test', text: 'SMTP settings are working.' });
}
