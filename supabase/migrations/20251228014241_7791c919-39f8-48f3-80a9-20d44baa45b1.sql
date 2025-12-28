-- FIX 5: Make admin_audit_log append-only (remove UPDATE/DELETE if they exist)
DROP POLICY IF EXISTS "Admins can update audit logs" ON public.admin_audit_log;
DROP POLICY IF EXISTS "Admins can delete audit logs" ON public.admin_audit_log;
DROP POLICY IF EXISTS "Anyone can update audit logs" ON public.admin_audit_log;
DROP POLICY IF EXISTS "Anyone can delete audit logs" ON public.admin_audit_log;

-- FIX 6: Ensure webhooks table has proper secret protection
-- The secret should only be visible to owner, not in any list queries
-- Already has RLS, just verify policies are correct
DROP POLICY IF EXISTS "Anyone can view webhooks" ON public.webhooks;

-- FIX 7: Move extensions to dedicated schema (this is informational - requires manual intervention)
-- Note: Moving pgvector and pg_net to extensions schema requires superuser access
-- This is a best practice but not blocking for the application

-- FIX 8: Ensure api_usage cannot be manipulated by users (only service_role writes)
DROP POLICY IF EXISTS "Users can insert own usage" ON public.api_usage;
DROP POLICY IF EXISTS "Users can update own usage" ON public.api_usage;
DROP POLICY IF EXISTS "Users can delete own usage" ON public.api_usage;