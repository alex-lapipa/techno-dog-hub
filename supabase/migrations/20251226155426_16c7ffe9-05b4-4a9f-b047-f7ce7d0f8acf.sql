-- Create storage bucket for knowledge documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('knowledge-docs', 'knowledge-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to view their own uploads
CREATE POLICY "Authenticated users can view knowledge docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'knowledge-docs' AND auth.role() = 'authenticated');

-- Allow admins to upload documents
CREATE POLICY "Admins can upload knowledge docs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'knowledge-docs' 
  AND auth.role() = 'authenticated'
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to delete documents
CREATE POLICY "Admins can delete knowledge docs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'knowledge-docs' 
  AND auth.role() = 'authenticated'
  AND public.has_role(auth.uid(), 'admin')
);