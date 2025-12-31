import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const XAI_KEY = Deno.env.get('XAI_KEY'); // Grok
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

interface ImageSearchResult {
  url: string;
  confidence: number;
  source: string;
  model: string;
}

// Multi-model image URL discovery using Grok (X.AI)
async function discoverImagesWithGrok(artistName: string): Promise<string[]> {
  if (!XAI_KEY) return [];
  
  try {
    console.log(`[Grok] Searching for ${artistName} images...`);
    
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${XAI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-3-latest',
        messages: [{
          role: 'user',
          content: `Find real, working image URLs for the techno/electronic music artist "${artistName}". 
          
Search for:
- Official press photos from their website
- Resident Advisor artist page photos
- Discogs artist images  
- Wikipedia images
- Festival/event photos

Return ONLY a JSON array of direct image URLs (jpg, png, webp). No explanation, just the JSON array.
Example: ["https://example.com/artist.jpg", "https://example2.com/photo.png"]

If you cannot find real URLs, return: []`
        }],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('[Grok] API error:', await response.text());
      return [];
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON array from response
    const jsonMatch = content.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      const urls = JSON.parse(jsonMatch[0]);
      console.log(`[Grok] Found ${urls.length} URLs for ${artistName}`);
      return urls.filter((url: string) => typeof url === 'string' && url.startsWith('http'));
    }
    return [];
  } catch (error) {
    console.error('[Grok] Error:', error);
    return [];
  }
}

// Multi-model image URL discovery using OpenAI
async function discoverImagesWithOpenAI(artistName: string): Promise<string[]> {
  if (!OPENAI_API_KEY) return [];
  
  try {
    console.log(`[OpenAI] Searching for ${artistName} images...`);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: `You are helping find artist photos. For the techno DJ/producer "${artistName}", suggest WHERE to find their official photos.

List the most likely sources:
1. Their official website domain
2. Their Resident Advisor page URL format
3. Their Discogs artist page
4. Any known festival appearances

Return as JSON:
{
  "likely_sources": ["url1", "url2"],
  "search_terms": ["term1", "term2"]
}`
        }],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('[OpenAI] API error:', await response.text());
      return [];
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      console.log(`[OpenAI] Suggested sources for ${artistName}:`, result.likely_sources?.length || 0);
      return result.likely_sources || [];
    }
    return [];
  } catch (error) {
    console.error('[OpenAI] Error:', error);
    return [];
  }
}

// Multi-model image URL discovery using Anthropic Claude
async function discoverImagesWithAnthropic(artistName: string): Promise<string[]> {
  if (!ANTHROPIC_API_KEY) return [];
  
  try {
    console.log(`[Anthropic] Searching for ${artistName} images...`);
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `For techno artist "${artistName}", list commonly known image sources.

Return JSON only:
{
  "ra_url": "https://ra.co/dj/slug",
  "discogs_url": "https://discogs.com/artist/...",
  "possible_domains": ["domain1.com", "domain2.com"]
}`
        }],
      }),
    });

    if (!response.ok) {
      console.error('[Anthropic] API error:', await response.text());
      return [];
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '';
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      const urls: string[] = [];
      if (result.ra_url) urls.push(result.ra_url);
      if (result.discogs_url) urls.push(result.discogs_url);
      console.log(`[Anthropic] Found ${urls.length} URLs for ${artistName}`);
      return urls;
    }
    return [];
  } catch (error) {
    console.error('[Anthropic] Error:', error);
    return [];
  }
}

// Use Firecrawl to search for artist images
async function searchArtistImages(artistName: string): Promise<string[]> {
  if (!FIRECRAWL_API_KEY) {
    console.log('No Firecrawl API key, skipping search');
    return [];
  }

  try {
    const query = `${artistName} techno DJ artist press photo official`;
    console.log('[Firecrawl] Searching:', query);

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
      console.error('[Firecrawl] Search error:', await response.text());
      return [];
    }

    const data = await response.json();
    const results = data.data || [];
    
    const imageUrls: string[] = [];
    for (const result of results) {
      const html = result.html || '';
      const imgMatches = html.match(/https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png|webp)/gi) || [];
      imageUrls.push(...imgMatches.slice(0, 3));
    }

    console.log(`[Firecrawl] Found ${imageUrls.length} potential images for ${artistName}`);
    return [...new Set(imageUrls)].slice(0, 10);
  } catch (error) {
    console.error('[Firecrawl] Search error:', error);
    return [];
  }
}

// Use Gemini to select the best artist image from candidates
async function selectBestImageWithGemini(artistName: string, imageUrls: string[]): Promise<ImageSearchResult | null> {
  if (!LOVABLE_API_KEY || imageUrls.length === 0) return null;

  try {
    const prompt = `You are an expert at identifying electronic music artists.

Analyze these image URLs and determine which is most likely a legitimate press photo of "${artistName}":

${imageUrls.map((url, i) => `${i + 1}. ${url}`).join('\n')}

RULES:
1. Only select if confident it's the correct artist
2. Prefer press photos, festival shots, DJ booth photos
3. Avoid stock photos, logos, album art, crowd shots
4. If none suitable, say so

Respond with JSON only:
{
  "selected_index": number (1-indexed) or null,
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
      }),
    });

    if (!response.ok) {
      console.error('[Gemini] API error:', await response.text());
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      if (result.selected_index && result.confidence >= 0.5) {
        const selectedUrl = imageUrls[result.selected_index - 1];
        if (selectedUrl) {
          console.log(`[Gemini] Selected for ${artistName}: ${selectedUrl} (${result.confidence})`);
          return { url: selectedUrl, confidence: result.confidence, source: 'gemini-selection', model: 'gemini-2.5-flash' };
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('[Gemini] Selection error:', error);
    return null;
  }
}

// Orchestrated multi-model image finding
async function findArtistImageOrchestrated(artistName: string): Promise<ImageSearchResult | null> {
  console.log(`\n=== Orchestrated search for: ${artistName} ===`);
  
  // Step 1: Parallel discovery from all AI models
  const [grokUrls, openaiUrls, anthropicUrls, firecrawlUrls] = await Promise.all([
    discoverImagesWithGrok(artistName),
    discoverImagesWithOpenAI(artistName),
    discoverImagesWithAnthropic(artistName),
    searchArtistImages(artistName),
  ]);

  // Combine all discovered URLs
  const allUrls = [...new Set([...grokUrls, ...openaiUrls, ...anthropicUrls, ...firecrawlUrls])];
  console.log(`[Orchestrator] Combined ${allUrls.length} unique URLs from all sources`);

  if (allUrls.length === 0) {
    // Fallback: Try known source patterns
    const knownPatterns = await tryKnownSourcePatterns(artistName);
    if (knownPatterns) {
      return knownPatterns;
    }
    return null;
  }

  // Step 2: Use Gemini to select the best image
  const selectedImage = await selectBestImageWithGemini(artistName, allUrls);
  
  if (selectedImage) {
    return selectedImage;
  }

  // Step 3: If Gemini couldn't decide, try the first valid-looking URL
  for (const url of allUrls) {
    if (url.includes('ra.co') || url.includes('residentadvisor') || 
        url.includes('discogs') || url.includes('wikimedia')) {
      console.log(`[Fallback] Using trusted source URL: ${url}`);
      return { url, confidence: 0.6, source: 'trusted-fallback', model: 'none' };
    }
  }

  // Return first URL as last resort
  if (allUrls.length > 0) {
    return { url: allUrls[0], confidence: 0.4, source: 'first-available', model: 'none' };
  }

  return null;
}

// Try known source patterns for major artists
async function tryKnownSourcePatterns(artistName: string): Promise<ImageSearchResult | null> {
  const slug = artistName.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  // Known URL patterns for major platforms
  const patterns = [
    `https://ra.co/images/profiles/${slug}/`,
    `https://www.residentadvisor.net/images/profiles/${slug}.jpg`,
  ];

  // Try Wikimedia Commons search via Firecrawl
  if (FIRECRAWL_API_KEY) {
    try {
      const response = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `site:commons.wikimedia.org ${artistName} DJ`,
          limit: 2,
          scrapeOptions: { formats: ['html'] }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const results = data.data || [];
        
        for (const result of results) {
          const html = result.html || '';
          const matches = html.match(/https:\/\/upload\.wikimedia\.org\/[^\s"'<>]+\.(jpg|jpeg|png)/gi) || [];
          if (matches.length > 0) {
            console.log(`[WikiCommons] Found image for ${artistName}: ${matches[0]}`);
            return { url: matches[0], confidence: 0.75, source: 'wikimedia-commons', model: 'firecrawl' };
          }
        }
      }
    } catch (error) {
      console.error('[WikiCommons] Search error:', error);
    }
  }

  return null;
}

// Process a single artist with orchestrated multi-model approach
async function processArtist(supabase: any, artist: ArtistToProcess): Promise<{ success: boolean; url?: string; error?: string; model?: string }> {
  console.log(`\n========================================`);
  console.log(`Processing: ${artist.canonical_name}`);
  console.log(`========================================`);

  try {
    const result = await findArtistImageOrchestrated(artist.canonical_name);

    if (!result) {
      return { success: false, error: 'No suitable image found from any source' };
    }

    // Update database with the found image
    const { error: updateError } = await supabase
      .from('canonical_artists')
      .update({
        photo_url: result.url,
        photo_verified: result.confidence >= 0.7,
        photo_verification_models: [result.model],
        photo_source: result.source,
        photo_verified_at: new Date().toISOString(),
      })
      .eq('artist_id', artist.artist_id);

    if (updateError) {
      console.error('Database update error:', updateError);
      return { success: false, error: updateError.message };
    }

    // Also insert into artist_assets
    await supabase
      .from('artist_assets')
      .upsert({
        artist_id: artist.artist_id,
        asset_type: 'photo',
        url: result.url,
        is_primary: true,
        quality_score: result.confidence,
        source_system: result.source,
        source_name: `Multi-Model Orchestrated (${result.model})`,
        alt_text: `${artist.canonical_name} - Artist Photo`,
      }, {
        onConflict: 'artist_id,asset_type,is_primary'
      });

    console.log(`✓ SUCCESS: ${artist.canonical_name} → ${result.url}`);
    console.log(`  Source: ${result.source}, Model: ${result.model}, Confidence: ${result.confidence}`);
    
    return { success: true, url: result.url, model: result.model };

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
    const body = await req.json().catch(() => ({}));
    const { action = 'batch', limit = 3, artist_id, slug } = body;
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Log available API keys
    console.log('Available AI Models:');
    console.log('  - Grok (X.AI):', XAI_KEY ? '✓' : '✗');
    console.log('  - OpenAI:', OPENAI_API_KEY ? '✓' : '✗');
    console.log('  - Anthropic:', ANTHROPIC_API_KEY ? '✓' : '✗');
    console.log('  - Gemini (Lovable):', LOVABLE_API_KEY ? '✓' : '✗');
    console.log('  - Firecrawl:', FIRECRAWL_API_KEY ? '✓' : '✗');

    if (action === 'status') {
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
        },
        models: {
          grok: !!XAI_KEY,
          openai: !!OPENAI_API_KEY,
          anthropic: !!ANTHROPIC_API_KEY,
          gemini: !!LOVABLE_API_KEY,
          firecrawl: !!FIRECRAWL_API_KEY,
        }
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'single') {
      // Process single artist by ID or slug
      let artist;
      
      if (artist_id) {
        const { data } = await supabase
          .from('canonical_artists')
          .select('artist_id, canonical_name, slug, country, city')
          .eq('artist_id', artist_id)
          .single();
        artist = data;
      } else if (slug) {
        const { data } = await supabase
          .from('canonical_artists')
          .select('artist_id, canonical_name, slug, country, city')
          .eq('slug', slug)
          .single();
        artist = data;
      }

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

    // Batch processing
    const { data: artists, error: fetchError } = await supabase
      .from('canonical_artists')
      .select('artist_id, canonical_name, slug, country, city')
      .is('photo_url', null)
      .order('rank', { ascending: true, nullsFirst: false })
      .limit(limit);

    if (fetchError) {
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

    console.log(`\n>>> BATCH: Processing ${artists.length} artists <<<\n`);
    
    const results: Array<{ name: string; success: boolean; url?: string; error?: string; model?: string }> = [];
    
    for (const artist of artists) {
      const result = await processArtist(supabase, artist);
      results.push({ name: artist.canonical_name, ...result });
      
      // Delay between artists to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
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
