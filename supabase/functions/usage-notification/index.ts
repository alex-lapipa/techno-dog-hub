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

  // EMAIL SENDING DISABLED - Requires explicit authorization
  console.log("[usage-notification] Email sending is currently disabled");
  return new Response(
    JSON.stringify({ success: false, message: "Email sending disabled - requires authorization" }),
    { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
});
