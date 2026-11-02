// Verified from https://alightconsultants.in (audited 2026-10-30). See docs/CONTENT-VERIFICATION.md.
// Values here are defaults; the SiteSetting table overrides them once the admin CMS is in use.
export const site = {
  name: 'Alight Consultants Pvt. Ltd.',
  shortName: 'Alight Consultants',
  motto: 'Believing Innovations',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://alightconsultants.in',
  email: 'info@alightconsultants.in',
  phone: '+91 79 4004 8129',
  phoneHref: 'tel:+917940048129',
  address: {
    line1: '507–510, Ashoka Chambers',
    line2: 'Nr. Lions Hall, Opp. HCG Hospital, Mithakhali',
    city: 'Ahmedabad',
    region: 'Gujarat',
    postalCode: '380009',
    country: 'IN',
  },
  social: {
    linkedin: 'https://in.linkedin.com/company/alight-consultants-pvt-ltd',
  },
  description:
    'Alight Consultants is a process-driven technology company in Ahmedabad delivering enterprise software, financial technology platforms, government solutions, web and mobile applications.',
};

export const certifications = [
  {
    code: 'ISO 9001:2015',
    title: 'Quality Management System',
    body: 'Certified processes for consistent delivery quality, documented workflows and continual improvement across every engagement.',
  },
  {
    code: 'ISO 27001',
    title: 'Information Security Management',
    body: 'A structured information security framework protecting client data, financial records and system access.',
  },
  {
    code: 'GeM',
    title: 'Government e-Marketplace Registered',
    body: 'Listed on India’s Government e-Marketplace, enabling transparent procurement for public-sector organisations.',
  },
];

export const navigation = [
  { label: 'Services', href: '/services', mega: 'services' },
  { label: 'Products', href: '/products', mega: 'products' },
  { label: 'Industries', href: '/industries', mega: 'industries' },
  { label: 'Technology', href: '/technology' },
  { label: 'Hire Developers', href: '/hire-developers' },
  {
    label: 'Company',
    href: '/about',
    children: [
      { label: 'About Alight', href: '/about' },
      { label: 'Certifications', href: '/certifications' },
      { label: 'Our Work', href: '/our-work' },
      { label: 'Case Studies', href: '/case-studies' },
      { label: 'Careers', href: '/careers' },
      { label: 'Insights & Blogs', href: '/blogs' },
    ],
  },
];
