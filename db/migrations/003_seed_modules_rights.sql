-- ============================================================
-- Migration 003: Seed 4 Modules and 13 Rights
-- Must run AFTER 002_rights_tables.sql
-- ============================================================

-- 4 Modules
INSERT INTO public.Module VALUES ('Sales_Mod','Sales Module','ACTIVE','SEEDED') ON CONFLICT DO NOTHING;
INSERT INTO public.Module VALUES ('SD_Mod','Sales Detail Module','ACTIVE','SEEDED') ON CONFLICT DO NOTHING;
INSERT INTO public.Module VALUES ('Lookup_Mod','Lookup Module','ACTIVE','SEEDED') ON CONFLICT DO NOTHING;
INSERT INTO public.Module VALUES ('Adm_Mod','Admin Module','ACTIVE','SEEDED') ON CONFLICT DO NOTHING;

-- 13 Rights
INSERT INTO public.rights VALUES ('SALES_VIEW','View Transactions',1,'Sales_Mod','ACTIVE','SEEDED') ON CONFLICT DO NOTHING;
INSERT INTO public.rights VALUES ('SALES_ADD','Create Transaction',1,'Sales_Mod','ACTIVE','SEEDED') ON CONFLICT DO NOTHING;
INSERT INTO public.rights VALUES ('SALES_EDIT','Edit Transaction',1,'Sales_Mod','ACTIVE','SEEDED') ON CONFLICT DO NOTHING;
INSERT INTO public.rights VALUES ('SALES_DEL','Soft Delete Transaction',1,'Sales_Mod','ACTIVE','SEEDED') ON CONFLICT DO NOTHING;
INSERT INTO public.rights VALUES ('SD_VIEW','View Sales Detail',1,'SD_Mod','ACTIVE','SEEDED') ON CONFLICT DO NOTHING;
INSERT INTO public.rights VALUES ('SD_ADD','Add Line Item',1,'SD_Mod','ACTIVE','SEEDED') ON CONFLICT DO NOTHING;
INSERT INTO public.rights VALUES ('SD_EDIT','Edit Line Item',1,'SD_Mod','ACTIVE','SEEDED') ON CONFLICT DO NOTHING;
INSERT INTO public.rights VALUES ('SD_DEL','Soft Delete Line Item',1,'SD_Mod','ACTIVE','SEEDED') ON CONFLICT DO NOTHING;
INSERT INTO public.rights VALUES ('CUST_LOOKUP','Look Up Customers',1,'Lookup_Mod','ACTIVE','SEEDED') ON CONFLICT DO NOTHING;
INSERT INTO public.rights VALUES ('EMP_LOOKUP','Look Up Employees',1,'Lookup_Mod','ACTIVE','SEEDED') ON CONFLICT DO NOTHING;
INSERT INTO public.rights VALUES ('PROD_LOOKUP','Look Up Products',1,'Lookup_Mod','ACTIVE','SEEDED') ON CONFLICT DO NOTHING;
INSERT INTO public.rights VALUES ('PRICE_LOOKUP','Look Up Price History',1,'Lookup_Mod','ACTIVE','SEEDED') ON CONFLICT DO NOTHING;
INSERT INTO public.rights VALUES ('ADM_USER','Admin Activate User',1,'Adm_Mod','ACTIVE','SEEDED') ON CONFLICT DO NOTHING;
