-- Create storage bucket for book covers
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'book-covers',
  'book-covers',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Book covers are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'book-covers');

-- Allow service role to upload
CREATE POLICY "Service role can upload book covers"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'book-covers');