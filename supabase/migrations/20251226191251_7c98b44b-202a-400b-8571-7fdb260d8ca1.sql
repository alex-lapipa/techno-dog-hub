-- Create api_keys table for secure API key management
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Default API Key',
  prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- Create index for fast key lookups
CREATE INDEX idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_status ON public.api_keys(status);

-- Enable Row Level Security
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Users can view their own API keys
CREATE POLICY "Users can view own API keys"
ON public.api_keys
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own API keys
CREATE POLICY "Users can create own API keys"
ON public.api_keys
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own API keys (for revoking)
CREATE POLICY "Users can update own API keys"
ON public.api_keys
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own API keys
CREATE POLICY "Users can delete own API keys"
ON public.api_keys
FOR DELETE
USING (auth.uid() = user_id);

-- Service role policy for API validation (edge functions)
CREATE POLICY "Service role can read all keys"
ON public.api_keys
FOR SELECT
TO service_role
USING (true);

CREATE POLICY "Service role can update all keys"
ON public.api_keys
FOR UPDATE
TO service_role
USING (true);