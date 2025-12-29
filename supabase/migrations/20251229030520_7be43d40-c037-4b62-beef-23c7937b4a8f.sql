-- Fix search_path on the new functions
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
SET search_path = ''
AS $$
DECLARE
  v_total_canonical integer;
  v_total_rag integer;
  v_linked integer;
BEGIN
  SELECT COUNT(*) INTO v_total_canonical FROM public.canonical_artists;
  SELECT COUNT(*) INTO v_total_rag FROM public.dj_artists;
  
  SELECT COUNT(DISTINCT ca.artist_id) INTO v_linked
  FROM public.canonical_artists ca
  JOIN public.artist_source_map asm ON asm.artist_id = ca.artist_id
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

-- Fix find_unlinked_artists function
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
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'rag'::text AS source,
    dj.id::text,
    dj.artist_name AS name,
    ca.canonical_name AS potential_match_name,
    ca.artist_id::text AS potential_match_id,
    public.similarity(LOWER(dj.artist_name), LOWER(ca.canonical_name)) AS similarity
  FROM public.dj_artists dj
  LEFT JOIN public.artist_source_map asm 
    ON asm.source_record_id = dj.id::text 
    AND asm.source_system = 'rag'
  LEFT JOIN public.canonical_artists ca 
    ON public.similarity(LOWER(dj.artist_name), LOWER(ca.canonical_name)) > 0.4
  WHERE asm.mapping_id IS NULL
  ORDER BY similarity DESC NULLS LAST
  LIMIT p_limit;
END;
$$;