import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  withCircuitBreaker, 
  getAvailableModel, 
  recordSuccess, 
  recordFailure 
} from "../_shared/circuit-breaker.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Multi-model configuration with fallback chain
const MODEL_CONFIG = {
  primary: 'google/gemini-2.5-flash',       // Fast, cost-effective
  secondary: 'openai/gpt-5-mini',           // Strong fallback
  tertiary: 'google/gemini-2.5-flash-lite', // Ultra-fast fallback
};

// Manufacturer site mappings for direct product page scraping
const MANUFACTURER_URLS: Record<string, string> = {
  'ableton-live': 'https://www.ableton.com/en/live/',
  'pioneer-rekordbox': 'https://rekordbox.com/en/',
  'apple-logic-pro': 'https://www.apple.com/logic-pro/',
  'cycling-74-max': 'https://cycling74.com/products/max',
  'native-instruments-traktor': 'https://www.native-instruments.com/en/products/traktor/dj-software/traktor-pro-4/',
  'nord-lead-series': 'https://www.nordkeyboards.com/products/nord-lead-4',
  'oberheim-sem': 'https://oberheim.com/product/sem/',
  'pioneer-djm-s11': 'https://www.pioneerdj.com/en/product/mixer/djm-s11/black/overview/',
  'pioneer-djm-v10': 'https://www.pioneerdj.com/en/product/mixer/djm-v10/black/overview/',
  'pioneer-cdj-3000': 'https://www.pioneerdj.com/en/product/player/cdj-3000/black/overview/',
  'rane-mp2015': 'https://www.rane.com/mp2015',
  'rane-seventy-two': 'https://www.rane.com/seventy-two',
  'roland-jx-3p': 'https://www.roland.com/global/promos/roland_classic/jx-3p/',
  'roland-re-501': 'https://www.roland.com/global/promos/roland_classic/',
  'roland-system-100m': 'https://www.roland.com/global/promos/roland_classic/',
  'roland-system-700': 'https://www.roland.com/global/promos/roland_classic/',
  'sequential-prophet-rev2': 'https://www.sequential.com/product/prophet-rev2/',
  'sequential-prophet-6': 'https://www.sequential.com/product/prophet-6/',
  'ssl-g-series-bus': 'https://www.solidstatelogic.com/products/500-series',
  'strymon-timeline': 'https://www.strymon.net/product/timeline/',
  'strymon-bigsky': 'https://www.strymon.net/product/bigsky/',
  'tc-electronic-flashback': 'https://www.tcelectronic.com/product.html?modelCode=0648',
  'technics-sl-1200-series': 'https://www.technics.com/global/products/1200-series.html',
  'technics-sl-1200gr': 'https://www.technics.com/global/products/sl-1200gr.html',
  'technics-sl-1200mk7': 'https://www.technics.com/global/products/sl-1200mk7.html',
  'teletronix-la2a': 'https://www.uaudio.com/hardware/la-2a.html',
  'urei-1176': 'https://www.uaudio.com/hardware/1176ln.html',
  'waldorf-blofeld': 'https://waldorfmusic.com/en/blofeld-overview',
  'waldorf-pulse-2': 'https://waldorfmusic.com/en/pulse-2-overview',
  'mutable-instruments-modules': 'https://pichenettes.github.io/mutable-instruments-documentation/',
  'api-500-series': 'https://apiaudio.com/500-series/',
  'serge-modular-4u': 'https://www.serge-fans.com/',
  // Extended manufacturer mappings for full coverage
  'roland-tr-808': 'https://www.roland.com/global/promos/roland_classic/tr-808/',
  'roland-tr-909': 'https://www.roland.com/global/promos/roland_classic/tr-909/',
  'roland-tb-303': 'https://www.roland.com/global/promos/roland_classic/tb-303/',
  'moog-minimoog': 'https://www.moogmusic.com/products/minimoog-model-d',
  'moog-subsequent-37': 'https://www.moogmusic.com/products/subsequent-37',
  'elektron-analog-rytm': 'https://www.elektron.se/products/analog-rytm-mkii/',
  'elektron-octatrack': 'https://www.elektron.se/products/octatrack-mkii/',
  'korg-ms-20': 'https://www.korg.com/us/products/synthesizers/ms_20mini/',
  'korg-volca-series': 'https://www.korg.com/us/products/dj/volca_beats/',
  'dave-smith-prophet-12': 'https://www.sequential.com/product/prophet-12-module/',
};

// Use Firecrawl web search to find product images
async function searchForProductImages(gearName: string, gearBrand: string, gearId: string): Promise<{ success: boolean; results?: any[]; error?: string }> {
  if (!FIRECRAWL_API_KEY) {
    return { success: false, error: 'Firecrawl API key not configured' };
  }

  try {
    // Try manufacturer URL first if available
    const manufacturerUrl = MANUFACTURER_URLS[gearId];
    if (manufacturerUrl) {
      console.log('Scraping manufacturer URL:', manufacturerUrl);
      const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: manufacturerUrl,
          formats: ['markdown', 'html'],
          onlyMainContent: true,
          waitFor: 2000,
        }),
      });
      
      if (scrapeResponse.ok) {
        const scrapeData = await scrapeResponse.json();
        if (scrapeData.success || scrapeData.data) {
          return { 
            success: true, 
            results: [{
              url: manufacturerUrl,
              html: scrapeData.data?.html || scrapeData.html || '',
              markdown: scrapeData.data?.markdown || scrapeData.markdown || '',
              title: `${gearBrand} ${gearName} - Official`
            }]
          };
        }
      }
    }

    // Fallback to search with manufacturer focus
    const query = `${gearBrand} ${gearName} official product image`;
    console.log('Searching:', query);
    
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit: 8,
        scrapeOptions: { 
          formats: ['markdown', 'html'],
          onlyMainContent: true 
        }
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Firecrawl search error:', data);
      return { success: false, error: data.error || `HTTP ${response.status}` };
    }

    return { success: true, results: data.data || [] };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown search error';
    console.error('Search error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Extract all image URLs from search results
function extractImagesFromResults(results: any[]): string[] {
  const images: string[] = [];
  const imageRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  const mdImageRegex = /!\[.*?\]\(([^)]+)\)/g;
  const srcsetRegex = /srcset=["']([^"']+)["']/gi;

  for (const result of results) {
    const html = result.html || '';
    const markdown = result.markdown || '';
    
    // Extract from HTML img tags
    let match;
    while ((match = imageRegex.exec(html)) !== null) {
      if (match[1] && isValidImageUrl(match[1])) {
        images.push(match[1]);
      }
    }

    // Extract from srcset
    while ((match = srcsetRegex.exec(html)) !== null) {
      const srcsetUrls = match[1].split(',').map(s => s.trim().split(' ')[0]);
      for (const url of srcsetUrls) {
        if (isValidImageUrl(url)) {
          images.push(url);
        }
      }
    }

    // Extract from markdown
    while ((match = mdImageRegex.exec(markdown)) !== null) {
      if (match[1] && isValidImageUrl(match[1])) {
        images.push(match[1]);
      }
    }
  }

  // Remove duplicates
  return [...new Set(images)];
}

// Check if URL is a valid product image (not icon, avatar, etc)
function isValidImageUrl(url: string): boolean {
  if (!url || url.length < 10) return false;
  if (url.startsWith('data:')) return false;
  
  const lowerUrl = url.toLowerCase();
  
  // Skip common non-product images
  const skipPatterns = [
    'placeholder', 'avatar', 'icon', 'logo', 'favicon',
    'tracking', 'pixel', 'blank', 'spacer', 'ad-', 'banner',
    'button', 'social', 'share', 'twitter', 'facebook',
    'instagram', 'youtube', 'loading', 'spinner', '1x1',
    'tr-404', 'not-found', 'error', 'default'
  ];
  
  if (skipPatterns.some(p => lowerUrl.includes(p))) return false;
  
  // Must be an image file
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const hasExtension = imageExtensions.some(ext => lowerUrl.includes(ext));
  
  // Or from known CDN patterns
  const cdnPatterns = ['cloudinary', 'imgix', 'cloudfront', 'akamai', 'upload', 'media', 'images', 'assets'];
  const isCdn = cdnPatterns.some(p => lowerUrl.includes(p));
  
  return hasExtension || isCdn;
}

// Multi-model image selection with circuit breaker and fallback
async function selectBestImageWithAI(
  gearName: string, 
  gearBrand: string, 
  images: string[],
  searchResults: any[]
): Promise<{ imageUrl: string | null; confidence: number; reasoning: string; model: string }> {
  const apiKey = LOVABLE_API_KEY;
  const apiUrl = 'https://ai.gateway.lovable.dev/v1/chat/completions';

  if (!apiKey) {
    return { imageUrl: null, confidence: 0, reasoning: 'No API key configured', model: 'none' };
  }

  if (images.length === 0) {
    return { imageUrl: null, confidence: 0, reasoning: 'No images found to analyze', model: 'none' };
  }

  // Build context from search results
  const context = searchResults.slice(0, 3).map(r => 
    `Source: ${r.url}\nTitle: ${r.title || 'N/A'}\n${(r.markdown || '').slice(0, 300)}`
  ).join('\n\n---\n\n');

  const prompt = `Select the best product image for "${gearBrand} ${gearName}" music equipment.

Images found:
${images.slice(0, 15).map((img, i) => `${i + 1}. ${img}`).join('\n')}

Context:
${context}

Criteria:
1. Must show actual product (synth, mixer, turntable) - NOT logos/icons
2. Prefer manufacturer or professional product shots
3. Prefer larger images (look for "large", "1200", "product" in URL)
4. Avoid thumbnails, social icons, navigation elements

Return ONLY JSON:
{"imageUrl": "best URL or null", "confidence": 0-100, "reasoning": "brief reason"}`;

  // Try models in order with circuit breaker
  const modelsToTry = [MODEL_CONFIG.primary, MODEL_CONFIG.secondary, MODEL_CONFIG.tertiary];
  
  for (const model of modelsToTry) {
    const availableModel = getAvailableModel(model);
    console.log(`[GearImageScraper] Trying ${availableModel} for ${gearName}`);

    try {
      const response = await withCircuitBreaker(availableModel, async () => {
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: availableModel,
            messages: [
              { role: 'system', content: 'You are an expert at identifying product images. Respond with valid JSON only.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.1,
          }),
        });
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res;
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        recordSuccess(availableModel);
        return {
          imageUrl: result.imageUrl || null,
          confidence: result.confidence || 0,
          reasoning: result.reasoning || 'No reasoning provided',
          model: availableModel
        };
      }
      
      // Partial success - got response but no valid JSON
      recordSuccess(availableModel);
      continue; // Try next model
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[GearImageScraper] ${availableModel} failed:`, errorMessage);
      recordFailure(availableModel);
      // Continue to next model
    }
  }

  return { imageUrl: null, confidence: 0, reasoning: 'All models failed', model: 'none' };
}

// Validate that an image URL is accessible and returns actual image content
async function validateImageUrl(url: string): Promise<boolean> {
  try {
    // Make URL absolute if needed
    if (url.startsWith('//')) {
      url = 'https:' + url;
    }
    
    const response = await fetch(url, { 
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TechnoDogBot/1.0)'
      }
    });
    
    if (!response.ok) return false;
    
    const contentType = response.headers.get('content-type') || '';
    const contentLength = parseInt(response.headers.get('content-length') || '0');
    
    // Must be an image and reasonably sized (> 5KB to filter tiny icons)
    return contentType.startsWith('image/') && contentLength > 5000;
  } catch {
    return false;
  }
}

// Known Wikimedia Commons images for popular gear (reliable fallback)
const WIKIMEDIA_FALLBACKS: Record<string, string> = {
  'roland-tr-808': 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Roland_TR-808_%28large%29.jpg',
  'roland-tr-909': 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Roland_TR-909_%28large%29.jpg',
  'roland-tb-303': 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Roland_TB-303_%28large%29.jpg',
  'moog-minimoog': 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Minimoog.JPG',
  'moog-subsequent-37': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Moog_Subsequent_37.jpg/1280px-Moog_Subsequent_37.jpg',
  'sequential-prophet-5': 'https://upload.wikimedia.org/wikipedia/commons/6/62/Sequential_Circuits_Prophet_5.jpg',
  'korg-ms-20': 'https://upload.wikimedia.org/wikipedia/commons/6/66/Korg_MS-20_%28large%29.jpg',
  'arp-2600': 'https://upload.wikimedia.org/wikipedia/commons/3/3c/ARP_2600_%28large%29.jpg',
  'oberheim-ob-xa': 'https://upload.wikimedia.org/wikipedia/commons/0/04/Oberheim_OB-Xa.jpg',
  'yamaha-dx7': 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Yamaha_DX7.jpg',
  'technics-sl-1200-series': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Technics_SL-1200MK2.jpg',
  'technics-sl-1200mk7': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Technics_SL-1200MK2.jpg',
  'technics-sl-1200gr': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Technics_SL-1200MK2.jpg',
  'roland-juno-106': 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Roland_Juno-106.jpg',
  'roland-sh-101': 'https://upload.wikimedia.org/wikipedia/commons/2/24/Roland_SH-101_%28large%29.jpg',
  'elektron-analog-rytm': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Elektron_Analog_Rytm.jpg/1280px-Elektron_Analog_Rytm.jpg',
  'pioneer-cdj-3000': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Pioneer_CDJ-2000NXS2.jpg/1280px-Pioneer_CDJ-2000NXS2.jpg',
  'pioneer-djm-v10': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Pioneer_DJM-900NXS2.jpg/1280px-Pioneer_DJM-900NXS2.jpg',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { action, gearId, batchSize = 5 } = await req.json();

    // Get items with missing images
    if (action === 'status') {
      const { data: missingImages, count } = await supabase
        .from('gear_catalog')
        .select('id, name, brand', { count: 'exact' })
        .or('image_url.is.null,image_url.eq.')
        .limit(50);

      return new Response(JSON.stringify({
        success: true,
        missingCount: count,
        items: missingImages
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Scrape single item
    if (action === 'scrape-single' && gearId) {
      const { data: gear, error: gearError } = await supabase
        .from('gear_catalog')
        .select('id, name, brand')
        .eq('id', gearId)
        .single();

      if (gearError || !gear) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Gear item not found'
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Check Wikimedia fallback first
      if (WIKIMEDIA_FALLBACKS[gear.id]) {
        const wikiUrl = WIKIMEDIA_FALLBACKS[gear.id];
        const isValid = await validateImageUrl(wikiUrl);
        
        if (isValid) {
          await supabase
            .from('gear_catalog')
            .update({
              image_url: wikiUrl,
              image_attribution: JSON.stringify({
                source: 'wikimedia_commons',
                license: 'CC',
                scraped_at: new Date().toISOString()
              }),
              updated_at: new Date().toISOString()
            })
            .eq('id', gear.id);

          return new Response(JSON.stringify({
            success: true,
            gearId: gear.id,
            gearName: `${gear.brand} ${gear.name}`,
            imageUrl: wikiUrl,
            source: 'wikimedia_fallback',
            confidence: 95
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }

      // Search for images
      const searchResult = await searchForProductImages(gear.name, gear.brand, gear.id);
      
      if (!searchResult.success || !searchResult.results?.length) {
        return new Response(JSON.stringify({
          success: false,
          error: searchResult.error || 'No search results found',
          gearId: gear.id
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Extract images from results
      const images = extractImagesFromResults(searchResult.results);
      console.log(`Found ${images.length} potential images for ${gear.name}`);

      if (images.length === 0) {
        return new Response(JSON.stringify({
          success: false,
          error: 'No images found in search results',
          gearId: gear.id
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Use multi-model AI to select best image
      const geminiResult = await selectBestImageWithAI(
        gear.name,
        gear.brand,
        images,
        searchResult.results
      );

      if (!geminiResult.imageUrl) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Could not identify suitable image',
          reasoning: geminiResult.reasoning,
          gearId: gear.id,
          imagesFound: images.length
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Validate the image
      const isValid = await validateImageUrl(geminiResult.imageUrl);
      if (!isValid) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Image URL validation failed',
          imageUrl: geminiResult.imageUrl,
          gearId: gear.id
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Update database
      const { error: updateError } = await supabase
        .from('gear_catalog')
        .update({
          image_url: geminiResult.imageUrl,
          image_attribution: JSON.stringify({
            source: 'firecrawl_search',
            scraped_at: new Date().toISOString(),
            confidence: geminiResult.confidence,
            reasoning: geminiResult.reasoning
          }),
          updated_at: new Date().toISOString()
        })
        .eq('id', gear.id);

      if (updateError) {
        return new Response(JSON.stringify({
          success: false,
          error: `Database update failed: ${updateError.message}`,
          gearId: gear.id
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({
        success: true,
        gearId: gear.id,
        gearName: `${gear.brand} ${gear.name}`,
        imageUrl: geminiResult.imageUrl,
        confidence: geminiResult.confidence,
        reasoning: geminiResult.reasoning
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Batch scrape
    if (action === 'scrape-batch') {
      const { data: gearItems, error: fetchError } = await supabase
        .from('gear_catalog')
        .select('id, name, brand')
        .or('image_url.is.null,image_url.eq.')
        .limit(batchSize);

      if (fetchError || !gearItems?.length) {
        return new Response(JSON.stringify({
          success: true,
          message: 'No items need images',
          processed: 0
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const results = [];
      
      for (const gear of gearItems) {
        console.log(`Processing: ${gear.brand} ${gear.name}`);
        
        // Check Wikimedia fallback first
        if (WIKIMEDIA_FALLBACKS[gear.id]) {
          const wikiUrl = WIKIMEDIA_FALLBACKS[gear.id];
          const isValid = await validateImageUrl(wikiUrl);
          
          if (isValid) {
            await supabase
              .from('gear_catalog')
              .update({
                image_url: wikiUrl,
                image_attribution: JSON.stringify({
                  source: 'wikimedia_commons',
                  license: 'CC',
                  scraped_at: new Date().toISOString()
                }),
                updated_at: new Date().toISOString()
              })
              .eq('id', gear.id);

            results.push({
              gearId: gear.id,
              gearName: `${gear.brand} ${gear.name}`,
              success: true,
              imageUrl: wikiUrl,
              source: 'wikimedia_fallback',
              confidence: 95
            });
            continue;
          }
        }

        // Search for images
        const searchResult = await searchForProductImages(gear.name, gear.brand, gear.id);
        
        if (!searchResult.success || !searchResult.results?.length) {
          results.push({
            gearId: gear.id,
            success: false,
            error: searchResult.error || 'No search results'
          });
          await new Promise(r => setTimeout(r, 500));
          continue;
        }

        // Extract images
        const images = extractImagesFromResults(searchResult.results);

        if (images.length === 0) {
          results.push({
            gearId: gear.id,
            success: false,
            error: 'No images in search results'
          });
          await new Promise(r => setTimeout(r, 500));
          continue;
        }

        // Analyze with multi-model AI
        const geminiResult = await selectBestImageWithAI(
          gear.name,
          gear.brand,
          images,
          searchResult.results
        );

        if (!geminiResult.imageUrl) {
          results.push({
            gearId: gear.id,
            success: false,
            error: 'No suitable image found',
            reasoning: geminiResult.reasoning
          });
          await new Promise(r => setTimeout(r, 500));
          continue;
        }

        // Validate
        const isValid = await validateImageUrl(geminiResult.imageUrl);
        if (!isValid) {
          results.push({
            gearId: gear.id,
            success: false,
            error: 'Image validation failed'
          });
          await new Promise(r => setTimeout(r, 500));
          continue;
        }

        // Update DB
        const { error: updateError } = await supabase
          .from('gear_catalog')
          .update({
            image_url: geminiResult.imageUrl,
            image_attribution: JSON.stringify({
              source: 'firecrawl_search',
              scraped_at: new Date().toISOString(),
              confidence: geminiResult.confidence
            }),
            updated_at: new Date().toISOString()
          })
          .eq('id', gear.id);

        results.push({
          gearId: gear.id,
          gearName: `${gear.brand} ${gear.name}`,
          success: !updateError,
          imageUrl: geminiResult.imageUrl,
          confidence: geminiResult.confidence,
          error: updateError?.message
        });

        // Delay between items
        await new Promise(r => setTimeout(r, 1500));
      }

      const successCount = results.filter(r => r.success).length;
      
      return new Response(JSON.stringify({
        success: true,
        processed: results.length,
        successCount,
        failedCount: results.length - successCount,
        results
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid action. Use: status, scrape-single, scrape-batch'
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('Function error:', err);
    return new Response(JSON.stringify({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
