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
    const testBanner = isTest ? `
      <tr>
        <td style="background-color: #dc2626; padding: 12px; text-align: center;">
          <span style="color: #ffffff; font-size: 11px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase; font-family: 'Courier New', Consolas, monospace;">⚠️ TEST EMAIL – NOT FOR PRODUCTION ⚠️</span>
        </td>
      </tr>` : '';

    // Three-color design system: White (#ffffff), Red (#dc2626), Green (#39ff14)
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>A Quiet Launch for Techno.Dog</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Courier New', Consolas, monospace;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a;">
          ${testBanner}
          
          <!-- Hero Section with Image -->
          <tr>
            <td style="padding: 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 640px; margin: 0 auto; background-color: #0a0a0a;">
                <!-- Tricolor accent line -->
                <tr>
                  <td style="height: 2px; background: linear-gradient(to right, #dc2626, #39ff14, transparent);"></td>
                </tr>
                
                <!-- Hero Image Banner -->
                <tr>
                  <td style="padding: 0; position: relative;">
                    <div style="position: relative; background-color: #0a0a0a; padding: 40px 24px;">
                      <!-- Title over image area -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td>
                            <span style="color: #dc2626; font-size: 10px; letter-spacing: 4px; text-transform: uppercase; font-family: 'Courier New', Consolas, monospace;">// ANNOUNCEMENT</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-top: 16px;">
                            <h1 style="color: #ffffff; font-size: 32px; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 1px; line-height: 1.2; font-family: 'Courier New', Consolas, monospace;">
                              A Quiet Launch for<br/>
                              <span style="color: #39ff14;">Techno.Dog</span>
                            </h1>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-top: 16px;">
                            <span style="color: #dc2626; font-size: 11px; font-family: 'Courier New', Consolas, monospace;">By Alex</span>
                            <span style="color: #39ff14; margin: 0 8px;">|</span>
                            <span style="color: #666666; font-size: 11px; font-family: 'Courier New', Consolas, monospace;">December 2025</span>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
                
                <!-- Bottom tricolor border -->
                <tr>
                  <td style="height: 2px; background: linear-gradient(to right, #dc2626, #39ff14, transparent);"></td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
                
                <!-- Greeting -->
                <tr>
                  <td style="padding-bottom: 24px;">
                    <p style="color: #ffffff; font-size: 15px; line-height: 1.7; margin: 0; font-family: 'Courier New', Consolas, monospace;">
                      ${greeting}
                    </p>
                  </td>
                </tr>

                <!-- Intro -->
                <tr>
                  <td style="padding-bottom: 20px;">
                    <p style="color: #b0b0b0; font-size: 15px; line-height: 1.8; margin: 0; font-family: 'Courier New', Consolas, monospace;">
                      Today we're opening <strong style="color: #39ff14;">techno.dog</strong> – a public, growing archive of global techno culture. It's a first version, built with limited resources, by hand, with what I know and what I've lived so far.
                    </p>
                  </td>
                </tr>

                <!-- Quote Block - Green accent -->
                <tr>
                  <td style="padding: 24px 0;">
                    <div style="border-left: 3px solid #39ff14; padding-left: 20px; background: linear-gradient(to right, rgba(57,255,20,0.05), transparent);">
                      <p style="color: #ffffff; font-size: 15px; line-height: 1.6; margin: 0; font-style: italic; font-family: 'Courier New', Consolas, monospace;">
                        "From now on, it's meant to be shaped by all of us."
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Why This Exists Section -->
                <tr>
                  <td style="padding-top: 24px; padding-bottom: 12px;">
                    <h2 style="color: #ffffff; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; margin: 0; font-family: 'Courier New', Consolas, monospace; border-bottom: 1px solid rgba(220,38,38,0.5); padding-bottom: 8px;">
                      <span style="color: #dc2626; margin-right: 8px;">//</span>Why This Exists
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 16px;">
                    <p style="color: #b0b0b0; font-size: 14px; line-height: 1.8; margin: 0; font-family: 'Courier New', Consolas, monospace;">
                      For years I've watched something repeat itself in techno: parties come and go, venues open and close, crews and labels do amazing work then disappear from view. The scene is always moving. A lot of what's important ends up scattered across memories, hard drives, and dead links.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 24px;">
                    <p style="color: #b0b0b0; font-size: 14px; line-height: 1.8; margin: 0; font-family: 'Courier New', Consolas, monospace;">
                      <strong style="color: #ffffff;">Techno.dog</strong> is here to help keep track of the culture as it actually is today, knowing that what happens now is built on what came before.
                    </p>
                  </td>
                </tr>

                <!-- What You'll Find Section -->
                <tr>
                  <td style="padding-top: 24px; padding-bottom: 12px;">
                    <h2 style="color: #39ff14; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 0; font-family: 'Courier New', Consolas, monospace;">
                      <span style="color: #dc2626; margin-right: 4px;">›</span>What You'll Find
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 24px;">
                    <table cellpadding="0" cellspacing="0" style="width: 100%;">
                      <tr>
                        <td style="padding: 10px 0; color: #b0b0b0; font-size: 13px; font-family: 'Courier New', Consolas, monospace; border-left: 2px solid rgba(220,38,38,0.4); padding-left: 12px;">
                          <span style="color: #39ff14;">→</span> <strong style="color: #ffffff;">Culture Archive</strong> – Artists, festivals, venues, crews, labels
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #b0b0b0; font-size: 13px; font-family: 'Courier New', Consolas, monospace; border-left: 2px solid rgba(220,38,38,0.4); padding-left: 12px;">
                          <span style="color: #39ff14;">→</span> <strong style="color: #ffffff;">Gear & Tools</strong> – Machines, software, setups producers use
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #b0b0b0; font-size: 13px; font-family: 'Courier New', Consolas, monospace; border-left: 2px solid rgba(220,38,38,0.4); padding-left: 12px;">
                          <span style="color: #39ff14;">→</span> <strong style="color: #ffffff;">Bookstore</strong> – Curated reading on techno history and culture
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #b0b0b0; font-size: 13px; font-family: 'Courier New', Consolas, monospace; border-left: 2px solid rgba(220,38,38,0.4); padding-left: 12px;">
                          <span style="color: #39ff14;">→</span> <strong style="color: #ffffff;">Documentaries</strong> – Films and deep dives into the scene
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #b0b0b0; font-size: 13px; font-family: 'Courier New', Consolas, monospace; border-left: 2px solid rgba(220,38,38,0.4); padding-left: 12px;">
                          <span style="color: #39ff14;">→</span> <strong style="color: #ffffff;">News</strong> – Stories, interviews, and updates from the underground
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #b0b0b0; font-size: 13px; font-family: 'Courier New', Consolas, monospace; border-left: 2px solid rgba(220,38,38,0.4); padding-left: 12px;">
                          <span style="color: #39ff14;">→</span> <strong style="color: #ffffff;">Audio Lab</strong> – Spaces to experiment with sound
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Primary CTA Button - Green -->
                <tr>
                  <td style="padding: 32px 0; text-align: center;">
                    <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                      <tr>
                        <td style="background-color: #39ff14; padding: 16px 40px;">
                          <a href="https://techno.dog" target="_blank" style="color: #000000; text-decoration: none; font-size: 13px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase; font-family: 'Courier New', Consolas, monospace;">
                            Explore Techno.Dog →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding: 16px 0;">
                    <div style="height: 1px; background: linear-gradient(to right, transparent, #dc2626, #39ff14, transparent);"></div>
                  </td>
                </tr>

                <!-- How You Can Help Section - Red accent for CTA -->
                <tr>
                  <td style="padding-top: 24px; padding-bottom: 12px;">
                    <h2 style="color: #ffffff; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; margin: 0; font-family: 'Courier New', Consolas, monospace; border-bottom: 1px solid rgba(220,38,38,0.5); padding-bottom: 8px;">
                      <span style="color: #dc2626; margin-right: 8px;">//</span>How You Can Help
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 20px;">
                    <p style="color: #b0b0b0; font-size: 14px; line-height: 1.8; margin: 0; font-family: 'Courier New', Consolas, monospace;">
                      If this resonates, there are simple ways to contribute:
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 24px;">
                    <table cellpadding="0" cellspacing="0" style="width: 100%;">
                      <tr>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 13px; font-family: 'Courier New', Consolas, monospace;">
                          <span style="color: #dc2626; font-weight: bold;">01.</span> Add local scenes, stories, and history
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 13px; font-family: 'Courier New', Consolas, monospace;">
                          <span style="color: #dc2626; font-weight: bold;">02.</span> Share old materials, flyers, photos, recordings
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 13px; font-family: 'Courier New', Consolas, monospace;">
                          <span style="color: #dc2626; font-weight: bold;">03.</span> Connect others who hold knowledge
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 13px; font-family: 'Courier New', Consolas, monospace;">
                          <span style="color: #dc2626; font-weight: bold;">04.</span> Help shape the platform if you build things
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Secondary CTA - Red/Collaboration -->
                <tr>
                  <td style="padding: 24px 0; text-align: center;">
                    <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                      <tr>
                        <td style="background-color: #dc2626; padding: 16px 40px;">
                          <a href="https://techno.dog/contribute" target="_blank" style="color: #ffffff; text-decoration: none; font-size: 13px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase; font-family: 'Courier New', Consolas, monospace;">
                            Join the Project →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Closing Quote - Green border -->
                <tr>
                  <td style="padding: 32px 0;">
                    <div style="border-left: 3px solid #39ff14; padding-left: 20px; background: linear-gradient(to right, rgba(57,255,20,0.05), transparent);">
                      <p style="color: #ffffff; font-size: 14px; line-height: 1.7; margin: 0; font-style: italic; font-family: 'Courier New', Consolas, monospace;">
                        "If this platform can quietly help people understand where we've come from, see where we are, and imagine what's next, it will be doing its job."
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Signature -->
                <tr>
                  <td style="padding-top: 24px; padding-bottom: 32px;">
                    <p style="color: #ffffff; font-size: 14px; margin: 0; font-family: 'Courier New', Consolas, monospace;">Thanks for taking the time.</p>
                    <p style="color: #ffffff; font-size: 14px; margin: 20px 0 0 0; font-family: 'Courier New', Consolas, monospace;">— <span style="color: #dc2626;">Alex</span></p>
                    <p style="color: #666666; font-size: 11px; margin: 8px 0 0 0; font-family: 'Courier New', Consolas, monospace;">techno.dog / LA PIPA</p>
                  </td>
                </tr>

                <!-- Footer Divider -->
                <tr>
                  <td style="padding: 16px 0;">
                    <div style="height: 1px; background: linear-gradient(to right, #dc2626, #39ff14, transparent);"></div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding-top: 16px;">
                    <p style="color: #444444; font-size: 11px; margin: 0; line-height: 1.6; font-family: 'Courier New', Consolas, monospace;">
                      You're receiving this because you're part of the techno community we respect and want to share this with.
                    </p>
                    <p style="color: #444444; font-size: 11px; margin: 16px 0 0 0; font-family: 'Courier New', Consolas, monospace;">
                      <a href="https://techno.dog" style="color: #39ff14; text-decoration: none;">techno.dog</a> — The Global Techno Knowledge Hub
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
// TECHNO.DOG — A QUIET LAUNCH

${greeting}

Today we're opening techno.dog – a public, growing archive of global techno culture. It's a first version, built with limited resources, by hand, with what I know and what I've lived so far.

"From now on, it's meant to be shaped by all of us."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// WHY THIS EXISTS

For years I've watched something repeat itself in techno: parties come and go, venues open and close, crews and labels do amazing work then disappear from view. The scene is always moving. A lot of what's important ends up scattered across memories, hard drives, and dead links.

Techno.dog is here to help keep track of the culture as it actually is today, knowing that what happens now is built on what came before.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

› WHAT YOU'LL FIND

→ Culture Archive – Artists, festivals, venues, crews, labels
→ Gear & Tools – Machines, software, setups producers use
→ Bookstore – Curated reading on techno history and culture
→ Documentaries – Films and deep dives into the scene
→ News – Stories, interviews, and updates from the underground
→ Audio Lab – Spaces to experiment with sound

▶ EXPLORE: https://techno.dog

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// HOW YOU CAN HELP

If this resonates, there are simple ways to contribute:

01. Add local scenes, stories, and history
02. Share old materials, flyers, photos, recordings
03. Connect others who hold knowledge
04. Help shape the platform if you build things

▶ JOIN THE PROJECT: https://techno.dog/contribute

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"If this platform can quietly help people understand where we've come from, see where we are, and imagine what's next, it will be doing its job."

Thanks for taking the time.

— Alex
techno.dog / LA PIPA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You're receiving this because you're part of the techno community we respect.
https://techno.dog — The Global Techno Knowledge Hub
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
