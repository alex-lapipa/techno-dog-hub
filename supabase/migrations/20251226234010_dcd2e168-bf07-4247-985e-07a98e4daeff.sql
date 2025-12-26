-- Create storage bucket for community submissions
INSERT INTO storage.buckets (id, name, public) 
VALUES ('community-uploads', 'community-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the storage bucket
CREATE POLICY "Anyone can upload files to community-uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'community-uploads');

CREATE POLICY "Anyone can view community-uploads files"
ON storage.objects FOR SELECT
USING (bucket_id = 'community-uploads');

-- Add email and file_urls columns to community_submissions table
ALTER TABLE public.community_submissions 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS file_urls TEXT[] DEFAULT '{}';

-- Update the name column to be optional (nullable)
ALTER TABLE public.community_submissions 
ALTER COLUMN name DROP NOT NULL;

-- Update submission_type to be optional
ALTER TABLE public.community_submissions 
ALTER COLUMN submission_type DROP NOT NULL;