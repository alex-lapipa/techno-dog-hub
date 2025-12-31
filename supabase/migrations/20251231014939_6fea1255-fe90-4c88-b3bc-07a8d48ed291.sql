-- Enhance labels table with enrichment fields while preserving existing data
ALTER TABLE public.labels 
ADD COLUMN IF NOT EXISTS slug text,
ADD COLUMN IF NOT EXISTS founded_year integer,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS bio_short text,
ADD COLUMN IF NOT EXISTS bio_long text,
ADD COLUMN IF NOT EXISTS founders text[],
ADD COLUMN IF NOT EXISTS key_artists text[],
ADD COLUMN IF NOT EXISTS key_releases jsonb,
ADD COLUMN IF NOT EXISTS subgenres text[],
ADD COLUMN IF NOT EXISTS tags text[],
ADD COLUMN IF NOT EXISTS discogs_url text,
ADD COLUMN IF NOT EXISTS bandcamp_url text,
ADD COLUMN IF NOT EXISTS soundcloud_url text,
ADD COLUMN IF NOT EXISTS instagram_url text,
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS philosophy text,
ADD COLUMN IF NOT EXISTS known_for text,
ADD COLUMN IF NOT EXISTS release_count integer,
ADD COLUMN IF NOT EXISTS artist_roster jsonb,
ADD COLUMN IF NOT EXISTS enrichment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS enrichment_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_enriched_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS enrichment_sources jsonb;

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_labels_slug ON public.labels(slug);
CREATE INDEX IF NOT EXISTS idx_labels_enrichment_status ON public.labels(enrichment_status);

-- Create labels enrichment queue
CREATE TABLE IF NOT EXISTS public.labels_enrichment_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label_id uuid REFERENCES public.labels(id) ON DELETE CASCADE,
  priority integer DEFAULT 0,
  status text DEFAULT 'pending',
  reason text,
  attempts integer DEFAULT 0,
  last_attempt_at timestamp with time zone,
  last_error text,
  scheduled_for timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Create labels enrichment runs tracking
CREATE TABLE IF NOT EXISTS public.labels_enrichment_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label_id uuid REFERENCES public.labels(id) ON DELETE CASCADE,
  run_type text NOT NULL,
  status text DEFAULT 'running',
  models_used text[],
  firecrawl_urls text[],
  stats jsonb,
  errors jsonb,
  started_at timestamp with time zone DEFAULT now(),
  finished_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Create labels documents for RAG
CREATE TABLE IF NOT EXISTS public.labels_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label_id uuid REFERENCES public.labels(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  title text,
  content text NOT NULL,
  source_url text,
  source_name text,
  embedding vector(1536),
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create labels claims for verified facts
CREATE TABLE IF NOT EXISTS public.labels_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label_id uuid REFERENCES public.labels(id) ON DELETE CASCADE,
  claim_type text NOT NULL,
  claim_text text NOT NULL,
  value_structured jsonb,
  confidence_score numeric(3,2) DEFAULT 0.5,
  verification_status text DEFAULT 'unverified',
  verified_at timestamp with time zone,
  source_urls text[],
  extraction_model text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.labels_enrichment_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labels_enrichment_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labels_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labels_claims ENABLE ROW LEVEL SECURITY;

-- Public read access for all users
CREATE POLICY "Labels enrichment queue viewable by all" ON public.labels_enrichment_queue FOR SELECT USING (true);
CREATE POLICY "Labels enrichment runs viewable by all" ON public.labels_enrichment_runs FOR SELECT USING (true);
CREATE POLICY "Labels documents viewable by all" ON public.labels_documents FOR SELECT USING (true);
CREATE POLICY "Labels claims viewable by all" ON public.labels_claims FOR SELECT USING (true);

-- Service role has full access for edge functions
CREATE POLICY "Service role manages labels enrichment queue" ON public.labels_enrichment_queue FOR ALL USING (true);
CREATE POLICY "Service role manages labels enrichment runs" ON public.labels_enrichment_runs FOR ALL USING (true);
CREATE POLICY "Service role manages labels documents" ON public.labels_documents FOR ALL USING (true);
CREATE POLICY "Service role manages labels claims" ON public.labels_claims FOR ALL USING (true);