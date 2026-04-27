# Hope, Inc. Sales Management System

A capstone project for New Era University — BS Computer Science.  
Built with React 18 + Vite + Tailwind CSS + Supabase.

## Description

HopeSMS manages sales transactions and line items for Hope, Inc.  
It supports full CRUD on `sales` and `salesDetail`, uses soft-delete (never hard-delete),
and enforces role-based access (SUPERADMIN, ADMIN, USER) via Supabase RLS.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| Backend / DB | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (Email + Google OAuth) |
| Routing | React Router v6 |
| Testing | Vitest + React Testing Library |

## Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd HopeSMS-Sales-Mngmt-System

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Fill in your Supabase URL and anon key in .env

# 4. Start dev server
npm run dev
```

## Branching Strategy

| Branch | Purpose |
|---|---|
| `main` | Production — protected, PR only |
| `dev` | Integration — protected, PR only |
| `feature/*` | Feature work — branch from dev, PR back to dev |

**Flow:** `feature/xxx` → PR → `dev` → release PR → `main`

## PR Rules

- Never merge directly to `main` or `dev`
- Each PR must be reviewed by at least one teammate before merging
- Draft/unmerged PRs do not count toward sprint deliverables
- Commit messages follow: `feat:`, `fix:`, `chore:`, `test:`, `docs:`, `db:`

## Non-Negotiable Rules

- **No hard deletes** — only `record_status = 'INACTIVE'`
- INACTIVE records are invisible to USER accounts at UI and RLS level
- `customer`, `employee`, `product`, `priceHist` are **lookup-only** — never written to
- ADMIN cannot modify SUPERADMIN accounts
