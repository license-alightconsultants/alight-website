// Idempotent seed: roles, permissions, catalogue and verified statistics.
// Admin users are NOT seeded — create the first Super Admin with the secure setup flow.
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const PERMISSIONS = [
  ['dashboard.read', 'View dashboard'],
  ['enquiries.read', 'View enquiries'],
  ['enquiries.write', 'Update enquiries'],
  ['enquiries.export', 'Export enquiries'],
  ['content.write', 'Manage products, services, blogs, case studies'],
  ['testimonials.write', 'Manage testimonials & client logos'],
  ['careers.write', 'Manage jobs & applications'],
  ['settings.write', 'Manage website settings'],
  ['users.write', 'Manage admin users & roles'],
];

const ROLES = {
  SUPER_ADMIN: { name: 'Super Admin', perms: PERMISSIONS.map(([k]) => k) },
  ADMINISTRATOR: { name: 'Administrator', perms: PERMISSIONS.map(([k]) => k).filter((k) => k !== 'users.write') },
  CONTENT_MANAGER: { name: 'Content Manager', perms: ['dashboard.read', 'content.write', 'testimonials.write', 'careers.write'] },
  ENQUIRY_MANAGER: { name: 'Enquiry Manager', perms: ['dashboard.read', 'enquiries.read', 'enquiries.write', 'enquiries.export'] },
};

async function main() {
  const { products } = await import('../src/data/products.js');
  const { services } = await import('../src/data/services.js');
  const { industries } = await import('../src/data/industries.js');

  for (const [key, label] of PERMISSIONS) {
    await prisma.permission.upsert({ where: { key }, update: { label }, create: { key, label } });
  }
  for (const [key, role] of Object.entries(ROLES)) {
    const r = await prisma.role.upsert({ where: { key }, update: { name: role.name }, create: { key, name: role.name } });
    const perms = await prisma.permission.findMany({ where: { key: { in: role.perms } } });
    await prisma.rolePermission.deleteMany({ where: { roleId: r.id } });
    await prisma.rolePermission.createMany({ data: perms.map((p) => ({ roleId: r.id, permissionId: p.id })) });
  }

  for (const [i, p] of products.entries()) {
    const data = {
      name: p.name, shortName: p.short, category: p.category, summary: p.summary,
      visual: p.visual, isFeatured: p.featured, sortOrder: i,
    };
    const row = await prisma.product.upsert({ where: { slug: p.slug }, update: data, create: { slug: p.slug, ...data } });
    await prisma.productFeature.deleteMany({ where: { productId: row.id } });
    await prisma.productFeature.createMany({ data: p.features.map((title, n) => ({ productId: row.id, title, sortOrder: n })) });
  }

  for (const [i, s] of services.entries()) {
    const data = {
      title: s.title, icon: s.icon, summary: s.summary,
      features: JSON.stringify(s.features), benefits: JSON.stringify(s.benefits), sortOrder: i,
    };
    await prisma.service.upsert({ where: { slug: s.slug }, update: data, create: { slug: s.slug, ...data } });
  }

  for (const [i, ind] of industries.entries()) {
    const data = { name: ind.name, headline: ind.headline, story: ind.story, icon: ind.icon, sortOrder: i };
    await prisma.industry.upsert({ where: { slug: ind.slug }, update: data, create: { slug: ind.slug, ...data } });
  }

  // Figures published on alightconsultants.in — confirm before launch (docs/CONTENT-VERIFICATION.md)
  if ((await prisma.statistic.count()) === 0) {
    await prisma.statistic.createMany({
      data: [
        { label: 'Projects delivered', value: 90, suffix: '+', sortOrder: 0 },
        { label: 'Transactions processed', value: 2, suffix: ' Lac+', sortOrder: 1 },
        { label: 'Monthly transaction value', value: 500, prefix: '₹', suffix: ' Cr+', sortOrder: 2 },
        { label: 'ISO certifications', value: 2, sortOrder: 3 },
      ],
    });
  }

  if ((await prisma.blogCategory.count()) === 0) {
    await prisma.blogCategory.createMany({
      data: [
        { slug: 'insights', name: 'Insights' },
        { slug: 'technology', name: 'Technology' },
        { slug: 'company-news', name: 'Company News' },
      ],
    });
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
