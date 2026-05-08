CREATE TABLE IF NOT EXISTS public.audit_log (
  id BIGSERIAL PRIMARY KEY,
  userid VARCHAR(50),
  username VARCHAR(50),
  user_type VARCHAR(20),
  action VARCHAR(50),
  target_table VARCHAR(50),
  target_id VARCHAR(50),
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only ADMIN and SUPERADMIN can read audit logs
CREATE POLICY audit_log_read ON public.audit_log FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user
    WHERE userid = auth.uid()::text
    AND user_type IN ('ADMIN', 'SUPERADMIN')
  )
);

-- All authenticated users can insert (for logging their own actions)
CREATE POLICY audit_log_insert ON public.audit_log FOR INSERT TO authenticated
WITH CHECK (true);

GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.audit_log_id_seq TO authenticated;
