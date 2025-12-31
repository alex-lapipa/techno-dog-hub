-- Phase 0: Dog Agent Configuration & Observability
-- Read-only configuration table for feature flags

-- Create config table for dog agent settings
CREATE TABLE IF NOT EXISTS public.dog_agent_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  use_groq_for_simple BOOLEAN DEFAULT false,
  use_streaming BOOLEAN DEFAULT false,
  use_gpt5_for_complex BOOLEAN DEFAULT true,
  groq_enabled BOOLEAN DEFAULT false,
  groq_timeout_ms INTEGER DEFAULT 5000,
  max_tokens_simple INTEGER DEFAULT 500,
  max_tokens_balanced INTEGER DEFAULT 1500,
  max_tokens_complex INTEGER DEFAULT 2500,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default config
INSERT INTO public.dog_agent_config (id) VALUES ('default')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.dog_agent_config ENABLE ROW LEVEL SECURITY;

-- Admin-only write policy (dog agent is read-only)
CREATE POLICY "Admins can manage dog agent config"
ON public.dog_agent_config
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Read-only for service role (edge functions)
CREATE POLICY "Service can read config"
ON public.dog_agent_config
FOR SELECT
TO service_role
USING (true);

-- Add telemetry columns to analytics_events for model tracking
ALTER TABLE public.analytics_events 
ADD COLUMN IF NOT EXISTS model_selected TEXT,
ADD COLUMN IF NOT EXISTS model_tier TEXT,
ADD COLUMN IF NOT EXISTS latency_ms INTEGER,
ADD COLUMN IF NOT EXISTS token_count INTEGER,
ADD COLUMN IF NOT EXISTS provider TEXT,
ADD COLUMN IF NOT EXISTS routing_reason TEXT;

-- Create index for model analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_model_tier 
ON public.analytics_events (model_tier, created_at DESC)
WHERE event_type = 'dog_agent_chat';