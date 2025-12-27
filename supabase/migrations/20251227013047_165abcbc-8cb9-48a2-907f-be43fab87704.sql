-- Create storage bucket for curated media assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media-assets', 
  'media-assets', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies for media-assets bucket
CREATE POLICY "Media assets are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'media-assets');

CREATE POLICY "Service role can upload media assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media-assets');

CREATE POLICY "Service role can update media assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'media-assets');

CREATE POLICY "Service role can delete media assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'media-assets');

-- Create media_assets table for tracking all curated images
CREATE TABLE public.media_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL, -- artist, label, synth, venue, festival, release, crew
  entity_id TEXT NOT NULL, -- the slug or ID of the entity
  entity_name TEXT NOT NULL, -- human readable name for display
  source_url TEXT, -- original URL where image was found
  storage_url TEXT, -- URL in Supabase storage after upload
  storage_path TEXT, -- path in storage bucket
  provider TEXT, -- wikimedia, musicbrainz, discogs, web-search, manual
  license_status TEXT DEFAULT 'unknown', -- safe, unknown, rejected
  license_name TEXT, -- CC BY-SA 4.0, Public Domain, etc.
  license_url TEXT, -- link to license
  copyright_risk TEXT DEFAULT 'unknown', -- low, medium, high
  openai_verified BOOLEAN DEFAULT false,
  match_score INTEGER DEFAULT 0 CHECK (match_score >= 0 AND match_score <= 100),
  quality_score INTEGER DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),
  final_selected BOOLEAN DEFAULT false,
  tags JSONB DEFAULT '[]'::jsonb,
  alt_text TEXT,
  meta JSONB DEFAULT '{}'::jsonb, -- dimensions, colors, dominant style
  reasoning_summary TEXT, -- OpenAI's reasoning for scoring
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_media_assets_entity ON public.media_assets(entity_type, entity_id);
CREATE INDEX idx_media_assets_final ON public.media_assets(final_selected) WHERE final_selected = true;
CREATE INDEX idx_media_assets_provider ON public.media_assets(provider);

-- Create media_pipeline_jobs table for background processing
CREATE TABLE public.media_pipeline_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued', -- queued, running, complete, failed, cancelled
  priority INTEGER DEFAULT 5, -- 1-10, higher = more urgent
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error_log TEXT,
  result JSONB DEFAULT '{}'::jsonb, -- stores final result/stats
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Unique constraint to prevent duplicate jobs for same entity
CREATE UNIQUE INDEX idx_media_jobs_unique_pending 
ON public.media_pipeline_jobs(entity_type, entity_id) 
WHERE status IN ('queued', 'running');

-- Create index for job queue processing
CREATE INDEX idx_media_jobs_queue ON public.media_pipeline_jobs(status, priority DESC, created_at);

-- Enable RLS
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_pipeline_jobs ENABLE ROW LEVEL SECURITY;

-- Public can read media assets
CREATE POLICY "Media assets are publicly readable"
ON public.media_assets FOR SELECT
USING (true);

-- Admins can manage media assets
CREATE POLICY "Admins can manage media assets"
ON public.media_assets FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
));

-- Service role can manage media assets (for edge functions)
CREATE POLICY "Service role can manage media assets"
ON public.media_assets FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Admins can view pipeline jobs
CREATE POLICY "Admins can view pipeline jobs"
ON public.media_pipeline_jobs FOR SELECT
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
));

-- Admins can manage pipeline jobs
CREATE POLICY "Admins can manage pipeline jobs"
ON public.media_pipeline_jobs FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
));

-- Service role can manage pipeline jobs
CREATE POLICY "Service role can manage pipeline jobs"
ON public.media_pipeline_jobs FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Update trigger for updated_at
CREATE TRIGGER update_media_assets_updated_at
BEFORE UPDATE ON public.media_assets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_media_jobs_updated_at
BEFORE UPDATE ON public.media_pipeline_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to enqueue a media fetch job (prevents duplicates)
CREATE OR REPLACE FUNCTION public.enqueue_media_job(
  p_entity_type TEXT,
  p_entity_id TEXT,
  p_entity_name TEXT,
  p_priority INTEGER DEFAULT 5
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job_id UUID;
BEGIN
  -- Check if there's already a pending or running job
  SELECT id INTO v_job_id
  FROM public.media_pipeline_jobs
  WHERE entity_type = p_entity_type 
    AND entity_id = p_entity_id
    AND status IN ('queued', 'running');
  
  IF v_job_id IS NOT NULL THEN
    RETURN v_job_id;
  END IF;
  
  -- Insert new job
  INSERT INTO public.media_pipeline_jobs (entity_type, entity_id, entity_name, priority)
  VALUES (p_entity_type, p_entity_id, p_entity_name, p_priority)
  RETURNING id INTO v_job_id;
  
  RETURN v_job_id;
END;
$$;

-- Function to get next job from queue
CREATE OR REPLACE FUNCTION public.claim_next_media_job()
RETURNS TABLE (
  job_id UUID,
  entity_type TEXT,
  entity_id TEXT,
  entity_name TEXT,
  attempts INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.media_pipeline_jobs
  SET 
    status = 'running',
    started_at = now(),
    attempts = media_pipeline_jobs.attempts + 1,
    updated_at = now()
  WHERE id = (
    SELECT id FROM public.media_pipeline_jobs
    WHERE status = 'queued'
    ORDER BY priority DESC, created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  )
  RETURNING 
    id AS job_id,
    media_pipeline_jobs.entity_type,
    media_pipeline_jobs.entity_id,
    media_pipeline_jobs.entity_name,
    media_pipeline_jobs.attempts;
END;
$$;