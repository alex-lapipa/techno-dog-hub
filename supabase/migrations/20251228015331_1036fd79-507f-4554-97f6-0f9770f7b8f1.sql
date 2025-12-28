-- Create table for IP-based rate limiting
CREATE TABLE IF NOT EXISTS public.ip_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ip_address, endpoint, window_start)
);

-- Create index for fast lookups
CREATE INDEX idx_ip_rate_limits_lookup ON public.ip_rate_limits(ip_address, endpoint, window_start);

-- Create index for cleanup
CREATE INDEX idx_ip_rate_limits_created ON public.ip_rate_limits(created_at);

-- Enable RLS (deny all direct access, only via RPC)
ALTER TABLE public.ip_rate_limits ENABLE ROW LEVEL SECURITY;

-- No policies = no direct access, only service role can access

-- Create atomic rate limit check function
CREATE OR REPLACE FUNCTION public.check_ip_rate_limit(
  p_ip_address TEXT,
  p_endpoint TEXT,
  p_limit_per_minute INTEGER DEFAULT 10
)
RETURNS TABLE(
  allowed BOOLEAN,
  current_count INTEGER,
  limit_remaining INTEGER,
  reset_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_current_count INTEGER;
  v_id UUID;
BEGIN
  -- Get current minute window
  v_window_start := date_trunc('minute', now());
  
  -- Try to get existing record for this window
  SELECT id, request_count INTO v_id, v_current_count
  FROM public.ip_rate_limits
  WHERE ip_address = p_ip_address
    AND endpoint = p_endpoint
    AND window_start = v_window_start
  FOR UPDATE;
  
  IF v_id IS NULL THEN
    -- Create new record
    INSERT INTO public.ip_rate_limits (ip_address, endpoint, window_start, request_count)
    VALUES (p_ip_address, p_endpoint, v_window_start, 1)
    RETURNING id, request_count INTO v_id, v_current_count;
  ELSE
    -- Increment existing record
    UPDATE public.ip_rate_limits
    SET request_count = request_count + 1
    WHERE id = v_id
    RETURNING request_count INTO v_current_count;
  END IF;
  
  -- Return rate limit status
  RETURN QUERY SELECT 
    v_current_count <= p_limit_per_minute AS allowed,
    v_current_count AS current_count,
    GREATEST(0, p_limit_per_minute - v_current_count) AS limit_remaining,
    v_window_start + INTERVAL '1 minute' AS reset_at;
END;
$$;

-- Create cleanup function for old rate limit records
CREATE OR REPLACE FUNCTION public.cleanup_old_ip_rate_limits()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM public.ip_rate_limits
  WHERE created_at < now() - INTERVAL '1 hour';
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;