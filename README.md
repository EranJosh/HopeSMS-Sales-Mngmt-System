# HopeSMS — Sales Management System

**Hope, Inc. | New Era University — BS Computer Science**  
Software Engineering 2 Capstone | Academic Year 2025–2026

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
| Deployment | Vercel / Netlify | Free-tier hosted production URL |

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

## Branching Strategy

| Branch | Purpose |
|---|---|
| `main` | Production — protected, PR only, no direct pushes |
| `dev` | Integration — protected, PR only |
| `feature/*` | Feature work — branch from `dev`, PR back to `dev` |
| `db/*` | Database migrations — branch from `dev`, PR back to `dev` |
| `fix/*` | Bug fixes — branch from `dev`, PR back to `dev` |
| `test/*` | Tests and QA — branch from `dev`, PR back to `dev` |
| `docs/*` | Documentation — branch from `dev`, PR back to `dev` |

**Flow:** `feature/xxx` → PR (reviewed by 1+ teammate) → `dev` → release PR → `main`

---

## PR Rules

- Never merge directly to `main` or `dev` — always use a PR
- Every PR must be reviewed by at least one teammate before merging
- Draft or unmerged PRs do not count toward sprint deliverables
- Commit message prefixes: `feat:`, `fix:`, `chore:`, `test:`, `docs:`, `db:`

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at `localhost:5173` |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run Vitest test suite |

---

## Documentation

| File | Description |
|------|-------------|
| [docs/ERD.md](docs/ERD.md) | Text-based entity relationship diagram |
| [docs/sprint-log.md](docs/sprint-log.md) | Sprint 1–3 task log, blockers, and resolutions |
| [docs/rights-test-matrix.md](docs/rights-test-matrix.md) | 39-case test matrix (3 user types × 13 rights) |
| [docs/user-manual.md](docs/user-manual.md) | Step-by-step guide for all user roles |
| [db/README.md](db/README.md) | Migration execution order and SUPERADMIN setup |

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
