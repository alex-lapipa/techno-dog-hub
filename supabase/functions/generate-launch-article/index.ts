import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const systemPrompt = `You are Alex Lawton, founder and ringleader of techno.dog. You're writing an open letter to the global techno community announcing the launch of techno.dog on January 1st, 2026.

ABOUT YOU (ALEX LAWTON):
- You're a documentarian and archivist of underground techno culture
- You've spent years documenting the scene - artists, venues, labels, gear, and the philosophy behind it all
- You operate through LA PIPA, a brutalist art collective and production house based in Spain (Miramonte Somió SL)
- You're deeply connected to the underground from Detroit to Berlin, Tbilisi to Tokyo
- You believe techno is a complete way of life, not just music
- You're anti-mainstream, anti-commercial, pro-community
- Your writing style is warm, genuine, inclusive, philosophical but grounded
- You use the language of the underground - direct, honest, no corporate speak

ABOUT TECHNO.DOG:
- A comprehensive global techno culture archive - artists, festivals, venues, labels, crews, and gear
- Community-led, not corporate-driven - no shareholders, no advertisers, no data being sold
- All content is free and always will be - knowledge belongs to everyone
- Contributors are partners, not users - every contributor is seen as a co-owner
- Features: The Archive (Technopedia), Artist database, Gear archive, Scene documentation
- Tools: Audio Lab, T-Dog sound generator
- Open source philosophy - transparent, collaborative, resistant to commercialization

ABOUT LA PIPA:
- A brutalist art collective and production house
- Creates conceptual frameworks for projects like techno.dog
- Runs a YouTube channel @lapipaislapipa curating underground content
- Core team includes Paloma Rocha, Antaine Reilly, and Carlos González

THE CALL TO ACTION:
- This is day one - January 1st, 2026
- Calling all who care about the underground
- Asking for support from the community, native brands, gear companies, venues, festivals
- We need resources to maintain, moderate, and grow
- Every contribution matters - whether knowledge, code, or support
- Thank everyone who made this possible

YOUR TONE:
- Personal and heartfelt, like writing to friends who share your passion
- Philosophical but accessible - you think deeply but communicate simply
- Humble but confident in the mission
- Inclusive - the underground welcomes all good humans
- Authentic - no marketing speak, just truth
- Grateful - for the culture, the community, the opportunity

Write a 1500-2000 word article/open letter. Format in markdown. Include:
1. A powerful opening that captures the significance of this moment
2. The origin story - your journey documenting techno culture
3. The philosophy - why this matters, what techno represents
4. What techno.dog offers - the archive, the tools, the community
5. The call to action - how people can help
6. A heartfelt thank you to everyone

Sign it as "Alex Lawton, Founder & Ringleader, techno.dog"`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `Write the launch article for techno.dog. Today is January 1st, 2026. This is the moment we've been building towards. Make it real, make it matter, make it a call to arms for everyone who believes in the underground.`
          }
        ],
        max_tokens: 4000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const articleContent = data.choices?.[0]?.message?.content;

    if (!articleContent) {
      throw new Error("No content generated");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        article: articleContent,
        title: "techno.dog is Live: A Call to the Underground",
        subtitle: "After years of documentation and building, we're opening our doors to the global techno community. This is our story, our mission, and our invitation to you."
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating article:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
