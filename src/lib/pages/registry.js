// Every public page's editable content (Admin → Pages). The `default` of each field is the website's
// built-in copy, so a page looks exactly as designed until an editor changes it.
//
// Field types: text, textarea, items ("Title | Description" per line), lines (one item per line),
// toggle, image, background (tone: light | dark), select.
// Text may use *asterisks* to highlight words, and {company} {email} {phone} {address}
// {careersEmail} {quoteEmail} which are replaced with the values from Website settings.

const rows = (list) => list.map((r) => (Array.isArray(r) ? r.join(' | ') : r)).join('\n');
const bg = (name, label, tone) => ({ name, label, type: 'background', tone, default: { preset: 'default' } });
const show = (name, label = 'Show this section') => ({ name, label, type: 'toggle', default: true });

function hero({ eyebrow, title, lead }) {
  return {
    title: 'Top banner',
    fields: [
      { name: 'hero.eyebrow', label: 'Small label above the title', type: 'text', default: eyebrow },
      { name: 'hero.title', label: 'Title', type: 'text', default: title, hint: 'Wrap words in *asterisks* to highlight them.' },
      { name: 'hero.lead', label: 'Intro text', type: 'textarea', default: lead },
      bg('hero.bg', 'Banner background', 'dark'),
      { name: 'hero.image', label: 'Right-side image', type: 'image', default: '', hint: 'Optional. Replaces the animated graphic.' },
      { name: 'hero.graphic', label: 'Show the animated graphic (when no image is set)', type: 'toggle', default: true },
    ],
  };
}

function seo(title, description) {
  return {
    title: 'Search engines (SEO)',
    fields: [
      { name: 'seo.title', label: 'Page title (browser tab & Google)', type: 'text', default: title },
      { name: 'seo.description', label: 'Meta description', type: 'textarea', default: description, hint: 'About 150–160 characters.' },
    ],
  };
}

function cta(title = 'Let’s Turn Your Vision Into Reality.', lead = 'Tell us about your challenge. Our consultants will respond with a clear plan, timeline and team.') {
  return {
    title: 'Closing call-to-action',
    fields: [
      show('cta.show'),
      { name: 'cta.title', label: 'Title', type: 'text', default: title },
      { name: 'cta.lead', label: 'Text', type: 'textarea', default: lead },
      { name: 'cta.primary', label: 'Main button label', type: 'text', default: 'Start a Project' },
      { name: 'cta.secondary', label: 'Second button label', type: 'text', default: 'Talk to Our Team' },
      bg('cta.bg', 'Panel background', 'dark'),
    ],
  };
}

const heading = (prefix, title, { eyebrow = '', head = '', lead = '', tone = 'light', withShow = true, withLead = true } = {}) => ({
  title,
  fields: [
    ...(withShow ? [show(`${prefix}.show`)] : []),
    { name: `${prefix}.eyebrow`, label: 'Small label', type: 'text', default: eyebrow },
    { name: `${prefix}.title`, label: 'Heading', type: 'text', default: head },
    ...(withLead ? [{ name: `${prefix}.lead`, label: 'Intro text', type: 'textarea', default: lead }] : []),
    bg(`${prefix}.bg`, 'Section background', tone),
  ],
});

export const PAGES = [
  {
    key: 'home', label: 'Home', path: '/',
    groups: [
      {
        title: 'Hero (first screen)',
        fields: [
          { name: 'hero.badge', label: 'Badge pill', type: 'text', default: 'Certified' },
          { name: 'hero.badgeText', label: 'Badge text', type: 'text', default: 'ISO 9001:2015 · ISO 27001 · GeM Registered' },
          { name: 'hero.lines', label: 'Headline (one line per row — the last row gets the gradient)', type: 'lines', default: rows(['Engineering', 'Tomorrow’s Digital', 'Enterprises.']) },
          { name: 'hero.lead', label: 'Intro text', type: 'textarea', default: 'Transforming complex business challenges into intelligent, scalable and innovative technology solutions.' },
          { name: 'hero.primary', label: 'Main button label', type: 'text', default: 'Explore Our Solutions' },
          { name: 'hero.primaryHref', label: 'Main button link', type: 'text', default: '/products' },
          { name: 'hero.secondary', label: 'Second button label', type: 'text', default: 'Talk to Our Experts' },
          { name: 'hero.secondaryHref', label: 'Second button link', type: 'text', default: '/contact' },
          { name: 'hero.counters', label: 'Show product / service / industry counters', type: 'toggle', default: true },
          { name: 'hero.terrain', label: 'Show the animated wave terrain', type: 'toggle', default: true },
          bg('hero.bg', 'Hero background', 'dark'),
        ],
      },
      { title: 'Sector marquee', fields: [show('trust.show')] },
      {
        title: 'Who we are',
        fields: [
          show('intro.show'),
          { name: 'intro.eyebrow', label: 'Small label', type: 'text', default: 'Who we are' },
          { name: 'intro.title', label: 'Heading', type: 'text', default: 'Where Technology Meets *Business* Transformation.' },
          { name: 'intro.lead', label: 'First paragraph (large)', type: 'textarea', default: 'Alight Consultants is a process-driven organisation focused on innovation and digital transformation.' },
          { name: 'intro.body', label: 'Further paragraphs (blank line between paragraphs)', type: 'textarea', default: 'From our base in Ahmedabad, we design and build next-generation technology — enterprise software, financial platforms, e-governance systems and digital products — that turn abstract ideas into products people rely on every day.\n\nOur philosophy is simple: iterate continuously, refine collaboratively and deliver with discipline.' },
          { name: 'intro.principles', label: 'Principles', type: 'items', default: rows([['Process-driven', 'Every engagement follows documented, ISO-certified quality processes.'], ['Specialised', 'Deep focus on financial technology, government systems and enterprise ERP.'], ['Committed to timelines', 'Discipline and accountability from requirement to rollout.']]) },
          bg('intro.bg', 'Section background', 'light'),
        ],
      },
      {
        title: 'Promise statement',
        fields: [
          show('statement.show'),
          { name: 'statement.eyebrow', label: 'Small label', type: 'text', default: 'Our promise' },
          { name: 'statement.text', label: 'Statement (*asterisks* = red words)', type: 'textarea', default: 'We engineer *secure,* *scalable* software for governments, banks and enterprises — process-driven, *ISO-certified* and committed to every timeline we set.' },
          bg('statement.bg', 'Section background', 'light'),
        ],
      },
      heading('capabilities', 'Core capabilities', { eyebrow: 'Core capabilities', head: 'Every discipline. One accountable partner.' }),
      heading('products', 'Featured products', { eyebrow: 'Featured products', head: 'Platforms already running critical operations.', lead: 'Ready-to-deploy products for public finance, cooperatives, institutions and commerce — configurable to your workflows.', tone: 'dark' }),
      heading('industries', 'Industries', { eyebrow: 'Industries', head: 'Built for the sectors that can’t afford downtime.' }),
      heading('why', 'Why Alight', { eyebrow: 'Why Alight', head: 'A partner engineered for the long term.', withLead: false }),
      {
        title: 'How we deliver (scrolling steps)',
        fields: [
          show('process.show'),
          { name: 'process.eyebrow', label: 'Small label', type: 'text', default: 'How we deliver' },
          { name: 'process.title', label: 'Heading', type: 'text', default: 'A documented path from idea to *go-live.*' },
          { name: 'process.lead', label: 'Intro text', type: 'textarea', default: 'Five stages, the same discipline every time — so you always know what happens next.' },
          { name: 'process.steps', label: 'Steps', type: 'items', hint: 'One per line: Title | Tag | Description', default: rows([
            ['Discover', 'Requirement engineering', 'Workshops with your stakeholders to map the process, rules and integrations before a line of code is written.'],
            ['Design', 'Architecture & UX', 'Architecture, data model and screen flows reviewed and signed off — so scope, cost and timeline are clear upfront.'],
            ['Build', 'Agile delivery', 'Iterative sprints with working software at every review, backed by code reviews and documented QA.'],
            ['Deploy', 'Go-live', 'Secure rollout on your cloud or on-premise servers, data migration and hands-on user training.'],
            ['Support', 'Continual improvement', 'Long-term maintenance, enhancements and responsive support as your organisation grows.'],
          ]) },
          bg('process.bg', 'Section background', 'dark'),
        ],
      },
      heading('tech', 'Technology ecosystem', { eyebrow: 'Technology ecosystem', head: 'Proven stacks. Modern engineering.', lead: 'We choose technology for longevity, security and the skills of the teams who will maintain it.', tone: 'dark' }),
      heading('cases', 'Case studies', { eyebrow: 'Case studies', head: 'Outcomes, not just deliverables.', withLead: false }),
      { title: 'Impact numbers', fields: [show('stats.show'), { name: 'stats.label', label: 'Small label', type: 'text', default: 'Impact, measured' }, bg('stats.bg', 'Section background', 'dark')] },
      { title: 'Testimonials', fields: [show('testimonials.show'), bg('testimonials.bg', 'Section background', 'light')] },
      cta(),
      {
        title: 'Search engines (SEO)',
        fields: [
          { name: 'seo.title', label: 'Page title', type: 'text', default: '', hint: 'Blank = Website settings → SEO defaults.' },
          { name: 'seo.description', label: 'Meta description', type: 'textarea', default: '', hint: 'Blank = Website settings → SEO defaults.' },
        ],
      },
    ],
  },
  {
    key: 'about', label: 'About', path: '/about',
    groups: [
      hero({ eyebrow: 'About Alight', title: 'Believing Innovations — since inception.', lead: 'A process-driven organisation focused on innovation and digital transformation, helping organisations across industry segments scale digitally.' }),
      {
        title: 'Our story',
        fields: [
          { name: 'story.eyebrow', label: 'Small label', type: 'text', default: 'Our story' },
          { name: 'story.title', label: 'Heading', type: 'text', default: 'Ideas into products people rely on.' },
          { name: 'story.body', label: 'Text (blank line between paragraphs)', type: 'textarea', default: '{company} specialises in next-generation technology solutions, digitisation, and branding and design — offering end-to-end support for organisations that want to grow digitally.\n\nOur core philosophy is continuous iteration and improvement of creative ideas. We use the latest technologies and innovation to help modern companies, public bodies, businesses and startups turn ideas into functional products that improve operational efficiency and create digital growth opportunities.' },
          bg('story.bg', 'Section background', 'light'),
        ],
      },
      {
        title: 'Vision & mission',
        fields: [
          { name: 'vision.text', label: 'Vision', type: 'textarea', default: 'To become a leading provider of innovative solutions and services while meeting the growth goals and expectations of our clients.' },
          { name: 'vision.mission', label: 'Mission points', type: 'items', default: rows([['Products & services', 'Achieve the highest standards of reliability, sustainability and efficiency.'], ['Clients', 'Provide highly need-specific solutions and best-in-class services that build long-term relationships.'], ['People', 'Create a holistic work culture with maximum exposure and fulfilling professional opportunities.']]) },
          bg('vision.bg', 'Section background', 'dark'),
        ],
      },
      {
        title: 'Values',
        fields: [
          show('values.show'),
          { name: 'values.eyebrow', label: 'Small label', type: 'text', default: 'How we work' },
          { name: 'values.title', label: 'Heading', type: 'text', default: 'Values and working principles' },
          { name: 'values.list', label: 'Values (one per line)', type: 'lines', default: rows(['Creative ingenuity & quality', 'Discipline & commitment to timelines', 'Process orientation', 'Specialisation & attention to detail', 'Latest technologies, applied with purpose', 'Continuous refinement through collaboration']) },
          bg('values.bg', 'Section background', 'light'),
        ],
      },
      { title: 'Impact numbers', fields: [show('stats.show')] },
      cta(),
      seo('About Alight Consultants', 'Alight Consultants Pvt. Ltd. is a process-driven organisation in Ahmedabad focused on innovation, digital transformation and enterprise technology.'),
    ],
  },
  {
    key: 'services', label: 'Services', path: '/services',
    groups: [
      hero({ eyebrow: 'Services', title: 'From strategy to code to long-term support.', lead: '{count} service lines delivered through ISO-certified processes — so you get one accountable partner for the whole lifecycle.' }),
      { title: 'Services list', fields: [bg('list.bg', 'Section background', 'light')] },
      cta(),
      seo('Services — Software, FinTech, Web, Mobile & UI/UX', 'Enterprise software development, financial technology, web and mobile applications, UI/UX, digital transformation, AI & automation, cloud and branding services.'),
    ],
  },
  {
    key: 'products', label: 'Products', path: '/products',
    groups: [
      hero({ eyebrow: 'Product catalogue', title: 'Platforms for public finance, institutions and enterprise.', lead: 'Configurable products that shorten time-to-value — each backed by Alight’s implementation, customisation and long-term support.' }),
      { title: 'Product explorer', fields: [bg('list.bg', 'Section background', 'light')] },
      cta('Need a platform tailored to your process?', 'Every product can be customised, integrated and deployed on cloud or on-premise infrastructure.'),
      seo('Products — Enterprise, FinTech & e-Governance Platforms', 'Explore Alight Consultants products: fund management (SNA, IFMS), treasury, dairy SCM ERP, asset & inventory, payroll, education ERP, POS, E-Token and more.'),
    ],
  },
  {
    key: 'industries', label: 'Industries', path: '/industries',
    groups: [
      hero({ eyebrow: 'Industries', title: 'Domain depth where it matters most.', lead: 'Our platforms are shaped by the realities of each sector — regulation, scale, connectivity and the people who use them.' }),
      { title: 'Industries grid', fields: [bg('list.bg', 'Section background', 'light')] },
      cta(),
      seo('Industries — Government, Banking, Education, Dairy, Retail & Tourism', 'Technology solutions for government, banking, education, dairy cooperatives, enterprise, retail and tourism.'),
    ],
  },
  {
    key: 'technology', label: 'Technology', path: '/technology',
    groups: [
      hero({ eyebrow: 'Technology', title: 'Engineering choices that last.', lead: 'Proven enterprise stacks combined with modern frontend and mobile frameworks.' }),
      {
        title: 'Engineering principles',
        fields: [
          { name: 'principles.items', label: 'Principles', type: 'items', default: rows([['Security by design', 'Role-based access, audit trails and ISO 27001-aligned practices in every build.'], ['Built to be maintained', 'Mainstream, well-supported stacks with documentation and clean architecture.'], ['Integration-ready', 'APIs and connectors for banks, government systems and existing ERPs.'], ['Deploy anywhere', 'Cloud, on-premise or hybrid — including Windows Server and IIS environments.']]) },
          bg('principles.bg', 'Section background', 'light'),
        ],
      },
      heading('tech', 'Technology ecosystem', { eyebrow: 'Technology ecosystem', head: 'Proven stacks. Modern engineering.', lead: 'We choose technology for longevity, security and the skills of the teams who will maintain it.', tone: 'dark' }),
      cta(),
      seo('Technology — .NET, React, Next.js, Flutter, Node.js, SQL Server', 'The technology stacks Alight Consultants uses to build secure, scalable enterprise platforms.'),
    ],
  },
  {
    key: 'hire-developers', label: 'Hire Developers', path: '/hire-developers',
    groups: [
      hero({ eyebrow: 'Hire developers', title: 'Dedicated engineers, ready to join your team.', lead: 'Extend your capacity with Alight developers who work as part of your team, on your priorities.' }),
      {
        title: 'Roles & engagement model',
        fields: [
          { name: 'model.items', label: 'Engagement model', type: 'items', default: rows([['Pre-vetted talent', 'Developers skilled in current frameworks and agile methodologies.'], ['Flexible engagement', 'Full-time, part-time or project-based models.'], ['Agile delivery', 'Sprint-based work with transparent progress reporting.'], ['Secure processes', 'ISO 27001-aligned information security and NDAs.']]) },
          bg('roles.bg', 'Section background', 'light'),
        ],
      },
      {
        title: 'Enquiry form',
        fields: [
          { name: 'form.eyebrow', label: 'Small label', type: 'text', default: 'Get started' },
          { name: 'form.title', label: 'Heading', type: 'text', default: 'Tell us who you need.' },
          { name: 'form.lead', label: 'Text', type: 'textarea', default: 'Share the role, skills and duration. We’ll propose suitable profiles.' },
          bg('form.bg', 'Section background', 'light'),
        ],
      },
      seo('Hire Dedicated Developers — ASP.NET, Flutter, React, AngularJS, UI/UX', 'Hire dedicated ASP.NET, Flutter, ReactJS, AngularJS developers and UI/UX designers from Alight Consultants.'),
    ],
  },
  {
    key: 'our-work', label: 'Our Work', path: '/our-work',
    groups: [
      hero({ eyebrow: 'Our work', title: 'A portfolio of platforms in production.', lead: 'From state-level fund management to the billing counter — software built to run every day.' }),
      { title: 'Impact numbers', fields: [show('stats.show')] },
      { title: 'Case studies', fields: [show('cases.show')] },
      { title: 'Platforms', fields: [{ name: 'platforms.title', label: 'Heading', type: 'text', default: 'Platforms we’ve built' }, bg('platforms.bg', 'Section background', 'light')] },
      cta(),
      seo('Our Work', 'Platforms, products and projects built by Alight Consultants.'),
    ],
  },
  {
    key: 'case-studies', label: 'Case Studies', path: '/case-studies',
    groups: [
      hero({ eyebrow: 'Case studies', title: 'Challenges solved. Results delivered.', lead: 'Detailed accounts of how our platforms are used in the field.' }),
      {
        title: 'When no case studies are published',
        fields: [
          { name: 'empty.title', label: 'Title', type: 'text', default: 'Case studies are being prepared' },
          { name: 'empty.body', label: 'Text', type: 'textarea', default: 'We publish project stories once our clients approve them. Ask us for references relevant to your sector.' },
        ],
      },
      cta(),
      seo('Case Studies', 'Selected projects delivered by Alight Consultants.'),
    ],
  },
  {
    key: 'certifications', label: 'Certifications', path: '/certifications',
    groups: [
      hero({ eyebrow: 'Certifications', title: 'Quality and security you can audit.', lead: 'Independent certification of how we work — so public-sector and enterprise clients can engage with confidence.' }),
      {
        title: 'Certificates',
        fields: [
          { name: 'certs.items', label: 'Certificates', type: 'items', hint: 'One per line: Code | Name | Description', default: rows([
            ['ISO 9001:2015', 'Quality Management System', 'Certified processes for consistent delivery quality, documented workflows and continual improvement across every engagement.'],
            ['ISO 27001', 'Information Security Management', 'A structured information security framework protecting client data, financial records and system access.'],
            ['GeM', 'Government e-Marketplace Registered', 'Listed on India’s Government e-Marketplace, enabling transparent procurement for public-sector organisations.'],
          ]) },
          { name: 'certs.note', label: 'Note below the certificates', type: 'textarea', default: 'Certificate copies are available on request for procurement and vendor-onboarding processes.' },
          bg('certs.bg', 'Section background', 'light'),
        ],
      },
      cta(),
      seo('Certifications — ISO 9001:2015, ISO 27001, GeM', 'Alight Consultants is ISO 9001:2015 and ISO 27001 certified and registered on the Government e-Marketplace (GeM).'),
    ],
  },
  {
    key: 'careers', label: 'Careers', path: '/careers',
    groups: [
      hero({ eyebrow: 'Life @ Alight', title: 'Build what’s next with us.', lead: 'We’re a team that believes in innovation — and in giving people room to do their best work.' }),
      {
        title: 'Culture',
        fields: [
          show('culture.show'),
          { name: 'culture.items', label: 'Culture points', type: 'items', default: rows([['Do what you love', 'Work on products that matter to citizens, institutions and businesses.'], ['Innovate without hesitation', 'Ideas are encouraged, iterated and refined together.'], ['Grow with exposure', 'A holistic culture with real responsibility and learning opportunities.']]) },
          bg('culture.bg', 'Section background', 'light'),
        ],
      },
      {
        title: 'Open positions',
        fields: [
          { name: 'jobs.title', label: 'Heading', type: 'text', default: 'Open positions' },
          { name: 'jobs.emailNote', label: 'Email line under the heading', type: 'text', default: 'Prefer email? Send your CV to {careersEmail}.' },
          { name: 'jobs.emptyTitle', label: 'Title when there are no openings', type: 'text', default: 'No open positions right now' },
          { name: 'jobs.emptyBody', label: 'Text when there are no openings', type: 'textarea', default: 'We’re always happy to hear from talented people. Send your CV to {careersEmail}.' },
          bg('jobs.bg', 'Section background', 'light'),
        ],
      },
      seo('Careers — Life @ Alight', 'Build your career at Alight Consultants, Ahmedabad. View current job openings.'),
    ],
  },
  {
    key: 'blogs', label: 'Blogs', path: '/blogs',
    groups: [
      hero({ eyebrow: 'Insights', title: 'Ideas from the engineering floor.', lead: 'Notes on technology, delivery and digital transformation.' }),
      {
        title: 'Articles',
        fields: [
          { name: 'empty.title', label: 'Title when no articles are published', type: 'text', default: 'Articles coming soon' },
          { name: 'empty.body', label: 'Text when no articles are published', type: 'textarea', default: 'Our team is preparing the first articles. Follow us on LinkedIn for updates.' },
          bg('list.bg', 'Section background', 'light'),
        ],
      },
      seo('Insights & Blogs', 'Perspectives on enterprise software, financial technology and digital transformation from Alight Consultants.'),
    ],
  },
  {
    key: 'contact', label: 'Contact', path: '/contact',
    groups: [
      hero({ eyebrow: 'Contact', title: 'Let’s talk about what you’re building.', lead: 'Send us a message and our team will respond with next steps.' }),
      {
        title: 'Contact details & form',
        fields: [
          { name: 'form.title', label: 'Form heading', type: 'text', default: 'Send an enquiry' },
          { name: 'form.lead', label: 'Form text', type: 'text', default: 'Fields marked * are required.' },
          { name: 'map.show', label: 'Show the map', type: 'toggle', default: true },
          bg('main.bg', 'Section background', 'light'),
        ],
      },
      seo('Contact Us', 'Contact {company}. Call {phone} or email {email}.'),
    ],
  },
  {
    key: 'request-consultation', label: 'Get a Quote / Consultation', path: '/request-consultation',
    groups: [
      hero({ eyebrow: 'Request a consultation', title: 'Six steps to a clear plan.', lead: 'Share your goals once — we’ll come back with a recommended approach.' }),
      {
        title: 'Form & sidebar',
        fields: [
          { name: 'expect.title', label: 'Sidebar heading', type: 'text', default: 'What to expect' },
          { name: 'expect.items', label: 'Sidebar points', type: 'items', default: rows([['Prompt response', 'Your request is logged instantly with a reference number.'], ['The right experts', 'Routed to consultants who know your sector.'], ['A clear proposal', 'Scope, approach, team and timeline.']]) },
          { name: 'expect.emailNote', label: 'Email line in the sidebar', type: 'text', default: 'Prefer email? Write to {quoteEmail}.' },
          bg('main.bg', 'Section background', 'light'),
        ],
      },
      seo('Request a Consultation', 'Tell us about your project in six short steps and receive a tailored plan from Alight Consultants.'),
    ],
  },
  {
    key: 'privacy-policy', label: 'Privacy Policy', path: '/privacy-policy',
    groups: [
      hero({ eyebrow: 'Legal', title: 'Privacy Policy', lead: 'Last updated: 30 October 2026' }),
      {
        title: 'Policy text',
        fields: [
          { name: 'legal.sections', label: 'Sections', type: 'items', hint: 'One per line: Heading | Text', default: rows([
            ['Information we collect', 'When you submit an enquiry or consultation request we collect the details you provide — such as your name, organisation, email, phone number and project information — together with the page you submitted from, the time of submission and technical data such as IP address and browser type.'],
            ['How we use it', 'We use this information to respond to your enquiry, prepare proposals, provide services you request and keep records of our communication. We do not sell your personal information.'],
            ['Storage and security', 'Enquiries are stored on secured servers with role-based access restricted to authorised staff. Our information security practices are aligned with ISO 27001.'],
            ['Retention', 'We retain enquiry records only as long as needed for the purposes above or as required by law.'],
            ['Your rights', 'You may request access to, correction of, or deletion of your personal information by writing to {email}.'],
            ['Cookies', 'The public website does not use advertising cookies. Essential cookies are used only for secure administrator sessions.'],
            ['Contact', '{company}, {address}. Email: {email}.'],
          ]) },
          bg('legal.bg', 'Section background', 'light'),
        ],
      },
      seo('Privacy Policy', 'How {company} collects, uses and protects personal information submitted through this website.'),
    ],
  },
  {
    key: 'terms-and-conditions', label: 'Terms & Conditions', path: '/terms-and-conditions',
    groups: [
      hero({ eyebrow: 'Legal', title: 'Terms & Conditions', lead: 'Last updated: 30 October 2026' }),
      {
        title: 'Terms text',
        fields: [
          { name: 'legal.sections', label: 'Sections', type: 'items', hint: 'One per line: Heading | Text', default: rows([
            ['Use of this website', 'This website is operated by {company}. By using it you agree to these terms.'],
            ['Information on this website', 'Content is provided for general information about our company, products and services. Product capabilities may vary by deployment and are confirmed in individual proposals and agreements.'],
            ['Intellectual property', 'All content, product names, logos and designs on this website belong to Alight Consultants or their respective owners and may not be reproduced without permission.'],
            ['Enquiries', 'Submitting an enquiry does not create a contract. Engagements are governed by separately signed agreements.'],
            ['Limitation of liability', 'We take care to keep this website accurate and available but do not guarantee uninterrupted access and are not liable for losses arising from its use.'],
            ['Governing law', 'These terms are governed by the laws of India, with courts at Ahmedabad, Gujarat having jurisdiction.'],
          ]) },
          bg('legal.bg', 'Section background', 'light'),
        ],
      },
      seo('Terms & Conditions', 'Terms of use for the {company} website.'),
    ],
  },
];

export const PAGE_MAP = Object.fromEntries(PAGES.map((p) => [p.key, p]));
export const pageFields = (page) => page.groups.flatMap((g) => g.fields);

/** Splits an `items` value into rows of columns ("A | B | C" per line). */
export const parseItems = (value = '') =>
  String(value).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => l.split('|').map((s) => s.trim()));

/** Splits a `lines` value into non-empty lines. */
export const parseLines = (value = '') => String(value).split('\n').map((l) => l.trim()).filter(Boolean);

/** Splits text into paragraphs on blank lines. */
export const paragraphs = (value = '') => String(value).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
