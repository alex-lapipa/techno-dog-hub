-- Changelog System following Keep a Changelog / Semantic Versioning standards
-- https://keepachangelog.com/en/1.0.0/

-- Changelog entries table
CREATE TABLE public.changelog_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT NOT NULL DEFAULT '0.0.0',
  
  -- Keep a Changelog categories: Added, Changed, Deprecated, Removed, Fixed, Security
  category TEXT NOT NULL CHECK (category IN ('added', 'changed', 'deprecated', 'removed', 'fixed', 'security')),
  
  -- Scope/module affected
  scope TEXT NOT NULL,
  
  -- Human-readable title and description
  title TEXT NOT NULL,
  description TEXT,
  
  -- Technical details (JSON for flexibility)
  technical_details JSONB DEFAULT '{}',
  
  -- Mermaid diagram code for architecture changes
  diagram_code TEXT,
  
  -- Files affected
  files_changed TEXT[] DEFAULT '{}',
  
  -- Performance impact if relevant
  performance_impact JSONB,
  
  -- Breaking change flag
  is_breaking_change BOOLEAN DEFAULT FALSE,
  
  -- Author and source
  author TEXT DEFAULT 'techno.dog AI',
  source TEXT DEFAULT 'lovable', -- 'lovable', 'manual', 'agent', 'migration'
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  released_at TIMESTAMP WITH TIME ZONE,
  
  -- Search vector for full-text search
  search_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(scope, '')), 'C')
  ) STORED
);

-- Indexes for performance
CREATE INDEX idx_changelog_version ON public.changelog_entries(version);
CREATE INDEX idx_changelog_category ON public.changelog_entries(category);
CREATE INDEX idx_changelog_scope ON public.changelog_entries(scope);
CREATE INDEX idx_changelog_created ON public.changelog_entries(created_at DESC);
CREATE INDEX idx_changelog_search ON public.changelog_entries USING GIN(search_vector);

-- Enable Row Level Security
ALTER TABLE public.changelog_entries ENABLE ROW LEVEL SECURITY;

-- Public read access (changelog should be visible)
CREATE POLICY "Changelog entries are publicly readable"
ON public.changelog_entries
FOR SELECT
USING (true);

-- Admin-only write access
CREATE POLICY "Only admins can insert changelog entries"
ON public.changelog_entries
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can update changelog entries"
ON public.changelog_entries
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Function to auto-log changelog from edge functions/agents
CREATE OR REPLACE FUNCTION public.log_changelog_entry(
  p_version TEXT,
  p_category TEXT,
  p_scope TEXT,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_technical_details JSONB DEFAULT '{}',
  p_diagram_code TEXT DEFAULT NULL,
  p_files_changed TEXT[] DEFAULT '{}',
  p_is_breaking BOOLEAN DEFAULT FALSE,
  p_author TEXT DEFAULT 'techno.dog AI',
  p_source TEXT DEFAULT 'lovable'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO changelog_entries (
    version, category, scope, title, description, 
    technical_details, diagram_code, files_changed,
    is_breaking_change, author, source
  ) VALUES (
    p_version, p_category, p_scope, p_title, p_description,
    p_technical_details, p_diagram_code, p_files_changed,
    p_is_breaking, p_author, p_source
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

-- Grant execute to authenticated users (for edge functions)
GRANT EXECUTE ON FUNCTION public.log_changelog_entry TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_changelog_entry TO service_role;