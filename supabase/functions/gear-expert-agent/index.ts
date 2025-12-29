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

    // NEW: Gap analysis - check what data is missing across all gear items
    if (action === 'gap-analysis') {
      const { data: allGear } = await supabase
        .from('gear_catalog')
        .select('id, name, brand, short_description, techno_applications, notable_artists, famous_tracks, youtube_videos, image_url, notable_features, strengths, limitations, data_sources')
        .order('name');

      const gaps = {
        missingDescription: [] as { id: string; name: string; brand: string }[],
        missingTechnoApps: [] as { id: string; name: string; brand: string }[],
        missingArtists: [] as { id: string; name: string; brand: string }[],
        missingTracks: [] as { id: string; name: string; brand: string }[],
        missingVideos: [] as { id: string; name: string; brand: string }[],
        missingImage: [] as { id: string; name: string; brand: string }[],
        missingFeatures: [] as { id: string; name: string; brand: string }[],
        notScrapedYet: [] as { id: string; name: string; brand: string }[],
      };

      for (const gear of allGear || []) {
        const gearInfo = { id: gear.id, name: gear.name, brand: gear.brand };
        
        if (!gear.short_description) gaps.missingDescription.push(gearInfo);
        if (!gear.techno_applications) gaps.missingTechnoApps.push(gearInfo);
        if (!gear.notable_artists || (Array.isArray(gear.notable_artists) && gear.notable_artists.length === 0)) {
          gaps.missingArtists.push(gearInfo);
        }
        if (!gear.famous_tracks || (Array.isArray(gear.famous_tracks) && gear.famous_tracks.length === 0)) {
          gaps.missingTracks.push(gearInfo);
        }
        if (!gear.youtube_videos || (Array.isArray(gear.youtube_videos) && gear.youtube_videos.length === 0)) {
          gaps.missingVideos.push(gearInfo);
        }
        if (!gear.image_url) gaps.missingImage.push(gearInfo);
        if (!gear.notable_features) gaps.missingFeatures.push(gearInfo);
        if (!gear.data_sources || !gear.data_sources.includes('equipboard.com')) {
          gaps.notScrapedYet.push(gearInfo);
        }
      }

      const summary = {
        totalItems: allGear?.length || 0,
        gapsFound: {
          description: gaps.missingDescription.length,
          technoApplications: gaps.missingTechnoApps.length,
          notableArtists: gaps.missingArtists.length,
          famousTracks: gaps.missingTracks.length,
          youtubeVideos: gaps.missingVideos.length,
          images: gaps.missingImage.length,
          features: gaps.missingFeatures.length,
          notScraped: gaps.notScrapedYet.length
        }
      };

      return new Response(JSON.stringify({
        success: true,
        summary,
        gaps,
        message: `Gap analysis complete: ${gaps.notScrapedYet.length} items need scraping, ${gaps.missingDescription.length} need descriptions`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // NEW: Fill gaps - scrape and enrich items with missing data
    if (action === 'fill-gaps') {
      const batchLimit = limit || 5;
      
      // Get gear items with the most gaps first (prioritize items not yet scraped)
      const { data: allGear } = await supabase
        .from('gear_catalog')
        .select('*')
        .order('name');

      // Score each item by how many gaps it has
      const scoredGear = (allGear || []).map(gear => {
        let gapScore = 0;
        if (!gear.short_description) gapScore += 2;
        if (!gear.techno_applications) gapScore += 2;
        if (!gear.notable_artists || (Array.isArray(gear.notable_artists) && gear.notable_artists.length === 0)) gapScore += 3;
        if (!gear.famous_tracks || (Array.isArray(gear.famous_tracks) && gear.famous_tracks.length === 0)) gapScore += 2;
        if (!gear.notable_features) gapScore += 1;
        if (!gear.strengths) gapScore += 1;
        if (!gear.limitations) gapScore += 1;
        if (!gear.data_sources || !gear.data_sources.includes('equipboard.com')) gapScore += 5;
        return { ...gear, gapScore };
      });

      // Sort by gap score (most gaps first) and take top items
      const prioritizedGear = scoredGear
        .filter(g => g.gapScore > 0)
        .sort((a, b) => b.gapScore - a.gapScore)
        .slice(0, batchLimit);

      if (prioritizedGear.length === 0) {
        return new Response(JSON.stringify({
          success: true,
          filled: 0,
          message: 'All gear items are fully populated!'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const results = [];
      
      for (const gear of prioritizedGear) {
        try {
          console.log(`Filling gaps for: ${gear.brand} ${gear.name} (gap score: ${gear.gapScore})`);
          
          // Add delay between requests
          if (results.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 2500));
          }

          const needsScraping = !gear.data_sources || !gear.data_sources.includes('equipboard.com');
          let scrapedData: any = {};

          // Step 1: Scrape from Equipboard if not done yet
          if (needsScraping && FIRECRAWL_API_KEY) {
            const brandSlug = gear.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const nameSlug = gear.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const equipboardUrl = `https://equipboard.com/items/${brandSlug}-${nameSlug}`;
            
            console.log(`Scraping: ${equipboardUrl}`);
            let scrapeResult = await scrapeUrl(equipboardUrl);
            
            // Try search if direct URL fails
            if (!scrapeResult.success || !scrapeResult.markdown) {
              const searchResult = await searchWeb(`site:equipboard.com ${gear.brand} ${gear.name}`);
              if (searchResult.success && searchResult.results && searchResult.results.length > 0) {
                scrapeResult = { success: true, markdown: searchResult.results[0].markdown };
              }
            }

            if (scrapeResult.success && scrapeResult.markdown) {
              // Extract data with AI
              const extractionPrompt = `Extract gear info from Equipboard for ${gear.brand} ${gear.name}. Return JSON with:
{
  "notable_artists": [{"name": "Artist Name", "usage": "How they use it"}],
  "famous_tracks": [{"artist": "Artist", "title": "Track", "year": 2020, "role": "bassline/drums/etc"}],
  "short_description": "2-3 sentences about this gear in techno context",
  "notable_features": "Key features for techno producers",
  "techno_applications": "Specific techno production uses",
  "strengths": "What's great about it",
  "limitations": "Any drawbacks"
}
Use null for fields with no data. For arrays, use empty [] if nothing found.

CONTENT:
${scrapeResult.markdown.slice(0, 7000)}`;

              const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${OPENAI_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  model: 'gpt-4o-mini',
                  messages: [
                    { role: 'system', content: 'Extract structured JSON from web content. Focus on techno/electronic music context.' },
                    { role: 'user', content: extractionPrompt }
                  ],
                  response_format: { type: "json_object" }
                }),
              });

              const aiData = await aiResponse.json();
              scrapedData = JSON.parse(aiData.choices[0].message.content);
            }
          }

          // Step 2: Generate AI content for remaining gaps
          const missingFields = [];
          if (!gear.short_description && !scrapedData.short_description) missingFields.push('short_description');
          if (!gear.techno_applications && !scrapedData.techno_applications) missingFields.push('techno_applications');
          if (!gear.notable_features && !scrapedData.notable_features) missingFields.push('notable_features');
          if (!gear.strengths && !scrapedData.strengths) missingFields.push('strengths');
          if (!gear.limitations && !scrapedData.limitations) missingFields.push('limitations');

          let aiGeneratedData: any = {};
          if (missingFields.length > 0) {
            const generatePrompt = `Generate techno-focused content for ${gear.brand} ${gear.name} (${gear.category}, ${gear.release_year || 'year unknown'}).

Return JSON with ONLY these fields: ${missingFields.join(', ')}

Focus on warehouse techno, industrial, Detroit, and Berlin-style production. Be specific and technical.`;

            const genResponse = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                  { role: 'system', content: 'You are a techno gear expert. Generate accurate, technical content.' },
                  { role: 'user', content: generatePrompt }
                ],
                response_format: { type: "json_object" }
              }),
            });

            const genData = await genResponse.json();
            aiGeneratedData = JSON.parse(genData.choices[0].message.content);
          }

          // Step 3: Merge and update
          const updateData: Record<string, any> = {
            updated_at: new Date().toISOString(),
          };

          // Add data_sources if scraped
          if (needsScraping && Object.keys(scrapedData).length > 0) {
            updateData.data_sources = [...(gear.data_sources || []), 'equipboard.com'];
          }

          // Merge scraped data (priority) with AI generated data (fallback)
          const mergedData = { ...aiGeneratedData, ...scrapedData };

          if (mergedData.notable_artists && mergedData.notable_artists.length > 0 && 
              (!gear.notable_artists || gear.notable_artists.length === 0)) {
            updateData.notable_artists = mergedData.notable_artists;
          }
          if (mergedData.famous_tracks && mergedData.famous_tracks.length > 0 && 
              (!gear.famous_tracks || gear.famous_tracks.length === 0)) {
            updateData.famous_tracks = mergedData.famous_tracks;
          }
          if (mergedData.short_description && !gear.short_description) {
            updateData.short_description = mergedData.short_description;
          }
          if (mergedData.notable_features && !gear.notable_features) {
            updateData.notable_features = mergedData.notable_features;
          }
          if (mergedData.techno_applications && !gear.techno_applications) {
            updateData.techno_applications = mergedData.techno_applications;
          }
          if (mergedData.strengths && !gear.strengths) {
            updateData.strengths = mergedData.strengths;
          }
          if (mergedData.limitations && !gear.limitations) {
            updateData.limitations = mergedData.limitations;
          }

          const fieldsUpdated = Object.keys(updateData).filter(k => k !== 'updated_at' && k !== 'data_sources');

          if (fieldsUpdated.length > 0 || updateData.data_sources) {
            await supabase
              .from('gear_catalog')
              .update(updateData)
              .eq('id', gear.id);
          }

          results.push({
            id: gear.id,
            name: `${gear.brand} ${gear.name}`,
            gapScore: gear.gapScore,
            scraped: needsScraping && Object.keys(scrapedData).length > 0,
            fieldsUpdated,
            success: true
          });

        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          console.error(`Failed to fill gaps for ${gear.name}:`, errorMessage);
          results.push({ 
            id: gear.id, 
            name: `${gear.brand} ${gear.name}`, 
            success: false, 
            error: errorMessage 
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const totalFieldsUpdated = results.reduce((acc, r) => acc + (r.fieldsUpdated?.length || 0), 0);

      return new Response(JSON.stringify({
        success: true,
        processed: successCount,
        total: results.length,
        totalFieldsUpdated,
        results,
        message: `Gap filling complete: ${successCount}/${results.length} items processed, ${totalFieldsUpdated} fields updated`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // NEW: Enrich technical specifications in batches
    if (action === 'enrich-technical-specs') {
      const batchLimit = limit || 3;
      
      // Find gear items missing technical specs - prioritize synths
      const { data: allGear } = await supabase
        .from('gear_catalog')
        .select('*')
        .order('category', { ascending: true }) // synths first
        .order('name', { ascending: true });

      // Score items by missing technical specs
      const scoredGear = (allGear || []).map(gear => {
        let specScore = 0;
        if (!gear.oscillators_per_voice && gear.category === 'synth') specScore += 3;
        if (!gear.oscillator_types && gear.category === 'synth') specScore += 2;
        if (!gear.filters) specScore += 2;
        if (!gear.lfos && gear.category === 'synth') specScore += 2;
        if (!gear.envelopes && gear.category === 'synth') specScore += 2;
        if (!gear.effects_onboard) specScore += 1;
        if (!gear.polyphony) specScore += 2;
        if (!gear.sequencer_arp) specScore += 1;
        return { ...gear, specScore };
      });

      // Get items with missing specs
      const needsSpecs = scoredGear
        .filter(g => g.specScore > 0)
        .sort((a, b) => b.specScore - a.specScore)
        .slice(0, batchLimit);

      if (needsSpecs.length === 0) {
        return new Response(JSON.stringify({
          success: true,
          enriched: 0,
          message: 'All gear items have complete technical specs!'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const results = [];
      
      for (const gear of needsSpecs) {
        try {
          console.log(`Enriching technical specs for: ${gear.brand} ${gear.name} (category: ${gear.category})`);
          
          // Add delay between API calls
          if (results.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 1500));
          }

          // Generate technical specs using AI
          const specPrompt = `You are a synthesizer and music gear expert. Generate detailed technical specifications for the ${gear.brand} ${gear.name} (${gear.category}, released ${gear.release_year || 'unknown year'}).

Current known data:
- Category: ${gear.category}
- Synthesis Type: ${gear.synthesis_type || 'unknown'}
- Brand: ${gear.brand}

Return a JSON object with ONLY these fields (use null if not applicable to this type of gear):
{
  "oscillators_per_voice": "e.g., '3', '2 + sub', 'N/A for samplers'",
  "oscillator_types": "e.g., '3 VCO (saw/pulse/tri)', '2 DCO + noise', 'Digital wavetable'",
  "filters": "e.g., '24dB/oct Moog ladder LPF', 'Multimode SVF (LP/HP/BP)', '12dB/oct resonant LPF'",
  "lfos": "e.g., '2 LFO', '1 LFO with multiple shapes', 'Per-voice LFO'",
  "envelopes": "e.g., '2 ADSR', '3 EG (filter/amp/pitch)', '1 AD + 1 ADSR'",
  "effects_onboard": "e.g., 'Chorus, delay, reverb', 'Analog distortion', 'None/N/A'",
  "polyphony": "e.g., 'Monophonic', '8 voices', '16-voice multitimbral'",
  "sequencer_arp": "e.g., '16-step sequencer + arpeggiator', '64-step sequencer', 'None'"
}

Be accurate and specific to this exact model. For samplers/drum machines, adapt the fields appropriately (e.g., sampling spec instead of oscillators).`;

          const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: 'You are a music gear expert. Return accurate technical specifications as valid JSON.' },
                { role: 'user', content: specPrompt }
              ],
              response_format: { type: "json_object" }
            }),
          });

          const aiData = await aiResponse.json();
          const specs = JSON.parse(aiData.choices[0].message.content);

          // Build update object with only new values
          const updateData: Record<string, any> = {
            updated_at: new Date().toISOString(),
          };

          const fieldsUpdated: string[] = [];

          if (specs.oscillators_per_voice && !gear.oscillators_per_voice && specs.oscillators_per_voice !== 'null') {
            updateData.oscillators_per_voice = specs.oscillators_per_voice;
            fieldsUpdated.push('oscillators_per_voice');
          }
          if (specs.oscillator_types && !gear.oscillator_types && specs.oscillator_types !== 'null') {
            updateData.oscillator_types = specs.oscillator_types;
            fieldsUpdated.push('oscillator_types');
          }
          if (specs.filters && !gear.filters && specs.filters !== 'null') {
            updateData.filters = specs.filters;
            fieldsUpdated.push('filters');
          }
          if (specs.lfos && !gear.lfos && specs.lfos !== 'null') {
            updateData.lfos = specs.lfos;
            fieldsUpdated.push('lfos');
          }
          if (specs.envelopes && !gear.envelopes && specs.envelopes !== 'null') {
            updateData.envelopes = specs.envelopes;
            fieldsUpdated.push('envelopes');
          }
          if (specs.effects_onboard && !gear.effects_onboard && specs.effects_onboard !== 'null' && specs.effects_onboard !== 'None' && specs.effects_onboard !== 'N/A') {
            updateData.effects_onboard = specs.effects_onboard;
            fieldsUpdated.push('effects_onboard');
          }
          if (specs.polyphony && !gear.polyphony && specs.polyphony !== 'null') {
            updateData.polyphony = specs.polyphony;
            fieldsUpdated.push('polyphony');
          }
          if (specs.sequencer_arp && !gear.sequencer_arp && specs.sequencer_arp !== 'null' && specs.sequencer_arp !== 'None') {
            updateData.sequencer_arp = specs.sequencer_arp;
            fieldsUpdated.push('sequencer_arp');
          }

          if (fieldsUpdated.length > 0) {
            await supabase
              .from('gear_catalog')
              .update(updateData)
              .eq('id', gear.id);
          }

          results.push({
            id: gear.id,
            name: `${gear.brand} ${gear.name}`,
            category: gear.category,
            specScore: gear.specScore,
            fieldsUpdated,
            success: true
          });

        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          console.error(`Failed to enrich specs for ${gear.name}:`, errorMessage);
          results.push({ 
            id: gear.id, 
            name: `${gear.brand} ${gear.name}`, 
            success: false, 
            error: errorMessage 
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const totalFieldsUpdated = results.reduce((acc, r) => acc + (r.fieldsUpdated?.length || 0), 0);

      // Count remaining items needing specs
      const remainingCount = scoredGear.filter(g => g.specScore > 0).length - successCount;

      return new Response(JSON.stringify({
        success: true,
        processed: successCount,
        total: results.length,
        totalFieldsUpdated,
        remainingItems: remainingCount,
        results,
        message: `Technical specs enriched: ${successCount}/${results.length} items, ${totalFieldsUpdated} fields updated. ${remainingCount} items remaining.`
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
