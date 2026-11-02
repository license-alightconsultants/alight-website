import 'server-only';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requirePage } from '@/lib/auth';
import { getResource } from './resources';

export async function loadResource(key) {
  const res = getResource(key);
  if (!res) notFound();
  const user = await requirePage(res.permission);
  return { res, user };
}

/** Options for relation fields, e.g. industry and blog-category dropdowns. */
export async function relationOptions(res) {
  const out = {};
  for (const f of res.fields.filter((x) => x.type === 'relation')) {
    const rows = await prisma[f.relation.model].findMany({ orderBy: { [f.relation.label]: 'asc' } });
    out[f.name] = rows.map((r) => ({ id: r.id, label: r[f.relation.label] }));
  }
  return out;
}

/** Converts a DB record into form initial values (JSON lines → arrays, relations → arrays). */
export async function formValues(res, id) {
  const include = {};
  if (res.model === 'product') {
    include.features = { orderBy: { sortOrder: 'asc' } };
    include.images = { orderBy: { sortOrder: 'asc' } };
  }
  const row = await prisma[res.model].findUnique({ where: { id }, include: Object.keys(include).length ? include : undefined });
  if (!row) return null;
  const values = { ...row };
  for (const f of res.fields) {
    if (f.type === 'lines' && f.store === 'json') {
      try { values[f.name] = JSON.parse(row[f.name] || '[]'); } catch { values[f.name] = []; }
    }
    if (f.type === 'lines' && f.store === 'productFeatures') values[f.name] = row.features.map((x) => x.title);
  }
  return values;
}

export const getPath = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
