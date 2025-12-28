import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Level {
  level_number: number;
  name: string;
  min_points: number;
  icon: string;
  color: string;
  perks: string[];
}

interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  points_value: number;
}

interface UserBadge extends Badge {
  awarded_at: string;
}

interface GamificationData {
  totalPoints: number;
  currentLevelNumber: number;
  currentLevel: Level | null;
  nextLevel: Level | null;
  levels: Level[];
  badges: UserBadge[];
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useGamification(profileId: string | null): GamificationData {
  const [levels, setLevels] = useState<Level[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [profileData, setProfileData] = useState<{
    totalPoints: number;
    currentLevelNumber: number;
  }>({ totalPoints: 0, currentLevelNumber: 1 });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!profileId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const [levelsRes, badgesRes, profileRes] = await Promise.all([
      supabase
        .from("contributor_levels")
        .select("*")
        .order("level_number"),
      supabase
        .from("user_badges")
        .select("badge_id, awarded_at, badges(*)")
        .eq("profile_id", profileId),
      supabase
        .from("community_profiles")
        .select("total_points, current_level")
        .eq("id", profileId)
        .single(),
    ]);

    if (levelsRes.data) {
      setLevels(levelsRes.data);
    }

    if (badgesRes.data) {
      const mapped = badgesRes.data
        .filter((ub) => ub.badges)
        .map((ub) => ({
          ...(ub.badges as unknown as Badge),
          awarded_at: ub.awarded_at,
        }));
      setBadges(mapped);
    }

    if (profileRes.data) {
      setProfileData({
        totalPoints: profileRes.data.total_points ?? 0,
        currentLevelNumber: profileRes.data.current_level ?? 1,
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [profileId]);

  const currentLevel = levels.find(
    (l) => l.level_number === profileData.currentLevelNumber
  ) || null;
  
  const nextLevel = levels.find(
    (l) => l.level_number === profileData.currentLevelNumber + 1
  ) || null;

  return {
    totalPoints: profileData.totalPoints,
    currentLevelNumber: profileData.currentLevelNumber,
    currentLevel,
    nextLevel,
    levels,
    badges,
    loading,
    refresh: loadData,
  };
}
