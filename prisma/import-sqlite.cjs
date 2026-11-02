// One-time import of the old SQLite database into PostgreSQL.
//   1. Point DATABASE_URL at the (empty) PostgreSQL database.
//   2. npx prisma migrate deploy        (creates the tables)
//   3. node prisma/import-sqlite.cjs [path/to/alight.db]   (default: prisma/sqlite-archive/alight-pre-postgres.db)
// Refuses to run if the target already contains admin users or settings, so it cannot double-import.
// Needs Node 22.13+ (built-in node:sqlite).
'use strict';
process.removeAllListeners('warning'); // silence node:sqlite ExperimentalWarning
const path = require('node:path');
const fs = require('node:fs');
const { DatabaseSync } = require('node:sqlite');
const { PrismaClient, Prisma } = require('@prisma/client');

const src = path.resolve(process.argv[2] || path.join(__dirname, 'sqlite-archive', 'alight-pre-postgres.db'));
if (!fs.existsSync(src)) {
  console.error(`SQLite file not found: ${src}`);
  process.exit(2);
}

// Parents before children so foreign keys are satisfied.
const ORDER = [
  'Role', 'Permission', 'RolePermission', 'AdminUser', 'Session', 'LoginAttempt', 'AuditLog',
  'Enquiry', 'EnquiryActivity', 'Product', 'ProductFeature', 'ProductImage', 'Service',
  'Industry', 'CaseStudy', 'BlogCategory', 'Blog', 'Testimonial', 'ClientLogo', 'Statistic',
  'Job', 'JobApplication', 'SiteSetting',
];

const models = Object.fromEntries(Prisma.dmmf.datamodel.models.map((m) => [m.name, m]));
const delegate = (name) => name[0].toLowerCase() + name.slice(1);

function convert(model, row) {
  const out = {};
  for (const f of model.fields) {
    if (f.kind !== 'scalar' || !(f.name in row)) continue;
    let v = row[f.name];
    if (v !== null && v !== undefined) {
      if (f.type === 'DateTime') v = new Date(typeof v === 'string' && /^\d+$/.test(v) ? Number(v) : v);
      else if (f.type === 'Boolean') v = Boolean(v);
      else if (f.type === 'Int') v = Number(v);
    }
    out[f.name] = v;
  }
  return out;
}

async function main() {
  const sqlite = new DatabaseSync(src, { readOnly: true });
  const prisma = new PrismaClient();
  try {
    const existing = (await prisma.adminUser.count()) + (await prisma.siteSetting.count());
    if (existing) throw new Error('Target PostgreSQL database already has data - aborting (import into an empty database).');

    await prisma.$transaction(async (tx) => {
      for (const name of ORDER) {
        const model = models[name];
        const rows = sqlite.prepare(`SELECT * FROM "${name}"`).all().map((r) => convert(model, r));
        if (rows.length) await tx[delegate(name)].createMany({ data: rows });
        // Move the SERIAL sequence past the imported ids so new rows don't collide.
        const idField = model.fields.find((f) => f.isId && f.type === 'Int' && f.hasDefaultValue);
        if (idField) {
          await tx.$executeRawUnsafe(
            `SELECT setval(pg_get_serial_sequence('"${name}"', '${idField.name}'), COALESCE((SELECT MAX("${idField.name}") FROM "${name}"), 0) + 1, false)`
          );
        }
        console.log(`${name.padEnd(16)} ${rows.length}`);
      }
    }, { timeout: 120000 });
    console.log('Import complete.');
  } finally {
    sqlite.close();
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
