-- Brand Book Protection System
-- Only Alex Lawton (owner) can modify brand book content

-- Create brand_book_configs table for versioned, protected configs
CREATE TABLE public.brand_book_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_type TEXT NOT NULL CHECK (config_type IN ('techno_dog', 'techno_doggies')),
  config_data JSONB NOT NULL DEFAULT '{}',
  version INTEGER NOT NULL DEFAULT 1,
  is_locked BOOLEAN NOT NULL DEFAULT true,
  locked_by TEXT NOT NULL DEFAULT 'Alex Lawton',
  locked_reason TEXT DEFAULT 'Brand book is protected - source of truth',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE (config_type)
);

-- Create brand_book_audit_log for tracking any access attempts
CREATE TABLE public.brand_book_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_type TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('read', 'update_attempt', 'update_blocked', 'update_allowed')),
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brand_book_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_book_audit_log ENABLE ROW LEVEL SECURITY;

-- Function to check if user is Alex Lawton (the only authorized editor)
CREATE OR REPLACE FUNCTION public.is_brand_book_owner()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_email TEXT;
  authorized_emails TEXT[] := ARRAY[
    'alex@alexlawton.io',
    'alex@rmtv.io', 
    'alex.lawton@miramonte.io'
  ];
BEGIN
  -- Get current user's email
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Check if email is in authorized list
  RETURN user_email = ANY(authorized_emails);
END;
$$;

-- Function to log brand book access attempts
CREATE OR REPLACE FUNCTION public.log_brand_book_access(
  p_config_type TEXT,
  p_action TEXT,
  p_details JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  INSERT INTO brand_book_audit_log (config_type, action, user_id, user_email, details)
  VALUES (p_config_type, p_action, auth.uid(), user_email, p_details);
END;
$$;

-- RLS Policies for brand_book_configs

-- Anyone authenticated can READ
CREATE POLICY "Anyone can read brand book configs"
ON public.brand_book_configs
FOR SELECT
TO authenticated
USING (true);

-- ONLY Alex Lawton can INSERT
CREATE POLICY "Only brand book owner can insert"
ON public.brand_book_configs
FOR INSERT
TO authenticated
WITH CHECK (public.is_brand_book_owner());

-- ONLY Alex Lawton can UPDATE
CREATE POLICY "Only brand book owner can update"
ON public.brand_book_configs
FOR UPDATE
TO authenticated
USING (public.is_brand_book_owner())
WITH CHECK (public.is_brand_book_owner());

-- ONLY Alex Lawton can DELETE
CREATE POLICY "Only brand book owner can delete"
ON public.brand_book_configs
FOR DELETE
TO authenticated
USING (public.is_brand_book_owner());

-- RLS Policies for audit log

-- Admins can read audit log
CREATE POLICY "Admins can read brand book audit log"
ON public.brand_book_audit_log
FOR SELECT
TO authenticated
USING (public.has_role('admin'));

-- System can insert audit entries (via security definer function)
CREATE POLICY "System can insert audit entries"
ON public.brand_book_audit_log
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_brand_book_configs_type ON public.brand_book_configs(config_type);
CREATE INDEX idx_brand_book_audit_log_type ON public.brand_book_audit_log(config_type);
CREATE INDEX idx_brand_book_audit_log_user ON public.brand_book_audit_log(user_id);
CREATE INDEX idx_brand_book_audit_log_created ON public.brand_book_audit_log(created_at DESC);

-- Insert initial protected config records
INSERT INTO public.brand_book_configs (config_type, config_data, is_locked, locked_by, locked_reason)
VALUES 
  ('techno_dog', '{"status": "protected", "source": "src/config/design-system-techno-dog.json"}', true, 'Alex Lawton', 'Main design system - source of truth for techno.dog branding'),
  ('techno_doggies', '{"status": "protected", "source": "src/config/design-system-doggies.json"}', true, 'Alex Lawton', 'Mascot design system - source of truth for Techno Doggies branding');

-- Add comment for documentation
COMMENT ON TABLE public.brand_book_configs IS 'Protected brand book configurations. Only Alex Lawton can modify. Source of truth for all design systems.';