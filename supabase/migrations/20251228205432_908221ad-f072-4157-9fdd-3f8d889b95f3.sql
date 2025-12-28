-- Artist Knowledge Expansion Engine - Enrichment Data Model
-- All tables are additive and non-destructive

-- 1. Artist Raw Documents - Stores raw Firecrawl output for traceability
CREATE TABLE public.artist_raw_documents (
  raw_doc_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES public.canonical_artists(artist_id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  domain TEXT,
  content_text TEXT,
  content_markdown TEXT,
  content_json JSONB,
  content_hash TEXT,
  retrieved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for deduplication
CREATE UNIQUE INDEX idx_artist_raw_docs_url_hash ON public.artist_raw_documents(url, content_hash) WHERE content_hash IS NOT NULL;
CREATE INDEX idx_artist_raw_docs_artist ON public.artist_raw_documents(artist_id);
CREATE INDEX idx_artist_raw_docs_domain ON public.artist_raw_documents(domain);

-- 2. Artist Claims - Atomic facts with verification status
CREATE TYPE claim_verification_status AS ENUM ('unverified', 'partially_verified', 'verified', 'disputed');

CREATE TABLE public.artist_claims (
  claim_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES public.canonical_artists(artist_id) ON DELETE CASCADE,
  claim_type TEXT NOT NULL, -- bio_fact, release, label, genre, birthplace, influences, awards, touring, collaborators, etc
  claim_text TEXT NOT NULL, -- plain statement
  value_structured JSONB, -- structured fields like date, location, collaborator IDs
  confidence_score FLOAT DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  verification_status claim_verification_status DEFAULT 'unverified',
  contradicts_claim_id UUID REFERENCES public.artist_claims(claim_id) ON DELETE SET NULL,
  extraction_model TEXT, -- which AI model extracted this
  verification_model TEXT, -- which AI model verified this
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_artist_claims_artist ON public.artist_claims(artist_id);
CREATE INDEX idx_artist_claims_type ON public.artist_claims(claim_type);
CREATE INDEX idx_artist_claims_status ON public.artist_claims(verification_status);
CREATE INDEX idx_artist_claims_confidence ON public.artist_claims(confidence_score DESC);

-- 3. Artist Sources - Links claims to their evidence
CREATE TABLE public.artist_sources (
  source_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id UUID NOT NULL REFERENCES public.artist_claims(claim_id) ON DELETE CASCADE,
  raw_doc_id UUID REFERENCES public.artist_raw_documents(raw_doc_id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  domain TEXT,
  title TEXT,
  publish_date DATE,
  retrieved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  quote_snippet TEXT, -- max 500 chars evidence snippet
  source_quality_score FLOAT DEFAULT 0.5, -- 0-1 score for source reliability
  is_primary_source BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_artist_sources_claim ON public.artist_sources(claim_id);
CREATE INDEX idx_artist_sources_domain ON public.artist_sources(domain);
CREATE INDEX idx_artist_sources_quality ON public.artist_sources(source_quality_score DESC);

-- 4. Artist Enrichment Runs - Tracks enrichment pipeline executions
CREATE TYPE enrichment_run_status AS ENUM ('pending', 'running', 'success', 'failed', 'partial');
CREATE TYPE enrichment_run_type AS ENUM ('scheduled', 'manual', 'backlog', 'priority');

CREATE TABLE public.artist_enrichment_runs (
  run_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES public.canonical_artists(artist_id) ON DELETE CASCADE,
  run_type enrichment_run_type DEFAULT 'manual',
  status enrichment_run_status DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE,
  errors JSONB,
  stats JSONB, -- sources_crawled, claims_extracted, verified_claims, disputed_claims
  firecrawl_urls_searched TEXT[],
  models_used TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_enrichment_runs_artist ON public.artist_enrichment_runs(artist_id);
CREATE INDEX idx_enrichment_runs_status ON public.artist_enrichment_runs(status);
CREATE INDEX idx_enrichment_runs_date ON public.artist_enrichment_runs(created_at DESC);

-- 5. Source Domain Registry - Configure source reliability
CREATE TABLE public.source_domain_registry (
  domain_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL UNIQUE,
  display_name TEXT,
  quality_score FLOAT DEFAULT 0.5 CHECK (quality_score >= 0 AND quality_score <= 1),
  is_primary_source BOOLEAN DEFAULT false,
  is_blocked BOOLEAN DEFAULT false,
  category TEXT, -- official, label, press, database, social, wiki, other
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Seed with known reliable sources
INSERT INTO public.source_domain_registry (domain, display_name, quality_score, is_primary_source, category) VALUES
  ('residentadvisor.net', 'Resident Advisor', 0.9, true, 'press'),
  ('discogs.com', 'Discogs', 0.85, false, 'database'),
  ('musicbrainz.org', 'MusicBrainz', 0.85, false, 'database'),
  ('wikipedia.org', 'Wikipedia', 0.7, false, 'wiki'),
  ('soundcloud.com', 'SoundCloud', 0.8, true, 'official'),
  ('bandcamp.com', 'Bandcamp', 0.85, true, 'official'),
  ('spotify.com', 'Spotify', 0.8, true, 'official'),
  ('beatport.com', 'Beatport', 0.8, false, 'database'),
  ('xlr8r.com', 'XLR8R', 0.85, true, 'press'),
  ('mixmag.net', 'Mixmag', 0.85, true, 'press'),
  ('factmag.com', 'Fact Magazine', 0.85, true, 'press'),
  ('electronicbeats.net', 'Electronic Beats', 0.8, true, 'press'),
  ('decoded-magazine.com', 'Decoded Magazine', 0.75, true, 'press'),
  ('djmag.com', 'DJ Mag', 0.8, true, 'press');

-- 6. Enrichment Queue - Priority queue for artists needing enrichment
CREATE TABLE public.artist_enrichment_queue (
  queue_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES public.canonical_artists(artist_id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 0, -- higher = more urgent
  reason TEXT, -- why queued: incomplete_profile, scheduled_refresh, manual_request
  scheduled_for TIMESTAMP WITH TIME ZONE,
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(artist_id, status) -- only one pending/processing per artist
);

CREATE INDEX idx_enrichment_queue_priority ON public.artist_enrichment_queue(priority DESC, created_at);
CREATE INDEX idx_enrichment_queue_status ON public.artist_enrichment_queue(status);

-- Enable RLS on all new tables
ALTER TABLE public.artist_raw_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_enrichment_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_domain_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_enrichment_queue ENABLE ROW LEVEL SECURITY;

-- Public read access for all enrichment data
CREATE POLICY "Public read access for artist_raw_documents" ON public.artist_raw_documents FOR SELECT USING (true);
CREATE POLICY "Public read access for artist_claims" ON public.artist_claims FOR SELECT USING (true);
CREATE POLICY "Public read access for artist_sources" ON public.artist_sources FOR SELECT USING (true);
CREATE POLICY "Public read access for artist_enrichment_runs" ON public.artist_enrichment_runs FOR SELECT USING (true);
CREATE POLICY "Public read access for source_domain_registry" ON public.source_domain_registry FOR SELECT USING (true);
CREATE POLICY "Public read access for artist_enrichment_queue" ON public.artist_enrichment_queue FOR SELECT USING (true);

-- Service role write access (edge functions)
CREATE POLICY "Service insert for artist_raw_documents" ON public.artist_raw_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert for artist_claims" ON public.artist_claims FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update for artist_claims" ON public.artist_claims FOR UPDATE USING (true);
CREATE POLICY "Service insert for artist_sources" ON public.artist_sources FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert for artist_enrichment_runs" ON public.artist_enrichment_runs FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update for artist_enrichment_runs" ON public.artist_enrichment_runs FOR UPDATE USING (true);
CREATE POLICY "Service insert for source_domain_registry" ON public.source_domain_registry FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update for source_domain_registry" ON public.source_domain_registry FOR UPDATE USING (true);
CREATE POLICY "Service insert for artist_enrichment_queue" ON public.artist_enrichment_queue FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update for artist_enrichment_queue" ON public.artist_enrichment_queue FOR UPDATE USING (true);
CREATE POLICY "Service delete for artist_enrichment_queue" ON public.artist_enrichment_queue FOR DELETE USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_artist_claims_updated_at
BEFORE UPDATE ON public.artist_claims
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_source_domain_registry_updated_at
BEFORE UPDATE ON public.source_domain_registry
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();