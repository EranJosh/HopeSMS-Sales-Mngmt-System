-- ============================================================
-- Migration 011: make the reporting views respect RLS
--
-- A PostgreSQL view runs with its owner's privileges by default,
-- so selecting from it skips the row-level-security policies on
-- the underlying tables. That let a USER account read soft-deleted
-- (INACTIVE) sales through sales_with_lookup and the report views,
-- even though sales_visibility hides those rows on public.sales.
--
-- security_invoker (PostgreSQL 15+, available on Supabase) makes
-- each view run as the calling user, so the table policies apply.
-- Also pins search_path on the SECURITY DEFINER signup trigger so
-- it cannot resolve objects from another schema.
--
-- Run AFTER 008 and 010. Safe to re-run.
-- ============================================================

ALTER VIEW public.sales_with_lookup       SET (security_invoker = true);
ALTER VIEW public.salesdetail_with_product SET (security_invoker = true);
ALTER VIEW public.sales_by_employee       SET (security_invoker = true);
ALTER VIEW public.sales_by_customer       SET (security_invoker = true);
ALTER VIEW public.top_products_sold       SET (security_invoker = true);
ALTER VIEW public.monthly_sales_trend     SET (security_invoker = true);

ALTER FUNCTION public.provision_new_user() SET search_path = public;
