import { supabase } from "@/integrations/supabase/client";

// Point values for different actions
const POINT_VALUES: Record<string, number> = {
  photo_upload: 15,
  correction: 10,
  artist_photo: 20,
  festival_photo: 20,
  venue_photo: 15,
  gear_photo: 10,
  new_entity: 25,
  link: 5,
};

// Badge thresholds for automatic checking
const BADGE_THRESHOLDS: Record<string, { slug: string; count: number }[]> = {
  photo_upload: [
    { slug: "first-upload", count: 1 },
    { slug: "prolific-photographer", count: 10 },
    { slug: "photo-master", count: 50 },
  ],
  correction: [
    { slug: "first-correction", count: 1 },
  ],
  correction_approved: [
    { slug: "data-guardian", count: 10 },
    { slug: "knowledge-keeper", count: 50 },
  ],
};

interface AwardResult {
  pointsAwarded: number;
  newTotal: number;
  newLevel: number;
  levelUp: boolean;
  badgesAwarded: string[];
}

/**
 * Awards points for a submission and checks for badge unlocks
 */
export async function awardPointsForSubmission(
  email: string,
  submissionType: string | null,
  submissionId: string
): Promise<AwardResult | null> {
  try {
    // Get profile by email
    const { data: profile, error: profileError } = await supabase
      .from("community_profiles")
      .select("id, total_points, current_level")
      .eq("email", email)
      .single();

    if (profileError || !profile) {
      console.error("Profile not found for gamification:", email);
      return null;
    }

    // Determine points based on submission type
    const actionType = submissionType || "correction";
    const points = POINT_VALUES[actionType] || POINT_VALUES.correction;

    // Award points using RPC
    const { data: pointResult, error: pointError } = await supabase.rpc("award_points", {
      p_profile_id: profile.id,
      p_points: points,
      p_action_type: actionType,
      p_description: `Approved submission: ${actionType.replace(/_/g, " ")}`,
      p_reference_id: submissionId,
      p_reference_type: "submission",
    });

    if (pointError) {
      console.error("Failed to award points:", pointError);
      return null;
    }

    const result: AwardResult = {
      pointsAwarded: points,
      newTotal: pointResult?.[0]?.new_total || profile.total_points + points,
      newLevel: pointResult?.[0]?.new_level || profile.current_level,
      levelUp: pointResult?.[0]?.level_up || false,
      badgesAwarded: [],
    };

    // Check for badge unlocks
    const badgesToCheck = getBadgesToCheck(actionType);
    
    for (const badge of badgesToCheck) {
      const count = await getActionCount(profile.id, email, actionType);
      if (count >= badge.count) {
        const awarded = await tryAwardBadge(profile.id, badge.slug);
        if (awarded) {
          result.badgesAwarded.push(badge.slug);
        }
      }
    }

    // Check verified badge on first approval
    const verifiedAwarded = await tryAwardBadge(profile.id, "verified");
    if (verifiedAwarded) {
      result.badgesAwarded.push("verified");
    }

    return result;
  } catch (err) {
    console.error("Gamification error:", err);
    return null;
  }
}

function getBadgesToCheck(actionType: string): { slug: string; count: number }[] {
  const badges: { slug: string; count: number }[] = [];
  
  // Check photo-related badges
  if (actionType.includes("photo")) {
    badges.push(...(BADGE_THRESHOLDS.photo_upload || []));
  }
  
  // Check correction-related badges
  if (actionType === "correction") {
    badges.push(...(BADGE_THRESHOLDS.correction || []));
    badges.push(...(BADGE_THRESHOLDS.correction_approved || []));
  }

  return badges;
}

async function getActionCount(
  profileId: string,
  email: string,
  actionType: string
): Promise<number> {
  // Count approved submissions of this type
  let query = supabase
    .from("community_submissions")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .eq("status", "approved");

  if (actionType.includes("photo")) {
    query = query.ilike("submission_type", "%photo%");
  } else if (actionType === "correction") {
    query = query.eq("submission_type", "correction");
  }

  const { count } = await query;
  return count || 0;
}

async function tryAwardBadge(profileId: string, badgeSlug: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("award_badge", {
    p_profile_id: profileId,
    p_badge_slug: badgeSlug,
  });

  if (error) {
    console.error(`Failed to award badge ${badgeSlug}:`, error);
    return false;
  }

  return data === true;
}

/**
 * Check and award special badges (called periodically or on specific events)
 */
export async function checkSpecialBadges(profileId: string, email: string): Promise<string[]> {
  const awarded: string[] = [];

  try {
    // Check API Pioneer badge
    const { count: apiKeyCount } = await supabase
      .from("api_keys")
      .select("id", { count: "exact", head: true })
      .eq("user_id", (await supabase.from("community_profiles").select("user_id").eq("id", profileId).single()).data?.user_id);

    if (apiKeyCount && apiKeyCount > 0) {
      if (await tryAwardBadge(profileId, "api-pioneer")) {
        awarded.push("api-pioneer");
      }
    }

    // Check genre expert (5+ unique genres)
    const { data: submissions } = await supabase
      .from("community_submissions")
      .select("entity_type")
      .eq("email", email)
      .eq("status", "approved");

    const uniqueTypes = new Set(submissions?.map(s => s.entity_type).filter(Boolean));
    if (uniqueTypes.size >= 5) {
      if (await tryAwardBadge(profileId, "genre-expert")) {
        awarded.push("genre-expert");
      }
    }

  } catch (err) {
    console.error("Special badge check error:", err);
  }

  return awarded;
}
