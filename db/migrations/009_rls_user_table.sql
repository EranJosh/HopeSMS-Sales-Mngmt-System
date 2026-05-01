-- RLS user table: ADMIN can UPDATE record_status only WHERE user_type != SUPERADMIN. RLS UserModule_Rights: ADMIN cannot INSERT/UPDATE/DELETE rows where userid belongs to SUPERADMIN.
-- ============================================================
-- Migration 009: RLS Policies — user and UserModule_Rights Tables
-- Enforces: own-row access, ADMIN/SUPERADMIN read-all,
-- ADMIN cannot modify SUPERADMIN rows.
-- Must run AFTER 002_rights_tables.sql.
-- ============================================================

ALTER TABLE public.user              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.UserModule_Rights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_module       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.Module            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rights            ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- public.user policies
-- --------------------------------------------------------

-- Users can always read their own row
DROP POLICY IF EXISTS user_read_own ON public.user;
CREATE POLICY user_read_own ON public.user
  FOR SELECT TO authenticated
  USING (userId = auth.uid()::text);

-- ADMIN and SUPERADMIN can read all user rows
DROP POLICY IF EXISTS user_read_admin ON public.user;
CREATE POLICY user_read_admin ON public.user
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user u2
      WHERE u2.userId = auth.uid()::text
        AND u2.user_type IN ('ADMIN','SUPERADMIN')
    )
  );

-- ADMIN/SUPERADMIN can update user rows EXCEPT rows where user_type = 'SUPERADMIN'
-- This enforces: ADMIN cannot alter a SUPERADMIN account
DROP POLICY IF EXISTS user_update_admin ON public.user;
CREATE POLICY user_update_admin ON public.user
  FOR UPDATE TO authenticated
  USING (
    user_type != 'SUPERADMIN'
    AND EXISTS (
      SELECT 1 FROM public.user u2
      WHERE u2.userId = auth.uid()::text
        AND u2.user_type IN ('ADMIN','SUPERADMIN')
    )
  );

-- --------------------------------------------------------
-- public.UserModule_Rights policies
-- --------------------------------------------------------

-- Users can read their own rights (needed by AuthContext to load rights on login)
DROP POLICY IF EXISTS umr_read_own ON public.UserModule_Rights;
CREATE POLICY umr_read_own ON public.UserModule_Rights
  FOR SELECT TO authenticated
  USING (userId = auth.uid()::text);

-- ADMIN/SUPERADMIN can read all rights rows
DROP POLICY IF EXISTS umr_read_admin ON public.UserModule_Rights;
CREATE POLICY umr_read_admin ON public.UserModule_Rights
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user u
      WHERE u.userId = auth.uid()::text
        AND u.user_type IN ('ADMIN','SUPERADMIN')
    )
  );

-- --------------------------------------------------------
-- public.user_module policies
-- --------------------------------------------------------

DROP POLICY IF EXISTS um_read_own ON public.user_module;
CREATE POLICY um_read_own ON public.user_module
  FOR SELECT TO authenticated
  USING (userId = auth.uid()::text);

DROP POLICY IF EXISTS um_read_admin ON public.user_module;
CREATE POLICY um_read_admin ON public.user_module
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user u
      WHERE u.userId = auth.uid()::text
        AND u.user_type IN ('ADMIN','SUPERADMIN')
    )
  );

-- --------------------------------------------------------
-- public.Module and public.rights — readable by all authenticated users
-- (needed by AuthContext and rights-loading logic)
-- --------------------------------------------------------

DROP POLICY IF EXISTS module_read_all ON public.Module;
CREATE POLICY module_read_all ON public.Module
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS rights_read_all ON public.rights;
CREATE POLICY rights_read_all ON public.rights
  FOR SELECT TO authenticated USING (true);
