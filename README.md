# Vugex V2

**Email marketing infrastructure management platform.** Full lifecycle control — provision cloud servers, configure mail transfer agents, manage domains, email accounts, and send campaigns at scale.

---

## Quick Start

### Docker (Production)

```bash
# Clone and configure
cp .env.example .env
# Edit .env with your secrets (JWT_SECRET, passwords, etc.)

# Start all services
docker compose up -d --build

# Access
# Frontend:  http://localhost:81
# API:       http://localhost:3000
# Adminer:   http://localhost:8080
```

### Local Development

```bash
# 1. Start MySQL
docker compose up -d mysql

# 2. Backend
cd server
cp .env.example .env   # edit DATABASE_URL to localhost:3307
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev             # http://localhost:3000

# 3. Frontend (separate terminal)
cd client
npm install
npm run dev             # http://localhost:5173
```

**Default login:** `admin@app.com` / `password`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vue 3 (Composition API, `<script setup>`), Vite 8, Pinia 4, ECharts 6 |
| CSS | Tailwind CSS v4 (CSS-first config), OKLCH design tokens, Inter + JetBrains Mono |
| Backend | Node.js 20, Express 4, JWT auth (access + refresh tokens), RBAC roles |
| Database | MySQL 8, Prisma ORM 6.19.3, 53 data models, 14 performance indexes |
| Infrastructure | Docker Compose (4 services), Nginx (reverse proxy + SPA), Alpine images |

---

## Architecture

```
                          ┌──────────────────┐
                          │   Nginx :81      │
                          │ (SPA + proxy)    │
                          └────────┬─────────┘
                                   │
                ┌──────────────────┴──────────────────┐
                │ /api/*  →  Backend :3000             │
                │ /*      →  SPA fallback              │
                └──────────────────┬──────────────────┘
                                   │
                          ┌────────┴─────────┐
                          │  Express API      │
                          │  (JWT + RBAC)     │
                          └────────┬─────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                     │
    ┌─────────┴──────────┐  ┌─────┴──────┐   ┌─────────┴──────┐
    │  MySQL :3307       │  │  SSH/ICMP   │   │  Cloud APIs    │
    │  (Prisma ORM)      │  │  (MTA/Geo)  │   │  (OVH/Hetzner)│
    └────────────────────┘  └────────────┘   └────────────────┘
```

### Docker Services

| Service | Container | Port | Health Check |
|---------|-----------|------|-------------|
| MySQL | `vugex-mysql` | 3307→3306 | `mysqladmin ping` |
| Backend | `vugex-backend` | 3000 | `GET /api/health` |
| Frontend | `vugex-frontend` | 81→80 | Nginx alive |
| Adminer | `vugex-adminer` | 8080 | — |

---

## Project Structure

```
vugex-v2/
├── client/                         # Vue 3 frontend
│   ├── src/
│   │   ├── assets/                 # SVG illustrations (16 files)
│   │   ├── components/             # Shared components
│   │   │   ├── ui/                 # Base UI (BaseModal, BaseToast, ConfirmDialog, etc.)
│   │   │   ├── BaseModal.vue       # Slot-based reusable modal
│   │   │   ├── DataTable.vue       # Generic sortable table
│   │   │   ├── EditableText.vue    # Inline edit field
│   │   │   ├── NotificationBell.vue
│   │   │   ├── FileUpload.vue
│   │   │   └── StatusBadge.vue
│   │   ├── composables/            # Shared logic
│   │   │   ├── usePagination.js
│   │   │   ├── useNotification.js
│   │   │   ├── useConfirm.js
│   │   │   ├── useLoading.js
│   │   │   ├── useExport.js
│   │   │   └── useDebounce.js
│   │   ├── layouts/                # Page layout shells
│   │   │   ├── AuthLayout.vue      # Login/forgot-password pages
│   │   │   └── DashboardLayout.vue # Sidebar + header + content
│   │   ├── router/                 # Vue Router config
│   │   │   └── index.js           # 42 route modules, scroll behavior
│   │   ├── services/               # API layer
│   │   │   ├── api.js              # Axios interceptor, JWT injection
│   │   │   ├── authService.js      # Login, logout, refresh, forgot-password
│   │   │   ├── dashboardService.js
│   │   │   └── ...                 # 30+ service modules
│   │   ├── stores/                 # Pinia stores
│   │   │   ├── app.js              # Global state (sidebar, theme)
│   │   │   ├── auth.js             # JWT token management
│   │   │   └── toast.js            # Toast notification stack (max 5)
│   │   ├── views/                  # 126 page components
│   │   │   ├── Auth/               # Login, forgot-password
│   │   │   ├── Dashboard/          # Home stats + server cards
│   │   │   ├── Team/               # User + role management
│   │   │   ├── MtaServers/         # MTA server management (8 sub-pages)
│   │   │   ├── SmtpServers/        # SMTP server management
│   │   │   ├── Domains/            # Domain + DNS management
│   │   │   ├── Offers/             # Offer/campaign management
│   │   │   ├── Production/         # Send processes
│   │   │   ├── DataLists/          # Email list management
│   │   │   ├── PostmasterInbox/    # Abuse inbox monitoring
│   │   │   ├── Statistics/         # Analytics dashboards
│   │   │   └── ...                 # 30+ feature modules
│   │   ├── App.vue
│   │   └── main.js
│   ├── Dockerfile                  # Multi-stage: build + nginx:alpine
│   ├── nginx.conf                  # SPA fallback + API proxy
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                         # Express.js backend
│   ├── src/
│   │   ├── index.js                # Entry point (Express app init)
│   │   ├── app.js                  # Express app config
│   │   ├── routes/                 # 41 route modules
│   │   │   ├── index.js            # Router aggregator
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── mtaServers.js
│   │   │   ├── domains.js
│   │   │   ├── offers.js
│   │   │   ├── production.js
│   │   │   ├── smtpServers.js
│   │   │   ├── postmaster.js
│   │   │   └── ...                 # 33 more route modules
│   │   ├── controllers/            # Business logic
│   │   │   ├── authController.js   # Login, register, refresh, forgot-password
│   │   │   ├── userController.js   # User CRUD + role assignment
│   │   │   ├── mtaServerController.js  # MTA CRUD + SSH + bulk operations
│   │   │   ├── domainController.js # Domain CRUD + DNS management
│   │   │   ├── smtpServerController.js
│   │   │   ├── offerController.js
│   │   │   ├── productionController.js
│   │   │   ├── postmasterController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── cloudInstanceController.js
│   │   │   └── ...                 # 20+ more controllers
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT verification
│   │   │   ├── rbac.js            # Role-based access control
│   │   │   ├── validate.js        # Zod schema validation
│   │   │   └── error.js           # Centralized error handler
│   │   ├── utils/
│   │   │   ├── validation.js      # Email, password, port validation
│   │   │   ├── helpers.js         # Shared utilities
│   │   │   └── emailProviders/    # Provider-specific email utils
│   │   └── services/              # External integrations
│   │       ├── ovhCloud.js
│   │       ├── hetznerCloud.js
│   │       └── ...
│   ├── prisma/
│   │   ├── schema.prisma          # 53 models, 14 performance indexes
│   │   └── seed.js                # Database seeder
│   ├── Dockerfile                 # Node 20 Alpine
│   ├── package.json
│   └── package-lock.json
│
├── docker-compose.yml             # 4 services + volumes
├── .env.example                   # Environment template
├── SPECIFICATION.md               # Full application specification
└── README.md                      # This file
```

---

## Design System

### OKLCH Color Tokens

All colors use OKLCH for perceptual uniformity. No legacy Tailwind `gray-*` classes.

```css
/* Neutral palette */
--color-neutral-0: oklch(1.0 0 0);         /* White backgrounds */
--color-neutral-50: oklch(0.975 0 0);      /* Subtle backgrounds */
--color-neutral-100: oklch(0.945 0 0);     /* Borders */
--color-neutral-200: oklch(0.89 0 0);      /* Muted borders */
--color-neutral-400: oklch(0.615 0 0);     /* Muted text */
--color-neutral-600: oklch(0.44 0 0);      /* Secondary text */
--color-neutral-800: oklch(0.275 0 0);     /* Primary text */
--color-neutral-950: oklch(0.145 0 0);     /* Near-black */

/* Accent (indigo) */
--color-accent-400: oklch(0.68 0.15 265);  /* Light accent */
--color-accent-500: oklch(0.58 0.18 265);  /* Default accent */
--color-accent-600: oklch(0.50 0.18 265);  /* Hover accent */
--color-accent-700: oklch(0.44 0.18 265);  /* Active accent */

/* Status */
--color-success-500: oklch(0.65 0.19 155); /* Success green */
--color-warning-500: oklch(0.75 0.16 80);  /* Warning amber */
--color-danger-500: oklch(0.55 0.22 25);   /* Error red */
```

### Component Classes

| Class | Usage |
|-------|-------|
| `.card` | White rounded card with shadow |
| `.card-elevated` | Raised card for emphasis |
| `.btn-primary` | Indigo accent button |
| `.btn-secondary` | Neutral bordered button |
| `.btn-danger` | Red danger button |
| `.input-field` | Standard form input |
| `.select-field` | Standard select dropdown |
| `.status-*` | Status badges (success/warning/danger/info) |
| `.stat-card` | Dashboard stat card |
| `.table-header` | Table column headers |
| `.sidebar-item` / `.sidebar-item.active` | Navigation items |
| `.badge-*` | Count badges (primary/neutral/danger) |
| `.section-card` | Section grouping card |
| `.nav-card` | Clickable nav card |
| `.nav-card.active` | Active nav card |
| `.inline-edit` | Inline editing field |
| `.inline-edit-trigger` | Hover-to-edit trigger |
| `.inline-edit-actions` | Save/cancel buttons |

---

## Database

### Key Models (53 total)

| Category | Models |
|----------|--------|
| **Auth & Users** | User, Role, Session, Team |
| **Cloud Infrastructure** | CloudProvider, CloudAccount, CloudInstance, ElasticIp, ManagementServer |
| **Email Servers** | MtaServer, SmtpServer, MtaInstalledEmails |
| **Groups** | SmtpGroup |
| **Domains** | Domain, DomainRecord |
| **Email Accounts** | GmailAccount, GSuiteAccount, OutlookAccount, PostmasterAccount, Mailbox |
| **Campaigns** | Offer, Production, SendProcess |
| **Email Data** | DataList, DataItem, VirtualList, VirtualListProcess |
| **Content** | Header, Vertical |
| **Integrations** | ServerProvider, RegistrarAccount, AutoResponder, GeoManager |
| **Monitoring** | AuditLog, Log, Statistic, Session, Settings |
| **Providers** | Isp, DataProvider, AffiliateNetwork |
| **Tools** | Proxy, Tool |

### Performance Indexes (14)

Added via Prisma migration `20260720194251_add_indexes`:

- `Session`: userId + isActive + expiresAt (N+1 query pattern)
- `SmtpServer`: status + serverProviderId (dashboard stats)
- `MtaServer`: status + serverProviderId + installationStatus (bulk operations)
- `Domain`: status (dashboard stats)
- `DomainRecord`: domainId (DNS lookup)
- `DataList`: status (bulk operations)
- `Offer`: status (dashboard stats)
- `SendProcess`: productionId + offerId + status + createdAt (campaign queries)
- `AuditLog`: actionBy + recordType + actionTime (audit trail)
- `ElasticIp`: cloudInstanceId (IP lookup)

### Seeding

```bash
cd server
npx prisma db seed   # Creates admin@app.com / password + 4 roles + sample data
```

---

## API

### Base URL

- Development: `http://localhost:3000`
- Docker: `http://localhost:3000` (or via Nginx: `http://localhost:81/api`)

### Authentication

```
POST /api/auth/login         # Returns access + refresh tokens
POST /api/auth/refresh       # Refresh expired access token
POST /api/auth/logout        # Invalidate refresh token
POST /api/auth/forgot-password  # Send reset email
POST /api/auth/reset-password   # Set new password with token
GET  /api/auth/me            # Current user info (requires auth)
```

### Key Endpoints

| Module | Endpoints |
|--------|-----------|
| **Users** | `GET /api/users`, `POST`, `PUT /:id`, `DELETE /:id`, `POST /:id/assign-role` |
| **Teams** | `GET /api/teams`, `POST`, `PUT /:id`, `DELETE /:id` |
| **Roles** | `GET /api/roles`, `POST`, `PUT /:id`, `DELETE /:id` |
| **MTA Servers** | `GET /api/mta-servers`, `POST`, `PUT /:id`, `DELETE /:id`, `POST /:id/check`, `POST /bulk-check`, `POST /bulk-install` |
| **SMTP Servers** | `GET /api/smtp-servers`, `POST`, `PUT /:id`, `DELETE /:id`, `POST /:id/check`, `POST /bulk-check` |
| **SMTP Groups** | `GET /api/smtp-groups`, `POST`, `PUT /:id`, `DELETE /:id` |
| **Domains** | `GET /api/domains`, `POST`, `PUT /:id`, `DELETE /:id`, `POST /set-records`, `POST /set-multi-records` |
| **Offers** | `GET /api/offers`, `POST`, `PUT /:id`, `DELETE /:id` |
| **Production** | `GET /api/production`, `POST`, `PUT /:id`, `DELETE /:id` |
| **Send Processes** | `GET /api/send-processes`, `POST`, `PUT /:id`, `DELETE /:id`, `POST /:id/send`, `POST /:id/stop` |
| **Data Lists** | `GET /api/data-lists`, `POST`, `PUT /:id`, `DELETE /:id` |
| **Cloud Accounts** | `GET /api/cloud-accounts`, `POST`, `PUT /:id`, `DELETE /:id` |
| **Cloud Instances** | `GET /api/cloud-instances`, `POST`, `PUT /:id`, `DELETE /:id` |
| **Elastic IPs** | `GET /api/elastic-ips`, `POST`, `PUT /:id`, `DELETE /:id` |
| **Gmail Accounts** | `GET /api/gmail-accounts`, `POST`, `PUT /:id`, `DELETE /:id` |
| **Outlook Accounts** | `GET /api/outlook-accounts`, `POST`, `PUT /:id`, `DELETE /:id` |
| **Postmaster** | `GET /api/postmaster`, `POST`, `PUT /:id`, `DELETE /:id` |
| **Headers** | `GET /api/headers`, `POST`, `PUT /:id`, `DELETE /:id` |
| **Verticals** | `GET /api/verticals`, `POST`, `PUT /:id`, `DELETE /:id` |
| **Audit Logs** | `GET /api/audit-logs` |
| **Dashboard** | `GET /api/dashboard/stats`, `GET /api/dashboard/quick-stats` |
| **Statistics** | `GET /api/statistics`, `GET /api/statistics/servers` |

### Request Format

**Create/Update:**
```json
POST /api/users
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "ADMIN"
}
```

**Query Parameters:**
```
GET /api/mta-servers?page=1&limit=20&search=keyword&status=ACTIVE
```

### Response Format

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Error Format

```json
{
  "error": "Validation failed",
  "details": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

---

## RBAC Roles

| Role | Access |
|------|--------|
| **SUPER_ADMIN** | Full system access, user management, server provisioning |
| **ADMIN** | Manage servers, domains, campaigns, teams. Cannot manage users or delete servers |
| **MANAGER** | Manage offers, campaigns, data lists, view statistics |
| **VIEWER** | Read-only access to dashboard, statistics, and reports |

---

## Key Design Decisions

### N+1 Query Fixes

All bulk operations use `findMany` with `WHERE id IN (...)` instead of per-record queries:

```javascript
// Before (N+1)
for (const id of ids) {
  await prisma.smtpServer.findUnique({ where: { id } });
}

// After (batched)
await prisma.smtpServer.findMany({ where: { id: { in: ids } } });
```

### Input Validation

Server-side validation on all user-facing inputs:

```javascript
const { validateEmail, validatePassword, validatePort } = require('../utils/validation');

// Email format validation
validateEmail(email);  // Throws if invalid

// Password strength (8+ chars, upper, lower, number)
validatePassword(password);  // Throws if weak

// Port range check
validatePort(port);  // Throws if outside 1-65535
```

### JWT Auth Flow

```
Login → { accessToken (15min), refreshToken (7d) }
        ↓
Request with Authorization: Bearer <accessToken>
        ↓
401 Unauthorized → POST /api/auth/refresh → New accessToken
        ↓
Logout → Invalidate refreshToken server-side
```

---

## Environment Variables

```bash
# Required
PORT=3000
DATABASE_URL="mysql://root:password@mysql:3306/vugex_v2"
JWT_SECRET="<random-32-hex-chars>"
JWT_REFRESH_SECRET="<random-32-hex-chars>"

# Optional
JWT_EXPIRES_IN="15m"           # Access token lifetime
JWT_REFRESH_EXPIRES_IN="7d"    # Refresh token lifetime
CORS_ORIGIN="http://localhost"  # CORS allowed origin
NODE_ENV=production
```

Generate secrets:
```bash
openssl rand -hex 32
```

---

## Troubleshooting

### Docker build fails with IPv6 error

```bash
# Disable Docker IPv6
echo '{"ipv6": false}' | sudo tee /etc/docker/daemon.json
sudo systemctl restart docker
```

### Frontend container unhealthy

The Nginx healthcheck uses `127.0.0.1` (not `localhost`) to avoid IPv6 resolution issues.

### Backend cannot connect to MySQL

Wait for MySQL health check to pass:
```bash
docker compose ps   # Check "healthy" status
docker compose logs backend  # Check for connection errors
```

### Prisma migration fails

```bash
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed
```

---

## License

Proprietary. All rights reserved.
