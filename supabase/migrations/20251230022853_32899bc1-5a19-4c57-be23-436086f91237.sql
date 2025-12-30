-- Enhanced doggy share analytics table for detailed tracking
CREATE TABLE public.doggy_share_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT,
  doggy_name TEXT NOT NULL,
  doggy_slug TEXT,
  variant_id UUID REFERENCES public.doggy_variants(id),
  
  -- Share details
  platform TEXT NOT NULL, -- 'twitter', 'whatsapp', 'telegram', 'discord', 'bluesky', 'email', 'copy', 'native'
  share_type TEXT NOT NULL DEFAULT 'initial', -- 'initial', 'reshare', 'viral_chain'
  share_url TEXT,
  
  -- Source tracking
  referrer TEXT,
  referrer_platform TEXT, -- detected platform from referrer
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Chain tracking for virality
  parent_share_id UUID REFERENCES public.doggy_share_events(id),
  chain_depth INTEGER DEFAULT 0,
  
  -- Engagement metrics
  click_through BOOLEAN DEFAULT false,
  click_through_at TIMESTAMP WITH TIME ZONE,
  
  -- Device & context
  user_agent TEXT,
  device_type TEXT, -- 'mobile', 'tablet', 'desktop'
  country_code TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.doggy_share_events ENABLE ROW LEVEL SECURITY;

-- Public read/write for analytics (no auth required for tracking)
CREATE POLICY "Anyone can insert share events" 
ON public.doggy_share_events 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can read share events" 
ON public.doggy_share_events 
FOR SELECT 
USING (true);

-- Indexes for analytics queries
CREATE INDEX idx_doggy_share_events_platform ON public.doggy_share_events(platform);
CREATE INDEX idx_doggy_share_events_doggy ON public.doggy_share_events(doggy_name);
CREATE INDEX idx_doggy_share_events_created ON public.doggy_share_events(created_at DESC);
CREATE INDEX idx_doggy_share_events_chain ON public.doggy_share_events(parent_share_id) WHERE parent_share_id IS NOT NULL;
CREATE INDEX idx_doggy_share_events_session ON public.doggy_share_events(session_id);

-- AI insights cache table
CREATE TABLE public.doggy_analytics_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  insight_type TEXT NOT NULL, -- 'daily_summary', 'viral_analysis', 'platform_performance', 'doggy_rankings'
  model_used TEXT NOT NULL, -- 'openai', 'anthropic', 'gemini', 'groq'
  model_name TEXT,
  
  -- Insight content
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  detailed_analysis TEXT,
  recommendations JSONB,
  
  -- Source data snapshot
  data_snapshot JSONB,
  time_period_start TIMESTAMP WITH TIME ZONE,
  time_period_end TIMESTAMP WITH TIME ZONE,
  
  -- Quality & consensus
  confidence_score NUMERIC(3,2), -- 0.00 to 1.00
  consensus_models TEXT[], -- models that agreed
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.doggy_analytics_insights ENABLE ROW LEVEL SECURITY;

-- Public read for insights
CREATE POLICY "Anyone can read insights" 
ON public.doggy_analytics_insights 
FOR SELECT 
USING (true);

-- Service role can insert
CREATE POLICY "Service role can insert insights" 
ON public.doggy_analytics_insights 
FOR INSERT 
WITH CHECK (true);

-- Index for queries
CREATE INDEX idx_doggy_insights_type ON public.doggy_analytics_insights(insight_type);
CREATE INDEX idx_doggy_insights_created ON public.doggy_analytics_insights(created_at DESC);

-- Enable realtime for share events (for live dashboard)
ALTER PUBLICATION supabase_realtime ADD TABLE public.doggy_share_events;