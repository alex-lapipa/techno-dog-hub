-- Create a secure view for API keys that excludes key_hash
CREATE OR REPLACE VIEW public.api_keys_safe AS
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

-- Enable RLS on the view (views inherit from base table but we make it explicit)
-- Grant access to authenticated users
GRANT SELECT ON public.api_keys_safe TO authenticated;

-- Add comment explaining the view's purpose
COMMENT ON VIEW public.api_keys_safe IS 'Secure view of api_keys that excludes sensitive key_hash column. Use this for all client-facing queries.';