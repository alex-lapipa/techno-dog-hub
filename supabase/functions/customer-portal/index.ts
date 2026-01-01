import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[customer-portal] ${step}${detailsStr}`);
};

const DEFAULT_RETURN_URL = "https://techno.dog/support";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe secret key not configured");
    }
    logStep("Stripe key verified");

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    // Parse request body
    let email: string | undefined;
    try {
      const body = await req.json();
      email = body.email;
    } catch {
      // No body provided
    }

    // Try to get email from authenticated user if not provided
    if (!email) {
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        const supabaseClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_ANON_KEY") ?? ""
        );
        
        const token = authHeader.replace("Bearer ", "");
        const { data } = await supabaseClient.auth.getUser(token);
        email = data.user?.email;
        logStep("Got email from authenticated user", { email });
      }
    }

    if (!email) {
      logStep("ERROR: No email provided");
      return new Response(
        JSON.stringify({ error: "Email is required to access the customer portal" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Looking up Stripe customer", { email });

    // Find customer by email
    const customers = await stripe.customers.list({ email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found");
      return new Response(
        JSON.stringify({ error: "No subscription found for this email" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Get return URL from headers or use default
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");
    let returnUrl = origin || DEFAULT_RETURN_URL;
    
    if (!origin && referer) {
      try {
        returnUrl = new URL(referer).origin;
      } catch {
        returnUrl = DEFAULT_RETURN_URL;
      }
    }

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${returnUrl}/support`,
    });

    logStep("Portal session created", { url: portalSession.url });

    return new Response(
      JSON.stringify({ url: portalSession.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const err = error as Error;
    logStep("ERROR", { message: err.message });
    
    let userMessage = err.message;
    if (err.message.includes("portal")) {
      userMessage = "Customer portal not configured. Please contact support.";
    }
    
    return new Response(
      JSON.stringify({ error: userMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
