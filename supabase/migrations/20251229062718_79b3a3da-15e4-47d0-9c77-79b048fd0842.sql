-- Create agent_status table for real-time agent state synchronization
CREATE TABLE public.agent_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_name TEXT NOT NULL UNIQUE,
  function_name TEXT NOT NULL,
  category TEXT DEFAULT 'Operations',
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'running', 'success', 'error', 'disabled')),
  last_run_at TIMESTAMP WITH TIME ZONE,
  last_success_at TIMESTAMP WITH TIME ZONE,
  last_error_at TIMESTAMP WITH TIME ZONE,
  last_error_message TEXT,
  run_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  avg_duration_ms INTEGER,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_status ENABLE ROW LEVEL SECURITY;

-- Create policy for read access (public read for dashboard)
CREATE POLICY "Anyone can view agent status"
  ON public.agent_status
  FOR SELECT
  USING (true);

-- Create policy for update (authenticated users only)
CREATE POLICY "Authenticated users can update agent status"
  ON public.agent_status
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Create policy for insert (service role or authenticated)
CREATE POLICY "Service role can insert agent status"
  ON public.agent_status
  FOR INSERT
  WITH CHECK (true);

-- Add updated_at trigger
CREATE TRIGGER update_agent_status_updated_at
  BEFORE UPDATE ON public.agent_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for agent_status
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_status;

-- Insert initial agent records
INSERT INTO public.agent_status (agent_name, function_name, category) VALUES
  ('API Guardian', 'api-guardian', 'Operations'),
  ('Health Monitor', 'health-monitor', 'Operations'),
  ('Security Auditor', 'security-auditor', 'Security'),
  ('Data Integrity', 'data-integrity', 'Operations'),
  ('Media Monitor', 'media-monitor', 'Content'),
  ('Submissions Triage', 'submissions-triage', 'Content'),
  ('Analytics Reporter', 'analytics-reporter', 'Growth'),
  ('Knowledge Gap', 'knowledge-gap-detector', 'Growth'),
  ('Gear Expert', 'gear-expert-agent', 'Content')
ON CONFLICT (agent_name) DO NOTHING;