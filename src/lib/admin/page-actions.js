'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { authorize, AuthError } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { removeUpload, saveImage, UploadError } from '@/lib/uploads';
import { PAGE_MAP, pageFields } from '@/lib/pages/registry';
import { BG_PRESETS, HEX, isUploadUrl } from '@/lib/pages/backgrounds';
import { getStoredPage, pageSettingKey } from '@/lib/pages';

const MAX = { text: 300, textarea: 5000, items: 8000, lines: 3000 };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** Replaces an image: a new upload wins, "remove" clears it, otherwise the stored value is kept. */
async function imageValue(formData, name, current, uploaded) {
  const file = formData.get(name);
  if (file && typeof file !== 'string' && file.size > 0) {
    const url = await saveImage(file, 'pages');
    uploaded.push(url);
    return url;
  }
  if (formData.get(`${name}__remove`) === 'on') return '';
  return isUploadUrl(current) ? current : '';
}

function readText(formData, f) {
  const raw = String(formData.get(f.name) ?? '').replace(/\r\n/g, '\n');
  const value = f.type === 'text' ? raw.replace(/\s+/g, ' ').trim() : raw.trim();
  if (value.length > (MAX[f.type] || 300)) throw new UploadError(`“${f.label}” is too long (max ${MAX[f.type]} characters).`);
  return value;
}

export async function savePageAction(key, _prev, formData) {
  const uploaded = [];
  try {
    const user = await authorize('content.write');
    const page = PAGE_MAP[key];
    if (!page) return { error: 'Unknown page.' };
    const { data: stored } = await getStoredPage(key);
    const next = {};
    const replaced = [];

    for (const f of pageFields(page)) {
      let value;
      switch (f.type) {
        case 'toggle':
          value = formData.get(f.name) === 'on';
          break;
        case 'image':
          value = await imageValue(formData, f.name, stored[f.name], uploaded);
          break;
        case 'background': {
          const preset = String(formData.get(`${f.name}.preset`) || 'default');
          if (!BG_PRESETS[f.tone].some((p) => p.value === preset)) return { error: `Invalid background for “${f.label}”.` };
          const color = String(formData.get(`${f.name}.color`) || '').trim();
          const color2 = String(formData.get(`${f.name}.color2`) || '').trim();
          const overlay = Math.min(95, Math.max(0, Number(formData.get(`${f.name}.overlay`)) || 0));
          const image = await imageValue(formData, `${f.name}.image`, stored[f.name]?.image, uploaded);
          if ((preset === 'custom' || preset === 'gradient') && !HEX.test(color)) return { error: `Pick a colour for “${f.label}”.` };
          if (preset === 'gradient' && !HEX.test(color2)) return { error: `Pick the second colour for “${f.label}”.` };
          if (preset === 'image' && !image) return { error: `Upload an image for “${f.label}”, or choose another background.` };
          value = preset === 'default' ? { preset } : { preset, color, color2, image, overlay };
          break;
        }
        default:
          value = readText(formData, f);
      }
      // Only differences from the built-in copy are stored, so future design updates still reach unchanged fields.
      if (!same(value, f.default)) next[f.name] = value;

      const oldImg = f.type === 'image' ? stored[f.name] : f.type === 'background' ? stored[f.name]?.image : null;
      const newImg = f.type === 'image' ? value : f.type === 'background' ? value.image : null;
      if (oldImg && oldImg !== newImg) replaced.push(oldImg);
    }

    const settingKey = pageSettingKey(key);
    if (Object.keys(next).length) {
      const value = JSON.stringify(next);
      await prisma.siteSetting.upsert({ where: { key: settingKey }, update: { value }, create: { key: settingKey, value } });
    } else {
      await prisma.siteSetting.deleteMany({ where: { key: settingKey } });
    }
    await Promise.all(replaced.map(removeUpload));
    await audit(user.id, 'UPDATE', 'Page', null, { page: key, customisedFields: Object.keys(next).length });

    revalidatePath(page.path);
    revalidatePath(`/admin/pages/${key}`);
    return { ok: true, message: 'Page saved — changes are live.' };
  } catch (err) {
    await Promise.all(uploaded.map(removeUpload)); // don't leave orphaned files when the save fails
    if (err instanceof AuthError || err instanceof UploadError) return { error: err.message };
    console.error('[admin/pages]', err);
    return { error: 'Could not save the page.' };
  }
}

export async function resetPageAction(key) {
  const user = await authorize('content.write');
  const page = PAGE_MAP[key];
  if (!page) return;
  const { data: stored } = await getStoredPage(key);
  const images = Object.values(stored).map((v) => (typeof v === 'string' ? v : v?.image)).filter(isUploadUrl);
  await prisma.siteSetting.deleteMany({ where: { key: pageSettingKey(key) } });
  await Promise.all(images.map(removeUpload));
  await audit(user.id, 'UPDATE', 'Page', null, { page: key, reset: true });
  revalidatePath(page.path);
  revalidatePath(`/admin/pages/${key}`);
}
