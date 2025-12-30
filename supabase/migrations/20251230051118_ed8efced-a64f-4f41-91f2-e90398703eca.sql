-- =====================================================
-- Open-Source Operating System Playbook Agent Tables
-- =====================================================

-- Playbook sections (main handbook content)
CREATE TABLE public.playbook_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  section_title TEXT NOT NULL,
  section_description TEXT,
  section_content_markdown TEXT,
  version_number INTEGER DEFAULT 1,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'reviewed', 'active', 'deprecated')),
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by TEXT DEFAULT 'system',
  sources_json JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Principles and values
CREATE TABLE public.principles_values (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  principle_name TEXT NOT NULL,
  principle_summary TEXT,
  why_it_matters TEXT,
  practical_examples JSONB DEFAULT '[]'::jsonb,
  do_list JSONB DEFAULT '[]'::jsonb,
  dont_list JSONB DEFAULT '[]'::jsonb,
  related_policies JSONB DEFAULT '[]'::jsonb,
  sources_json JSONB DEFAULT '[]'::jsonb,
  last_verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Governance models
CREATE TABLE public.governance_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_name TEXT NOT NULL,
  description TEXT,
  pros_cons JSONB DEFAULT '{"pros": [], "cons": []}'::jsonb,
  best_for TEXT,
  risks TEXT,
  recommended_for_techno_doc BOOLEAN DEFAULT false,
  recommended_variant_notes TEXT,
  sources_json JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Processes and workflows
CREATE TABLE public.processes_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_name TEXT NOT NULL,
  workflow_category TEXT CHECK (workflow_category IN ('contribution', 'content', 'code', 'review', 'release', 'moderation', 'decision-making')),
  steps_json JSONB DEFAULT '[]'::jsonb,
  required_roles_json JSONB DEFAULT '[]'::jsonb,
  tools_needed_json JSONB DEFAULT '[]'::jsonb,
  templates_linked JSONB DEFAULT '[]'::jsonb,
  success_metrics TEXT,
  common_failure_modes TEXT,
  sources_json JSONB DEFAULT '[]'::jsonb,
  last_verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Templates and assets
CREATE TABLE public.templates_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL,
  template_type TEXT CHECK (template_type IN ('issue_template', 'PR_template', 'RFC', 'meeting_notes', 'contributor_onboarding', 'code_review', 'content_submission', 'release_notes', 'incident_report')),
  template_content_markdown TEXT,
  usage_instructions TEXT,
  sources_json JSONB DEFAULT '[]'::jsonb,
  last_verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Policies
CREATE TABLE public.policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_name TEXT NOT NULL,
  policy_type TEXT CHECK (policy_type IN ('code_of_conduct', 'moderation', 'licensing', 'privacy', 'attribution', 'conflict_resolution', 'contributor_agreement')),
  policy_content_markdown TEXT,
  enforcement_process TEXT,
  escalation_path TEXT,
  sources_json JSONB DEFAULT '[]'::jsonb,
  last_verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Community health metrics
CREATE TABLE public.community_health_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  description TEXT,
  how_to_measure TEXT,
  recommended_thresholds JSONB DEFAULT '{}'::jsonb,
  interventions_when_low TEXT,
  sources_json JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Decision records (ADR/RFC system)
CREATE TABLE public.decision_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  decision_type TEXT CHECK (decision_type IN ('ADR', 'RFC', 'governance_vote', 'policy_update')),
  context TEXT,
  decision TEXT,
  consequences TEXT,
  status TEXT DEFAULT 'proposed' CHECK (status IN ('proposed', 'accepted', 'rejected', 'superseded', 'deprecated')),
  sources_json JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Playbook agent runs (for tracking)
CREATE TABLE public.playbook_agent_runs (
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
ALTER TABLE public.playbook_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.principles_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processes_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playbook_agent_runs ENABLE ROW LEVEL SECURITY;

-- Admin-only policies for playbook_sections
CREATE POLICY "Admin read playbook_sections" ON public.playbook_sections FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin insert playbook_sections" ON public.playbook_sections FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin update playbook_sections" ON public.playbook_sections FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin delete playbook_sections" ON public.playbook_sections FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Admin-only policies for principles_values
CREATE POLICY "Admin read principles_values" ON public.principles_values FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin insert principles_values" ON public.principles_values FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin update principles_values" ON public.principles_values FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin delete principles_values" ON public.principles_values FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Admin-only policies for governance_models
CREATE POLICY "Admin read governance_models" ON public.governance_models FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin insert governance_models" ON public.governance_models FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin update governance_models" ON public.governance_models FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin delete governance_models" ON public.governance_models FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Admin-only policies for processes_workflows
CREATE POLICY "Admin read processes_workflows" ON public.processes_workflows FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin insert processes_workflows" ON public.processes_workflows FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin update processes_workflows" ON public.processes_workflows FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin delete processes_workflows" ON public.processes_workflows FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Admin-only policies for templates_assets
CREATE POLICY "Admin read templates_assets" ON public.templates_assets FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin insert templates_assets" ON public.templates_assets FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin update templates_assets" ON public.templates_assets FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin delete templates_assets" ON public.templates_assets FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Admin-only policies for policies
CREATE POLICY "Admin read policies" ON public.policies FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin insert policies" ON public.policies FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin update policies" ON public.policies FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin delete policies" ON public.policies FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Admin-only policies for community_health_metrics
CREATE POLICY "Admin read community_health_metrics" ON public.community_health_metrics FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin insert community_health_metrics" ON public.community_health_metrics FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin update community_health_metrics" ON public.community_health_metrics FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin delete community_health_metrics" ON public.community_health_metrics FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Admin-only policies for decision_records
CREATE POLICY "Admin read decision_records" ON public.decision_records FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin insert decision_records" ON public.decision_records FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin update decision_records" ON public.decision_records FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin delete decision_records" ON public.decision_records FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Admin-only policies for playbook_agent_runs
CREATE POLICY "Admin read playbook_agent_runs" ON public.playbook_agent_runs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin insert playbook_agent_runs" ON public.playbook_agent_runs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin update playbook_agent_runs" ON public.playbook_agent_runs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin delete playbook_agent_runs" ON public.playbook_agent_runs FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Create indexes for common queries
CREATE INDEX idx_playbook_sections_key ON public.playbook_sections(section_key);
CREATE INDEX idx_playbook_sections_status ON public.playbook_sections(status);
CREATE INDEX idx_principles_values_name ON public.principles_values(principle_name);
CREATE INDEX idx_governance_models_name ON public.governance_models(model_name);
CREATE INDEX idx_processes_workflows_category ON public.processes_workflows(workflow_category);
CREATE INDEX idx_templates_assets_type ON public.templates_assets(template_type);
CREATE INDEX idx_policies_type ON public.policies(policy_type);
CREATE INDEX idx_decision_records_type ON public.decision_records(decision_type);
CREATE INDEX idx_decision_records_status ON public.decision_records(status);
CREATE INDEX idx_playbook_agent_runs_status ON public.playbook_agent_runs(status);