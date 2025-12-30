import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Use Firecrawl web search to find product images
async function searchForProductImages(gearName: string, gearBrand: string): Promise<{ success: boolean; results?: any[]; error?: string }> {
  if (!FIRECRAWL_API_KEY) {
    return { success: false, error: 'Firecrawl API key not configured' };
  }

  try {
    // Search for the product with image focus
    const query = `${gearBrand} ${gearName} synth drum machine official product image`;
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

// Use Gemini to analyze and select the best product image
async function selectBestImageWithGemini(
  gearName: string, 
  gearBrand: string, 
  images: string[],
  searchResults: any[]
): Promise<{ imageUrl: string | null; confidence: number; reasoning: string }> {
  if (!LOVABLE_API_KEY) {
    return { imageUrl: null, confidence: 0, reasoning: 'Lovable API key not configured' };
  }

  if (images.length === 0) {
    return { imageUrl: null, confidence: 0, reasoning: 'No images found to analyze' };
  }

  try {
    // Build context from search results
    const context = searchResults.slice(0, 3).map(r => 
      `Source: ${r.url}\nTitle: ${r.title || 'N/A'}\n${(r.markdown || '').slice(0, 500)}`
    ).join('\n\n---\n\n');

    const prompt = `You are selecting the best product image for "${gearBrand} ${gearName}" music equipment.

Found ${images.length} potential images. Here are the URLs:
${images.slice(0, 20).map((img, i) => `${i + 1}. ${img}`).join('\n')}

Context from search results:
${context}

Select the BEST image URL that shows the actual "${gearBrand} ${gearName}" product:

Criteria:
1. Must be the actual product (synth, drum machine, mixer, etc.) - NOT a logo or icon
2. Prefer official manufacturer images or professional product shots
3. Prefer larger, high-quality images (look for "large", "1200", "full", "product" in URL)
4. Prefer URLs from manufacturer sites or reputable music gear retailers
5. Avoid thumbnails (small dimensions in URL), social media icons, navigation elements
6. Wikimedia Commons images are excellent if verified

Return ONLY valid JSON (no markdown formatting):
{
  "imageUrl": "the best image URL or null if none are suitable",
  "confidence": 0-100,
  "reasoning": "why this image was selected"
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert at identifying product images. Always respond with valid JSON only, no markdown.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return { imageUrl: null, confidence: 0, reasoning: `API error: ${response.status}` };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        imageUrl: result.imageUrl || null,
        confidence: result.confidence || 0,
        reasoning: result.reasoning || 'No reasoning provided'
      };
    }

    return { imageUrl: null, confidence: 0, reasoning: 'Failed to parse Gemini response' };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Gemini analysis error:', errorMessage);
    return { imageUrl: null, confidence: 0, reasoning: errorMessage };
  }
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
      const searchResult = await searchForProductImages(gear.name, gear.brand);
      
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

      // Use Gemini to select best image
      const geminiResult = await selectBestImageWithGemini(
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
        const searchResult = await searchForProductImages(gear.name, gear.brand);
        
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

        // Analyze with Gemini
        const geminiResult = await selectBestImageWithGemini(
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
