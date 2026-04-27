-- ============================================================
-- Migration 004: SUPERADMIN Seed
--
-- INSTRUCTIONS:
--   1. Create jcesperanza@neu.edu.ph via Supabase Auth Dashboard
--      (Authentication → Users → Invite user)
--   2. Copy the UUID from the auth.users table for that user
--   3. Replace every occurrence of 'SUPERADMIN_UUID_HERE' below
--      with the actual UUID string before running this script
--
-- Must run AFTER 002 and 003.
-- ============================================================

INSERT INTO public.user (userId, username, firstName, lastName, email, user_type, record_status, stamp)
VALUES (
  'SUPERADMIN_UUID_HERE',
  'jcesperanza',
  'Jeremias',
  'Esperanza',
  'jcesperanza@neu.edu.ph',
  'SUPERADMIN',
  'ACTIVE',
  'SEEDED'
) ON CONFLICT DO NOTHING;

-- All 13 rights = 1 for SUPERADMIN
INSERT INTO public.UserModule_Rights (userId, rightId, right_value)
SELECT 'SUPERADMIN_UUID_HERE', rightId, 1
FROM public.rights
ON CONFLICT DO NOTHING;

-- All 4 module rows = 1 for SUPERADMIN
INSERT INTO public.user_module (userId, moduleId, rights_value)
SELECT 'SUPERADMIN_UUID_HERE', moduleId, 1
FROM public.Module
ON CONFLICT DO NOTHING;
