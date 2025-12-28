-- Create agent_reports table to store all agent findings and proposals
CREATE TABLE public.agent_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_name TEXT NOT NULL,
  agent_category TEXT NOT NULL,
  report_type TEXT NOT NULL DEFAULT 'finding',
  severity TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  description TEXT,
  details JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_reports ENABLE ROW LEVEL SECURITY;

-- Admins can view all reports
CREATE POLICY "Admins can view agent reports"
ON public.agent_reports
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Admins can update report status
CREATE POLICY "Admins can update agent reports"
ON public.agent_reports
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Service role can insert (for edge functions)
CREATE POLICY "Service can insert agent reports"
ON public.agent_reports
FOR INSERT
WITH CHECK (true);

-- Create index for quick lookups
CREATE INDEX idx_agent_reports_agent ON public.agent_reports(agent_name);
CREATE INDEX idx_agent_reports_status ON public.agent_reports(status);
CREATE INDEX idx_agent_reports_created ON public.agent_reports(created_at DESC);

-- Add comment
COMMENT ON TABLE public.agent_reports IS 'Stores findings and proposals from automated site agents';