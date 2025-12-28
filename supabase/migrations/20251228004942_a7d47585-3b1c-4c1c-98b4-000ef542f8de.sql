-- Create storage bucket for T-DOG audio demos
INSERT INTO storage.buckets (id, name, public)
VALUES ('tdog-demos', 'tdog-demos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to demo files
CREATE POLICY "Public can read tdog demos"
ON storage.objects FOR SELECT
USING (bucket_id = 'tdog-demos');

-- Allow authenticated users to upload demos (admin use)
CREATE POLICY "Authenticated users can upload tdog demos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'tdog-demos' AND auth.role() = 'authenticated');