-- =====================================================
-- Phase 4.2: Enhance Rate Limiting for Public Endpoints
-- Add additional rate limiting infrastructure for tables
-- that allow anonymous inserts
-- =====================================================

-- Create a table to track public form submissions rate limits
CREATE TABLE IF NOT EXISTS public.public_submission_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT date_trunc('minute', now()),
  request_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (ip_hash, endpoint, window_start)
);

-- Enable RLS
ALTER TABLE public.public_submission_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table
CREATE POLICY "Service role only" ON public.public_submission_rate_limits
  FOR ALL USING (false);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_public_rate_limits_lookup 
  ON public.public_submission_rate_limits(ip_hash, endpoint, window_start);

-- Create function to check public submission rate limits
CREATE OR REPLACE FUNCTION public.check_public_submission_rate_limit(
  p_ip_hash TEXT,
  p_endpoint TEXT,
  p_limit_per_minute INTEGER DEFAULT 5
)
RETURNS TABLE(allowed BOOLEAN, current_count INTEGER, limit_remaining INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_current_count INTEGER;
BEGIN
  v_window_start := date_trunc('minute', now());
  
  -- Upsert the rate limit record
  INSERT INTO public.public_submission_rate_limits (ip_hash, endpoint, window_start, request_count)
  VALUES (p_ip_hash, p_endpoint, v_window_start, 1)
  ON CONFLICT (ip_hash, endpoint, window_start) 
  DO UPDATE SET request_count = public_submission_rate_limits.request_count + 1
  RETURNING request_count INTO v_current_count;
  
  RETURN QUERY SELECT 
    v_current_count <= p_limit_per_minute AS allowed,
    v_current_count AS current_count,
    GREATEST(0, p_limit_per_minute - v_current_count) AS limit_remaining;
END;
$$;

-- Cleanup function for old rate limit records
CREATE OR REPLACE FUNCTION public.cleanup_public_rate_limits()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM public.public_submission_rate_limits
  WHERE created_at < now() - INTERVAL '1 hour';
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- Add comments for documentation
COMMENT ON TABLE public.public_submission_rate_limits IS 'Rate limiting for anonymous public form submissions';
COMMENT ON FUNCTION public.check_public_submission_rate_limit IS 'Check and increment rate limit for public endpoints';