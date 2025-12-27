-- Phase 2: Extend submissions for entity linking + consent tracking
-- Non-destructive: add columns to existing community_submissions table

-- 1. Add entity linking columns
ALTER TABLE public.community_submissions 
ADD COLUMN IF NOT EXISTS entity_type TEXT,
ADD COLUMN IF NOT EXISTS entity_id TEXT,
ADD COLUMN IF NOT EXISTS consent_confirmed BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS consent_text_version TEXT DEFAULT 'v1',
ADD COLUMN IF NOT EXISTS media_metadata JSONB DEFAULT '{}'::JSONB;

-- 2. Add index for entity queries
CREATE INDEX IF NOT EXISTS idx_submissions_entity 
ON public.community_submissions(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_submissions_status 
ON public.community_submissions(status);

-- 3. Create storage bucket for community uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-uploads', 
  'community-uploads', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 4. Storage policies for community uploads
-- Anyone can view public uploads (approved content)
CREATE POLICY "Public can view community uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'community-uploads');

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'community-uploads' 
  AND auth.role() = 'authenticated'
);

-- Service role can manage all uploads
CREATE POLICY "Service role manages uploads"
ON storage.objects FOR ALL
USING (bucket_id = 'community-uploads')
WITH CHECK (bucket_id = 'community-uploads');