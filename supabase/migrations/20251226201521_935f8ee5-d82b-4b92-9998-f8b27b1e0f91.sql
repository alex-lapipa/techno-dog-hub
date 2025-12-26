-- Enable vector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Create dj_artists table for RAG retrieval
CREATE TABLE public.dj_artists (
  id SERIAL PRIMARY KEY,
  rank INTEGER NOT NULL,
  artist_name TEXT NOT NULL,
  real_name TEXT,
  nationality TEXT,
  born TEXT,
  died TEXT,
  years_active TEXT,
  subgenres TEXT[] DEFAULT '{}',
  labels TEXT[] DEFAULT '{}',
  top_tracks TEXT[] DEFAULT '{}',
  known_for TEXT,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX idx_dj_artists_embedding ON public.dj_artists 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);

-- Create text search index for fallback
CREATE INDEX idx_dj_artists_name ON public.dj_artists USING gin(to_tsvector('english', artist_name || ' ' || COALESCE(real_name, '') || ' ' || COALESCE(known_for, '')));

-- Enable RLS
ALTER TABLE public.dj_artists ENABLE ROW LEVEL SECURITY;

-- Public read access (reference data)
CREATE POLICY "DJ artists are publicly readable"
ON public.dj_artists
FOR SELECT
USING (true);

-- Admin write access
CREATE POLICY "Admins can manage DJ artists"
ON public.dj_artists
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create similarity search function
CREATE OR REPLACE FUNCTION public.search_dj_artists(
  query_embedding vector(1536),
  match_count INT DEFAULT 5,
  similarity_threshold FLOAT DEFAULT 0.5
)
RETURNS TABLE (
  id INT,
  rank INT,
  artist_name TEXT,
  real_name TEXT,
  nationality TEXT,
  years_active TEXT,
  subgenres TEXT[],
  labels TEXT[],
  top_tracks TEXT[],
  known_for TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dj_artists.id,
    dj_artists.rank,
    dj_artists.artist_name,
    dj_artists.real_name,
    dj_artists.nationality,
    dj_artists.years_active,
    dj_artists.subgenres,
    dj_artists.labels,
    dj_artists.top_tracks,
    dj_artists.known_for,
    (1 - (dj_artists.embedding <=> query_embedding))::FLOAT AS similarity
  FROM dj_artists
  WHERE dj_artists.embedding IS NOT NULL
    AND (1 - (dj_artists.embedding <=> query_embedding)) > similarity_threshold
  ORDER BY dj_artists.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;