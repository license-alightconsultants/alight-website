import { Suspense } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import Topbar from '@/components/admin/Topbar';
import { Flash } from '@/components/admin/FormBits';
import { ADMIN_NAV } from '@/components/admin/nav';
import { prisma } from '@/lib/db';
import { can, requirePage } from '@/lib/auth';

export const metadata = { title: { default: 'Admin', template: '%s · Alight Admin' }, robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const CREATE = [
  { href: '/admin/content/products/new', label: 'Product', perm: 'content.write' },
  { href: '/admin/content/blogs/new', label: 'Blog post', perm: 'content.write' },
  { href: '/admin/content/services/new', label: 'Service', perm: 'content.write' },
  { href: '/admin/content/case-studies/new', label: 'Case study', perm: 'content.write' },
  { href: '/admin/content/testimonials/new', label: 'Testimonial', perm: 'testimonials.write' },
  { href: '/admin/content/jobs/new', label: 'Job opening', perm: 'careers.write' },
  { href: '/admin/users/new', label: 'Admin user', perm: 'users.write' },
];

export default async function PanelLayout({ children }) {
  const user = await requirePage();
  const canEnquiries = can(user, 'enquiries.read');
  const [newEnquiries, newApplications] = await Promise.all([
    canEnquiries ? prisma.enquiry.count({ where: { status: 'NEW' } }) : 0,
    can(user, 'careers.write') ? prisma.jobApplication.count({ where: { status: 'NEW' } }) : 0,
  ]);
  // Only items the user is permitted to use are sent to the browser.
  const nav = ADMIN_NAV.map((g) => ({ ...g, items: g.items.filter((i) => can(user, i.perm)) })).filter((g) => g.items.length);
  const createLinks = CREATE.filter((c) => can(user, c.perm)).map(({ href, label }) => ({ href, label }));
  const who = { name: user.name, roleName: user.role.name };

  return (
    <div className="min-h-screen bg-[#F5F7FB] bg-[radial-gradient(ellipse_at_top_right,rgba(171,210,255,0.35),transparent_45%)] bg-fixed font-sans">
      <Sidebar nav={nav} user={who} badges={{ '/admin/enquiries': newEnquiries, '/admin/applications': newApplications }} />
      <div className="lg:pl-[264px]">
        <Topbar user={who} newEnquiries={newEnquiries} canEnquiries={canEnquiries} createLinks={createLinks} />
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </div>
      <Suspense><Flash /></Suspense>
    </div>
  );
}
