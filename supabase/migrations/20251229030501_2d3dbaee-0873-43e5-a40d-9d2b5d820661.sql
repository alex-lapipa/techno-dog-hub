-- Fix security definer view issue by recreating as regular view
DROP VIEW IF EXISTS public.unified_artist_view;

CREATE VIEW public.unified_artist_view AS
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
    WHEN ca.artist_id IS NOT NULL AND dj.id IS NOT NULL THEN 'linked'
    WHEN ca.artist_id IS NOT NULL THEN 'canonical_only'
    WHEN dj.id IS NOT NULL THEN 'rag_only'
    ELSE 'orphan'
  END AS link_status
FROM canonical_artists ca
FULL OUTER JOIN artist_source_map asm 
  ON asm.artist_id = ca.artist_id 
  AND asm.source_system = 'rag'
  AND asm.source_table = 'dj_artists'
FULL OUTER JOIN dj_artists dj 
  ON asm.source_record_id = dj.id::text
  OR (asm.mapping_id IS NULL AND LOWER(TRIM(ca.canonical_name)) = LOWER(TRIM(dj.artist_name)));