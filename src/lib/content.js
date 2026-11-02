import { prisma } from '@/lib/db';
import { products as staticProducts } from '@/data/products';
import { services as staticServices } from '@/data/services';
import { industries as staticIndustries } from '@/data/industries';

// Public-site data access. Each query degrades gracefully so a database issue never blanks the site.
async function safe(fn, fallback) {
  try {
    return await fn();
  } catch (err) {
    console.error('[content]', err.message);
    return fallback;
  }
}

export const getStats = () =>
  safe(() => prisma.statistic.findMany({ where: { isVisible: true }, orderBy: { sortOrder: 'asc' } }), []);

export const getClientLogos = () =>
  safe(() => prisma.clientLogo.findMany({ where: { isVisible: true }, orderBy: { sortOrder: 'asc' } }), []);

export const getApprovedTestimonials = () =>
  safe(() => prisma.testimonial.findMany({ where: { isApproved: true }, orderBy: { sortOrder: 'asc' } }), []);

export const getCaseStudies = (take) =>
  safe(() => prisma.caseStudy.findMany({ where: { isPublished: true }, include: { industry: true }, orderBy: { sortOrder: 'asc' }, take }), []);

export const getCaseStudy = (slug) =>
  safe(() => prisma.caseStudy.findFirst({ where: { slug, isPublished: true }, include: { industry: true } }), null);

const blogWhere = () => ({ status: { in: ['PUBLISHED', 'SCHEDULED'] }, publishedAt: { lte: new Date() } });

export const getBlogs = (take) =>
  safe(() => prisma.blog.findMany({ where: blogWhere(), include: { category: true }, orderBy: { publishedAt: 'desc' }, take }), []);

export const getBlog = (slug) =>
  safe(() => prisma.blog.findFirst({ where: { slug, ...blogWhere() }, include: { category: true } }), null);

export const getActiveJobs = () =>
  safe(() => prisma.job.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } }), []);

/** Published products from the DB, shaped like the static catalogue; falls back to static data. */
export async function getProducts() {
  const rows = await safe(
    () => prisma.product.findMany({ where: { isPublished: true }, include: { features: { orderBy: { sortOrder: 'asc' } }, images: { orderBy: { sortOrder: 'asc' } } }, orderBy: { sortOrder: 'asc' } }),
    null,
  );
  if (!rows?.length) return staticProducts;
  return rows.map((p) => ({
    slug: p.slug,
    name: p.name,
    short: p.shortName,
    category: p.category,
    summary: p.summary,
    description: p.description,
    visual: p.visual,
    featured: p.isFeatured,
    features: p.features.map((f) => f.title),
    images: p.images.map((i) => ({ url: i.url, alt: i.alt })),
    cover: p.images[0]?.url || null,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
  }));
}

const parseList = (v) => {
  try { return JSON.parse(v || '[]'); } catch { return []; }
};

/** Published services from the DB; falls back to the verified static list. */
export async function getServices() {
  const rows = await safe(() => prisma.service.findMany({ where: { isPublished: true }, orderBy: { sortOrder: 'asc' } }), null);
  if (!rows?.length) return staticServices;
  return rows.map((s) => ({
    slug: s.slug, title: s.title, icon: s.icon, summary: s.summary, description: s.description,
    features: parseList(s.features), benefits: parseList(s.benefits), imageUrl: s.imageUrl,
    seoTitle: s.seoTitle, seoDescription: s.seoDescription,
  }));
}

/** Published industries from the DB. The industry → product mapping comes from src/data/industries.js. */
export async function getIndustries() {
  const rows = await safe(() => prisma.industry.findMany({ where: { isPublished: true }, orderBy: { sortOrder: 'asc' } }), null);
  if (!rows?.length) return staticIndustries;
  return rows.map((i) => ({
    slug: i.slug, name: i.name, icon: i.icon, headline: i.headline || '', story: i.story || '',
    products: staticIndustries.find((s) => s.slug === i.slug)?.products || [],
  }));
}

/** Lightweight catalogue for navigation menus and footer. */
export async function getNavData() {
  const [products, services, industries] = await Promise.all([getProducts(), getServices(), getIndustries()]);
  return {
    products: products.map(({ slug, name, short, category, summary, featured }) => ({ slug, name, short, category, summary, featured })),
    services: services.map(({ slug, title, icon, summary }) => ({ slug, title, icon, summary })),
    industries: industries.map(({ slug, name, icon, headline }) => ({ slug, name, icon, headline })),
  };
}
