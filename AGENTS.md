# Vugex V2 — Project Context

## What Is This

Vugex V2 is a **full rebuild** of the Vugex Solution email marketing infrastructure platform. The original site (164+ HTML pages, 23 sections) is cloned at `../vugex-full/`. This is a ground-up rebuild using modern tech.

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Backend | Node.js + Express | Express 4.x (NOT 5) |
| Database | MySQL 8 + Prisma ORM | Prisma 6.x (NOT 7) |
| Auth | JWT (access + refresh) + bcryptjs | |
| Frontend | Vue 3 (Composition API) + Vite 8 | |
| Styling | Tailwind CSS 4.x | |
| State | Pinia 4.x | |
| HTTP | Axios with interceptors | |

## Quick Start

```bash
# Start MySQL (Docker)
cd vugex-v2 && docker compose up -d

# Start Backend (port 3000)
cd server && npm run dev

# Start Frontend (port 5173)
cd client && npm run dev
```

**Login:** `admin@app.com` / `password`

## Database

- **Docker MySQL:** `vugex-mysql` container, port **3307** (3306 is taken by system MySQL)
- **Root password:** `password`
- **Database:** `vugex_v2`
- **Connection:** `mysql://root:password@localhost:3307/vugex_v2`
- **Prisma commands:** `npm run db:migrate`, `npm run db:seed`, `npm run db:studio`, `npm run db:reset`
- **Latest migration:** `20260718225724_add_phase6_headers_providers_isps_management_mailboxes`

## API Style

**REST** (GET/POST/PUT/DELETE) — NOT single-endpoint /api.json.

All protected routes use `Authorization: Bearer <token>` header.
All routes have `roleCheck(section, action)` middleware for RBAC.

## Current State — Phase 6 COMPLETE

### Database Models (32 total)

| Model | Purpose |
|---|---|
| User | Users with email, password, status, superUserStatus |
| Role | Named roles with JSON permissions (94 sections x read/write/delete) |
| UserRole | Many-to-many join (user <-> role) with cascade delete |
| Session | JWT sessions with token, refreshToken, isActive, expiresAt |
| SmtpServer | SMTP servers with host, port, encryption, proxy support |
| ServerProvider | Server provider names with status |
| MtaServer | MTA servers with SSH config, OS, IPs, installation status |
| Domain | Domains with status, flags, availability, brand |
| DomainRecord | DNS records (A, MX, TXT, etc.) linked to domains |
| DataList | Email data lists with vertical, ISP, country |
| DataProvider | Data provider names |
| Header | Email headers with name + content |
| Isp | ISP names |
| Mailbox | Mailboxes linked to domains with IMAP/SMTP config |
| ManagementServer | Management servers with SSH config (user-pass or PEM) |
| SmtpGroup | SMTP groups with encryption, bulk create |
| Proxy | HTTP/SOCKS proxy servers |
| Offer | Offers with name, payout, cap, vertical |
| Suppression | Suppression lists linked to offers |
| AffiliateNetwork | Affiliate networks with postback config |
| AutoResponder | Auto responder sequences |
| AutoResponderList | Auto responder list associations |
| VirtualList | Virtual data lists with filters |
| Production | Campaign production entries |
| SendProcess | Send processes linked to production |
| GmailAccount | Gmail API accounts with OAuth tokens |
| GSuiteAccount | G Suite API accounts with OAuth tokens |
| OutlookAccount | Outlook API accounts with OAuth tokens |
| CloudAccount | Cloud provider accounts (generic: provider field for aws/azure/do/hetzner/linode/ovh/scaleway/vultr/atlantic/idcloud/google) |
| CloudInstance | Cloud instances (generic: provider field, dynamic instance types per provider) |
| RegistrarAccount | Domain registrar accounts (generic: registrar field for cloudflare/godaddy/namecheap/namecom/dynadot/spaceship) |
| PostmasterAccount | Postmaster accounts with IMAP/SMTP config for ISP inbox monitoring |

### Backend (server/src/)

| File | What It Does |
|---|---|
| index.js | Express entry: helmet, cors, morgan, routes, 404 handler, error handler |
| config/database.js | PrismaClient singleton + graceful shutdown |
| middleware/auth.js | JWT verification, session lookup, excludes password from user query |
| middleware/roleCheck.js | RBAC: checks role.permissions[section][action] |
| middleware/errorHandler.js | P2002/P2003/P2025 handling, production-safe errors |
| utils/helpers.js | paginate(), buildSearch(), buildSort() |
| services/sshService.js | SSH remote execution (checkServer, executeCommand, getServerIps) |
| controllers/authController.js | login, logout, refresh, me (with merged permissions) |
| controllers/userController.js | CRUD, no superUserStatus on create |
| controllers/roleController.js | CRUD + affectRoleToUsers + affectRolesToUser (transactions) |
| controllers/smtpServerController.js | CRUD + check + bulkCheck + bulkAction, passwords hidden |
| controllers/sessionsController.js | list + forceDisconnect |
| controllers/dashboardController.js | stats (mostly stub) + charts |
| controllers/mtaServerController.js | CRUD + check + bulkCheck + bulkAction + install + configureIps + extractRdns + generateDkim + bulkInstall |
| controllers/domainController.js | CRUD + bulkAction + getRecords + setRecords |
| controllers/dataListController.js | CRUD + upload (multer) + bulkAction |
| controllers/smtpGroupController.js | CRUD + bulkAction + bulk create from newline-separated names |
| controllers/productionController.js | CRUD + bulkAction + addProcess for production campaigns |
| controllers/offerController.js | CRUD + bulkAction + suppression list management |
| controllers/suppressionController.js | CRUD + bulkAction + upload for suppression lists |
| controllers/affiliateNetworkController.js | CRUD + bulkAction for affiliate networks |
| controllers/autoResponderController.js | CRUD + bulkAction + addList for auto responders |
| controllers/virtualListController.js | CRUD + bulkAction for virtual lists |
| controllers/gmailController.js | CRUD + bulkAction for Gmail API accounts |
| controllers/gsuiteController.js | CRUD + bulkAction for G Suite API accounts |
| controllers/outlookController.js | CRUD + bulkAction for Outlook API accounts |
| controllers/cloudAccountController.js | CRUD + bulkAction + listByProvider for cloud accounts |
| controllers/cloudInstanceController.js | CRUD + bulkAction for cloud instances |
| controllers/registrarAccountController.js | CRUD + bulkAction + listByRegistrar for registrar accounts |
| controllers/proxyController.js | CRUD + bulkAction + listByType for proxy servers |
| controllers/postmasterAccountController.js | CRUD + bulkAction for postmaster accounts |
| controllers/headerController.js | CRUD + bulkAction for email headers |
| controllers/dataProviderController.js | CRUD + bulkAdd + bulkAction for data providers |
| controllers/ispController.js | CRUD + bulkAdd + bulkAction for ISPs |
| controllers/serverProviderController.js | CRUD + bulkAdd + bulkAction for server providers |
| controllers/managementServerController.js | CRUD + bulkAction for management servers (SSH config) |
| controllers/mailboxController.js | CRUD + bulkAction + listDomains for mailboxes |
| routes/ | 30 route files, all with auth + roleCheck middleware |

### Frontend (client/src/)

| File | What It Does |
|---|---|
| App.vue | Calls fetchUser on init for fresh data |
| router/index.js | ~64 routes + auth guards + 404 catch-all |
| stores/auth.js | Pinia: login, logout, fetchUser |
| api/client.js | Axios with token inject + auto-refresh + store sync |
| api/auth.js, users.js, roles.js, sessions.js, smtpServers.js, dashboard.js | Phase 1 API wrappers |
| api/mtaServers.js, domains.js, dataLists.js, smtpGroups.js | Phase 2 API wrappers |
| api/production.js, offers.js, suppressions.js, affiliateNetworks.js, autoResponders.js, virtualLists.js | Phase 3 API wrappers |
| api/gmailAccounts.js, gsuiteAccounts.js, outlookAccounts.js | Phase 3 API wrappers (email providers) |
| api/cloudAccounts.js, cloudInstances.js, registrarAccounts.js | Phase 4 API wrappers |
| api/proxies.js, postmasterAccounts.js | Phase 5 API wrappers |
| api/headers.js, dataProviders.js, isps.js, serverProviders.js, managementServers.js, mailboxes.js | Phase 6 API wrappers |
| layouts/DefaultLayout.vue | Sidebar + Header + content |
| layouts/AuthLayout.vue | Dark gradient login wrapper |
| components/common/DataTable.vue | Server-side paginated table with search, select, group actions |
| components/common/ConfirmDialog.vue | Reusable confirm modal |
| components/layout/Sidebar.vue | Navigation sidebar with 27 collapsible sections |
| components/layout/Header.vue | Top bar with user menu |
| views/auth/LoginView.vue | Login form |
| views/dashboard/DashboardView.vue | 12 stat cards + 4 chart placeholders |
| views/smtp-servers/* | List, Form, BulkCheck |
| views/mta-servers/* | List, Form (with SSH/OS/install config) |
| views/domains/* | List, Form |
| views/data-lists/* | List, Form |
| views/smtp-groups/* | List, Form (bulk create with newline names) |
| views/users/* | List, Form |
| views/roles/* | List, Form, RoleAffect, RoleUsers |
| views/sessions/SessionsView.vue | Session list with force disconnect |
| views/production/* | List, Form, SendProcessesView |
| views/offers/* | List, Form, SuppressionView |
| views/affiliate-networks/* | List, Form |
| views/auto-responders/* | List, Form |
| views/virtual-lists/* | List, Form |
| views/gmail/* | GmailAccountsList, GmailAccountForm |
| views/gsuite/* | GSuiteAccountsList, GSuiteAccountForm |
| views/outlook/* | OutlookAccountsList, OutlookAccountForm |
| views/cloud-accounts/* | CloudAccountsList, CloudAccountForm |
| views/cloud-instances/* | CloudInstancesList, CloudInstanceForm |
| views/registrar-accounts/* | RegistrarAccountsList, RegistrarAccountForm |
| views/proxies/* | ProxiesList, ProxyForm |
| views/postmaster-accounts/* | PostmasterAccountsList, PostmasterAccountForm |
| views/headers/* | HeadersList, HeaderForm |
| views/data-providers/* | DataProvidersList, DataProviderForm |
| views/isps/* | IspsList, IspForm |
| views/server-providers/* | ServerProvidersList, ServerProviderForm |
| views/management-servers/* | ManagementServersList, ManagementServerForm |
| views/mailboxes/* | MailboxesList, MailboxForm |

### Sidebar Sections (27 total)

1. Dashboard
2. Production
3. MTA Servers
4. SMTP Servers
5. SMTP Groups
6. Domains
7. Data Lists
8. Data Providers
9. Mailboxes
10. Offers
11. Virtual Lists
12. Auto Responders
13. Headers
14. Affiliate Networks
15. Gmail API
16. G Suite API
17. Outlook API
18. ISPs
19. Cloud APIs
20. Servers Providers
21. Management Servers
22. DNS Management
23. Proxies
24. Postmaster
25. Users
26. Application Roles
27. Sessions
7. Data Lists
8. Offers
9. Virtual Lists
10. Auto Responders
11. Affiliate Networks
12. Gmail API
13. G Suite API
14. Outlook API
15. **Cloud APIs** (Phase 4 — Cloud Accounts + Cloud Instances)
16. **DNS Management** (Phase 4 — Registrar Accounts)
17. **Proxies** (Phase 5 — Proxy management)
18. **Postmaster** (Phase 5 — Postmaster accounts)
19. Users
20. Application Roles
21. Sessions

### Verified Working

- Phase 1: Login/logout, JWT, RBAC, Users, Roles, Sessions, SMTP Servers
- Phase 2: MTA Servers (SSH check, install, configure IPs, RDNS, DKIM)
- Phase 2: Domains (CRUD, bulk actions, DNS records)
- Phase 2: Data Lists (CRUD, file upload with email counting)
- Phase 2: SMTP Groups (CRUD, bulk create from newline-separated names)
- Phase 3: Production (CRUD, send processes)
- Phase 3: Offers (CRUD, suppression lists)
- Phase 3: Affiliate Networks (CRUD)
- Phase 3: Auto Responders (CRUD, list associations)
- Phase 3: Virtual Lists (CRUD, filters)
- Phase 3: Gmail/GSuite/Outlook Accounts (CRUD)
- Phase 4: Cloud Accounts (CRUD, 11 providers via generic model)
- Phase 4: Cloud Instances (CRUD, dynamic instance types per provider)
- Phase 4: Registrar Accounts (CRUD, 6 registrars via generic model)
- Phase 5: Proxies (CRUD, HTTP/SOCKS5 types, bulk actions)
- Phase 5: Postmaster Accounts (CRUD, IMAP/SMTP config, bulk actions)
- Phase 6: Headers (CRUD, email header content management)
- Phase 6: Data Providers (CRUD, bulk add from newline-separated names)
- Phase 6: ISPs (CRUD, bulk add from newline-separated names)
- Phase 6: Server Providers (CRUD, bulk add from newline-separated names)
- Phase 6: Management Servers (CRUD, SSH config with user-pass/PEM)
- Phase 6: Mailboxes (CRUD, linked to domains with IMAP/SMTP config)
- All CRUD endpoints with pagination, search, sort, filtering
- Frontend builds clean (0 errors)

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

### Frontend
- **Vue 3 Composition API** (`<script setup>`)
- **Tailwind CSS** utility classes — NO Bootstrap, NO custom CSS files
- **Pinia** for state — NOT Vuex
- **Lazy-loaded routes** via `() => import(...)`
- **DataTable** component for all list views (server-side pagination)
- **ConfirmDialog** for all destructive actions — NO `window.confirm()`
- **Try/catch** on all async operations in `onMounted`

### Permission Sections (94 total)

Organized in groups: Dashboard, Users, Roles, Teams, SMTP (add/list/bulk-check/groups), MTA (servers/install/ips/etc), Domains, Production, Cloud Providers (AWS/Azure/DO/Hetzner/Linode/OVH/Scaleway/Vultr/Atlantic/IDCloud), Domain Registrars (Cloudflare/GoDaddy/Namecheap/Namecom/Dynadot/Spaceship), Gmail/GSuite/Outlook, Tools, Data Lists, Postmaster, ISPs, Headers, Data Providers, Mailboxes, Servers Providers, Management Servers, Proxies, Geo Manager, Sessions, Settings.

## What's Next: Phase 7

### Teams
- Team CRUD, authorizations, user-to-team assignment

### Geo Manager
- Geographic routing/distribution of data lists by country

### Settings
- Application settings

### Tools
- SPF checker, Blacklist check, Mailbox extractor, Value extractor

### Statistics
- Full revenue reports, advanced analytics

### PMTA
- PowerMTA config, VMTAs (global/individual/SMTP/route), templates, commands, scheduler

## Project Files

| File | Purpose |
|---|---|
| docker-compose.yml | MySQL 8 container (port 3307) |
| server/.env | DB URL, JWT secrets, CORS origin, port |
| server/prisma/schema.prisma | 32 database models |
| server/prisma/seed.js | Admin user + role with all permissions |
| vugex-v2.postman_collection.json | 28 API requests for Postman |
| ../vugex-full/PROJECT_PLAN.md | Full 14-phase plan (501 lines) |
