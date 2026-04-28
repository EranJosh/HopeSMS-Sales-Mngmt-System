# Sprint 1 Log — HopeSMS Setup, Auth, DB Schema
# HopeSMS — Sprint Log

**Project:** Hope, Inc. Sales Management System  
**Course:** Software Engineering 2 — New Era University, CCS  
**Team Size:** 5 members | **Total Sprints:** 3 (6 weeks)

---

## Sprint 1 — Weeks 1 & 2
**Theme:** Project setup, full SMS database, Email + Google OAuth, login guard  
**Dates:** 2026-03-30 → 2026-04-12  
**Status:** COMPLETE

### Tasks Completed

| # | Task | Owner | Branch |
|---|------|-------|--------|
| 1 | GitHub repo created; `main` and `dev` branches protected | M1 | chore/github-protection |
| 2 | Vite + React 18 + Tailwind CSS v3 scaffolded and running locally | M1 | feat/project-scaffold |
| 3 | Supabase JS client initialized; `.env.example` committed | M1 | feat/project-scaffold |
| 4 | React Router v6 wired with `ProtectedRoute` blocking unauthenticated access | M1 | feat/routing-skeleton |
| 5 | All placeholder pages created: `/sales`, `/sales/:transNo`, `/lookups/*`, `/reports`, `/admin`, `/deleted-items`, `/auth/callback` | M1 | feat/routing-skeleton |
| 6 | Login page: email/password form + Google OAuth button, error display | M2 | feat/ui-login-page |
| 7 | Register page: First Name, Last Name, Username, Email, Password + Google register | M2 | feat/ui-register-page |
| 8 | AppShell: Navbar with username + Logout, grouped sidebar navigation | M2 | feat/ui-app-shell |
| 9 | `/auth/callback` page with spinner during OAuth session exchange | M2 | feat/ui-auth-callback |
| 10 | All 6 HopeDB tables seeded: sales (124 rows), salesDetail (~310 rows), customer (82), employee (31), product (52), priceHist (~70) | M3 | db/initial-schema |
| 11 | `record_status` + `stamp` columns added to `sales` and `salesDetail` only | M3 | db/initial-schema |
| 12 | Rights schema created: `user`, `Module`, `rights`, `user_module`, `UserModule_Rights` | M3 | db/initial-schema |
| 13 | 4 modules and 13 rights seeded | M3 | db/initial-schema |
| 14 | ERD committed to `/docs/ERD.md` | M3 | db/initial-schema |
| 15 | `AuthContext.jsx`: wraps app, provides `currentUser` via `onAuthStateChange` | M4 | feat/auth-context |
| 16 | Email/password: `signUp()` + `signIn()` wired to Register and Login forms | M4 | feat/auth-email |
| 17 | Google OAuth: `signInWithOAuth` + `/auth/callback` redirect configured | M4 | feat/auth-google |
| 18 | Login guard: checks `record_status = 'ACTIVE'`; signs out + error if INACTIVE | M4 | feat/auth-context |
| 19 | `provision_new_user()` trigger: auto-provisions USER/INACTIVE with default rights on signup | M4 | db/trigger-provision-user |
| 20 | Vitest + React Testing Library installed; 4 auth test stubs created | M5 | test/sprint1-auth-flows |
| 21 | Sprint 1 README committed with setup instructions | M5 | docs/sprint1-log-readme |

### Blockers & Resolutions

| Blocker | Resolution |
|---------|-----------|
| `npm create vite` cancelled in non-empty directory | Scaffolded into temp folder, copied files across |
| `userId` vs `userid` column casing mismatch (PostgreSQL lowercases unquoted identifiers) | Fixed all Supabase queries to use lowercase column names |
| `supabase.auth.signInWithPassword` hanging — "Signing in…" stuck forever | Root cause: Supabase JS v2 awaits async `onAuthStateChange` subscribers. Fixed by making the callback synchronous and firing async work via `.catch().finally()` without blocking the subscriber loop |

### Next Sprint Goals
- Full CRUD on `sales` and `salesDetail` with rights gating
- Lookup dropdown integration (customer, employee, product, priceHist)
- Cascade soft-delete trigger (sales → salesDetail)
- RLS visibility enforcement (INACTIVE hidden for USER)
- Deleted Items recovery panel

---

## Sprint 2 — Weeks 3 & 4
**Theme:** Full sales and salesDetail CRUD, rights gating, lookup integration, soft-delete, reports  
**Dates:** 2026-04-13 → 2026-04-26  
**Status:** COMPLETE

### Tasks Completed

| # | Task | Owner | Branch |
|---|------|-------|--------|
| 1 | `UserRightsContext.jsx`: loads all 13 rights from `usermodule_rights` on login | M4 | feat/rights-context |
| 2 | SUPERADMIN client-side bypass: grants all 13 rights without DB query | M4 | fix/user-type-rights |
| 3 | `salesService.js`: `getSales`, `createSale`, `updateSale`, `softDeleteSale`, `recoverSale` | M1 | feat/sales-api |
| 4 | `salesDetailService.js`: `getDetailByTrans`, `addDetailLine`, `updateDetailLine`, `softDeleteDetailLine`, `recoverDetailLine` | M1 | feat/salesdetail-api |
| 5 | `lookupService.js`: `getCustomers`, `getEmployees`, `getProducts`, `getCurrentPrice`, `getAllCurrentPrices`, `getAllPriceHistory` | M1 | feat/lookup-api |
| 6 | `adminService.js`: `getUsers`, `activateUser`, `deactivateUser` | M1 | feat/rights-context |
| 7 | `reportsService.js`: `getSalesByEmployee`, `getSalesByCustomer`, `getTopProducts`, `getMonthlySalesTrend` | M1 | feat/reports-api |
| 8 | Modal components: `AddSaleModal`, `EditSaleModal`, `SoftDeleteSaleDialog` | M2 | feat/ui-sales-crud |
| 9 | Modal components: `AddLineItemModal`, `EditLineItemModal`, `SoftDeleteDetailDialog` | M2 | feat/ui-salesdetail-crud |
| 10 | `SalesListPage`: table with filters, SALES_ADD/EDIT/DEL gating, stamp for ADMIN/SUPERADMIN | M2 | feat/ui-sales-crud |
| 11 | `SalesDetailPage`: transaction header + line items table, grand total, SD_ADD/EDIT/DEL gating | M2 | feat/ui-salesdetail-crud |
| 12 | `DeletedItemsPage`: 2 tabs (Transactions / Line Items), Recover buttons, blocked for USER | M2 | feat/ui-deleted-items |
| 13 | `CustomerLookupPage`, `EmployeeLookupPage`, `ProductLookupPage`, `PriceHistoryPage`: read-only, zero write buttons | M2 | feat/ui-lookups |
| 14 | AppShell sidebar gating: Admin link hidden unless `ADM_USER = 1`; Deleted Items hidden for USER | M2 | feat/ui-app-shell |
| 15 | `ProtectedRoute` blocks `/deleted-items` for USER accounts | M4 | feat/rights-context |
| 16 | `cascade_sales_soft_delete()` trigger: ACTIVE→INACTIVE cascades to all child salesDetail rows | M3 | db/cascade-trigger |
| 17 | 6 SQL views created: `sales_with_lookup`, `salesdetail_with_product`, `sales_by_employee`, `sales_by_customer`, `top_products_sold`, `monthly_sales_trend` | M3 | db/views |
| 18 | RLS policies on all 6 HopeDB tables; lookup tables have SELECT-only (no write policies) | M3 | db/rls-policies |
| 19 | RLS on `user`, `usermodule_rights`, `user_module`, `Module`, `rights` tables | M3 | db/rls-user |
| 20 | GRANT statements for `authenticated` role on all tables and views | M3 | db/grants |

### Blockers & Resolutions

| Blocker | Resolution |
|---------|-----------|
| SUPERADMIN showing `user_type = 'USER'` | `provision_new_user` trigger fires on first signup with USER type; `004_superadmin_seed.sql` used `ON CONFLICT DO NOTHING` so row was not updated. Fixed with explicit field override in AuthContext merge + SUPERADMIN client-side bypass in UserRightsContext |
| CRUD buttons not visible for SUPERADMIN | Rights rows in `usermodule_rights` had USER defaults. Fixed by SUPERADMIN bypass in UserRightsContext that grants all 13 rights without querying DB |
| Supabase queries returning empty results despite correct RLS | Missing GRANT statements — PostgREST runs as `authenticated` role and needs explicit SELECT/UPDATE grants. Added `010_grants.sql` |
| `rightsLoading = true` blocking redirect to `/sales` after login | Removed `rightsLoading` from ProtectedRoute check; rights load in background while pages render and gate their own actions |

### Sprint 2 Deliverables Summary

| Deliverable | Status |
|------------|--------|
| Sales CRUD (Add, Edit, Soft-Delete, Recover) | Done |
| SalesDetail CRUD with unit price auto-fill | Done |
| Cascade soft-delete (sales → salesDetail) | Done |
| All 4 lookup pages (read-only, zero write buttons) | Done |
| Deleted Items panel with recovery | Done |
| Rights gating on all 13 rights across 3 user types | Done |
| INACTIVE rows hidden for USER, visible for ADMIN/SUPERADMIN | Done |
| Stamp column hidden for USER, visible for ADMIN/SUPERADMIN | Done |

### Next Sprint Goals (Sprint 3 — Weeks 5 & 6)
- Reports page: 4 sortable tabs (By Employee, By Customer, Top Products, Monthly Trend)
- Admin page: user activation / deactivation with SUPERADMIN protection
- Final testing: 39-case rights matrix verification
- Deployment to Vercel or Netlify
- Final documentation: user manual, sprint log, rights matrix

---

## Sprint 3 — Weeks 5 & 6
**Theme:** Reports, Admin, final testing, deployment, documentation  
**Dates:** 2026-04-27 → 2026-05-10  
**Status:** IN PROGRESS

### Tasks Completed

| # | Task | Owner | Branch |
|---|------|-------|--------|
| 1 | `ReportsPage`: 4 sortable tabs — By Employee, By Customer, Top Products, Monthly Trend | M2 | feat/ui-reports |
| 2 | `AdminPage`: user table with Activate/Deactivate, SUPERADMIN rows protected and greyed | M2 | feat/ui-admin |
| 3 | Sprint log committed to `docs/sprint-log.md` | M5 | docs/sprint3-final |
| 4 | Rights test matrix committed to `docs/rights-test-matrix.md` | M5 | docs/sprint3-final |
| 5 | User manual committed to `docs/user-manual.md` | M5 | docs/sprint3-final |
| 6 | README updated with full setup and Supabase instructions | M5 | docs/sprint3-final |

### Remaining Tasks

| # | Task | Owner | Target |
|---|------|-------|--------|
| 1 | Full 39-case rights test execution | M5 | Week 6 |
| 2 | Deployment to Vercel / Netlify | M1 | Week 6 |
| 3 | Final presentation preparation | All | Week 6 |
