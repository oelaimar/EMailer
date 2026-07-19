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
- **Latest migration:** `20260719182527_extend_geo_manager`

## API Style

**REST** (GET/POST/PUT/DELETE) — NOT single-endpoint /api.json.

All protected routes use `Authorization: Bearer <token>` header.
All routes have `roleCheck(section, action)` middleware for RBAC.

## Current State — ALL PHASES COMPLETE (full legacy parity achieved)

### Database Models (49 total)

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
| Header | Email headers with name + header (Text) |
| Isp | ISP names |
| Mailbox | Mailboxes linked to domains with IMAP/SMTP config |
| ManagementServer | Management servers with SSH config (user-pass or PEM) |
| SmtpGroup | SMTP groups with encryption, bulk create |
| CustomVmta | Custom VMTAs linked to SMTP groups (name, ip, port) |
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
| CloudAccount | Cloud provider accounts (generic: provider field for 11 providers) |
| CloudInstance | Cloud instances (generic: provider field, dynamic instance types) |
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
| AuditLog | Audit trail for all CRUD operations |
| Setting | Application settings (key-value) |
| Vertical | Vertical/niche categories |

### Backend (server/src/)

| File | What It Does |
|---|---|
| index.js | Express entry: helmet, cors, morgan, routes, 404 handler, error handler |
| config/database.js | PrismaClient singleton + graceful shutdown |
| middleware/auth.js | JWT verification, session lookup, excludes password from user query |
| middleware/roleCheck.js | RBAC: checks role.permissions[section][action] |
| middleware/errorHandler.js | P2002/P2003/P2025 handling, production-safe errors |
| utils/helpers.js | paginate(), buildSearch(), buildSort() |
| services/sshService.js | SSH remote execution (checkServer, executeCommand, getServerIps, getServerInfo, configureAdditionalIps, executeServersCommand) |
| services/imapService.js | IMAP connection via imapflow + mailparser (testConnection, fetchMessageSummaries, fetchMessageDetail, deleteMessage) |
| services/geoDbService.js | MySQL pool + cross-schema queries (getSchemas, getTables, getGeoSummary, moveRows) |
| services/geoJobRunner.js | In-memory background job manager (startJob, stopJob, graceful stop) |
| controllers/authController.js | login, logout, refresh, me (with merged permissions) |
| controllers/userController.js | CRUD, no superUserStatus on create |
| controllers/roleController.js | CRUD + affectRoleToUsers + affectRolesToUser (transactions) |
| controllers/smtpServerController.js | CRUD + check + bulkCheck + bulkAction, passwords hidden |
| controllers/sessionsController.js | list + forceDisconnect |
| controllers/dashboardController.js | Real stats from DB (activeIPs parsed from string, daily/monthly stats from SendProcess) + real 7-day chart data with earnings from Offer payouts |
| controllers/mtaServerController.js | CRUD + check + bulkCheck + bulkAction + install + configureIps + extractRdns + generateDkim + bulkAdd + getServerInfo + configureAdditionalIps + executeServersCommand + bulkInstall (SSH wired) + getBulkInstallationLogs (SSH wired) |
| controllers/domainController.js | CRUD + bulkAction + getRecords + setRecords + listBrands + createBrand + deleteBrand + listSubdomains + createSubdomain + deleteSubdomain |
| controllers/dataListController.js | CRUD + upload (multer) + bulkAction + listBlacklists + createBlacklist + deleteBlacklist + downloadList + fetchEmails (implemented:false) |
| controllers/smtpGroupController.js | CRUD + bulkAction + bulk create + listCustomVmtas + addCustomVmta + deleteCustomVmta |
| controllers/productionController.js | CRUD + bulkAction + addProcess + processAction + listMtaDrops + listMtaTests + listSmtpDrops + listSmtpTests + uploadImages |
| controllers/offerController.js | CRUD + bulkAction + suppression list management |
| controllers/suppressionController.js | CRUD + bulkAction + upload for suppression lists |
| controllers/affiliateNetworkController.js | CRUD + bulkAction for affiliate networks |
| controllers/autoResponderController.js | CRUD + bulkAction + addList for auto responders |
| controllers/virtualListController.js | CRUD + bulkAction for virtual lists |
| controllers/gmailAccountController.js | CRUD + bulkAction + sendProcessData + listDrops + listTests |
| controllers/gSuiteAccountController.js | CRUD + bulkAction + sendProcessData + listDrops + listTests |
| controllers/outlookAccountController.js | CRUD + bulkAction + sendProcessData + listDrops + listTests |
| controllers/cloudAccountController.js | CRUD + bulkAction + listByProvider for cloud accounts |
| controllers/cloudInstanceController.js | CRUD + bulkAction for cloud instances |
| controllers/registrarAccountController.js | CRUD + bulkAction + listByRegistrar for registrar accounts |
| controllers/proxyController.js | CRUD + bulkAction + listByType for proxy servers |
| controllers/postmasterAccountController.js | CRUD + bulkAction for postmaster accounts |
| controllers/postmasterController.js | 9 endpoints: getSources, getMessages, refreshMailbox, getMessageDetail, deleteMessages, exportReplyAccounts, getRuns, getRunLogs, testConnection |
| controllers/headerController.js | CRUD + bulkAction for email headers |
| controllers/dataProviderController.js | CRUD + bulkAdd + bulkAction for data providers |
| controllers/ispController.js | CRUD + bulkAdd + bulkAction for ISPs |
| controllers/serverProviderController.js | CRUD + bulkAdd + bulkAction for server providers |
| controllers/managementServerController.js | CRUD + bulkAction for management servers (SSH config) |
| controllers/mailboxController.js | CRUD + bulkAction + listDomains for mailboxes |
| controllers/logController.js | Backend logs (read /var/log/syslog, mail.log, auth.log) + Frontend logs (CRUD from DB) |
| controllers/pmtaController.js | Commands CRUD + Schedules CRUD + Templates CRUD + VMTAs (4 types) + Configs read/update + History |
| controllers/geoManagerController.js | CRUD + start/stop (fully implemented with background jobs) + logs + bulkAction + getSourceTables + getSchemas + getGeoSummary |
| controllers/statisticsController.js | Full report (paginated) + Advanced report (aggregated by status/MTA/offer) |
| controllers/toolController.js | SPF check, Blacklist check (DNSBL for IPs, implemented:false for domains), Value extractor, Mailbox extractor (implemented:false) |
| controllers/auditLogController.js | logAction() helper + list + bulkDelete |
| controllers/teamController.js | CRUD + listUsers + addUser + removeUser + listAuthorizations + updateAuthorizations |
| controllers/verticalController.js | CRUD + bulkAction |
| controllers/settingController.js | get + update (key-value pairs) |
| routes/ | 39 route files, all with auth + roleCheck middleware |

### Frontend (client/src/)

| File | What It Does |
|---|---|
| App.vue | Calls fetchUser on init for fresh data |
| router/index.js | ~90 routes + auth guards + 404 catch-all |
| stores/auth.js | Pinia: login, logout, fetchUser |
| api/client.js | Axios with token inject + auto-refresh + store sync |
| api/ | 43 API wrapper files covering all endpoints |
| layouts/DefaultLayout.vue | Sidebar + Header + content |
| layouts/AuthLayout.vue | Dark gradient login wrapper |
| components/common/DataTable.vue | Server-side paginated table with search, select, group actions |
| components/common/ConfirmDialog.vue | Reusable confirm modal |
| components/layout/Sidebar.vue | Navigation sidebar with 30 collapsible sections |
| components/layout/Header.vue | Top bar with user menu |

### Frontend Views (116 files across 40 directories)

| Directory | Files | Key Views |
|---|---|---|
| affiliate-networks/ | 2 | List, Form |
| audit-logs/ | 1 | List (read-only, bulk delete) |
| auth/ | 1 | LoginView |
| auto-responders/ | 2 | List, Form |
| cloud-accounts/ | 2 | List, Form (11 providers) |
| cloud-instances/ | 2 | List, Form |
| dashboard/ | 1 | 12 real stat cards + 4 Chart.js charts (bar, doughnut, earnings) |
| data-lists/ | 5 | List, Form, Blacklists, Download, EmailsFetch |
| data-providers/ | 2 | List, Form |
| domains/ | 4 | List, Form, Brands, Subdomains |
| geo-manager/ | 4 | Processes, Form, Logs, Preview |
| gmail/ | 5 | List, Form, SendProcess, Drops, Tests |
| gsuite/ | 5 | List, Form, SendProcess, Drops, Tests |
| headers/ | 2 | List, Form |
| isps/ | 2 | List, Form |
| logs/ | 2 | BackendLogs, FrontendLogs |
| mailboxes/ | 2 | List, Form |
| management-servers/ | 2 | List, Form |
| mta-servers/ | 8 | List, Form, MultiAdd, InstallWizard, BulkInstall, AdditionalIps, ServerActions, VmtasList |
| offers/ | 3 | List, Form, SuppressionView |
| outlook/ | 5 | List, Form, SendProcess, Drops, Tests |
| pmta/ | 7 | Commands, Scheduler, Templates, TemplateForm, Vmtas, Configs, History |
| postmaster-accounts/ | 2 | List, Form |
| postmaster/ | 2 | Inbox, Runs |
| production/ | 8 | List, Form, SendProcessesView, MtaDrops, MtaTests, SmtpDrops, SmtpTests, UploadImages |
| proxies/ | 2 | List, Form |
| registrar-accounts/ | 2 | List, Form |
| roles/ | 4 | List, Form (304 lines), RoleAffect, RoleUsers |
| server-providers/ | 2 | List, Form |
| sessions/ | 1 | Session list with force disconnect |
| settings/ | 1 | Full settings form (40+ fields) |
| smtp-groups/ | 4 | List, Form, SendProcess (with group dropdown), CustomVmtas (with group dropdown) |
| smtp-servers/ | 3 | List, Form, BulkCheck |
| statistics/ | 2 | FullReport, AdvancedReport |
| teams/ | 4 | List, Form, TeamUsers, TeamAuthorisations |
| tools/ | 4 | SpfLookup, BlacklistCheck, ValueExtractor, MailboxExtractor |
| users/ | 2 | List, Form |
| verticals/ | 2 | List, Form |
| virtual-lists/ | 2 | List, Form |

### Sidebar Sections (30 total)

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

### Verified Working

- **Phase 1:** Login/logout, JWT, RBAC, Users, Roles, Sessions, SMTP Servers
- **Phase 2:** MTA Servers (SSH check, install, configure IPs, RDNS, DKIM, multi-add, bulk install, server actions, VMTAs)
- **Phase 2:** Domains (CRUD, bulk actions, DNS records, brands, subdomains)
- **Phase 2:** Data Lists (CRUD, file upload with email counting, blacklists, download, emails fetch)
- **Phase 2:** SMTP Groups (CRUD, bulk create, send process, custom VMTAs)
- **Phase 3:** Production (CRUD, send processes, MTA/SMTP drops/tests, upload images)
- **Phase 3:** Offers (CRUD, suppression lists)
- **Phase 3:** Affiliate Networks (CRUD)
- **Phase 3:** Auto Responders (CRUD, list associations)
- **Phase 3:** Virtual Lists (CRUD, filters)
- **Phase 3:** Gmail/GSuite/Outlook Accounts (CRUD + send process + drops + tests)
- **Phase 4:** Cloud Accounts (CRUD, 11 providers via generic model)
- **Phase 4:** Cloud Instances (CRUD, dynamic instance types per provider)
- **Phase 4:** Registrar Accounts (CRUD, 6 registrars via generic model)
- **Phase 5:** Proxies (CRUD, HTTP/SOCKS5 types, bulk actions)
- **Phase 5:** Postmaster Accounts (CRUD, IMAP/SMTP config, bulk actions)
- **Phase 6:** Headers (CRUD, email header content management)
- **Phase 6:** Data Providers (CRUD, bulk add from newline-separated names)
- **Phase 6:** ISPs (CRUD, bulk add from newline-separated names)
- **Phase 6:** Server Providers (CRUD, bulk add from newline-separated names)
- **Phase 6:** Management Servers (CRUD, SSH config with user-pass/PEM)
- **Phase 6:** Mailboxes (CRUD, linked to domains with IMAP/SMTP config)
- **Phase 7:** Teams (CRUD, user assignment, per-user authorizations with full UI)
- **Phase 7:** Verticals (CRUD with bulk actions)
- **Phase 7:** Settings (Full application settings form)
- **Phase 7:** Tools (SPF Lookup, Blacklist Check, Value Extractor, Mailbox Extractor)
- **Phase 7:** Statistics (Full Report with date filters, Advanced Report with aggregation)
- **Phase 7:** PMTA (Commands, Scheduler, Templates, VMTAs with 4 types, Configs, History)
- **Phase 7:** Geo Manager (Process CRUD, logs viewer, schema/table discovery, geo summary, background job start/stop, preview page, progress tracking)
- **Phase 7:** Audit Logs (read-only list with bulk delete, logAction in all controllers)
- **Phase 9:** All sub-pages created (26 new views across 7 batches)
- **Phase 10:** All crash bugs fixed (5) and stubs completed (8)
- **Phase 11:** Dashboard charts (Chart.js + vue-chartjs, 4 real charts)
- **Phase 11:** Postmaster monitoring (IMAP inbox, message viewer, reply accounts export, runs history, connection testing)
- **Phase 11:** Gmail/GSuite/Outlook Drops Pause/Stop actions
- **Phase 11:** Geo Manager full implementation (schema discovery, table selection, geo summary preview, background job runner with graceful stop)
- **Routing fixes:** SMTP group send-process/custom-vmtas use dropdown selectors, PMTA back links fixed

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
- **Implemented features** return real DB data
- **Not-yet-implemented features** return `{ implemented: false, message: '...' }` — NOT fake status toggles

### Frontend
- **Vue 3 Composition API** (`<script setup>`)
- **Tailwind CSS** utility classes — NO Bootstrap, NO custom CSS files
- **Pinia** for state — NOT Vuex
- **Lazy-loaded routes** via `() => import(...)`
- **DataTable** component for all list views (server-side pagination)
- **ConfirmDialog** for all destructive actions — NO `window.confirm()`
- **Try/catch** on all async operations in `onMounted`
- **API wrappers** used consistently (no direct `client.get/post` in views)

### Permission Sections (94 total)

Organized in groups: Dashboard, Users, Roles, Teams, SMTP (add/list/bulk-check/groups), MTA (servers/install/ips/etc), Domains, Production, Cloud Providers (AWS/Azure/DO/Hetzner/Linode/OVH/Scaleway/Vultr/Atlantic/IDCloud), Domain Registrars (Cloudflare/GoDaddy/Namecheap/Namecom/Dynadot/Spaceship), Gmail/GSuite/Outlook, Tools, Data Lists, Postmaster, ISPs, Headers, Data Providers, Mailboxes, Servers Providers, Management Servers, Proxies, Geo Manager, Sessions, Settings.

## Known Remaining Gaps

None — all legacy features have been rebuilt.

## Project Files

| File | Purpose |
|---|---|
| docker-compose.yml | MySQL 8 container (port 3307) |
| server/.env | DB URL, JWT secrets, CORS origin, port |
| server/prisma/schema.prisma | 49 database models |
| server/prisma/seed.js | Admin user + role with all permissions |
| SPECIFICATION.md | Full application specification |
| vugex-v2.postman_collection.json | 28 API requests for Postman |
| ../vugex-full/PROJECT_PLAN.md | Full 14-phase plan (501 lines) |
