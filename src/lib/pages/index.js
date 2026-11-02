import 'server-only';
import { cache } from 'react';
import { prisma } from '@/lib/db';
import { getSite } from '@/lib/settings';
import { PAGE_MAP, pageFields } from './registry';

export const pageSettingKey = (key) => `page:${key}`;

/** Raw stored overrides for a page (only fields that differ from the defaults). */
export async function getStoredPage(key) {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: pageSettingKey(key) } });
    const data = row ? JSON.parse(row.value) : {};
    return { data: data && typeof data === 'object' ? data : {}, updatedAt: row?.updatedAt || null };
  } catch (err) {
    console.error('[pages]', key, err.message);
    return { data: {}, updatedAt: null };
  }
}

/** Defaults merged with stored overrides — no placeholder substitution (used by the admin form). */
export async function getPageValues(key) {
  const page = PAGE_MAP[key];
  const { data } = await getStoredPage(key);
  const out = {};
  for (const f of pageFields(page)) out[f.name] = f.name in data ? data[f.name] : f.default;
  return out;
}

function substitute(value, vars) {
  if (typeof value !== 'string') return value;
  return value.replace(/\{(company|email|phone|address|careersEmail|quoteEmail|count)\}/g, (m, k) => (vars[k] ?? m));
}

/**
 * Content for a public page: defaults + admin overrides, with {company}, {email}… placeholders filled
 * from Website settings. `extra` adds page-specific placeholders such as {count}.
 */
export const getPage = cache(async (key, extra = {}) => {
  const [values, site] = await Promise.all([getPageValues(key), getSite()]);
  const vars = {
    company: site.name,
    email: site.email,
    phone: site.phone,
    address: `${site.address.line1}, ${site.address.line2}, ${site.address.city} ${site.address.postalCode}`,
    careersEmail: site.careersEmail,
    quoteEmail: site.quoteEmail,
    ...extra,
  };
  return Object.fromEntries(Object.entries(values).map(([k, v]) => [k, substitute(v, vars)]));
});

/** Next.js metadata from the page's SEO fields. */
export async function pageMetadata(key) {
  const c = await getPage(key);
  const path = PAGE_MAP[key].path;
  const meta = { alternates: { canonical: path } };
  // Blank fields fall back to the site-wide SEO defaults set in the root layout.
  if (c['seo.title']) meta.title = key === 'home' ? { absolute: c['seo.title'] } : c['seo.title'];
  if (c['seo.description']) meta.description = c['seo.description'];
  return meta;
}

/** Props for <PageHero> from a page's "Top banner" fields. */
export function heroProps(c) {
  return { eyebrow: c['hero.eyebrow'], title: c['hero.title'], lead: c['hero.lead'], bg: c['hero.bg'], image: c['hero.image'], graphic: c['hero.graphic'] };
}

/** Props for <FinalCta> from a page's "Closing call-to-action" fields. */
export function ctaProps(c) {
  return { title: c['cta.title'], lead: c['cta.lead'], primary: c['cta.primary'], secondary: c['cta.secondary'], bg: c['cta.bg'] };
}
