-- RLS sales: SELECT (USER=ACTIVE only, ADMIN/SA=all); INSERT (SALES_ADD=1); UPDATE-edit (SALES_EDIT=1); UPDATE INACTIVE (SALES_DEL=1); UPDATE ACTIVE/recover (ADMIN/SA)
-- RLS salesDetail: same 4-policy pattern as sales using SD_ADD, SD_EDIT, SD_DEL rights
-- RLS lookup tables: customer, employee, product, priceHist -- SELECT only for all authenticated users. NO INSERT/UPDATE/DELETE policies exist on any of these four tables.
-- ============================================================
-- Migration 007: Row-Level Security Policies
-- Covers: sales, salesDetail, customer, employee, product, priceHist
-- Lookup tables (customer, employee, product, priceHist) have
-- SELECT-only policies — NO INSERT/UPDATE/DELETE policies exist.
-- Must run AFTER 001 and 002.
-- ============================================================

-- Enable RLS on all 6 HopeDB tables
ALTER TABLE public.sales       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salesDetail ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priceHist   ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- SALES — 4 policies (SELECT, INSERT, UPDATE-edit, UPDATE-delete)
-- --------------------------------------------------------

-- SELECT: ACTIVE rows visible to all; INACTIVE rows visible to ADMIN/SUPERADMIN only
DROP POLICY IF EXISTS sales_visibility ON public.sales;
CREATE POLICY sales_visibility ON public.sales
  FOR SELECT TO authenticated
  USING (
    record_status = 'ACTIVE'
    OR EXISTS (
      SELECT 1 FROM public.user
      WHERE userId = auth.uid()::text
        AND user_type IN ('ADMIN','SUPERADMIN')
    )
  );

-- INSERT: requires SALES_ADD = 1
DROP POLICY IF EXISTS sales_insert ON public.sales;
CREATE POLICY sales_insert ON public.sales
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.UserModule_Rights
      WHERE userId = auth.uid()::text
        AND rightId = 'SALES_ADD'
        AND right_value = 1
    )
  );

-- UPDATE (edit fields): requires SALES_EDIT = 1
DROP POLICY IF EXISTS sales_update ON public.sales;
CREATE POLICY sales_update ON public.sales
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.UserModule_Rights
      WHERE userId = auth.uid()::text
        AND rightId = 'SALES_EDIT'
        AND right_value = 1
    )
  );

-- UPDATE (soft-delete / recover record_status): requires SALES_DEL = 1
DROP POLICY IF EXISTS sales_softdelete ON public.sales;
CREATE POLICY sales_softdelete ON public.sales
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.UserModule_Rights
      WHERE userId = auth.uid()::text
        AND rightId = 'SALES_DEL'
        AND right_value = 1
    )
  );

-- --------------------------------------------------------
-- SALESDETAIL — same 4-policy pattern
-- --------------------------------------------------------

-- SELECT: ACTIVE rows visible to all; INACTIVE rows visible to ADMIN/SUPERADMIN only
DROP POLICY IF EXISTS salesdetail_visibility ON public.salesDetail;
CREATE POLICY salesdetail_visibility ON public.salesDetail
  FOR SELECT TO authenticated
  USING (
    record_status = 'ACTIVE'
    OR EXISTS (
      SELECT 1 FROM public.user
      WHERE userId = auth.uid()::text
        AND user_type IN ('ADMIN','SUPERADMIN')
    )
  );

-- INSERT: requires SD_ADD = 1
DROP POLICY IF EXISTS salesdetail_insert ON public.salesDetail;
CREATE POLICY salesdetail_insert ON public.salesDetail
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.UserModule_Rights
      WHERE userId = auth.uid()::text
        AND rightId = 'SD_ADD'
        AND right_value = 1
    )
  );

-- UPDATE (edit fields): requires SD_EDIT = 1
DROP POLICY IF EXISTS salesdetail_update ON public.salesDetail;
CREATE POLICY salesdetail_update ON public.salesDetail
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.UserModule_Rights
      WHERE userId = auth.uid()::text
        AND rightId = 'SD_EDIT'
        AND right_value = 1
    )
  );

-- UPDATE (soft-delete / recover): requires SD_DEL = 1
DROP POLICY IF EXISTS salesdetail_softdelete ON public.salesDetail;
CREATE POLICY salesdetail_softdelete ON public.salesDetail
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.UserModule_Rights
      WHERE userId = auth.uid()::text
        AND rightId = 'SD_DEL'
        AND right_value = 1
    )
  );

-- --------------------------------------------------------
-- LOOKUP TABLES — SELECT only, NO write policies
-- --------------------------------------------------------

DROP POLICY IF EXISTS customer_lookup ON public.customer;
CREATE POLICY customer_lookup ON public.customer
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS employee_lookup ON public.employee;
CREATE POLICY employee_lookup ON public.employee
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS product_lookup ON public.product;
CREATE POLICY product_lookup ON public.product
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS pricehist_lookup ON public.priceHist;
CREATE POLICY pricehist_lookup ON public.priceHist
  FOR SELECT TO authenticated USING (true);

-- NOTE: No INSERT, UPDATE, or DELETE policies exist on customer, employee,
-- product, or priceHist. These tables are lookup-only by design.
