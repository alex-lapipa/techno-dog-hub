-- Create tables for the Google Organic Traffic Strategy Playbook

-- Main strategy sections table
CREATE TABLE public.seo_strategy_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL UNIQUE,
  section_name TEXT NOT NULL,
  description TEXT,
  content TEXT,
  priority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  last_analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Strategy action items (actionable buttons for each suggestion)
CREATE TABLE public.seo_strategy_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES public.seo_strategy_sections(id) ON DELETE CASCADE,
  action_name TEXT NOT NULL,
  description TEXT,
  action_type TEXT NOT NULL CHECK (action_type IN ('implement', 'audit', 'optimize', 'monitor', 'research', 'content')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  estimated_impact TEXT,
  implementation_notes TEXT,
  page_target TEXT,
  completed_at TIMESTAMPTZ,
  completed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Page-by-page SEO analysis results
CREATE TABLE public.seo_page_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL,
  page_name TEXT NOT NULL,
  seo_score INTEGER,
  title_analysis JSONB,
  meta_description_analysis JSONB,
  heading_analysis JSONB,
  content_analysis JSONB,
  structured_data_analysis JSONB,
  internal_links_analysis JSONB,
  image_optimization JSONB,
  mobile_optimization JSONB,
  core_web_vitals JSONB,
  keyword_opportunities JSONB,
  recommendations TEXT[],
  last_analyzed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(page_path)
);

-- Keyword strategy and tracking
CREATE TABLE public.seo_keyword_strategy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  keyword_type TEXT CHECK (keyword_type IN ('primary', 'secondary', 'long_tail', 'branded', 'local')),
  search_volume_estimate TEXT,
  competition_level TEXT CHECK (competition_level IN ('low', 'medium', 'high')),
  current_ranking TEXT,
  target_ranking TEXT,
  target_pages TEXT[],
  content_strategy TEXT,
  status TEXT DEFAULT 'researching' CHECK (status IN ('researching', 'targeting', 'ranking', 'achieved', 'declined')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Content calendar and strategy
CREATE TABLE public.seo_content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('blog_post', 'landing_page', 'feature_page', 'update', 'optimization')),
  title TEXT NOT NULL,
  target_keywords TEXT[],
  target_page TEXT,
  description TEXT,
  seo_objective TEXT,
  scheduled_date DATE,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'published', 'optimizing')),
  published_at TIMESTAMPTZ,
  performance_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Training modules for Alex
CREATE TABLE public.seo_training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key TEXT NOT NULL UNIQUE,
  module_name TEXT NOT NULL,
  description TEXT,
  content TEXT,
  learning_objectives TEXT[],
  exercises JSONB,
  completion_status TEXT DEFAULT 'not_started' CHECK (completion_status IN ('not_started', 'in_progress', 'completed')),
  quiz_results JSONB,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Agent run history
CREATE TABLE public.seo_strategy_agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_type TEXT NOT NULL,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  started_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ,
  results JSONB,
  error_message TEXT,
  pages_analyzed INTEGER DEFAULT 0,
  actions_generated INTEGER DEFAULT 0
);

-- Enable RLS on all tables
ALTER TABLE public.seo_strategy_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_strategy_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_page_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_keyword_strategy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_strategy_agent_runs ENABLE ROW LEVEL SECURITY;

-- Create policies (admin-only access via service role for edge functions)
CREATE POLICY "Allow public read for SEO strategy sections"
  ON public.seo_strategy_sections FOR SELECT
  USING (true);

CREATE POLICY "Allow public read for SEO strategy actions"
  ON public.seo_strategy_actions FOR SELECT
  USING (true);

CREATE POLICY "Allow public read for SEO page analysis"
  ON public.seo_page_analysis FOR SELECT
  USING (true);

CREATE POLICY "Allow public read for SEO keyword strategy"
  ON public.seo_keyword_strategy FOR SELECT
  USING (true);

CREATE POLICY "Allow public read for SEO content calendar"
  ON public.seo_content_calendar FOR SELECT
  USING (true);

CREATE POLICY "Allow public read for SEO training modules"
  ON public.seo_training_modules FOR SELECT
  USING (true);

CREATE POLICY "Allow public read for SEO agent runs"
  ON public.seo_strategy_agent_runs FOR SELECT
  USING (true);

-- Create update triggers
CREATE TRIGGER update_seo_strategy_sections_updated_at
  BEFORE UPDATE ON public.seo_strategy_sections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seo_strategy_actions_updated_at
  BEFORE UPDATE ON public.seo_strategy_actions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seo_page_analysis_updated_at
  BEFORE UPDATE ON public.seo_page_analysis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seo_keyword_strategy_updated_at
  BEFORE UPDATE ON public.seo_keyword_strategy
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seo_content_calendar_updated_at
  BEFORE UPDATE ON public.seo_content_calendar
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seo_training_modules_updated_at
  BEFORE UPDATE ON public.seo_training_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();