import { PrismaClient } from '@prisma/client';

// One PrismaClient (and connection pool) per process; reused across hot reloads in development.
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.__prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.__prisma = prisma;
