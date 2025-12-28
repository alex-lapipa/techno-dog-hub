-- Add CORS policy for tdog-demos bucket to allow access from both sites
-- Note: Storage CORS is configured at the bucket level via RLS and public access

-- Ensure the bucket has the correct public configuration
UPDATE storage.buckets 
SET public = true,
    file_size_limit = 52428800,  -- 50MB limit for audio files
    allowed_mime_types = ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm']
WHERE id = 'tdog-demos';

-- Create permissive policies for public read access
DROP POLICY IF EXISTS "Public read access for tdog-demos" ON storage.objects;
CREATE POLICY "Public read access for tdog-demos"
ON storage.objects FOR SELECT
USING (bucket_id = 'tdog-demos');

-- Allow authenticated uploads (for admin)
DROP POLICY IF EXISTS "Admin upload to tdog-demos" ON storage.objects;
CREATE POLICY "Admin upload to tdog-demos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tdog-demos' 
  AND auth.role() = 'authenticated'
);