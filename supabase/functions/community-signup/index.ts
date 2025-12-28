import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SignupRequest {
  email: string;
  source?: "upload_widget" | "newsletter" | "api_signup" | "community_page" | "other";
  newsletter_opt_in?: boolean;
  display_name?: string;
  redirect_path?: string; // Allow custom redirect path after verification
  referral_code?: string; // Referral code from inviter
}

// Simple in-memory rate limiting (per function instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5; // Max 5 requests per window
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute window

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const key = email.toLowerCase().trim();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, source = "community_page", newsletter_opt_in = false, display_name, redirect_path, referral_code }: SignupRequest = await req.json();

    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Rate limiting check
    if (!checkRateLimit(normalizedEmail)) {
      console.warn(`[community-signup] Rate limit exceeded for: ${normalizedEmail}`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait a minute and try again." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`[community-signup] Processing signup for: ${normalizedEmail}, source: ${source}`);

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from("community_profiles")
      .select("id, status, email_verified_at")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingProfile) {
      if (existingProfile.status === "verified") {
        // Already verified, just update newsletter preference if changed
        if (newsletter_opt_in) {
          await supabase
            .from("community_profiles")
            .update({ 
              newsletter_opt_in: true, 
              newsletter_opt_in_at: new Date().toISOString() 
            })
            .eq("id", existingProfile.id);
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Already verified. Check your email for magic link to sign in.",
            status: "verified"
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      
      // Pending profile exists, resend verification
      console.log(`[community-signup] Resending verification for pending profile: ${existingProfile.id}`);
    } else {
      // Create new pending profile
      const { error: insertError } = await supabase
        .from("community_profiles")
        .insert({
          email: normalizedEmail,
          source,
          newsletter_opt_in,
          newsletter_opt_in_at: newsletter_opt_in ? new Date().toISOString() : null,
          display_name,
          status: "pending",
        });

      if (insertError) {
        console.error("[community-signup] Insert error:", insertError);
        throw insertError;
      }

      console.log(`[community-signup] Created pending profile for: ${normalizedEmail}`);

      // Handle referral tracking if referral_code provided
      if (referral_code) {
        // Find the referrer's profile by referral code
        const { data: referrerProfile } = await supabase
          .from("community_profiles")
          .select("id")
          .eq("referral_code", referral_code.toUpperCase())
          .single();

        if (referrerProfile) {
          // Create referral record
          const { error: refError } = await supabase
            .from("referrals")
            .insert({
              referrer_id: referrerProfile.id,
              referred_email: normalizedEmail,
              referral_code_used: referral_code.toUpperCase(),
              status: "pending",
            });

          if (refError) {
            console.error("[community-signup] Referral tracking error:", refError);
            // Don't fail the signup if referral tracking fails
          } else {
            console.log(`[community-signup] Referral tracked: ${referral_code} -> ${normalizedEmail}`);
          }
        }
      }
    }

    // Log email event
    await supabase.from("email_events").insert({
      email: normalizedEmail,
      event_type: "verification_requested",
      metadata: { source },
    });

    // Send magic link via Supabase Auth
    const siteUrl = Deno.env.get("SITE_URL") || "https://techno.dog";
    // Use custom redirect path if provided, otherwise default to community page
    const redirectTo = redirect_path 
      ? `${siteUrl}${redirect_path}?verified=true`
      : `${siteUrl}/community?verified=true`;
    
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: true,
      },
    });

    if (authError) {
      console.error("[community-signup] Auth error:", authError);
      throw authError;
    }

    // Log verification sent
    await supabase.from("email_events").insert({
      email: normalizedEmail,
      event_type: "verification_sent",
      metadata: { source },
    });

    console.log(`[community-signup] Magic link sent to: ${normalizedEmail}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Check your email for the magic link to verify your account.",
        status: "pending"
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[community-signup] Error:", errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);