import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContributorContactRequest {
  name: string;
  email: string;
  skills: string[];
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, skills, message }: ContributorContactRequest = await req.json();

    // Validate inputs
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Name, email, and message are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const skillsList = skills.length > 0 ? skills.join(", ") : "Not specified";

    // Send notification to project team
    const notificationResponse = await resend.emails.send({
      from: "ringleader@techno.dog <alex@rmtv.io>",
      reply_to: "alex@rmtv.io",
      to: ["hello@technolog.club"],
      subject: `New Contributor: ${name} - ${skillsList}`,
      html: `
        <div style="font-family: monospace; background: #0a0a0a; color: #e5e5e5; padding: 32px;">
          <h1 style="color: #00d084; margin-bottom: 24px;">🎛 New T:DOG Contributor</h1>
          
          <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; border-left: 4px solid #00d084; margin-bottom: 20px;">
            <p style="margin: 0 0 8px 0;"><strong style="color: #00d084;">Name:</strong> ${name}</p>
            <p style="margin: 0 0 8px 0;"><strong style="color: #00d084;">Email:</strong> <a href="mailto:${email}" style="color: #00d084;">${email}</a></p>
            <p style="margin: 0;"><strong style="color: #00d084;">Skills:</strong> ${skillsList}</p>
          </div>
          
          <div style="background: #1a1a1a; padding: 20px; border-radius: 8px;">
            <h3 style="color: #00d084; margin-top: 0;">Message:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>
          
          <p style="color: #666; font-size: 12px; margin-top: 24px;">
            Sent from T:DOG Sound Engine Contributor Form
          </p>
        </div>
      `,
    });

    // Send confirmation to contributor
    await resend.emails.send({
      from: "ringleader@techno.dog <alex@rmtv.io>",
      reply_to: "alex@rmtv.io",
      to: [email],
      subject: "Thanks for reaching out to techno.dog!",
      html: `
        <div style="font-family: monospace; background: #0a0a0a; color: #e5e5e5; padding: 32px;">
          <h1 style="color: #00d084; margin-bottom: 24px;">🎛 T:DOG Sound Engine</h1>
          
          <p style="font-size: 16px; line-height: 1.6;">Hey ${name},</p>
          
          <p style="line-height: 1.6;">
            Thanks for reaching out about contributing to the T:DOG Sound Engine project! 
            We're excited to hear from you.
          </p>
          
          <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #00d084;">
            <p style="margin: 0 0 8px 0;"><strong style="color: #00d084;">Your Skills:</strong> ${skillsList}</p>
          </div>
          
          <p style="line-height: 1.6;">
            We'll review your message and get back to you soon. In the meantime, 
            feel free to explore the project at <a href="https://tdog.studio" style="color: #00d084;">tdog.studio</a>.
          </p>
          
          <p style="line-height: 1.6; margin-top: 24px;">
            <strong>This isn't a product. It's a community instrument.</strong><br>
            <span style="color: #666;">Built in public. Free to use. Open forever.</span>
          </p>
          
          <p style="color: #666; font-size: 12px; margin-top: 32px;">
            — The T:DOG Team
          </p>
        </div>
      `,
    });

    console.log("Contributor contact emails sent successfully:", notificationResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in contributor-contact function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
