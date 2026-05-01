-- Trigger: on sales UPDATE OF record_status -- INACTIVE cascades all salesDetail rows to INACTIVE; ACTIVE restores all salesDetail rows to ACTIVE
-- ============================================================
-- Migration 006: Cascade Soft-Delete / Recover Trigger
-- When sales.record_status changes:
--   ACTIVE → INACTIVE  : sets all child salesDetail rows INACTIVE
--   INACTIVE → ACTIVE  : restores all child salesDetail rows ACTIVE
-- Must run AFTER 001_hopedb_base_tables.sql.
-- ============================================================

CREATE OR REPLACE FUNCTION public.cascade_sales_soft_delete()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Soft-delete cascade: mark all child line items INACTIVE
  IF NEW.record_status = 'INACTIVE' AND OLD.record_status = 'ACTIVE' THEN
    UPDATE public.salesDetail
    SET record_status = 'INACTIVE',
        stamp = 'CASCADE-DEL ' || NEW.transNo || ' ' || NOW()::text
    WHERE transNo = NEW.transNo;
  END IF;

  -- Recovery cascade: restore all child line items ACTIVE
  IF NEW.record_status = 'ACTIVE' AND OLD.record_status = 'INACTIVE' THEN
    UPDATE public.salesDetail
    SET record_status = 'ACTIVE',
        stamp = 'CASCADE-RECOVER ' || NEW.transNo || ' ' || NOW()::text
    WHERE transNo = NEW.transNo;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_sales_status_change ON public.sales;
CREATE TRIGGER on_sales_status_change
  AFTER UPDATE OF record_status ON public.sales
  FOR EACH ROW EXECUTE FUNCTION public.cascade_sales_soft_delete();
