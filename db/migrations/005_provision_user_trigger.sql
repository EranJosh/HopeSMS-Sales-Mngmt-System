-- Trigger: provision_new_user() — creates user row USER/INACTIVE, 4 module rows, 13 rights rows (SALES_VIEW=1, SD_VIEW=1, all LOOKUP=1, all ADD/EDIT/DEL/ADM=0)
-- ============================================================
-- Migration 005: provision_new_user() Trigger
-- Fires AFTER INSERT on auth.users.
-- Creates a USER/INACTIVE row in public.user and seeds:
--   - 4 module rows (Sales_Mod, SD_Mod, Lookup_Mod = 1; Adm_Mod = 0)
--   - 13 rights rows (VIEW + LOOKUP = 1; ADD/EDIT/DEL/ADM = 0)
-- Must run AFTER 002 and 003.
-- ============================================================

CREATE OR REPLACE FUNCTION public.provision_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.user (userId, username, firstName, lastName, email, user_type, record_status, stamp)
  VALUES (
    NEW.id::text,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'firstName', ''),
    COALESCE(NEW.raw_user_meta_data->>'lastName', ''),
    NEW.email,
    'USER',
    'INACTIVE',
    'AUTO-PROVISIONED ' || NOW()::text
  ) ON CONFLICT DO NOTHING;

  -- Modules: Sales, SD, Lookup = 1 (visible); Admin = 0
  INSERT INTO public.user_module (userId, moduleId, rights_value)
  SELECT NEW.id::text, moduleId, 1
  FROM public.Module
  WHERE moduleId IN ('Sales_Mod', 'SD_Mod', 'Lookup_Mod')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.user_module (userId, moduleId, rights_value)
  SELECT NEW.id::text, moduleId, 0
  FROM public.Module
  WHERE moduleId = 'Adm_Mod'
  ON CONFLICT DO NOTHING;

  -- Rights: VIEW + all LOOKUP = 1; ADD/EDIT/DEL/ADM = 0
  INSERT INTO public.UserModule_Rights (userId, rightId, right_value)
  SELECT NEW.id::text, rightId, 1
  FROM public.rights
  WHERE rightId IN ('SALES_VIEW','SD_VIEW','CUST_LOOKUP','EMP_LOOKUP','PROD_LOOKUP','PRICE_LOOKUP')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.UserModule_Rights (userId, rightId, right_value)
  SELECT NEW.id::text, rightId, 0
  FROM public.rights
  WHERE rightId IN ('SALES_ADD','SALES_EDIT','SALES_DEL','SD_ADD','SD_EDIT','SD_DEL','ADM_USER')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.provision_new_user();
