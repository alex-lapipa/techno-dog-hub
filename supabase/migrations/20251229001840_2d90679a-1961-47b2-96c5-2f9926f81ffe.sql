
-- Upgrade artist_documents embedding index from IVFFlat to HNSW for better performance
-- Drop existing IVFFlat index
DROP INDEX IF EXISTS idx_artist_documents_embedding;

-- Create HNSW index (same as dj_artists for consistency)
CREATE INDEX idx_artist_documents_embedding_hnsw 
ON public.artist_documents 
USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);

-- Add index on artist_gear for faster lookups
CREATE INDEX IF NOT EXISTS idx_artist_gear_artist_id ON public.artist_gear(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_gear_category ON public.artist_gear(gear_category);

-- Add index on artist_claims for verification status queries
CREATE INDEX IF NOT EXISTS idx_artist_claims_status ON public.artist_claims(verification_status);
CREATE INDEX IF NOT EXISTS idx_artist_claims_artist_id ON public.artist_claims(artist_id);

-- Add index on artist_profiles for faster joins
CREATE INDEX IF NOT EXISTS idx_artist_profiles_artist_id ON public.artist_profiles(artist_id);

-- Add composite index on artist_aliases for name lookups
CREATE INDEX IF NOT EXISTS idx_artist_aliases_name ON public.artist_aliases(alias_name);
CREATE INDEX IF NOT EXISTS idx_artist_aliases_artist_id ON public.artist_aliases(artist_id);
