import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
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

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err: unknown) {
        const error = err as Error;
        console.error("Webhook signature verification failed:", error.message);
        return new Response(JSON.stringify({ error: "Invalid signature" }), { 
          status: 400,
          headers: corsHeaders 
        });
      }
    } else {
      // No webhook secret configured, parse event directly (less secure)
      event = JSON.parse(body);
      console.warn("No webhook secret configured - signature not verified");
    }

    console.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};
        
        const supporterData = {
          email: session.customer_email || session.customer_details?.email || "",
          stripe_customer_id: session.customer as string,
          stripe_checkout_session_id: session.id,
          stripe_subscription_id: session.subscription as string | null,
          support_mode: metadata.support_mode || "one_time",
          supporter_tier: metadata.supporter_tier || "custom",
          amount_cents: parseInt(metadata.amount_cents || String(session.amount_total || 0)),
          currency: session.currency?.toUpperCase() || "EUR",
          is_active: true,
          metadata: {
            stripe_payment_intent: session.payment_intent,
            stripe_mode: session.mode,
          },
        };

        console.log("Creating supporter record:", supporterData);

        const { error } = await supabase
          .from("supporters")
          .insert(supporterData);

        if (error) {
          console.error("Error creating supporter:", error);
        } else {
          console.log("Supporter record created successfully");
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        
        const { error } = await supabase
          .from("supporters")
          .update({
            is_active: subscription.status === "active",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          console.error("Error updating supporter:", error);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        
        const { error } = await supabase
          .from("supporters")
          .update({
            is_active: false,
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          console.error("Error updating cancelled subscription:", error);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
