-- =====================================================
-- GEAR MANUFACTURERS & CONTACTS DATABASE SCHEMA
-- =====================================================

-- 1. GEAR BRANDS (Manufacturers)
CREATE TABLE public.gear_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name TEXT NOT NULL UNIQUE,
  brand_aliases JSONB DEFAULT '[]',
  status TEXT DEFAULT 'unknown' CHECK (status IN ('active', 'inactive', 'unknown')),
  brand_website_url TEXT,
  headquarters_country TEXT,
  headquarters_city TEXT,
  primary_language TEXT DEFAULT 'en',
  parent_company_name TEXT,
  parent_company_website TEXT,
  ownership_notes TEXT,
  official_press_page_url TEXT,
  official_contact_page_url TEXT,
  collaboration_policy_summary TEXT,
  collaboration_policy_url TEXT,
  support_policy_summary TEXT,
  support_url TEXT,
  verification_confidence INTEGER DEFAULT 0 CHECK (verification_confidence >= 0 AND verification_confidence <= 100),
  collaboration_friendliness_score INTEGER DEFAULT 0 CHECK (collaboration_friendliness_score >= 0 AND collaboration_friendliness_score <= 100),
  sources_json JSONB DEFAULT '[]',
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 2. GEAR PRODUCTS
CREATE TABLE public.gear_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.gear_brands(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_type TEXT CHECK (product_type IN (
    'synth', 'drum_machine', 'sampler', 'groovebox', 'modular', 'effect', 
    'controller', 'daw', 'plugin', 'interface', 'mixer', 'monitor', 
    'sequencer', 'midi_tool', 'other'
  )),
  product_status TEXT DEFAULT 'unknown' CHECK (product_status IN ('currently_manufactured', 'discontinued', 'unknown')),
  product_page_url TEXT,
  year_introduced INTEGER,
  key_tech_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  notable_artists_in_project JSONB DEFAULT '[]',
  synthesis_type TEXT,
  notes TEXT,
  sources_json JSONB DEFAULT '[]',
  last_verified_at TIMESTAMPTZ,
  original_gear_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. BRAND CONTACTS
CREATE TABLE public.brand_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.gear_brands(id) ON DELETE CASCADE,
  contact_type TEXT NOT NULL CHECK (contact_type IN (
    'press', 'partnerships', 'artist_relations', 'marketing', 
    'product', 'support', 'legal', 'general', 'education', 'events'
  )),
  contact_person_name TEXT,
  role_title TEXT,
  department TEXT,
  email TEXT,
  phone TEXT,
  contact_form_url TEXT,
  mailing_address TEXT,
  social_links_json JSONB DEFAULT '{}',
  region_coverage TEXT DEFAULT 'global' CHECK (region_coverage IN ('global', 'europe', 'north_america', 'asia', 'other')),
  preferred_contact_method TEXT CHECK (preferred_contact_method IN ('email', 'form', 'phone', 'linkedin', 'other')),
  notes_on_how_to_approach TEXT,
  what_they_care_about TEXT,
  do_not_do TEXT,
  enrichment_confidence INTEGER DEFAULT 0 CHECK (enrichment_confidence >= 0 AND enrichment_confidence <= 100),
  contact_relevance_score INTEGER DEFAULT 0 CHECK (contact_relevance_score >= 0 AND contact_relevance_score <= 100),
  source_url TEXT,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 4. COLLABORATION PROGRAMS
CREATE TABLE public.collaboration_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.gear_brands(id) ON DELETE CASCADE,
  program_type TEXT NOT NULL CHECK (program_type IN (
    'artist_endorsement', 'educational', 'content_collab', 'product_beta',
    'events', 'sponsorship', 'affiliate', 'press_review', 'other'
  )),
  program_name TEXT,
  requirements_summary TEXT,
  submission_url TEXT,
  decision_timeline_notes TEXT,
  what_they_care_about TEXT,
  do_not_do TEXT,
  is_active BOOLEAN DEFAULT true,
  source_url TEXT,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. GEAR OUTREACH HISTORY
CREATE TABLE public.gear_outreach_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.gear_brands(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.brand_contacts(id) ON DELETE SET NULL,
  outreach_date TIMESTAMPTZ DEFAULT now(),
  outreach_type TEXT NOT NULL CHECK (outreach_type IN ('email', 'call', 'form', 'event', 'intro', 'linkedin', 'other')),
  message_summary TEXT,
  message_content TEXT,
  subject_line TEXT,
  campaign_name TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'responded', 'follow_up', 'closed', 'success', 'declined')),
  response_notes TEXT,
  next_action_date DATE,
  next_action_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 6. GEAR AGENT RUNS
CREATE TABLE public.gear_agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_type TEXT NOT NULL CHECK (run_type IN ('ingest', 'verify', 'enrich_contacts', 'find_ownership', 'outreach', 'refresh')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  parameters JSONB,
  results JSONB,
  models_used TEXT[],
  brands_processed INTEGER DEFAULT 0,
  contacts_found INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_by UUID REFERENCES auth.users(id)
);

-- 7. GEAR SCRAPE AUDIT LOG
CREATE TABLE public.gear_scrape_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  source_url TEXT,
  brand_name TEXT,
  records_affected INTEGER DEFAULT 0,
  models_used TEXT[],
  parameters JSONB,
  status TEXT DEFAULT 'completed',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on all tables
ALTER TABLE public.gear_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gear_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gear_outreach_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gear_agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gear_scrape_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admin access only
CREATE POLICY "Admins can manage gear_brands" ON public.gear_brands
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.community_profiles WHERE user_id = auth.uid() AND 'admin' = ANY(roles))
  );

CREATE POLICY "Admins can manage gear_products" ON public.gear_products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.community_profiles WHERE user_id = auth.uid() AND 'admin' = ANY(roles))
  );

CREATE POLICY "Admins can manage brand_contacts" ON public.brand_contacts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.community_profiles WHERE user_id = auth.uid() AND 'admin' = ANY(roles))
  );

CREATE POLICY "Admins can manage collaboration_programs" ON public.collaboration_programs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.community_profiles WHERE user_id = auth.uid() AND 'admin' = ANY(roles))
  );

CREATE POLICY "Admins can manage gear_outreach_history" ON public.gear_outreach_history
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.community_profiles WHERE user_id = auth.uid() AND 'admin' = ANY(roles))
  );

CREATE POLICY "Admins can manage gear_agent_runs" ON public.gear_agent_runs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.community_profiles WHERE user_id = auth.uid() AND 'admin' = ANY(roles))
  );

CREATE POLICY "Admins can manage gear_scrape_audit_log" ON public.gear_scrape_audit_log
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.community_profiles WHERE user_id = auth.uid() AND 'admin' = ANY(roles))
  );

-- Indexes for performance
CREATE INDEX idx_gear_brands_status ON public.gear_brands(status);
CREATE INDEX idx_gear_brands_country ON public.gear_brands(headquarters_country);
CREATE INDEX idx_gear_products_brand ON public.gear_products(brand_id);
CREATE INDEX idx_gear_products_status ON public.gear_products(product_status);
CREATE INDEX idx_gear_products_type ON public.gear_products(product_type);
CREATE INDEX idx_brand_contacts_brand ON public.brand_contacts(brand_id);
CREATE INDEX idx_brand_contacts_type ON public.brand_contacts(contact_type);
CREATE INDEX idx_collaboration_programs_brand ON public.collaboration_programs(brand_id);
CREATE INDEX idx_gear_outreach_history_brand ON public.gear_outreach_history(brand_id);
CREATE INDEX idx_gear_agent_runs_type ON public.gear_agent_runs(run_type);

-- Apply updated_at triggers
CREATE TRIGGER update_gear_brands_updated_at
  BEFORE UPDATE ON public.gear_brands
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gear_products_updated_at
  BEFORE UPDATE ON public.gear_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_brand_contacts_updated_at
  BEFORE UPDATE ON public.brand_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_collaboration_programs_updated_at
  BEFORE UPDATE ON public.collaboration_programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gear_outreach_history_updated_at
  BEFORE UPDATE ON public.gear_outreach_history
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();