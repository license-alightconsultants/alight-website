# Build Progress & Setup

## Quick start

```bash
npm install
cp .env.example .env          # set DATABASE_URL, ADMIN_SETUP_TOKEN, UPLOAD_DIR, SMTP_* as needed
npx prisma generate           # npm 11 blocks Prisma's postinstall, so run it explicitly
npx prisma migrate dev        # creates the PostgreSQL tables and seeds roles + catalogue
npm run build && npm start    # production; use `npm run dev` only for development
```

### First admin account
1. Set `ADMIN_SETUP_TOKEN` in `.env` (16+ random characters) and restart.
2. Open `/admin/setup`, enter the token and create the Super Admin.
3. The setup page closes permanently once an admin exists. Then remove the token from `.env`.

## Phase status

| Phase | Status |
|---|---|
| 1. Research & brand audit | ✅ `docs/CONTENT-VERIFICATION.md` |
| 2–5. Design system, layout, public pages, motion | ✅ |
| 6. Prisma + PostgreSQL (migrated from SQLite 2026-11-02) | ✅ |
| 7. Auth & admin dashboard | ✅ |
| 8. Enquiry & email workflows | ✅ |
| 9. CMS modules | ✅ |
| 10. Security / testing / SEO | 🟡 Core done. Lighthouse and visual QA are still to do |
| 11. Windows Server deployment | ✅ Done — see docs/DEPLOYMENT.md, scripts in deploy/windows/ |

## Admin (`/admin`)

| Area | What it does |
|---|---|
| Dashboard | Live PostgreSQL metrics: enquiry totals, new, contacted, converted and pending. Also a 12-month trend, status and service breakdowns, recent enquiries, and product, service and blog counts |
| Enquiries | Search, filter (status, service, type, date range, "assigned to me"), detail view, status updates, internal remarks, assignment, activity history and CSV export |
| Content | Products (features, gallery, featured, publish, order, SEO), services, industries, case studies, blogs (draft, publish, schedule, categories, SEO, slugs), blog categories, statistics, testimonials (approval), client logos (visibility) and job openings |
| Job applications | Applications from the careers page, with status tracking |
| Website settings | Company, contact, address, map, social links, footer, SEO defaults and SMTP (password is write-only), plus a test-email button |
| Users & roles | Create, edit or disable admins, reset passwords, and edit the role-permission matrix (Super Admin only) |
| Audit log | Every login, change and export |

Admin edits appear on the public site immediately via `revalidatePath`.

### Roles
- **Super Admin:** has every permission and manages users.
- **Administrator:** has every permission except user management.
- **Content Manager:** manages content, testimonials and careers. Has **no access to enquiries**.
- **Enquiry Manager:** sees the dashboard and can view, update and export enquiries.

## Security implemented
- **Passwords:** bcrypt hashes (cost 12), at least 10 characters with letters and numbers.
- **Sessions:**
  - The session token is random. Only its SHA-256 hash is stored in the DB.
  - The cookie is HTTP-only and `SameSite=Strict`, and `Secure` in production. Sessions last 8 hours.
  - Sessions are validated against the DB on every request.
  - Logout, a password reset or deactivating a user kills the session server-side.
- **Login throttling:** an email is locked after 5 failures in 15 minutes, and an IP after 20. Attempts are stored in the DB, so the limit survives restarts. Response timing is the same for unknown emails.
- **Permissions:** checked on the server in every page, action and route. The middleware only bounces requests with no cookie.
- **CSRF:** Server Actions check the request origin, cookies are `SameSite=Strict`, and public APIs also check origin.
- **Uploads:**
  - The file type is checked from its first bytes, and each file is limited to 5 MB.
  - SVGs containing scripts, event handlers or `foreignObject` are rejected.
  - Files are served with `CSP: sandbox` and `nosniff`.
  - Paths are confined to `UPLOAD_DIR`.
- **Other protections:**
  - CSV export guards against formula injection.
  - Blog content renders as text, never as HTML.
  - Admin pages send `noindex`, and `robots.txt` disallows `/admin`.

## Verified (production build)
An end-to-end HTTP test suite passed **28/28**. It covered:
- **Access and setup:** login gating, the setup token, and the setup page closing after first use.
- **Enquiries:** dashboard, enquiry search, updates and history, and CSV export.
- **Content:** product create (live on the public site) with duplicate-slug and required-field validation; blog publish versus draft visibility.
- **Settings:** changes reach the public footer, and the SMTP secret is never sent to the browser.
- **Roles:** Content Manager isolation (no enquiries, CSV or users).
- **Security:** lockout after 5 failures, and a session replay after logout fails.
- **Audit log:** entries are recorded.

Upload tests:
- A valid PNG is accepted.
- An SVG with a script, a disguised PHP file and a 6 MB file are all rejected.
- Path traversal returns 404.

All test data was removed afterwards. The DB has no admin users.

## Known limits / next
- Lighthouse audit and a visual browser review are not done yet.
- Contact/consultation service dropdowns use the static service list (`src/data/services.js`).
- The industry → product mapping is still edited in code (`src/data/industries.js`).
- Run deploy/windows scripts on the real server (IIS + ARR + certificate untested here: no IIS on the dev PC).

## Design update (31 Oct 2026)
Each change below was checked in headless-Chrome screenshots at desktop and mobile sizes.

**Public site**
- **Hero:** a 3D-tilted enterprise console with animated KPIs, a fund-flow chart and status rows. Around it float a citizen-app phone, rotating live notification toasts and an ISO 27001 badge, all with mouse parallax. The headline now fits in 3 lines.
- **Product previews (`ProductVisual`):** realistic app interfaces in five variants: dashboard, ledger, workflow, kanban and mobile. An uploaded screenshot replaces the drawing automatically.
- **Homepage products:** an interactive spotlight replaces the 14-card grid. It has category tabs and an auto-advancing list with a progress bar, and pauses on hover or with reduced motion.
- **Intro section:** a motto card, a rotating certification seal and a head-office card.
- **Capabilities:** a live interface preview for each service.
- **Inner pages:** a default 3D "platform stack" graphic (`HeroStack`); service pages get a tilted preview.

**Admin**
- **Top bar:** search, a Create menu, a new-enquiry bell and the user menu.
- **Sidebar:** active-item accent and count badges.
- **Dashboard:**
  - A welcome banner with today's priorities and a conversion ring.
  - KPI tiles with sparklines and changes compared with the previous 30 days.
  - An area trend chart with a crosshair tooltip and table view.
  - A sales-pipeline funnel coloured with a sequential ramp.
  - Ranked services, recent enquiries with avatars and relative times, and a "Needs attention" panel.
- **Enquiry list:** two-row filter bar and contact avatars.

**Build note:** `npm run build` now deletes `.next` first. Next.js 15.5 keeps a runtime page cache (`.next/server/route-cache`) that otherwise survives rebuilds and serves pages from the old build.

**Regression:** the end-to-end suite still passes 28/28.

## Signature graphics (31 Oct 2026)
- **`ParticleField`:** a canvas 3D wave terrain behind the hero, the impact band and the final call to action. It follows the mouse, pauses when off-screen or when the tab is hidden, and shows a still frame under reduced motion. It has no dependencies.
- **`TechSphere`:** a draggable 3D sphere of technology labels with depth scaling and blur, which auto-rotates.
- **Why Alight:** a bento grid with a mini illustration in each tile (code, architecture, team, certifications, support timeline).
- **Impact band:** cinematic stats with gradient numbers. Values still come from the admin-managed Statistic table, and the band hides when there are none.
- **Sector marquee:** a large outlined and solid editorial marquee under the certification strip. It uses the CMS industries.
- **Footer:** a giant outlined ALIGHT wordmark.
- **Page transitions:** `app/template.js` fades each page in. It uses opacity only, so fixed and sticky elements keep working.
- **Verified:** all 19 public routes return 200 on mobile, with no horizontal overflow and no JS errors.

**Ops note:** do not leave an old `next start` process running from this folder. It writes stale pages into `.next/server/route-cache`. Stop the old server before `npm run build`.

## Page customisation & department emails (31 Oct 2026)
- **Admin → Pages & backgrounds** (`/admin/pages`, permission `content.write`): every public page (16) has an editor for
  banner text/background/side image, all section text, section backgrounds (preset, custom colour, 2-colour gradient or
  uploaded image with adjustable shade), show/hide toggles, closing CTA and SEO. Field definitions and the built-in copy
  live in `src/lib/pages/registry.js`; only changed fields are stored (SiteSetting `page:<key>` JSON). "Reset to default"
  removes edits and uploaded images. Text supports `*highlight*` and `{company} {email} {phone} {address} {careersEmail} {quoteEmail}`.
- Light/dark section tones keep text readable whatever background is chosen (`src/lib/pages/backgrounds.js`).
- **Department emails** (Admin → Website settings): Careers email and Quote email shown on the Careers / Get a Quote pages;
  separate notification inboxes for quote requests and job applications (comma-separated lists allowed, validated).
  Job applications now send an email to the careers inbox (+ applicant acknowledgement when enabled).
- Detail pages (each product/service/industry/blog/case study) stay edited in their own Content sections.
