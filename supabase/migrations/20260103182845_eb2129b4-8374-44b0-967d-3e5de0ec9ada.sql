-- Fix Security Definer View: unified_artist_view
-- Set security_invoker = true to use calling user's permissions instead of view creator's

ALTER VIEW public.unified_artist_view SET (security_invoker = true);

-- Add search_path to critical security definer functions
-- This prevents search_path injection attacks

-- handle_new_user - critical auth function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, email, full_name, avatar_url)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- has_role - critical authorization function
CREATE OR REPLACE FUNCTION public.has_role(check_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = check_role
  );
END;
$$;

-- is_verified_community_member - community authorization
CREATE OR REPLACE FUNCTION public.is_verified_community_member()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.community_profiles
    WHERE user_id = auth.uid()
    AND status = 'verified'
  );
END;
$$;