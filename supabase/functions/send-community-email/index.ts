import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type EmailType = "verification" | "newsletter_optin" | "api_key_created" | "api_key_revoked" | "referral_verified";

interface EmailRequest {
  type: EmailType;
  to: string;
  data: Record<string, unknown>;
}

// Shared styles
const styles = {
  main: "background-color: #0a0a0a; font-family: 'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace;",
  container: "margin: 0 auto; padding: 40px 20px; max-width: 560px;",
  logo: "font-size: 24px; color: #22c55e; text-align: center; margin-bottom: 32px;",
  h1: "color: #ffffff; font-size: 24px; font-weight: 600; text-align: center; margin: 0 0 24px; text-transform: uppercase; letter-spacing: 2px;",
  text: "color: #a1a1aa; font-size: 14px; line-height: 24px; margin: 0 0 24px; text-align: center;",
  textMuted: "color: #52525b; font-size: 12px; line-height: 20px; margin: 24px 0 0; text-align: center;",
  button: "background-color: #22c55e; color: #000000; font-size: 12px; font-weight: 600; text-decoration: none; text-align: center; display: inline-block; padding: 14px 32px; text-transform: uppercase; letter-spacing: 1px;",
  buttonContainer: "text-align: center; margin: 32px 0;",
  hr: "border: none; border-top: 1px solid #27272a; margin: 32px 0;",
  footer: "color: #52525b; font-size: 11px; line-height: 18px; text-align: center; margin: 0 0 8px;",
  footerBrand: "color: #3f3f46; font-size: 10px; text-align: center; margin: 0; text-transform: uppercase; letter-spacing: 1px;",
  keyDetails: "background-color: #18181b; border: 1px solid #27272a; padding: 20px; margin: 0 0 24px;",
  detailLabel: "color: #71717a; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px;",
  detailValue: "color: #ffffff; font-size: 14px; margin: 0 0 16px;",
  codeBlock: "background-color: #27272a; color: #22c55e; font-size: 13px; padding: 8px 12px; display: inline-block; margin: 0 0 16px;",
  warningBox: "background-color: #422006; border: 1px solid #854d0e; padding: 16px; margin: 0 0 24px;",
  warningText: "color: #fbbf24; font-size: 12px; line-height: 20px; margin: 0;",
  infoBox: "background-color: #172554; border: 1px solid #1e40af; padding: 16px; margin: 0 0 24px;",
  infoText: "color: #93c5fd; font-size: 12px; line-height: 20px; margin: 0;",
  listItem: "color: #71717a; font-size: 12px; line-height: 24px; margin: 0;",
};

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="${styles.main}">
  <div style="${styles.container}">
    <div style="${styles.logo}">🐕 techno.dog</div>
    ${content}
  </div>
</body>
</html>`;
}

function verificationEmail(verificationUrl: string, email: string): string {
  return baseTemplate(`
    <h1 style="${styles.h1}">Welcome to the community</h1>
    <p style="${styles.text}">
      You're one step away from joining the techno.dog community. Click the button below to verify your email and start contributing.
    </p>
    <div style="${styles.buttonContainer}">
      <a href="${verificationUrl}" style="${styles.button}">Verify Email Address</a>
    </div>
    <p style="${styles.textMuted}">
      Or copy and paste this link into your browser:
    </p>
    <p style="color: #22c55e; font-size: 11px; text-align: center; word-break: break-all; margin: 8px 0 24px;">
      ${verificationUrl}
    </p>
    <hr style="${styles.hr}">
    <p style="${styles.footer}">This email was sent to ${email}. If you didn't request this, you can safely ignore it.</p>
    <p style="${styles.footerBrand}">techno.dog — Global Techno Knowledge Base</p>
  `);
}

function newsletterOptInEmail(confirmUrl: string, email: string): string {
  return baseTemplate(`
    <h1 style="${styles.h1}">Newsletter Subscription</h1>
    <p style="${styles.text}">
      You've requested to receive the techno.dog newsletter — curated underground techno news, artist spotlights, and community updates delivered to your inbox.
    </p>
    <p style="color: #ffffff; font-size: 12px; font-weight: 600; margin: 24px 0 12px; text-align: center; text-transform: uppercase; letter-spacing: 1px;">
      What you'll get:
    </p>
    <div style="padding: 0 20px; margin: 0 0 24px;">
      <p style="${styles.listItem}">→ Weekly artist spotlights from Detroit to Tbilisi</p>
      <p style="${styles.listItem}">→ New releases from labels that matter</p>
      <p style="${styles.listItem}">→ Festival & venue updates worldwide</p>
      <p style="${styles.listItem}">→ Community contributions & corrections</p>
    </div>
    <div style="${styles.buttonContainer}">
      <a href="${confirmUrl}" style="${styles.button}">Confirm Subscription</a>
    </div>
    <p style="${styles.textMuted}">
      If you didn't subscribe, no action is needed — you won't receive any emails.
    </p>
    <hr style="${styles.hr}">
    <p style="${styles.footer}">This confirmation was requested for ${email}</p>
    <p style="${styles.footerBrand}">techno.dog — Pure Warehouse Truth, Zero Fluff</p>
  `);
}

function apiKeyCreatedEmail(
  keyName: string,
  keyPrefix: string,
  scopes: string[],
  email: string,
  dashboardUrl: string
): string {
  return baseTemplate(`
    <h1 style="${styles.h1}">API Key Created</h1>
    <p style="${styles.text}">
      A new API key has been created for your techno.dog developer account.
    </p>
    <div style="${styles.keyDetails}">
      <p style="${styles.detailLabel}">Key Name</p>
      <p style="${styles.detailValue}">${keyName}</p>
      <p style="${styles.detailLabel}">Key Prefix</p>
      <p style="${styles.codeBlock}">${keyPrefix}...</p>
      <p style="${styles.detailLabel}">Scopes</p>
      <p style="${styles.detailValue}">${scopes.join(", ")}</p>
    </div>
    <div style="${styles.warningBox}">
      <p style="${styles.warningText}">
        ⚠️ Security Notice: Your full API key was shown only once when created. If you didn't save it, you'll need to revoke this key and create a new one.
      </p>
    </div>
    <div style="${styles.buttonContainer}">
      <a href="${dashboardUrl}" style="${styles.button}">Manage API Keys</a>
    </div>
    <p style="${styles.textMuted}">
      If you didn't create this API key, please revoke it immediately and secure your account.
    </p>
    <hr style="${styles.hr}">
    <p style="${styles.footer}">This notification was sent to ${email}</p>
    <p style="${styles.footerBrand}">techno.dog Developer API</p>
  `);
}

function apiKeyRevokedEmail(
  keyName: string,
  keyPrefix: string,
  email: string,
  dashboardUrl: string,
  revokedAt: string
): string {
  return baseTemplate(`
    <h1 style="${styles.h1}">API Key Revoked</h1>
    <p style="${styles.text}">
      An API key has been revoked from your techno.dog developer account. This key will no longer work for API requests.
    </p>
    <div style="${styles.keyDetails}">
      <p style="${styles.detailLabel}">Key Name</p>
      <p style="${styles.detailValue}">${keyName}</p>
      <p style="${styles.detailLabel}">Key Prefix</p>
      <p style="background-color: #27272a; color: #ef4444; font-size: 13px; padding: 8px 12px; display: inline-block; margin: 0 0 16px; text-decoration: line-through;">${keyPrefix}...</p>
      <p style="${styles.detailLabel}">Revoked At</p>
      <p style="${styles.detailValue}">${revokedAt}</p>
    </div>
    <div style="${styles.infoBox}">
      <p style="${styles.infoText}">
        ℹ️ All requests using this key will now return 401 Unauthorized. If you still need API access, create a new key from your dashboard.
      </p>
    </div>
    <div style="${styles.buttonContainer}">
      <a href="${dashboardUrl}" style="${styles.button}">Create New API Key</a>
    </div>
    <p style="${styles.textMuted}">
      If you didn't revoke this API key, please secure your account immediately.
    </p>
    <hr style="${styles.hr}">
    <p style="${styles.footer}">This notification was sent to ${email}</p>
    <p style="${styles.footerBrand}">techno.dog Developer API</p>
  `);
}

function referralVerifiedEmail(
  referrerName: string,
  referredEmail: string,
  xpEarned: number,
  email: string,
  profileUrl: string
): string {
  return baseTemplate(`
    <h1 style="${styles.h1}">Your Referral Earned You XP!</h1>
    <p style="${styles.text}">
      Great news! A friend you referred has just become a verified contributor on techno.dog.
    </p>
    <div style="${styles.keyDetails}">
      <p style="${styles.detailLabel}">Referred Friend</p>
      <p style="${styles.detailValue}">${referredEmail}</p>
      <p style="${styles.detailLabel}">XP Earned</p>
      <p style="${styles.codeBlock}">+${xpEarned} XP</p>
    </div>
    <div style="${styles.infoBox}">
      <p style="${styles.infoText}">
        🎉 Keep sharing your referral link to earn more XP and climb the leaderboard! Each verified referral earns you 250 XP.
      </p>
    </div>
    <div style="${styles.buttonContainer}">
      <a href="${profileUrl}" style="${styles.button}">View Your Profile</a>
    </div>
    <p style="${styles.textMuted}">
      Share your referral link with fellow techno enthusiasts to earn more rewards.
    </p>
    <hr style="${styles.hr}">
    <p style="${styles.footer}">This notification was sent to ${email}</p>
    <p style="${styles.footerBrand}">techno.dog — Global Techno Knowledge Base</p>
  `);
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, to, data }: EmailRequest = await req.json();
    
    console.log(`Sending ${type} email to ${to}`);

    if (!to) {
      console.log("No email provided, skipping");
      return new Response(
        JSON.stringify({ success: true, message: "No email provided" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let html: string;
    let subject: string;

    const baseUrl = Deno.env.get("SITE_URL") || "https://techno.dog";

    switch (type) {
      case "verification": {
        subject = "Verify your techno.dog community membership";
        html = verificationEmail(data.verificationUrl as string, to);
        break;
      }

      case "newsletter_optin": {
        subject = "Confirm your techno.dog newsletter subscription";
        html = newsletterOptInEmail(data.confirmUrl as string, to);
        break;
      }

      case "api_key_created": {
        subject = "Your techno.dog API key has been created";
        html = apiKeyCreatedEmail(
          data.keyName as string,
          data.keyPrefix as string,
          data.scopes as string[],
          to,
          `${baseUrl}/developer`
        );
        break;
      }

      case "api_key_revoked": {
        subject = "Your techno.dog API key has been revoked";
        html = apiKeyRevokedEmail(
          data.keyName as string,
          data.keyPrefix as string,
          to,
          `${baseUrl}/developer`,
          data.revokedAt as string
        );
        break;
      }

      case "referral_verified": {
        subject = "🎉 Your referral earned you 250 XP on techno.dog!";
        html = referralVerifiedEmail(
          data.referrerName as string || "Contributor",
          data.referredEmail as string,
          250,
          to,
          `${baseUrl}/community/profile`
        );
        break;
      }

      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    // Send email using Resend API directly
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "techno.dog <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
      }),
    });

    const emailResponse = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, messageId: emailResponse?.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
