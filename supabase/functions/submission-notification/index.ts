import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubmissionEmailRequest {
  email: string;
  submissionName: string;
  status: "approved" | "rejected" | "duplicate";
  adminNotes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, submissionName, status, adminNotes }: SubmissionEmailRequest = await req.json();

    console.log(`Sending ${status} email to ${email} for submission: ${submissionName}`);

    if (!email) {
      console.log("No email provided, skipping notification");
      return new Response(
        JSON.stringify({ success: true, message: "No email provided, skipping" }),
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

    const statusConfig = {
      approved: {
        subject: "🎉 Your techno.dog submission has been approved!",
        heading: "Great news!",
        message: "Your submission has been reviewed and approved by our team. Thank you for contributing to the global techno knowledge base.",
        color: "#22c55e",
      },
      rejected: {
        subject: "Update on your techno.dog submission",
        heading: "Thank you for your submission",
        message: "After careful review, we were unable to approve your submission at this time. This could be due to missing information, duplicate content, or other factors.",
        color: "#ef4444",
      },
      duplicate: {
        subject: "Update on your techno.dog submission",
        heading: "Duplicate submission detected",
        message: "It looks like the content you submitted already exists in our database. Thank you for your contribution though — keep them coming!",
        color: "#f59e0b",
      },
    };

    const config = statusConfig[status];

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Courier New', monospace;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #4ade80; font-size: 24px; letter-spacing: 4px; margin: 0;">
                TECHNO.DOG
              </h1>
              <p style="color: #666; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin-top: 8px;">
                Global Techno Knowledge Base
              </p>
            </div>

            <!-- Main Content -->
            <div style="background-color: #111; border: 1px solid #333; padding: 32px;">
              <h2 style="color: #fff; font-size: 18px; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 1px;">
                ${config.heading}
              </h2>
              
              <p style="color: #ccc; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                ${config.message}
              </p>

              <!-- Submission Details -->
              <div style="background-color: #0a0a0a; border-left: 3px solid ${config.color}; padding: 16px; margin: 24px 0;">
                <p style="color: #888; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">
                  Submission
                </p>
                <p style="color: #fff; font-size: 14px; margin: 0;">
                  ${submissionName || "Unnamed submission"}
                </p>
              </div>

              <!-- Status Badge -->
              <div style="margin: 24px 0;">
                <span style="display: inline-block; background-color: ${config.color}20; color: ${config.color}; padding: 8px 16px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; border: 1px solid ${config.color}50;">
                  ${status.toUpperCase()}
                </span>
              </div>

              ${adminNotes ? `
                <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #333;">
                  <p style="color: #888; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">
                    Note from the team
                  </p>
                  <p style="color: #ccc; font-size: 13px; line-height: 1.6; margin: 0; font-style: italic;">
                    "${adminNotes}"
                  </p>
                </div>
              ` : ""}
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 40px;">
              <p style="color: #666; font-size: 11px; margin: 0 0 8px 0;">
                Questions? Reply to this email or visit
              </p>
              <a href="https://techno.dog" style="color: #4ade80; font-size: 11px; text-decoration: none;">
                techno.dog
              </a>
              <p style="color: #444; font-size: 10px; margin-top: 24px;">
                © ${new Date().getFullYear()} techno.dog • Underground knowledge, globally connected
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using Resend API directly
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "ringleader@techno.dog <alex@rmtb.io>",
        reply_to: "alex@rmtb.io",
        to: [email],
        subject: config.subject,
        html,
      }),
    });

    const emailResponse = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending submission notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
