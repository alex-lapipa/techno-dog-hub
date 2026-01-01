import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnnouncementRequest {
  to: string;
  recipientName?: string;
  isTest?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, recipientName, isTest }: AnnouncementRequest = await req.json();

    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const greeting = recipientName ? `Hey ${recipientName},` : "Hey,";
    const testBanner = isTest ? `<div style="background-color: #ff6b00; color: #000; padding: 12px; text-align: center; font-weight: bold; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">⚠️ TEST EMAIL – NOT FOR PRODUCTION ⚠️</div>` : '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Courier New', Consolas, monospace;">
        ${testBanner}
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px;">
                
                <!-- Header -->
                <tr>
                  <td style="padding-bottom: 30px;">
                    <span style="color: #39ff14; font-size: 11px; letter-spacing: 3px; text-transform: uppercase;">// techno.dog</span>
                  </td>
                </tr>

                <!-- Title -->
                <tr>
                  <td style="padding-bottom: 24px;">
                    <h1 style="color: #ffffff; font-size: 28px; font-weight: normal; margin: 0; text-transform: uppercase; letter-spacing: 2px; line-height: 1.3;">
                      A Quiet Launch for Techno.Dog
                    </h1>
                  </td>
                </tr>

                <!-- Greeting -->
                <tr>
                  <td style="padding-bottom: 20px;">
                    <p style="color: #ffffff; font-size: 15px; line-height: 1.7; margin: 0;">
                      ${greeting}
                    </p>
                  </td>
                </tr>

                <!-- Intro -->
                <tr>
                  <td style="padding-bottom: 20px;">
                    <p style="color: #b0b0b0; font-size: 15px; line-height: 1.7; margin: 0;">
                      Today we're opening <strong style="color: #39ff14;">techno.dog</strong> – a public, growing archive of global techno culture. It's a first version, built with limited resources, by hand, with what I know and what I've lived so far.
                    </p>
                  </td>
                </tr>

                <!-- Quote Block -->
                <tr>
                  <td style="padding: 20px 0;">
                    <div style="border-left: 3px solid #39ff14; padding-left: 20px;">
                      <p style="color: #ffffff; font-size: 14px; line-height: 1.6; margin: 0; font-style: italic;">
                        "From now on, it's meant to be shaped by all of us."
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Why Section -->
                <tr>
                  <td style="padding-bottom: 16px; padding-top: 16px;">
                    <h2 style="color: #39ff14; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 0;">Why This Exists</h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 20px;">
                    <p style="color: #b0b0b0; font-size: 14px; line-height: 1.7; margin: 0;">
                      For years I've watched something repeat itself in techno: parties come and go, venues open and close, crews and labels do amazing work then disappear from view. The scene is always moving. A lot of what's important ends up scattered across memories, hard drives, and dead links.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 20px;">
                    <p style="color: #b0b0b0; font-size: 14px; line-height: 1.7; margin: 0;">
                      <strong style="color: #ffffff;">Techno.dog</strong> is here to help keep track of the culture as it actually is today, knowing that what happens now is built on what came before.
                    </p>
                  </td>
                </tr>

                <!-- What's Inside Section -->
                <tr>
                  <td style="padding-bottom: 16px; padding-top: 16px;">
                    <h2 style="color: #39ff14; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 0;">What You'll Find</h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 20px;">
                    <table cellpadding="0" cellspacing="0" style="width: 100%;">
                      <tr>
                        <td style="padding: 8px 0; color: #b0b0b0; font-size: 13px;">
                          <span style="color: #39ff14;">→</span> <strong style="color: #ffffff;">Culture Archive</strong> – Artists, festivals, venues, crews, labels, collectives
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #b0b0b0; font-size: 13px;">
                          <span style="color: #39ff14;">→</span> <strong style="color: #ffffff;">Artist & Scene Database</strong> – People, places, connections across the globe
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #b0b0b0; font-size: 13px;">
                          <span style="color: #39ff14;">→</span> <strong style="color: #ffffff;">Gear & Tools</strong> – Machines, software, setups producers use today
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #b0b0b0; font-size: 13px;">
                          <span style="color: #39ff14;">→</span> <strong style="color: #ffffff;">Audio Lab</strong> – Spaces to experiment with sound
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- CTA Button -->
                <tr>
                  <td style="padding: 30px 0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background-color: #39ff14; padding: 14px 32px;">
                          <a href="https://techno.dog" target="_blank" style="color: #000000; text-decoration: none; font-size: 13px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">
                            Explore Techno.Dog →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Help Section -->
                <tr>
                  <td style="padding-bottom: 16px; padding-top: 16px;">
                    <h2 style="color: #39ff14; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 0;">How You Can Help</h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 20px;">
                    <p style="color: #b0b0b0; font-size: 14px; line-height: 1.7; margin: 0;">
                      If this resonates, there are simple ways to contribute: add local scenes and stories, share old materials, connect others who hold knowledge, or help shape the platform itself if you build things.
                    </p>
                  </td>
                </tr>

                <!-- Closing Quote -->
                <tr>
                  <td style="padding: 24px 0;">
                    <div style="border-left: 3px solid #39ff14; padding-left: 20px;">
                      <p style="color: #ffffff; font-size: 14px; line-height: 1.6; margin: 0; font-style: italic;">
                        "If this platform can quietly help people understand where we've come from, see where we are, and imagine what's next, it will be doing its job."
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Signature -->
                <tr>
                  <td style="padding-top: 20px; padding-bottom: 30px;">
                    <p style="color: #ffffff; font-size: 14px; margin: 0;">Thanks for taking the time.</p>
                    <p style="color: #ffffff; font-size: 14px; margin: 16px 0 0 0;">— Alex</p>
                    <p style="color: #666666; font-size: 12px; margin: 8px 0 0 0;">techno.dog / LA PIPA</p>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding: 20px 0;">
                    <div style="border-top: 1px solid #222222;"></div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td>
                    <p style="color: #444444; font-size: 11px; margin: 0; line-height: 1.6;">
                      You're receiving this because you're part of the techno community we respect and want to share this with.
                    </p>
                    <p style="color: #444444; font-size: 11px; margin: 12px 0 0 0;">
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

    const textContent = `
TECHNO.DOG — A Quiet Launch

${greeting}

Today we're opening techno.dog – a public, growing archive of global techno culture.

"From now on, it's meant to be shaped by all of us."

WHY THIS EXISTS
For years I've watched something repeat itself in techno: parties come and go, venues open and close, crews and labels do amazing work then disappear from view.

Techno.dog is here to help keep track of the culture as it actually is today.

WHAT YOU'LL FIND
→ Culture Archive – Artists, festivals, venues, crews, labels
→ Artist & Scene Database – People, places, connections
→ Gear & Tools – Machines, software, setups
→ Audio Lab – Spaces to experiment with sound

Visit: https://techno.dog

HOW YOU CAN HELP
Add local scenes and stories, share materials, connect others who hold knowledge.

"If this platform can quietly help people understand where we've come from, see where we are, and imagine what's next, it will be doing its job."

Thanks for taking the time.

— Alex
techno.dog / LA PIPA
    `;

    const subject = isTest 
      ? "[TEST] A Quiet Launch for Techno.Dog"
      : "A Quiet Launch for Techno.Dog";

    console.log(`Sending launch announcement to: ${to} (test: ${isTest})`);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Alex @ Techno.Dog <doggy@techno.dog>",
        reply_to: "doggy@techno.dog",
        to: [to],
        subject: subject,
        html: htmlContent,
        text: textContent,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Resend API error:", errorText);
      throw new Error(`Resend API error: ${res.status}`);
    }

    const emailResponse = await res.json();
    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        id: emailResponse.id,
        to: to,
        isTest: isTest 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error sending launch announcement:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
