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

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const logHealthAlert = async (
    serviceName: string,
    alertType: string,
    severity: string,
    message: string
  ) => {
    try {
      await supabase.from("health_alerts").insert({
        service_name: serviceName,
        alert_type: alertType,
        severity,
        message,
        notified_at: new Date().toISOString(),
      });
      console.log(`[stripe-webhook] Health alert logged: ${severity} - ${message}`);
    } catch (err) {
      console.error("[stripe-webhook] Failed to log health alert:", err);
    }
  };

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) {
      const errorMsg = "Stripe secret key not configured";
      await logHealthAlert("stripe-webhook", "configuration_error", "error", errorMsg);
      throw new Error(errorMsg);
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err: unknown) {
        const error = err as Error;
        console.error("[stripe-webhook] Signature verification failed:", error.message);
        await logHealthAlert("stripe-webhook", "signature_verification_failed", "warn", `Webhook signature verification failed: ${error.message}`);
        return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400, headers: corsHeaders });
      }
    } else {
      event = JSON.parse(body);
      console.warn("[stripe-webhook] No webhook secret configured - signature not verified");
    }

    console.log(`[stripe-webhook] Processing event: ${event.type}`);

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
          metadata: { stripe_payment_intent: session.payment_intent, stripe_mode: session.mode },
        };

        const { error } = await supabase.from("supporters").insert(supporterData);
        if (error) {
          console.error("[stripe-webhook] Error creating supporter:", error);
          await logHealthAlert("stripe-webhook", "database_error", "error", `Failed to create supporter: ${error.message}`);
        } else {
          console.log("[stripe-webhook] Supporter record created successfully");
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const { error } = await supabase.from("supporters").update({ is_active: subscription.status === "active", updated_at: new Date().toISOString() }).eq("stripe_subscription_id", subscription.id);
        if (error) {
          console.error("[stripe-webhook] Error updating supporter:", error);
          await logHealthAlert("stripe-webhook", "database_error", "error", `Failed to update subscription: ${error.message}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const { error } = await supabase.from("supporters").update({ is_active: false, cancelled_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("stripe_subscription_id", subscription.id);
        if (error) {
          console.error("[stripe-webhook] Error updating cancelled subscription:", error);
          await logHealthAlert("stripe-webhook", "database_error", "error", `Failed to cancel subscription: ${error.message}`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await logHealthAlert("stripe-webhook", "payment_failed", "warn", `Payment failed for invoice ${invoice.id}`);
        break;
      }

      default:
        console.log(`[stripe-webhook] Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[stripe-webhook] Webhook error:", err);
    await logHealthAlert("stripe-webhook", "unhandled_error", "error", `Webhook processing failed: ${err.message}`);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});