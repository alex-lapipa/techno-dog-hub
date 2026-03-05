
-- Batch 2: Add voyage_embedding columns to all vector tables (ADDITIVE, NON-BREAKING)
-- Existing embedding columns and search functions remain untouched

-- 1. Add voyage_embedding vector(1024) columns
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS voyage_embedding vector(1024);
ALTER TABLE public.artist_documents ADD COLUMN IF NOT EXISTS voyage_embedding vector(1024);
ALTER TABLE public.dj_artists ADD COLUMN IF NOT EXISTS voyage_embedding vector(1024);
ALTER TABLE public.gear_catalog ADD COLUMN IF NOT EXISTS voyage_embedding vector(1024);
ALTER TABLE public.labels_documents ADD COLUMN IF NOT EXISTS voyage_embedding vector(1024);

-- 2. Create HNSW indexes for high-performance vector search
CREATE INDEX IF NOT EXISTS idx_documents_voyage_embedding ON public.documents 
  USING hnsw (voyage_embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_artist_documents_voyage_embedding ON public.artist_documents 
  USING hnsw (voyage_embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_dj_artists_voyage_embedding ON public.dj_artists 
  USING hnsw (voyage_embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_gear_catalog_voyage_embedding ON public.gear_catalog 
  USING hnsw (voyage_embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_labels_documents_voyage_embedding ON public.labels_documents 
  USING hnsw (voyage_embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- 3. Create Voyage-specific search functions (new, don't touch existing ones)

-- Search documents (books, RAG docs) via Voyage embeddings
CREATE OR REPLACE FUNCTION public.match_documents_voyage(
  query_embedding vector,
  match_threshold double precision DEFAULT 0.5,
  match_count integer DEFAULT 5
)
RETURNS TABLE(id uuid, title text, content text, metadata jsonb, source text, similarity double precision)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.title,
    d.content,
    d.metadata,
    d.source,
    1 - (d.voyage_embedding <=> query_embedding) AS similarity
  FROM documents d
  WHERE d.voyage_embedding IS NOT NULL
    AND 1 - (d.voyage_embedding <=> query_embedding) > match_threshold
  ORDER BY d.voyage_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Search artist documents via Voyage embeddings
CREATE OR REPLACE FUNCTION public.search_artist_documents_voyage(
  query_embedding vector,
  match_threshold double precision DEFAULT 0.5,
  match_count integer DEFAULT 10,
  filter_artist_id uuid DEFAULT NULL
)
RETURNS TABLE(document_id uuid, artist_id uuid, document_type text, title text, content text, similarity double precision)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ad.document_id,
    ad.artist_id,
    ad.document_type,
    ad.title,
    ad.content,
    1 - (ad.voyage_embedding <=> query_embedding) AS similarity
  FROM artist_documents ad
  WHERE ad.voyage_embedding IS NOT NULL
    AND (filter_artist_id IS NULL OR ad.artist_id = filter_artist_id)
    AND 1 - (ad.voyage_embedding <=> query_embedding) > match_threshold
  ORDER BY ad.voyage_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Search DJ artists via Voyage embeddings
CREATE OR REPLACE FUNCTION public.search_dj_artists_voyage(
  query_embedding vector,
  match_count integer DEFAULT 5,
  similarity_threshold double precision DEFAULT 0.5
)
RETURNS TABLE(id integer, rank integer, artist_name text, real_name text, nationality text, years_active text, subgenres text[], labels text[], top_tracks text[], known_for text, similarity double precision)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dj.id,
    dj.rank,
    dj.artist_name,
    dj.real_name,
    dj.nationality,
    dj.years_active,
    dj.subgenres,
    dj.labels,
    dj.top_tracks,
    dj.known_for,
    (1 - (dj.voyage_embedding <=> query_embedding))::FLOAT AS similarity
  FROM dj_artists dj
  WHERE dj.voyage_embedding IS NOT NULL
    AND (1 - (dj.voyage_embedding <=> query_embedding)) > similarity_threshold
  ORDER BY dj.voyage_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Search gear catalog via Voyage embeddings
CREATE OR REPLACE FUNCTION public.search_gear_by_voyage_embedding(
  query_embedding vector,
  match_threshold double precision DEFAULT 0.7,
  match_count integer DEFAULT 10
)
RETURNS TABLE(id text, name text, brand text, category text, short_description text, similarity double precision)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    gc.id,
    gc.name,
    gc.brand,
    gc.category,
    gc.short_description,
    1 - (gc.voyage_embedding <=> query_embedding) AS similarity
  FROM gear_catalog gc
  WHERE gc.voyage_embedding IS NOT NULL
    AND 1 - (gc.voyage_embedding <=> query_embedding) > match_threshold
  ORDER BY gc.voyage_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
