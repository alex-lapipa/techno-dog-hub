-- The policies already exist, just need to drop the permissive public one if it's still there
DROP POLICY IF EXISTS "Public can view limited verified profile info" ON public.community_profiles;
DROP POLICY IF EXISTS "Verified profiles are publicly readable" ON public.community_profiles;