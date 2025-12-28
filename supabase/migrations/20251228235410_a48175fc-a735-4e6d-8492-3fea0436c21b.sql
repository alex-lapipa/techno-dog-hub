-- Create storage bucket for verified artist photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('artist-photos', 'artist-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for artist photos bucket
CREATE POLICY "Public read access for artist photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'artist-photos');

CREATE POLICY "Admin insert access for artist photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'artist-photos');

CREATE POLICY "Admin update access for artist photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'artist-photos');

CREATE POLICY "Admin delete access for artist photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'artist-photos');

-- Add photo columns to canonical_artists if not exists
ALTER TABLE public.canonical_artists 
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS photo_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS photo_verification_models TEXT[],
ADD COLUMN IF NOT EXISTS photo_tags TEXT[],
ADD COLUMN IF NOT EXISTS photo_source TEXT,
ADD COLUMN IF NOT EXISTS photo_verified_at TIMESTAMPTZ;