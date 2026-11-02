# Content Verification Checklist

Source audited: https://alightconsultants.in (home, /about-us, /products) on 30 Oct 2026.
Nothing below should go live until an Alight representative ticks it off.

## ✅ Verified from the existing website (used as-is, wording improved)

| Item | Value used |
|---|---|
| Legal name | Alight Consultants Pvt. Ltd. |
| Motto | "Believing Innovations" |
| Address | 507–510, Ashoka Chambers, Nr. Lions Hall, Opp. HCG Hospital, Mithakhali, Ahmedabad 380009 |
| Phone | +91 79 4004 8129 |
| Email | info@alightconsultants.in |
| LinkedIn | in.linkedin.com/company/alight-consultants-pvt-ltd |
| Certifications | ISO 9001:2015, ISO 27001, GeM registered |
| Services (5) | Branding & Print Media, Mobile App, Software, UI/UX, Web Development |
| Products (17) | Names and URL slugs copied exactly, so old product URLs map 1:1 to `/products/<slug>` |
| Hire developers | ASP.NET, Flutter, AngularJS, ReactJS, UI/UX |
| Mission / vision / values | From /about-us |
| Logo | `public/assets/logo/alight-logo.svg` (official SVG). Brand colours taken from it: navy `#223579`, red `#C7161C` |

## ⚠️ Needs confirmation before launch

- [ ] **Email discrepancy:** the old site header shows `info@alightconsultant.in` (no "s") and the footer shows `info@alightconsultants.in`. The new site uses the footer version.
- [ ] **Statistics** (seeded into the `Statistic` table, editable): 90+ projects, 2 Lac+ transactions, ₹500 Cr+ monthly. These are published on the old site but need internal confirmation. The "monthly transaction" figure is shown as a *value* in ₹. Please confirm whether it means value or count.
- [ ] **Product descriptions and feature lists:** the old site lists names only. The summaries and four features per product in `src/data/products.js` are editorial drafts based on each product's name and purpose. Each one needs a product owner's review.
- [ ] **Product categories:** Government Finance / Enterprise ERP / Citizen & e-Governance / Commerce & Operations are a proposed grouping.
- [ ] **Additional service lines:** Financial Technology, Digital Transformation, AI & Automation, and Cloud & Infrastructure come from the new brief, not the old site.
- [ ] **Technologies:** .NET, C#, Next.js, Node.js, SQL Server, SQLite, Cloud, AI and Automation come from the brief. Only ASP.NET, Flutter, AngularJS, ReactJS, PHP and Java appear on the old site.
- [ ] **Industry → product mapping** in `src/data/industries.js`.
- [ ] **Map location:** the contact page embeds a Google Maps search for "Ashoka Chambers, Mithakhali". Confirm the pin, or supply exact coordinates.
- [ ] **Privacy Policy & Terms:** template wording. These need legal review.

## ❌ Deliberately NOT used

- **Bank logos** (HDFC, ICICI, RBL, AU, Kotak, Axis, YES, Indian Bank) are shown on the old site without context. They are not displayed. Add them through the `ClientLogo` table only after written permission, then set `isVisible = true`. Until then the homepage trust strip shows certifications instead.
- **Testimonials:** the old site has lorem-ipsum placeholders. The section stays hidden until a testimonial is approved.
- **Case studies, team names and founding year:** none are published. The case-study sections hide or show an honest empty state.

## Asset directories (`public/assets/`)

`logo/` · `favicon/` · `products/` · `clients/` · `illustrations/` · `team/` · `projects/` · `blogs/`

Still needed from Alight:
- [ ] Product screenshots (they replace the code-drawn previews)
- [ ] Permission-cleared client logos
- [ ] Team photos
- [ ] Certificate scans
- [ ] A white/reversed logo variant for dark backgrounds. Today the logo sits on a white plate.
