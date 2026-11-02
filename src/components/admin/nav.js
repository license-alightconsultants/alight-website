// Sidebar definition. `perm` is checked on the server before items are sent to the client.
export const ADMIN_NAV = [
  { section: 'Overview', items: [{ href: '/admin', label: 'Dashboard', icon: 'LayoutDashboard', perm: 'dashboard.read', exact: true }] },
  {
    section: 'Leads',
    items: [
      { href: '/admin/enquiries', label: 'Enquiries', icon: 'Inbox', perm: 'enquiries.read' },
      { href: '/admin/applications', label: 'Job applications', icon: 'FileUser', perm: 'careers.write' },
    ],
  },
  {
    section: 'Content',
    items: [
      { href: '/admin/pages', label: 'Pages & backgrounds', icon: 'PanelsTopLeft', perm: 'content.write' },
      { href: '/admin/content/products', label: 'Products', icon: 'Package', perm: 'content.write' },
      { href: '/admin/content/services', label: 'Services', icon: 'Layers', perm: 'content.write' },
      { href: '/admin/content/industries', label: 'Industries', icon: 'Building2', perm: 'content.write' },
      { href: '/admin/content/case-studies', label: 'Case studies', icon: 'Briefcase', perm: 'content.write' },
      { href: '/admin/content/blogs', label: 'Blogs', icon: 'Newspaper', perm: 'content.write' },
      { href: '/admin/content/blog-categories', label: 'Blog categories', icon: 'Tags', perm: 'content.write' },
      { href: '/admin/content/statistics', label: 'Statistics', icon: 'BarChart3', perm: 'content.write' },
      { href: '/admin/content/testimonials', label: 'Testimonials', icon: 'Quote', perm: 'testimonials.write' },
      { href: '/admin/content/client-logos', label: 'Client logos', icon: 'Award', perm: 'testimonials.write' },
      { href: '/admin/content/jobs', label: 'Job openings', icon: 'UserPlus', perm: 'careers.write' },
    ],
  },
  {
    section: 'System',
    items: [
      { href: '/admin/settings', label: 'Website settings', icon: 'Settings', perm: 'settings.write' },
      { href: '/admin/users', label: 'Users & roles', icon: 'Users', perm: 'users.write' },
      { href: '/admin/audit', label: 'Audit log', icon: 'ScrollText', perm: 'users.write' },
    ],
  },
];
