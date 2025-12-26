-- Create api_usage table for rate limiting and usage tracking
CREATE TABLE public.api_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT date_trunc('minute', now()),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for fast lookups
CREATE INDEX idx_api_usage_key_window ON public.api_usage(api_key_id, window_start);
CREATE INDEX idx_api_usage_user_id ON public.api_usage(user_id);
CREATE INDEX idx_api_usage_endpoint ON public.api_usage(endpoint);

-- Enable RLS
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- Service role can manage usage records
CREATE POLICY "Service role can manage usage"
ON public.api_usage
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can view their own usage
CREATE POLICY "Users can view own usage"
ON public.api_usage
FOR SELECT
USING (auth.uid() = user_id);

-- Add rate limit columns to api_keys
ALTER TABLE public.api_keys 
ADD COLUMN rate_limit_per_minute INTEGER NOT NULL DEFAULT 60,
ADD COLUMN rate_limit_per_day INTEGER NOT NULL DEFAULT 10000,
ADD COLUMN total_requests BIGINT NOT NULL DEFAULT 0;

-- Create function to check and increment rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_api_key_id UUID,
  p_user_id UUID,
  p_endpoint TEXT,
  p_limit_per_minute INTEGER DEFAULT 60
)
RETURNS TABLE(allowed BOOLEAN, current_count INTEGER, limit_remaining INTEGER, reset_at TIMESTAMP WITH TIME ZONE)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_current_count INTEGER;
  v_usage_id UUID;
BEGIN
  -- Get current minute window
  v_window_start := date_trunc('minute', now());
  
  -- Try to get existing usage record for this window
  SELECT id, request_count INTO v_usage_id, v_current_count
  FROM public.api_usage
  WHERE api_key_id = p_api_key_id
    AND window_start = v_window_start
    AND endpoint = p_endpoint
  FOR UPDATE;
  
  IF v_usage_id IS NULL THEN
    -- Create new record
    INSERT INTO public.api_usage (api_key_id, user_id, endpoint, window_start, request_count)
    VALUES (p_api_key_id, p_user_id, p_endpoint, v_window_start, 1)
    RETURNING id, request_count INTO v_usage_id, v_current_count;
  ELSE
    -- Increment existing record
    UPDATE public.api_usage
    SET request_count = request_count + 1
    WHERE id = v_usage_id
    RETURNING request_count INTO v_current_count;
  END IF;
  
  -- Update total requests on api_keys
  UPDATE public.api_keys
  SET total_requests = total_requests + 1
  WHERE id = p_api_key_id;
  
  -- Return rate limit status
  RETURN QUERY SELECT 
    v_current_count <= p_limit_per_minute AS allowed,
    v_current_count AS current_count,
    GREATEST(0, p_limit_per_minute - v_current_count) AS limit_remaining,
    v_window_start + INTERVAL '1 minute' AS reset_at;
END;
$$;

-- Create function to get daily usage
CREATE OR REPLACE FUNCTION public.get_daily_usage(p_api_key_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COALESCE(SUM(request_count), 0)::INTEGER INTO v_count
  FROM public.api_usage
  WHERE api_key_id = p_api_key_id
    AND window_start >= date_trunc('day', now());
  
  RETURN v_count;
END;
$$;

-- Create cleanup function for old usage records (keep 30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_api_usage()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM public.api_usage
  WHERE window_start < now() - INTERVAL '30 days';
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;