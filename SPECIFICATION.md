# Vugex V2 — Application Specification

## What Is Vugex?

Vugex is an **email marketing infrastructure management platform**. It manages the full lifecycle of email marketing — from provisioning servers and configuring mail servers, to managing email lists, domains, and sending campaigns. Think of it as a control center for running large-scale email operations.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     VUGEX V2 PLATFORM                       │
├──────────────┬──────────────────┬───────────────────────────┤
│   FRONTEND   │     BACKEND      │       DATABASE            │
│  Vue 3 + Vite│  Node.js + Express│    MySQL 8 + Prisma      │
│  Port 5173   │  Port 3000       │    Port 3307              │
└──────────────┴──────────────────┴───────────────────────────┘
         │               │                     │
         │               │                     │
    Browser UI     REST API            42 data models
    (login +       (JWT auth,          (servers, domains,
     dashboard)     RBAC roles)         emails, etc.)
```

---

## How to Start

```bash
# 1. Start MySQL database
docker compose up -d

# 2. Start the backend API server
cd server && npm run dev

# 3. Start the frontend (in a separate terminal)
cd client && npm run dev

# 4. Open browser to http://localhost:5173
# Login: admin@app.com / password
```

---

## Main Features (35 sections, 34 admin modules)

### 1. Dashboard (Home Page)
**What it shows:** Overview statistics of your entire infrastructure.

- Active SMTP servers count
- Total MTA servers count
- Active offers count
- Total IPs, domains, mailboxes, data lists, users

**How to use:** Just open the app — it's the first thing you see. Use it to get a quick status overview.

---

### 2. Production (Email Campaigns)
**What it does:** Create and manage email sending campaigns.

**Key features:**
- **Campaign list** — See all campaigns with status, offer, server, and dates
- **Create campaign** — Link an offer to MTA/SMTP servers, set sending parameters
- **Send processes** — Monitor individual send jobs within a campaign

**How to use:**
1. Go to Production → Add Production
2. Select an offer and the servers to send through
3. Configure sending parameters (speed, threads, etc.)
4. Save and monitor the send processes

---

### 3. MTA Servers (Mail Transfer Agent)
**What it does:** Manage mail servers that actually send emails. This is the backbone of the platform.

**Sub-features (8 pages):**
| Page | What It Does |
|---|---|
| **Server List** | View all MTA servers with status, OS, IP, install status |
| **Add Server** | Add a single server with SSH credentials |
| **Multi-Add** | Bulk add servers by entering a prefix name + list of IPs |
| **Install Wizard** | 3-step wizard: select server → configure options → monitor installation logs |
| **Bulk Install** | Install on multiple servers at once with per-server domain/IP mapping |
| **Configure IPs** | Add additional IPs to a server via SSH |
| **Server Actions** | Execute commands on servers: reboot, get info, clear logs, restart Apache |
| **VMTAs List** | View Virtual MTAs configured on servers |

**Install Wizard Steps:**
1. Select which server to install on
2. Choose options: Install services, firewall, DKIM, DMARC, tracking, PowerMTA, etc.
3. Map domains to IPs (auto-generate random mapping or manual)
4. Click "Start Installation" — watch real-time logs as the server is configured via SSH

**Server Actions Available:**
- Get server info (OS, memory, disk)
- Get all IPs on a server
- Reboot the server
- Refresh RAM/cache
- Clear logs
- Start/Stop/Restart Apache

**How to use:**
1. Add your servers first (single or multi-add with IP list)
2. Run the Install Wizard on each server to set up mail infrastructure
3. Use Server Actions for ongoing maintenance

---

### 4. SMTP Servers
**What it does:** Manage SMTP servers used for sending.

**Key features:**
- CRUD for SMTP servers (host, port, encryption, username/password)
- **Bulk Check** — Test connectivity to multiple SMTP servers at once
- Proxy support per server

**How to use:**
1. Add SMTP servers with connection details
2. Use Bulk Check to verify they're all working
3. These servers are then available when creating campaigns

---

### 5. SMTP Groups
**What it does:** Group SMTP servers for easier campaign management.

**Key features:**
- Create groups with bulk-add (paste server names, one per line)
- Assign SMTP servers to groups
- Groups appear as options when setting up campaigns

---

### 6. Domains
**What it does:** Manage domains used for email sending (sender addresses, tracking).

**Key features:**
- Domain CRUD with status (activated/inactivated)
- DNS records management (A, MX, TXT, CNAME, etc.)
- Brand association
- Subdomain management

---

### 7. Data Lists
**What it does:** Manage email recipient lists.

**Key features:**
- Upload CSV/TXT files of email addresses
- Automatic email counting on upload
- Link to verticals and ISPs
- Country targeting
- Blacklist management

---

### 8. Data Providers
**What it does:** Manage external data sources that provide email lists.

---

### 9. Mailboxes
**What it does:** Manage email mailboxes linked to domains.

**Key features:**
- IMAP/SMTP configuration per mailbox
- Link to domains
- Used for inbox monitoring and reply handling

---

### 10. Offers
**What it does:** Manage affiliate offers (products/services being promoted).

**Key features:**
- Offer CRUD with payout, cap, and vertical
- **Suppression lists** — Manage lists of emails that should NOT receive an offer
- Upload suppression files

---

### 11. Virtual Lists
**What it does:** Create dynamic email lists using filters instead of static uploads.

**Key features:**
- Define filter rules (by country, ISP, domain, etc.)
- Lists update automatically as new data comes in

---

### 12. Auto Responders
**What it does:** Set up automatic email reply sequences.

---

### 13. Headers
**What it does:** Manage email headers (From, Subject, etc.) used in campaigns.

**Key features:**
- Store reusable header templates
- Link headers to campaigns

---

### 14. Affiliate Networks
**What it does:** Manage affiliate networks and postback configurations.

---

### 15. Gmail API / G Suite API / Outlook API
**What it does:** Manage email accounts from Gmail, Google Workspace, and Outlook for API-based sending.

**Key features:**
- OAuth token management
- Account CRUD
- Status monitoring

---

### 16. ISPs (Internet Service Providers)
**What it does:** Manage ISP entries used for filtering and targeting email lists.

---

### 17. Cloud APIs (Cloud Providers)
**What it does:** Manage cloud provider accounts for provisioning servers.

**Supported providers:** AWS, Azure, Google Cloud, DigitalOcean, Hetzner, Linode, OVH, Scaleway, Vultr, Atlantic, IDCloudHost

**Key features:**
- **Cloud Accounts** — API credentials for each provider
- **Cloud Instances** — Provision and manage VMs across providers

---

### 18. Servers Providers
**What it does:** Manage server hosting providers (names and status).

---

### 19. Management Servers
**What it does:** Manage management servers (jump boxes) with SSH access.

---

### 20. DNS Management (Registrar Accounts)
**What it does:** Manage domain registrar accounts for DNS management.

**Supported registrars:** Cloudflare, GoDaddy, Namecheap, Name.com, Dynadot, Spaceship

---

### 21. Proxies
**What it does:** Manage HTTP and SOCKS5 proxy servers.

**Key features:**
- Install proxies on MTA servers
- HTTP and SOCKS5 proxy types
- Proxy username/password
- Bulk copy proxy lists

---

### 22. Postmaster
**What it does:** Monitor ISP inbox placement via postmaster accounts.

**Key features:**
- IMAP/SMTP accounts for ISP portals
- Inbox monitoring runs

---

### 23. Users
**What it does:** Manage platform user accounts.

**Key features:**
- User CRUD with email, password, status
- Super user toggle
- Role assignment
- Team assignment

---

### 24. Application Roles
**What it does:** Define roles with granular permissions.

**Key features:**
- 94 permission sections × 3 actions (read/write/delete) = 282 permission toggles
- Assign roles to users
- Bulk affect roles to multiple users

---

### 25. Teams
**What it does:** Group users into teams with shared configurations.

**Key features:**
- Team CRUD
- User-to-team assignment
- **Authorizations** — Per-team access to MTA servers, SMTP servers, offers, and data lists (checkbox UI with search)
- **Team ISPs** — ISPs assigned to each team (loaded dynamically from database)

---

### 26. Verticals
**What it does:** Manage business verticals/categories for offers and data lists.

---

### 27. Settings
**What it does:** Application-wide configuration.

**8 settings tabs:**
| Tab | Settings |
|---|---|
| General | Company name, logo, timezone, language |
| Application | App name, maintenance mode, debug mode |
| Integrations | Third-party API keys |
| Image Hosting | Image upload/storage configuration |
| Notifications | Email notification settings |
| Production | Default campaign settings, send speeds |
| PMTA | PowerMTA connection settings |
| Firewall | IP whitelisting, rate limiting |

---

### 28. Tools
**What it does:** Utility tools for email infrastructure management.

| Tool | What It Does |
|---|---|
| **SPF Lookup** | Check SPF records for a domain (enter domain, see all authorized senders) |
| **Blacklist Check** | Check if an IP is on DNS blacklists (DNSBL lookup) |
| **Value Extractor** | Extract IPs, emails, or senders from pasted text |
| **Mailbox Extractor** | Extract mailbox credentials (email|password) from text |

---

### 29. Statistics
**What it does:** Reports and analytics.

| Report | What It Shows |
|---|---|
| **Full Report** | Paginated list of all send data with date filtering, status breakdown |
| **Advanced Report** | Aggregated stats: totals by status, by MTA server, by offer, delivery rates |

---

### 30. PMTA (PowerMTA)
**What it does:** Manage PowerMTA email sending software.

| Feature | What It Does |
|---|---|
| **Commands** | Execute PMTA commands (reload config, show stats, etc.) |
| **Scheduler** | Schedule recurring PMTA operations |
| **Templates** | Create/edit PMTA configuration templates |
| **VMTAs** | 4-tab view: Global VMTAs, Individual VMTAs, SMTP VMTAs, Route VMTAs |

---

### 31. Geo Manager
**What it does:** Manage geographic routing/distribution of data lists by country.

**Key features:**
- Create geo routing processes
- Start/stop processes
- View logs of routing activity

---

### 32. Audit Logs
**What it does:** Track all CRUD operations across the platform.

**Key features:**
- Read-only list of all changes (who did what, when)
- Shows: user email, model affected, action type, record ID, timestamp
- Bulk delete old logs

---

### 33. Sessions
**What it does:** View and manage active user sessions.

**Key features:**
- See who's logged in
- Force disconnect users

---

## Key Workflows

### Workflow 1: Setting Up a New Server
1. Go to **MTA Servers → Multi-Add** → Enter prefix name + paste IP list → Create
2. Go to **MTA Servers → Install Wizard** → Select server → Configure options (DKIM, firewall, PMTA) → Map domains to IPs → Start Installation
3. Monitor installation logs in real-time
4. Once done, server status changes to "Installed"

### Workflow 2: Sending an Email Campaign
1. Ensure you have: servers installed, SMTP servers configured, domains with DNS records, data lists uploaded, offers created
2. Go to **Production → Add Production** → Select offer + servers → Configure
3. Go to **Production → Send Processes** → Monitor sends

### Workflow 3: Managing Server Infrastructure
1. **Cloud APIs → Cloud Accounts** — Add your AWS/DigitalOcean/etc credentials
2. **Cloud APIs → Cloud Instances** — Provision new VMs
3. **MTA Servers → Add** — Register the new server IP
4. **MTA Servers → Install Wizard** — Install mail infrastructure
5. **Proxies → Install** — Set up proxies on servers

### Workflow 4: Managing Email Lists
1. **Data Lists → Upload** — Upload CSV of emails
2. **ISPs** — Tag lists with ISP information
3. **Verticals** — Categorize lists
4. **Virtual Lists** — Create dynamic filtered lists
5. **Offers** — Link lists to offers, manage suppressions

---

## Permission System

The platform has **94 permission sections** with 3 actions each (read, write, delete). When you create a role, you toggle permissions for each section:

| Category | Sections |
|---|---|
| Core | Dashboard, Users, Roles, Teams, Sessions, Settings, Audit Logs |
| Sending | Production, MTA Servers, MTA Install, MTA IPs, SMTP Servers, SMTP Groups |
| Domains | Domains, Data Lists, Data Providers, Mailboxes |
| Campaigns | Offers, Virtual Lists, Auto Responders, Headers, Affiliate Networks |
| Email APIs | Gmail API, G Suite API, Outlook API |
| Infrastructure | Cloud Providers (11), Domain Registrars (6), Proxies, Postmaster |
| Management | Tools, Statistics, PMTA, Geo Manager, ISPs, Servers Providers, Management Servers |

---

## Technology Summary

| Component | Tech | Why |
|---|---|---|
| Frontend | Vue 3 + Vite | Fast, modern SPA with hot reload |
| Styling | Tailwind CSS | Utility-first, no custom CSS files |
| Backend | Node.js + Express | JavaScript everywhere, fast development |
| Database | MySQL 8 + Prisma | Relational data, type-safe queries |
| Auth | JWT + bcrypt | Stateless auth, secure password hashing |
| SSH | ssh2 | Remote server management from the platform |
| RBAC | Custom roleCheck | 94 sections × 3 actions = 282 permission combinations |
