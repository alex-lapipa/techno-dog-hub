/**
 * Creative Studio Image Generator
 * 
 * Phase 5: Multi-model routing + ZERO HALLUCINATION enforcement
 * 
 * BRAND COMPLIANCE - ZERO TOLERANCE:
 * - Techno Doggies: generates BLANK product photo (mascot composited client-side)
 * - techno.dog: VHS brutalist, NO dog imagery
 * 
 * MODEL ROUTING:
 * - Accepts selectedModels from frontend
 * - Routes to appropriate Lovable AI Gateway model
 * - Falls back gracefully if model unavailable
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  getCreativeModelConfig, 
  getMixerPromptPrefix, 
  getModelsSummary 
} from "../_shared/creative-model-router.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Scene aesthetic mappings for prompt enhancement
const SCENE_AESTHETICS: Record<string, string> = {
  'berlin-warehouse': 'industrial concrete warehouse, strobe lights cutting through haze, brutalist architecture, Berghain vibes, dark ambient lighting',
  'detroit-origins': 'futuristic Detroit cityscape, retro-futurism, machine soul aesthetic, neon on dark, Juan Atkins era electronics',
  'london-underground': 'London underground rave, acid house era, warehouse party, pirate radio vibes, 90s street culture',
  'late-night-ritual': 'dark club environment, hypnotic atmosphere, 4am energy, laser green accents on black, minimal lighting',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      prompt, 
      brandBook, 
      productType,
      colorLine,
      mascot,
      scenePreset,
      placement,
      selectedModels = ['gemini'], // Default to gemini
    } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Get model configuration with routing
    const modelConfig = getCreativeModelConfig(selectedModels, true);
    const mixerPrefix = getMixerPromptPrefix(selectedModels);
    
    console.log(`[Creative Studio Image] Models: ${getModelsSummary(selectedModels)}, Using: ${modelConfig.resolvedModel}, Mixer: ${modelConfig.mixer}`);

    let enhancedPrompt = '';
    
    // Build brand-specific visual prompt with ZERO HALLUCINATION enforcement
    if (brandBook === 'techno-dog') {
      // techno.dog brand - NO dog imagery
      enhancedPrompt = `${mixerPrefix}${prompt}. 
VHS aesthetic, brutalist design, dark moody lighting, industrial vibes, 
geometric shapes, glitch effects, scanlines overlay, retro CRT monitor feel, 
NO dog imagery, hexagon logo only, crimson and black color palette, 
The Face magazine editorial quality, 90s London underground style.
Product type: ${productType || 'apparel'}, placement: ${placement || 'center'}.
Professional product photography, ultra high resolution, magazine quality editorial shot.
16:9 aspect ratio, studio lighting with dramatic shadows.`;
    } else if (brandBook === 'techno-doggies') {
      // Techno Doggies brand - ZERO TOLERANCE
      // CRITICAL RULE: The AI must NEVER draw mascots or text on the product.
      // We ONLY generate a blank product mockup photo; the client composites the official SVG pack.
      const strokeColor = colorLine === 'green-line'
        ? 'laser green (#00FF00) stroke ONLY'
        : 'pure white (#FFFFFF) stroke ONLY';

      enhancedPrompt = `${mixerPrefix}ZERO TOLERANCE - BLANK PRODUCT MOCKUP ONLY:

Product: ${productType || 'apparel'} mockup on BLACK fabric
Placement reference: ${placement || 'front'}

CRITICAL (must follow):
1. NO printed graphics on the product
2. NO logo
3. NO mascot / dog icon
4. NO text / numbers / lettering
5. NO patches / embroidery / decals
6. Keep the garment completely blank

NOTE: Official mascot + text will be composited separately in ${strokeColor}.

Style: Premium streetwear product photography, The Face magazine editorial, 90s London underground mood.
Lighting: professional studio, dark and moody.

${prompt || ''}`;
    } else {
      // Fallback (shouldn't happen in this project)
      enhancedPrompt = `${mixerPrefix}${prompt || ''}. Professional product photography, ultra high resolution.`;
    }

    // Add scene context if provided
    if (scenePreset && SCENE_AESTHETICS[scenePreset]) {
      enhancedPrompt += ` Scene inspiration: ${SCENE_AESTHETICS[scenePreset]}`;
    }

    console.log('Zero-Hallucination Prompt (first 600 chars):', enhancedPrompt.substring(0, 600));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelConfig.resolvedModel,
        messages: [{ role: "user", content: enhancedPrompt }],
        modalities: ["image", "text"],
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
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      console.error('No image in response:', JSON.stringify(data).substring(0, 500));
      throw new Error("No image generated");
    }

    return new Response(JSON.stringify({ 
      imageUrl,
      promptUsed: enhancedPrompt.substring(0, 300) + '...',
      mascotEnforced: mascot || 'default',
      zeroHallucination: true,
      modelUsed: modelConfig.resolvedModel,
      mixerEnabled: modelConfig.mixer,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Creative Studio Image Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
