/**
 * Creative Studio Image Generator
 * 
 * Phase 3: Enhanced with scene/mood integration, Querodias inspiration,
 * and brand-aware prompt engineering.
 * 
 * BRAND COMPLIANCE:
 * - Uses brand book aesthetics (READ-ONLY)
 * - Only generates imagery consistent with approved guidelines
 * - Techno Doggies: stroke-only on black, Green/White line ONLY
 * - techno.dog: VHS brutalist, NO dog imagery
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

// Color line styling (from brand book - NEVER MODIFY)
const COLOR_LINE_PROMPTS: Record<string, string> = {
  'green-line': 'laser green (#00FF00) glowing stroke lines, neon green outline, no fill, pure stroke art',
  'white-line': 'pure white stroke lines, clean white outline, no fill, minimal stroke art',
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
    } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Build brand-specific visual prompt
    let brandStyle = '';
    if (brandBook === 'techno-dog') {
      brandStyle = `VHS aesthetic, brutalist design, dark moody lighting, industrial vibes, 
geometric shapes, glitch effects, scanlines overlay, retro CRT monitor feel, 
NO dog imagery, hexagon logo only, crimson and black color palette, 
The Face magazine editorial quality, 90s London underground style`;
    } else {
      // Techno Doggies - stroke only, brand compliant
      const colorStyle = colorLine && COLOR_LINE_PROMPTS[colorLine] 
        ? COLOR_LINE_PROMPTS[colorLine] 
        : COLOR_LINE_PROMPTS['green-line'];
      
      brandStyle = `Black fabric product mockup, ${colorStyle}, 
stroke-only dog silhouette (NO fills, NO gradients), clean minimal streetwear photography,
${mascot ? `featuring ${mascot} variant silhouette, ` : ''}
London editorial style, premium streetwear aesthetic, underground techno culture,
inspired by Querodias Las Querodiaz artwork style - clean lines, bold strokes`;
    }

    // Add scene context if provided
    const sceneStyle = scenePreset && SCENE_AESTHETICS[scenePreset]
      ? `. Scene inspiration: ${SCENE_AESTHETICS[scenePreset]}`
      : '';

    // Add product-specific context
    const productContext = productType 
      ? `. Product type: ${productType}, placement: ${placement || 'center chest'}`
      : '';

    const enhancedPrompt = `${prompt}. ${brandStyle}${sceneStyle}${productContext}. 
Professional product photography, ultra high resolution, magazine quality editorial shot.
16:9 aspect ratio, studio lighting with dramatic shadows.`;

    console.log('Enhanced prompt:', enhancedPrompt.substring(0, 500));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
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
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      throw new Error("No image generated");
    }

    return new Response(JSON.stringify({ 
      imageUrl,
      promptUsed: enhancedPrompt.substring(0, 200) + '...',
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
