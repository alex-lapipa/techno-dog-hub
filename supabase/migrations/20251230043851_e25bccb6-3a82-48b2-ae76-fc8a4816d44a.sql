-- =====================================================
-- TECHNO PR & MEDIA RELATIONS AGENT DATABASE SCHEMA
-- =====================================================

-- 1. MEDIA OUTLETS TABLE
CREATE TABLE public.media_outlets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_name TEXT NOT NULL,
  outlet_type TEXT NOT NULL CHECK (outlet_type IN (
    'magazine', 'blog', 'radio', 'podcast', 'youtube', 'tv', 
    'trade_press', 'festival_media', 'newsletter', 'streaming_platform', 
    'label_press', 'online_radio', 'fm_am_station', 'other'
  )),
  region TEXT CHECK (region IN ('europe', 'north_america', 'global', 'other')),
  country TEXT,
  city TEXT,
  website_url TEXT,
  primary_language TEXT DEFAULT 'en',
  genres_focus TEXT[] DEFAULT ARRAY['techno'],
  audience_size_estimate TEXT,
  authority_score INTEGER DEFAULT 0 CHECK (authority_score >= 0 AND authority_score <= 100),
  underground_credibility_score INTEGER DEFAULT 0 CHECK (underground_credibility_score >= 0 AND underground_credibility_score <= 100),
  activity_status TEXT DEFAULT 'active' CHECK (activity_status IN ('active', 'inactive', 'unknown')),
  last_verified_at TIMESTAMPTZ,
  data_source_url TEXT,
  notes TEXT,
  enrichment_confidence INTEGER DEFAULT 0 CHECK (enrichment_confidence >= 0 AND enrichment_confidence <= 100),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(outlet_name, website_url)
);

-- 2. JOURNALIST CONTACTS TABLE
CREATE TABLE public.journalist_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  role_title TEXT,
  outlet_id UUID REFERENCES public.media_outlets(id) ON DELETE SET NULL,
  email TEXT,
  phone TEXT,
  website TEXT,
  press_submission_url TEXT,
  social_links JSONB DEFAULT '{}',
  preferred_contact_method TEXT CHECK (preferred_contact_method IN ('email', 'dm_twitter', 'dm_instagram', 'linkedin', 'phone', 'form', 'other')),
  location_country TEXT,
  location_city TEXT,
  languages TEXT[] DEFAULT ARRAY['en'],
  coverage_focus_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  relationship_status TEXT DEFAULT 'new' CHECK (relationship_status IN ('new', 'contacted', 'engaged', 'partner', 'avoid')),
  what_makes_them_tick TEXT,
  bio_summary TEXT,
  key_recent_articles JSONB DEFAULT '[]',
  key_interviews JSONB DEFAULT '[]',
  credibility_notes TEXT,
  last_verified_at TIMESTAMPTZ,
  data_source_url TEXT,
  enrichment_confidence INTEGER DEFAULT 0 CHECK (enrichment_confidence >= 0 AND enrichment_confidence <= 100),
  authority_score INTEGER DEFAULT 0 CHECK (authority_score >= 0 AND authority_score <= 100),
  underground_credibility_score INTEGER DEFAULT 0 CHECK (underground_credibility_score >= 0 AND underground_credibility_score <= 100),
  is_active BOOLEAN DEFAULT true,
  gdpr_consent_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 3. OUTREACH HISTORY TABLE
CREATE TABLE public.outreach_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journalist_id UUID REFERENCES public.journalist_contacts(id) ON DELETE CASCADE,
  outlet_id UUID REFERENCES public.media_outlets(id) ON DELETE SET NULL,
  outreach_date TIMESTAMPTZ DEFAULT now(),
  outreach_type TEXT NOT NULL CHECK (outreach_type IN ('email', 'dm', 'call', 'event', 'collaboration', 'other')),
  message_summary TEXT,
  message_content TEXT,
  subject_line TEXT,
  campaign_name TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'opened', 'replied', 'follow_up', 'success', 'no_response', 'declined')),
  response_notes TEXT,
  next_action_date DATE,
  next_action_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 4. LISTS & SEGMENTS TABLE
CREATE TABLE public.pr_lists_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  segment_type TEXT DEFAULT 'manual' CHECK (segment_type IN ('manual', 'dynamic', 'smart')),
  filters_json JSONB DEFAULT '{}',
  contact_ids UUID[] DEFAULT ARRAY[]::UUID[],
  outlet_ids UUID[] DEFAULT ARRAY[]::UUID[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 5. SCRAPE AUDIT LOG (for ethics/compliance)
CREATE TABLE public.pr_scrape_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  source_url TEXT,
  records_affected INTEGER DEFAULT 0,
  models_used TEXT[],
  parameters JSONB,
  status TEXT DEFAULT 'completed',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 6. AGENT RUNS TABLE (for tracking agent executions)
CREATE TABLE public.pr_agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_type TEXT NOT NULL CHECK (run_type IN ('discover', 'enrich', 'outreach', 'refresh', 'verify')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  parameters JSONB,
  results JSONB,
  models_used TEXT[],
  outlets_processed INTEGER DEFAULT 0,
  contacts_processed INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on all tables
ALTER TABLE public.media_outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journalist_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pr_lists_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pr_scrape_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pr_agent_runs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admin access only (these are sensitive PR contacts)
CREATE POLICY "Admins can manage media_outlets" ON public.media_outlets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.community_profiles WHERE user_id = auth.uid() AND 'admin' = ANY(roles))
  );

CREATE POLICY "Admins can manage journalist_contacts" ON public.journalist_contacts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.community_profiles WHERE user_id = auth.uid() AND 'admin' = ANY(roles))
  );

CREATE POLICY "Admins can manage outreach_history" ON public.outreach_history
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.community_profiles WHERE user_id = auth.uid() AND 'admin' = ANY(roles))
  );

CREATE POLICY "Admins can manage pr_lists_segments" ON public.pr_lists_segments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.community_profiles WHERE user_id = auth.uid() AND 'admin' = ANY(roles))
  );

CREATE POLICY "Admins can manage pr_scrape_audit_log" ON public.pr_scrape_audit_log
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.community_profiles WHERE user_id = auth.uid() AND 'admin' = ANY(roles))
  );

CREATE POLICY "Admins can manage pr_agent_runs" ON public.pr_agent_runs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.community_profiles WHERE user_id = auth.uid() AND 'admin' = ANY(roles))
  );

-- Indexes for performance
CREATE INDEX idx_media_outlets_region ON public.media_outlets(region);
CREATE INDEX idx_media_outlets_type ON public.media_outlets(outlet_type);
CREATE INDEX idx_media_outlets_authority ON public.media_outlets(authority_score DESC);
CREATE INDEX idx_journalist_contacts_outlet ON public.journalist_contacts(outlet_id);
CREATE INDEX idx_journalist_contacts_status ON public.journalist_contacts(relationship_status);
CREATE INDEX idx_journalist_contacts_authority ON public.journalist_contacts(authority_score DESC);
CREATE INDEX idx_outreach_history_journalist ON public.outreach_history(journalist_id);
CREATE INDEX idx_outreach_history_status ON public.outreach_history(status);
CREATE INDEX idx_pr_agent_runs_type ON public.pr_agent_runs(run_type);
CREATE INDEX idx_pr_agent_runs_status ON public.pr_agent_runs(status);

-- Updated_at trigger function (reuse if exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_media_outlets_updated_at
  BEFORE UPDATE ON public.media_outlets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_journalist_contacts_updated_at
  BEFORE UPDATE ON public.journalist_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_outreach_history_updated_at
  BEFORE UPDATE ON public.outreach_history
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pr_lists_segments_updated_at
  BEFORE UPDATE ON public.pr_lists_segments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();