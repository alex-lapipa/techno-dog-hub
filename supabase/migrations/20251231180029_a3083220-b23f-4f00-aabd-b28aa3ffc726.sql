-- STEP 1: Knowledge Layer Schema Extension
-- These tables extend the existing system without modifying any existing tables

-- 1) kl_sources - External data sources registry
CREATE TABLE public.kl_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- discogs, residentadvisor, bandcamp, wikipedia, etc
  base_url TEXT,
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2) kl_documents - Raw fetched materials cache
CREATE TABLE public.kl_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES public.kl_sources(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  raw_content TEXT,
  extracted_json JSONB,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  checksum TEXT, -- MD5/SHA for change detection
  content_type TEXT,
  status TEXT DEFAULT 'fetched', -- fetched, parsed, error
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(url)
);

-- 3) kl_entities - Canonical knowledge entities
CREATE TABLE public.kl_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- artist, label, venue, track, event, genre, city
  canonical_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL, -- lowercase, no special chars for matching
  external_refs JSONB DEFAULT '{}', -- {"discogs_id": "123", "ra_id": "456"}
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4) kl_facts - Append-only truth store with provenance
CREATE TABLE public.kl_facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES public.kl_entities(id) ON DELETE CASCADE,
  predicate TEXT NOT NULL, -- bio, country, label, release_date, etc
  value_text TEXT, -- simple text value
  value_json JSONB, -- complex structured value
  source_id UUID REFERENCES public.kl_sources(id) ON DELETE SET NULL,
  document_id UUID REFERENCES public.kl_documents(id) ON DELETE SET NULL,
  evidence_snippet TEXT, -- REQUIRED for zero-hallucination
  source_url TEXT,
  confidence FLOAT DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  status TEXT DEFAULT 'unverified', -- verified, unverified, conflict, superseded
  supersedes_id UUID REFERENCES public.kl_facts(id) ON DELETE SET NULL,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5) kl_enrichment_jobs - Background job tracking
CREATE TABLE public.kl_enrichment_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL, -- fetch_document, enrich_artist, scrape_source
  entity_id UUID REFERENCES public.kl_entities(id) ON DELETE CASCADE,
  params JSONB DEFAULT '{}',
  status TEXT DEFAULT 'queued', -- queued, running, success, failed, cancelled
  priority INTEGER DEFAULT 5,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  scheduled_for TIMESTAMPTZ DEFAULT now()
);

-- 6) kl_cached_search - Query response cache with TTL
CREATE TABLE public.kl_cached_search (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash TEXT NOT NULL,
  query_text TEXT,
  filters_json JSONB DEFAULT '{}',
  cache_type TEXT DEFAULT 'search', -- search, artist, label, venue
  result_json JSONB NOT NULL,
  hit_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_accessed_at TIMESTAMPTZ DEFAULT now()
);

-- 7) kl_change_log - Audit trail for all mutations (reversibility)
CREATE TABLE public.kl_change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor TEXT NOT NULL, -- user_id, 'system', 'enrichment_job:uuid'
  action TEXT NOT NULL, -- insert, update, delete
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  before_json JSONB,
  after_json JSONB,
  metadata JSONB DEFAULT '{}',
  reversible BOOLEAN DEFAULT true,
  reversed_at TIMESTAMPTZ,
  reversed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- INDEXES for performance

-- kl_documents indexes
CREATE INDEX idx_kl_documents_url ON public.kl_documents(url);
CREATE INDEX idx_kl_documents_source_id ON public.kl_documents(source_id);
CREATE INDEX idx_kl_documents_fetched_at ON public.kl_documents(fetched_at DESC);

-- kl_entities indexes
CREATE INDEX idx_kl_entities_type_name ON public.kl_entities(entity_type, normalized_name);
CREATE INDEX idx_kl_entities_normalized_name ON public.kl_entities(normalized_name);

-- kl_facts indexes (critical for zero-hallucination lookups)
CREATE INDEX idx_kl_facts_entity_predicate ON public.kl_facts(entity_id, predicate);
CREATE INDEX idx_kl_facts_status ON public.kl_facts(status);
CREATE INDEX idx_kl_facts_source_id ON public.kl_facts(source_id);
CREATE INDEX idx_kl_facts_created_at ON public.kl_facts(created_at DESC);

-- kl_enrichment_jobs indexes
CREATE INDEX idx_kl_enrichment_jobs_status ON public.kl_enrichment_jobs(status, scheduled_for);
CREATE INDEX idx_kl_enrichment_jobs_entity ON public.kl_enrichment_jobs(entity_id);

-- kl_cached_search indexes (critical for cache performance)
CREATE INDEX idx_kl_cached_search_hash ON public.kl_cached_search(query_hash);
CREATE INDEX idx_kl_cached_search_expires ON public.kl_cached_search(expires_at);
CREATE INDEX idx_kl_cached_search_type_hash ON public.kl_cached_search(cache_type, query_hash);

-- kl_change_log indexes
CREATE INDEX idx_kl_change_log_table_record ON public.kl_change_log(table_name, record_id);
CREATE INDEX idx_kl_change_log_created ON public.kl_change_log(created_at DESC);
CREATE INDEX idx_kl_change_log_actor ON public.kl_change_log(actor);

-- Enable RLS on all new tables
ALTER TABLE public.kl_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kl_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kl_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kl_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kl_enrichment_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kl_cached_search ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kl_change_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read, admin write

-- kl_sources: public read
CREATE POLICY "kl_sources_public_read" ON public.kl_sources
  FOR SELECT USING (true);

CREATE POLICY "kl_sources_admin_write" ON public.kl_sources
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- kl_documents: public read
CREATE POLICY "kl_documents_public_read" ON public.kl_documents
  FOR SELECT USING (true);

CREATE POLICY "kl_documents_admin_write" ON public.kl_documents
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- kl_entities: public read
CREATE POLICY "kl_entities_public_read" ON public.kl_entities
  FOR SELECT USING (true);

CREATE POLICY "kl_entities_admin_write" ON public.kl_entities
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- kl_facts: public read (critical for evidence display)
CREATE POLICY "kl_facts_public_read" ON public.kl_facts
  FOR SELECT USING (true);

CREATE POLICY "kl_facts_admin_write" ON public.kl_facts
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- kl_enrichment_jobs: admin only
CREATE POLICY "kl_enrichment_jobs_admin_all" ON public.kl_enrichment_jobs
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- kl_cached_search: public read for cache hits
CREATE POLICY "kl_cached_search_public_read" ON public.kl_cached_search
  FOR SELECT USING (true);

CREATE POLICY "kl_cached_search_admin_write" ON public.kl_cached_search
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- kl_change_log: admin only
CREATE POLICY "kl_change_log_admin_all" ON public.kl_change_log
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at on kl_sources
CREATE TRIGGER update_kl_sources_updated_at
  BEFORE UPDATE ON public.kl_sources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on kl_entities
CREATE TRIGGER update_kl_entities_updated_at
  BEFORE UPDATE ON public.kl_entities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial sources
INSERT INTO public.kl_sources (name, type, base_url, config) VALUES
  ('Wikipedia', 'wikipedia', 'https://en.wikipedia.org', '{"api": "https://en.wikipedia.org/api/rest_v1"}'),
  ('Resident Advisor', 'residentadvisor', 'https://ra.co', '{}'),
  ('Discogs', 'discogs', 'https://www.discogs.com', '{}'),
  ('Bandcamp', 'bandcamp', 'https://bandcamp.com', '{}'),
  ('SoundCloud', 'soundcloud', 'https://soundcloud.com', '{}'),
  ('Beatport', 'beatport', 'https://www.beatport.com', '{}'),
  ('MusicBrainz', 'musicbrainz', 'https://musicbrainz.org', '{"api": "https://musicbrainz.org/ws/2"}');