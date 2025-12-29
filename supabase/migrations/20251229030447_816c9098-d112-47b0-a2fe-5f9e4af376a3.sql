-- Create unified view joining dj_artists with canonical_artists for admin dashboards
CREATE OR REPLACE VIEW public.unified_artist_view AS
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
  -- RAG data from dj_artists
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
  -- Source map info
  asm.mapping_id,
  asm.source_system,
  asm.match_confidence,
  asm.match_method,
  -- Computed fields
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

-- Create function to get source map completeness stats
CREATE OR REPLACE FUNCTION public.get_source_map_stats()
RETURNS TABLE(
  total_canonical integer,
  total_rag integer,
  linked_count integer,
  canonical_only integer,
  rag_only integer,
  link_percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_total_canonical integer;
  v_total_rag integer;
  v_linked integer;
BEGIN
  SELECT COUNT(*) INTO v_total_canonical FROM canonical_artists;
  SELECT COUNT(*) INTO v_total_rag FROM dj_artists;
  
  SELECT COUNT(DISTINCT ca.artist_id) INTO v_linked
  FROM canonical_artists ca
  JOIN artist_source_map asm ON asm.artist_id = ca.artist_id
  WHERE asm.source_system = 'rag' AND asm.source_table = 'dj_artists';
  
  RETURN QUERY SELECT 
    v_total_canonical,
    v_total_rag,
    v_linked,
    v_total_canonical - v_linked,
    v_total_rag - v_linked,
    CASE WHEN v_total_rag > 0 
      THEN ROUND((v_linked::numeric / v_total_rag) * 100, 1)
      ELSE 0 
    END;
END;
$$;

-- Create function to find unlinked artists
CREATE OR REPLACE FUNCTION public.find_unlinked_artists(p_limit integer DEFAULT 50)
RETURNS TABLE(
  source text,
  id text,
  name text,
  potential_match_name text,
  potential_match_id text,
  similarity numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Find RAG artists without canonical links
  RETURN QUERY
  SELECT 
    'rag'::text AS source,
    dj.id::text,
    dj.artist_name AS name,
    ca.canonical_name AS potential_match_name,
    ca.artist_id::text AS potential_match_id,
    similarity(LOWER(dj.artist_name), LOWER(ca.canonical_name)) AS similarity
  FROM dj_artists dj
  LEFT JOIN artist_source_map asm 
    ON asm.source_record_id = dj.id::text 
    AND asm.source_system = 'rag'
  LEFT JOIN canonical_artists ca 
    ON similarity(LOWER(dj.artist_name), LOWER(ca.canonical_name)) > 0.4
  WHERE asm.mapping_id IS NULL
  ORDER BY similarity DESC NULLS LAST
  LIMIT p_limit;
END;
$$;