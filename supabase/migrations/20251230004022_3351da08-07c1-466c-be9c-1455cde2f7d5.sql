-- Create isolated self-healing agent tables for Doggy module
-- These tables ONLY affect the Doggy landing page, never the main site

-- 1. Agent issues log - tracks detected problems
CREATE TABLE public.doggy_agent_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_type TEXT NOT NULL, -- 'share_failure', 'download_error', 'svg_render', 'analytics_gap', 'performance'
  severity TEXT NOT NULL DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
  description TEXT NOT NULL,
  affected_component TEXT, -- e.g., 'TechnoDoggies.tsx', 'DoggyWidget.tsx'
  affected_doggy TEXT, -- which doggy variant if applicable
  detection_source TEXT NOT NULL, -- 'analytics', 'error_log', 'performance', 'user_report'
  auto_fixable BOOLEAN DEFAULT false,
  fix_applied BOOLEAN DEFAULT false,
  fix_applied_at TIMESTAMP WITH TIME ZONE,
  fix_description TEXT,
  hq_suggestion TEXT, -- suggested improvement for Doggies HQ
  hq_approved BOOLEAN DEFAULT false,
  hq_approved_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- 2. Agent runs log - tracks when agent runs and what it did
CREATE TABLE public.doggy_agent_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_type TEXT NOT NULL, -- 'scheduled', 'manual', 'triggered'
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'running', -- 'running', 'completed', 'failed'
  issues_detected INTEGER DEFAULT 0,
  issues_auto_fixed INTEGER DEFAULT 0,
  hq_suggestions_created INTEGER DEFAULT 0,
  performance_score NUMERIC(5,2), -- 0-100
  virality_score NUMERIC(5,2), -- 0-100
  health_report JSONB DEFAULT '{}',
  error_message TEXT
);

-- 3. Landing page error logs - captures client-side errors
CREATE TABLE public.doggy_error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  error_type TEXT NOT NULL, -- 'share', 'download', 'render', 'network', 'unknown'
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  page_source TEXT, -- 'main_page', 'widget', 'shared'
  doggy_name TEXT,
  user_agent TEXT,
  session_id TEXT,
  action_attempted TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Auto-fix history - tracks what the agent fixed on landing page
CREATE TABLE public.doggy_auto_fixes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID REFERENCES public.doggy_agent_issues(id),
  fix_type TEXT NOT NULL, -- 'config_update', 'fallback_enable', 'cache_clear', 'retry_logic'
  target_component TEXT NOT NULL,
  before_state JSONB,
  after_state JSONB,
  success BOOLEAN DEFAULT true,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  rollback_at TIMESTAMP WITH TIME ZONE,
  rollback_reason TEXT
);

-- Enable RLS on all tables (public read for landing page, admin write)
ALTER TABLE public.doggy_agent_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doggy_agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doggy_error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doggy_auto_fixes ENABLE ROW LEVEL SECURITY;

-- Public can INSERT error logs (for client-side error reporting)
CREATE POLICY "Anyone can report errors" ON public.doggy_error_logs
  FOR INSERT WITH CHECK (true);

-- Public can read agent status for landing page health display
CREATE POLICY "Anyone can read agent runs" ON public.doggy_agent_runs
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read agent issues" ON public.doggy_agent_issues
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read auto fixes" ON public.doggy_auto_fixes
  FOR SELECT USING (true);

-- Service role can do everything (for edge functions)
CREATE POLICY "Service role full access issues" ON public.doggy_agent_issues
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access runs" ON public.doggy_agent_runs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access errors" ON public.doggy_error_logs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access fixes" ON public.doggy_auto_fixes
  FOR ALL USING (auth.role() = 'service_role');

-- Create index for performance
CREATE INDEX idx_doggy_agent_issues_created ON public.doggy_agent_issues(created_at DESC);
CREATE INDEX idx_doggy_agent_issues_unresolved ON public.doggy_agent_issues(resolved_at) WHERE resolved_at IS NULL;
CREATE INDEX idx_doggy_error_logs_created ON public.doggy_error_logs(created_at DESC);
CREATE INDEX idx_doggy_agent_runs_status ON public.doggy_agent_runs(status, started_at DESC);

-- Add to realtime for live monitoring
ALTER PUBLICATION supabase_realtime ADD TABLE public.doggy_agent_issues;
ALTER PUBLICATION supabase_realtime ADD TABLE public.doggy_agent_runs;