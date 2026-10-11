# HopeSMS — Sales Management System

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)
[![Live](https://img.shields.io/badge/Live-hope--sales.vercel.app-brightgreen)](https://hope-sales.vercel.app)

**Hope, Inc. | New Era University — BS Computer Science**  
Software Engineering 2 | Section 3BSCS-1 | Academic Year 2025–2026

**Live:** https://hope-sales.vercel.app

---

## 🎯 Project Presentation

> 📊 **[Download Full Presentation (.pptx)](docs/HopeSMS_Presentation.pptx)**

<table>
  <tr>
    <td><img src="docs/slides/slide-01.jpg" width="100%"/><br/><sub>1 — Title</sub></td>
    <td><img src="docs/slides/slide-02.jpg" width="100%"/><br/><sub>2 — Overview</sub></td>
    <td><img src="docs/slides/slide-03.jpg" width="100%"/><br/><sub>3 — Database</sub></td>
  </tr>
  <tr>
    <td><img src="docs/slides/slide-04.jpg" width="100%"/><br/><sub>4 — Rights Matrix</sub></td>
    <td><img src="docs/slides/slide-05.jpg" width="100%"/><br/><sub>5 — Auth Flow</sub></td>
    <td><img src="docs/slides/slide-06.jpg" width="100%"/><br/><sub>6 — Sales CRUD</sub></td>
  </tr>
  <tr>
    <td><img src="docs/slides/slide-07.jpg" width="100%"/><br/><sub>7 — Price Autofill</sub></td>
    <td><img src="docs/slides/slide-08.jpg" width="100%"/><br/><sub>8 — Cascade</sub></td>
    <td><img src="docs/slides/slide-09.jpg" width="100%"/><br/><sub>9 — Reports</sub></td>
  </tr>
  <tr>
    <td><img src="docs/slides/slide-10.jpg" width="100%"/><br/><sub>10 — Admin</sub></td>
    <td><img src="docs/slides/slide-11.jpg" width="100%"/><br/><sub>11 — Tech Stack</sub></td>
    <td><img src="docs/slides/slide-12.jpg" width="100%"/><br/><sub>12 — Lessons</sub></td>
  </tr>
</table>

---

## Table of Contents

- [Project Presentation](#-project-presentation)
- [Course Details](#course-details)
- [Team](#team)
- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Setup Instructions](#setup-instructions)
- [User Roles](#user-roles)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Branching Strategy](#branching-strategy)
- [Contributing](#contributing)
- [Available Scripts](#available-scripts)
- [Documentation](#documentation)
- [Important Notes on Supabase Column Naming](#important-notes-on-supabase-column-naming)

---

## Course Details

| Field | Info |
|-------|------|
| Course | Software Engineering 2 |
| Section | 3BSCS-1 |
| University | New Era University |
| Academic Year | 2025–2026 |

---

## Team

**Group: Low Cortisol Duo**

| Member | Roles |
|--------|-------|
| Eran Josh Reyes | M1 Project Lead \| M3 DB Engineer \| M4 Rights & Auth \| M5 QA/Docs |
| Micole Kurt Gonda | M2 Full-Stack Developer (application pages and CRUD flows on Supabase, transaction and line-item modals with price autofill, reports, user administration, auth callback and Vercel deployment fixes) \| M5 QA/Docs (39-case rights test matrix, RLS and cascade tests, user manual) |

---

## Project Description

HopeSMS is a full-stack web application that manages sales transactions and line items for Hope, Inc. Built across three 2-week sprints by a 5-member team, it demonstrates role-based access control, soft-delete data integrity, real-time lookup integration, and SQL aggregate reporting.

**Key design rules enforced in every layer of the stack:**
- **No hard deletes** — records are only ever set to `record_status = 'INACTIVE'`
- **INACTIVE records invisible to USER accounts** at both the React UI level and Supabase RLS level
- **customer, employee, product, priceHist** are lookup-only — the app reads but never writes to them
- **ADMIN cannot modify SUPERADMIN** accounts, enforced in RLS and UI

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + Vite | SPA, component-based UI |
| Styling | Tailwind CSS v3 | Utility-first responsive design |
| Backend / DB | Supabase (PostgreSQL) | Database, Auth, RLS Policies, Triggers |
| Auth | Supabase Auth | Email/password + Google OAuth 2.0 |
| State | React Context API | Auth session + user rights map |
| Routing | React Router v6 | Protected routes, nested layouts |
| Testing | Vitest + React Testing Library | Unit and integration tests |
| Version Control | Git + GitHub | Source control and collaboration |
| Deployment | Vercel | Production hosting — https://hope-sales.vercel.app |

---

## Database Schema

Six HopeDB tables form the core data model. `record_status` and `stamp` are added only to `sales` and `salesDetail`:

```
employee ──< sales >── customer
               │
               └──< salesDetail >── product
                                        │
                                    priceHist

Auth tables: user ──< user_module ── Module
             user ──< UserModule_Rights ── rights
```

See [docs/ERD.md](docs/ERD.md) for the full text-based ERD with all columns, PKs, FKs, and design notes.

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/EranJosh/HopeSMS-Sales-Mngmt-System.git
cd HopeSMS-Sales-Mngmt-System
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your Supabase project values:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

> **Never commit `.env`** — it is listed in `.gitignore`. Only commit `.env.example`.

### 4. Run the migrations in Supabase

Open your Supabase project → **SQL Editor** and run these files in order:

| Order | File | What it does |
|-------|------|-------------|
| 1 | `db/migrations/001_hopedb_base_tables.sql` | All 6 HopeDB tables + full seed data |
| 2 | `db/migrations/002_rights_tables.sql` | RBAC tables: user, Module, rights, user_module, UserModule_Rights |
| 3 | `db/migrations/003_seed_modules_rights.sql` | 4 modules + 13 rights seeded |
| 4 | `db/migrations/004_superadmin_seed.sql` | **Read the instructions inside before running** — replace `SUPERADMIN_UUID_HERE` with the real UUID |
| 5 | `db/migrations/005_provision_user_trigger.sql` | Auto-provisions USER/INACTIVE on every new signup |
| 6 | `db/migrations/006_cascade_soft_delete_trigger.sql` | Cascade soft-delete from sales → salesDetail |
| 7 | `db/migrations/007_rls_policies.sql` | Row-Level Security on all 6 HopeDB tables |
| 8 | `db/migrations/008_sql_views.sql` | 6 SQL views for UI and reports |
| 9 | `db/migrations/009_rls_user_table.sql` | RLS on user and RBAC tables |
| 10 | `db/migrations/010_grants.sql` | GRANT SELECT/INSERT/UPDATE to authenticated role on all tables and views |
| 11 | `db/migrations/011_view_security_invoker.sql` | Views run as the calling user (`security_invoker`) so RLS applies to reports; pins `search_path` on the signup trigger |

See [db/README.md](db/README.md) for full migration details and SUPERADMIN setup steps.

### 5. Set up the SUPERADMIN account

1. Go to **Supabase Dashboard → Authentication → Users → Invite user**
2. Invite `jcesperanza@neu.edu.ph`
3. Copy the UUID from the auth.users table
4. Open `db/migrations/004_superadmin_seed.sql`, replace `SUPERADMIN_UUID_HERE` with the UUID
5. Run the file in SQL Editor
6. Then update the provisioned row: `UPDATE public.user SET user_type = 'SUPERADMIN', record_status = 'ACTIVE' WHERE email = 'jcesperanza@neu.edu.ph';`

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## User Roles

| Role | Description | Default Rights |
|------|-------------|---------------|
| **SUPERADMIN** | Full system control. Cannot be modified by any other user. | All 13 rights = 1 |
| **ADMIN** (Sales Manager) | Can create and edit transactions. Can activate/deactivate users. Cannot soft-delete. | SALES_VIEW/ADD/EDIT, SD_VIEW/ADD/EDIT, all LOOKUP, ADM_USER = 1; DEL rights = 0 |
| **USER** (Sales Agent) | Read-only access to active transactions and lookups. | SALES_VIEW, SD_VIEW, all LOOKUP = 1; all ADD/EDIT/DEL/ADM = 0 |

New registrations start as **USER / INACTIVE** and require admin activation before logging in.

---

## Project Structure

```
src/
├── App.jsx                      # All routes
├── main.jsx                     # BrowserRouter + AuthProvider + UserRightsProvider
├── index.css                    # Tailwind directives
├── components/
│   ├── AppShell.jsx             # Navbar + sidebar (rights-gated links)
│   ├── ProtectedRoute.jsx       # Auth guard + /deleted-items USER block
│   └── modals/
│       ├── Modal.jsx            # Shared modal wrapper
│       ├── AddSaleModal.jsx
│       ├── EditSaleModal.jsx
│       ├── SoftDeleteSaleDialog.jsx
│       ├── AddLineItemModal.jsx
│       ├── EditLineItemModal.jsx
│       └── SoftDeleteDetailDialog.jsx
├── context/
│   ├── AuthContext.jsx          # Session restore, login guard, currentUser
│   └── UserRightsContext.jsx   # Loads 13 rights; SUPERADMIN bypass
├── lib/
│   └── supabaseClient.js
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── AuthCallbackPage.jsx
│   ├── SalesListPage.jsx        # Full CRUD, filters, rights gating
│   ├── SalesDetailPage.jsx      # Line items, grand total, rights gating
│   ├── CustomerLookupPage.jsx   # Read-only
│   ├── EmployeeLookupPage.jsx   # Read-only
│   ├── ProductLookupPage.jsx    # Read-only with current prices
│   ├── PriceHistoryPage.jsx     # Read-only
│   ├── ReportsPage.jsx          # 4 sortable tabs
│   ├── AdminPage.jsx            # User activation, SUPERADMIN protection
│   └── DeletedItemsPage.jsx     # Recovery panel, ADMIN/SUPERADMIN only
├── services/
│   ├── salesService.js
│   ├── salesDetailService.js
│   ├── lookupService.js
│   ├── adminService.js
│   └── reportsService.js
└── tests/
    ├── setup.js
    └── auth.test.jsx
```

---

## Screenshots

Live app: https://hope-sales.vercel.app

### Sign in and registration

| | |
|---|---|
| ![Login](docs/screenshots/login.webp)<br/><sub>Login: email and password or Google sign-in</sub> | ![Registration](docs/screenshots/register.webp)<br/><sub>Registration: new accounts start INACTIVE until an admin activates them</sub> |

### Dashboard and sales

| | |
|---|---|
| ![Dashboard](docs/screenshots/dashboard.webp)<br/><sub>Dashboard: KPIs, monthly revenue trend, top products, latest transactions</sub> | ![Sales transactions](docs/screenshots/transactions.webp)<br/><sub>Sales transactions: date and customer filters, export, edit and soft-delete</sub> |
| ![Add transaction](docs/screenshots/add-transaction.webp)<br/><sub>Add transaction: customer and employee lookups, rights-gated</sub> | ![Transaction detail](docs/screenshots/transaction-detail.webp)<br/><sub>Transaction detail: line items, price autofill, grand total, PDF export</sub> |

### Lookups (read-only)

| | |
|---|---|
| ![Customers](docs/screenshots/customer-lookup.webp)<br/><sub>Customers: read-only lookup, click a row for history</sub> | ![Customer history](docs/screenshots/customer-history.webp)<br/><sub>Customer history: transactions and revenue for one customer</sub> |
| ![Employees](docs/screenshots/employee-lookup.webp)<br/><sub>Employees: read-only lookup with performance view</sub> | ![Products](docs/screenshots/product-lookup.webp)<br/><sub>Products: read-only lookup with current price</sub> |
| ![Price history](docs/screenshots/price-history.webp)<br/><sub>Price history: every price change per product</sub> |  |

### Reports

| | |
|---|---|
| ![Reports](docs/screenshots/reports.webp)<br/><sub>Reports: revenue by employee (SQL view)</sub> | ![Reports](docs/screenshots/reports-customer.webp)<br/><sub>Reports: revenue by customer</sub> |
| ![Reports](docs/screenshots/reports-products.webp)<br/><sub>Reports: top products sold</sub> | ![Reports](docs/screenshots/reports-monthly.webp)<br/><sub>Reports: monthly sales trend with month filter</sub> |

### Administration

| | |
|---|---|
| ![Deleted items](docs/screenshots/deleted-items.webp)<br/><sub>Deleted items: soft-deleted records with Recover</sub> | ![User administration](docs/screenshots/admin.webp)<br/><sub>User administration: activate, deactivate and change roles; SUPERADMIN is protected</sub> |
| ![Audit log](docs/screenshots/audit-log.webp)<br/><sub>Audit log: every create, edit, delete, recover and activation, with Excel export</sub> | ![My profile](docs/screenshots/profile.webp)<br/><sub>My profile: account details and the rights assigned to the user</sub> |

> The screenshots were captured by running this repository's code locally in the SUPERADMIN role against the seed data in [`docs/HopeDB (3).sql`](docs/HopeDB%20(3).sql) (Hope, Inc., a fictitious company). The four users on the Admin page are placeholder demo accounts.

---

## Security Checks

Every push and pull request runs `.github/workflows/security.yml`, and it re-runs every Monday so new advisories are caught without code changes:

| Check | What it catches |
|---|---|
| `npm audit --audit-level=high` | Known vulnerabilities in dependencies; fails on high or critical |
| CodeQL (`security-extended`) | Injection, XSS, unsafe data flows and other code-level issues in the JavaScript |
| Gitleaks | Passwords, API keys and tokens committed anywhere in the git history |
| Lint, test, build | Hook-order bugs and broken builds before they reach Vercel |

Dependabot (`.github/dependabot.yml`) opens weekly pull requests for npm updates and monthly ones for GitHub Actions. Database access is enforced by RLS policies (migrations 007, 009 and 011).

Run the dependency check locally with `npm audit`.

---

## Branching Strategy

| Branch | Purpose |
|---|---|
| `main` | Production — protected, PR only, no direct pushes |
| `dev` | Integration — protected, PR only |
| `feat/*` | Feature work — branch from `dev`, PR back to `dev` |
| `db/*` | Database migrations — branch from `dev`, PR back to `dev` |
| `fix/*` | Bug fixes — branch from `dev`, PR back to `dev` |
| `test/*` | Tests and QA — branch from `dev`, PR back to `dev` |
| `docs/*` | Documentation — branch from `dev`, PR back to `dev` |
| `chore/*` | Maintenance tasks — branch from `dev`, PR back to `dev` |

**Flow:** `feat/xxx` → PR (reviewed by 1+ teammate) → `dev` → release PR → `main`

---

## Contributing

All contributions go through pull requests — no direct commits to `main` or `dev`.

### Workflow

1. **Branch from `dev`** using the correct prefix for the type of work:
   - `feat/` — new features
   - `fix/` — bug fixes
   - `db/` — database migrations or schema changes
   - `test/` — test cases or QA
   - `docs/` — documentation only
   - `chore/` — maintenance, dependency updates, tooling

2. **Commit with a prefix** that matches the branch type:
   ```
   feat: add price auto-fill to Add Line Item modal
   fix: correct cascade soft-delete trigger on salesDetail
   db: add RLS policy for lookup tables
   test: 39-case rights matrix execution
   docs: update user manual with admin screenshots
   chore: clean up stale remote branches
   ```

3. **Open a PR into `dev`** with a clear title and description of what changed and why.

4. **Get at least one teammate review** before merging. Draft PRs and unreviewed merges do not count as sprint deliverables.

5. **Release to `main`** only via a sprint release PR from `dev` after the sprint is complete and all PRs are merged.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at `localhost:5173` |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run Vitest test suite |

---

## 📁 Documentation

| Document | Description | Link |
|----------|-------------|------|
| 📊 **12-Slide Presentation** | Full defense deck — architecture, rights matrix, CRUD demo, cascade, reports, lessons learned | [Download](docs/HopeSMS_Presentation.pptx) |
| 📖 **User Manual** | Step-by-step guide for all 3 user types — registration, login, transactions, reports, admin | [View](docs/user-manual.md) |
| 🗂️ **ERD Diagram** | Entity-relationship diagram for all 6 HopeDB tables with PKs, FKs, and relationships | [View](docs/ERD.md) |
| ✅ **Rights Test Matrix** | 39-case test matrix — 3 user types × 13 rights — all pass/fail results | [View](docs/rights-test-matrix.md) |
| 📝 **Sprint Log** | Full 3-sprint development log with tasks, blockers, resolutions, and completion status | [View](docs/sprint-log.md) |
| 🗄️ **DB Migrations** | All 9 SQL migration files — tables, RLS, triggers, views, grants — with execution order | [View](db/migrations/) |

---

## Important Notes on Supabase Column Naming

PostgreSQL stores all unquoted identifiers in **lowercase**. All Supabase JS client queries in this project use lowercase column and table names:

| Original (SQL file) | Stored in PostgreSQL | Used in JS |
|---------------------|---------------------|-----------|
| `transNo` | `transno` | `.eq('transno', ...)` |
| `salesDate` | `salesdate` | `.select('salesdate')` |
| `custNo` | `custno` | `row.custno` |
| `salesDetail` | `salesdetail` | `.from('salesdetail')` |
| `priceHist` | `pricehist` | `.from('pricehist')` |
| `UserModule_Rights` | `usermodule_rights` | `.from('usermodule_rights')` |
| `userId` (column) | `userid` | `.eq('userid', ...)` |
