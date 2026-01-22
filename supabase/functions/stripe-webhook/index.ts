import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[stripe-webhook] ${step}${detailsStr}`);
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
      logStep(`Health alert logged: ${severity}`, { message });
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
      apiVersion: "2025-08-27.basil",
    });

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    // SECURITY: Always verify webhook signature in production
    if (!webhookSecret) {
      const warningMsg = "SECURITY WARNING: STRIPE_WEBHOOK_SECRET not configured - webhook signature verification disabled";
      console.warn(`[stripe-webhook] ${warningMsg}`);
      await logHealthAlert("stripe-webhook", "security_misconfiguration", "warn", warningMsg);
      // Allow processing but log the security gap
      event = JSON.parse(body);
    } else if (!signature) {
      const errorMsg = "Missing stripe-signature header - request rejected for security";
      logStep("ERROR: " + errorMsg);
      await logHealthAlert("stripe-webhook", "missing_signature", "error", errorMsg);
      return new Response(JSON.stringify({ error: "Missing signature" }), { status: 400, headers: corsHeaders });
    } else {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        logStep("Webhook signature verified successfully");
      } catch (err: unknown) {
        const error = err as Error;
        logStep("ERROR: Signature verification failed", { message: error.message });
        await logHealthAlert("stripe-webhook", "signature_verification_failed", "error", `Webhook signature verification failed: ${error.message}`);
        return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400, headers: corsHeaders });
      }
    }

    logStep(`Processing event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};
        
        const email = session.customer_email || session.customer_details?.email || "";
        const support_mode = metadata.support_mode || "one_time";
        const supporter_tier = metadata.supporter_tier || "custom";
        const amount_cents = parseInt(metadata.amount_cents || String(session.amount_total || 0));
        const currency = session.currency?.toUpperCase() || "EUR";

        const supporterData = {
          email,
          stripe_customer_id: session.customer as string,
          stripe_checkout_session_id: session.id,
          stripe_subscription_id: session.subscription as string | null,
          support_mode,
          supporter_tier,
          amount_cents,
          currency,
          is_active: true,
          metadata: { stripe_payment_intent: session.payment_intent, stripe_mode: session.mode },
        };

        const { error } = await supabase.from("supporters").insert(supporterData);
        if (error) {
          logStep("ERROR: Failed to create supporter", { error: error.message });
          await logHealthAlert("stripe-webhook", "database_error", "error", `Failed to create supporter: ${error.message}`);
        } else {
          logStep("Supporter record created successfully", { email, tier: supporter_tier });
          
          // Send welcome email asynchronously
          try {
            const emailPayload = {
              email,
              support_mode,
              supporter_tier,
              amount_cents,
              currency,
            };
            
            // Invoke the welcome email function
            const emailResponse = await fetch(
              `${supabaseUrl}/functions/v1/send-supporter-welcome`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${supabaseKey}`,
                },
                body: JSON.stringify(emailPayload),
              }
            );
            
            if (emailResponse.ok) {
              logStep("Welcome email triggered successfully");
            } else {
              const emailError = await emailResponse.text();
              logStep("WARNING: Welcome email failed", { error: emailError });
            }
          } catch (emailErr) {
            logStep("WARNING: Failed to trigger welcome email", { error: (emailErr as Error).message });
            // Don't fail the webhook if email fails
          }
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