import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Processing referral notifications...");

    // Find verified referrals that haven't been notified
    const { data: pendingNotifications, error: fetchError } = await supabase
      .from("referrals")
      .select(`
        id,
        referrer_id,
        referred_email,
        verified_at
      `)
      .eq("status", "completed")
      .eq("xp_awarded", true)
      .is("email_notification_sent_at", null)
      .limit(50);

    if (fetchError) {
      console.error("Error fetching pending notifications:", fetchError);
      throw fetchError;
    }

    if (!pendingNotifications || pendingNotifications.length === 0) {
      console.log("No pending referral notifications");
      return new Response(
        JSON.stringify({ success: true, processed: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${pendingNotifications.length} pending notifications`);

    let processed = 0;
    let errors = 0;

    for (const referral of pendingNotifications) {
      try {
        // Get referrer's email and display name
        const { data: referrerProfile, error: profileError } = await supabase
          .from("community_profiles")
          .select("email, display_name")
          .eq("id", referral.referrer_id)
          .single();

        if (profileError || !referrerProfile?.email) {
          console.error(`Could not find referrer profile for ${referral.referrer_id}:`, profileError);
          errors++;
          continue;
        }

        // Send the notification email
        const emailResponse = await supabase.functions.invoke("send-community-email", {
          body: {
            type: "referral_verified",
            to: referrerProfile.email,
            data: {
              referrerName: referrerProfile.display_name || "Contributor",
              referredEmail: referral.referred_email,
            },
          },
        });

        if (emailResponse.error) {
          console.error(`Failed to send email for referral ${referral.id}:`, emailResponse.error);
          errors++;
          continue;
        }

        // Mark as notified
        const { error: updateError } = await supabase
          .from("referrals")
          .update({ email_notification_sent_at: new Date().toISOString() })
          .eq("id", referral.id);

        if (updateError) {
          console.error(`Failed to update referral ${referral.id}:`, updateError);
          errors++;
          continue;
        }

        console.log(`Sent notification for referral ${referral.id} to ${referrerProfile.email}`);
        processed++;
      } catch (err) {
        console.error(`Error processing referral ${referral.id}:`, err);
        errors++;
      }
    }

    console.log(`Processed ${processed} notifications, ${errors} errors`);

    return new Response(
      JSON.stringify({ success: true, processed, errors }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in referral-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
