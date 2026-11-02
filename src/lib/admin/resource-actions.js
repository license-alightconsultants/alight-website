'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { authorize, AuthError } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { slugify } from '@/lib/slug';
import { removeUpload, saveImage, UploadError } from '@/lib/uploads';
import { getResource } from './resources';

const str = (v) => (typeof v === 'string' ? v.trim() : '');
const lines = (v) => str(v).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

// Echo submitted values back on error so the form can re-fill (React resets forms after actions).
function echo(res, formData) {
  const out = {};
  for (const f of res.fields) {
    if (f.type === 'image' || f.type === 'gallery') continue;
    const raw = formData.get(f.name);
    out[f.name] = f.type === 'checkbox' ? raw === 'on' : f.type === 'lines' ? lines(raw) : str(raw);
  }
  return out;
}

function resolve(key) {
  const res = getResource(key);
  if (!res) throw new Error('Unknown content type.');
  return res;
}

/** Parses and validates FormData against the resource field definitions. */
async function parseForm(res, formData, existing) {
  const data = {};
  const errors = {};
  const after = {}; // relation writes that need the record id

  for (const f of res.fields) {
    const raw = formData.get(f.name);
    switch (f.type) {
      case 'checkbox':
        data[f.name] = raw === 'on';
        break;
      case 'number': {
        const s = str(raw);
        if (!s) { if (f.required) errors[f.name] = 'Required'; else data[f.name] = 0; break; }
        const n = Number(s);
        if (!Number.isInteger(n) || n < 0 || n > 1e12) errors[f.name] = 'Enter a whole number';
        else data[f.name] = n;
        break;
      }
      case 'relation': {
        const s = str(raw);
        data[f.name] = s ? Number(s) : null;
        if (s && !Number.isInteger(data[f.name])) errors[f.name] = 'Invalid selection';
        break;
      }
      case 'datetime': {
        const s = str(raw);
        if (!s) { data[f.name] = null; break; }
        const d = new Date(s);
        if (Number.isNaN(d.getTime())) errors[f.name] = 'Invalid date'; else data[f.name] = d;
        break;
      }
      case 'image': {
        const remove = formData.get(`${f.name}__remove`) === 'on';
        const url = await saveImage(formData.get(f.name), f.folder);
        if (url) { data[f.name] = url; if (existing?.[f.name]) after.removeFiles = [...(after.removeFiles || []), existing[f.name]]; }
        else if (remove) { data[f.name] = null; if (existing?.[f.name]) after.removeFiles = [...(after.removeFiles || []), existing[f.name]]; }
        const finalValue = f.name in data ? data[f.name] : existing?.[f.name];
        if (f.required && !finalValue) errors[f.name] = 'Please upload an image';
        break;
      }
      case 'lines':
        if (f.store === 'json') data[f.name] = JSON.stringify(lines(raw));
        else after.features = lines(raw);
        break;
      case 'gallery': {
        const uploads = [];
        for (const file of formData.getAll(`${f.name}__new`)) {
          const url = await saveImage(file, f.folder);
          if (url) uploads.push(url);
        }
        after.gallery = {
          add: uploads,
          remove: formData.getAll(`${f.name}__delete`).map(Number).filter(Number.isInteger),
          alts: Object.fromEntries([...formData.entries()].filter(([k]) => k.startsWith(`${f.name}__alt_`)).map(([k, v]) => [Number(k.split('_').pop()), str(v).slice(0, 150)])),
        };
        break;
      }
      default: {
        let s = str(raw);
        if (f.type === 'slug') s = slugify(s || formData.get(f.from));
        if (f.type === 'select' && s && !f.options.some(([v]) => v === s)) { errors[f.name] = 'Invalid option'; break; }
        if (f.type === 'url' && s && !/^https?:\/\/[^\s]+$/i.test(s)) { errors[f.name] = 'Enter a full URL starting with https://'; break; }
        if (f.required && !s) { errors[f.name] = 'Required'; break; }
        if (f.max && s.length > f.max) { errors[f.name] = `Maximum ${f.max} characters`; break; }
        data[f.name] = s || (f.required ? s : null);
      }
    }
  }

  // Blog publishing rules
  if (res.model === 'blog') {
    if (data.status === 'PUBLISHED' && !data.publishedAt) data.publishedAt = existing?.publishedAt || new Date();
    if (data.status === 'SCHEDULED' && (!data.publishedAt || data.publishedAt <= new Date())) errors.publishedAt = 'Scheduled posts need a future date';
  }

  return { data, errors, after };
}

export async function saveResource(key, id, _prev, formData) {
  const res = resolve(key);
  let record;
  try {
    const user = await authorize(res.permission);
    const delegate = prisma[res.model];
    const existing = id ? await delegate.findUnique({ where: { id } }) : null;
    if (id && !existing) return { error: 'This item no longer exists.' };

    const { data, errors, after } = await parseForm(res, formData, existing);
    if (Object.keys(errors).length) return { error: 'Please fix the highlighted fields.', errors, values: echo(res, formData) };

    if (!id && res.orderable) {
      const max = await delegate.aggregate({ _max: { sortOrder: true } });
      data.sortOrder = (max._max.sortOrder ?? -1) + 1;
    }

    record = id ? await delegate.update({ where: { id }, data }) : await delegate.create({ data });

    if (after.features) {
      await prisma.productFeature.deleteMany({ where: { productId: record.id } });
      await prisma.productFeature.createMany({ data: after.features.map((title, i) => ({ productId: record.id, title, sortOrder: i })) });
    }
    if (after.gallery) {
      const { add, remove, alts } = after.gallery;
      if (remove.length) {
        const gone = await prisma.productImage.findMany({ where: { id: { in: remove }, productId: record.id } });
        await prisma.productImage.deleteMany({ where: { id: { in: gone.map((g) => g.id) } } });
        await Promise.all(gone.map((g) => removeUpload(g.url)));
      }
      for (const [imgId, alt] of Object.entries(alts)) {
        await prisma.productImage.updateMany({ where: { id: Number(imgId), productId: record.id }, data: { alt } });
      }
      if (add.length) {
        const count = await prisma.productImage.count({ where: { productId: record.id } });
        await prisma.productImage.createMany({
          data: add.map((url, i) => ({ productId: record.id, url, alt: record.name, kind: count + i === 0 ? 'COVER' : 'SCREENSHOT', sortOrder: count + i })),
        });
      }
    }
    for (const f of after.removeFiles || []) await removeUpload(f);

    await audit(user.id, id ? 'UPDATE' : 'CREATE', res.model, record.id, { title: record[res.titleField] });
  } catch (err) {
    const values = echo(res, formData);
    if (err instanceof AuthError || err instanceof UploadError) return { error: err.message, values };
    if (err.code === 'P2002') return { error: 'That slug or name is already in use.', errors: { slug: 'Already in use' }, values };
    console.error('[admin] save failed', key, err);
    return { error: 'Could not save. Please try again.', values };
  }
  revalidatePath('/', 'layout');
  redirect(`/admin/content/${key}?saved=1`);
}

export async function deleteResource(key, id) {
  const res = resolve(key);
  const user = await authorize(res.permission);
  const delegate = prisma[res.model];
  const existing = await delegate.findUnique({ where: { id } });
  if (existing) {
    const images = res.fields.filter((f) => f.type === 'image').map((f) => existing[f.name]);
    if (res.model === 'product') images.push(...(await prisma.productImage.findMany({ where: { productId: id } })).map((i) => i.url));
    await delegate.delete({ where: { id } });
    await Promise.all(images.map(removeUpload));
    await audit(user.id, 'DELETE', res.model, id, { title: existing[res.titleField] });
    revalidatePath('/', 'layout');
  }
  redirect(`/admin/content/${key}?deleted=1`);
}

export async function toggleResource(key, id, field) {
  const res = resolve(key);
  if (!res.columns.some((c) => c.name === field && c.toggle)) throw new Error('Field cannot be toggled.');
  const user = await authorize(res.permission);
  const delegate = prisma[res.model];
  const existing = await delegate.findUnique({ where: { id } });
  if (!existing) return;
  await delegate.update({ where: { id }, data: { [field]: !existing[field] } });
  await audit(user.id, 'TOGGLE', res.model, id, { field, value: !existing[field] });
  revalidatePath('/', 'layout');
}

export async function moveResource(key, id, direction) {
  const res = resolve(key);
  if (!res.orderable) return;
  const user = await authorize(res.permission);
  const delegate = prisma[res.model];
  const rows = await delegate.findMany({ orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }], select: { id: true } });
  const ids = rows.map((r) => r.id);
  const i = ids.indexOf(id);
  const j = direction === 'up' ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  await prisma.$transaction(ids.map((rowId, n) => delegate.update({ where: { id: rowId }, data: { sortOrder: n } })));
  await audit(user.id, 'REORDER', res.model, id, { direction });
  revalidatePath('/', 'layout');
}
