# HopeSMS — Entity Relationship Diagram (Text-Based)

All tables are in Supabase PostgreSQL (`public` schema unless noted).
`PK` = Primary Key · `FK` = Foreign Key · `*` = added for this app (not in original HopeDB)

---

## Core HopeDB Tables

```
┌─────────────────────────────────────┐
│ employee                            │
├─────────────────────────────────────┤
│ PK  empno       VARCHAR(5)          │
│     lastname    VARCHAR(15)         │
│     firstname   VARCHAR(15)         │
│     gender      CHAR(1)             │
│     birthdate   DATE                │
│     hiredate    DATE                │
│     sepDate     DATE                │
└──────────────┬──────────────────────┘
               │ 1
               │ is referenced by
               │ N
┌──────────────▼──────────────────────┐     ┌────────────────────────────────┐
│ sales  (* record_status, * stamp)   │     │ customer                       │
├─────────────────────────────────────┤     ├────────────────────────────────┤
│ PK  transNo      VARCHAR(8)         │     │ PK  custno    VARCHAR(5)        │
│ FK  custNo       VARCHAR(5) ───────────►  │     custname  VARCHAR(20)       │
│ FK  empNo        VARCHAR(5)         │     │     address   VARCHAR(50)       │
│     salesDate    DATE               │     │     payterm   VARCHAR(3)        │
│  *  record_status VARCHAR(10)       │     └────────────────────────────────┘
│  *  stamp        VARCHAR(60)        │
└──────────────┬──────────────────────┘
               │ 1
               │ parent of
               │ N
┌──────────────▼──────────────────────┐     ┌────────────────────────────────┐
│ salesDetail (* record_status,*stamp)│     │ product                        │
├─────────────────────────────────────┤     ├────────────────────────────────┤
│ PK,FK transNo   VARCHAR(8)          │     │ PK  prodCode    VARCHAR(6)      │
│ PK,FK prodCode  VARCHAR(6) ────────────►  │     description VARCHAR(30)     │
│       quantity  DECIMAL(10,2)       │     │     unit        VARCHAR(3)      │
│  *    record_status VARCHAR(10)     │     └──────────────┬─────────────────┘
│  *    stamp     VARCHAR(60)         │                    │ 1
└─────────────────────────────────────┘                    │ has prices in
                                                           │ N
                                          ┌───────────────▼──────────────────┐
                                          │ priceHist                        │
                                          ├──────────────────────────────────┤
                                          │ PK  effDate   DATE               │
                                          │ PK,FK prodCode VARCHAR(6)        │
                                          │     unitPrice DECIMAL(10,2)      │
                                          └──────────────────────────────────┘
```

---

## Supporting HopeDB Tables (HR / reference — not used in SMS UI)

```
┌──────────────────────┐     ┌──────────────────────┐
│ department           │     │ job                  │
├──────────────────────┤     ├──────────────────────┤
│ PK deptCode VARCHAR  │     │ PK jobCode VARCHAR   │
│    deptName VARCHAR  │     │    jobDesc VARCHAR    │
└───────┬──────────────┘     └──────────┬───────────┘
        │ 1                             │ 1
        │ referenced by                 │ referenced by
        │ N                             │ N
        └──────────────┬────────────────┘
                       │
              ┌────────▼──────────────────────┐
              │ jobHistory                    │
              ├───────────────────────────────┤
              │ PK,FK empNo    VARCHAR(5)      │
              │ PK,FK jobCode  VARCHAR(4)      │
              │ PK    effDate  DATE            │
              │       salary   DECIMAL(10,2)  │
              │ FK    deptCode VARCHAR(4)      │
              └───────────────────────────────┘

┌──────────────────────────────────┐
│ payment                          │
├──────────────────────────────────┤
│ PK  orNo    VARCHAR(8)           │
│     payDate DATE                 │
│     amount  DECIMAL(10,2)        │
│ FK  transno VARCHAR(8) → sales   │
└──────────────────────────────────┘
```

---

## Auth / RBAC Tables (Sprint 1 additions)

```
┌──────────────────────────────────────┐
│ public.user                          │
├──────────────────────────────────────┤
│ PK  userId       VARCHAR(50)         │  ← maps to auth.users.id (UUID)
│     username     VARCHAR(50)         │
│     firstName    VARCHAR(50)         │
│     lastName     VARCHAR(50)         │
│     email        VARCHAR(100)        │
│     user_type    VARCHAR(20)         │  USER | ADMIN | SUPERADMIN
│     record_status VARCHAR(10)        │  ACTIVE | INACTIVE
│     stamp        VARCHAR(60)         │
└────────┬─────────────────────────────┘
         │ 1
         │ has module access in
         │ N
┌────────▼─────────────────────────────┐     ┌────────────────────────────┐
│ user_module                          │     │ Module                     │
├──────────────────────────────────────┤     ├────────────────────────────┤
│ PK,FK userId    VARCHAR(50)          │     │ PK moduleId   VARCHAR(20)  │
│ PK,FK moduleId  VARCHAR(20) ────────────►  │    moduleName VARCHAR(50)  │
│       rights_value INTEGER           │     │    record_status VARCHAR   │
└──────────────────────────────────────┘     │    stamp     VARCHAR(60)  │
                                             └────────────────────────────┘

         │ 1
         │ has individual rights in
         │ N
┌────────▼─────────────────────────────┐     ┌────────────────────────────┐
│ UserModule_Rights                    │     │ rights                     │
├──────────────────────────────────────┤     ├────────────────────────────┤
│ PK,FK userId   VARCHAR(50)           │     │ PK rightId  VARCHAR(20)    │
│ PK,FK rightId  VARCHAR(20) ─────────────►  │    rightName VARCHAR(50)   │
│       right_value INTEGER            │     │    right_value INTEGER     │
└──────────────────────────────────────┘     │ FK moduleId  VARCHAR(20)   │
                                             │    record_status VARCHAR   │
                                             │    stamp     VARCHAR(60)  │
                                             └────────────────────────────┘
```

---

## Key Design Notes

| Rule | Where enforced |
|------|---------------|
| No hard deletes | Application code + no DELETE RLS policies on `sales`/`salesDetail` |
| INACTIVE rows hidden from USER | `sales_visibility` + `salesdetail_visibility` RLS policies (007) |
| Cascade soft-delete | `on_sales_status_change` trigger (006) |
| Lookup tables are read-only | No INSERT/UPDATE/DELETE RLS policies on `customer`, `employee`, `product`, `priceHist` (007) |
| ADMIN cannot modify SUPERADMIN | `user_update_admin` policy checks `user_type != 'SUPERADMIN'` (009) |
| New registrations start INACTIVE | `provision_new_user()` trigger (005) sets `record_status = 'INACTIVE'` |
| Current price = MAX(effDate) | Used in all views; `priceHist` stores full history per product |

---

## 13 Rights Summary

| rightId | Module | SUPERADMIN | ADMIN | USER |
|---------|--------|-----------|-------|------|
| SALES_VIEW | Sales_Mod | 1 | 1 | 1 |
| SALES_ADD | Sales_Mod | 1 | 1 | 0 |
| SALES_EDIT | Sales_Mod | 1 | 1 | 0 |
| SALES_DEL | Sales_Mod | 1 | 0 | 0 |
| SD_VIEW | SD_Mod | 1 | 1 | 1 |
| SD_ADD | SD_Mod | 1 | 1 | 0 |
| SD_EDIT | SD_Mod | 1 | 1 | 0 |
| SD_DEL | SD_Mod | 1 | 0 | 0 |
| CUST_LOOKUP | Lookup_Mod | 1 | 1 | 1 |
| EMP_LOOKUP | Lookup_Mod | 1 | 1 | 1 |
| PROD_LOOKUP | Lookup_Mod | 1 | 1 | 1 |
| PRICE_LOOKUP | Lookup_Mod | 1 | 1 | 1 |
| ADM_USER | Adm_Mod | 1 | 1 | 0 |
