-- Enable realtime for agent_reports table
ALTER TABLE public.agent_reports REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_reports;