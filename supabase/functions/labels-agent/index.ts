import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AgentRequest {
  action: 'sync_from_static' | 'enrich_label' | 'enrich_batch' | 'scrape_discogs' | 'analyze_catalog' | 'gap_analysis' | 'full_pipeline' | 'get_stats';
  params?: {
    labelId?: string;
    labelIds?: string[];
    batchSize?: number;
    priorityOnly?: boolean;
    forceRefresh?: boolean;
  };
}

// Model orchestration - each model has specific responsibilities
const MODEL_CONFIG = {
  primary: 'google/gemini-2.5-flash',      // Fast, efficient for most tasks
  research: 'openai/gpt-5-mini',           // Deep research and extraction
  validation: 'google/gemini-2.5-pro',     // Quality validation
  creative: 'openai/gpt-5-mini',           // Bio writing
};

// Discogs and other source URLs
const LABEL_SOURCES = {
  discogs: (name: string) => `https://www.discogs.com/search/?q=${encodeURIComponent(name)}&type=label`,
  residentAdvisor: (name: string) => `https://ra.co/search/?terms=${encodeURIComponent(name)}&scope=labels`,
  bandcamp: (name: string) => `https://${name.toLowerCase().replace(/\s+/g, '')}.bandcamp.com`,
};

async function callLovableAI(messages: { role: string; content: string }[], model: string = MODEL_CONFIG.primary) {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) throw new Error('LOVABLE_API_KEY not configured');

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    if (response.status === 429) throw new Error('Rate limited - please wait');
    if (response.status === 402) throw new Error('Credits exhausted');
    const error = await response.text();
    throw new Error(`AI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callFirecrawl(url: string, extractPrompt?: string) {
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!apiKey) {
    console.log('Firecrawl not configured, skipping scrape');
    return null;
  }

  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown', 'extract'],
        extract: extractPrompt ? {
          prompt: extractPrompt,
          schema: {
            type: 'object',
            properties: {
              labelName: { type: 'string' },
              founded: { type: 'string' },
              location: { type: 'string' },
              description: { type: 'string' },
              genres: { type: 'array', items: { type: 'string' } },
              artists: { type: 'array', items: { type: 'string' } },
              releases: { type: 'array', items: { type: 'object' } },
              website: { type: 'string' },
              socialLinks: { type: 'object' },
            }
          }
        } : undefined,
      }),
    });

    if (!response.ok) {
      console.error('Firecrawl error:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Firecrawl call failed:', error);
    return null;
  }
}

// Sync labels from static data to database
async function syncFromStaticData(supabase: any, staticLabels: any[]) {
  const results = { synced: 0, skipped: 0, errors: [] as string[] };

  for (const label of staticLabels) {
    try {
      // Check if label exists
      const { data: existing } = await supabase
        .from('labels')
        .select('id, label_name, enrichment_status')
        .eq('slug', label.id)
        .single();

      if (existing) {
        // Update without destroying enriched data
        const { error } = await supabase
          .from('labels')
          .update({
            label_name: existing.label_name || label.name,
            headquarters_city: label.city,
            headquarters_country: label.country,
            founded_year: label.founded,
            is_active: label.active,
            description: existing.description || label.description,
            founders: label.founders || existing.founders,
            key_artists: label.artists || existing.key_artists,
            tags: label.tags,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
        results.skipped++;
      } else {
        // Insert new label
        const { error } = await supabase
          .from('labels')
          .insert({
            slug: label.id,
            label_name: label.name,
            headquarters_city: label.city,
            headquarters_country: label.country,
            founded_year: label.founded,
            is_active: label.active,
            description: label.description,
            founders: label.founders,
            key_artists: label.artists,
            tags: label.tags,
            enrichment_status: 'pending',
          });

        if (error) throw error;
        results.synced++;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      results.errors.push(`${label.name}: ${error.message}`);
    }
  }

  return results;
}

// Enrich a single label using multi-model orchestration
async function enrichLabel(supabase: any, labelId: string, forceRefresh = false) {
  console.log(`Enriching label: ${labelId}`);

  // Get label data
  const { data: label, error: labelError } = await supabase
    .from('labels')
    .select('*')
    .eq('id', labelId)
    .single();

  if (labelError || !label) {
    throw new Error(`Label not found: ${labelId}`);
  }

  // Skip if recently enriched (unless forced)
  if (!forceRefresh && label.enrichment_status === 'complete' && label.last_enriched_at) {
    const daysSinceEnrich = (Date.now() - new Date(label.last_enriched_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceEnrich < 30) {
      console.log(`Skipping ${label.label_name} - enriched ${daysSinceEnrich.toFixed(1)} days ago`);
      return { skipped: true, reason: 'recently_enriched' };
    }
  }

  // Create enrichment run record
  const { data: run } = await supabase
    .from('labels_enrichment_runs')
    .insert({
      label_id: labelId,
      run_type: 'full_enrichment',
      status: 'running',
      models_used: Object.values(MODEL_CONFIG),
    })
    .select()
    .single();

  const stats = {
    firecrawlScrapes: 0,
    aiCalls: 0,
    claimsExtracted: 0,
    documentsCreated: 0,
  };

  const errors: string[] = [];
  const enrichedData: any = {};

  try {
    // Step 1: Scrape Discogs for label info
    const discogsUrl = LABEL_SOURCES.discogs(label.label_name);
    console.log(`Scraping Discogs: ${discogsUrl}`);
    
    const discogsData = await callFirecrawl(discogsUrl, `
      Extract information about the record label "${label.label_name}":
      - Full label name
      - Year founded
      - Location (city, country)
      - Description/about text
      - Music genres/styles
      - Notable artists on roster
      - Notable releases
      - Parent label if any
      - Official website
    `);
    
    if (discogsData) {
      stats.firecrawlScrapes++;
      
      // Store raw document
      await supabase.from('labels_documents').insert({
        label_id: labelId,
        document_type: 'discogs_scrape',
        title: `Discogs: ${label.label_name}`,
        content: JSON.stringify(discogsData),
        source_url: discogsUrl,
        source_name: 'discogs',
      });
      stats.documentsCreated++;
    }

    // Step 2: Try to scrape label website if available
    if (label.label_website_url) {
      console.log(`Scraping label website: ${label.label_website_url}`);
      
      const websiteData = await callFirecrawl(label.label_website_url, `
        Extract all information about this techno/electronic music record label:
        - Label philosophy and mission
        - Artists and roster
        - Release catalog info
        - Submission policy
        - Contact information
        - Social media links
        - Any notable facts or history
      `);
      
      if (websiteData) {
        stats.firecrawlScrapes++;
        
        await supabase.from('labels_documents').insert({
          label_id: labelId,
          document_type: 'website_scrape',
          title: `Website: ${label.label_name}`,
          content: JSON.stringify(websiteData),
          source_url: label.label_website_url,
          source_name: 'official_website',
        });
        stats.documentsCreated++;
      }
    }

    // Step 3: Use AI to research and synthesize information
    console.log('Calling AI for research synthesis');
    
    const researchPrompt = `You are an expert techno and electronic music researcher. Research and provide comprehensive information about the record label "${label.label_name}".

Current known data:
- City: ${label.headquarters_city || 'Unknown'}
- Country: ${label.headquarters_country || 'Unknown'}
- Founded: ${label.founded_year || 'Unknown'}
- Description: ${label.description || 'None'}
- Known artists: ${label.key_artists?.join(', ') || 'None'}

${discogsData ? `Discogs data:\n${JSON.stringify(discogsData.extract || discogsData, null, 2)}` : ''}

Provide a comprehensive JSON response with:
{
  "bio_short": "2-3 sentence label bio focusing on significance",
  "bio_long": "Detailed 2-3 paragraph history and significance",
  "philosophy": "Label's artistic philosophy and sound",
  "known_for": "What the label is most known for",
  "subgenres": ["array of specific subgenres"],
  "founded_year": number or null,
  "founders": ["array of founder names"],
  "key_artists": ["array of key artist names on the roster"],
  "key_releases": [{"title": "string", "artist": "string", "year": number}],
  "discogs_url": "official discogs URL if found",
  "bandcamp_url": "bandcamp URL if applicable",
  "soundcloud_url": "soundcloud URL if applicable",
  "instagram_url": "instagram URL if found",
  "enrichment_score": 0-100 based on data completeness
}`;

    const researchResult = await callLovableAI([
      { role: 'system', content: 'You are a techno music industry expert. Provide accurate, well-researched information. Return only valid JSON.' },
      { role: 'user', content: researchPrompt }
    ], MODEL_CONFIG.research);
    stats.aiCalls++;

    // Parse AI response
    try {
      const jsonMatch = researchResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const aiData = JSON.parse(jsonMatch[0]);
        Object.assign(enrichedData, aiData);
      }
    } catch (parseErr) {
      const parseError = parseErr instanceof Error ? parseErr : new Error('Parse error');
      errors.push(`Failed to parse research response: ${parseError.message}`);
    }

    // Step 4: Validate and enhance with second model
    if (Object.keys(enrichedData).length > 0) {
      console.log('Validating with secondary model');
      
      const validationPrompt = `Validate and enhance this record label information for "${label.label_name}":

${JSON.stringify(enrichedData, null, 2)}

Check for:
1. Factual accuracy (known techno labels, artists, etc.)
2. Completeness
3. Any corrections needed

Return JSON with:
{
  "validated": true/false,
  "corrections": {"field": "corrected_value"},
  "additions": {"field": "new_value"},
  "confidence_score": 0-100,
  "notes": "any important notes"
}`;

      const validationResult = await callLovableAI([
        { role: 'system', content: 'You are a techno music data validator. Be strict about accuracy.' },
        { role: 'user', content: validationPrompt }
      ], MODEL_CONFIG.validation);
      stats.aiCalls++;

      try {
        const jsonMatch = validationResult.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const validation = JSON.parse(jsonMatch[0]);
          
          // Apply corrections
          if (validation.corrections) {
            Object.assign(enrichedData, validation.corrections);
          }
          if (validation.additions) {
            Object.assign(enrichedData, validation.additions);
          }
          
          enrichedData.enrichment_score = validation.confidence_score || enrichedData.enrichment_score;
        }
      } catch (parseErr) {
        const parseError = parseErr instanceof Error ? parseErr : new Error('Parse error');
        errors.push(`Validation parse error: ${parseError.message}`);
      }
    }

    // Step 5: Update label in database
    const updateData: any = {
      enrichment_status: 'complete',
      last_enriched_at: new Date().toISOString(),
      enrichment_sources: {
        models_used: Object.values(MODEL_CONFIG),
        scrapes: stats.firecrawlScrapes,
        ai_calls: stats.aiCalls,
      },
    };

    // Merge enriched data
    if (enrichedData.bio_short) updateData.bio_short = enrichedData.bio_short;
    if (enrichedData.bio_long) updateData.bio_long = enrichedData.bio_long;
    if (enrichedData.philosophy) updateData.philosophy = enrichedData.philosophy;
    if (enrichedData.known_for) updateData.known_for = enrichedData.known_for;
    if (enrichedData.subgenres) updateData.subgenres = enrichedData.subgenres;
    if (enrichedData.founded_year && !label.founded_year) updateData.founded_year = enrichedData.founded_year;
    if (enrichedData.founders?.length) updateData.founders = enrichedData.founders;
    if (enrichedData.key_artists?.length) updateData.key_artists = enrichedData.key_artists;
    if (enrichedData.key_releases?.length) updateData.key_releases = enrichedData.key_releases;
    if (enrichedData.discogs_url) updateData.discogs_url = enrichedData.discogs_url;
    if (enrichedData.bandcamp_url) updateData.bandcamp_url = enrichedData.bandcamp_url;
    if (enrichedData.soundcloud_url) updateData.soundcloud_url = enrichedData.soundcloud_url;
    if (enrichedData.instagram_url) updateData.instagram_url = enrichedData.instagram_url;
    if (enrichedData.enrichment_score) updateData.enrichment_score = enrichedData.enrichment_score;

    const { error: updateError } = await supabase
      .from('labels')
      .update(updateData)
      .eq('id', labelId);

    if (updateError) {
      errors.push(`Update failed: ${updateError.message}`);
    }

    // Store claims
    const claimTypes = ['philosophy', 'known_for', 'bio_short'];
    for (const claimType of claimTypes) {
      if (enrichedData[claimType]) {
        await supabase.from('labels_claims').insert({
          label_id: labelId,
          claim_type: claimType,
          claim_text: enrichedData[claimType],
          confidence_score: (enrichedData.enrichment_score || 70) / 100,
          verification_status: 'ai_verified',
          extraction_model: MODEL_CONFIG.research,
        });
        stats.claimsExtracted++;
      }
    }

    // Update run record
    await supabase
      .from('labels_enrichment_runs')
      .update({
        status: errors.length > 0 ? 'completed_with_errors' : 'completed',
        stats,
        errors: errors.length > 0 ? errors : null,
        finished_at: new Date().toISOString(),
      })
      .eq('id', run.id);

    return {
      success: true,
      labelId,
      labelName: label.label_name,
      stats,
      errors,
      enrichedFields: Object.keys(updateData),
    };

  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unknown error');
    console.error(`Enrichment failed for ${label.label_name}:`, error);
    
    // Update run as failed
    if (run?.id) {
      await supabase
        .from('labels_enrichment_runs')
        .update({
          status: 'failed',
          errors: [error.message],
          finished_at: new Date().toISOString(),
        })
        .eq('id', run.id);
    }

    throw error;
  }
}

// Get gap analysis for labels
async function getGapAnalysis(supabase: any) {
  const { data: labels } = await supabase
    .from('labels')
    .select('id, label_name, slug, description, bio_short, bio_long, philosophy, known_for, key_artists, key_releases, subgenres, enrichment_status, enrichment_score');

  const gaps = {
    noDescription: [] as any[],
    noBio: [] as any[],
    noPhilosophy: [] as any[],
    noArtists: [] as any[],
    lowScore: [] as any[],
    pending: [] as any[],
  };

  for (const label of labels || []) {
    if (!label.description && !label.bio_short) gaps.noDescription.push(label);
    if (!label.bio_long) gaps.noBio.push(label);
    if (!label.philosophy) gaps.noPhilosophy.push(label);
    if (!label.key_artists?.length) gaps.noArtists.push(label);
    if (label.enrichment_score && label.enrichment_score < 50) gaps.lowScore.push(label);
    if (label.enrichment_status === 'pending') gaps.pending.push(label);
  }

  return {
    totalLabels: labels?.length || 0,
    gaps,
    summary: {
      noDescription: gaps.noDescription.length,
      noBio: gaps.noBio.length,
      noPhilosophy: gaps.noPhilosophy.length,
      noArtists: gaps.noArtists.length,
      lowScore: gaps.lowScore.length,
      pending: gaps.pending.length,
    }
  };
}

// Get stats for the admin dashboard
async function getStats(supabase: any) {
  const { count: totalLabels } = await supabase
    .from('labels')
    .select('*', { count: 'exact', head: true });

  const { count: enrichedLabels } = await supabase
    .from('labels')
    .select('*', { count: 'exact', head: true })
    .eq('enrichment_status', 'complete');

  const { count: pendingLabels } = await supabase
    .from('labels')
    .select('*', { count: 'exact', head: true })
    .eq('enrichment_status', 'pending');

  const { count: documentsCount } = await supabase
    .from('labels_documents')
    .select('*', { count: 'exact', head: true });

  const { count: claimsCount } = await supabase
    .from('labels_claims')
    .select('*', { count: 'exact', head: true });

  const { data: recentRuns } = await supabase
    .from('labels_enrichment_runs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  return {
    totalLabels: totalLabels || 0,
    enrichedLabels: enrichedLabels || 0,
    pendingLabels: pendingLabels || 0,
    documentsCount: documentsCount || 0,
    claimsCount: claimsCount || 0,
    enrichmentRate: totalLabels ? Math.round((enrichedLabels || 0) / totalLabels * 100) : 0,
    recentRuns: recentRuns || [],
  };
}

// Static labels data for syncing
const STATIC_LABELS = [
  { id: "axis", name: "Axis Records", city: "Detroit", country: "USA", founded: 1992, active: true, tags: ["Detroit", "minimal", "sci-fi", "essential"], description: "Jeff Mills' personal imprint. Techno as cosmic, futuristic art form.", founders: ["Jeff Mills"], artists: ["Jeff Mills", "Robert Hood"] },
  { id: "underground-resistance", name: "Underground Resistance", city: "Detroit", country: "USA", founded: 1989, active: true, tags: ["Detroit", "militant", "anonymous", "revolutionary"], description: "More than a label—a movement. Anti-corporate, pro-community. The masked revolutionaries.", founders: ["Mad Mike Banks", "Jeff Mills", "Robert Hood"], artists: ["Mad Mike Banks", "Drexciya", "Galaxy 2 Galaxy"] },
  { id: "ostgut-ton", name: "Ostgut Ton", city: "Berlin", country: "Germany", founded: 2005, active: true, tags: ["Berghain", "Berlin", "diverse", "quality"], description: "The label arm of Berghain. Documenting the club's residents and sound.", artists: ["Ben Klock", "Marcel Dettmann", "Steffi", "Fiedel", "Len Faki", "Phase Fatale"] },
  { id: "tresor-records", name: "Tresor Records", city: "Berlin", country: "Germany", founded: 1991, active: true, tags: ["Detroit-Berlin", "historic", "essential", "foundational"], description: "The label that bridged Detroit and Berlin. Document of a transatlantic revolution.", founders: ["Dimitri Hegemann"], artists: ["Jeff Mills", "Juan Atkins", "Blake Baxter", "Surgeon"] },
  { id: "dystopian", name: "Dystopian", city: "Berlin", country: "Germany", founded: 2012, active: true, tags: ["Berlin", "dark", "atmospheric", "hypnotic"], description: "Rødhåd's dark, atmospheric label. Berlin at its moodiest.", founders: ["Rødhåd"], artists: ["Rødhåd", "Alex.Do", "Vril", "RIKHTER"] },
  { id: "stroboscopic-artefacts", name: "Stroboscopic Artefacts", city: "Berlin", country: "Germany", founded: 2009, active: true, tags: ["experimental", "avant-garde", "Berlin", "conceptual"], description: "Experimental and avant-garde electronic music. Pushing boundaries.", founders: ["Lucy"], artists: ["Lucy", "Perc", "Rrose", "Neel"] },
  { id: "figure", name: "Figure", city: "Berlin", country: "Germany", founded: 2008, active: true, tags: ["driving", "loop-heavy", "Len Faki", "Berlin"], description: "Len Faki's imprint. Driving, loop-focused techno.", founders: ["Len Faki"], artists: ["Len Faki", "Truncate", "Setaoc Mass", "Dimi Angélis"] },
  { id: "mote-evolver", name: "Mote-Evolver", city: "London", country: "UK", founded: 1999, active: true, tags: ["UK", "Luke Slater", "hypnotic", "essential"], description: "Luke Slater's imprint. Hypnotic, relentless techno.", founders: ["Luke Slater"], artists: ["Planetary Assault Systems", "Psyk"] },
  { id: "perc-trax", name: "Perc Trax", city: "London", country: "UK", founded: 2004, active: true, tags: ["industrial", "experimental", "UK", "noise"], description: "Platform for the harder, more experimental edge of techno.", founders: ["Perc"], artists: ["Perc", "Truss", "Ansome", "Blawan", "VTSS", "Manni Dee"] },
  { id: "soma", name: "Soma Quality Recordings", city: "Glasgow", country: "UK", founded: 1991, active: true, tags: ["Scottish", "Slam", "diverse", "historic"], description: "Glasgow's longest-running electronic label. Home of Slam.", founders: ["Stuart McMillan", "Orde Meikle"], artists: ["Slam", "Rebekah", "Gary Beck", "Onyvaa"] },
  { id: "clergy", name: "Clergy", city: "London", country: "UK", founded: 2013, active: true, tags: ["UK", "hypnotic", "deep", "quality"], description: "UK label focused on hypnotic, deep techno.", founders: ["Sigha"], artists: ["Sigha", "Onyvaa"] },
  { id: "r-label-group", name: "R Label Group", city: "London", country: "UK", founded: 2012, active: true, tags: ["UK", "diverse", "quality", "London"], description: "London-based collective with quality-focused releases." },
  { id: "token", name: "Token", city: "Brussels", country: "Belgium", founded: 2009, active: true, tags: ["Belgian", "driving", "quality", "essential"], description: "Belgian techno institution. Quality over quantity. Every release counts.", founders: ["Kr!z"], artists: ["Inigo Kennedy", "Oscar Mulero", "Kr!z", "Lewis Fautzi", "Tensal"] },
  { id: "mord", name: "Mord Records", city: "Rotterdam", country: "Netherlands", founded: 2014, active: true, tags: ["industrial", "hard", "bass-heavy", "dark"], description: "Hard, industrial techno. No compromises. Chest punch guaranteed.", founders: ["Bas Mooy"], artists: ["Bas Mooy", "UVB", "Ansome", "999999999", "Trym"] },
  { id: "dynamic-reflection", name: "Dynamic Reflection", city: "Rotterdam", country: "Netherlands", founded: 2015, active: true, tags: ["Dutch", "hard", "industrial", "raw"], description: "Hard, industrial Dutch techno.", artists: ["Stranger", "TWR72"] },
  { id: "polegroup", name: "PoleGroup", city: "Madrid", country: "Spain", founded: 2006, active: true, tags: ["Madrid", "hypnotic", "minimal", "deep"], description: "Oscar Mulero's collective. Spanish techno at its finest. Pure warehouse sound.", founders: ["Oscar Mulero"], artists: ["Oscar Mulero", "Exium", "Reeko", "Lewis Fautzi", "Kwartz"] },
  { id: "semantica", name: "Semantica", city: "Barcelona", country: "Spain", founded: 2006, active: true, tags: ["deep", "hypnotic", "atmospheric", "ambient"], description: "Deep, atmospheric techno with an ambient edge.", founders: ["Svreca"], artists: ["Svreca", "Tensal", "Cassegrain", "Oscar Mulero", "Yan Cook"] },
  { id: "warm-up", name: "Warm Up", city: "Madrid", country: "Spain", founded: 1996, active: false, tags: ["Madrid", "historic", "Oscar Mulero", "foundational"], description: "Oscar Mulero's legendary club and label. Shaped Spanish techno.", founders: ["Oscar Mulero"] },
  { id: "subsist", name: "Subsist", city: "Oviedo", country: "Spain", founded: 2010, active: true, tags: ["Spanish", "industrial", "dark", "raw"], description: "Spanish label for industrial, dark techno.", artists: ["Exium"] },
  { id: "children-of-tomorrow", name: "Children of Tomorrow", city: "Madrid", country: "Spain", founded: 2012, active: true, tags: ["Spanish", "dark", "hypnotic", "Madrid"], description: "Madrid-based label. Dark, hypnotic techno.", founders: ["Kike Pravda"], artists: ["Kike Pravda"] },
  { id: "arts", name: "Arts", city: "Paris", country: "France", founded: 2014, active: true, tags: ["French", "hard", "dark", "emotional"], description: "French techno at its finest. Emotional but powerful.", founders: ["Emmanuel"], artists: ["Dax J", "I Hate Models", "Hadone", "SHDW & Obscure Shape"] },
  { id: "hayes", name: "Hayes", city: "Paris", country: "France", founded: 2018, active: true, tags: ["French", "hypnotic", "modern", "quality"], description: "Modern French techno. Hypnotic productions." },
  { id: "horo", name: "Horo", city: "Kyiv", country: "Ukraine", founded: 2014, active: true, tags: ["Ukrainian", "hypnotic", "deep", "atmospheric"], description: "Ukrainian label. Hypnotic, atmospheric techno.", founders: ["Yan Cook"], artists: ["Yan Cook"] },
  { id: "northern-electronics", name: "Northern Electronics", city: "Stockholm", country: "Sweden", founded: 2013, active: true, tags: ["ambient", "experimental", "Scandinavian", "deep"], description: "Ambient and experimental electronics from Sweden.", founders: ["VARG"], artists: ["VARG", "Acronym", "RIKHTER"] },
  { id: "infrastructure", name: "Infrastructure", city: "Rome", country: "Italy", founded: 2015, active: true, tags: ["Italian", "dark", "industrial", "raw"], description: "Italian label for dark, industrial techno." },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, params = {} } = await req.json() as AgentRequest;
    console.log(`Labels Agent: ${action}`, params);

    let result: any;

    switch (action) {
      case 'sync_from_static':
        result = await syncFromStaticData(supabase, STATIC_LABELS);
        break;

      case 'enrich_label':
        if (!params.labelId) throw new Error('labelId required');
        result = await enrichLabel(supabase, params.labelId, params.forceRefresh);
        break;

      case 'enrich_batch':
        const batchSize = params.batchSize || 5;
        const { data: labelsToEnrich } = await supabase
          .from('labels')
          .select('id, label_name')
          .eq('enrichment_status', 'pending')
          .limit(batchSize);

        const batchResults = [];
        for (const label of labelsToEnrich || []) {
          try {
          const enrichResult = await enrichLabel(supabase, label.id, params.forceRefresh);
          batchResults.push({ ...enrichResult, labelName: label.label_name });
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Unknown error');
          batchResults.push({ labelId: label.id, labelName: label.label_name, error: error.message });
        }
        }
        result = { batchSize, processed: batchResults.length, results: batchResults };
        break;

      case 'gap_analysis':
        result = await getGapAnalysis(supabase);
        break;

      case 'full_pipeline':
        // Step 1: Sync static data
        const syncResult = await syncFromStaticData(supabase, STATIC_LABELS);
        
        // Step 2: Get pending labels
        const { data: pending } = await supabase
          .from('labels')
          .select('id')
          .eq('enrichment_status', 'pending')
          .limit(params.batchSize || 5);

        // Step 3: Enrich each
        const pipelineResults = [];
        for (const label of pending || []) {
          try {
          const enrichResult = await enrichLabel(supabase, label.id);
          pipelineResults.push(enrichResult);
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Unknown error');
          pipelineResults.push({ labelId: label.id, error: error.message });
        }
      }

        result = {
          sync: syncResult,
          enriched: pipelineResults.length,
          results: pipelineResults,
        };
        break;

      case 'get_stats':
        result = await getStats(supabase);
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unknown error');
    console.error('Labels Agent error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
