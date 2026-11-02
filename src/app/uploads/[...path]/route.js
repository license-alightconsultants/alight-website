import fs from 'node:fs/promises';
import path from 'node:path';
import { UPLOAD_DIR, MIME_BY_EXT } from '@/lib/uploads';

export const runtime = 'nodejs';

export async function GET(_request, { params }) {
  const parts = (await params).path;
  const target = path.resolve(UPLOAD_DIR, ...parts);
  const ext = path.extname(target).slice(1).toLowerCase();
  if (!target.startsWith(UPLOAD_DIR + path.sep) || !MIME_BY_EXT[ext]) {
    return new Response('Not found', { status: 404 });
  }
  try {
    const data = await fs.readFile(target);
    return new Response(data, {
      headers: {
        'Content-Type': MIME_BY_EXT[ext],
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
