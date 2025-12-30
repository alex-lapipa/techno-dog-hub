-- =====================================================
-- Techno.dog Outreach Engine - CRM + Campaigns Tables
-- =====================================================

-- CRM Contacts (derived from existing DBs as snapshot references)
CREATE TABLE public.crm_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_contact_id TEXT,
  stakeholder_type TEXT CHECK (stakeholder_type IN ('journalist', 'manager', 'label', 'collective', 'manufacturer', 'open_source_leader', 'other')),
  full_name TEXT NOT NULL,
  organization_name TEXT,
  role_title TEXT,
  email TEXT NOT NULL,
  secondary_emails_json JSONB DEFAULT '[]'::jsonb,
  phone TEXT,
  region TEXT CHECK (region IN ('EU', 'UK', 'NA', 'global')),
  country TEXT,
  city TEXT,
  tags_json JSONB DEFAULT '[]'::jsonb,
  personalization_notes TEXT,
  contact_source_db TEXT,
  relationship_status TEXT DEFAULT 'new' CHECK (relationship_status IN ('new', 'warm', 'engaged', 'partner', 'avoid')),
  suppression_status TEXT DEFAULT 'active' CHECK (suppression_status IN ('active', 'opted_out', 'bounced', 'do_not_contact')),
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  last_verified_at TIMESTAMP WITH TIME ZONE,
  verification_confidence INTEGER DEFAULT 0 CHECK (verification_confidence >= 0 AND verification_confidence <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Campaigns
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_name TEXT NOT NULL,
  objective TEXT CHECK (objective IN ('awareness', 'collaboration', 'database_enrichment', 'sponsorship', 'partnership')),
  audience_segment JSONB DEFAULT '{}'::jsonb,
  campaign_theme TEXT,
  tone TEXT CHECK (tone IN ('formal', 'scene_native', 'editorial', 'partnership')),
  primary_call_to_action TEXT,
  created_by TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  stats_json JSONB DEFAULT '{"sent": 0, "opened": 0, "clicked": 0, "replied": 0, "bounced": 0}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Email Sequences
CREATE TABLE public.email_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  sequence_step INTEGER NOT NULL DEFAULT 1,
  delay_days INTEGER DEFAULT 0,
  subject_template TEXT NOT NULL,
  body_template_markdown TEXT NOT NULL,
  personalization_fields_json JSONB DEFAULT '[]'::jsonb,
  ab_variant_group TEXT DEFAULT 'A' CHECK (ab_variant_group IN ('A', 'B')),
  safety_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Outreach Messages
CREATE TABLE public.outreach_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  resend_message_id TEXT,
  subject TEXT NOT NULL,
  body_html TEXT,
  body_text TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'delivered', 'opened', 'clicked', 'replied', 'bounced', 'failed')),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  reply_detected BOOLEAN DEFAULT false,
  bounce_reason TEXT,
  follow_up_due_at TIMESTAMP WITH TIME ZONE,
  next_action_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Templates Library
CREATE TABLE public.templates_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL,
  stakeholder_type TEXT,
  purpose TEXT CHECK (purpose IN ('intro', 'partnership', 'sponsor', 'data_collaboration', 'press_pitch', 'invite')),
  tone TEXT CHECK (tone IN ('formal', 'scene_native', 'editorial', 'partnership')),
  subject_template TEXT NOT NULL,
  body_template_markdown TEXT NOT NULL,
  best_used_when TEXT,
  do_not_use_when TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Suppression List
CREATE TABLE public.suppression_list (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  reason TEXT CHECK (reason IN ('opt_out', 'bounced', 'admin_block', 'legal')),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Outreach Engine Agent Runs
CREATE TABLE public.outreach_engine_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE,
  stats JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppression_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_engine_runs ENABLE ROW LEVEL SECURITY;

-- Admin-only policies for crm_contacts
CREATE POLICY "Admin read crm_contacts" ON public.crm_contacts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin insert crm_contacts" ON public.crm_contacts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin update crm_contacts" ON public.crm_contacts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin delete crm_contacts" ON public.crm_contacts FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Admin-only policies for campaigns
CREATE POLICY "Admin read campaigns" ON public.campaigns FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin insert campaigns" ON public.campaigns FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin update campaigns" ON public.campaigns FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin delete campaigns" ON public.campaigns FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Admin-only policies for email_sequences
CREATE POLICY "Admin read email_sequences" ON public.email_sequences FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin insert email_sequences" ON public.email_sequences FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin update email_sequences" ON public.email_sequences FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin delete email_sequences" ON public.email_sequences FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Admin-only policies for outreach_messages
CREATE POLICY "Admin read outreach_messages" ON public.outreach_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin insert outreach_messages" ON public.outreach_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin update outreach_messages" ON public.outreach_messages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin delete outreach_messages" ON public.outreach_messages FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Admin-only policies for templates_library
CREATE POLICY "Admin read templates_library" ON public.templates_library FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin insert templates_library" ON public.templates_library FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin update templates_library" ON public.templates_library FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin delete templates_library" ON public.templates_library FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Admin-only policies for suppression_list
CREATE POLICY "Admin read suppression_list" ON public.suppression_list FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin insert suppression_list" ON public.suppression_list FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin update suppression_list" ON public.suppression_list FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin delete suppression_list" ON public.suppression_list FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Admin-only policies for outreach_engine_runs
CREATE POLICY "Admin read outreach_engine_runs" ON public.outreach_engine_runs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin insert outreach_engine_runs" ON public.outreach_engine_runs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin update outreach_engine_runs" ON public.outreach_engine_runs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin delete outreach_engine_runs" ON public.outreach_engine_runs FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Create indexes for common queries
CREATE INDEX idx_crm_contacts_email ON public.crm_contacts(email);
CREATE INDEX idx_crm_contacts_stakeholder ON public.crm_contacts(stakeholder_type);
CREATE INDEX idx_crm_contacts_status ON public.crm_contacts(relationship_status);
CREATE INDEX idx_crm_contacts_suppression ON public.crm_contacts(suppression_status);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_outreach_messages_status ON public.outreach_messages(status);
CREATE INDEX idx_outreach_messages_campaign ON public.outreach_messages(campaign_id);
CREATE INDEX idx_outreach_messages_contact ON public.outreach_messages(contact_id);
CREATE INDEX idx_suppression_list_email ON public.suppression_list(email);
CREATE INDEX idx_templates_library_purpose ON public.templates_library(purpose);