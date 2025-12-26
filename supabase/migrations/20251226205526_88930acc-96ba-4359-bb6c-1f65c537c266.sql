-- Create community submissions table
CREATE TABLE public.community_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  submission_type TEXT NOT NULL CHECK (submission_type IN ('artist', 'venue', 'festival', 'label', 'other')),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  website_url TEXT,
  social_links JSONB DEFAULT '[]'::jsonb,
  additional_info TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'duplicate')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.community_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit (even anonymous for accessibility)
CREATE POLICY "Anyone can create submissions"
ON public.community_submissions
FOR INSERT
WITH CHECK (true);

-- Users can view their own submissions
CREATE POLICY "Users can view own submissions"
ON public.community_submissions
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all submissions
CREATE POLICY "Admins can view all submissions"
ON public.community_submissions
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = 'admin'::app_role
));

-- Admins can update submissions
CREATE POLICY "Admins can update submissions"
ON public.community_submissions
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = 'admin'::app_role
));

-- Admins can delete submissions
CREATE POLICY "Admins can delete submissions"
ON public.community_submissions
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = 'admin'::app_role
));

-- Create updated_at trigger
CREATE TRIGGER update_community_submissions_updated_at
BEFORE UPDATE ON public.community_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();