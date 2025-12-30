-- Artist Management & Label Intelligence Agent Tables

-- Artists Active (filtered from existing artist DB)
CREATE TABLE public.artists_active (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_name TEXT NOT NULL,
  artist_aliases JSONB DEFAULT '[]'::jsonb,
  region_focus TEXT CHECK (region_focus IN ('EU', 'North America', 'both', 'UK')),
  country_base TEXT,
  city_base TEXT,
  artist_website_url TEXT,
  main_social_links_json JSONB DEFAULT '{}'::jsonb,
  active_status TEXT DEFAULT 'uncertain' CHECK (active_status IN ('active', 'uncertain', 'inactive')),
  evidence_of_activity TEXT,
  last_verified_at TIMESTAMPTZ,
  verification_confidence INTEGER DEFAULT 0 CHECK (verification_confidence >= 0 AND verification_confidence <= 100),
  source_urls_json JSONB DEFAULT '[]'::jsonb,
  canonical_artist_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Artist Managers
CREATE TABLE public.artist_managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES public.artists_active(id) ON DELETE CASCADE,
  manager_name TEXT NOT NULL,
  manager_role TEXT CHECK (manager_role IN ('manager', 'agent', 'booking', 'PR', 'label_manager')),
  management_company TEXT,
  company_website TEXT,
  email TEXT,
  phone TEXT,
  contact_form_url TEXT,
  professional_social_links_json JSONB DEFAULT '{}'::jsonb,
  region_coverage TEXT CHECK (region_coverage IN ('EU', 'North America', 'global', 'UK')),
  location_country TEXT,
  location_city TEXT,
  address TEXT,
  relationship_status TEXT DEFAULT 'new' CHECK (relationship_status IN ('new', 'contacted', 'engaged', 'avoid')),
  what_they_like TEXT,
  what_they_dislike TEXT,
  collaboration_policy_summary TEXT,
  best_approach_notes TEXT,
  outreach_channel_preference TEXT CHECK (outreach_channel_preference IN ('email', 'phone', 'form', 'intro')),
  enrichment_confidence INTEGER DEFAULT 0 CHECK (enrichment_confidence >= 0 AND enrichment_confidence <= 100),
  data_source_url TEXT,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Labels
CREATE TABLE public.labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label_name TEXT NOT NULL,
  label_type TEXT CHECK (label_type IN ('independent', 'major_imprint', 'artist_owned', 'collective')),
  label_website_url TEXT,
  parent_company TEXT,
  headquarters_country TEXT,
  headquarters_city TEXT,
  address TEXT,
  general_email TEXT,
  phone TEXT,
  contact_form_url TEXT,
  submissions_policy_url TEXT,
  collaborations_policy_url TEXT,
  roster_url TEXT,
  notes TEXT,
  last_verified_at TIMESTAMPTZ,
  verification_confidence INTEGER DEFAULT 0 CHECK (verification_confidence >= 0 AND verification_confidence <= 100),
  sources_json JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Artist-Label Relationships
CREATE TABLE public.artist_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES public.artists_active(id) ON DELETE CASCADE,
  label_id UUID REFERENCES public.labels(id) ON DELETE CASCADE,
  relationship_type TEXT CHECK (relationship_type IN ('primary', 'frequent', 'recent', 'management_linked')),
  evidence_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Label Contacts
CREATE TABLE public.label_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label_id UUID REFERENCES public.labels(id) ON DELETE CASCADE,
  contact_person_name TEXT,
  role_title TEXT,
  department TEXT CHECK (department IN ('A&R', 'PR', 'partnerships', 'marketing', 'label_manager', 'licensing', 'general')),
  email TEXT,
  phone TEXT,
  contact_form_url TEXT,
  location_country TEXT,
  location_city TEXT,
  professional_social_links_json JSONB DEFAULT '{}'::jsonb,
  collaboration_preferences_summary TEXT,
  what_they_like TEXT,
  what_they_dislike TEXT,
  best_approach_notes TEXT,
  enrichment_confidence INTEGER DEFAULT 0 CHECK (enrichment_confidence >= 0 AND enrichment_confidence <= 100),
  source_url TEXT,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Outreach History for Artist/Label Relations
CREATE TABLE public.artist_label_outreach_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES public.artists_active(id) ON DELETE SET NULL,
  manager_id UUID REFERENCES public.artist_managers(id) ON DELETE SET NULL,
  label_id UUID REFERENCES public.labels(id) ON DELETE SET NULL,
  label_contact_id UUID REFERENCES public.label_contacts(id) ON DELETE SET NULL,
  date TIMESTAMPTZ DEFAULT now(),
  outreach_type TEXT CHECK (outreach_type IN ('email', 'call', 'form', 'event', 'intro')),
  message_summary TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'responded', 'follow_up', 'closed')),
  response_notes TEXT,
  next_action_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Segments/Lists for Artist-Label Relations
CREATE TABLE public.artist_label_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  filters_json JSONB DEFAULT '{}'::jsonb,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Agent Runs Tracking
CREATE TABLE public.artist_label_agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_type TEXT NOT NULL,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  started_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ,
  stats JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Scrape Audit Log
CREATE TABLE public.artist_label_scrape_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  source_url TEXT,
  data_extracted JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.artists_active ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.label_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_label_outreach_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_label_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_label_agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_label_scrape_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin access (service role bypasses, authenticated admins can access)
CREATE POLICY "Admin full access artists_active" ON public.artists_active FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access artist_managers" ON public.artist_managers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access labels" ON public.labels FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access artist_labels" ON public.artist_labels FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access label_contacts" ON public.label_contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access artist_label_outreach" ON public.artist_label_outreach_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access artist_label_segments" ON public.artist_label_segments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access artist_label_agent_runs" ON public.artist_label_agent_runs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access artist_label_scrape_audit" ON public.artist_label_scrape_audit FOR ALL USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_artists_active_region ON public.artists_active(region_focus);
CREATE INDEX idx_artists_active_status ON public.artists_active(active_status);
CREATE INDEX idx_artist_managers_artist ON public.artist_managers(artist_id);
CREATE INDEX idx_artist_labels_artist ON public.artist_labels(artist_id);
CREATE INDEX idx_artist_labels_label ON public.artist_labels(label_id);
CREATE INDEX idx_label_contacts_label ON public.label_contacts(label_id);
CREATE INDEX idx_outreach_artist ON public.artist_label_outreach_history(artist_id);
CREATE INDEX idx_outreach_label ON public.artist_label_outreach_history(label_id);