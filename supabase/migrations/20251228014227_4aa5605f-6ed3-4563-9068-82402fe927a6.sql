-- FIX 1b: Fix the security definer view issue by setting proper security invoker
DROP VIEW IF EXISTS public.public_community_profiles;

CREATE VIEW public.public_community_profiles 
WITH (security_invoker = true)
AS
SELECT 
  id,
  display_name,
  city,
  country,
  interests,
  roles,
  status,
  created_at
FROM public.community_profiles
WHERE status = 'verified'::community_status;

-- FIX 2: Secure admin_user_overview view - recreate with security invoker
-- First check what the view contains and recreate it properly
DROP VIEW IF EXISTS public.admin_user_overview;

CREATE VIEW public.admin_user_overview
WITH (security_invoker = true)
AS
SELECT 
  p.id as profile_id,
  p.user_id,
  p.email,
  cp.display_name,
  cp.city,
  cp.country,
  cp.trust_score,
  cp.status as community_status,
  ur.id as role_id,
  ur.role,
  p.created_at,
  p.updated_at
FROM public.profiles p
LEFT JOIN public.community_profiles cp ON p.user_id = cp.user_id
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id;

-- FIX 3: Add RLS policy for supporters table (verify it restricts to owner)
-- First check if RLS is enabled, then add proper policy
ALTER TABLE public.supporters ENABLE ROW LEVEL SECURITY;

-- Drop any existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view supporters" ON public.supporters;
DROP POLICY IF EXISTS "Public can view supporters" ON public.supporters;

-- Create proper owner-only and admin access policies
CREATE POLICY "Users can view own supporter record"
ON public.supporters
FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own supporter record"
ON public.supporters
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own supporter record"
ON public.supporters
FOR UPDATE
USING (auth.uid() = user_id);

-- FIX 4: Secure corporate_sponsor_requests - admin only SELECT
ALTER TABLE public.corporate_sponsor_requests ENABLE ROW LEVEL SECURITY;

-- Allow public to submit requests
CREATE POLICY "Anyone can submit sponsor request"
ON public.corporate_sponsor_requests
FOR INSERT
WITH CHECK (true);

-- Only admins can view requests
CREATE POLICY "Admins can view sponsor requests"
ON public.corporate_sponsor_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update requests
CREATE POLICY "Admins can update sponsor requests"
ON public.corporate_sponsor_requests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));