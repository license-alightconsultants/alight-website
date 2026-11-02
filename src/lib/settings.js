import { prisma } from '@/lib/db';
import { site } from '@/data/site';

// Editable website settings. `secret` values are write-only: never returned to the browser.
export const SETTING_GROUPS = [
  {
    title: 'Company',
    fields: [
      { key: 'company.name', label: 'Company name', default: site.name },
      { key: 'company.motto', label: 'Motto', default: site.motto },
      { key: 'company.description', label: 'Short description', type: 'textarea', default: site.description },
    ],
  },
  {
    title: 'Contact',
    fields: [
      { key: 'contact.email', label: 'Email', default: site.email },
      { key: 'contact.phone', label: 'Phone (display)', default: site.phone },
      { key: 'contact.phoneHref', label: 'Phone link', default: site.phoneHref, hint: 'e.g. tel:+917940048129' },
      { key: 'address.line1', label: 'Address line 1', default: site.address.line1 },
      { key: 'address.line2', label: 'Address line 2', default: site.address.line2 },
      { key: 'address.city', label: 'City', default: site.address.city },
      { key: 'address.postalCode', label: 'Postal code', default: site.address.postalCode },
      { key: 'careers.email', label: 'Careers email (shown on Careers page)', default: '', hint: 'Blank = main email' },
      { key: 'quote.email', label: 'Quote / sales email (shown on Get a Quote page)', default: '', hint: 'Blank = main email' },
      { key: 'map.query', label: 'Map search / coordinates', default: 'Ashoka Chambers, Mithakhali, Ahmedabad 380009', hint: 'Address text or "lat,lng"' },
    ],
  },
  {
    title: 'Social & footer',
    fields: [
      { key: 'social.linkedin', label: 'LinkedIn URL', default: site.social.linkedin },
      { key: 'social.facebook', label: 'Facebook URL', default: '' },
      { key: 'social.instagram', label: 'Instagram URL', default: '' },
      { key: 'social.x', label: 'X / Twitter URL', default: '' },
      { key: 'social.youtube', label: 'YouTube URL', default: '' },
      { key: 'footer.note', label: 'Footer note', default: '' },
    ],
  },
  {
    title: 'SEO defaults',
    fields: [
      { key: 'seo.title', label: 'Default title', default: `${site.shortName} — Engineering Tomorrow's Digital Enterprises` },
      { key: 'seo.description', label: 'Default description', type: 'textarea', default: site.description },
    ],
  },
  {
    title: 'Email (SMTP)',
    fields: [
      { key: 'smtp.host', label: 'SMTP host', default: '' },
      { key: 'smtp.port', label: 'SMTP port', default: '587' },
      { key: 'smtp.secure', label: 'Use TLS (true/false)', default: 'false' },
      { key: 'smtp.user', label: 'SMTP username', default: '' },
      { key: 'smtp.pass', label: 'SMTP password', secret: true, default: '' },
      { key: 'mail.from', label: 'From address', default: '' },
      { key: 'mail.notifyTo', label: 'Contact form notifications to', default: site.email, hint: 'Separate several addresses with commas' },
      { key: 'mail.notifyQuote', label: 'Quote / consultation notifications to', default: '', hint: 'Blank = contact form address' },
      { key: 'mail.notifyCareers', label: 'Job application notifications to', default: '', hint: 'Blank = contact form address' },
      { key: 'mail.customerAck', label: 'Send customer acknowledgement (true/false)', default: 'true' },
    ],
  },
];

const ALL_FIELDS = SETTING_GROUPS.flatMap((g) => g.fields);
export const SECRET_KEYS = new Set(ALL_FIELDS.filter((f) => f.secret).map((f) => f.key));
export const SETTING_KEYS = new Set(ALL_FIELDS.map((f) => f.key));
// Settings that hold one or more email addresses (validated on save).
export const EMAIL_KEYS = new Set(['contact.email', 'careers.email', 'quote.email', 'mail.notifyTo', 'mail.notifyQuote', 'mail.notifyCareers']);

async function readRows() {
  try {
    return await prisma.siteSetting.findMany();
  } catch (err) {
    console.error('[settings]', err.message);
    return [];
  }
}

/** Public-safe settings (secrets removed), merged over defaults. */
export async function getPublicSettings() {
  const rows = await readRows();
  const map = Object.fromEntries(ALL_FIELDS.filter((f) => !f.secret).map((f) => [f.key, f.default]));
  for (const r of rows) if (!r.isSecret && SETTING_KEYS.has(r.key)) map[r.key] = r.value;
  return map;
}

/** Server-only: includes secrets. Never pass the result to a client component. */
export async function getAllSettingsServer() {
  const rows = await readRows();
  const map = Object.fromEntries(ALL_FIELDS.map((f) => [f.key, f.default]));
  for (const r of rows) map[r.key] = r.value;
  return map;
}

/** Shape public settings like `site` for components. */
export function toSiteShape(s) {
  return {
    ...site,
    name: s['company.name'],
    motto: s['company.motto'],
    description: s['company.description'],
    email: s['contact.email'],
    phone: s['contact.phone'],
    phoneHref: s['contact.phoneHref'],
    address: { ...site.address, line1: s['address.line1'], line2: s['address.line2'], city: s['address.city'], postalCode: s['address.postalCode'] },
    social: Object.fromEntries(['linkedin', 'facebook', 'instagram', 'x', 'youtube'].map((k) => [k, s[`social.${k}`]]).filter(([, v]) => v)),
    careersEmail: s['careers.email'] || s['contact.email'],
    quoteEmail: s['quote.email'] || s['contact.email'],
    mapQuery: s['map.query'],
    footerNote: s['footer.note'],
  };
}

export async function getSite() {
  return toSiteShape(await getPublicSettings());
}
