-- ============================================
-- GAMIFICATION SYSTEM TABLES
-- ============================================

-- Contributor levels definition
CREATE TABLE public.contributor_levels (
  id SERIAL PRIMARY KEY,
  level_number INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  min_points INTEGER NOT NULL,
  icon TEXT NOT NULL DEFAULT '🌱',
  color TEXT NOT NULL DEFAULT '#6B7280',
  perks TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Badge definitions
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'contribution',
  rarity TEXT NOT NULL DEFAULT 'common',
  points_value INTEGER NOT NULL DEFAULT 0,
  unlock_criteria JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User badges (many-to-many)
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.community_profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  awarded_reason TEXT,
  UNIQUE(profile_id, badge_id)
);

-- Point transactions log
CREATE TABLE public.point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.community_profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  description TEXT,
  reference_id UUID,
  reference_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add total_points and current_level to community_profiles
ALTER TABLE public.community_profiles
ADD COLUMN IF NOT EXISTS total_points INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_level INTEGER NOT NULL DEFAULT 1;

-- Enable RLS
ALTER TABLE public.contributor_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Levels and badges are public read
CREATE POLICY "Levels are public" ON public.contributor_levels FOR SELECT USING (true);
CREATE POLICY "Badges are public" ON public.badges FOR SELECT USING (true);

-- Users can view their own badges and all users' badges
CREATE POLICY "User badges are public" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "Service can award badges" ON public.user_badges FOR INSERT WITH CHECK (true);

-- Point transactions: users see their own
CREATE POLICY "Users see own points" ON public.point_transactions 
FOR SELECT USING (
  profile_id IN (SELECT id FROM public.community_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Service can add points" ON public.point_transactions FOR INSERT WITH CHECK (true);

-- Admin policies
CREATE POLICY "Admins manage levels" ON public.contributor_levels 
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage badges" ON public.badges 
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- SEED DEFAULT LEVELS
-- ============================================
INSERT INTO public.contributor_levels (level_number, name, min_points, icon, color, perks) VALUES
(1, 'Newcomer', 0, '🌱', '#6B7280', ARRAY['Can submit content', 'Basic profile']),
(2, 'Explorer', 50, '🎧', '#3B82F6', ARRAY['Custom display name', 'Profile badge display']),
(3, 'Contributor', 150, '💿', '#8B5CF6', ARRAY['Priority review queue', 'Extended file uploads']),
(4, 'Curator', 400, '🎛️', '#F59E0B', ARRAY['Suggest corrections', 'Feature in leaderboard']),
(5, 'Archivist', 800, '📚', '#10B981', ARRAY['Early access features', 'Curator badge']),
(6, 'Keeper', 1500, '🗝️', '#EC4899', ARRAY['Invite-only events', 'Special mentions']),
(7, 'Elder', 3000, '👑', '#EF4444', ARRAY['Founding member status', 'Direct contact']);

-- ============================================
-- SEED DEFAULT BADGES
-- ============================================
INSERT INTO public.badges (slug, name, description, icon, category, rarity, points_value, unlock_criteria) VALUES
-- Contribution badges
('first-upload', 'First Upload', 'Uploaded your first photo', '📸', 'contribution', 'common', 10, '{"action": "photo_upload", "count": 1}'),
('prolific-photographer', 'Prolific Photographer', 'Uploaded 10 photos', '🖼️', 'contribution', 'rare', 50, '{"action": "photo_upload", "count": 10}'),
('photo-master', 'Photo Master', 'Uploaded 50 photos', '📷', 'contribution', 'epic', 200, '{"action": "photo_upload", "count": 50}'),
('first-correction', 'Fact Checker', 'Submitted your first correction', '✏️', 'contribution', 'common', 10, '{"action": "correction", "count": 1}'),
('data-guardian', 'Data Guardian', 'Had 10 corrections approved', '🛡️', 'contribution', 'rare', 75, '{"action": "correction_approved", "count": 10}'),
('knowledge-keeper', 'Knowledge Keeper', 'Had 50 corrections approved', '📖', 'contribution', 'legendary', 300, '{"action": "correction_approved", "count": 50}'),

-- Engagement badges
('early-bird', 'Early Bird', 'Joined in the first 1000 members', '🐦', 'engagement', 'epic', 100, '{"special": "early_adopter"}'),
('night-owl', 'Night Owl', 'Active between 00:00-04:00', '🦉', 'engagement', 'common', 15, '{"special": "night_activity"}'),
('streak-7', 'Week Warrior', '7-day activity streak', '🔥', 'engagement', 'rare', 40, '{"action": "streak", "count": 7}'),
('streak-30', 'Monthly Maven', '30-day activity streak', '💪', 'engagement', 'epic', 150, '{"action": "streak", "count": 30}'),

-- Expertise badges
('genre-expert', 'Genre Expert', 'Contributed to 5+ subgenres', '🎵', 'expertise', 'rare', 60, '{"action": "unique_genres", "count": 5}'),
('globe-trotter', 'Globe Trotter', 'Contributions span 10+ countries', '🌍', 'expertise', 'epic', 100, '{"action": "unique_countries", "count": 10}'),
('venue-hunter', 'Venue Hunter', 'Documented 20+ venues', '🏛️', 'expertise', 'rare', 75, '{"action": "venue_contribution", "count": 20}'),
('festival-fanatic', 'Festival Fanatic', 'Documented 10+ festivals', '🎪', 'expertise', 'rare', 75, '{"action": "festival_contribution", "count": 10}'),

-- Special badges
('founding-member', 'Founding Member', 'One of the original techno.dog pack', '🐕', 'special', 'legendary', 500, '{"special": "founding"}'),
('api-pioneer', 'API Pioneer', 'Generated an API key', '🔑', 'special', 'common', 25, '{"action": "api_key_created", "count": 1}'),
('verified', 'Verified', 'Email verified community member', '✅', 'special', 'common', 10, '{"action": "email_verified", "count": 1}');

-- ============================================
-- POINT AWARD FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.award_points(
  p_profile_id UUID,
  p_points INTEGER,
  p_action_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL
) RETURNS TABLE(new_total INTEGER, new_level INTEGER, level_up BOOLEAN) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_new_total INTEGER;
BEGIN
  -- Get current level
  SELECT current_level INTO v_old_level FROM community_profiles WHERE id = p_profile_id;
  
  -- Insert transaction
  INSERT INTO point_transactions (profile_id, points, action_type, description, reference_id, reference_type)
  VALUES (p_profile_id, p_points, p_action_type, p_description, p_reference_id, p_reference_type);
  
  -- Update total points
  UPDATE community_profiles 
  SET total_points = total_points + p_points,
      trust_score = trust_score + GREATEST(p_points / 10, 1)
  WHERE id = p_profile_id
  RETURNING total_points INTO v_new_total;
  
  -- Calculate new level
  SELECT COALESCE(MAX(level_number), 1) INTO v_new_level
  FROM contributor_levels
  WHERE min_points <= v_new_total;
  
  -- Update level if changed
  IF v_new_level > v_old_level THEN
    UPDATE community_profiles SET current_level = v_new_level WHERE id = p_profile_id;
  END IF;
  
  RETURN QUERY SELECT v_new_total, v_new_level, (v_new_level > v_old_level);
END;
$$;

-- ============================================
-- BADGE AWARD FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.award_badge(
  p_profile_id UUID,
  p_badge_slug TEXT,
  p_reason TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_badge_id UUID;
  v_points INTEGER;
BEGIN
  -- Get badge
  SELECT id, points_value INTO v_badge_id, v_points
  FROM badges WHERE slug = p_badge_slug AND is_active = true;
  
  IF v_badge_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if already has badge
  IF EXISTS (SELECT 1 FROM user_badges WHERE profile_id = p_profile_id AND badge_id = v_badge_id) THEN
    RETURN FALSE;
  END IF;
  
  -- Award badge
  INSERT INTO user_badges (profile_id, badge_id, awarded_reason)
  VALUES (p_profile_id, v_badge_id, p_reason);
  
  -- Award points for badge
  IF v_points > 0 THEN
    PERFORM award_points(p_profile_id, v_points, 'badge_earned', 'Earned badge: ' || p_badge_slug);
  END IF;
  
  RETURN TRUE;
END;
$$;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_point_transactions_profile ON public.point_transactions(profile_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created ON public.point_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_badges_profile ON public.user_badges(profile_id);
CREATE INDEX IF NOT EXISTS idx_community_profiles_points ON public.community_profiles(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_community_profiles_level ON public.community_profiles(current_level DESC);