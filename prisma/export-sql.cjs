// Exports the database named by DATABASE_URL as one portable SQL file: tables (from the Prisma migrations),
// the Prisma migration history, all data and sequence positions. Load it into an EMPTY hosted PostgreSQL
// (Neon, Supabase, Vercel Postgres, ...) with psql or the provider's SQL editor.
//
//   node prisma/export-sql.cjs [out.sql]        default: deploy/vercel/alight-database.sql
//
// Login sessions and login attempts are NOT exported (they are temporary and security-sensitive).
// The file contains admin password hashes and site settings: keep it private, never commit it.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { PrismaClient, Prisma } = require('@prisma/client');

const out = path.resolve(process.argv[2] || path.join(__dirname, '..', 'deploy', 'vercel', 'alight-database.sql'));

// Parents before children so foreign keys are satisfied while loading.
const ORDER = [
  'Role', 'Permission', 'RolePermission', 'AdminUser', 'AuditLog',
  'Enquiry', 'EnquiryActivity', 'Product', 'ProductFeature', 'ProductImage', 'Service',
  'Industry', 'CaseStudy', 'BlogCategory', 'Blog', 'Testimonial', 'ClientLogo', 'Statistic',
  'Job', 'JobApplication', 'SiteSetting',
];
const SKIPPED = ['Session', 'LoginAttempt'];

const models = Object.fromEntries(Prisma.dmmf.datamodel.models.map((m) => [m.name, m]));
const q = (name) => `"${name.replace(/"/g, '""')}"`;
const pad = (n, w = 2) => String(n).padStart(w, '0');
const ts = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}.${pad(d.getUTCMilliseconds(), 3)}`;

function lit(v, type) {
  if (v === null || v === undefined) return 'NULL';
  if (type === 'Boolean') return v ? 'TRUE' : 'FALSE';
  if (type === 'Int' || type === 'Float' || type === 'Decimal' || type === 'BigInt') return String(v);
  if (type === 'DateTime') return `'${ts(v instanceof Date ? v : new Date(v))}'`;
  return `'${String(v).replace(/'/g, "''")}'`;
}

async function main() {
  if (!/^postgres(ql)?:\/\//.test(process.env.DATABASE_URL || '')) throw new Error('DATABASE_URL must point at the PostgreSQL database to export.');
  const prisma = new PrismaClient();
  const lines = [];
  const push = (s = '') => lines.push(s);
  try {
    push('-- Alight Consultants website database');
    push(`-- Exported ${new Date().toISOString()} by prisma/export-sql.cjs`);
    push('-- Load into an EMPTY PostgreSQL database (14 or newer). Contains admin password hashes: keep private.');
    push(`-- Not included: ${SKIPPED.join(', ')} (temporary login data).`);
    push();
    push('BEGIN;');
    push();

    // 1. Tables, indexes and foreign keys: exactly what the Prisma migrations create.
    const migDir = path.join(__dirname, 'migrations');
    const migrations = fs.readdirSync(migDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
    for (const m of migrations) {
      push(`-- ── Migration ${m} ──────────────────────────────`);
      push(fs.readFileSync(path.join(migDir, m, 'migration.sql'), 'utf8').trim());
      push();
    }

    // 2. Prisma's migration history, so `prisma migrate deploy` later knows these migrations are applied.
    push('-- ── Prisma migration history ──────────────────────────────');
    push(`CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) PRIMARY KEY NOT NULL,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMPTZ,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMPTZ,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);`);
    const history = await prisma.$queryRawUnsafe('SELECT id, checksum, finished_at, migration_name, started_at, applied_steps_count FROM "_prisma_migrations" WHERE rolled_back_at IS NULL AND finished_at IS NOT NULL ORDER BY started_at');
    for (const h of history) {
      push(`INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "started_at", "applied_steps_count") VALUES (${lit(h.id)}, ${lit(h.checksum)}, ${lit(h.finished_at, 'DateTime')}, ${lit(h.migration_name)}, ${lit(h.started_at, 'DateTime')}, ${Number(h.applied_steps_count)});`);
    }
    push();

    // 3. Data.
    const counts = {};
    for (const name of ORDER) {
      const model = models[name];
      const fields = model.fields.filter((f) => f.kind === 'scalar');
      const delegate = name[0].toLowerCase() + name.slice(1);
      const idField = model.fields.find((f) => f.isId);
      const rows = await prisma[delegate].findMany(idField ? { orderBy: { [idField.name]: 'asc' } } : undefined);
      counts[name] = rows.length;
      if (!rows.length) continue;
      push(`-- ── ${name} (${rows.length}) ──────────────────────────────`);
      const cols = fields.map((f) => q(f.name)).join(', ');
      for (const r of rows) push(`INSERT INTO ${q(name)} (${cols}) VALUES (${fields.map((f) => lit(r[f.name], f.type)).join(', ')});`);
      push();
    }

    // 4. Move every SERIAL sequence past the imported ids so new rows don't collide.
    push('-- ── Sequences ──────────────────────────────');
    for (const m of Object.values(models)) {
      const id = m.fields.find((f) => f.isId && f.type === 'Int' && f.hasDefaultValue);
      if (id) push(`SELECT setval(pg_get_serial_sequence('${q(m.name)}', '${id.name}'), COALESCE((SELECT MAX(${q(id.name)}) FROM ${q(m.name)}), 0) + 1, false);`);
    }
    push();
    push('COMMIT;');
    push();

    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, lines.join('\n'), 'utf8');
    console.log(`Wrote ${out}`);
    for (const [t, n] of Object.entries(counts)) console.log(`  ${t.padEnd(16)} ${n}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
