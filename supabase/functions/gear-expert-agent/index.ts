import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface GearItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  short_description?: string;
  techno_applications?: string;
  notable_features?: string;
  strengths?: string;
  limitations?: string;
  synthesis_type?: string;
  release_year?: number;
}

// Helper to scrape a URL using Firecrawl
async function scrapeUrl(url: string): Promise<{ success: boolean; markdown?: string; error?: string }> {
  if (!FIRECRAWL_API_KEY) {
    return { success: false, error: 'Firecrawl API key not configured' };
  }

  try {
    console.log('Scraping URL:', url);
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: true,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Firecrawl error:', data);
      return { success: false, error: data.error || `HTTP ${response.status}` };
    }

    const markdown = data.data?.markdown || data.markdown;
    console.log('Scraped content length:', markdown?.length || 0);
    return { success: true, markdown };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown scrape error';
    console.error('Scrape error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Helper to search using Firecrawl
async function searchWeb(query: string): Promise<{ success: boolean; results?: any[]; error?: string }> {
  if (!FIRECRAWL_API_KEY) {
    return { success: false, error: 'Firecrawl API key not configured' };
  }

  try {
    console.log('Searching:', query);
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit: 5,
        scrapeOptions: { formats: ['markdown'] }
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { action, gearId, query, limit } = await req.json();

    // Get gear catalog stats
    const { count: totalGear } = await supabase
      .from('gear_catalog')
      .select('*', { count: 'exact', head: true });

    const { count: withDescriptions } = await supabase
      .from('gear_catalog')
      .select('*', { count: 'exact', head: true })
      .not('short_description', 'is', null)
      .neq('short_description', '');

    const { count: withTechnoApps } = await supabase
      .from('gear_catalog')
      .select('*', { count: 'exact', head: true })
      .not('techno_applications', 'is', null)
      .neq('techno_applications', '');

    if (action === 'status') {
      const { data: recentItems } = await supabase
        .from('gear_catalog')
        .select('id, name, brand, category, short_description')
        .order('updated_at', { ascending: false })
        .limit(5);

      const { data: needsContent } = await supabase
        .from('gear_catalog')
        .select('id, name, brand')
        .or('short_description.is.null,techno_applications.is.null')
        .limit(10);

      return new Response(JSON.stringify({
        status: 'healthy',
        stats: {
          totalGear,
          withDescriptions,
          withTechnoApps,
          completionRate: totalGear ? Math.round((withDescriptions! / totalGear) * 100) : 0
        },
        recentItems,
        needsContent,
        firecrawlEnabled: !!FIRECRAWL_API_KEY,
        message: `Gear Expert Agent: ${totalGear} items in catalog, ${withDescriptions} have descriptions`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // NEW: Scrape equipboard.com for a specific gear item
    if (action === 'scrape-equipboard' && gearId) {
      const { data: gear, error: gearError } = await supabase
        .from('gear_catalog')
        .select('*')
        .eq('id', gearId)
        .single();

      if (gearError || !gear) {
        throw new Error(`Gear not found: ${gearId}`);
      }

      // Build equipboard URL slug
      const brandSlug = gear.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const nameSlug = gear.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const equipboardUrl = `https://equipboard.com/items/${brandSlug}-${nameSlug}`;
      
      console.log(`Scraping Equipboard for ${gear.brand} ${gear.name}: ${equipboardUrl}`);
      
      // Try direct URL first
      let scrapeResult = await scrapeUrl(equipboardUrl);
      
      // If direct URL fails, try search
      if (!scrapeResult.success || !scrapeResult.markdown) {
        console.log('Direct URL failed, trying search...');
        const searchResult = await searchWeb(`site:equipboard.com ${gear.brand} ${gear.name}`);
        
        if (searchResult.success && searchResult.results && searchResult.results.length > 0) {
          const firstResult = searchResult.results[0];
          scrapeResult = { success: true, markdown: firstResult.markdown };
        }
      }

      if (!scrapeResult.success || !scrapeResult.markdown) {
        return new Response(JSON.stringify({
          success: false,
          gearId,
          gearName: `${gear.brand} ${gear.name}`,
          error: scrapeResult.error || 'No content found on Equipboard',
          urlAttempted: equipboardUrl
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Use OpenAI to extract structured data from scraped content
      const extractionPrompt = `You are extracting gear information from Equipboard.com content. Parse this content about ${gear.brand} ${gear.name} and extract structured data.

SCRAPED CONTENT:
${scrapeResult.markdown.slice(0, 8000)}

Extract and return JSON with these fields (use null if not found):
{
  "notable_artists": ["array of artist names who use this gear"],
  "famous_tracks": ["array of notable tracks made with this gear"],
  "short_description": "compelling 2-3 sentence description",
  "notable_features": "key features mentioned",
  "techno_applications": "how this is used in electronic/techno music production",
  "strengths": "what users praise about it",
  "limitations": "any drawbacks mentioned"
}`;

      const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You extract structured data from web content. Return valid JSON only.' },
            { role: 'user', content: extractionPrompt }
          ],
          response_format: { type: "json_object" }
        }),
      });

      const aiData = await aiResponse.json();
      const extracted = JSON.parse(aiData.choices[0].message.content);

      // Update gear item with extracted data
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString(),
        data_sources: [...(gear.data_sources || []), 'equipboard.com']
      };

      if (extracted.notable_artists && extracted.notable_artists.length > 0) {
        updateData.notable_artists = extracted.notable_artists;
      }
      if (extracted.famous_tracks && extracted.famous_tracks.length > 0) {
        updateData.famous_tracks = extracted.famous_tracks;
      }
      if (extracted.short_description && !gear.short_description) {
        updateData.short_description = extracted.short_description;
      }
      if (extracted.notable_features && !gear.notable_features) {
        updateData.notable_features = extracted.notable_features;
      }
      if (extracted.techno_applications && !gear.techno_applications) {
        updateData.techno_applications = extracted.techno_applications;
      }
      if (extracted.strengths && !gear.strengths) {
        updateData.strengths = extracted.strengths;
      }
      if (extracted.limitations && !gear.limitations) {
        updateData.limitations = extracted.limitations;
      }

      const { error: updateError } = await supabase
        .from('gear_catalog')
        .update(updateData)
        .eq('id', gearId);

      if (updateError) throw updateError;

      return new Response(JSON.stringify({
        success: true,
        gearId,
        gearName: `${gear.brand} ${gear.name}`,
        extracted,
        fieldsUpdated: Object.keys(updateData).filter(k => k !== 'updated_at' && k !== 'data_sources'),
        source: equipboardUrl,
        message: `Successfully scraped and enriched ${gear.name} from Equipboard`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // NEW: Batch scrape multiple gear items from Equipboard
    if (action === 'batch-scrape-equipboard') {
      const batchLimit = limit || 3;
      
      // Get gear items that haven't been scraped from equipboard yet
      const { data: gearToScrape } = await supabase
        .from('gear_catalog')
        .select('id, name, brand, data_sources')
        .limit(batchLimit);

      // Filter to items without equipboard data
      const needsScraping = gearToScrape?.filter(g => 
        !g.data_sources || !g.data_sources.includes('equipboard.com')
      ).slice(0, batchLimit) || [];

      if (needsScraping.length === 0) {
        return new Response(JSON.stringify({
          success: true,
          scraped: 0,
          message: 'All gear items have been scraped from Equipboard'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const results = [];
      for (const gear of needsScraping) {
        try {
          // Add delay between requests to avoid rate limiting
          if (results.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }

          const brandSlug = gear.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const nameSlug = gear.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const equipboardUrl = `https://equipboard.com/items/${brandSlug}-${nameSlug}`;
          
          console.log(`Batch scraping: ${gear.brand} ${gear.name}`);
          
          let scrapeResult = await scrapeUrl(equipboardUrl);
          
          if (!scrapeResult.success || !scrapeResult.markdown) {
            const searchResult = await searchWeb(`site:equipboard.com ${gear.brand} ${gear.name}`);
            if (searchResult.success && searchResult.results && searchResult.results.length > 0) {
              scrapeResult = { success: true, markdown: searchResult.results[0].markdown };
            }
          }

          if (!scrapeResult.success || !scrapeResult.markdown) {
            results.push({ id: gear.id, name: gear.name, success: false, error: 'No content found' });
            continue;
          }

          // Extract data with AI
          const extractionPrompt = `Extract gear info from this Equipboard content about ${gear.brand} ${gear.name}. Return JSON with: notable_artists (array), famous_tracks (array), short_description, notable_features, techno_applications, strengths, limitations. Use null if not found.

CONTENT:
${scrapeResult.markdown.slice(0, 6000)}`;

          const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: 'Extract structured JSON from web content.' },
                { role: 'user', content: extractionPrompt }
              ],
              response_format: { type: "json_object" }
            }),
          });

          const aiData = await aiResponse.json();
          const extracted = JSON.parse(aiData.choices[0].message.content);

          // Get current gear data for merging
          const { data: currentGear } = await supabase
            .from('gear_catalog')
            .select('*')
            .eq('id', gear.id)
            .single();

          const updateData: Record<string, any> = {
            updated_at: new Date().toISOString(),
            data_sources: [...(currentGear?.data_sources || []), 'equipboard.com']
          };

          if (extracted.notable_artists?.length > 0) updateData.notable_artists = extracted.notable_artists;
          if (extracted.famous_tracks?.length > 0) updateData.famous_tracks = extracted.famous_tracks;
          if (extracted.short_description && !currentGear?.short_description) updateData.short_description = extracted.short_description;
          if (extracted.notable_features && !currentGear?.notable_features) updateData.notable_features = extracted.notable_features;
          if (extracted.techno_applications && !currentGear?.techno_applications) updateData.techno_applications = extracted.techno_applications;
          if (extracted.strengths && !currentGear?.strengths) updateData.strengths = extracted.strengths;
          if (extracted.limitations && !currentGear?.limitations) updateData.limitations = extracted.limitations;

          await supabase
            .from('gear_catalog')
            .update(updateData)
            .eq('id', gear.id);

          results.push({ 
            id: gear.id, 
            name: `${gear.brand} ${gear.name}`, 
            success: true,
            artistsFound: extracted.notable_artists?.length || 0
          });

        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          console.error(`Failed to scrape ${gear.name}:`, errorMessage);
          results.push({ id: gear.id, name: gear.name, success: false, error: errorMessage });
        }
      }

      const successCount = results.filter(r => r.success).length;
      return new Response(JSON.stringify({
        success: true,
        scraped: successCount,
        total: results.length,
        results,
        message: `Batch scrape complete: ${successCount}/${results.length} items from Equipboard`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Original enrich action (AI-generated content without scraping)
    if (action === 'enrich' && gearId) {
      const { data: gear, error: gearError } = await supabase
        .from('gear_catalog')
        .select('*')
        .eq('id', gearId)
        .single();

      if (gearError || !gear) {
        throw new Error(`Gear not found: ${gearId}`);
      }

      const prompt = `You are a techno music gear expert. Generate detailed content for this synthesizer/drum machine/equipment used in techno production.

Equipment: ${gear.name}
Brand: ${gear.brand}
Category: ${gear.category}
Release Year: ${gear.release_year || 'Unknown'}
Synthesis Type: ${gear.synthesis_type || 'Unknown'}

Generate the following in JSON format:
{
  "short_description": "A compelling 2-3 sentence description emphasizing its importance in techno",
  "techno_applications": "How this gear is specifically used in techno production (2-3 sentences)",
  "notable_features": "Key technical features that matter for techno producers",
  "strengths": "What makes this gear exceptional for techno",
  "limitations": "Honest assessment of any drawbacks"
}

Focus on warehouse techno, industrial, Detroit, and Berlin-style production. Be specific and technical.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an expert in electronic music gear, especially synthesizers and drum machines used in techno production.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: "json_object" }
        }),
      });

      const aiData = await response.json();
      const content = JSON.parse(aiData.choices[0].message.content);

      const { error: updateError } = await supabase
        .from('gear_catalog')
        .update({
          short_description: content.short_description,
          techno_applications: content.techno_applications,
          notable_features: content.notable_features,
          strengths: content.strengths,
          limitations: content.limitations,
          updated_at: new Date().toISOString()
        })
        .eq('id', gearId);

      if (updateError) throw updateError;

      return new Response(JSON.stringify({
        success: true,
        gearId,
        content,
        message: `Successfully enriched ${gear.name}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'batch-enrich') {
      const { data: needsContent } = await supabase
        .from('gear_catalog')
        .select('id, name, brand, category, release_year, synthesis_type')
        .or('short_description.is.null,techno_applications.is.null')
        .limit(3);

      if (!needsContent || needsContent.length === 0) {
        return new Response(JSON.stringify({
          success: true,
          enriched: 0,
          message: 'All gear items already have content'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const results = [];
      for (const gear of needsContent) {
        try {
          const prompt = `Generate techno-focused content for ${gear.brand} ${gear.name} (${gear.category}). Return JSON with: short_description, techno_applications, notable_features, strengths, limitations. Focus on warehouse/industrial/Detroit/Berlin techno.`;

          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: 'You are a techno gear expert. Return only valid JSON.' },
                { role: 'user', content: prompt }
              ],
              response_format: { type: "json_object" }
            }),
          });

          const aiData = await response.json();
          const content = JSON.parse(aiData.choices[0].message.content);

          await supabase
            .from('gear_catalog')
            .update({
              short_description: content.short_description,
              techno_applications: content.techno_applications,
              notable_features: content.notable_features,
              strengths: content.strengths,
              limitations: content.limitations,
              updated_at: new Date().toISOString()
            })
            .eq('id', gear.id);

          results.push({ id: gear.id, name: gear.name, success: true });
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          results.push({ id: gear.id, name: gear.name, success: false, error: errorMessage });
        }
      }

      return new Response(JSON.stringify({
        success: true,
        enriched: results.filter(r => r.success).length,
        results,
        message: `Batch enrichment complete: ${results.filter(r => r.success).length}/${results.length} items`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'chat' && query) {
      const { data: allGear } = await supabase
        .from('gear_catalog')
        .select('name, brand, category, synthesis_type, release_year')
        .limit(100);

      const gearContext = allGear?.map(g => `${g.brand} ${g.name} (${g.category})`).join(', ');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: `You are the Gear Expert Agent for TechnoDog, an encyclopedia of techno music gear. You have deep knowledge of synthesizers, drum machines, and production equipment used in techno.

Your database contains: ${gearContext}

You speak with authority about gear specifications, techno production techniques, and which artists use what equipment. You're passionate about warehouse techno, industrial, and the Detroit/Berlin scenes.

Keep responses focused and technical but accessible. Use specific examples when possible.`
            },
            { role: 'user', content: query }
          ],
        }),
      });

      const aiData = await response.json();
      const answer = aiData.choices[0].message.content;

      return new Response(JSON.stringify({
        success: true,
        response: answer,
        context: { totalGear, withDescriptions }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Default: return agent info
    return new Response(JSON.stringify({
      agent: 'Gear Expert',
      version: '2.0',
      capabilities: ['status', 'enrich', 'batch-enrich', 'scrape-equipboard', 'batch-scrape-equipboard', 'chat'],
      firecrawlEnabled: !!FIRECRAWL_API_KEY,
      stats: { totalGear, withDescriptions, withTechnoApps }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Gear Expert Agent error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
