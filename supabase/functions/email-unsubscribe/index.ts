import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const profileId = url.searchParams.get("id");
    const token = url.searchParams.get("token");

    if (!profileId) {
      return new Response(generateErrorPage("Missing profile ID"), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "text/html" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the token matches (simple hash of profile ID + secret)
    const expectedToken = await generateToken(profileId);
    if (token !== expectedToken) {
      console.error("Invalid unsubscribe token for profile:", profileId);
      return new Response(generateErrorPage("Invalid unsubscribe link"), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "text/html" },
      });
    }

    // Update the newsletter opt-in status
    const { error } = await supabase
      .from("community_profiles")
      .update({ 
        newsletter_opt_in: false,
        updated_at: new Date().toISOString()
      })
      .eq("id", profileId);

    if (error) {
      console.error("Error updating profile:", error);
      return new Response(generateErrorPage("Failed to unsubscribe. Please try again."), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "text/html" },
      });
    }

    console.log(`Successfully unsubscribed profile: ${profileId}`);

    return new Response(generateSuccessPage(), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/html" },
    });
  } catch (error: any) {
    console.error("Error in email-unsubscribe function:", error);
    return new Response(generateErrorPage("An error occurred"), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/html" },
    });
  }
};

async function generateToken(profileId: string): Promise<string> {
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "default-secret";
  const data = new TextEncoder().encode(profileId + secret);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.slice(0, 8).map(b => b.toString(16).padStart(2, "0")).join("");
}

function generateSuccessPage(): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unsubscribed - Techno Dog</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .container {
      text-align: center;
      max-width: 400px;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 24px;
    }
    h1 {
      font-size: 24px;
      margin: 0 0 16px;
    }
    p {
      color: #a3a3a3;
      line-height: 1.6;
      margin: 0 0 24px;
    }
    .button {
      display: inline-block;
      background: #8b5cf6;
      color: #fff;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 500;
    }
    .button:hover {
      background: #7c3aed;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">✅</div>
    <h1>You've been unsubscribed</h1>
    <p>You will no longer receive weekly digest emails from Techno Dog. You can re-subscribe anytime from your profile settings.</p>
    <a href="https://techno.dog" class="button">Go to Techno Dog</a>
  </div>
</body>
</html>
  `;
}

function generateErrorPage(message: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error - Techno Dog</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .container {
      text-align: center;
      max-width: 400px;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 24px;
    }
    h1 {
      font-size: 24px;
      margin: 0 0 16px;
    }
    p {
      color: #a3a3a3;
      line-height: 1.6;
      margin: 0 0 24px;
    }
    .button {
      display: inline-block;
      background: #8b5cf6;
      color: #fff;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">❌</div>
    <h1>Something went wrong</h1>
    <p>${message}</p>
    <a href="https://techno.dog" class="button">Go to Techno Dog</a>
  </div>
</body>
</html>
  `;
}

// Export for use in weekly-digest
export { generateToken };

serve(handler);
