import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * TECHNO.DOG DESIGN SYSTEM GUIDELINES
 * ===================================
 * This edge function serves as the authoritative source for design consistency.
 * 
 * CRITICAL RULES - NEVER VIOLATE:
 * 1. NEVER modify, alter, or recreate artist collaboration logos
 * 2. ONLY use official approved assets from src/assets/
 * 3. ALL product images must follow the dark brutalist VHS aesthetic
 * 4. Artist branding must remain EXACTLY as provided - no interpretation
 */

interface DesignGuidelines {
  branding: {
    primary: {
      name: string;
      logo: string;
      icon: string;
      font: string;
      textStyle: string;
      colors: {
        primary: string;
        accent: string;
        background: string;
      };
    };
    collaborations: Record<string, {
      artistName: string;
      officialLogo: string;
      officialIcon: string;
      approved: boolean;
      notes: string;
    }>;
  };
  productImageRules: {
    dimensions: string;
    background: string;
    aesthetic: string;
    brandingPlacement: string;
    forbidden: string[];
  };
  lifestyleImageRules: {
    dimensions: string;
    settings: string[];
    aesthetic: string;
    effects: string[];
    brandingVisible: boolean;
    forbidden: string[];
  };
}

const DESIGN_GUIDELINES: DesignGuidelines = {
  branding: {
    primary: {
      name: "techno.dog",
      logo: "src/assets/techno-dog-logo.png",
      icon: "src/assets/hexagon-logo-green.png",
      font: "IBM Plex Mono",
      textStyle: "uppercase tracking-widest text-xs",
      colors: {
        primary: "hsl(100, 100%, 60%)", // logo-green
        accent: "hsl(0, 100%, 50%)", // crimson
        background: "hsl(0, 0%, 0%)", // pure black
      },
    },
    collaborations: {
      eulogio: {
        artistName: "Eulogio",
        officialLogo: "src/assets/eulogio-full-logo.jpg",
        officialIcon: "src/assets/eulogio-e-icon.jpg",
        approved: true,
        notes: "Use ONLY the official Eulogio 'E' icon and full logo. NEVER recreate or interpret. Green accent on black background.",
      },
      lment: {
        artistName: "L:MEN:T",
        officialLogo: "N/A - Typography only",
        officialIcon: "N/A",
        approved: true,
        notes: "L:MEN:T uses bold industrial typography only. White text on black. No custom icon - use text 'L:MEN:T' in bold industrial style.",
      },
    },
  },
  productImageRules: {
    dimensions: "1024x1024 square",
    background: "Pure black or very dark gradient",
    aesthetic: "Dark brutalist, minimal, industrial techno",
    brandingPlacement: "Small discreet techno.dog hexagon logo in corner. For collabs: artist branding prominent, techno.dog secondary",
    forbidden: [
      "Bright colors",
      "Gradients that aren't dark",
      "Random symbols or icons not from approved assets",
      "AI-generated or interpreted versions of artist logos",
      "Any design elements not in the official asset library",
      "Busy patterns or maximalist design",
      "Stock imagery aesthetics",
    ],
  },
  lifestyleImageRules: {
    dimensions: "1024x1024 square",
    settings: [
      "Underground club with minimal lighting",
      "Warehouse rave with industrial elements",
      "Festival at night with stage lights",
      "Dark urban street at night",
      "DJ booth with equipment visible",
      "Backstage/green room dark setting",
    ],
    aesthetic: "VHS film grain, dark moody, low-light photography, authentic club culture",
    effects: [
      "Film grain overlay",
      "VHS scan lines",
      "Slight chromatic aberration",
      "Low light with accent lighting",
      "Smoke/haze atmosphere",
    ],
    brandingVisible: true,
    forbidden: [
      "Bright daylight settings",
      "Clean studio lighting",
      "Commercial/catalog style poses",
      "Stock photography aesthetics",
      "Non-techno settings",
      "Recreated or interpreted artist logos on clothing",
    ],
  },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, collaborationName } = await req.json().catch(() => ({}));

    switch (action) {
      case 'get-all':
        return new Response(
          JSON.stringify({ 
            success: true, 
            guidelines: DESIGN_GUIDELINES,
            warning: "NEVER modify artist logos. Use only official assets."
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'get-collaboration':
        if (!collaborationName) {
          return new Response(
            JSON.stringify({ error: 'collaborationName required' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        const collab = DESIGN_GUIDELINES.branding.collaborations[collaborationName.toLowerCase()];
        if (!collab) {
          return new Response(
            JSON.stringify({ error: 'Collaboration not found', available: Object.keys(DESIGN_GUIDELINES.branding.collaborations) }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
          );
        }
        return new Response(
          JSON.stringify({ 
            success: true, 
            collaboration: collab,
            warning: `NEVER recreate ${collab.artistName} logos. Use ONLY official assets.`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'validate-prompt':
        // This could be expanded to validate AI image generation prompts
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Prompt validation endpoint - expand as needed",
            rules: DESIGN_GUIDELINES.productImageRules.forbidden
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        return new Response(
          JSON.stringify({ 
            success: true, 
            guidelines: DESIGN_GUIDELINES,
            endpoints: ['get-all', 'get-collaboration', 'validate-prompt']
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'An error occurred', details: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
