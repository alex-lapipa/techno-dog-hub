/**
 * Creative Studio Editorial Generator
 * 
 * Phase 5: Multi-model routing + Technopedia RAG context
 * Generates brand-compliant product copy using the Lovable AI Gateway.
 * 
 * MODEL ROUTING:
 * - Accepts selectedModels from frontend
 * - Routes to appropriate model based on selection
 * - Mixer mode blends creative styles
 * 
 * BRAND COMPLIANCE:
 * - Uses brand book guidelines (read-only)
 * - Never modifies brand assets
 * - Only uses approved mascots from the 94-variant pack
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  getTextModelConfig, 
  getMixerPromptPrefix, 
  getModelsSummary 
} from "../_shared/creative-model-router.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Scene/mood keywords mapping (from knowledge base)
const SCENE_CONTEXT: Record<string, string> = {
  'berlin-warehouse': 'Industrial Berlin warehouse aesthetic - concrete walls, strobe lights, relentless 4/4 beats. Think Berghain, Tresor, ://about blank. Minimal, functional, brutalist.',
  'detroit-origins': 'Detroit techno origins - Afrofuturism, machine soul, Juan Atkins, Derrick May, Kevin Saunderson. The Belleville Three legacy. Futuristic yet raw.',
  'london-underground': 'London underground rave culture - acid house, squat parties, pirate radio. 303s, 808s, warehouse vibes. The Second Summer of Love energy.',
  'late-night-ritual': 'Peak-time late night ritual - hypnotic loops, driving rhythms, the 4am sweet spot. Lost in the loop, surrendered to the beat.',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      concept, 
      brandBook, 
      mascot, 
      mascotPersonality, 
      productType, 
      placement,
      colorLine,
      knowledgeContext,
      selectedModels = ['gemini'], // Default to gemini
    } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Get model configuration with routing
    const modelConfig = getTextModelConfig(selectedModels);
    const mixerPrefix = getMixerPromptPrefix(selectedModels);
    
    console.log(`[Creative Studio Editorial] Models: ${getModelsSummary(selectedModels)}, Using: ${modelConfig.model}, Mixer: ${modelConfig.mixer}`);

    // Build brand-specific guidelines (READ-ONLY from brand book)
    const brandGuidelines = brandBook === 'techno-dog' 
      ? `- VHS/Brutalist aesthetic, dark backgrounds, minimal design
- Use geometric hexagon logo only - NO dog imagery allowed
- Always lowercase "techno.dog"
- Colors: crimson, black, white
- Editorial tone: The Face magazine, '90s London editorial
- Target: Underground techno purists, vinyl collectors`
      : `- 94-variant Techno Talkies mascot pack ONLY
- Stroke-only graphics on black fabric (ZERO TOLERANCE for fills)
- Colors: ${colorLine === 'white-line' ? 'White Line (pure white strokes)' : 'Green Line (#00FF00 laser green strokes)'}
- No gradients, no custom dog designs
- Editorial tone: Streetwear drops, limited edition culture
- Target: Scene insiders, techno heads, rave culture`;

    // Build Technopedia context
    let technopediaContext = '';
    if (knowledgeContext) {
      const parts: string[] = [];
      
      // Scene/mood integration
      if (knowledgeContext.selectedScene && SCENE_CONTEXT[knowledgeContext.selectedScene]) {
        parts.push(`SCENE INSPIRATION: ${SCENE_CONTEXT[knowledgeContext.selectedScene]}`);
      }
      
      // Artist context
      if (knowledgeContext.artists?.length > 0) {
        const artistNames = knowledgeContext.artists.map((a: any) => 
          `${a.name}${a.knownFor ? ` (${a.knownFor})` : ''}`
        ).join(', ');
        parts.push(`ARTIST REFERENCES: ${artistNames}`);
      }
      
      // Gear context
      if (knowledgeContext.gear?.length > 0) {
        const gearNames = knowledgeContext.gear.map((g: any) => 
          `${g.name} by ${g.manufacturer || 'Unknown'}`
        ).join(', ');
        parts.push(`GEAR/EQUIPMENT INSPIRATION: ${gearNames}`);
      }

      if (parts.length > 0) {
        technopediaContext = `\n\nTECHNOPEDIA CONTEXT (use for authentic references):\n${parts.join('\n')}`;
      }
    }

    const systemPrompt = `${mixerPrefix}You are a creative director for ${brandBook === 'techno-dog' ? 'techno.dog' : 'Techno Doggies'}, a premium underground techno merchandise brand.

BRAND BOOK GUIDELINES (STRICT - NEVER DEVIATE):
${brandGuidelines}

DESIGN PHILOSOPHY:
- Authenticity over hype
- Underground credibility is everything
- Less is more - minimal, impactful design
- Every piece tells a story from the scene${technopediaContext}

Generate editorial content that feels authentic to the underground techno scene. Think '90s London editorial, The Face magazine aesthetic. The copy should resonate with people who've spent nights on dark dancefloors.`;

    const userPrompt = `Create editorial copy for this product:
- Concept: ${concept}
- Product Type: ${productType || 'Apparel'}
- Placement: ${placement || 'Center'}
${colorLine ? `- Color Line: ${colorLine === 'white-line' ? 'White Line' : 'Green Line'}` : ''}
${mascot ? `- Mascot: ${mascot} (Personality: ${mascotPersonality})` : ''}

Return a JSON object with:
- productName: catchy product name (max 40 chars) - must feel underground, not corporate
- tagline: short punchy tagline (max 80 chars) - could work as a club flyer headline
- description: product description for store (2-3 sentences) - editorial magazine quality
- creativeRationale: the thinking behind the design (2-3 sentences) - reference the scene authentically
- targetAudience: who this is for (1 sentence) - be specific about the techno subculture`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelConfig.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: modelConfig.temperature,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
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

    return new Response(JSON.stringify({ 
      editorial,
      modelUsed: modelConfig.model,
      mixerEnabled: modelConfig.mixer,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Creative Studio Editorial Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
