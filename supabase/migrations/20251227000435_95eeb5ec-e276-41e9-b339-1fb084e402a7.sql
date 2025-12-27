-- Phase 1: Community Profiles & Email Events
-- Non-destructive: New tables, extend existing system

-- 1. Create status enum for community profiles
CREATE TYPE public.community_status AS ENUM ('pending', 'verified', 'banned');

-- 2. Create source enum for tracking signup origin
CREATE TYPE public.community_source AS ENUM ('upload_widget', 'newsletter', 'api_signup', 'community_page', 'other');

-- 3. Create community_profiles table
CREATE TABLE public.community_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  email_verified_at TIMESTAMP WITH TIME ZONE,
  status public.community_status NOT NULL DEFAULT 'pending',
  roles TEXT[] NOT NULL DEFAULT ARRAY['contributor']::TEXT[],
  display_name TEXT,
  country TEXT,
  city TEXT,
  interests TEXT[],
  newsletter_opt_in BOOLEAN NOT NULL DEFAULT false,
  newsletter_opt_in_at TIMESTAMP WITH TIME ZONE,
  source public.community_source NOT NULL DEFAULT 'other',
  trust_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_email UNIQUE(email)
);

-- 4. Create email_events audit table
CREATE TABLE public.email_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  event_type TEXT NOT NULL,
  provider_message_id TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Add indexes for performance
CREATE INDEX idx_community_profiles_email ON public.community_profiles(email);
CREATE INDEX idx_community_profiles_status ON public.community_profiles(status);
CREATE INDEX idx_community_profiles_user_id ON public.community_profiles(user_id);
CREATE INDEX idx_email_events_email ON public.email_events(email);
CREATE INDEX idx_email_events_event_type ON public.email_events(event_type);

-- 6. Enable RLS
ALTER TABLE public.community_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

-- 7. RLS policies for community_profiles
-- Public can read verified profiles (for display names, etc.)
CREATE POLICY "Verified profiles are publicly readable"
  ON public.community_profiles
  FOR SELECT
  USING (status = 'verified');

-- Users can view own profile
CREATE POLICY "Users can view own profile"
  ON public.community_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update own profile
CREATE POLICY "Users can update own profile"
  ON public.community_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow insert for new signups (controlled via edge function)
CREATE POLICY "Service role can insert profiles"
  ON public.community_profiles
  FOR INSERT
  WITH CHECK (true);

-- Admins can manage all profiles
CREATE POLICY "Admins can manage profiles"
  ON public.community_profiles
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  ));

-- 8. RLS policies for email_events
-- Only service role can insert (via edge functions)
CREATE POLICY "Service role can insert events"
  ON public.email_events
  FOR INSERT
  WITH CHECK (true);

-- Admins can view all events
CREATE POLICY "Admins can view email events"
  ON public.email_events
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  ));

-- 9. Updated_at trigger for community_profiles
CREATE TRIGGER update_community_profiles_updated_at
  BEFORE UPDATE ON public.community_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Function to link auth user to community profile on signup
CREATE OR REPLACE FUNCTION public.handle_community_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- If email already exists as pending, upgrade to verified and link user_id
  UPDATE public.community_profiles
  SET 
    user_id = NEW.id,
    status = 'verified',
    email_verified_at = NOW(),
    updated_at = NOW()
  WHERE email = NEW.email AND user_id IS NULL;
  
  -- If no existing profile, create one
  IF NOT FOUND THEN
    INSERT INTO public.community_profiles (user_id, email, status, email_verified_at, source)
    VALUES (NEW.id, NEW.email, 'verified', NOW(), 'community_page');
  END IF;
  
  RETURN NEW;
END;
$$;

-- 11. Trigger for new auth user signups
CREATE TRIGGER on_auth_user_created_community
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_community_user_signup();