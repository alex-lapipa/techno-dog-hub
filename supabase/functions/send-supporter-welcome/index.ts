import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[send-supporter-welcome] ${step}${detailsStr}`);
};

interface SupporterEmailRequest {
  email: string;
  support_mode: "one_time" | "recurring" | "corporate";
  supporter_tier: string;
  amount_cents: number;
  currency: string;
  stripe_receipt_url?: string;
}

function formatAmount(cents: number, currency: string): string {
  const amount = cents / 100;
  const symbol = currency === "EUR" ? "€" : currency === "USD" ? "$" : currency;
  return `${symbol}${amount.toFixed(2)}`;
}

function getTierDisplayName(tier: string): string {
  const names: Record<string, string> = {
    member: "Member",
    patron: "Patron",
    founding: "Founding Supporter",
    bronze: "Bronze Sponsor",
    silver: "Silver Sponsor",
    gold: "Gold Sponsor",
    custom: "Supporter",
  };
  return names[tier] || tier.charAt(0).toUpperCase() + tier.slice(1);
}

function getModeDescription(mode: string): string {
  switch (mode) {
    case "recurring":
      return "monthly membership";
    case "one_time":
      return "one-time contribution";
    case "corporate":
      return "corporate sponsorship";
    default:
      return "contribution";
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // EMAIL SENDING DISABLED - Requires explicit authorization
  console.log("[send-supporter-welcome] Email sending is currently disabled");
  return new Response(
    JSON.stringify({ success: false, message: "Email sending disabled - requires authorization" }),
    { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
  );

  try {
    logStep("Function started");

    if (!RESEND_API_KEY) {
      logStep("ERROR: RESEND_API_KEY not configured");
      throw new Error("Email service not configured");
    }

    const data: SupporterEmailRequest = await req.json();
    
    logStep("Processing welcome email", { 
      email: data.email, 
      mode: data.support_mode, 
      tier: data.supporter_tier 
    });

    const { email, support_mode, supporter_tier, amount_cents, currency, stripe_receipt_url } = data;

    const formattedAmount = formatAmount(amount_cents, currency);
    const tierName = getTierDisplayName(supporter_tier);
    const modeDescription = getModeDescription(support_mode);
    const isRecurring = support_mode === "recurring";

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to techno.dog</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Courier New', monospace;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse;">
          
          <!-- Header -->
          <tr>
            <td style="padding-bottom: 30px; border-bottom: 1px solid #222;">
              <h1 style="margin: 0; color: #00FF88; font-size: 28px; font-weight: bold; letter-spacing: 2px;">
                techno.dog
              </h1>
              <p style="margin: 10px 0 0; color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 3px;">
                // Global Techno Knowledge Hub
              </p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 0;">
              <h2 style="margin: 0 0 20px; color: #ffffff; font-size: 24px; font-weight: normal;">
                Thank you for your support.
              </h2>
              
              <p style="margin: 0 0 30px; color: #cccccc; font-size: 14px; line-height: 1.7;">
                Your ${modeDescription} of <strong style="color: #00FF88;">${formattedAmount}${isRecurring ? '/month' : ''}</strong> 
                has been received. You're now officially a <strong style="color: #00FF88;">${tierName}</strong>.
              </p>
              
              <!-- Summary Box -->
              <table role="presentation" style="width: 100%; border: 1px solid #333; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: #111;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding: 8px 0; color: #888; font-size: 12px; text-transform: uppercase;">Type</td>
                        <td style="padding: 8px 0; color: #fff; font-size: 14px; text-align: right;">${support_mode === "recurring" ? "Monthly Membership" : "One-Time Support"}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #888; font-size: 12px; text-transform: uppercase;">Tier</td>
                        <td style="padding: 8px 0; color: #00FF88; font-size: 14px; text-align: right;">${tierName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #888; font-size: 12px; text-transform: uppercase;">Amount</td>
                        <td style="padding: 8px 0; color: #fff; font-size: 14px; text-align: right;">${formattedAmount}${isRecurring ? '/month' : ''}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              ${stripe_receipt_url ? `
              <p style="margin: 0 0 30px;">
                <a href="${stripe_receipt_url}" style="display: inline-block; padding: 12px 24px; background-color: #00FF88; color: #000; text-decoration: none; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">
                  View Receipt →
                </a>
              </p>
              ` : ''}
              
              ${isRecurring ? `
              <p style="margin: 0 0 30px; color: #888; font-size: 13px; line-height: 1.7;">
                Your membership will renew automatically each month. You can manage or cancel your subscription anytime from the 
                <a href="https://techno.dog/support" style="color: #00FF88;">Support page</a>.
              </p>
              ` : ''}
              
              <!-- What's Next -->
              <h3 style="margin: 40px 0 15px; color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">
                What Your Support Enables
              </h3>
              <ul style="margin: 0; padding: 0 0 0 20px; color: #ccc; font-size: 13px; line-height: 2;">
                <li>Hosting, storage, bandwidth, and APIs</li>
                <li>Research, curation, and documentation</li>
                <li>Community contributions and moderation</li>
                <li>Long-term preservation of underground techno culture</li>
              </ul>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding-top: 30px; border-top: 1px solid #222;">
              <p style="margin: 0 0 10px; color: #666; font-size: 11px;">
                This is a commercial contribution to Project La PIPA, operated by Miramonte Somío SL (Spain).
              </p>
              <p style="margin: 0; color: #444; font-size: 11px;">
                techno.dog — Pure Warehouse Truth, Zero Fluff
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Techno.Dog <doggy@techno.dog>",
        reply_to: "doggy@techno.dog",
        to: [email],
        subject: `Welcome, ${tierName} 🖤`,
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      logStep("ERROR: Resend API failed", { status: res.status, error: errorText });
      throw new Error(`Email send failed: ${res.status}`);
    }

    const emailResponse = await res.json();
    logStep("Email sent successfully", { id: emailResponse.id });

    return new Response(JSON.stringify({ success: true, id: emailResponse.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const err = error as Error;
    logStep("ERROR", { message: err.message });
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
