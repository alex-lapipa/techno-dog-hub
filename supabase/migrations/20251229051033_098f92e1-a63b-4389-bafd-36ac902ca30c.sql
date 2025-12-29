
-- Add embedding column to gear_catalog for vector search/RAG
ALTER TABLE gear_catalog ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create index for fast vector similarity search
CREATE INDEX IF NOT EXISTS gear_catalog_embedding_idx 
ON gear_catalog USING hnsw (embedding vector_cosine_ops);

-- Create function for semantic gear search
CREATE OR REPLACE FUNCTION search_gear_by_embedding(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id text,
  name text,
  brand text,
  category text,
  short_description text,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    gc.id,
    gc.name,
    gc.brand,
    gc.category,
    gc.short_description,
    1 - (gc.embedding <=> query_embedding) AS similarity
  FROM gear_catalog gc
  WHERE gc.embedding IS NOT NULL
    AND 1 - (gc.embedding <=> query_embedding) > match_threshold
  ORDER BY gc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
