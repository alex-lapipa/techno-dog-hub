import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { concept, brandBook, mascot, mascotPersonality, productType, placement } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = `You are a creative director for ${brandBook === 'techno-dog' ? 'techno.dog' : 'Techno Doggies'}, a premium underground techno merchandise brand.

Brand Guidelines:
${brandBook === 'techno-dog' 
  ? '- VHS/Brutalist aesthetic, dark backgrounds, minimal design\n- Use geometric hexagon logo only - NO dog imagery\n- Always lowercase "techno.dog"\n- Colors: crimson, black, white'
  : '- 94-variant Techno Talkies mascot pack\n- Stroke-only graphics on black fabric\n- Colors: Green Line (#00FF00) or White Line only\n- Zero tolerance for non-approved mascots'}

Generate editorial content that feels authentic to the underground techno scene. Think '90s London editorial, The Face magazine aesthetic.`;

    const userPrompt = `Create editorial copy for this product:
- Concept: ${concept}
- Product Type: ${productType || 'Apparel'}
- Placement: ${placement || 'Center'}
${mascot ? `- Mascot: ${mascot} (${mascotPersonality})` : ''}

Return a JSON object with:
- productName: catchy product name (max 40 chars)
- tagline: short punchy tagline (max 80 chars)
- description: product description for store (2-3 sentences)
- creativeRationale: the thinking behind the design (2-3 sentences)
- targetAudience: who this is for (1 sentence)`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const editorial = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      productName: "Untitled Product",
      tagline: "",
      description: content,
      creativeRationale: "",
      targetAudience: "Underground techno enthusiasts",
    };

    return new Response(JSON.stringify({ editorial }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
