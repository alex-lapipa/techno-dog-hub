import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: NotificationRequest = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.error("Invalid email provided:", email);
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Sending launch notification confirmation to:", email);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Courier New', monospace;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="500" cellpadding="0" cellspacing="0" style="max-width: 500px;">
                <tr>
                  <td style="padding-bottom: 30px;">
                    <span style="color: #39ff14; font-size: 10px; letter-spacing: 2px; text-transform: uppercase;">// techno.dog</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 20px;">
                    <h1 style="color: #ffffff; font-size: 24px; font-weight: normal; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
                      You're on the list.
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 30px;">
                    <p style="color: #888888; font-size: 14px; line-height: 1.6; margin: 0;">
                      We'll notify you when the techno.dog store launches with our first collection of objects for people who live inside sound.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 30px;">
                    <p style="color: #888888; font-size: 14px; line-height: 1.6; margin: 0;">
                      Expect limited editions. Print-on-demand production. Zero waste.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 0;">
                    <div style="border-top: 1px solid #222222;"></div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="color: #444444; font-size: 11px; margin: 0;">
                      <a href="https://techno.dog" style="color: #39ff14; text-decoration: none;">techno.dog</a> — Objects for people who live inside sound.
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
        subject: "You're on the list 🖤",
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Resend API error:", errorText);
      throw new Error(`Resend API error: ${res.status}`);
    }

    const emailResponse = await res.json();
    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, id: emailResponse.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending launch notification email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
