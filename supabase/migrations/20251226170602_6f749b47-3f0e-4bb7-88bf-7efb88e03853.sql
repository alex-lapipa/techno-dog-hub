-- Create analytics_events table to track user actions
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  page_path TEXT,
  metadata JSONB DEFAULT '{}',
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own events
CREATE POLICY "Users can insert their own events"
ON public.analytics_events
FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow admins to view all events
CREATE POLICY "Admins can view all events"
ON public.analytics_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Create analytics_insights table to store AI-generated insights
CREATE TABLE public.analytics_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '24 hours')
);

-- Enable RLS
ALTER TABLE public.analytics_insights ENABLE ROW LEVEL SECURITY;

-- Allow admins to view insights
CREATE POLICY "Admins can view insights"
ON public.analytics_insights
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Allow system to insert insights (via service role in edge function)
CREATE POLICY "Allow insert for service role"
ON public.analytics_insights
FOR INSERT
WITH CHECK (true);