import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const USAGE_THRESHOLD = 0.8; // 80%

interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  rate_limit_per_day: number;
  usage_notification_sent_at: string | null;
}

interface Profile {
  email: string | null;
}

Deno.serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("[usage-notification] Starting usage check...");

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all active API keys
    const { data: apiKeys, error: keysError } = await supabase
      .from("api_keys")
      .select("id, user_id, name, rate_limit_per_day, usage_notification_sent_at")
      .eq("status", "active");

    if (keysError) {
      console.error("[usage-notification] Error fetching API keys:", keysError);
      throw keysError;
    }

    console.log(`[usage-notification] Found ${apiKeys?.length || 0} active API keys`);

    const notifications: Array<{ email: string; keyName: string; usage: number; limit: number }> = [];

    for (const key of (apiKeys as ApiKey[]) || []) {
      // Check if notification was already sent today
      if (key.usage_notification_sent_at) {
        const lastSent = new Date(key.usage_notification_sent_at);
        const today = new Date();
        if (
          lastSent.getUTCFullYear() === today.getUTCFullYear() &&
          lastSent.getUTCMonth() === today.getUTCMonth() &&
          lastSent.getUTCDate() === today.getUTCDate()
        ) {
          console.log(`[usage-notification] Already notified for key ${key.id} today, skipping`);
          continue;
        }
      }

      // Get daily usage using the database function
      const { data: dailyUsage, error: usageError } = await supabase.rpc("get_daily_usage", {
        p_api_key_id: key.id,
      });

      if (usageError) {
        console.error(`[usage-notification] Error getting usage for key ${key.id}:`, usageError);
        continue;
      }

      const usage = dailyUsage || 0;
      const usagePercent = usage / key.rate_limit_per_day;

      console.log(
        `[usage-notification] Key ${key.id}: ${usage}/${key.rate_limit_per_day} (${(usagePercent * 100).toFixed(1)}%)`
      );

      // Check if usage is at or above threshold
      if (usagePercent >= USAGE_THRESHOLD) {
        // Get user email from profiles
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("email")
          .eq("user_id", key.user_id)
          .single();

        if (profileError || !profile?.email) {
          console.warn(`[usage-notification] No email found for user ${key.user_id}`);
          continue;
        }

        notifications.push({
          email: profile.email,
          keyName: key.name,
          usage,
          limit: key.rate_limit_per_day,
        });

        // Update notification sent timestamp
        await supabase
          .from("api_keys")
          .update({ usage_notification_sent_at: new Date().toISOString() })
          .eq("id", key.id);
      }
    }

    console.log(`[usage-notification] Sending ${notifications.length} notifications`);

    // Send email notifications
    const emailResults = [];
    for (const notification of notifications) {
      const usagePercent = ((notification.usage / notification.limit) * 100).toFixed(0);

      try {
        const emailResponse = await resend.emails.send({
          from: "ringleader@techno.dog <alex@rmtb.io>",
          reply_to: "alex@rmtb.io",
          to: [notification.email],
          subject: `⚠️ API Usage Alert: ${usagePercent}% of daily limit reached`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #fafafa; padding: 40px 20px; margin: 0;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #171717; border-radius: 12px; padding: 32px; border: 1px solid #262626;">
                <div style="text-align: center; margin-bottom: 32px;">
                  <h1 style="font-size: 24px; font-weight: bold; margin: 0; color: #fafafa;">🐕 TECHNO.DOG</h1>
                  <p style="color: #a1a1aa; margin: 8px 0 0 0;">API Usage Alert</p>
                </div>
                
                <div style="background-color: #1c1917; border: 1px solid #78350f; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                  <p style="margin: 0 0 12px 0; font-size: 16px; color: #fafafa;">
                    Your API key <strong>"${notification.keyName}"</strong> has reached <strong style="color: #f59e0b;">${usagePercent}%</strong> of its daily limit.
                  </p>
                  <div style="background-color: #262626; border-radius: 4px; padding: 12px; font-family: monospace;">
                    <span style="color: #a1a1aa;">Usage:</span> <span style="color: #fafafa;">${notification.usage.toLocaleString()} / ${notification.limit.toLocaleString()} requests</span>
                  </div>
                </div>
                
                <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                  Once you reach 100% of your daily limit, API requests will be rate-limited until the limit resets at midnight UTC.
                </p>
                
                <div style="text-align: center;">
                  <a href="https://techno.dog/developer" style="display: inline-block; background-color: #fafafa; color: #0a0a0a; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                    View Usage Dashboard
                  </a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #262626; margin: 32px 0;">
                
                <p style="color: #71717a; font-size: 12px; text-align: center; margin: 0;">
                  You're receiving this because you have an active API key on TECHNO.DOG.<br>
                  This is an automated notification and does not require a response.
                </p>
              </div>
            </body>
            </html>
          `,
        });

        console.log(`[usage-notification] Email sent to ${notification.email}:`, emailResponse);
        emailResults.push({ email: notification.email, success: true });
      } catch (emailError) {
        console.error(`[usage-notification] Failed to send email to ${notification.email}:`, emailError);
        emailResults.push({ email: notification.email, success: false, error: String(emailError) });
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        checked: apiKeys?.length || 0,
        notifications: notifications.length,
        results: emailResults,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("[usage-notification] Error:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
