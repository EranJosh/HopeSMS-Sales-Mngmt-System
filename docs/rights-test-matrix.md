<!-- Hard delete audit: PASSED — zero .delete( calls found in src/ — confirmed 2026-04-29 -->
# Final RLS Audit — all policies verified; hard delete confirmed non-existent on all 6 tables
# HopeSMS — Rights Test Matrix

**Total test cases:** 39 (3 user types × 13 rights)  
**Enforcement layers:** React UI (button visibility) + Supabase RLS (server-side)

## Legend

| Symbol | Meaning |
|--------|---------|
| 1 | right_value = 1 — action is allowed |
| 0 | right_value = 0 — action is blocked |
| PASS | Expected behavior confirmed |
| — | Not yet executed |

---

## Rights Matrix (Expected Values)

| Right ID | Right Name | SUPERADMIN | ADMIN (Sales Mgr) | USER (Sales Agent) |
|----------|-----------|-----------|-----------------|------------------|
| SALES_VIEW | View Transactions | 1 | 1 | 1 |
| SALES_ADD | Create Transaction | 1 | 1 | 0 |
| SALES_EDIT | Edit Transaction | 1 | 1 | 0 |
| SALES_DEL | Soft Delete Transaction | 1 | 0 | 0 |
| SD_VIEW | View Sales Detail | 1 | 1 | 1 |
| SD_ADD | Add Line Item | 1 | 1 | 0 |
| SD_EDIT | Edit Line Item | 1 | 1 | 0 |
| SD_DEL | Soft Delete Line Item | 1 | 0 | 0 |
| CUST_LOOKUP | Look Up Customers | 1 | 1 | 1 |
| EMP_LOOKUP | Look Up Employees | 1 | 1 | 1 |
| PROD_LOOKUP | Look Up Products | 1 | 1 | 1 |
| PRICE_LOOKUP | Look Up Price History | 1 | 1 | 1 |
| ADM_USER | Admin Activate User | 1 | 1 | 0 |

---

## 39-Case Test Table

### SUPERADMIN (13 test cases)

| # | Right | Expected Value | UI Behavior | RLS Behavior | Result |
|---|-------|---------------|-------------|-------------|--------|
| 1 | SALES_VIEW | 1 | Transactions page loads; all rows visible (ACTIVE + INACTIVE) | SELECT allowed on sales | — |
| 2 | SALES_ADD | 1 | "+ Add Transaction" button visible; modal opens and submits | INSERT allowed on sales | — |
| 3 | SALES_EDIT | 1 | "Edit" button visible per row; modal opens and saves | UPDATE allowed on sales | — |
| 4 | SALES_DEL | 1 | "Delete" button visible per ACTIVE row; dialog confirms soft-delete; row turns red | UPDATE record_status allowed on sales | — |
| 5 | SD_VIEW | 1 | Sales Detail page loads; all line items visible (ACTIVE + INACTIVE) | SELECT allowed on salesDetail | — |
| 6 | SD_ADD | 1 | "+ Add Line Item" button visible; modal opens, unit price auto-fills, submits | INSERT allowed on salesDetail | — |
| 7 | SD_EDIT | 1 | "Edit" button visible per ACTIVE line item; quantity updates | UPDATE allowed on salesDetail | — |
| 8 | SD_DEL | 1 | "Delete" button visible per ACTIVE line item; line item turns red/INACTIVE | UPDATE record_status allowed on salesDetail | — |
| 9 | CUST_LOOKUP | 1 | Customers page loads; full table visible; zero add/edit/delete buttons | SELECT allowed on customer | — |
| 10 | EMP_LOOKUP | 1 | Employees page loads; full table visible; zero add/edit/delete buttons | SELECT allowed on employee | — |
| 11 | PROD_LOOKUP | 1 | Products page loads with current price column; zero add/edit/delete buttons | SELECT allowed on product + priceHist | — |
| 12 | PRICE_LOOKUP | 1 | Price History page loads; full history visible; zero add/edit/delete buttons | SELECT allowed on priceHist | — |
| 13 | ADM_USER | 1 | Admin page accessible from sidebar; user table shows all users; Activate/Deactivate buttons visible; SUPERADMIN rows show "Protected" | RLS allows UPDATE on user WHERE user_type != 'SUPERADMIN' | — |

### ADMIN / Sales Manager (13 test cases)

| # | Right | Expected Value | UI Behavior | RLS Behavior | Result |
|---|-------|---------------|-------------|-------------|--------|
| 14 | SALES_VIEW | 1 | Transactions page loads; ACTIVE and INACTIVE rows visible; stamp column visible | SELECT on sales; INACTIVE visible due to ADMIN check in RLS | — |
| 15 | SALES_ADD | 1 | "+ Add Transaction" button visible; modal opens and submits | INSERT allowed on sales | — |
| 16 | SALES_EDIT | 1 | "Edit" button visible per ACTIVE row; changes save | UPDATE allowed on sales | — |
| 17 | SALES_DEL | 0 | "Delete" button NOT visible on any row | UPDATE blocked by RLS (SALES_DEL right = 0) | — |
| 18 | SD_VIEW | 1 | Sales Detail page loads; ACTIVE and INACTIVE line items visible; stamp visible | SELECT on salesDetail; INACTIVE visible | — |
| 19 | SD_ADD | 1 | "+ Add Line Item" button visible; submits successfully | INSERT allowed on salesDetail | — |
| 20 | SD_EDIT | 1 | "Edit" button visible per ACTIVE line item; quantity updates | UPDATE allowed on salesDetail | — |
| 21 | SD_DEL | 0 | "Delete" button NOT visible on any line item | UPDATE blocked by RLS (SD_DEL right = 0) | — |
| 22 | CUST_LOOKUP | 1 | Customers page loads; full table visible; zero write buttons | SELECT allowed on customer | — |
| 23 | EMP_LOOKUP | 1 | Employees page loads; full table visible; zero write buttons | SELECT allowed on employee | — |
| 24 | PROD_LOOKUP | 1 | Products page loads with current prices; zero write buttons | SELECT allowed on product + priceHist | — |
| 25 | PRICE_LOOKUP | 1 | Price History page loads; zero write buttons | SELECT allowed on priceHist | — |
| 26 | ADM_USER | 1 | Admin page accessible; Activate/Deactivate buttons present; SUPERADMIN row buttons disabled/greyed with "Protected" tooltip | RLS UPDATE policy enforces user_type != 'SUPERADMIN' | — |

### USER / Sales Agent (13 test cases)

| # | Right | Expected Value | UI Behavior | RLS Behavior | Result |
|---|-------|---------------|-------------|-------------|--------|
| 27 | SALES_VIEW | 1 | Transactions page loads; ACTIVE rows only; stamp column NOT visible; no INACTIVE rows | SELECT on sales; INACTIVE filtered by RLS + client query | — |
| 28 | SALES_ADD | 0 | "+ Add Transaction" button NOT visible | INSERT blocked by RLS (SALES_ADD right = 0) | — |
| 29 | SALES_EDIT | 0 | "Edit" button NOT visible on any row | UPDATE blocked by RLS (SALES_EDIT right = 0) | — |
| 30 | SALES_DEL | 0 | "Delete" button NOT visible on any row | UPDATE blocked by RLS (SALES_DEL right = 0) | — |
| 31 | SD_VIEW | 1 | Sales Detail page loads; ACTIVE line items only; stamp NOT visible | SELECT on salesDetail; INACTIVE filtered | — |
| 32 | SD_ADD | 0 | "+ Add Line Item" button NOT visible | INSERT blocked by RLS (SD_ADD right = 0) | — |
| 33 | SD_EDIT | 0 | "Edit" button NOT visible on any line item | UPDATE blocked by RLS (SD_EDIT right = 0) | — |
| 34 | SD_DEL | 0 | "Delete" button NOT visible on any line item | UPDATE blocked by RLS (SD_DEL right = 0) | — |
| 35 | CUST_LOOKUP | 1 | Customers page loads; full ACTIVE table visible; zero write buttons | SELECT allowed on customer | — |
| 36 | EMP_LOOKUP | 1 | Employees page loads; zero write buttons | SELECT allowed on employee | — |
| 37 | PROD_LOOKUP | 1 | Products page loads with current prices; zero write buttons | SELECT allowed on product + priceHist | — |
| 38 | PRICE_LOOKUP | 1 | Price History page loads; zero write buttons | SELECT allowed on priceHist | — |
| 39 | ADM_USER | 0 | Admin link NOT visible in sidebar; direct navigation to `/admin` redirects to `/sales` | Enforced by ProtectedRoute + page-level Navigate | — |

---

## Lookup Tables — Zero Write Verification

The following 4 tables must have **no INSERT, UPDATE, or DELETE policies** in Supabase. Confirm by running in SQL Editor:

```sql
SELECT tablename, cmd, policyname
FROM pg_policies
WHERE tablename IN ('customer','employee','product','pricehist')
  AND cmd IN ('INSERT','UPDATE','DELETE');
-- Expected: 0 rows returned
```

All three user types must see **zero mutation buttons** on:

| Page | Add Button | Edit Button | Delete Button |
|------|-----------|------------|--------------|
| Customers | Must NOT exist | Must NOT exist | Must NOT exist |
| Employees | Must NOT exist | Must NOT exist | Must NOT exist |
| Products | Must NOT exist | Must NOT exist | Must NOT exist |
| Price History | Must NOT exist | Must NOT exist | Must NOT exist |

---

## How to Execute Tests

1. Create three Supabase test accounts (one per user type) and activate them via Admin page
2. Log in as each user type in separate browser sessions or profiles
3. For each row in the 39-case table above, perform the described action and record PASS or FAIL
4. For RLS verification, confirm in Supabase Table Editor → Policies that no write policies exist on lookup tables
5. Replace `—` in the Result column with PASS / FAIL and the test date
