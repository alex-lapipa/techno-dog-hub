-- ═══════════════════════════════════════════════════════════════════════════
-- CANONICAL ARTIST DATABASE SCHEMA
-- Non-destructive migration - creates new tables without modifying existing ones
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable pgvector extension if not exists (for embeddings)
CREATE EXTENSION IF NOT EXISTS vector;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. CANONICAL ARTISTS TABLE - Single source of truth
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.canonical_artists (
  artist_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name TEXT NOT NULL,
  sort_name TEXT NOT NULL, -- For alphabetical sorting (e.g., "Mills, Jeff")
  slug TEXT UNIQUE NOT NULL, -- URL-friendly identifier
  real_name TEXT,
  primary_genre TEXT DEFAULT 'techno',
  country TEXT,
  city TEXT,
  region TEXT,
  active_years TEXT,
  rank INTEGER, -- Global ranking for sorting
  is_active BOOLEAN DEFAULT true,
  needs_review BOOLEAN DEFAULT false, -- Flag for merge conflicts
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_canonical_artists_slug ON public.canonical_artists(slug);
CREATE INDEX idx_canonical_artists_name ON public.canonical_artists(canonical_name);
CREATE INDEX idx_canonical_artists_rank ON public.canonical_artists(rank);

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. ARTIST PROFILES - Multi-source profile data with conflict resolution
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.artist_profiles (
  profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES public.canonical_artists(artist_id) ON DELETE CASCADE,
  bio_long TEXT,
  bio_short TEXT,
  press_notes TEXT,
  labels TEXT[],
  collaborators TEXT[],
  influences TEXT[],
  crews TEXT[],
  subgenres TEXT[],
  tags TEXT[],
  known_for TEXT,
  top_tracks TEXT[],
  career_highlights TEXT[],
  social_links JSONB DEFAULT '{}',
  key_releases JSONB DEFAULT '[]', -- Array of {title, label, year, format}
  -- Provenance tracking
  source_system TEXT NOT NULL, -- 'legacy', 'rag', 'content_sync', 'manual'
  source_record_id TEXT, -- Original ID from source system
  source_payload JSONB, -- Raw snapshot of original data
  source_priority INTEGER DEFAULT 50, -- Higher = more trusted (1-100)
  confidence_score NUMERIC(3,2) DEFAULT 0.5, -- 0.00 to 1.00
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_artist_profiles_artist ON public.artist_profiles(artist_id);
CREATE INDEX idx_artist_profiles_source ON public.artist_profiles(source_system);

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. ARTIST ALIASES - Handle name variations and deduplication
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.artist_aliases (
  alias_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES public.canonical_artists(artist_id) ON DELETE CASCADE,
  alias_name TEXT NOT NULL,
  alias_type TEXT DEFAULT 'alias', -- 'alias', 'aka', 'real_name', 'typo', 'previous_name'
  source_system TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_artist_aliases_artist ON public.artist_aliases(artist_id);
CREATE INDEX idx_artist_aliases_name ON public.artist_aliases(alias_name);
-- Lowercase index for case-insensitive matching
CREATE INDEX idx_artist_aliases_name_lower ON public.artist_aliases(LOWER(alias_name));

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. ARTIST ASSETS - Images, photos, avatars with licensing
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.artist_assets (
  asset_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES public.canonical_artists(artist_id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL DEFAULT 'photo', -- 'photo', 'avatar', 'press', 'logo'
  url TEXT NOT NULL,
  storage_path TEXT, -- If stored in Supabase storage
  alt_text TEXT,
  author TEXT,
  license TEXT,
  license_url TEXT,
  source_url TEXT,
  source_name TEXT,
  is_primary BOOLEAN DEFAULT false,
  quality_score INTEGER DEFAULT 50, -- 1-100
  copyright_status TEXT DEFAULT 'unknown', -- 'clear', 'unknown', 'restricted'
  source_system TEXT,
  source_record_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_artist_assets_artist ON public.artist_assets(artist_id);
CREATE INDEX idx_artist_assets_primary ON public.artist_assets(artist_id, is_primary) WHERE is_primary = true;

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. ARTIST GEAR - Studio/live/DJ equipment data
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.artist_gear (
  gear_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES public.canonical_artists(artist_id) ON DELETE CASCADE,
  gear_category TEXT NOT NULL, -- 'studio', 'live', 'dj', 'rider'
  gear_items TEXT[],
  rider_notes TEXT,
  source_system TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_artist_gear_artist ON public.artist_gear(artist_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. ARTIST SOURCE MAP - Critical for data lineage and rollback
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.artist_source_map (
  mapping_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_system TEXT NOT NULL, -- 'dj_artists', 'legacy_ts', 'content_sync'
  source_table TEXT NOT NULL,
  source_record_id TEXT NOT NULL,
  artist_id UUID REFERENCES public.canonical_artists(artist_id) ON DELETE SET NULL,
  match_confidence NUMERIC(3,2), -- 0.00 to 1.00
  match_method TEXT, -- 'exact_name', 'alias', 'slug', 'manual'
  is_merged BOOLEAN DEFAULT false,
  merged_into_artist_id UUID REFERENCES public.canonical_artists(artist_id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(source_system, source_table, source_record_id)
);

CREATE INDEX idx_source_map_artist ON public.artist_source_map(artist_id);
CREATE INDEX idx_source_map_source ON public.artist_source_map(source_system, source_record_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. ARTIST DOCUMENTS - Unified RAG document store
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.artist_documents (
  document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES public.canonical_artists(artist_id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'bio', 'press_release', 'interview', 'article', 'notes', 'review'
  title TEXT,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  chunk_index INTEGER DEFAULT 0,
  chunk_id TEXT GENERATED ALWAYS AS (document_id::text || '-' || chunk_index::text) STORED, -- Deterministic chunk ID
  embedding vector(1536), -- OpenAI text-embedding-3-small dimension
  source_system TEXT,
  source_record_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_artist_documents_artist ON public.artist_documents(artist_id);
CREATE INDEX idx_artist_documents_type ON public.artist_documents(document_type);
CREATE INDEX idx_artist_documents_chunk ON public.artist_documents(chunk_id);

-- Vector similarity search index
CREATE INDEX idx_artist_documents_embedding ON public.artist_documents 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

-- ═══════════════════════════════════════════════════════════════════════════
-- 8. MERGE CANDIDATES - For review queue
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.artist_merge_candidates (
  candidate_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_a_id UUID NOT NULL REFERENCES public.canonical_artists(artist_id) ON DELETE CASCADE,
  artist_b_id UUID NOT NULL REFERENCES public.canonical_artists(artist_id) ON DELETE CASCADE,
  match_score NUMERIC(3,2) NOT NULL, -- 0.00 to 1.00
  match_reasons JSONB DEFAULT '[]', -- Array of reasons for match
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'merged'
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_merge_candidates_status ON public.artist_merge_candidates(status);

-- ═══════════════════════════════════════════════════════════════════════════
-- 9. MIGRATION LOG - Track all data migration operations
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.artist_migration_log (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation TEXT NOT NULL, -- 'import', 'merge', 'update', 'delete'
  source_system TEXT,
  source_record_id TEXT,
  target_artist_id UUID,
  details JSONB,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_migration_log_date ON public.artist_migration_log(created_at);

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable RLS on all new tables
ALTER TABLE public.canonical_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_gear ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_source_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_merge_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_migration_log ENABLE ROW LEVEL SECURITY;

-- Public read access for artist data
CREATE POLICY "Canonical artists are publicly readable" ON public.canonical_artists FOR SELECT USING (true);
CREATE POLICY "Artist profiles are publicly readable" ON public.artist_profiles FOR SELECT USING (true);
CREATE POLICY "Artist aliases are publicly readable" ON public.artist_aliases FOR SELECT USING (true);
CREATE POLICY "Artist assets are publicly readable" ON public.artist_assets FOR SELECT USING (true);
CREATE POLICY "Artist gear is publicly readable" ON public.artist_gear FOR SELECT USING (true);
CREATE POLICY "Artist documents are publicly readable" ON public.artist_documents FOR SELECT USING (true);

-- Admin write access
CREATE POLICY "Admins can manage canonical artists" ON public.canonical_artists FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
  
CREATE POLICY "Admins can manage artist profiles" ON public.artist_profiles FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
  
CREATE POLICY "Admins can manage artist aliases" ON public.artist_aliases FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
  
CREATE POLICY "Admins can manage artist assets" ON public.artist_assets FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
  
CREATE POLICY "Admins can manage artist gear" ON public.artist_gear FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
  
CREATE POLICY "Admins can manage artist source maps" ON public.artist_source_map FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
  
CREATE POLICY "Admins can manage artist documents" ON public.artist_documents FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
  
CREATE POLICY "Admins can manage merge candidates" ON public.artist_merge_candidates FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
  
CREATE POLICY "Admins can view migration logs" ON public.artist_migration_log FOR SELECT 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

-- Service role full access (for edge functions)
CREATE POLICY "Service role can manage canonical artists" ON public.canonical_artists FOR ALL 
  USING ((auth.jwt() ->> 'role') = 'service_role');
CREATE POLICY "Service role can manage artist profiles" ON public.artist_profiles FOR ALL 
  USING ((auth.jwt() ->> 'role') = 'service_role');
CREATE POLICY "Service role can manage artist aliases" ON public.artist_aliases FOR ALL 
  USING ((auth.jwt() ->> 'role') = 'service_role');
CREATE POLICY "Service role can manage artist assets" ON public.artist_assets FOR ALL 
  USING ((auth.jwt() ->> 'role') = 'service_role');
CREATE POLICY "Service role can manage artist gear" ON public.artist_gear FOR ALL 
  USING ((auth.jwt() ->> 'role') = 'service_role');
CREATE POLICY "Service role can manage artist source maps" ON public.artist_source_map FOR ALL 
  USING ((auth.jwt() ->> 'role') = 'service_role');
CREATE POLICY "Service role can manage artist documents" ON public.artist_documents FOR ALL 
  USING ((auth.jwt() ->> 'role') = 'service_role');
CREATE POLICY "Service role can manage merge candidates" ON public.artist_merge_candidates FOR ALL 
  USING ((auth.jwt() ->> 'role') = 'service_role');
CREATE POLICY "Service role can manage migration logs" ON public.artist_migration_log FOR ALL 
  USING ((auth.jwt() ->> 'role') = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════
-- HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_canonical_artist_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_canonical_artists_timestamp BEFORE UPDATE ON public.canonical_artists
  FOR EACH ROW EXECUTE FUNCTION update_canonical_artist_timestamp();
CREATE TRIGGER update_artist_profiles_timestamp BEFORE UPDATE ON public.artist_profiles
  FOR EACH ROW EXECUTE FUNCTION update_canonical_artist_timestamp();
CREATE TRIGGER update_artist_assets_timestamp BEFORE UPDATE ON public.artist_assets
  FOR EACH ROW EXECUTE FUNCTION update_canonical_artist_timestamp();
CREATE TRIGGER update_artist_gear_timestamp BEFORE UPDATE ON public.artist_gear
  FOR EACH ROW EXECUTE FUNCTION update_canonical_artist_timestamp();
CREATE TRIGGER update_artist_source_map_timestamp BEFORE UPDATE ON public.artist_source_map
  FOR EACH ROW EXECUTE FUNCTION update_canonical_artist_timestamp();
CREATE TRIGGER update_artist_documents_timestamp BEFORE UPDATE ON public.artist_documents
  FOR EACH ROW EXECUTE FUNCTION update_canonical_artist_timestamp();

-- Function to search artist documents by embedding
CREATE OR REPLACE FUNCTION search_artist_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10,
  filter_artist_id uuid DEFAULT NULL
)
RETURNS TABLE (
  document_id uuid,
  artist_id uuid,
  document_type text,
  title text,
  content text,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ad.document_id,
    ad.artist_id,
    ad.document_type,
    ad.title,
    ad.content,
    1 - (ad.embedding <=> query_embedding) as similarity
  FROM artist_documents ad
  WHERE ad.embedding IS NOT NULL
    AND (filter_artist_id IS NULL OR ad.artist_id = filter_artist_id)
    AND 1 - (ad.embedding <=> query_embedding) > match_threshold
  ORDER BY ad.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to normalize artist names for matching
CREATE OR REPLACE FUNCTION normalize_artist_name(name text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'), -- Remove special chars
      '\s+', ' ', 'g' -- Normalize whitespace
    )
  );
END;
$$;