import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UserDigestData {
  id: string;
  email: string;
  display_name: string | null;
  total_points: number;
  current_streak: number;
  longest_streak: number;
  current_level: number;
  last_activity_date: string | null;
}

interface PointTransaction {
  points: number;
  action_type: string;
  description: string | null;
  created_at: string;
}

interface XPEvent {
  name: string;
  description: string | null;
  multiplier: number;
  start_at: string;
  end_at: string;
  icon: string | null;
}

interface LeaderboardEntry {
  id: string;
  display_name: string | null;
  total_points: number;
}

async function generateUnsubscribeToken(profileId: string): Promise<string> {
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!secret) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for token generation");
  }
  const data = new TextEncoder().encode(profileId + secret);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.slice(0, 8).map(b => b.toString(16).padStart(2, "0")).join("");
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting weekly digest email job...");

    // Get all verified users who opted in to newsletters
    const { data: users, error: usersError } = await supabase
      .from("community_profiles")
      .select("id, email, display_name, total_points, current_streak, longest_streak, current_level, last_activity_date")
      .eq("status", "verified")
      .eq("newsletter_opt_in", true);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      throw usersError;
    }

    if (!users || users.length === 0) {
      console.log("No users to send digest to");
      return new Response(JSON.stringify({ message: "No users to process" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing ${users.length} users for weekly digest`);

    // Get leaderboard for position calculation
    const { data: leaderboard } = await supabase
      .from("community_profiles")
      .select("id, display_name, total_points")
      .eq("status", "verified")
      .order("total_points", { ascending: false })
      .limit(100);

    // Get upcoming XP events (next 7 days)
    const now = new Date().toISOString();
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: upcomingEvents } = await supabase
      .from("xp_multiplier_events")
      .select("name, description, multiplier, start_at, end_at, icon")
      .eq("is_active", true)
      .gte("start_at", now)
      .lte("start_at", nextWeek)
      .order("start_at");

    // Get contributor levels for level names
    const { data: levels } = await supabase
      .from("contributor_levels")
      .select("level_number, name, icon, color");

    const levelsMap = new Map(levels?.map(l => [l.level_number, l]) || []);

    let emailsSent = 0;
    let emailsFailed = 0;

    for (const user of users as UserDigestData[]) {
      try {
        // Get user's activity from the past week
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        
        const { data: weeklyActivity } = await supabase
          .from("point_transactions")
          .select("points, action_type, description, created_at")
          .eq("profile_id", user.id)
          .gte("created_at", weekAgo)
          .order("created_at", { ascending: false });

        const weeklyPoints = weeklyActivity?.reduce((sum, t) => sum + t.points, 0) || 0;
        const activityCount = weeklyActivity?.length || 0;

        // Calculate leaderboard position
        const leaderboardPosition = (leaderboard as LeaderboardEntry[])?.findIndex(l => l.id === user.id) + 1 || 0;
        
        // Get level info
        const levelInfo = levelsMap.get(user.current_level);

        // Generate unsubscribe URL with token
        const unsubscribeToken = await generateUnsubscribeToken(user.id);
        const unsubscribeUrl = `${supabaseUrl}/functions/v1/email-unsubscribe?id=${user.id}&token=${unsubscribeToken}`;

        // Generate email HTML
        const emailHtml = generateDigestEmail({
          user,
          weeklyPoints,
          activityCount,
          weeklyActivity: weeklyActivity as PointTransaction[] || [],
          leaderboardPosition,
          totalUsers: leaderboard?.length || 0,
          upcomingEvents: upcomingEvents as XPEvent[] || [],
          levelInfo,
          unsubscribeUrl,
        });

        const { error: emailError } = await resend.emails.send({
          from: "Techno Dog <digest@resend.dev>",
          to: [user.email],
          subject: `Your Weekly Techno Dog Digest | ${weeklyPoints} XP earned`,
          html: emailHtml,
        });

        if (emailError) {
          console.error(`Failed to send email to ${user.email}:`, emailError);
          emailsFailed++;
        } else {
          console.log(`Digest sent to ${user.email}`);
          emailsSent++;
        }
      } catch (userError) {
        console.error(`Error processing user ${user.id}:`, userError);
        emailsFailed++;
      }
    }

    console.log(`Weekly digest complete: ${emailsSent} sent, ${emailsFailed} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent, 
        emailsFailed,
        totalUsers: users.length 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in weekly-digest function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

interface DigestEmailParams {
  user: UserDigestData;
  weeklyPoints: number;
  activityCount: number;
  weeklyActivity: PointTransaction[];
  leaderboardPosition: number;
  totalUsers: number;
  upcomingEvents: XPEvent[];
  levelInfo: { name: string; icon: string; color: string } | undefined;
  unsubscribeUrl: string;
}

function generateDigestEmail(params: DigestEmailParams): string {
  const {
    user,
    weeklyPoints,
    activityCount,
    weeklyActivity,
    leaderboardPosition,
    totalUsers,
    upcomingEvents,
    levelInfo,
    unsubscribeUrl,
  } = params;

  const displayName = user.display_name || "Techno Enthusiast";
  const streakLevel = user.current_streak >= 7 ? "HOT" : user.current_streak >= 3 ? "ACTIVE" : "NEW";
  const positionLevel = leaderboardPosition <= 3 ? "TOP 3" : leaderboardPosition <= 10 ? "TOP 10" : `#${leaderboardPosition}`;
  const recentActivityHtml = weeklyActivity.slice(0, 5).map(a => `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #333;">
        <span style="color: #10b981;">+${a.points} XP</span> - ${a.description || a.action_type}
      </td>
    </tr>
  `).join("");

  // Format upcoming events
  const eventsHtml = upcomingEvents.length > 0 
    ? upcomingEvents.map(e => `
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 8px; padding: 16px; margin-bottom: 12px; border-left: 4px solid #8b5cf6;">
        <div style="font-weight: bold; color: #fff; margin-bottom: 4px;">${e.name}</div>
        <div style="color: #a3a3a3; font-size: 14px;">${e.multiplier}x XP Multiplier</div>
        <div style="color: #737373; font-size: 12px; margin-top: 4px;">
          ${new Date(e.start_at).toLocaleDateString()} - ${new Date(e.end_at).toLocaleDateString()}
        </div>
      </div>
    `).join("")
    : `<p style="color: #737373;">No upcoming events scheduled. Check back soon!</p>`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          
          <!-- Header -->
          <tr>
            <td style="text-align: center; padding-bottom: 32px;">
              <h1 style="color: #fff; font-size: 28px; margin: 0;">Techno Dog</h1>
              <p style="color: #737373; margin: 8px 0 0 0;">Weekly Digest</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #0f0f23 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <h2 style="color: #fff; margin: 0 0 8px 0;">Hey ${displayName}</h2>
              <p style="color: #a3a3a3; margin: 0;">Here's your weekly community roundup.</p>
            </td>
          </tr>

          <!-- Stats Grid -->
          <tr>
            <td style="padding: 24px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Weekly XP -->
                  <td width="48%" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 20px; text-align: center;">
                    <div style="font-size: 32px; font-weight: bold; color: #fff;">${weeklyPoints}</div>
                    <div style="color: rgba(255,255,255,0.8); font-size: 14px;">XP This Week</div>
                  </td>
                  <td width="4%"></td>
                  <!-- Streak -->
                  <td width="48%" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 12px; padding: 20px; text-align: center;">
                    <div style="font-size: 32px; font-weight: bold; color: #fff;">${user.current_streak} ${streakLevel}</div>
                    <div style="color: rgba(255,255,255,0.8); font-size: 14px;">Day Streak</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Level & Leaderboard -->
          <tr>
            <td style="padding-bottom: 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Level -->
                  <td width="48%" style="background: #1a1a2e; border-radius: 12px; padding: 20px; text-align: center;">
                    <div style="font-size: 18px; color: #a3a3a3;">LEVEL</div>
                    <div style="color: #fff; font-weight: bold; margin-top: 8px;">Level ${user.current_level}</div>
                    <div style="color: #a3a3a3; font-size: 14px;">${levelInfo?.name || "Contributor"}</div>
                  </td>
                  <td width="4%"></td>
                  <!-- Leaderboard Position -->
                  <td width="48%" style="background: #1a1a2e; border-radius: 12px; padding: 20px; text-align: center;">
                    <div style="font-size: 18px; color: #a3a3a3;">${positionLevel}</div>
                    <div style="color: #fff; font-weight: bold; margin-top: 8px;">#${leaderboardPosition || "—"}</div>
                    <div style="color: #a3a3a3; font-size: 14px;">of ${totalUsers} contributors</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Total Points -->
          <tr>
            <td style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <div style="color: rgba(255,255,255,0.8); font-size: 14px; margin-bottom: 4px;">Total XP</div>
              <div style="font-size: 36px; font-weight: bold; color: #fff;">${user.total_points.toLocaleString()}</div>
            </td>
          </tr>

          <!-- Recent Activity -->
          ${activityCount > 0 ? `
          <tr>
            <td style="padding: 24px 0;">
              <h3 style="color: #fff; margin: 0 0 16px 0;">Recent Activity</h3>
              <table width="100%" style="background: #1a1a2e; border-radius: 12px; padding: 16px;">
                ${recentActivityHtml}
              </table>
            </td>
          </tr>
          ` : ""}

          <!-- Upcoming Events -->
          <tr>
            <td style="padding-bottom: 24px;">
              <h3 style="color: #fff; margin: 0 0 16px 0;">Upcoming XP Events</h3>
              ${eventsHtml}
            </td>
          </tr>

          <!-- Streak Warning -->
          ${user.current_streak > 0 && user.last_activity_date ? `
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); border-radius: 12px; padding: 20px; text-align: center;">
              <div style="color: #fff; font-weight: bold;">🔥 Keep your ${user.current_streak}-day streak alive!</div>
              <div style="color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 8px;">
                Don't forget to contribute today to maintain your streak.
              </div>
            </td>
          </tr>
          ` : ""}

          <!-- Footer -->
          <tr>
            <td style="text-align: center; padding-top: 32px; border-top: 1px solid #333; margin-top: 32px;">
              <p style="color: #737373; font-size: 12px; margin: 0;">
                You're receiving this because you opted in to weekly digests.<br>
                <a href="${unsubscribeUrl}" style="color: #8b5cf6;">Unsubscribe</a> | <a href="https://techno.dog/community/profile" style="color: #8b5cf6;">View Profile</a>
              </p>
              <p style="color: #525252; font-size: 12px; margin-top: 16px;">
                © ${new Date().getFullYear()} Techno Dog. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

serve(handler);
