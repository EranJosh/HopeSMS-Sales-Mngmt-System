-- ============================================================
-- Migration 010: GRANT permissions to the authenticated role
--
-- Supabase's PostgREST API runs as the "authenticated" role for
-- logged-in users. Without these GRANTs, RLS policies are
-- evaluated but the underlying table/view access is denied,
-- causing silent empty results or "permission denied" errors.
--
-- Run AFTER all previous migrations.
-- Safe to re-run (GRANT is idempotent).
-- ============================================================

-- Lookup tables (read-only — no write grants intentionally)
GRANT SELECT ON public.customer       TO authenticated;
GRANT SELECT ON public.employee       TO authenticated;
GRANT SELECT ON public.product        TO authenticated;
GRANT SELECT ON public.pricehist      TO authenticated;

-- Managed tables (full CRUD — RLS policies restrict actual operations)
GRANT SELECT, INSERT, UPDATE ON public.sales       TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.salesdetail TO authenticated;

-- Auth / RBAC tables
GRANT SELECT        ON public.user             TO authenticated;
GRANT UPDATE        ON public.user             TO authenticated;
GRANT SELECT        ON public.module           TO authenticated;
GRANT SELECT        ON public.rights           TO authenticated;
GRANT SELECT        ON public.user_module      TO authenticated;
GRANT SELECT        ON public.usermodule_rights TO authenticated;

-- SQL views (read-only)
GRANT SELECT ON public.sales_with_lookup        TO authenticated;
GRANT SELECT ON public.salesdetail_with_product TO authenticated;
GRANT SELECT ON public.sales_by_employee        TO authenticated;
GRANT SELECT ON public.sales_by_customer        TO authenticated;
GRANT SELECT ON public.top_products_sold        TO authenticated;
GRANT SELECT ON public.monthly_sales_trend      TO authenticated;
