-- Drop the IVFFlat index (requires more data) and use HNSW instead
DROP INDEX IF EXISTS idx_dj_artists_embedding;

-- Create HNSW index which works better with smaller datasets
CREATE INDEX idx_dj_artists_embedding ON public.dj_artists 
USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);