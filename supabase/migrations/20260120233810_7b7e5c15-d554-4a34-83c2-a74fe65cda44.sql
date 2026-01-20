-- Grant Ron the owner, super_admin, and admin roles
INSERT INTO public.user_roles (user_id, role)
VALUES 
  ('2388ef9e-3fd6-4f14-8c07-f516021b69dd', 'owner'),
  ('2388ef9e-3fd6-4f14-8c07-f516021b69dd', 'super_admin'),
  ('2388ef9e-3fd6-4f14-8c07-f516021b69dd', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;