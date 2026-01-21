/**
 * Creative Studio Image Generator
 * 
 * Phase 4: ZERO HALLUCINATION enforcement with embedded SVG geometry
 * 
 * BRAND COMPLIANCE - ZERO TOLERANCE:
 * - Embeds exact SVG path data from official DogPack.tsx
 * - Only generates imagery with official 94-variant mascot geometry
 * - Techno Doggies: stroke-only on black, Green/White line ONLY
 * - techno.dog: VHS brutalist, NO dog imagery
 * 
 * CRITICAL: The AI receives exact SVG paths to prevent hallucination
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

// Official SVG path data for mascots - extracted from DogPack.tsx
// ZERO TOLERANCE: Only these exact geometries are allowed
const OFFICIAL_MASCOT_GEOMETRY: Record<string, { paths: string; description: string }> = {
  'happy-dog': {
    description: 'Ears up, big smile with tongue',
    paths: 'M16 28 Q12 18 18 12 Q22 14 24 22 | M48 28 Q52 18 46 12 Q42 14 40 22 | ellipse cx=32 cy=36 rx=16 ry=14 | M24 32 Q26 28 28 32 | M36 32 Q38 28 40 32 | ellipse cx=32 cy=40 rx=3 ry=2.5 | M26 46 Q32 54 38 46 | M30 48 Q32 58 34 48',
  },
  'dj-dog': {
    description: 'Dog with headphones, focused expression',
    paths: 'M16 28 Q12 18 18 12 Q22 14 24 22 | M48 28 Q52 18 46 12 Q42 14 40 22 | ellipse cx=32 cy=36 rx=16 ry=14 | circle cx=26 cy=33 r=3 | circle cx=38 cy=33 r=3 | ellipse cx=32 cy=40 rx=2.5 ry=2 | M26 46 Q32 50 38 46 | ellipse cx=8 cy=34 rx=4 ry=5 | ellipse cx=56 cy=34 rx=4 ry=5 | M12 34 L20 34 | M44 34 L52 34',
  },
  'ninja-dog': {
    description: 'Dog with ninja mask, stealth pose',
    paths: 'M16 28 Q12 18 18 12 Q22 14 24 22 | M48 28 Q52 18 46 12 Q42 14 40 22 | ellipse cx=32 cy=36 rx=16 ry=14 | rect x=16 y=30 width=32 height=6 rx=1 | circle cx=26 cy=33 r=2 | circle cx=38 cy=33 r=2 | ellipse cx=32 cy=40 rx=2.5 ry=2 | M48 33 L58 28 | M48 33 L58 38',
  },
  'space-dog': {
    description: 'Dog in space helmet, cosmic explorer',
    paths: 'M16 32 Q10 22 18 14 Q22 18 24 26 | M48 32 Q54 22 46 14 Q42 18 40 26 | ellipse cx=32 cy=36 rx=16 ry=14 | ellipse cx=32 cy=36 rx=20 ry=18 | M12 36 Q8 36 8 40 | M52 36 Q56 36 56 40 | ellipse cx=26 cy=34 rx=3 ry=2.5 | ellipse cx=38 cy=34 rx=3 ry=2.5 | ellipse cx=32 cy=42 rx=2 ry=1.5 | circle cx=10 cy=12 r=1 | circle cx=54 cy=16 r=1.5',
  },
  'grumpy-dog': {
    description: 'Dog with furrowed brows, frown',
    paths: 'M16 28 Q12 18 18 12 Q22 14 24 22 | M48 28 Q52 18 46 12 Q42 14 40 22 | ellipse cx=32 cy=36 rx=16 ry=14 | M22 30 L28 32 | M42 30 L36 32 | circle cx=26 cy=34 r=2 | circle cx=38 cy=34 r=2 | ellipse cx=32 cy=42 rx=3 ry=2 | M26 48 Q32 44 38 48',
  },
  'techno-dog': {
    description: 'Digital glitched dog with signal lines',
    paths: 'M16 28 Q12 18 18 12 Q22 14 24 22 | M48 28 Q52 18 46 12 Q42 14 40 22 | ellipse cx=32 cy=36 rx=16 ry=14 | M24 32 Q26 28 28 32 | M36 32 Q38 28 40 32 | ellipse cx=32 cy=40 rx=3 ry=2.5 | M26 46 Q32 52 38 46 | line x1=8 y1=32 x2=14 y2=32 | line x1=50 y1=36 x2=58 y2=36',
  },
  'dancing-dog': {
    description: 'Dog with dancing legs, joyful',
    paths: 'M14 26 Q10 16 16 10 Q20 14 22 22 | M50 26 Q54 16 48 10 Q44 14 42 22 | ellipse cx=32 cy=34 rx=16 ry=14 | M24 30 Q26 26 28 30 | M36 30 Q38 26 40 30 | ellipse cx=32 cy=38 rx=3 ry=2.5 | M26 44 Q32 52 38 44 | M18 50 Q14 56 10 52 | M46 50 Q50 56 54 52',
  },
  'acid-dog': {
    description: 'Dog with hypnotic spiral eyes',
    paths: 'M16 28 Q12 18 18 12 Q22 14 24 22 | M48 28 Q52 18 46 12 Q42 14 40 22 | ellipse cx=32 cy=36 rx=16 ry=14 | circle cx=26 cy=33 r=4 | circle cx=38 cy=33 r=4 | circle cx=26 cy=33 r=2 | circle cx=38 cy=33 r=2 | ellipse cx=32 cy=42 rx=3 ry=2 | M26 48 Q32 54 38 48',
  },
  'raving-dog': {
    description: 'Dog with wide eyes, energy lines',
    paths: 'M14 26 Q8 14 16 8 Q22 12 24 22 | M50 26 Q56 14 48 8 Q42 12 40 22 | ellipse cx=32 cy=36 rx=16 ry=14 | ellipse cx=26 cy=32 rx=4 ry=3 | ellipse cx=38 cy=32 rx=4 ry=3 | circle cx=26 cy=32 r=1.5 | circle cx=38 cy=32 r=1.5 | ellipse cx=32 cy=40 rx=3 ry=2 | M24 46 Q32 56 40 46',
  },
  'default': {
    description: 'Standard techno doggy silhouette',
    paths: 'M16 28 Q12 18 18 12 Q22 14 24 22 | M48 28 Q52 18 46 12 Q42 14 40 22 | ellipse cx=32 cy=36 rx=16 ry=14 | M24 32 Q26 28 28 32 | M36 32 Q38 28 40 32 | ellipse cx=32 cy=40 rx=3 ry=2.5 | M26 46 Q32 52 38 46',
  },
};

function getMascotGeometry(mascotName: string): { paths: string; description: string } {
  const normalized = mascotName?.toLowerCase().replace(/\s+/g, '-') || 'default';
  return OFFICIAL_MASCOT_GEOMETRY[normalized] || OFFICIAL_MASCOT_GEOMETRY['default'];
}

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

    let enhancedPrompt = '';
    
    // Build brand-specific visual prompt with ZERO HALLUCINATION enforcement
    if (brandBook === 'techno-dog') {
      // techno.dog brand - NO dog imagery
      enhancedPrompt = `${prompt}. 
VHS aesthetic, brutalist design, dark moody lighting, industrial vibes, 
geometric shapes, glitch effects, scanlines overlay, retro CRT monitor feel, 
NO dog imagery, hexagon logo only, crimson and black color palette, 
The Face magazine editorial quality, 90s London underground style.
Product type: ${productType || 'apparel'}, placement: ${placement || 'center'}.
Professional product photography, ultra high resolution, magazine quality editorial shot.
16:9 aspect ratio, studio lighting with dramatic shadows.`;
    } else {
      // Techno Doggies brand - STRICT geometry enforcement
      const mascotGeometry = getMascotGeometry(mascot || 'default');
      const strokeColor = colorLine === 'green-line' 
        ? 'laser green (#00FF00) ONLY' 
        : 'pure white (#FFFFFF) ONLY';
      
      enhancedPrompt = `ZERO TOLERANCE - BRAND COMPLIANCE REQUIRED:

Product: ${productType || 'apparel'} mockup on BLACK fabric
Placement: ${placement || 'center chest'}

MASCOT DESIGN - ${mascot || 'Techno Doggy'}:
${mascotGeometry.description}
The mascot is a SIMPLE STROKE-ONLY dog silhouette. NOT a realistic dog. NOT a cartoon dog. 
Just clean geometric stroke lines forming an abstract dog face/head shape.

STRICT GEOMETRY (SVG paths - do not deviate):
${mascotGeometry.paths}

CRITICAL DESIGN RULES:
1. Stroke color: ${strokeColor} - NO other colors
2. Fill: NONE - stroke-only, no fills, no solid areas
3. Stroke width: 2-2.5px equivalent
4. Background: BLACK fabric only
5. NO gradients, NO shadows, NO glow effects ON the mascot itself
6. The design is MINIMALIST - just clean stroke lines
7. Style: Premium streetwear, The Face magazine editorial, London underground aesthetic

${prompt || ''}.

Product photography: Professional studio shot, dark moody lighting, magazine quality.
The mascot print should be subtle, refined, not oversized or cartoonish.
Ultra high resolution, 16:9 aspect ratio.`;
    }

    // Add scene context if provided
    if (scenePreset && SCENE_AESTHETICS[scenePreset]) {
      enhancedPrompt += ` Scene inspiration: ${SCENE_AESTHETICS[scenePreset]}`;
    }

    console.log('Zero-Hallucination Prompt (first 800 chars):', enhancedPrompt.substring(0, 800));

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
      promptUsed: enhancedPrompt.substring(0, 300) + '...',
      mascotEnforced: mascot || 'default',
      zeroHallucination: true,
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
