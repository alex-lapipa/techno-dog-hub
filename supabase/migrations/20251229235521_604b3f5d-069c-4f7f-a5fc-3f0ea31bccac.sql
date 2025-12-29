-- Create table to track doggy page visits and link clicks (standalone module)
CREATE TABLE public.doggy_page_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  page_source TEXT NOT NULL, -- 'widget', 'main_page', 'shared'
  event_type TEXT NOT NULL, -- 'page_view', 'link_click', 'share', 'community_signup'
  link_clicked TEXT, -- which link was clicked (artists, gear, support, etc.)
  session_id TEXT,
  referrer TEXT,
  user_agent TEXT,
  doggy_name TEXT, -- which doggy was displayed
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.doggy_page_analytics ENABLE ROW LEVEL SECURITY;

-- Allow public inserts for tracking (no auth required for analytics)
CREATE POLICY "Allow public inserts for tracking"
ON public.doggy_page_analytics
FOR INSERT
WITH CHECK (true);

-- Only admins can read analytics
CREATE POLICY "Admins can read analytics"
ON public.doggy_page_analytics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Add index for faster queries
CREATE INDEX idx_doggy_page_analytics_created_at ON public.doggy_page_analytics(created_at DESC);
CREATE INDEX idx_doggy_page_analytics_event_type ON public.doggy_page_analytics(event_type);