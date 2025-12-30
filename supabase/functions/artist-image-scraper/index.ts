import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface ArtistToProcess {
  artist_id: string;
  canonical_name: string;
  slug: string;
  country: string | null;
  city: string | null;
}

// Use Firecrawl to search for artist images
async function searchArtistImages(artistName: string): Promise<string[]> {
  if (!FIRECRAWL_API_KEY) {
    console.log('No Firecrawl API key, skipping search');
    return [];
  }

  try {
    // Search for artist press photos
    const query = `${artistName} techno DJ artist press photo official`;
    console.log('Searching Firecrawl for:', query);

    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit: 5,
        scrapeOptions: { formats: ['markdown', 'html'] }
      }),
    });

    if (!response.ok) {
      console.error('Firecrawl search error:', await response.text());
      return [];
    }

    const data = await response.json();
    const results = data.data || [];
    
    // Extract image URLs from results
    const imageUrls: string[] = [];
    for (const result of results) {
      const html = result.html || '';
      // Extract image URLs from HTML
      const imgMatches = html.match(/https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png|webp)/gi) || [];
      imageUrls.push(...imgMatches.slice(0, 3));
    }

    console.log(`Found ${imageUrls.length} potential images for ${artistName}`);
    return [...new Set(imageUrls)].slice(0, 10);
  } catch (error) {
    console.error('Firecrawl search error:', error);
    return [];
  }
}

// Use Gemini to select the best artist image from candidates
async function selectBestImage(artistName: string, imageUrls: string[]): Promise<{ url: string; confidence: number } | null> {
  if (!LOVABLE_API_KEY || imageUrls.length === 0) {
    return null;
  }

  try {
    const prompt = `You are an expert at identifying electronic music artists.

I need you to analyze these image URLs and determine which one is most likely a legitimate press/promotional photo of the techno/electronic music artist "${artistName}".

Image URLs to analyze:
${imageUrls.map((url, i) => `${i + 1}. ${url}`).join('\n')}

CRITICAL RULES:
1. Only select an image if you're confident it's the correct artist
2. Prefer press photos, festival shots, or DJ booth photos
3. Avoid stock photos, logos, album art, or crowd shots
4. If no image seems appropriate, say so

Respond with JSON only:
{
  "selected_index": number (1-indexed) or null if none suitable,
  "confidence": number (0-1),
  "reasoning": "brief explanation"
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      console.error('Gemini API error:', await response.text());
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      if (result.selected_index && result.confidence >= 0.6) {
        const selectedUrl = imageUrls[result.selected_index - 1];
        if (selectedUrl) {
          console.log(`Selected image for ${artistName}: ${selectedUrl} (confidence: ${result.confidence})`);
          return { url: selectedUrl, confidence: result.confidence };
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Gemini selection error:', error);
    return null;
  }
}

// Fallback: Search for Wikipedia/RA/Discogs images directly
async function searchKnownSources(artistName: string): Promise<string | null> {
  if (!FIRECRAWL_API_KEY) return null;

  const sources = [
    `site:residentadvisor.net ${artistName}`,
    `site:discogs.com ${artistName} artist`,
    `site:wikipedia.org ${artistName} DJ`,
  ];

  for (const query of sources) {
    try {
      const response = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          limit: 2,
          scrapeOptions: { formats: ['html'] }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const results = data.data || [];
        
        for (const result of results) {
          const html = result.html || '';
          // Look for high-quality image URLs
          const matches = html.match(/https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png|webp)/gi) || [];
          const goodUrls = matches.filter((url: string) => 
            !url.includes('logo') && 
            !url.includes('icon') && 
            !url.includes('thumb') &&
            !url.includes('avatar') &&
            (url.includes('artist') || url.includes('profile') || url.includes('press') || matches.length === 1)
          );
          
          if (goodUrls.length > 0) {
            console.log(`Found image from known source for ${artistName}:`, goodUrls[0]);
            return goodUrls[0];
          }
        }
      }
    } catch (error) {
      console.error(`Error searching ${query}:`, error);
    }
  }

  return null;
}

// Process a single artist
async function processArtist(supabase: any, artist: ArtistToProcess): Promise<{ success: boolean; url?: string; error?: string }> {
  console.log(`\n=== Processing: ${artist.canonical_name} ===`);

  try {
    // Step 1: Search for images
    let imageUrls = await searchArtistImages(artist.canonical_name);
    
    // Step 2: If found images, use Gemini to select best one
    let selectedImage: { url: string; confidence: number } | null = null;
    
    if (imageUrls.length > 0) {
      selectedImage = await selectBestImage(artist.canonical_name, imageUrls);
    }

    // Step 3: Fallback to known sources if no good match
    if (!selectedImage) {
      const fallbackUrl = await searchKnownSources(artist.canonical_name);
      if (fallbackUrl) {
        selectedImage = { url: fallbackUrl, confidence: 0.7 };
      }
    }

    if (!selectedImage) {
      return { success: false, error: 'No suitable image found' };
    }

    // Step 4: Update database with the found image
    const { error: updateError } = await supabase
      .from('canonical_artists')
      .update({
        photo_url: selectedImage.url,
        photo_verified: selectedImage.confidence >= 0.8,
        photo_verification_models: ['gemini-2.5-flash'],
        photo_source: 'firecrawl-search',
        photo_verified_at: new Date().toISOString(),
      })
      .eq('artist_id', artist.artist_id);

    if (updateError) {
      console.error('Database update error:', updateError);
      return { success: false, error: updateError.message };
    }

    // Also insert into artist_assets for normalized storage
    const { error: assetError } = await supabase
      .from('artist_assets')
      .upsert({
        artist_id: artist.artist_id,
        asset_type: 'photo',
        url: selectedImage.url,
        is_primary: true,
        quality_score: selectedImage.confidence,
        source_system: 'firecrawl-gemini',
        source_name: 'Automated Search',
        alt_text: `${artist.canonical_name} - Artist Photo`,
      }, {
        onConflict: 'artist_id,asset_type,is_primary'
      });

    if (assetError) {
      console.log('Asset insert note:', assetError.message);
    }

    console.log(`✓ Updated ${artist.canonical_name} with image: ${selectedImage.url}`);
    return { success: true, url: selectedImage.url };

  } catch (error) {
    console.error(`Error processing ${artist.canonical_name}:`, error);
    return { success: false, error: String(error) };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action = 'batch', limit = 3, artist_id } = await req.json();
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (action === 'status') {
      // Get status of artist images
      const { data: stats } = await supabase.rpc('get_artist_image_stats').single();
      
      const { count: totalArtists } = await supabase
        .from('canonical_artists')
        .select('*', { count: 'exact', head: true });

      const { count: withPhotos } = await supabase
        .from('canonical_artists')
        .select('*', { count: 'exact', head: true })
        .not('photo_url', 'is', null);

      const { count: missingPhotos } = await supabase
        .from('canonical_artists')
        .select('*', { count: 'exact', head: true })
        .is('photo_url', null);

      return new Response(JSON.stringify({
        success: true,
        stats: {
          total_artists: totalArtists || 0,
          with_photos: withPhotos || 0,
          missing_photos: missingPhotos || 0,
          coverage: totalArtists ? Math.round((withPhotos || 0) / totalArtists * 100) : 0
        }
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'single' && artist_id) {
      // Process single artist by ID
      const { data: artist } = await supabase
        .from('canonical_artists')
        .select('artist_id, canonical_name, slug, country, city')
        .eq('artist_id', artist_id)
        .single();

      if (!artist) {
        return new Response(JSON.stringify({ success: false, error: 'Artist not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const result = await processArtist(supabase, artist);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Batch processing - get artists missing photos
    const { data: artists, error: fetchError } = await supabase
      .from('canonical_artists')
      .select('artist_id, canonical_name, slug, country, city')
      .is('photo_url', null)
      .order('rank', { ascending: true, nullsFirst: false })
      .limit(limit);

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return new Response(JSON.stringify({ success: false, error: fetchError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!artists || artists.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'All artists have photos!',
        processed: 0
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log(`Processing batch of ${artists.length} artists...`);
    
    const results: Array<{ name: string; success: boolean; url?: string; error?: string }> = [];
    
    for (const artist of artists) {
      const result = await processArtist(supabase, artist);
      results.push({
        name: artist.canonical_name,
        ...result
      });
      
      // Small delay between artists to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const successful = results.filter(r => r.success).length;
    
    return new Response(JSON.stringify({
      success: true,
      processed: results.length,
      successful,
      failed: results.length - successful,
      results
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
