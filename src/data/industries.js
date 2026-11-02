export const industries = [
  {
    slug: 'government',
    name: 'Government',
    icon: 'Building2',
    headline: 'Transparent public finance and e-governance.',
    story: 'Fund management, treasury, file tracking and citizen applications help departments manage public money and services with accountability.',
    products: ['funds-management-system-sna-model-1-and-model-2', 'integrated-fund-management-system-ifms', 'treasury-management-system-tms', 'file-tracking-management'],
  },
  {
    slug: 'banking',
    name: 'Banking',
    icon: 'Landmark',
    headline: 'Financial systems that integrate with banks.',
    story: 'Fund flow platforms designed around bank integration, reconciliation and secure, auditable transactions.',
    products: ['funds-management-system-sna-model-1-and-model-2', 'sna-model-3-dashboard-amrut-3'],
  },
  {
    slug: 'education',
    name: 'Education',
    icon: 'GraduationCap',
    headline: 'Institutions run better on connected data.',
    story: 'Admissions, fees, academics and payroll unified so administrators can focus on learning outcomes.',
    products: ['education-institution-management-erp', 'attendance-payroll-management-system'],
  },
  {
    slug: 'dairy-and-cooperatives',
    name: 'Dairy & Cooperatives',
    icon: 'Milk',
    headline: 'From village collection to the federation.',
    story: 'Supply chain ERP covering collection, quality, member payments, processing and distribution for cooperatives.',
    products: ['milk-federation-dairy-scm-erp', 'supply-chain-management'],
  },
  {
    slug: 'enterprise',
    name: 'Enterprise',
    icon: 'Briefcase',
    headline: 'Operational software built around your process.',
    story: 'Asset, inventory, HR and supply chain systems tailored to how your organisation actually operates.',
    products: ['asset-inventory-management-system-aims', 'attendance-payroll-management-system', 'supply-chain-management'],
  },
  {
    slug: 'retail',
    name: 'Retail',
    icon: 'ShoppingBag',
    headline: 'Faster counters, clearer stock.',
    story: 'Billing, POS and queue management that speed up service and keep inventory accurate.',
    products: ['billing-sell-counter-management-system-pos', 'e-token'],
  },
  {
    slug: 'tourism',
    name: 'Tourism',
    icon: 'Map',
    headline: 'Destinations, bookings and visitors — connected.',
    story: 'An integrated tourism platform for discovery, booking and visitor management.',
    products: ['tourism-platform'],
  },
];

export const getIndustry = (slug) => industries.find((i) => i.slug === slug);

export const technologies = [
  { name: '.NET', group: 'Backend' },
  { name: 'ASP.NET Core', group: 'Backend' },
  { name: 'C#', group: 'Backend' },
  { name: 'Node.js', group: 'Backend' },
  { name: 'React', group: 'Frontend' },
  { name: 'Next.js', group: 'Frontend' },
  { name: 'AngularJS', group: 'Frontend' },
  { name: 'Flutter', group: 'Mobile' },
  { name: 'SQL Server', group: 'Data' },
  { name: 'SQLite', group: 'Data' },
  { name: 'Cloud', group: 'Platform' },
  { name: 'AI', group: 'Intelligence' },
  { name: 'Automation', group: 'Intelligence' },
];

export const hireRoles = [
  { title: 'ASP.NET Developers', stack: ['ASP.NET Core', 'C#', 'SQL Server'] },
  { title: 'Flutter Developers', stack: ['Flutter', 'Dart', 'Firebase'] },
  { title: 'ReactJS Developers', stack: ['React', 'Next.js', 'Node.js'] },
  { title: 'AngularJS Developers', stack: ['AngularJS', 'REST APIs'] },
  { title: 'UI/UX Designers', stack: ['Research', 'Design Systems', 'Prototyping'] },
];
