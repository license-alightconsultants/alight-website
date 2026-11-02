import 'server-only';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

// Two storage back ends:
//  - Vercel (or any host with BLOB_READ_WRITE_TOKEN set): Vercel Blob, because serverless disks are read-only
//    and wiped between requests. Files get public https://<store>.public.blob.vercel-storage.com/... URLs.
//  - Own server: persistent disk outside the deploy folder (UPLOAD_DIR), served by /uploads/[...path].
export const USE_BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
export const BLOB_URL = /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\//i;
export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), 'data', 'uploads'));
// Vercel rejects request bodies over 4.5 MB, so images are capped at 4 MB there.
export const MAX_IMAGE_BYTES = (process.env.VERCEL ? 4 : 5) * 1024 * 1024;

const signatures = [
  { ext: 'png', mime: 'image/png', test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { ext: 'jpg', mime: 'image/jpeg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: 'gif', mime: 'image/gif', test: (b) => b.subarray(0, 4).toString('ascii') === 'GIF8' },
  { ext: 'webp', mime: 'image/webp', test: (b) => b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP' },
  {
    ext: 'svg',
    mime: 'image/svg+xml',
    // SVG is only accepted without scripts/handlers; it is additionally served with a sandbox CSP.
    test: (b) => {
      const s = b.subarray(0, 4096).toString('utf8').trimStart();
      return /^(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*<svg[\s>]/i.test(s) && !/<script|<foreignObject|\son\w+\s*=|javascript:/i.test(b.toString('utf8'));
    },
  },
];

export const MIME_BY_EXT = Object.fromEntries(signatures.map((s) => [s.ext, s.mime]));

export class UploadError extends Error {}

/** Validates and stores an image File from FormData. Returns its public URL, or null when no file was chosen. */
export async function saveImage(file, folder = 'misc') {
  if (!file || typeof file === 'string' || file.size === 0) return null;
  if (file.size > MAX_IMAGE_BYTES) throw new UploadError(`Image must be ${MAX_IMAGE_BYTES / 1024 / 1024} MB or smaller.`);
  const buf = Buffer.from(await file.arrayBuffer());
  const kind = signatures.find((s) => s.test(buf));
  if (!kind) throw new UploadError('Unsupported file. Upload a PNG, JPG, WebP, GIF or safe SVG image.');

  const safeFolder = folder.replace(/[^a-z0-9-]/gi, '');
  const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${kind.ext}`;
  if (USE_BLOB) {
    const { put } = await import('@vercel/blob');
    const blob = await put(`${safeFolder}/${name}`, buf, {
      access: 'public',
      contentType: kind.mime,
      addRandomSuffix: false,
      cacheControlMaxAge: 31536000,
    });
    return blob.url;
  }
  const dir = path.join(UPLOAD_DIR, safeFolder);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), buf);
  return `/uploads/${safeFolder}/${name}`;
}

/** Deletes a previously uploaded file (Blob URLs, or only paths inside UPLOAD_DIR). */
export async function removeUpload(url) {
  if (USE_BLOB && typeof url === 'string' && BLOB_URL.test(url)) {
    const { del } = await import('@vercel/blob');
    await del(url).catch(() => {});
    return;
  }
  if (!url?.startsWith('/uploads/')) return;
  const target = path.resolve(UPLOAD_DIR, url.slice('/uploads/'.length));
  if (!target.startsWith(UPLOAD_DIR + path.sep)) return;
  await fs.unlink(target).catch(() => {});
}
