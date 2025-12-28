-- Fix #2: Add RLS policies to ip_rate_limits table (currently has RLS enabled but no policies)
-- This table stores rate limiting data per IP address

-- Add policy for service role to manage rate limits (edge functions use service role)
CREATE POLICY "Service role can manage rate limits"
ON public.ip_rate_limits
FOR ALL
USING (true)
WITH CHECK (true);

-- Add policy for admins to view rate limit data for monitoring
CREATE POLICY "Admins can view rate limits"
ON public.ip_rate_limits
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = 'admin'::app_role
));