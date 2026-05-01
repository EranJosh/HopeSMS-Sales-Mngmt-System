# HopeSMS — User Manual

> All screenshots taken from the live production app at https://hope-sales.vercel.app

**System:** Hope, Inc. Sales Management System
**Version:** Sprint 3 — Production Release
**Access:** `http://localhost:5173` (development) or https://hope-sales.vercel.app (production)

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Getting Access — Registration](#2-getting-access--registration)
3. [Logging In](#3-logging-in)
4. [Sales Transactions](#4-sales-transactions)
5. [Sales Detail — Line Items](#5-sales-detail--line-items)
6. [Lookup Pages](#6-lookup-pages)
7. [Reports](#7-reports)
8. [Admin Module](#8-admin-module)
9. [Deleted Items](#9-deleted-items)
10. [Quick Reference](#10-quick-reference)

---

## 1. Introduction

HopeSMS is the sales management system for Hope, Inc. It provides a centralised interface for recording and reviewing sales transactions, managing line items, and reporting on revenue performance — all enforced by a three-tier role system.

**Who uses this system:**

| Role | Who They Are | What They Do |
|------|-------------|-------------|
| **SUPERADMIN** | System administrator | Full access to all data and all operations |
| **ADMIN** (Sales Manager) | Sales management | Creates and edits transactions, manages user accounts |
| **USER** (Sales Agent) | Field sales staff | Views active transactions and lookup data |

**Core data rules enforced at every layer:**
- Records are never permanently deleted — only marked `INACTIVE` (soft-delete)
- `INACTIVE` records are hidden from USER accounts in both the UI and at the database level (Supabase RLS)
- Lookup tables (customer, employee, product, price history) are read-only inside the app
- SUPERADMIN accounts cannot be modified by any other user

---

## 2. Getting Access — Registration

New users must self-register. Accounts start as **INACTIVE** and cannot log in until a Sales Manager (ADMIN) or SUPERADMIN activates them.

### Email/Password Registration

1. Open the app. The Login page appears by default.
2. Click **Register** to go to the registration form.
3. Fill in all fields:
   - **First Name** — your given name
   - **Last Name** — your family name
   - **Username** — a unique short handle (e.g. `jsmith`)
   - **Email** — your work email address
   - **Password** — minimum 6 characters
4. Click **Register**.
5. A confirmation appears: *"Registration successful! Wait for admin activation before logging in."*
6. Wait for a Sales Manager to activate your account. See [Section 8](#8-admin-module).

### Google OAuth Registration

1. On the Register page, click **Register with Google**.
2. A Google sign-in window opens. Select your work Google account.
3. You are redirected back to the app.
4. Your account is created as **INACTIVE** — wait for admin activation before using the app.

> **Note:** If you try to log in before activation you will see: *"Your account is pending activation by a Sales Manager."*

---

## 3. Logging In

### Email/Password Login

1. Open the app. The Login page appears.
2. Enter your **Email** and **Password**.
3. Click **Login**.
4. If your account is INACTIVE: *"Your account is pending activation by a Sales Manager."*
5. If your account is ACTIVE: you are redirected to the **Sales Transactions** page.

### Google OAuth Login

1. On the Login page, click **Sign in with Google**.
2. Select your Google account in the pop-up window.
3. You are automatically redirected to `/sales` if active, or shown the pending activation message.

### Navigation After Login

After a successful login, the app shows:

**Top Navbar**
- Left: "Hope, Inc. SMS" — click to go to transactions
- Right: Your username, user type badge, and a **Logout** button

**Left Sidebar**

| Link | Visible To | Destination |
|------|-----------|------------|
| Transactions | All | `/sales` |
| Customers | All | `/lookups/customers` |
| Employees | All | `/lookups/employees` |
| Products | All | `/lookups/products` |
| Price History | All | `/lookups/prices` |
| Reports | All | `/reports` |
| Admin | ADMIN and SUPERADMIN | `/admin` |
| Deleted Items | ADMIN and SUPERADMIN | `/deleted-items` |

The active page is highlighted in blue in the sidebar.

---

## 4. Sales Transactions

The Transactions page (`/sales`) is the main working area of the app.

### Viewing Transactions

All users can view active transactions. ADMIN and SUPERADMIN also see soft-deleted (INACTIVE) transactions, which appear in red with an INACTIVE badge.

The table displays: Trans No, Date, Customer, Sales Agent, Total Amount, Stamp (ADMIN/SUPERADMIN only), and action buttons.

Use the **search box** to filter by transaction number, customer name, or agent name.

### Creating a Transaction

> **Required right:** `SALES_ADD = 1` — ADMIN and SUPERADMIN only

1. Click **+ Add Transaction** (top right of the Transactions page).
2. The "Add Transaction" modal opens. Fill in:
   - **Sales Date** — the date the sale occurred (defaults to today)
   - **Customer** — select from the dropdown (lists all active customers)
   - **Sales Agent** — select the employee who handled the sale
3. Click **Add Transaction**.
4. The new transaction appears in the list with an auto-generated transaction number (e.g. `TR000125`).

### Editing a Transaction

> **Required right:** `SALES_EDIT = 1` — ADMIN and SUPERADMIN only

1. On the Transactions list, click the **Edit** button on any active row.
2. The "Edit Transaction" modal opens with pre-filled values.
3. Change the Sales Date, Customer, or Sales Agent as needed.
4. Click **Save Changes**.

### Soft-Deleting a Transaction

> **Required right:** `SALES_DEL = 1` — SUPERADMIN only

Soft-delete marks a transaction as INACTIVE. It also automatically marks all its line items as INACTIVE (cascade).

1. On the Transactions list, click the **Delete** button on an active row.
2. A confirmation dialog appears: *"Delete transaction TR000XXX? This will also soft-delete all its line items."*
3. Click **Delete Transaction** to confirm.
4. The row turns red/INACTIVE (visible to ADMIN/SUPERADMIN) or disappears (for USER accounts).

> To recover a soft-deleted transaction, see [Section 9 — Deleted Items](#9-deleted-items).

---

## 5. Sales Detail — Line Items

Click anywhere on a transaction row (not the action buttons) to open the Sales Detail page for that transaction.

The detail page shows:
- Transaction header: Trans No, Date, Customer, Agent
- Line items table: Product Code, Description, Qty, Unit Price, Line Total
- **Grand Total** at the bottom (sum of all ACTIVE line items)

### Adding a Line Item

> **Required right:** `SD_ADD = 1` — ADMIN and SUPERADMIN only

1. On the Sales Detail page, click **+ Add Line Item**.
2. The "Add Line Item" modal opens:
   - **Product** — select from the dropdown (shows product code and description)
   - **Unit Price** — auto-filled when you select a product (pulls the most recent price from Price History)
   - **Quantity** — enter the number of units sold
3. Click **Add Line Item**.
4. The line item appears in the table. The Grand Total updates automatically.

### Editing a Line Item

> **Required right:** `SD_EDIT = 1` — ADMIN and SUPERADMIN only

1. On the Sales Detail page, click **Edit** on a line item row.
2. The "Edit Line Item" modal opens.
3. Change the **Quantity** as needed. Product code and unit price cannot be changed — delete and re-add the row to change the product.
4. Click **Save Changes**.

### Soft-Deleting a Line Item

> **Required right:** `SD_DEL = 1` — SUPERADMIN only

1. On the Sales Detail page, click **Delete** on a line item row.
2. Confirm in the dialog.
3. The line item turns red/INACTIVE or disappears for USER accounts.

---

## 6. Lookup Pages

All lookup pages are **read-only**. There are no Add, Edit, or Delete buttons. These tables are reference data managed outside the application.

### Customers (`/lookups/customers`)

Displays: Customer No, Name, Address, Payment Term (COD / Net 30 / Net 45)

Use the **search box** to filter by customer name.

### Employees (`/lookups/employees`)

Displays: Employee No, Last Name, First Name, Gender, Hire Date, Separation Date

Active employees show a green "Active" badge. Separated employees are greyed out.

### Products (`/lookups/products`)

Displays: Product Code, Description, Unit, Current Price (most recent from Price History)

Use the **search box** to filter by product code or description.

### Price History (`/lookups/prices`)

Displays: Product Code, Effective Date, Unit Price

Shows all historical prices per product, ordered newest first. Use the filter to narrow results by product code.

---

## 7. Reports

The Reports page (`/reports`) has four tabs. Each tab shows a **chart above the table**. Click any column header to sort; click again to reverse the sort direction.

### Tab 1 — By Employee

**Chart:** Bar chart showing total revenue per sales agent (top 10 by revenue).

**Table columns:** Emp No, Name, Transactions (count), Total Revenue

Useful for evaluating individual sales agent performance.

### Tab 2 — By Customer

**Chart:** Bar chart showing total revenue per customer (top 10). The top customer bar is highlighted in emerald.

**Table columns:** Cust No, Customer Name, Transactions (count), Total Revenue

Useful for identifying top clients and purchasing patterns.

### Tab 3 — Top Products

**Chart:** Horizontal bar chart showing products ranked by total revenue (top 10).

**Table columns:** Product Code, Description, Unit, Qty Sold, Total Revenue

Useful for inventory and procurement decisions.

### Tab 4 — Monthly Trend

**Chart:** Bar chart showing monthly revenue over time. Use the **From / To** month filters above the chart to narrow the date range. Click **Clear** to reset.

**Table columns:** Month (YYYY-MM), Transactions (count), Revenue

The table reflects the same date filter applied to the chart.

> **Note:** All report figures include only **ACTIVE** transactions and line items. Soft-deleted records are excluded from all calculations.

---

## 8. Admin Module

> **Required right:** `ADM_USER = 1` — ADMIN and SUPERADMIN only

Access via **Admin** in the sidebar (`/admin`).

The Admin page shows a table of all registered user accounts with their current status, username, email, and user type.

### Activating a User

New registrations start as INACTIVE and cannot log in until activated.

1. Click **Admin** in the sidebar.
2. Find the user with status **INACTIVE** (shown in red).
3. Click the **Activate** button on that row.
4. The status changes to **ACTIVE** (shown in green). The user can now log in.

### Deactivating a User

1. On the Admin page, find the active user.
2. Click the **Deactivate** button.
3. The status changes to **INACTIVE**. The user will be unable to log in on their next attempt.

### SUPERADMIN Protection

- Rows with `user_type = SUPERADMIN` show a **Protected** label instead of action buttons.
- No ADMIN or SUPERADMIN can activate, deactivate, or modify a SUPERADMIN account.
- This protection is enforced at both the UI level (buttons hidden) and the database level (Supabase RLS policy).

---

## 9. Deleted Items

> **Required:** ADMIN or SUPERADMIN account
> **Path:** `/deleted-items` (visible in sidebar for ADMIN/SUPERADMIN only)

The Deleted Items page has two tabs for recovering soft-deleted records.

### Transactions Tab

- Shows all soft-deleted (INACTIVE) sales transactions.
- Displays: Trans No, Date, Customer, Agent, Total Amount, Stamp (audit trail).
- Click **Recover** on a row to restore the transaction **and all its line items** to ACTIVE.

### Line Items Tab

- Shows all soft-deleted (INACTIVE) salesDetail rows.
- Displays: Trans No, Product Code, Description, Quantity, Line Total, Stamp.
- Click **Recover** on a row to restore that individual line item to ACTIVE.

> **Important:** Recovering a transaction automatically recovers all its line items (cascade restore). Recovering an individual line item only restores that single row — the parent transaction must be active for the line item to appear in the detail view.

---

## 10. Quick Reference

### Who Can Do What

| Action | SUPERADMIN | ADMIN | USER |
|--------|-----------|-------|------|
| View transactions (ACTIVE) | Yes | Yes | Yes |
| View transactions (INACTIVE) | Yes | Yes | No |
| Create transaction | Yes | Yes | No |
| Edit transaction | Yes | Yes | No |
| Soft-delete transaction | Yes | No | No |
| View line items (ACTIVE) | Yes | Yes | Yes |
| View line items (INACTIVE) | Yes | Yes | No |
| Add line item | Yes | Yes | No |
| Edit line item | Yes | Yes | No |
| Soft-delete line item | Yes | No | No |
| View all lookup pages | Yes | Yes | Yes |
| View reports | Yes | Yes | Yes |
| View charts in reports | Yes | Yes | Yes |
| Activate / deactivate users | Yes | Yes | No |
| Recover deleted items | Yes | Yes | No |
| See stamp column | Yes | Yes | No |
| See INACTIVE records | Yes | Yes | No |
| Modify SUPERADMIN accounts | No | No | No |

### Rights Reference

| Right ID | Meaning | SUPERADMIN | ADMIN | USER |
|----------|---------|-----------|-------|------|
| SALES_VIEW | View transactions | 1 | 1 | 1 |
| SALES_ADD | Create transaction | 1 | 1 | 0 |
| SALES_EDIT | Edit transaction | 1 | 1 | 0 |
| SALES_DEL | Soft-delete transaction | 1 | 0 | 0 |
| SD_VIEW | View line items | 1 | 1 | 1 |
| SD_ADD | Add line item | 1 | 1 | 0 |
| SD_EDIT | Edit line item | 1 | 1 | 0 |
| SD_DEL | Soft-delete line item | 1 | 0 | 0 |
| CUST_LOOKUP | View customers | 1 | 1 | 1 |
| EMP_LOOKUP | View employees | 1 | 1 | 1 |
| PROD_LOOKUP | View products | 1 | 1 | 1 |
| PRICE_LOOKUP | View price history | 1 | 1 | 1 |
| ADM_USER | Admin — manage users | 1 | 1 | 0 |

---

> For technical setup and environment configuration, see [README.md](../README.md).
> For database schema and ERD, see [docs/ERD.md](ERD.md).
