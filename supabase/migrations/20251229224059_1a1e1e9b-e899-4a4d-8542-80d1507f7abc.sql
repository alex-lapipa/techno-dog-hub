-- Fix Issue #14: Add security_invoker to views to use caller's RLS context
-- This ensures views respect the querying user's permissions

-- Recreate views with security_invoker = true
DROP VIEW IF EXISTS public.admin_user_overview;
CREATE VIEW public.admin_user_overview 
WITH (security_invoker = true)
AS
SELECT 
  p.id AS profile_id,
  p.user_id,
  p.email,
  cp.display_name,
  cp.city,
  cp.country,
  cp.trust_score,
  cp.status AS community_status,
  ur.id AS role_id,
  ur.role,
  p.created_at,
  p.updated_at
FROM profiles p
LEFT JOIN community_profiles cp ON p.user_id = cp.user_id
LEFT JOIN user_roles ur ON p.user_id = ur.user_id;

DROP VIEW IF EXISTS public.api_keys_safe;
CREATE VIEW public.api_keys_safe
WITH (security_invoker = true)
AS
SELECT 
  id,
  user_id,
  name,
  description,
  prefix,
  status,
  scopes,
  rate_limit_per_minute,
  rate_limit_per_day,
  total_requests,
  last_used_at,
  usage_notification_sent_at,
  created_at
FROM api_keys;

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
FROM community_profiles
WHERE status = 'verified'::community_status;

DROP VIEW IF EXISTS public.unified_artist_view;
CREATE VIEW public.unified_artist_view
WITH (security_invoker = true)
AS
SELECT 
  ca.artist_id,
  ca.canonical_name,
  ca.slug,
  ca.city,
  ca.country,
  ca.region,
  ca.rank AS canonical_rank,
  ca.photo_url,
  ca.photo_verified,
  ca.needs_review,
  ca.is_active,
  ca.created_at AS canonical_created_at,
  ca.updated_at AS canonical_updated_at,
  dj.id AS rag_id,
  dj.artist_name AS rag_name,
  dj.rank AS rag_rank,
  dj.nationality,
  dj.subgenres,
  dj.labels,
  dj.top_tracks,
  dj.known_for,
  dj.real_name,
  dj.years_active,
  dj.embedding IS NOT NULL AS has_embedding,
  asm.mapping_id,
  asm.source_system,
  asm.match_confidence,
  asm.match_method,
  CASE
    WHEN ca.artist_id IS NOT NULL AND dj.id IS NOT NULL THEN 'linked'::text
    WHEN ca.artist_id IS NOT NULL THEN 'canonical_only'::text
    WHEN dj.id IS NOT NULL THEN 'rag_only'::text
    ELSE 'orphan'::text
  END AS link_status
FROM canonical_artists ca
FULL JOIN artist_source_map asm 
  ON asm.artist_id = ca.artist_id 
  AND asm.source_system = 'rag'::text 
  AND asm.source_table = 'dj_artists'::text
FULL JOIN dj_artists dj 
  ON asm.source_record_id = dj.id::text 
  OR (asm.mapping_id IS NULL AND lower(TRIM(BOTH FROM ca.canonical_name)) = lower(TRIM(BOTH FROM dj.artist_name)));