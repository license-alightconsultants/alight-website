import { prisma } from '@/lib/db';

export async function audit(userId, action, entity, entityId, meta) {
  try {
    await prisma.auditLog.create({
      data: { userId, action, entity, entityId: entityId != null ? String(entityId) : null, meta: meta ? JSON.stringify(meta) : null },
    });
  } catch (err) {
    console.error('[audit] failed to write', action, entity, err.message);
  }
}
