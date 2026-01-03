import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Techno Doggies collection data with SVG paths and quotes
const technoDoggies = {
  dj: {
    name: "DJ DOGGY",
    quote: "Can hear requests but choosing not to",
    tagline: "SELECTOR · MIXING · PEAK TIME",
    svgPath: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#39FF14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <path d="M16 32 Q12 22 18 16 Q22 18 24 26" />
        <path d="M48 32 Q52 22 46 16 Q42 18 40 26" />
        <ellipse cx="32" cy="38" rx="16" ry="14" />
        <path d="M24 34 Q26 30 28 34" />
        <path d="M36 34 Q38 30 40 34" />
        <ellipse cx="32" cy="42" rx="3" ry="2.5" fill="#39FF14" />
        <path d="M26 48 Q32 52 38 48" />
        <path d="M12 28 Q8 20 16 14" />
        <path d="M52 28 Q56 20 48 14" />
        <ellipse cx="12" cy="32" rx="4" ry="6" fill="#39FF14" opacity="0.3" />
        <ellipse cx="52" cy="32" rx="4" ry="6" fill="#39FF14" opacity="0.3" />
        <path d="M12 26 Q32 18 52 26" />
      </g>
    </svg>`,
  },
  raving: {
    name: "RAVING DOGGY",
    quote: "Peak time is not a time, it's a lifestyle",
    tagline: "ALL NIGHT · NO REGRETS · MAXIMUM ENERGY",
    svgPath: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#39FF14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <path d="M18 26 Q16 10 22 8 Q26 12 26 22" />
        <path d="M46 26 Q48 10 42 8 Q38 12 38 22" />
        <ellipse cx="32" cy="36" rx="16" ry="14" />
        <circle cx="26" cy="32" r="4" stroke="#39FF14" stroke-width="2" fill="none"/>
        <circle cx="38" cy="32" r="4" stroke="#39FF14" stroke-width="2" fill="none"/>
        <circle cx="26" cy="32" r="2" fill="#39FF14"/>
        <circle cx="38" cy="32" r="2" fill="#39FF14"/>
        <ellipse cx="32" cy="40" rx="3" ry="2.5" fill="#39FF14" />
        <path d="M24 46 Q32 54 40 46" />
        <line x1="6" y1="20" x2="12" y2="26" stroke="#39FF14" opacity="0.6"/>
        <line x1="52" y1="26" x2="58" y2="20" stroke="#39FF14" opacity="0.6"/>
        <line x1="4" y1="32" x2="10" y2="32" stroke="#39FF14" opacity="0.4"/>
        <line x1="54" y1="32" x2="60" y2="32" stroke="#39FF14" opacity="0.4"/>
      </g>
    </svg>`,
  },
  ninja: {
    name: "NINJA DOGGY",
    quote: "Nobody saw me enter or leave",
    tagline: "STEALTH · SHADOW · SILENT SELECTOR",
    svgPath: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#39FF14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <path d="M16 28 Q12 18 18 12 Q22 14 24 22" />
        <path d="M48 28 Q52 18 46 12 Q42 14 40 22" />
        <ellipse cx="32" cy="36" rx="16" ry="14" />
        <rect x="18" y="30" width="28" height="8" fill="#0a0a0a" stroke="none"/>
        <path d="M18 30 L46 30" stroke="#39FF14"/>
        <path d="M18 38 L46 38" stroke="#39FF14"/>
        <path d="M24 32 Q26 30 28 34" stroke="#39FF14"/>
        <path d="M36 32 Q38 30 40 34" stroke="#39FF14"/>
        <path d="M50 26 L58 20" stroke="#39FF14" opacity="0.4"/>
        <path d="M52 32 L60 30" stroke="#39FF14" opacity="0.3"/>
      </g>
    </svg>`,
  },
  space: {
    name: "SPACE DOGGY",
    quote: "Orbiting the dancefloor at 140 BPM",
    tagline: "COSMIC · ORBITAL · INTERSTELLAR BEATS",
    svgPath: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#39FF14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <ellipse cx="32" cy="36" rx="20" ry="18" stroke="#39FF14" opacity="0.3"/>
        <path d="M16 28 Q12 18 18 12 Q22 14 24 22" />
        <path d="M48 28 Q52 18 46 12 Q42 14 40 22" />
        <ellipse cx="32" cy="36" rx="16" ry="14" />
        <circle cx="26" cy="32" r="3" fill="#39FF14" opacity="0.3"/>
        <circle cx="38" cy="32" r="3" fill="#39FF14" opacity="0.3"/>
        <circle cx="26" cy="32" r="1.5" fill="#39FF14"/>
        <circle cx="38" cy="32" r="1.5" fill="#39FF14"/>
        <ellipse cx="32" cy="40" rx="3" ry="2.5" fill="#39FF14" />
        <path d="M26 46 Q32 50 38 46" />
        <circle cx="10" cy="14" r="1" fill="#39FF14" opacity="0.5"/>
        <circle cx="54" cy="10" r="1.5" fill="#39FF14" opacity="0.4"/>
        <circle cx="58" cy="44" r="1" fill="#39FF14" opacity="0.6"/>
        <circle cx="6" cy="48" r="0.8" fill="#39FF14" opacity="0.3"/>
      </g>
    </svg>`,
  },
  grumpy: {
    name: "GRUMPY DOGGY",
    quote: "Your taste in techno is statistically mid",
    tagline: "JUDGING · UNIMPRESSED · DISCERNING",
    svgPath: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#39FF14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <path d="M16 30 Q14 22 18 16 Q22 18 24 24" />
        <path d="M48 30 Q50 22 46 16 Q42 18 40 24" />
        <ellipse cx="32" cy="36" rx="16" ry="14" />
        <path d="M22 28 L28 30" />
        <path d="M36 30 L42 28" />
        <circle cx="26" cy="34" r="2" />
        <circle cx="38" cy="34" r="2" />
        <ellipse cx="32" cy="40" rx="3" ry="2.5" fill="#39FF14" />
        <path d="M28 48 Q32 44 36 48" />
      </g>
    </svg>`,
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const { doggyKey, productType } = await req.json();
    
    const doggy = technoDoggies[doggyKey as keyof typeof technoDoggies];
    if (!doggy) {
      throw new Error(`Unknown doggy: ${doggyKey}`);
    }

    // Determine product-specific styling
    const productStyles: Record<string, string> = {
      cap: "snapback cap, side angle view, black cotton fabric, embroidered design",
      tee: "t-shirt flat lay, 100% cotton, high quality print on front",
      hoodie: "premium hoodie, heavyweight cotton, screen print on front",
    };

    const productStyle = productStyles[productType] || productStyles.tee;
    
    // Generate product mockup with AI
    const prompt = `Create a professional product photograph of a ${productStyle} with this exact design:

A minimalist, high-contrast design featuring:
- Large stylized dog icon in neon green (#39FF14) - a cute techno/DJ dog character with pointed ears
- Bold text: "${doggy.name}" in uppercase blocky techno font
- Quote text below: "${doggy.quote}" in smaller italic font
- Tagline: "${doggy.tagline}" in very small mono font
- Black background, neon green (#39FF14) as the only accent color
- VHS scan lines or glitch effect subtly overlaid
- Dark industrial aesthetic, Berlin techno club vibes

The design should look like authentic underground techno merch - raw, bold, minimal. 
Product shot on pure black background, studio lighting, fashion photography style.
16:9 aspect ratio, ultra high resolution, professional e-commerce product photo.`;

    console.log(`Generating ${productType} image for ${doggy.name}...`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const imageUrl = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error("No image generated");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl,
        doggy: doggy.name,
        productType,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating image:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
