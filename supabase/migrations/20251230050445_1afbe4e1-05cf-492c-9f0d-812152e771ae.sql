-- Collectives & Scene Entities Database Schema

-- Main collectives table
CREATE TABLE public.collectives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collective_name TEXT NOT NULL,
  collective_aliases JSONB DEFAULT '[]'::jsonb,
  collective_type TEXT[] DEFAULT ARRAY[]::TEXT[],
  region TEXT CHECK (region IN ('Europe', 'UK', 'North America')),
  country TEXT,
  city TEXT,
  base_locations_json JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'uncertain' CHECK (status IN ('active', 'uncertain', 'inactive')),
  activity_evidence TEXT,
  founded_year INTEGER,
  website_url TEXT,
  primary_platforms_json JSONB DEFAULT '{}'::jsonb,
  contact_email TEXT,
  contact_phone TEXT,
  contact_form_url TEXT,
  booking_email TEXT,
  press_email TEXT,
  collaboration_email TEXT,
  physical_address TEXT,
  philosophy_summary TEXT,
  manifesto_url TEXT,
  inclusivity_policy_url TEXT,
  anti_harassment_policy_url TEXT,
  collaboration_preferences_summary TEXT,
  what_they_like TEXT,
  what_they_dislike TEXT,
  techno_doc_fit_score INTEGER DEFAULT 0 CHECK (techno_doc_fit_score >= 0 AND techno_doc_fit_score <= 100),
  credibility_score INTEGER DEFAULT 0 CHECK (credibility_score >= 0 AND credibility_score <= 100),
  activity_score INTEGER DEFAULT 0 CHECK (activity_score >= 0 AND activity_score <= 100),
  last_verified_at TIMESTAMPTZ,
  verification_confidence INTEGER DEFAULT 0 CHECK (verification_confidence >= 0 AND verification_confidence <= 100),
  sources_json JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Key people associated with collectives
CREATE TABLE public.collective_key_people (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collective_id UUID REFERENCES public.collectives(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  role_title TEXT,
  email TEXT,
  phone TEXT,
  social_links_json JSONB DEFAULT '{}'::jsonb,
  preferred_contact_method TEXT,
  location_country TEXT,
  location_city TEXT,
  notes_on_how_to_approach TEXT,
  enrichment_confidence INTEGER DEFAULT 0 CHECK (enrichment_confidence >= 0 AND enrichment_confidence <= 100),
  source_url TEXT,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Activities and recurring events
CREATE TABLE public.collective_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collective_id UUID REFERENCES public.collectives(id) ON DELETE CASCADE,
  activity_type TEXT,
  description TEXT,
  frequency TEXT,
  main_venues_json JSONB DEFAULT '[]'::jsonb,
  recurring_event_names_json JSONB DEFAULT '[]'::jsonb,
  event_platforms_json JSONB DEFAULT '[]'::jsonb,
  source_url TEXT,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Live coding events calendar
CREATE TABLE public.events_livecoding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collective_id UUID REFERENCES public.collectives(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  platform TEXT,
  city TEXT,
  country TEXT,
  region TEXT,
  venue TEXT,
  recurring BOOLEAN DEFAULT false,
  schedule_notes TEXT,
  event_url TEXT,
  contact_email TEXT,
  source_url TEXT,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Outreach history for collectives
CREATE TABLE public.collective_outreach_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collective_id UUID REFERENCES public.collectives(id) ON DELETE CASCADE,
  key_person_id UUID REFERENCES public.collective_key_people(id) ON DELETE SET NULL,
  date DATE DEFAULT CURRENT_DATE,
  outreach_type TEXT,
  message_summary TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'responded', 'follow-up', 'closed')),
  response_notes TEXT,
  next_action_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Saved segments/lists for filtering
CREATE TABLE public.collective_segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  filters_json JSONB DEFAULT '{}'::jsonb,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Agent run tracking
CREATE TABLE public.collective_agent_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  stats JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Scraping audit log
CREATE TABLE public.collective_scrape_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  source_url TEXT,
  data_extracted JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.collectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collective_key_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collective_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events_livecoding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collective_outreach_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collective_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collective_agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collective_scrape_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin access (using has_role function)
CREATE POLICY "Admin full access to collectives" ON public.collectives FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access to collective_key_people" ON public.collective_key_people FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access to collective_activities" ON public.collective_activities FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access to events_livecoding" ON public.events_livecoding FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access to collective_outreach_history" ON public.collective_outreach_history FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access to collective_segments" ON public.collective_segments FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access to collective_agent_runs" ON public.collective_agent_runs FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access to collective_scrape_audit" ON public.collective_scrape_audit FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Indexes for performance
CREATE INDEX idx_collectives_region ON public.collectives(region);
CREATE INDEX idx_collectives_status ON public.collectives(status);
CREATE INDEX idx_collectives_country ON public.collectives(country);
CREATE INDEX idx_collectives_city ON public.collectives(city);
CREATE INDEX idx_collectives_fit_score ON public.collectives(techno_doc_fit_score);
CREATE INDEX idx_collective_key_people_collective ON public.collective_key_people(collective_id);
CREATE INDEX idx_collective_activities_collective ON public.collective_activities(collective_id);
CREATE INDEX idx_events_livecoding_collective ON public.events_livecoding(collective_id);
CREATE INDEX idx_events_livecoding_region ON public.events_livecoding(region);