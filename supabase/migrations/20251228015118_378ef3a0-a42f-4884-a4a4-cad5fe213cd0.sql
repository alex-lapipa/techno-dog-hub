-- Drop and recreate the view without SECURITY DEFINER (default is SECURITY INVOKER which is safer)
DROP VIEW IF EXISTS public.api_keys_safe;

CREATE VIEW public.api_keys_safe 
WITH (security_invoker = true) AS
SELECT 
  id,
  user_id,
  name,
  description,
  prefix,
  status,
  scopes,
  rate_limit_per_minute,
  rate_limit_per_day,
  total_requests,
  last_used_at,
  usage_notification_sent_at,
  created_at
FROM public.api_keys;

-- Grant access to authenticated users
GRANT SELECT ON public.api_keys_safe TO authenticated;

-- Add comment
COMMENT ON VIEW public.api_keys_safe IS 'Secure view of api_keys that excludes sensitive key_hash column. Uses SECURITY INVOKER for proper RLS enforcement.';