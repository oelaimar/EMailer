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

### Models (7 total)

| Model | Purpose |
|---|---|
| User | Users with email, password, status, superUserStatus |
| Role | Named roles with JSON permissions (94 sections x read/write/delete) |
| UserRole | Many-to-many join (user <-> role) with cascade delete |
| Session | JWT sessions with token, refreshToken, isActive, expiresAt |
| SmtpServer | SMTP servers with host, port, encryption, proxy support |
| ServerProvider | Server provider names (stub) |

## API Style

**REST** (GET/POST/PUT/DELETE) — NOT single-endpoint /api.json.

All protected routes use `Authorization: Bearer <token>` header.
All routes have `roleCheck(section, action)` middleware for RBAC.

## Current State — Phase 2 COMPLETE

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
| routes/ | 10 route files, all with auth + roleCheck middleware |

### Frontend (client/src/)

| File | What It Does |
|---|---|
| App.vue | Calls fetchUser on init for fresh data |
| router/index.js | 28 routes + auth guards + 404 catch-all |
| stores/auth.js | Pinia: login, logout, fetchUser |
| api/client.js | Axios with token inject + auto-refresh + store sync |
| api/auth.js, users.js, roles.js, sessions.js, smtpServers.js, dashboard.js | Phase 1 API wrappers |
| api/mtaServers.js, domains.js, dataLists.js, smtpGroups.js | Phase 2 API wrappers |
| layouts/DefaultLayout.vue | Sidebar + Header + content |
| layouts/AuthLayout.vue | Dark gradient login wrapper |
| components/common/DataTable.vue | Server-side paginated table with search, select, group actions |
| components/common/ConfirmDialog.vue | Reusable confirm modal |
| components/layout/Sidebar.vue | Navigation sidebar with 9 collapsible sections |
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

### Database Models (13 total)

| Model | Purpose |
|---|---|
| User | Users with email, password, status, superUserStatus |
| Role | Named roles with JSON permissions (94 sections) |
| UserRole | Many-to-many join (user <-> role) |
| Session | JWT sessions with token, refreshToken, isActive |
| SmtpServer | SMTP servers with host, port, encryption, proxy |
| ServerProvider | Server provider names (stub) |
| MtaServer | MTA servers with SSH config, OS, IPs, installation status |
| Domain | Domains with status, flags, availability, brand |
| DomainRecord | DNS records (A, MX, TXT, etc.) linked to domains |
| DataList | Email data lists with vertical, ISP, country |
| SmtpGroup | SMTP groups with encryption, bulk create |
| Proxy | HTTP/SOCKS proxy servers |

### Verified Working

- Phase 1: Login/logout, JWT, RBAC, Users, Roles, Sessions, SMTP Servers
- Phase 2: MTA Servers (SSH check, install, configure IPs, RDNS, DKIM)
- Phase 2: Domains (CRUD, bulk actions, DNS records)
- Phase 2: Data Lists (CRUD, file upload with email counting)
- Phase 2: SMTP Groups (CRUD, bulk create from newline-separated names)
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

Organized in groups: Dashboard, Users, Roles, Teams, SMTP (add/list/bulk-check/groups), MTA (servers/install/ips/etc), Domains, Production, Cloud Providers (AWS/Azure/DO/Hetzner/Linode/OVH/Scaleway/Vultr/Atlantic/IDCloud), Domain Registrars (Cloudflare/GoDaddy/Namecheap/Namecom/Dynadot/Spaceship), Gmail/GSuite/Outlook, Tools, Data Lists, Postmaster, Geo Manager, Sessions, Settings.

## What's Next: Phase 3

### Production (Send Campaigns)
- Send process page, MTA drops monitor, SMTP drops monitor
- Virtual lists builder + processes
- Auto responders setup
- Offer management, creative handling
- Suppression list management

### Gmail API
- Account management, send via Gmail API
- Gmail drops/tests monitors

### G Suite API
- Account management, send via Google Workspace
- GSuite drops/tests monitors

### Outlook API
- Account management, send via Outlook
- Outlook drops/tests monitors

### New Prisma Models Needed
- Production, SendProcess, VirtualList, Offer, AffiliateNetwork, Creative

### New Backend Files Needed
- controllers/productionController.js, gmailController.js, gsuiteController.js, outlookController.js
- routes/production.js, gmail.js, gsuite.js, outlook.js

### New Frontend Files Needed
- views/production/*, views/gmail/*, views/gsuite/*, views/outlook/*

## Project Files

| File | Purpose |
|---|---|
| docker-compose.yml | MySQL 8 container (port 3307) |
| server/.env | DB URL, JWT secrets, CORS origin, port |
| server/prisma/schema.prisma | 13 database models |
| server/prisma/seed.js | Admin user + role with all permissions |
| vugex-v2.postman_collection.json | 22 API requests for Postman |
| ../vugex-full/PROJECT_PLAN.md | Full 14-phase plan (501 lines) |
