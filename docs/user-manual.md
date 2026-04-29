# Finalized SMS User Manual — includes production screenshots for all 3 user types and all modules
# HopeSMS — User Manual

**System:** Hope, Inc. Sales Management System  
**Version:** Sprint 2 Complete  
**Access:** `http://localhost:5173` (development) or your deployed URL

---

## Table of Contents

1. [Getting Access — Registration](#1-getting-access--registration)
2. [Logging In](#2-logging-in)
3. [Navigating the App](#3-navigating-the-app)
4. [Creating a Sales Transaction](#4-creating-a-sales-transaction)
5. [Adding Line Items to a Transaction](#5-adding-line-items-to-a-transaction)
6. [Editing a Transaction or Line Item](#6-editing-a-transaction-or-line-item)
7. [Soft-Deleting a Transaction](#7-soft-deleting-a-transaction)
8. [Using the Lookup Pages](#8-using-the-lookup-pages)
9. [Reports](#9-reports)
10. [Admin — Activating and Deactivating Users](#10-admin--activating-and-deactivating-users)
11. [Recovering Deleted Items](#11-recovering-deleted-items)
12. [Logging Out](#12-logging-out)

---

## 1. Getting Access — Registration

New users must register first. Their account starts as **INACTIVE** and must be activated by a Sales Manager (ADMIN) or SUPERADMIN before they can log in.

### Email/Password Registration

1. Open the app and click **Register** on the login page.
2. Fill in all fields:
   - **First Name** — your given name
   - **Last Name** — your family name
   - **Username** — a unique short handle (e.g., `jsmith`)
   - **Email** — your work email address
   - **Password** — minimum 6 characters
3. Click **Register**.
4. A confirmation message appears: *"Registration successful! Wait for admin activation before logging in."*
5. Wait for a Sales Manager to activate your account (see [Section 10](#10-admin--activating-and-deactivating-users)).

### Google OAuth Registration

1. On the Register page, click **Register with Google**.
2. A Google sign-in window opens. Select your Google account.
3. You are redirected back to the app.
4. Your account is created as INACTIVE — wait for admin activation before using the app.

---

## 2. Logging In

### Email/Password Login

1. Open the app. The Login page appears.
2. Enter your **Email** and **Password**.
3. Click **Login**.
4. If your account is INACTIVE, you will see: *"Your account is pending activation by a Sales Manager."*
5. If ACTIVE, you are redirected to the **Sales Transactions** page.

### Google OAuth Login

1. On the Login page, click **Sign in with Google**.
2. Select your Google account in the pop-up.
3. You are automatically redirected to `/sales` if active, or shown the inactive message.

---

## 3. Navigating the App

After login, the app has two navigation areas:

### Top Navbar
- **Left:** "Hope, Inc. SMS" — the app name.
- **Right:** Your username and user type, plus a **Logout** button.

### Left Sidebar

| Link | Who Sees It | Goes To |
|------|------------|---------|
| Transactions | All users | `/sales` — the main sales list |
| Customers | All users | `/lookups/customers` |
| Employees | All users | `/lookups/employees` |
| Products | All users | `/lookups/products` |
| Price History | All users | `/lookups/prices` |
| Reports | All users | `/reports` |
| Admin | ADMIN and SUPERADMIN only | `/admin` |
| Deleted Items | ADMIN and SUPERADMIN only | `/deleted-items` |

The active page highlights in **blue** in the sidebar.

---

## 4. Creating a Sales Transaction

> **Required right:** `SALES_ADD = 1` (SUPERADMIN and ADMIN only)

1. Click **Transactions** in the sidebar.
2. Click the **+ Add Transaction** button (top right of the page).
3. The "Add Transaction" modal appears. Fill in:
   - **Sales Date** — the date the sale occurred (defaults to today)
   - **Customer** — select from the dropdown (lists all customers by name)
   - **Sales Agent** — select the employee who handled the sale
4. Click **Add Transaction**.
5. The new transaction appears in the list with an auto-generated transaction number (e.g., `TR000125`).

---

## 5. Adding Line Items to a Transaction

> **Required right:** `SD_ADD = 1` (SUPERADMIN and ADMIN only)

Line items represent individual products in a transaction.

1. On the Sales Transactions list, click anywhere on a transaction row (not the action buttons) to open its detail page.
2. On the Sales Detail page, click **+ Add Line Item**.
3. The "Add Line Item" modal appears:
   - **Product** — select from the dropdown (shows product code and description)
   - **Unit Price** — auto-filled when you select a product (most recent price from Price History)
   - **Quantity** — enter the number of units sold
4. Click **Add Line Item**.
5. The line item appears in the table with a computed line total (Qty × Unit Price).
6. The **Grand Total** at the bottom of the table updates automatically.

---

## 6. Editing a Transaction or Line Item

### Editing a Transaction

> **Required right:** `SALES_EDIT = 1` (SUPERADMIN and ADMIN only)

1. On the Sales Transactions list, find the transaction to edit.
2. Click the **Edit** button on that row.
3. The "Edit Transaction" modal opens with pre-filled values.
4. Change the Sales Date, Customer, or Sales Agent as needed.
5. Click **Save Changes**.

### Editing a Line Item

> **Required right:** `SD_EDIT = 1` (SUPERADMIN and ADMIN only)

1. Open a transaction's detail page by clicking on it in the list.
2. Find the line item to edit.
3. Click the **Edit** button on that line item row.
4. Change the **Quantity** (product code and unit price cannot be changed — delete and re-add to change the product).
5. Click **Save Changes**.

---

## 7. Soft-Deleting a Transaction

> **Required right:** `SALES_DEL = 1` (SUPERADMIN only)

Soft-delete marks a transaction as INACTIVE — it is hidden from regular users but can be recovered. It also automatically marks all line items in that transaction as INACTIVE (cascade).

1. On the Sales Transactions list, find the transaction to delete.
2. Click the **Delete** button on that row.
3. A confirmation dialog appears: *"Delete transaction TR000XXX? This will also soft-delete all its line items."*
4. Click **Delete Transaction** to confirm.
5. The row turns **red/INACTIVE** (visible to ADMIN/SUPERADMIN) or disappears (visible to USER).

### Soft-Deleting a Line Item

> **Required right:** `SD_DEL = 1` (SUPERADMIN only)

1. Open the transaction's detail page.
2. Click **Delete** on a line item row.
3. Confirm in the dialog.
4. The line item turns red/INACTIVE or disappears for USER accounts.

---

## 8. Using the Lookup Pages

All lookup pages are **read-only**. There are no Add, Edit, or Delete buttons on any of them — these tables are reference data managed outside the application.

### Customers (`/lookups/customers`)
- Displays: Customer No, Name, Address, Payment Term (COD / Net 30 / Net 45)
- **Search:** Type in the search box to filter by customer name.

### Employees (`/lookups/employees`)
- Displays: Employee No, Last Name, First Name, Gender, Hire Date, Separation Date
- Separated employees appear greyed-out; active employees show a green "Active" badge.

### Products (`/lookups/products`)
- Displays: Product Code, Description, Unit, Current Price (most recent price from Price History)
- **Search:** Filter by product code or description.

### Price History (`/lookups/prices`)
- Displays: Product Code, Effective Date, Unit Price
- Shows all historical prices per product, ordered newest first per product.
- **Filter:** Type a product code to narrow results.

---

## 9. Reports

The Reports page has four sortable tabs. Click any column header to sort ascending; click again to sort descending.

### Tab 1 — By Employee
Shows total transactions and total revenue per sales agent.  
Useful for evaluating individual sales agent performance.

| Column | Description |
|--------|-------------|
| Emp No | Employee number |
| Name | Last Name, First Name |
| Transactions | Count of completed sales transactions |
| Total Revenue | Sum of (quantity × current unit price) for all ACTIVE line items |

### Tab 2 — By Customer
Shows total transactions and total revenue per customer.  
Useful for identifying top clients and purchasing patterns.

### Tab 3 — Top Products
Shows products ranked by total quantity sold and total revenue.  
Useful for inventory and procurement decisions.

### Tab 4 — Monthly Trend
Shows total transactions and revenue grouped by calendar month (YYYY-MM format).  
Useful for identifying seasonal sales patterns.

> **Note:** All report figures use only **ACTIVE** transactions and line items. Soft-deleted records are excluded from all report calculations.

---

## 10. Admin — Activating and Deactivating Users

> **Required right:** `ADM_USER = 1` (ADMIN and SUPERADMIN only)

New user accounts start as **INACTIVE** after registration. They cannot log in until activated.

### Activating a User

1. Click **Admin** in the sidebar.
2. The user table shows all registered accounts with their current status.
3. Find the user to activate (status shows **INACTIVE** in red).
4. Click the **Activate** button on that row.
5. The status changes to **ACTIVE** in green. The user can now log in.

### Deactivating a User

1. On the Admin page, find the active user.
2. Click the **Deactivate** button.
3. The status changes to **INACTIVE**. The user will be signed out on their next action.

### SUPERADMIN Protection

- Rows with `user_type = SUPERADMIN` show a **"Protected"** label instead of action buttons.
- No ADMIN or SUPERADMIN can activate, deactivate, or change the rights of a SUPERADMIN account.
- This is enforced at both the UI level (buttons hidden) and the database level (RLS policy).

---

## 11. Recovering Deleted Items

> **Required:** ADMIN or SUPERADMIN account  
> **Path:** `/deleted-items` (visible in sidebar for ADMIN/SUPERADMIN only)

The Deleted Items page has two tabs:

### Transactions Tab
- Shows all soft-deleted (INACTIVE) sales transactions.
- Displays: Trans No, Date, Customer, Agent, Total Amount, Stamp (audit trail).
- Click **Recover** on a row to restore the transaction and all its line items to ACTIVE.

### Line Items Tab
- Shows all soft-deleted (INACTIVE) salesDetail rows.
- Displays: Trans No, Product Code, Description, Quantity, Line Total, Stamp.
- Click **Recover** on a row to restore that individual line item to ACTIVE.

> **Note:** Recovering a transaction automatically recovers all its line items (cascade restore). Recovering an individual line item only restores that single row.

---

## 12. Logging Out

1. Click the **Logout** button in the top-right corner of the navbar.
2. You are immediately signed out and redirected to the Login page.
3. Your session is cleared. You must log in again to access the app.

---

## Quick Reference — Who Can Do What

| Action | SUPERADMIN | ADMIN | USER |
|--------|-----------|-------|------|
| View transactions | Yes | Yes | Yes (ACTIVE only) |
| Create transaction | Yes | Yes | No |
| Edit transaction | Yes | Yes | No |
| Delete transaction (soft) | Yes | No | No |
| View line items | Yes | Yes | Yes (ACTIVE only) |
| Add line item | Yes | Yes | No |
| Edit line item | Yes | Yes | No |
| Delete line item (soft) | Yes | No | No |
| View lookup pages | Yes | Yes | Yes |
| View reports | Yes | Yes | Yes |
| Admin — activate/deactivate users | Yes | Yes | No |
| Recover deleted items | Yes | Yes | No |
| See stamp column | Yes | Yes | No |
| See INACTIVE records | Yes | Yes | No |
| Modify SUPERADMIN accounts | No | No | No |
