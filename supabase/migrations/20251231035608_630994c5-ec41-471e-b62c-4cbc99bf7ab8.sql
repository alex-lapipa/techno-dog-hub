-- Enable realtime for doggy_share_leaderboard
ALTER TABLE public.doggy_share_leaderboard REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.doggy_share_leaderboard;