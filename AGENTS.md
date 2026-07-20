# Vugex V2 — Project Context

## What Is This

Vugex V2 is a **full rebuild** of the Vugex Solution email marketing infrastructure platform. The original site (164+ HTML pages, 31 sections) is cloned at `../vugex-full/`. This is a ground-up rebuild using modern tech.

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Backend | Node.js + Express | Express 4.x (NOT 5) |
| Database | MySQL 8 + Prisma ORM | Prisma 6.x (NOT 7) |
| Auth | JWT (access + refresh) + bcryptjs | |
| Frontend | Vue 3 (Composition API) + Vite 8 | |
| Styling | Tailwind CSS 4.x (CSS-first config, `@theme` block) | |
| State | Pinia 4.x | |
| HTTP | Axios with interceptors | |
| Fonts | Inter + JetBrains Mono (loaded via Google Fonts) | |

## Quick Start

```bash
# Full stack (Docker)
cd vugex-v2
docker compose up -d

# Frontend: http://localhost:81
# Backend:  http://localhost:3000
# Adminer:  http://localhost:8080
# MySQL:    localhost:3307
```

Or dev mode:
```bash
# Backend (port 3000)
cd server && npm run dev

# Frontend (port 5173)
cd client && npm run dev
```

**Login:** `admin@app.com` / `password` (set via seed.js; credentials are NOT hardcoded in the login form)

## Database

- **Docker MySQL:** `vugex-mysql` container, port **3307** (3306 is taken by system MySQL)
- **Root password:** from `MYSQL_ROOT_PASSWORD` env var (default: `password`)
- **Database:** `vugex_v2`
- **Connection:** `mysql://root:password@localhost:3307/vugex_v2`
- **Prisma commands:** `npm run db:migrate`, `npm run db:seed`, `npm run db:studio`, `npm run db:reset`
- **Latest migration:** `20260720194251_add_indexes` (14 performance indexes)

## Environment Variables

Backend secrets are loaded via `.env` file (gitignored). See `.env.example` for template:
- `JWT_SECRET` — JWT access token secret (validated at server startup)
- `JWT_REFRESH_SECRET` — JWT refresh token secret (validated at server startup)
- `MYSQL_ROOT_PASSWORD` — MySQL root password
- `CORS_ORIGIN` — Allowed CORS origin
- `NODE_ENV` — Set to `production` in Docker

## API Style

**REST** (GET/POST/PUT/DELETE) — NOT single-endpoint /api.json.

All protected routes use `Authorization: Bearer <token>` header.
All routes have `roleCheck(section, action)` middleware for RBAC.

## Current State — ALL PHASES COMPLETE + PRODUCTION HARDENED + UI REDESIGNED

### Design System

- **OKLCH color tokens** defined in `client/src/style.css` `@theme` block
- **Token classes:** `text-fg`, `text-fg-secondary`, `text-muted`, `bg-surface`, `bg-surface-alt`, `bg-primary`, `bg-primary-hover`, `bg-success`, `bg-danger`, `bg-danger-light`, etc.
- **No legacy Tailwind colors** — zero `bg-gray-*`, `text-gray-*`, `border-gray-*` in views
- **Sidebar:** dark `oklch(13% 0.012 250)`, collapsible, section labels, active indicator bar
- **Layout:** `flex h-screen` app-shell, `lg:relative` sidebar on desktop
- **Inter + JetBrains Mono** fonts loaded via Google Fonts

### Database Models (53 total)

| Model | Purpose |
|---|---|
| User | Users with email, password, status, superUserStatus |
| Role | Named roles with JSON permissions (94 sections x read/write/delete) |
| UserRole | Many-to-many join (user <-> role) with cascade delete |
| Session | JWT sessions with token, refreshToken, isActive, expiresAt (+ indexes) |
| SmtpServer | SMTP servers with host, port, encryption, proxy support (+ indexes) |
| ServerProvider | Server provider names with status |
| MtaServer | MTA servers with SSH config, OS, IPs, installation status (+ indexes) |
| Domain | Domains with status, flags, availability, brand (+ index) |
| DomainRecord | DNS records (A, MX, TXT, etc.) linked to domains (+ index) |
| DataList | Email data lists with vertical, ISP, country (+ index) |
| DataProvider | Data provider names |
| Header | Email headers with name + header (Text) |
| Isp | ISP names |
| Mailbox | Mailboxes linked to domains with IMAP/SMTP config |
| ManagementServer | Management servers with SSH config (user-pass or PEM) |
| SmtpGroup | SMTP groups with encryption, bulk create |
| CustomVmta | Custom VMTAs linked to SMTP groups (name, ip, port) |
| Proxy | HTTP/SOCKS proxy servers |
| Offer | Offers with name, payout, cap, vertical (+ index) |
| Suppression | Suppression lists linked to offers |
| AffiliateNetwork | Affiliate networks with postback config |
| AutoResponder | Auto responder sequences |
| AutoResponderList | Auto responder list associations |
| VirtualList | Virtual data lists with filters |
| VirtualListProcess | Virtual list background processing jobs |
| Production | Campaign production entries |
| SendProcess | Send processes linked to production (+ indexes) |
| GmailAccount | Gmail API accounts with OAuth tokens |
| GSuiteAccount | G Suite API accounts with OAuth tokens |
| OutlookAccount | Outlook API accounts with OAuth tokens |
| CloudAccount | Cloud provider accounts (generic: provider field for 11 providers) |
| CloudInstance | Cloud instances (generic: provider field, dynamic instance types) |
| ElasticIp | AWS Elastic IP allocations linked to cloud instances (+ index) |
| RegistrarAccount | Domain registrar accounts (generic: registrar field for 6 registrars) |
| PostmasterAccount | Postmaster accounts with IMAP/SMTP config for ISP inbox monitoring |
| PostmasterMessage | Cached IMAP messages (unique per account+messageId) |
| PostmasterRun | Postmaster monitoring run history with status and counts |
| FrontendLog | Frontend application logs (stored in DB) |
| Blacklist | Blacklisted emails/domains (linked to DataList) |
| DomainBrand | Domain brand management |
| DomainSubdomain | Subdomain management (linked to Domain) |
| GeoManagerProcess | Geo Manager processes with source schema/tables, target geos, progress tracking |
| GeoManagerLog | Geo Manager process logs |
| PmtaCommand | PMTA commands (pending/executed) |
| PmtaSchedule | PMTA scheduled commands |
| PmtaTemplate | PMTA email templates |
| PmtaVmta | PMTA VMTA entries |
| Team | Teams for user grouping |
| TeamUser | Team membership |
| TeamAuthorization | Per-user authorizations (MTA/SMTP/Offers/DataLists) |
| AuditLog | Audit trail for all CRUD operations (+ indexes) |
| Setting | Application settings (key-value) |
| Vertical | Vertical/niche categories |

### Backend (server/src/)

| File | What It Does |
|---|---|
| index.js | Express entry: helmet, cors, morgan, routes, 404 handler, error handler. Validates JWT_SECRET at startup. |
| config/database.js | PrismaClient singleton + graceful shutdown |
| middleware/auth.js | JWT verification, session lookup, excludes password from user query |
| middleware/roleCheck.js | RBAC: checks role.permissions[section][action] |
| middleware/errorHandler.js | P2002/P2003/P2025 handling, production-safe errors |
| middleware/rateLimiter.js | Login (5/15min), API (200/15min), refresh (10/15min) rate limiting |
| utils/helpers.js | paginate(), buildSearch(), buildSort() |
| utils/validation.js | validateEmail(), validatePassword(), validatePort(), validateStringLength() |
| services/sshService.js | SSH remote execution |
| services/imapService.js | IMAP connection via imapflow + mailparser |
| services/geoDbService.js | MySQL pool + cross-schema queries (reads DATABASE_URL env) |
| services/geoJobRunner.js | In-memory background job manager |
| services/smtpCheckService.js | Real SMTP connectivity testing (net/tls) |
| controllers/ | 41 controller files, all with batched DB queries (no N+1 patterns) |
| routes/ | 41 route files, all with auth + roleCheck middleware |

### Frontend (client/src/)

| File | What It Does |
|---|---|
| App.vue | Calls fetchUser on init for fresh data |
| router/index.js | ~90 routes + auth guards + scroll-to-top + 404 catch-all |
| stores/auth.js | Pinia: login (with mutex), logout (with guard), fetchUser (JWT expiry check) |
| stores/toast.js | Pinia: toast notifications (max 5 simultaneous, auto-dismiss) |
| stores/app.js | Pinia: sidebar state, mobile sidebar |
| style.css | Tailwind v4 `@theme` block with OKLCH design tokens |
| api/client.js | Axios with token inject + auto-refresh (mutex/queue for race condition) |
| api/ | 45 API wrapper files covering all endpoints |
| layouts/DefaultLayout.vue | `flex h-screen` app-shell with sidebar + header + content |
| layouts/AuthLayout.vue | Dark gradient + grid pattern + radial glow |
| components/common/DataTable.vue | Server-side paginated table with search, select, group actions |
| components/common/ConfirmDialog.vue | Reusable confirm modal (blur backdrop, scale transition, escape key) |
| components/common/Toast.vue | Toast notification (shadow-lg, OKLCH colors) |
| components/common/PageHeader.vue | Shared page header with title |
| components/common/StatusBadge.vue | Status badge with OKLCH colors |
| components/common/FormCard.vue | Form section wrapper |
| components/common/FormActions.vue | Form submit/cancel button group |
| components/layout/Sidebar.vue | 36 collapsible sections, `lg:relative` on desktop, section labels, active indicator |
| components/layout/Header.vue | Search bar, breadcrumbs, notification bell, user avatar |

### Frontend Views (126 files across 39 directories)

All views use OKLCH design tokens. Zero legacy gray-* classes.

### Sidebar Sections (36 total)

1. Dashboard
2. Production (List, Add, MTA Drops, MTA Tests, SMTP Drops, SMTP Tests, Upload Images)
3. MTA Servers (List, Add, Multi-Add, Install Wizard, Bulk Install, Configure IPs, Server Actions, VMTAs)
4. SMTP Servers (List, Add, Bulk Check)
5. SMTP Groups (List, Add, Send Process, Custom VMTAs)
6. Domains (List, Add, Brands, Subdomains)
7. Data Lists (List, Add, Blacklists, Download, Emails Fetch)
8. Data Providers (List, Add)
9. Mailboxes (List, Add)
10. Offers (List, Add)
11. Virtual Lists (List, Add)
12. Auto Responders (List, Add)
13. Headers (List, Add)
14. Affiliate Networks (List, Add)
15. Gmail API (List, Add, Send Process, Drops, Tests)
16. G Suite API (List, Add, Send Process, Drops, Tests)
17. Outlook API (List, Add, Send Process, Drops, Tests)
18. ISPs (List, Add)
19. Cloud APIs (Accounts, Instances)
20. Servers Providers (List, Add)
21. Management Servers (List, Add)
22. DNS Management (Registrar Accounts)
23. Proxies (List, Add)
24. Postmaster (List, Add, Inbox Monitor, Runs)
25. Users (Add, List)
26. Application Roles (Add, List, Affect Roles, Affect Users)
27. Sessions
28. Teams (List, Add)
29. Verticals (List, Add)
30. Tools (SPF, Blacklist, Value Extractor, Mailbox Extractor)
31. Geo Manager (Processes, Add)
32. Statistics (Full Report, Advanced Report)
33. PMTA (Commands, Scheduler, Templates, VMTAs, Configs, History)
34. Audit Logs
35. Logs (Backend, Frontend)
36. Settings

## Conventions

### Backend
- **CommonJS** (`require`/`module.exports`) — NOT ES modules
- **Prisma 6** — `datasource db` in schema, NOT `prisma.config.ts`
- **Express 4** — NOT Express 5
- **All routes** must have `auth` + `roleCheck` middleware
- **All controllers** use `try/catch` with `next(error)`
- **parseInt** always with radix 10: `parseInt(val, 10)`
- **Passwords** never in API responses (use `select` clause)
- **ID validation**: `if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' })`
- **Bulk operations**: always batch DB reads with `findMany({ where: { id: { in: ids } } })` — NEVER loop with `findUnique`
- **Input validation**: use `utils/validation.js` for email, password strength, port range
- **Environment secrets**: loaded from `.env` file, validated at startup
- **Implemented features** return real DB data
- **Not-yet-implemented features** return `{ implemented: false, message: '...' }` — NOT fake status toggles

### Frontend
- **Vue 3 Composition API** (`<script setup>`)
- **Tailwind CSS 4** with OKLCH design tokens — NO Bootstrap, NO custom CSS files
- **Design token classes:** `text-fg`, `text-fg-secondary`, `text-muted`, `bg-surface`, `bg-surface-alt`, `bg-primary`, `bg-primary-hover`, `border-border`, `border-border-light`
- **Status badges:** `bg-primary-light text-primary` (blue), `bg-success-light text-success` (green), `bg-danger-light text-danger` (red)
- **Back buttons:** `border border-border bg-surface text-fg hover:bg-surface-alt` (NOT `bg-gray-600`)
- **Page headers:** use `<PageHeader title="..." />` component
- **Pinia** for state — NOT Vuex
- **Lazy-loaded routes** via `() => import(...)`
- **DataTable** component for all list views (server-side pagination)
- **ConfirmDialog** for all destructive actions — NO `window.confirm()`
- **Try/catch** on all async operations
- **No unused imports** — keep imports clean

### Permission Sections (94 total)

Organized in groups: Dashboard, Users, Roles, Teams, SMTP (add/list/bulk-check/groups), MTA (servers/install/ips/etc), Domains, Production, Cloud Providers (AWS/Azure/DO/Hetzner/Linode/OVH/Scaleway/Vultr/Atlantic/IDCloud), Domain Registrars (Cloudflare/GoDaddy/Namecheap/Namecom/Dynadot/Spaceship), Gmail/GSuite/Outlook, Tools, Data Lists, Postmaster, ISPs, Headers, Data Providers, Mailboxes, Servers Providers, Management Servers, Proxies, Geo Manager, Sessions, Settings.

## Known Remaining Gaps

1. **Email tracking** — Bounce/click/open tracking not yet implemented. Statistics report shows `0` for deliveryRate, openRate, clickRate, unsubRate until tracking infrastructure (webhooks, open pixels, click redirects) is built.
2. **DNSBL domain check** — `toolController.js` blacklist check only works for IPs; domain DNSBL lookup is `implemented:false`.
3. **Mailbox extractor** — `toolController.js` mailbox extractor is `implemented:false`.
4. **Emails fetch** — `dataListController.js` fetchEmails is `implemented:false`.
5. **SMTP server expiration** — `expirationDate` field exists but no cron job to auto-disable expired servers.

## Project Files

| File | Purpose |
|---|---|
| docker-compose.yml | MySQL 8 + Backend + Frontend + Adminer (4 services with healthchecks) |
| Dockerfile | Backend: Node 20 Alpine + Prisma + healthcheck |
| client/Dockerfile | Frontend: Multi-stage build (Node → nginx) |
| client/nginx.conf | SPA fallback, /api proxy, gzip, asset caching |
| .env | Backend secrets (gitignored, loaded by docker-compose + server) |
| .env.example | Environment variable template |
| server/prisma/schema.prisma | 53 database models with performance indexes |
| server/prisma/seed.js | Admin user + role with all permissions |
| server/src/utils/validation.js | Email, password, port, string length validation |
| server/src/middleware/rateLimiter.js | Login (5/15min) + API (200/15min) + refresh (10/15min) rate limiting |
| SPECIFICATION.md | Full application specification |

## Git History

| Commit | Description |
|---|---|
| `e557d1b` | Fix frontend container unhealthy: use 127.0.0.1 in healthcheck |
| `3379c94` | Fix remaining N+1 queries: batch findMany in all bulk operations |
| `197d5b5` | Fix docker compose down: replace :? required vars with env_file approach |
| `d8d75b7` | Frontend cleanup: fix 2 runtime bugs, remove unused imports, dead code |
| `1e2bfd0` | Frontend UX polish: scroll-to-top, toast limit |
| `54f2bcd` | Backend quality: fix N+1 queries, add validation, DB indexes |
| `3ae1819` | Migrate all 126 views to design tokens: zero gray-* classes remaining |
| `1ea4a5d` | Fix 5 security issues: hardcoded creds, exposed API keys, weak JWT, missing rate limit |
| `f273de8` | Fix 5 critical bugs: token refresh race, logout recursion, DataTable search, ConfirmDialog |
| `19ecd36` | Redesign UI: Linear/Vercel-inspired design system with OKLCH tokens |
