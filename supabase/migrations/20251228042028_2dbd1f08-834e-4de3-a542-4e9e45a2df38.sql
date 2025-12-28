-- Add streak columns to community_profiles
ALTER TABLE public.community_profiles 
ADD COLUMN IF NOT EXISTS current_streak integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date date;

-- Create function to update streak on activity
CREATE OR REPLACE FUNCTION public.update_activity_streak(p_profile_id uuid)
RETURNS TABLE(current_streak integer, longest_streak integer, streak_increased boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_activity date;
  v_current_streak integer;
  v_longest_streak integer;
  v_today date := CURRENT_DATE;
  v_streak_increased boolean := false;
BEGIN
  -- Get current values
  SELECT cp.last_activity_date, cp.current_streak, cp.longest_streak
  INTO v_last_activity, v_current_streak, v_longest_streak
  FROM community_profiles cp
  WHERE cp.id = p_profile_id;

  -- Calculate new streak
  IF v_last_activity IS NULL THEN
    -- First activity ever
    v_current_streak := 1;
    v_streak_increased := true;
  ELSIF v_last_activity = v_today THEN
    -- Already active today, no change
    v_streak_increased := false;
  ELSIF v_last_activity = v_today - 1 THEN
    -- Consecutive day, increment streak
    v_current_streak := v_current_streak + 1;
    v_streak_increased := true;
  ELSE
    -- Streak broken, reset to 1
    v_current_streak := 1;
    v_streak_increased := true;
  END IF;

  -- Update longest streak if needed
  IF v_current_streak > v_longest_streak THEN
    v_longest_streak := v_current_streak;
  END IF;

  -- Update profile
  UPDATE community_profiles
  SET 
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    last_activity_date = v_today
  WHERE id = p_profile_id;

  RETURN QUERY SELECT v_current_streak, v_longest_streak, v_streak_increased;
END;
$$;

-- Insert streak-related badges
INSERT INTO public.badges (slug, name, description, icon, category, rarity, points_value, unlock_criteria) VALUES
('first-streak', 'First Flame', 'Started your first activity streak', '🔥', 'streak', 'common', 5, '{"streak": 1}'),
('week-streak', 'Week Warrior', 'Maintained a 7-day activity streak', '⚡', 'streak', 'rare', 25, '{"streak": 7}'),
('month-streak', 'Monthly Master', 'Maintained a 30-day activity streak', '🌟', 'streak', 'epic', 100, '{"streak": 30}'),
('century-streak', 'Century Club', 'Achieved a 100-day activity streak', '💎', 'streak', 'legendary', 500, '{"streak": 100}')
ON CONFLICT (slug) DO NOTHING;