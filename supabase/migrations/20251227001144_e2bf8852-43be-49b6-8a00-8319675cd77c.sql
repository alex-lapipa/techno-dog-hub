-- Phase 3: Extend api_keys for community members with scopes
-- Non-destructive: add scopes column

-- 1. Add scopes column to api_keys
ALTER TABLE public.api_keys 
ADD COLUMN IF NOT EXISTS scopes TEXT[] NOT NULL DEFAULT ARRAY['read:public']::TEXT[];

-- 2. Add description column
ALTER TABLE public.api_keys 
ADD COLUMN IF NOT EXISTS description TEXT;

-- 3. Create index for scopes queries
CREATE INDEX IF NOT EXISTS idx_api_keys_scopes ON public.api_keys USING GIN(scopes);

-- 4. Create function to check if user is verified community member
CREATE OR REPLACE FUNCTION public.is_verified_community_member(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM community_profiles
    WHERE user_id = p_user_id
    AND status = 'verified'
  );
END;
$$;

-- 5. Update RLS policy for api_keys creation to require verified status
-- First drop the existing insert policy
DROP POLICY IF EXISTS "Users can create own API keys" ON public.api_keys;

-- Create new policy that requires verified community status
CREATE POLICY "Verified members can create API keys"
ON public.api_keys
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND is_verified_community_member(auth.uid())
);