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

> 📊 **[Download 12-Slide Presentation](docs/HopeSMS_Presentation.pptx)** — Full defense deck covering architecture, rights matrix, CRUD demo, cascade soft-delete, 4 reports, and lessons learned.

| Slide | Topic |
|-------|-------|
| 1 | Title — Low Cortisol Duo, course details, live URL |
| 2 | Project Overview — 3 user types, soft-delete rule |
| 3 | 6-Table Database Architecture — CRUD vs Lookup |
| 4 | User Types & Rights Matrix — 13 rights |
| 5 | Authentication Flow — email + Google OAuth |
| 6 | Sales CRUD with Lookup Integration |
| 7 | Price Autofill & Read-Only Lookup Pages |
| 8 | Cascade Soft-Delete & Recovery |
| 9 | 4 Sales Reports with Bar Charts |
| 10 | Admin Module & SUPERADMIN Protection |
| 11 | Tech Stack & Architecture |
| 12 | Lessons Learned |

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
| Micole Kurt Gonda | M2 Frontend Developer \| M5 QA/Docs |

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

> Screenshots coming soon — visit the live app at https://hope-sales.vercel.app

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
