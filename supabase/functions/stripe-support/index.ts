import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validation schemas
const checkoutRequestSchema = z.object({
  mode: z.enum(["one_time", "recurring", "corporate"]),
  amount_cents: z.number().int().min(100, "Minimum amount is €1 (100 cents)"),
  email: z.string().email("Invalid email address").max(255).optional(),
  tier: z.string().max(50).optional(),
  company_name: z.string().max(200).optional(),
  vat_number: z.string().max(50).optional(),
  notes: z.string().max(1000).optional(),
  success_url: z.string().url().optional(),
  cancel_url: z.string().url().optional(),
});

type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

const TIER_THRESHOLDS = {
  member: 700, // €7/month
  patron: 2500, // €25/month
  founding: 10000, // €100/month
  bronze: 50000, // €500/year
  silver: 200000, // €2000/year
  gold: 1000000, // €10000/year
};

function determineTier(mode: string, amount_cents: number): string {
  if (mode === "corporate") {
    if (amount_cents >= TIER_THRESHOLDS.gold) return "gold";
    if (amount_cents >= TIER_THRESHOLDS.silver) return "silver";
    if (amount_cents >= TIER_THRESHOLDS.bronze) return "bronze";
    return "custom";
  }
  
  if (mode === "recurring") {
    if (amount_cents >= TIER_THRESHOLDS.founding) return "founding";
    if (amount_cents >= TIER_THRESHOLDS.patron) return "patron";
    if (amount_cents >= TIER_THRESHOLDS.member) return "member";
    return "custom";
  }
  
  return "custom";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse and validate request body
    const rawBody = await req.json();
    const validationResult = checkoutRequestSchema.safeParse(rawBody);
    
    if (!validationResult.success) {
      console.error("[stripe-support] Validation error:", validationResult.error.errors);
      return new Response(
        JSON.stringify({ 
          error: validationResult.error.errors[0]?.message || "Invalid request data" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const {
      mode,
      amount_cents,
      email,
      tier,
      company_name,
      vat_number,
      notes,
      success_url = `${req.headers.get("origin")}/support?success=true`,
      cancel_url = `${req.headers.get("origin")}/support?cancelled=true`,
    } = validationResult.data;

    console.log(`[stripe-support] Creating ${mode} checkout for ${amount_cents} cents`);

    // Handle corporate sponsor request (no Stripe checkout, just log request)
    if (mode === "corporate") {
      if (!company_name || !email) {
        return new Response(
          JSON.stringify({ error: "Company name and email required for corporate sponsorship" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const determinedTier = tier || determineTier(mode, amount_cents);

      const { data, error } = await supabase
        .from("corporate_sponsor_requests")
        .insert({
          company_name,
          contact_email: email,
          vat_number,
          requested_amount_cents: amount_cents,
          tier: determinedTier,
          notes,
        })
        .select()
        .single();

      if (error) {
        console.error("[stripe-support] Error creating corporate request:", error);
        throw new Error("Failed to submit corporate request");
      }

      console.log(`[stripe-support] Corporate sponsor request created: ${data.id}`);

      return new Response(
        JSON.stringify({
          success: true,
          type: "corporate_request",
          request_id: data.id,
          message: "Corporate sponsorship request submitted. We will contact you shortly.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get or create Stripe customer
    let customerId: string | undefined;
    if (email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email,
          metadata: {
            project: "techno.dog",
            operator: "Miramonte Somío SL",
            commercial_name: "Project La PIPA",
          },
        });
        customerId = customer.id;
      }
    }

    const determinedTier = tier || determineTier(mode, amount_cents);

    // Common metadata for all sessions
    const metadata: Record<string, string> = {
      project: "techno.dog",
      operator: "Miramonte Somío SL",
      commercial_name: "Project La PIPA",
      support_mode: mode,
      supporter_tier: determinedTier,
      amount_cents: String(amount_cents),
    };

    let sessionParams: Stripe.Checkout.SessionCreateParams;

    if (mode === "recurring") {
      // Create a dynamic price for recurring subscription
      const price = await stripe.prices.create({
        unit_amount: amount_cents,
        currency: "eur",
        recurring: { interval: "month" },
        product_data: {
          name: `techno.dog Membership (${determinedTier === "custom" ? "Custom" : determinedTier.charAt(0).toUpperCase() + determinedTier.slice(1)})`,
          metadata,
        },
        metadata: { tier: determinedTier },
      });

      sessionParams = {
        mode: "subscription",
        customer: customerId,
        customer_email: customerId ? undefined : email,
        line_items: [{ price: price.id, quantity: 1 }],
        success_url,
        cancel_url,
        metadata,
        subscription_data: {
          metadata,
        },
      };
    } else {
      // One-time payment
      sessionParams = {
        mode: "payment",
        customer: customerId,
        customer_email: customerId ? undefined : email,
        line_items: [
          {
            price_data: {
              currency: "eur",
              unit_amount: amount_cents,
              product_data: {
                name: "Support techno.dog – Project La PIPA",
                description: "One-time support for independent cultural infrastructure",
                metadata,
              },
            },
            quantity: 1,
          },
        ],
        success_url,
        cancel_url,
        metadata,
        payment_intent_data: {
          metadata,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log(`[stripe-support] Checkout session created: ${session.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        type: "checkout",
        url: session.url,
        session_id: session.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[stripe-support] Error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});