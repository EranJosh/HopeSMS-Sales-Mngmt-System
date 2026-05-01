# HopeSMS — Database Migrations

All SQL files live in `db/migrations/` and are run manually in the
**Supabase SQL Editor** (Dashboard → SQL Editor → New query).

Run them **in numeric order**. Each file is idempotent (`IF NOT EXISTS`,
`ON CONFLICT DO NOTHING`, `CREATE OR REPLACE`) — safe to re-run.

---

## Execution Order

| # | File | What it does |
|---|------|-------------|
| 1 | `001_hopedb_base_tables.sql` | Creates all 10 HopeDB tables and seeds all rows. Adds `record_status` + `stamp` to `sales` and `salesDetail` only. |
| 2 | `002_rights_tables.sql` | Creates the 5 auth/RBAC tables: `user`, `Module`, `rights`, `user_module`, `UserModule_Rights`. |
| 3 | `003_seed_modules_rights.sql` | Seeds 4 modules and 13 rights into `Module` and `rights`. |
| 4 | `004_superadmin_seed.sql` | Seeds the SUPERADMIN user row + all 13 rights + 4 module rows. **Read the instructions inside the file first — you must replace `SUPERADMIN_UUID_HERE` with the real UUID.** |
| 5 | `005_provision_user_trigger.sql` | Creates the `provision_new_user()` function and trigger on `auth.users`. Fires on every new registration, provisioning a `USER/INACTIVE` row with default rights. |
| 6 | `006_cascade_soft_delete_trigger.sql` | Creates the `cascade_sales_soft_delete()` function and trigger. When a `sales` row is soft-deleted or recovered, all child `salesDetail` rows follow. |
| 7 | `007_rls_policies.sql` | Enables RLS on `sales`, `salesDetail`, `customer`, `employee`, `product`, `priceHist`. Creates policies for visibility, insert, update (edit), and update (soft-delete). Lookup tables have SELECT-only policies — **no INSERT/UPDATE/DELETE policies exist on them**. |
| 8 | `008_sql_views.sql` | Creates 6 views: `sales_with_lookup`, `salesdetail_with_product`, `sales_by_employee`, `sales_by_customer`, `top_products_sold`, `monthly_sales_trend`. |
| 9 | `009_rls_user_table.sql` | Enables RLS on `user`, `UserModule_Rights`, `user_module`, `Module`, `rights`. Enforces own-row access, admin read-all, and the rule that ADMIN cannot modify SUPERADMIN rows. |

---

## SUPERADMIN Setup (one-time manual step)

1. Go to Supabase Dashboard → **Authentication → Users → Invite user**
2. Invite `jcesperanza@neu.edu.ph`
3. After the account is created, go to **Table Editor → auth.users** (or run `SELECT id FROM auth.users WHERE email = 'jcesperanza@neu.edu.ph'`)
4. Copy the UUID
5. Open `004_superadmin_seed.sql`, replace every `SUPERADMIN_UUID_HERE` with the real UUID
6. Run the file in SQL Editor

---

## Row Counts After Seeding (verification)

```sql
SELECT 'employee'    AS tbl, COUNT(*) FROM employee    UNION ALL
SELECT 'customer'    AS tbl, COUNT(*) FROM customer    UNION ALL
SELECT 'product'     AS tbl, COUNT(*) FROM product     UNION ALL
SELECT 'sales'       AS tbl, COUNT(*) FROM sales       UNION ALL
SELECT 'salesDetail' AS tbl, COUNT(*) FROM salesDetail UNION ALL
SELECT 'priceHist'   AS tbl, COUNT(*) FROM priceHist   UNION ALL
SELECT 'payment'     AS tbl, COUNT(*) FROM payment;
```

Expected: employee=31, customer=82, product=52, sales=124, salesDetail≈310, priceHist≈70, payment=165

---

## Non-Negotiable Rules (enforced in SQL)

- **No hard deletes** — `DELETE` does not appear in any migration file.
  Soft-delete = `UPDATE record_status = 'INACTIVE'`.
- Cascade trigger ensures deleting a `sales` row also marks all its
  `salesDetail` rows `INACTIVE`, and recovery restores both.
- `customer`, `employee`, `product`, `priceHist` have **no write RLS policies**.
  They are lookup-only.
- ADMIN cannot update rows where `user_type = 'SUPERADMIN'` (enforced in 009).
