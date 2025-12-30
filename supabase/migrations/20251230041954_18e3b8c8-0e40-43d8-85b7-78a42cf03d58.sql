
-- Fix unified_artist_view to avoid FULL JOIN issues
-- Drop and recreate with proper LEFT JOINs

DROP VIEW IF EXISTS unified_artist_view;

CREATE OR REPLACE VIEW unified_artist_view AS
WITH linked_artists AS (
  -- Get all canonical artists with their linked RAG data
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
    (dj.embedding IS NOT NULL) AS has_embedding,
    asm.mapping_id,
    asm.source_system,
    asm.match_confidence,
    asm.match_method,
    CASE 
      WHEN dj.id IS NOT NULL THEN 'linked'
      ELSE 'canonical_only'
    END AS link_status
  FROM canonical_artists ca
  LEFT JOIN artist_source_map asm ON asm.artist_id = ca.artist_id 
    AND asm.source_system = 'rag' 
    AND asm.source_table = 'dj_artists'
  LEFT JOIN dj_artists dj ON asm.source_record_id = dj.id::text
),
orphan_rag AS (
  -- Get RAG-only artists (not in source_map)
  SELECT 
    NULL::uuid AS artist_id,
    dj.artist_name AS canonical_name,
    NULL AS slug,
    NULL AS city,
    dj.nationality AS country,
    NULL AS region,
    NULL::integer AS canonical_rank,
    NULL AS photo_url,
    NULL::boolean AS photo_verified,
    true AS needs_review,
    true AS is_active,
    dj.created_at AS canonical_created_at,
    dj.created_at AS canonical_updated_at,
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
    (dj.embedding IS NOT NULL) AS has_embedding,
    NULL::uuid AS mapping_id,
    NULL AS source_system,
    NULL::numeric AS match_confidence,
    NULL AS match_method,
    'rag_only' AS link_status
  FROM dj_artists dj
  WHERE NOT EXISTS (
    SELECT 1 FROM artist_source_map asm 
    WHERE asm.source_record_id = dj.id::text 
    AND asm.source_system = 'rag'
  )
)
SELECT * FROM linked_artists
UNION ALL
SELECT * FROM orphan_rag;

-- Add comment
COMMENT ON VIEW unified_artist_view IS 'Unified view of canonical and RAG artists with link status';
