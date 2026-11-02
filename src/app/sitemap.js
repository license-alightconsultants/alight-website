import { site } from '@/data/site';
import { getBlogs, getCaseStudies, getIndustries, getProducts, getServices } from '@/lib/content';

export const revalidate = 3600;

const staticRoutes = [
  '', '/about', '/services', '/products', '/industries', '/technology', '/hire-developers', '/our-work',
  '/case-studies', '/certifications', '/careers', '/blogs', '/contact', '/request-consultation',
  '/privacy-policy', '/terms-and-conditions',
];

export default async function sitemap() {
  const [products, blogs, cases, services, industries] = await Promise.all([getProducts(), getBlogs(), getCaseStudies(), getServices(), getIndustries()]);
  const now = new Date();
  const u = (path, lastModified = now, priority = 0.7) => ({ url: `${site.url}${path}`, lastModified, priority });
  return [
    ...staticRoutes.map((r) => u(r, now, r === '' ? 1 : 0.8)),
    ...services.map((s) => u(`/services/${s.slug}`)),
    ...products.map((p) => u(`/products/${p.slug}`)),
    ...industries.map((i) => u(`/industries/${i.slug}`)),
    ...blogs.map((b) => u(`/blogs/${b.slug}`, b.updatedAt, 0.6)),
    ...cases.map((c) => u(`/case-studies/${c.slug}`, c.updatedAt, 0.6)),
  ];
}
