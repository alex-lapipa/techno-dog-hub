-- Add RLS policy for admins to manage user_roles
CREATE POLICY "Admins can manage all user roles"
ON public.user_roles
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create a view to join users with their profiles and roles for admin management
CREATE OR REPLACE VIEW public.admin_user_overview AS
SELECT 
  p.id as profile_id,
  p.user_id,
  p.email,
  p.created_at,
  p.updated_at,
  COALESCE(ur.role, 'user'::app_role) as role,
  ur.id as role_id,
  cp.display_name,
  cp.status as community_status,
  cp.trust_score,
  cp.country,
  cp.city
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
LEFT JOIN public.community_profiles cp ON p.user_id = cp.user_id;

-- RLS for the view
ALTER VIEW public.admin_user_overview SET (security_invoker = on);

-- Function to grant admin role (can only be called by existing admins)
CREATE OR REPLACE FUNCTION public.grant_admin_role(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can grant admin roles';
  END IF;
  
  -- Insert or update role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN TRUE;
END;
$$;

-- Function to revoke admin role
CREATE OR REPLACE FUNCTION public.revoke_admin_role(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can revoke admin roles';
  END IF;
  
  -- Prevent self-demotion
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot revoke your own admin role';
  END IF;
  
  -- Delete admin role
  DELETE FROM public.user_roles 
  WHERE user_id = target_user_id AND role = 'admin'::app_role;
  
  RETURN TRUE;
END;
$$;