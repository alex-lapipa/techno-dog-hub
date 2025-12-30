-- Doggy share leaderboard - isolated table for the Doggy module
-- Tracks shares by session/user for gamification rewards

CREATE TABLE public.doggy_share_leaderboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  display_name TEXT NOT NULL,
  session_id TEXT,
  user_id UUID,
  share_count INTEGER NOT NULL DEFAULT 0,
  last_share_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for leaderboard queries
CREATE INDEX idx_doggy_share_leaderboard_share_count ON public.doggy_share_leaderboard(share_count DESC);
CREATE INDEX idx_doggy_share_leaderboard_session ON public.doggy_share_leaderboard(session_id);

-- Enable RLS
ALTER TABLE public.doggy_share_leaderboard ENABLE ROW LEVEL SECURITY;

-- Public read for leaderboard display
CREATE POLICY "Anyone can view leaderboard"
  ON public.doggy_share_leaderboard
  FOR SELECT
  USING (true);

-- Anyone can insert (anonymous sharing)
CREATE POLICY "Anyone can join leaderboard"
  ON public.doggy_share_leaderboard
  FOR INSERT
  WITH CHECK (true);

-- Users can update their own entry (by session_id or user_id)
CREATE POLICY "Users can update own entry"
  ON public.doggy_share_leaderboard
  FOR UPDATE
  USING (
    (session_id IS NOT NULL AND session_id = current_setting('request.headers', true)::json->>'x-session-id') OR
    (user_id IS NOT NULL AND user_id = auth.uid())
  );

-- Trigger for updated_at
CREATE TRIGGER update_doggy_share_leaderboard_updated_at
  BEFORE UPDATE ON public.doggy_share_leaderboard
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();