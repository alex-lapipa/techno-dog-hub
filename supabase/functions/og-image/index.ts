/**
 * Dynamic OG Image Generator for techno.dog
 * 
 * Generates 1200x630 poster-style images optimized for WhatsApp sharing.
 * Uses Lovable AI (Gemini image model) to create on-brand visuals.
 * 
 * Query params:
 * - route: The page route (e.g., /artists, /gear/tr-808)
 * - title: Optional custom title override
 * - skin: Optional skin override (minimal, glitch, archive, neon, rave)
 * - v: Cache version for busting
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Route to OG config mapping (simplified version of frontend config)
const OG_ROUTE_CONFIG: Record<string, { doggy: string; skin: string; tagline: string; icon: string }> = {
  '/': { doggy: 'logo', skin: 'minimal', tagline: 'Global Techno Culture Archive', icon: 'home' },
  '/news/article/a0000001-0001-0001-0001-000000000001': { doggy: 'logo', skin: 'minimal', tagline: 'The story behind techno.dog', icon: 'news' },
  '/artists': { doggy: 'dj', skin: 'rave', tagline: 'The selectors shaping the sound', icon: 'music' },
  '/gear': { doggy: 'modular', skin: 'neon', tagline: 'The machines behind the music', icon: 'gear' },
  '/venues': { doggy: 'berghain', skin: 'archive', tagline: 'Sacred spaces of the underground', icon: 'venue' },
  '/labels': { doggy: 'vinyl', skin: 'archive', tagline: 'The imprints shaping the sound', icon: 'label' },
  '/festivals': { doggy: 'summer', skin: 'neon', tagline: 'Global techno gatherings', icon: 'calendar' },
  '/crews': { doggy: 'promoter', skin: 'rave', tagline: 'Building scenes, not just parties', icon: 'crew' },
  '/books': { doggy: 'nerdy', skin: 'archive', tagline: 'Essential reading for the scene', icon: 'book' },
  '/documentaries': { doggy: 'curious', skin: 'glitch', tagline: 'Visual stories from the underground', icon: 'film' },
  '/news': { doggy: 'excited', skin: 'rave', tagline: 'Fresh from the underground', icon: 'news' },
  '/technopedia': { doggy: 'scientist', skin: 'archive', tagline: 'The techno encyclopedia', icon: 'archive' },
  '/doggies': { doggy: 'party', skin: 'neon', tagline: 'The pack awaits', icon: 'dog' },
  '/developer': { doggy: 'nerdy', skin: 'minimal', tagline: 'Build with techno.dog', icon: 'api' },
  '/about': { doggy: 'happy', skin: 'minimal', tagline: 'The story behind techno.dog', icon: 'home' },
  '/manifesto': { doggy: 'purist', skin: 'archive', tagline: 'What we stand for', icon: 'archive' },
};

// Get config for route with prefix matching
function getConfigForRoute(route: string): { doggy: string; skin: string; tagline: string; icon: string } {
  // Exact match
  if (OG_ROUTE_CONFIG[route]) return OG_ROUTE_CONFIG[route];
  
  // Prefix match for dynamic routes
  if (route.startsWith('/artist/')) return { doggy: 'techno', skin: 'glitch', tagline: 'From the techno.dog archive', icon: 'music' };
  if (route.startsWith('/gear/')) return { doggy: 'synth', skin: 'neon', tagline: 'Synthesizers, drum machines, and more', icon: 'gear' };
  if (route.startsWith('/venue/')) return { doggy: 'underground', skin: 'glitch', tagline: 'Where the magic happens', icon: 'venue' };
  if (route.startsWith('/label/')) return { doggy: 'producer', skin: 'minimal', tagline: 'From the underground', icon: 'label' };
  if (route.startsWith('/book/')) return { doggy: 'old', skin: 'minimal', tagline: 'From the techno.dog library', icon: 'book' };
  if (route.startsWith('/documentary/')) return { doggy: 'legend', skin: 'archive', tagline: 'Watch the story unfold', icon: 'film' };
  if (route.startsWith('/news/')) return { doggy: 'techno', skin: 'minimal', tagline: 'techno.dog news', icon: 'news' };
  
  // Default
  return OG_ROUTE_CONFIG['/'];
}

// Skin-specific style descriptions for image generation
const SKIN_STYLES: Record<string, string> = {
  minimal: 'Clean, minimal design with subtle geometric patterns. Black background with precise green (#7CFC00) accent lines. Professional and understated.',
  glitch: 'VHS-style glitch effects, scan lines, digital distortion. Black background with neon green (#7CFC00) glitches and red (#FF4444) chromatic aberration.',
  archive: 'Monochrome archival aesthetic with film grain texture. Dark gray background with aged paper textures and green (#7CFC00) highlights.',
  neon: 'High-energy neon glow effects. Deep black background with vibrant green (#7CFC00) neon tubes, purple and cyan accent glows.',
  rave: 'Intense rave visuals with strobe-like elements. Black background with pulsing green (#7CFC00) energy patterns and geometric shapes.',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const route = url.searchParams.get('route') || '/';
    const customTitle = url.searchParams.get('title');
    const skinOverride = url.searchParams.get('skin');
    
    const config = getConfigForRoute(route);
    const skin = skinOverride || config.skin;
    const skinStyle = SKIN_STYLES[skin] || SKIN_STYLES.minimal;
    
    // Generate title from route if not provided
    const title = customTitle || formatRouteAsTitle(route);
    
    // Create image generation prompt - special handling for logo pages
    const useLogo = config.doggy === 'logo';
    
    const prompt = useLogo 
      ? `Create a social media share image (1200x630 pixels, 1.91:1 aspect ratio) for a techno music website called "techno.dog".

DESIGN REQUIREMENTS:
- Style: ${skinStyle}
- Background: Solid black (#000000) with subtle texture/pattern
- Primary accent color: Bright green (#7CFC00)
- Typography: Bold, modern sans-serif

CENTRAL LOGO ELEMENT:
- Feature a prominent HEXAGON shape in the center
- The hexagon should be rendered with bright green (#7CFC00) stroke/outline
- Inside or near the hexagon: stylized dog silhouette in green
- This is the official techno.dog brand mark

LAYOUT (poster-style):
- Center: The hexagon logo mark, large and prominent
- Below logo: "techno.dog" text in white, bold
- Bottom: Tagline "${config.tagline}" in green
- Geometric grid lines radiating from hexagon
- Safe zones: Keep elements 50px from edges

The image should look like an official brand announcement - clean, iconic, and authoritative. Ultra high resolution.`
      : `Create a social media share image (1200x630 pixels, 1.91:1 aspect ratio) for a techno music website called "techno.dog".

DESIGN REQUIREMENTS:
- Style: ${skinStyle}
- Background: Solid black (#000000) with subtle texture/pattern
- Primary accent color: Bright green (#7CFC00)
- Typography: Bold, modern sans-serif

LAYOUT (poster-style):
- Top-left corner: Small "techno.dog" text in green
- Center: Large headline "${title}" in white, bold
- Bottom: Tagline "${config.tagline}" in green
- Decorative geometric patterns and lines using green accents
- Safe zones: Keep text 50px from edges for social media cropping

DO NOT include:
- Any dog imagery, dog icons, or animal illustrations
- Stock photos or realistic images
- Complex busy backgrounds that would make text unreadable

The image should look like a high-end concert flyer or album artwork - bold, striking, and immediately recognizable as part of the techno.dog brand. Ultra high resolution.`;

    console.log('[og-image] Generating image for route:', route, 'skin:', skin);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          { role: 'user', content: prompt }
        ],
        modalities: ['image', 'text'],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[og-image] AI Gateway error:', response.status, errorText);
      
      // Return fallback static image
      return serveFallbackImage(title, config.tagline);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error('[og-image] No image in response:', JSON.stringify(data));
      return serveFallbackImage(title, config.tagline);
    }

    // If it's a base64 image, convert to binary and serve
    if (imageUrl.startsWith('data:image/')) {
      const base64Data = imageUrl.split(',')[1];
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      const contentType = imageUrl.split(';')[0].split(':')[1] || 'image/png';
      
      return new Response(binaryData, {
        headers: {
          ...corsHeaders,
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400, s-maxage=604800', // 1 day client, 7 days CDN
        },
      });
    }

    // If it's a URL, redirect to it
    return Response.redirect(imageUrl, 302);

  } catch (error) {
    console.error('[og-image] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Format route path as readable title
function formatRouteAsTitle(route: string): string {
  if (route === '/') return 'techno.dog';
  
  // Extract the last segment and clean it up
  const segments = route.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  
  // Handle slugs: convert kebab-case to Title Case
  return lastSegment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Serve a simple SVG fallback if image generation fails
function serveFallbackImage(title: string, tagline: string): Response {
  const escapedTitle = title.replace(/[<>&"']/g, c => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;'
  }[c] || c));
  const escapedTagline = tagline.replace(/[<>&"']/g, c => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;'
  }[c] || c));

  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#7CFC00" stroke-width="0.5" opacity="0.1"/>
      </pattern>
    </defs>
    <rect width="1200" height="630" fill="#000"/>
    <rect width="1200" height="630" fill="url(#grid)"/>
    <text x="50" y="60" font-family="system-ui, sans-serif" font-size="24" fill="#7CFC00" font-weight="bold">techno.dog</text>
    <text x="600" y="315" font-family="system-ui, sans-serif" font-size="72" fill="#fff" font-weight="bold" text-anchor="middle">${escapedTitle}</text>
    <text x="600" y="550" font-family="system-ui, sans-serif" font-size="28" fill="#7CFC00" text-anchor="middle">${escapedTagline}</text>
    <line x1="50" y1="580" x2="1150" y2="580" stroke="#7CFC00" stroke-width="2" opacity="0.5"/>
  </svg>`;

  return new Response(svg, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
