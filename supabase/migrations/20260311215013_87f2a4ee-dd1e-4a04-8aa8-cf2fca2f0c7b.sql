CREATE OR REPLACE FUNCTION public.search_labels_documents_voyage(
  query_embedding vector,
  match_threshold double precision DEFAULT 0.4,
  match_count integer DEFAULT 5
)
RETURNS TABLE(
  id uuid,
  label_id uuid,
  document_type text,
  title text,
  content text,
  similarity double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ld.id,
    ld.label_id,
    ld.document_type,
    ld.title,
    ld.content,
    1 - (ld.voyage_embedding <=> query_embedding) AS similarity
  FROM labels_documents ld
  WHERE ld.voyage_embedding IS NOT NULL
    AND 1 - (ld.voyage_embedding <=> query_embedding) > match_threshold
  ORDER BY ld.voyage_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;