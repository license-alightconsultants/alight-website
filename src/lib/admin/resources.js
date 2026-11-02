import { productCategories } from '@/data/products';

// Declarative CMS definitions. Plain data only (no functions), so the same config can be
// passed to client form components and used by the generic server actions.
//
// Field types: text, textarea, longtext, number, checkbox, select, relation, slug, image,
//              url, datetime, lines (string[]), gallery (ProductImage[]).
// `store` for lines: 'json' (JSON column) or 'productFeatures' (ProductFeature relation).

const seo = [
  { name: 'seoTitle', label: 'SEO title', type: 'text', max: 70, group: 'SEO' },
  { name: 'seoDescription', label: 'SEO description', type: 'textarea', max: 170, group: 'SEO' },
];

const iconOptions = ['Boxes', 'Briefcase', 'Building2', 'Cloud', 'Globe', 'GraduationCap', 'Landmark', 'Map', 'Milk', 'Palette', 'PenTool', 'ShoppingBag', 'Smartphone', 'Sparkles', 'Workflow'];

export const RESOURCES = {
  products: {
    model: 'product',
    label: 'Products',
    singular: 'Product',
    permission: 'content.write',
    orderable: true,
    titleField: 'name',
    publicPath: (r) => `/products/${r.slug}`,
    columns: [
      { name: 'name', label: 'Name' },
      { name: 'category', label: 'Category', options: productCategories.map((c) => [c.id, c.label]) },
      { name: 'isFeatured', label: 'Featured', toggle: true },
      { name: 'isPublished', label: 'Published', toggle: true },
    ],
    search: ['name', 'shortName', 'summary'],
    fields: [
      { name: 'name', label: 'Product name', type: 'text', required: true, max: 150 },
      { name: 'slug', label: 'URL slug', type: 'slug', from: 'name', required: true },
      { name: 'shortName', label: 'Short name / code', type: 'text', max: 40 },
      { name: 'category', label: 'Category', type: 'select', required: true, options: productCategories.map((c) => [c.id, c.label]) },
      { name: 'summary', label: 'Summary', type: 'textarea', required: true, max: 400 },
      { name: 'description', label: 'Full description', type: 'longtext', max: 8000 },
      { name: 'features', label: 'Features (one per line)', type: 'lines', store: 'productFeatures' },
      { name: 'visual', label: 'Preview style (when no screenshot)', type: 'select', options: [['dashboard', 'Dashboard'], ['ledger', 'Ledger'], ['flow', 'Flow'], ['grid', 'Grid'], ['mobile', 'Mobile']] },
      { name: 'images', label: 'Cover & screenshots', type: 'gallery', folder: 'products' },
      { name: 'isFeatured', label: 'Featured on homepage', type: 'checkbox' },
      { name: 'isPublished', label: 'Published', type: 'checkbox', default: true },
      ...seo,
    ],
  },

  services: {
    model: 'service',
    label: 'Services',
    singular: 'Service',
    permission: 'content.write',
    orderable: true,
    titleField: 'title',
    publicPath: (r) => `/services/${r.slug}`,
    columns: [{ name: 'title', label: 'Title' }, { name: 'isPublished', label: 'Published', toggle: true }],
    search: ['title', 'summary'],
    fields: [
      { name: 'title', label: 'Service title', type: 'text', required: true, max: 120 },
      { name: 'slug', label: 'URL slug', type: 'slug', from: 'title', required: true },
      { name: 'icon', label: 'Icon', type: 'select', options: iconOptions.map((i) => [i, i]) },
      { name: 'summary', label: 'Summary', type: 'textarea', required: true, max: 400 },
      { name: 'description', label: 'Description', type: 'longtext', max: 8000 },
      { name: 'features', label: 'Features (one per line)', type: 'lines', store: 'json' },
      { name: 'benefits', label: 'Benefits (one per line)', type: 'lines', store: 'json' },
      { name: 'imageUrl', label: 'Image', type: 'image', folder: 'services' },
      { name: 'isPublished', label: 'Published', type: 'checkbox', default: true },
      ...seo,
    ],
  },

  industries: {
    model: 'industry',
    label: 'Industries',
    singular: 'Industry',
    permission: 'content.write',
    orderable: true,
    titleField: 'name',
    publicPath: (r) => `/industries/${r.slug}`,
    columns: [{ name: 'name', label: 'Name' }, { name: 'isPublished', label: 'Published', toggle: true }],
    search: ['name', 'headline'],
    fields: [
      { name: 'name', label: 'Industry', type: 'text', required: true, max: 80 },
      { name: 'slug', label: 'URL slug', type: 'slug', from: 'name', required: true },
      { name: 'icon', label: 'Icon', type: 'select', options: iconOptions.map((i) => [i, i]) },
      { name: 'headline', label: 'Headline', type: 'text', max: 160 },
      { name: 'story', label: 'Story', type: 'textarea', max: 1000 },
      { name: 'isPublished', label: 'Published', type: 'checkbox', default: true },
    ],
  },

  'case-studies': {
    model: 'caseStudy',
    label: 'Case studies',
    singular: 'Case study',
    permission: 'content.write',
    orderable: true,
    titleField: 'title',
    publicPath: (r) => `/case-studies/${r.slug}`,
    columns: [{ name: 'title', label: 'Title' }, { name: 'industry.name', label: 'Industry' }, { name: 'isPublished', label: 'Published', toggle: true }],
    include: { industry: true },
    search: ['title', 'summary'],
    fields: [
      { name: 'title', label: 'Project title', type: 'text', required: true, max: 160 },
      { name: 'slug', label: 'URL slug', type: 'slug', from: 'title', required: true },
      { name: 'industryId', label: 'Industry', type: 'relation', relation: { model: 'industry', label: 'name' } },
      { name: 'summary', label: 'Summary', type: 'textarea', required: true, max: 500 },
      { name: 'challenge', label: 'Challenge', type: 'longtext', max: 6000 },
      { name: 'solution', label: 'Solution', type: 'longtext', max: 6000 },
      { name: 'results', label: 'Results', type: 'longtext', max: 6000, hint: 'Use verified, client-approved results only.' },
      { name: 'technology', label: 'Technology (comma separated)', type: 'text', max: 300 },
      { name: 'coverUrl', label: 'Cover image', type: 'image', folder: 'projects' },
      { name: 'isPublished', label: 'Published', type: 'checkbox' },
    ],
  },

  blogs: {
    model: 'blog',
    label: 'Blogs',
    singular: 'Blog post',
    permission: 'content.write',
    titleField: 'title',
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    publicPath: (r) => (r.status === 'DRAFT' ? null : `/blogs/${r.slug}`),
    columns: [
      { name: 'title', label: 'Title' },
      { name: 'category.name', label: 'Category' },
      { name: 'status', label: 'Status', badge: true },
      { name: 'publishedAt', label: 'Publish date', date: true },
    ],
    include: { category: true },
    search: ['title', 'excerpt'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, max: 180 },
      { name: 'slug', label: 'URL slug', type: 'slug', from: 'title', required: true },
      { name: 'categoryId', label: 'Category', type: 'relation', relation: { model: 'blogCategory', label: 'name' } },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea', max: 400 },
      { name: 'content', label: 'Content', type: 'longtext', required: true, max: 60000, hint: 'Separate paragraphs with a blank line.' },
      { name: 'coverUrl', label: 'Featured image', type: 'image', folder: 'blogs' },
      { name: 'status', label: 'Status', type: 'select', required: true, options: [['DRAFT', 'Draft'], ['PUBLISHED', 'Published'], ['SCHEDULED', 'Scheduled']], default: 'DRAFT' },
      { name: 'publishedAt', label: 'Publish date & time', type: 'datetime', hint: 'Required for scheduled posts. Defaults to now when publishing.' },
      ...seo,
    ],
  },

  'blog-categories': {
    model: 'blogCategory',
    label: 'Blog categories',
    singular: 'Category',
    permission: 'content.write',
    titleField: 'name',
    orderBy: [{ name: 'asc' }],
    columns: [{ name: 'name', label: 'Name' }, { name: 'slug', label: 'Slug' }],
    search: ['name'],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, max: 60 },
      { name: 'slug', label: 'Slug', type: 'slug', from: 'name', required: true },
    ],
  },

  testimonials: {
    model: 'testimonial',
    label: 'Testimonials',
    singular: 'Testimonial',
    permission: 'testimonials.write',
    orderable: true,
    titleField: 'name',
    columns: [{ name: 'name', label: 'Name' }, { name: 'organization', label: 'Organisation' }, { name: 'isApproved', label: 'Approved', toggle: true }],
    search: ['name', 'organization', 'content'],
    fields: [
      { name: 'name', label: 'Customer name', type: 'text', required: true, max: 100 },
      { name: 'designation', label: 'Designation', type: 'text', max: 100 },
      { name: 'organization', label: 'Organisation', type: 'text', max: 150 },
      { name: 'content', label: 'Testimonial', type: 'textarea', required: true, max: 1200 },
      { name: 'imageUrl', label: 'Photo', type: 'image', folder: 'team' },
      { name: 'isApproved', label: 'Approved for display', type: 'checkbox', hint: 'Only approve testimonials with written consent.' },
    ],
  },

  'client-logos': {
    model: 'clientLogo',
    label: 'Client logos',
    singular: 'Client logo',
    permission: 'testimonials.write',
    orderable: true,
    titleField: 'name',
    columns: [{ name: 'logoUrl', label: 'Logo', image: true }, { name: 'name', label: 'Organisation' }, { name: 'isVisible', label: 'Visible', toggle: true }],
    search: ['name'],
    fields: [
      { name: 'name', label: 'Organisation name', type: 'text', required: true, max: 120 },
      { name: 'logoUrl', label: 'Logo', type: 'image', folder: 'clients', required: true },
      { name: 'website', label: 'Website', type: 'url' },
      { name: 'isVisible', label: 'Visible on website', type: 'checkbox', hint: 'Only enable after permission to display the logo is confirmed.' },
    ],
  },

  statistics: {
    model: 'statistic',
    label: 'Statistics',
    singular: 'Statistic',
    permission: 'content.write',
    orderable: true,
    titleField: 'label',
    columns: [{ name: 'label', label: 'Label' }, { name: 'value', label: 'Value' }, { name: 'isVisible', label: 'Visible', toggle: true }],
    search: ['label'],
    fields: [
      { name: 'label', label: 'Label', type: 'text', required: true, max: 60 },
      { name: 'value', label: 'Value', type: 'number', required: true },
      { name: 'prefix', label: 'Prefix', type: 'text', max: 5, hint: 'e.g. ₹' },
      { name: 'suffix', label: 'Suffix', type: 'text', max: 10, hint: 'e.g. +, Cr+, Lac+' },
      { name: 'isVisible', label: 'Visible on website', type: 'checkbox', default: true, hint: 'Display verified figures only.' },
    ],
  },

  jobs: {
    model: 'job',
    label: 'Job openings',
    singular: 'Job',
    permission: 'careers.write',
    titleField: 'title',
    orderBy: [{ createdAt: 'desc' }],
    columns: [{ name: 'title', label: 'Title' }, { name: 'department', label: 'Department' }, { name: 'location', label: 'Location' }, { name: '_count.applications', label: 'Applications' }, { name: 'isActive', label: 'Active', toggle: true }],
    include: { _count: { select: { applications: true } } },
    search: ['title', 'department', 'location'],
    fields: [
      { name: 'title', label: 'Job title', type: 'text', required: true, max: 120 },
      { name: 'slug', label: 'Slug', type: 'slug', from: 'title', required: true },
      { name: 'department', label: 'Department', type: 'text', required: true, max: 80 },
      { name: 'location', label: 'Location', type: 'text', required: true, max: 80, default: 'Ahmedabad' },
      { name: 'employmentType', label: 'Employment type', type: 'select', required: true, options: [['Full-time', 'Full-time'], ['Part-time', 'Part-time'], ['Contract', 'Contract'], ['Internship', 'Internship']], default: 'Full-time' },
      { name: 'description', label: 'Description', type: 'longtext', required: true, max: 8000 },
      { name: 'requirements', label: 'Requirements', type: 'longtext', required: true, max: 8000 },
      { name: 'isActive', label: 'Active (visible on careers page)', type: 'checkbox', default: true },
    ],
  },
};

export const getResource = (key) => RESOURCES[key] || null;

/** Strip non-serialisable parts before sending a resource config to a client component. */
export function clientConfig(res) {
  const { publicPath, include, orderBy, ...rest } = res;
  return rest;
}
