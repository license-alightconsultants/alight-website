// The first five services are verified from the existing website; the remaining capabilities
// come from the project brief and should be confirmed (docs/CONTENT-VERIFICATION.md).
export const services = [
  {
    slug: 'software-development',
    title: 'Enterprise Software Development',
    icon: 'Boxes',
    summary: 'Custom enterprise systems that drive organisation-wide digital transformation and productivity.',
    features: ['Requirement engineering & process mapping', 'Modular, scalable architecture', 'Integration with existing systems', 'Long-term maintenance'],
    benefits: ['Processes that fit how you actually work', 'Reduced manual effort', 'One source of truth'],
  },
  {
    slug: 'financial-technology',
    title: 'Financial Technology',
    icon: 'Landmark',
    summary: 'Fund management, treasury and payment platforms built for accuracy, auditability and scale.',
    features: ['Fund flow & treasury systems', 'Bank integration & reconciliation', 'Audit trails', 'Real-time financial dashboards'],
    benefits: ['Transparent fund movement', 'Audit-ready records', 'Faster reconciliation'],
  },
  {
    slug: 'web-development',
    title: 'Web Application Development',
    icon: 'Globe',
    summary: 'End-to-end web solutions — from corporate websites to complex, data-heavy web applications.',
    features: ['Responsive web applications', 'Portals & dashboards', 'Performance & SEO engineering', 'Secure APIs'],
    benefits: ['Fast, accessible experiences', 'Lower operating cost', 'Built to grow'],
  },
  {
    slug: 'mobile-app-development',
    title: 'Mobile Application Development',
    icon: 'Smartphone',
    summary: 'Cross-platform and native mobile apps for citizens, field teams and customers.',
    features: ['Flutter cross-platform apps', 'Offline-first field apps', 'Push notifications', 'Store publishing'],
    benefits: ['One codebase, two platforms', 'Reach users where they are', 'Field-ready reliability'],
  },
  {
    slug: 'ui-ux-design',
    title: 'UI/UX Engineering',
    icon: 'PenTool',
    summary: 'Interfaces designed around your users — clear, accessible and appealing to the people who use them daily.',
    features: ['User research & journeys', 'Design systems', 'Interactive prototypes', 'Usability testing'],
    benefits: ['Higher adoption', 'Fewer support requests', 'Consistent brand experience'],
  },
  {
    slug: 'digital-transformation',
    title: 'Digital Transformation',
    icon: 'Workflow',
    summary: 'Turning paper-based and fragmented processes into connected digital workflows.',
    features: ['Process digitisation', 'Workflow automation', 'Legacy modernisation', 'Change enablement'],
    benefits: ['Speed & accountability', 'Data-driven decisions', 'Lower process cost'],
  },
  {
    slug: 'ai-and-automation',
    title: 'AI & Automation',
    icon: 'Sparkles',
    summary: 'Practical automation and AI capabilities that remove repetitive work from business processes.',
    features: ['Document & data automation', 'Intelligent reporting', 'Workflow bots', 'Analytics'],
    benefits: ['Fewer manual errors', 'Faster turnaround', 'Insight from existing data'],
  },
  {
    slug: 'cloud-and-infrastructure',
    title: 'Cloud & Infrastructure',
    icon: 'Cloud',
    summary: 'Deployment, hosting and infrastructure planning for secure and reliable applications.',
    features: ['Cloud & on-premise deployment', 'Backup & recovery', 'Monitoring', 'Security hardening'],
    benefits: ['High availability', 'Predictable operations', 'Secure environments'],
  },
  {
    slug: 'branding-print-media-design',
    title: 'Branding & Print Media Design',
    icon: 'Palette',
    summary: 'Brand identity and print collateral that present your organisation with clarity and confidence.',
    features: ['Brand identity', 'Corporate collateral', 'Print media', 'Digital creatives'],
    benefits: ['Consistent identity', 'Professional presence', 'Memorable communication'],
  },
];

export const getService = (slug) => services.find((s) => s.slug === slug);

// Which code-drawn interface preview illustrates each service (see ProductVisual).
export const serviceVisual = {
  'software-development': 'grid', 'financial-technology': 'ledger', 'web-development': 'dashboard', 'mobile-app-development': 'mobile',
  'ui-ux-design': 'grid', 'digital-transformation': 'flow', 'ai-and-automation': 'flow', 'cloud-and-infrastructure': 'dashboard',
  'branding-print-media-design': 'grid',
};
