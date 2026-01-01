import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminWelcomeRequest {
  admins: Array<{ email: string; name?: string }>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // EMAIL SENDING DISABLED - Requires explicit authorization
  console.log("[send-admin-welcome] Email sending is currently disabled");
  return new Response(
    JSON.stringify({ success: false, message: "Email sending disabled - requires authorization" }),
    { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
  );

  try {
    const { admins }: AdminWelcomeRequest = await req.json();
    
    console.log(`Sending admin welcome emails to ${admins.length} admins`);
    
    const results = [];
    
    for (const admin of admins) {
      const name = admin.name || admin.email.split('@')[0];
      
      try {
        const emailResponse = await resend.emails.send({
          from: "Techno.Dog <doggy@techno.dog>",
          to: [admin.email],
          reply_to: "doggy@techno.dog",
          subject: "🐕 Welcome to Techno.Dog Admin Team",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 40px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #22c55e; margin: 0; font-size: 32px;">TECHNO.DOG</h1>
                <p style="color: #888; margin-top: 8px;">Admin Access Confirmed</p>
              </div>
              
              <h2 style="color: #ffffff; margin-bottom: 20px;">Welcome, ${name}!</h2>
              
              <p style="color: #cccccc; line-height: 1.6;">
                Your admin access to <strong style="color: #22c55e;">techno.dog</strong> has been confirmed. 
                You now have full access to the platform's administrative tools and control panels.
              </p>
              
              <div style="background: #1a1a1a; border-left: 4px solid #22c55e; padding: 20px; margin: 25px 0;">
                <h3 style="color: #22c55e; margin: 0 0 10px 0;">What you can do:</h3>
                <ul style="color: #cccccc; margin: 0; padding-left: 20px; line-height: 1.8;">
                  <li>Manage users and roles</li>
                  <li>Access AI agent control panels</li>
                  <li>Monitor system health and analytics</li>
                  <li>Curate content and moderate submissions</li>
                  <li>Configure media engine and outreach tools</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://techno.dog/admin" style="background: #22c55e; color: #000000; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  Access Admin Panel
                </a>
              </div>
              
              <p style="color: #888888; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #333;">
                This is an automated message from Techno.Dog. 
                Reply to this email if you have any questions.
              </p>
              
              <p style="color: #666666; font-size: 12px; text-align: center; margin-top: 20px;">
                🖤 Pure warehouse truth, strictly underground.
              </p>
            </div>
          `,
        });
        
        console.log(`Email sent to ${admin.email}:`, emailResponse);
        results.push({ email: admin.email, success: true, id: emailResponse.data?.id });
      } catch (emailError: any) {
        console.error(`Failed to send to ${admin.email}:`, emailError);
        results.push({ email: admin.email, success: false, error: emailError.message });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-admin-welcome:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
