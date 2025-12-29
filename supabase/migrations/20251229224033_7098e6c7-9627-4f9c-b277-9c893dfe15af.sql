-- Fix Issue #15: Add search_path to functions that are missing it
-- Note: generate_referral_code and normalize_artist_name need search_path

CREATE OR REPLACE FUNCTION public.generate_referral_code()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.normalize_artist_name(name text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'),
      '\s+', ' ', 'g'
    )
  );
END;
$function$;

-- Fix Issue #18: Tighten agent_status UPDATE policy to admin-only
-- First drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can update agent status" ON public.agent_status;

-- Create admin-only update policy
CREATE POLICY "Admins can update agent status" 
ON public.agent_status 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'::app_role
  )
);

-- Add INSERT policy for service role (edge functions)
DROP POLICY IF EXISTS "Service role can insert agent status" ON public.agent_status;
CREATE POLICY "Service role can manage agent status" 
ON public.agent_status 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);