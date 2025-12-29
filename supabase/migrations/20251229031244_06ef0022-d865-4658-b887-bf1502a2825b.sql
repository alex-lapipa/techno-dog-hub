-- Create storage bucket for gear images
INSERT INTO storage.buckets (id, name, public)
VALUES ('gear-images', 'gear-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public read access for gear images"
ON storage.objects FOR SELECT
USING (bucket_id = 'gear-images');

-- Allow authenticated uploads (for admin functions)
CREATE POLICY "Admin upload access for gear images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'gear-images');