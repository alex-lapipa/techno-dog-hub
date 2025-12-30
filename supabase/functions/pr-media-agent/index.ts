import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Model responsibilities
const MODEL_ROLES = {
  openai: 'structured generation, summarization, entity extraction, email drafts, scoring',
  anthropic: 'long-form reasoning, cultural nuance, journalist profiling, relationship strategy',
  grok: 'fast scanning, trend detection, freshness validation, emerging creators'
};

interface DiscoverParams {
  regions: string[];
  genres: string[];
  outletTypes: string[];
  languages: string[];
  depth: 'light' | 'standard' | 'exhaustive';
}

interface EnrichParams {
  contactIds?: string[];
  outletIds?: string[];
}

interface OutreachParams {
  contactId: string;
  promotion: string;
  tone: 'formal' | 'underground' | 'friendly' | 'bold';
  angle: string;
}

// Safe JSON body parser
async function safeParseBody(req: Request): Promise<any> {
  try {
    const text = await req.text();
    if (!text || text.trim() === '') return {};
    return JSON.parse(text);
  } catch {
    return {};
  }
}

// Call OpenAI for structured outputs
async function callOpenAI(prompt: string, systemPrompt: string): Promise<string | null> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    console.error('OPENAI_API_KEY not configured');
    return null;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI error:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('OpenAI call failed:', error);
    return null;
  }
}

// Call Anthropic for nuanced analysis
async function callAnthropic(prompt: string, systemPrompt: string): Promise<string | null> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not configured');
    return null;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      console.error('Anthropic error:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.content?.[0]?.text || null;
  } catch (error) {
    console.error('Anthropic call failed:', error);
    return null;
  }
}

// Call Grok (xAI) for fast scanning
async function callGrok(prompt: string, systemPrompt: string): Promise<string | null> {
  const apiKey = Deno.env.get('XAI_KEY');
  if (!apiKey) {
    console.error('XAI_KEY not configured');
    return null;
  }

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-2-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      console.error('Grok error:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('Grok call failed:', error);
    return null;
  }
}

// Call Firecrawl for discovery
async function firecrawlSearch(query: string): Promise<any[]> {
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY') || Deno.env.get('FIRECRAWL_API_KEY_1');
  if (!apiKey) {
    console.error('FIRECRAWL_API_KEY not configured');
    return [];
  }

  try {
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit: 20,
        scrapeOptions: { formats: ['markdown'] }
      }),
    });

    if (!response.ok) {
      console.error('Firecrawl search error:', await response.text());
      return [];
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Firecrawl search failed:', error);
    return [];
  }
}

// Orchestrated discovery workflow
async function discoverWorkflow(params: DiscoverParams, supabase: any, userId: string): Promise<any> {
  const { regions, genres, outletTypes, depth } = params;
  
  // Create agent run record
  const { data: run, error: runError } = await supabase
    .from('pr_agent_runs')
    .insert({
      run_type: 'discover',
      status: 'running',
      parameters: params,
      models_used: ['openai', 'anthropic', 'grok', 'firecrawl'],
      created_by: userId
    })
    .select()
    .single();

  if (runError) {
    console.error('Failed to create run:', runError);
    throw new Error('Failed to start discovery run');
  }

  const results = {
    outletsFound: 0,
    contactsFound: 0,
    sources: [] as string[],
    errors: [] as string[]
  };

  try {
    // Generate search queries based on parameters
    const searchQueries = generateSearchQueries(regions, genres, outletTypes, depth);
    
    for (const query of searchQueries.slice(0, depth === 'exhaustive' ? 20 : depth === 'standard' ? 10 : 5)) {
      console.log(`Searching: ${query}`);
      
      // Step 1: Grok scans for current/active sources
      const grokPrompt = `Analyze this search query for techno music media discovery: "${query}"
      
      Return a JSON object with:
      - relevantTerms: array of additional search terms to find active outlets
      - trendingTopics: current trends in techno media landscape
      - emergingCreators: types of new content creators to look for
      
      Focus on underground, independent techno culture in Europe and North America.`;
      
      const grokAnalysis = await callGrok(grokPrompt, 
        'You are a trend-aware media scanner specializing in underground techno music culture. Return valid JSON only.');
      
      // Step 2: Firecrawl discovers sources
      const firecrawlResults = await firecrawlSearch(query);
      results.sources.push(...firecrawlResults.map((r: any) => r.url).filter(Boolean));
      
      // Step 3: OpenAI extracts structured entities
      if (firecrawlResults.length > 0) {
        const openaiPrompt = `Extract media outlets and journalist contacts from this content.
        
        Content from search "${query}":
        ${firecrawlResults.slice(0, 5).map((r: any) => `
        URL: ${r.url}
        Title: ${r.title || 'Unknown'}
        Content: ${(r.markdown || '').substring(0, 1500)}
        `).join('\n---\n')}
        
        Return a JSON object with:
        {
          "outlets": [
            {
              "outlet_name": "string",
              "outlet_type": "magazine|blog|radio|podcast|youtube|tv|trade_press|festival_media|newsletter|streaming_platform|label_press|online_radio|fm_am_station|other",
              "website_url": "string",
              "country": "string",
              "city": "string or null",
              "genres_focus": ["techno", "acid", etc],
              "authority_score": 0-100,
              "underground_credibility_score": 0-100,
              "notes": "brief description"
            }
          ],
          "contacts": [
            {
              "full_name": "string",
              "role_title": "string",
              "outlet_name": "string (to link)",
              "email": "string or null",
              "social_links": {"twitter": "url", "instagram": "url"},
              "coverage_focus_tags": ["vinyl", "festivals", etc]
            }
          ]
        }
        
        Only include genuine techno-focused media outlets and journalists. Filter out mainstream/commercial outlets.`;
        
        const openaiResult = await callOpenAI(openaiPrompt,
          'You are an expert at extracting structured media contact data. Return valid JSON only, no markdown.');
        
        if (openaiResult) {
          try {
            const extracted = JSON.parse(openaiResult.replace(/```json\n?|\n?```/g, ''));
            
            // Step 4: Anthropic evaluates quality and cultural fit
            const anthropicPrompt = `Evaluate these techno media outlets and journalists for quality and cultural authenticity:
            
            ${JSON.stringify(extracted, null, 2)}
            
            For each outlet and contact, assess:
            1. Underground credibility (are they respected in the scene?)
            2. Cultural authenticity (do they understand techno culture?)
            3. Relationship potential (would they be receptive to indie press outreach?)
            4. Red flags (anything commercial, spammy, or inauthentic?)
            
            Return a JSON object:
            {
              "outlet_evaluations": [
                {
                  "outlet_name": "string",
                  "approved": true/false,
                  "adjusted_authority_score": 0-100,
                  "adjusted_credibility_score": 0-100,
                  "cultural_notes": "brief insight"
                }
              ],
              "contact_evaluations": [
                {
                  "full_name": "string",
                  "approved": true/false,
                  "what_makes_them_tick": "short profile of their interests/style",
                  "relationship_strategy": "how to approach them"
                }
              ]
            }`;
            
            const anthropicResult = await callAnthropic(anthropicPrompt,
              'You are a cultural advisor for underground techno music PR. Return valid JSON only.');
            
            let evaluations: any = { outlet_evaluations: [], contact_evaluations: [] };
            if (anthropicResult) {
              try {
                evaluations = JSON.parse(anthropicResult.replace(/```json\n?|\n?```/g, ''));
              } catch (e) {
                console.error('Failed to parse Anthropic result:', e);
              }
            }
            
            // Save approved outlets
            for (const outlet of extracted.outlets || []) {
              const evaluation = evaluations.outlet_evaluations?.find(
                (e: any) => e.outlet_name === outlet.outlet_name
              );
              
              if (evaluation?.approved !== false) {
                const region = determineRegion(outlet.country);
                
                const { error } = await supabase
                  .from('media_outlets')
                  .upsert({
                    outlet_name: outlet.outlet_name,
                    outlet_type: outlet.outlet_type || 'other',
                    website_url: outlet.website_url,
                    region,
                    country: outlet.country,
                    city: outlet.city,
                    genres_focus: outlet.genres_focus || ['techno'],
                    authority_score: evaluation?.adjusted_authority_score || outlet.authority_score || 50,
                    underground_credibility_score: evaluation?.adjusted_credibility_score || outlet.underground_credibility_score || 50,
                    notes: evaluation?.cultural_notes || outlet.notes,
                    data_source_url: firecrawlResults[0]?.url,
                    enrichment_confidence: 70,
                    last_verified_at: new Date().toISOString(),
                    created_by: userId
                  }, {
                    onConflict: 'outlet_name,website_url',
                    ignoreDuplicates: true
                  });
                
                if (!error) results.outletsFound++;
              }
            }
            
            // Save approved contacts
            for (const contact of extracted.contacts || []) {
              const evaluation = evaluations.contact_evaluations?.find(
                (e: any) => e.full_name === contact.full_name
              );
              
              if (evaluation?.approved !== false) {
                // Find outlet ID
                let outletId = null;
                if (contact.outlet_name) {
                  const { data: outlet } = await supabase
                    .from('media_outlets')
                    .select('id')
                    .eq('outlet_name', contact.outlet_name)
                    .limit(1)
                    .single();
                  outletId = outlet?.id;
                }
                
                const { error } = await supabase
                  .from('journalist_contacts')
                  .insert({
                    full_name: contact.full_name,
                    role_title: contact.role_title,
                    outlet_id: outletId,
                    email: contact.email,
                    social_links: contact.social_links || {},
                    coverage_focus_tags: contact.coverage_focus_tags || [],
                    what_makes_them_tick: evaluation?.what_makes_them_tick,
                    bio_summary: evaluation?.relationship_strategy,
                    data_source_url: firecrawlResults[0]?.url,
                    enrichment_confidence: 70,
                    last_verified_at: new Date().toISOString(),
                    created_by: userId
                  });
                
                if (!error) results.contactsFound++;
              }
            }
          } catch (parseError) {
            console.error('Failed to parse OpenAI result:', parseError);
            results.errors.push(`Parse error for query: ${query}`);
          }
        }
      }
    }
    
    // Log scrape audit
    await supabase.from('pr_scrape_audit_log').insert({
      action: 'discover',
      source_url: results.sources.slice(0, 10).join(', '),
      records_affected: results.outletsFound + results.contactsFound,
      models_used: ['openai', 'anthropic', 'grok', 'firecrawl'],
      parameters: params,
      status: 'completed',
      created_by: userId
    });
    
    // Update run status
    await supabase
      .from('pr_agent_runs')
      .update({
        status: 'completed',
        results,
        outlets_processed: results.outletsFound,
        contacts_processed: results.contactsFound,
        completed_at: new Date().toISOString()
      })
      .eq('id', run.id);
    
    return results;
  } catch (error) {
    await supabase
      .from('pr_agent_runs')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        completed_at: new Date().toISOString()
      })
      .eq('id', run.id);
    
    throw error;
  }
}

// Generate search queries based on parameters
function generateSearchQueries(regions: string[], genres: string[], outletTypes: string[], depth: string): string[] {
  const queries: string[] = [];
  
  const regionTerms: Record<string, string[]> = {
    europe: ['Europe', 'Berlin', 'London', 'Amsterdam', 'Paris', 'Barcelona', 'Tbilisi', 'Brussels'],
    north_america: ['USA', 'New York', 'Detroit', 'Los Angeles', 'Chicago', 'Brooklyn', 'Canada', 'Montreal']
  };
  
  const outletTerms: Record<string, string> = {
    magazine: 'techno magazine electronic music publication',
    blog: 'techno blog underground electronic music',
    radio: 'electronic music radio show techno',
    podcast: 'techno podcast underground electronic',
    youtube: 'techno youtube channel boiler room vinyl',
    streaming_platform: 'NTS Hör Boiler Room electronic music',
    online_radio: 'internet radio techno electronic music'
  };
  
  const genreTerms = genres.length > 0 ? genres : ['techno', 'underground electronic'];
  
  for (const region of regions) {
    const locations = regionTerms[region] || [region];
    for (const outletType of outletTypes) {
      const outletTerm = outletTerms[outletType] || outletType;
      for (const genre of genreTerms.slice(0, 2)) {
        for (const location of locations.slice(0, depth === 'exhaustive' ? 4 : 2)) {
          queries.push(`${genre} ${outletTerm} ${location}`);
        }
      }
    }
  }
  
  // Add specific known sources
  queries.push('Resident Advisor techno journalist writer');
  queries.push('DJ Mag underground techno editor');
  queries.push('Mixmag electronic music journalist');
  queries.push('FACT Magazine techno writer');
  queries.push('Electronic Beats journalist editor');
  queries.push('Decoded Magazine techno');
  queries.push('Data Transmission electronic music');
  queries.push('Attack Magazine synthesis techno');
  
  return [...new Set(queries)];
}

// Determine region from country
function determineRegion(country: string | null): string {
  if (!country) return 'global';
  
  const europeCountries = ['germany', 'uk', 'united kingdom', 'france', 'netherlands', 'belgium', 
    'spain', 'italy', 'portugal', 'poland', 'georgia', 'sweden', 'denmark', 'norway', 'austria',
    'switzerland', 'czech republic', 'hungary', 'romania', 'croatia', 'serbia', 'ukraine', 'ireland'];
  
  const naCountries = ['usa', 'united states', 'canada', 'mexico'];
  
  const lower = country.toLowerCase();
  if (europeCountries.some(c => lower.includes(c))) return 'europe';
  if (naCountries.some(c => lower.includes(c))) return 'north_america';
  return 'global';
}

// Enrich existing contacts
async function enrichWorkflow(params: EnrichParams, supabase: any, userId: string): Promise<any> {
  const results = { enriched: 0, errors: [] as string[] };
  
  // Get contacts to enrich
  let query = supabase.from('journalist_contacts').select('*, media_outlets(*)');
  if (params.contactIds && params.contactIds.length > 0) {
    query = query.in('id', params.contactIds);
  } else {
    query = query.lt('enrichment_confidence', 80).limit(20);
  }
  
  const { data: contacts, error } = await query;
  if (error) throw error;
  
  for (const contact of contacts || []) {
    try {
      // Use all three models for enrichment
      const enrichPrompt = `Enrich this journalist/media contact profile:
      
      Name: ${contact.full_name}
      Role: ${contact.role_title || 'Unknown'}
      Outlet: ${contact.media_outlets?.outlet_name || 'Unknown'}
      Website: ${contact.media_outlets?.website_url || contact.website || 'Unknown'}
      Current bio: ${contact.bio_summary || 'None'}
      
      Research and provide:
      1. Updated role/title if available
      2. Email address (if publicly available)
      3. Social media links (Twitter/X, Instagram, LinkedIn)
      4. 3-5 recent articles or interviews they've written/conducted (with URLs)
      5. Their coverage focus areas
      6. What makes them tick (interests, passions, style)
      7. Best way to approach them
      
      Return JSON:
      {
        "role_title": "string",
        "email": "string or null",
        "social_links": {"twitter": "url", "instagram": "url", "linkedin": "url"},
        "key_recent_articles": [{"title": "string", "url": "string"}],
        "coverage_focus_tags": ["string"],
        "what_makes_them_tick": "string",
        "relationship_strategy": "string",
        "is_active": true/false
      }`;
      
      // OpenAI for structured extraction
      const openaiResult = await callOpenAI(enrichPrompt,
        'You are a PR research specialist. Find publicly available information about journalists. Return valid JSON only.');
      
      if (openaiResult) {
        try {
          const enriched = JSON.parse(openaiResult.replace(/```json\n?|\n?```/g, ''));
          
          await supabase
            .from('journalist_contacts')
            .update({
              role_title: enriched.role_title || contact.role_title,
              email: enriched.email || contact.email,
              social_links: { ...contact.social_links, ...enriched.social_links },
              key_recent_articles: enriched.key_recent_articles || [],
              coverage_focus_tags: enriched.coverage_focus_tags || contact.coverage_focus_tags,
              what_makes_them_tick: enriched.what_makes_them_tick,
              bio_summary: enriched.relationship_strategy,
              is_active: enriched.is_active !== false,
              enrichment_confidence: 85,
              last_verified_at: new Date().toISOString()
            })
            .eq('id', contact.id);
          
          results.enriched++;
        } catch (e) {
          results.errors.push(`Parse error for ${contact.full_name}`);
        }
      }
    } catch (e) {
      results.errors.push(`Failed to enrich ${contact.full_name}`);
    }
  }
  
  return results;
}

// Generate outreach content
async function generateOutreach(params: OutreachParams, supabase: any): Promise<any> {
  const { data: contact, error } = await supabase
    .from('journalist_contacts')
    .select('*, media_outlets(*)')
    .eq('id', params.contactId)
    .single();
  
  if (error || !contact) throw new Error('Contact not found');
  
  const toneGuides: Record<string, string> = {
    formal: 'professional, respectful, concise',
    underground: 'scene-aware, authentic, no corporate speak, peer-to-peer',
    friendly: 'warm, personal, conversational',
    bold: 'confident, direct, compelling hook'
  };
  
  const outreachPrompt = `Generate personalized PR outreach for this journalist:
  
  JOURNALIST PROFILE:
  Name: ${contact.full_name}
  Role: ${contact.role_title || 'Journalist'}
  Outlet: ${contact.media_outlets?.outlet_name || 'Unknown outlet'}
  Coverage: ${(contact.coverage_focus_tags || []).join(', ') || 'techno, electronic music'}
  What makes them tick: ${contact.what_makes_them_tick || 'Unknown'}
  Preferred contact: ${contact.preferred_contact_method || 'email'}
  
  PROMOTION:
  ${params.promotion}
  
  TONE: ${toneGuides[params.tone]}
  ANGLE: ${params.angle}
  
  Generate:
  1. Email subject line (compelling, not clickbait)
  2. Email body (personalized, relevant to their coverage)
  3. Instagram DM script (brief, casual)
  4. Twitter/X DM script (very brief)
  5. Follow-up email (for 1 week later)
  
  Return JSON:
  {
    "email_subject": "string",
    "email_body": "string",
    "instagram_dm": "string",
    "twitter_dm": "string",
    "followup_email_subject": "string",
    "followup_email_body": "string",
    "best_time_to_send": "string",
    "do_not_mention": ["things to avoid"],
    "personalization_notes": "string"
  }`;
  
  // Use Anthropic for nuanced, culturally-aware outreach
  const anthropicResult = await callAnthropic(outreachPrompt,
    `You are an expert PR professional specializing in underground techno music culture. 
    Create authentic, non-spammy outreach that respects the journalist's expertise and time.
    Never use generic PR language. Be genuine and scene-aware. Return valid JSON only.`);
  
  if (!anthropicResult) throw new Error('Failed to generate outreach');
  
  try {
    return JSON.parse(anthropicResult.replace(/```json\n?|\n?```/g, ''));
  } catch {
    throw new Error('Failed to parse outreach content');
  }
}

// Get dashboard stats
async function getDashboardStats(supabase: any): Promise<any> {
  const [outlets, contacts, outreach, runs] = await Promise.all([
    supabase.from('media_outlets').select('id, region, outlet_type, authority_score', { count: 'exact' }),
    supabase.from('journalist_contacts').select('id, relationship_status, is_active', { count: 'exact' }),
    supabase.from('outreach_history').select('id, status', { count: 'exact' }),
    supabase.from('pr_agent_runs').select('*').order('started_at', { ascending: false }).limit(10)
  ]);
  
  return {
    totalOutlets: outlets.count || 0,
    totalContacts: contacts.count || 0,
    totalOutreach: outreach.count || 0,
    outletsByRegion: groupBy(outlets.data || [], 'region'),
    outletsByType: groupBy(outlets.data || [], 'outlet_type'),
    contactsByStatus: groupBy(contacts.data || [], 'relationship_status'),
    activeContacts: (contacts.data || []).filter((c: any) => c.is_active).length,
    outreachByStatus: groupBy(outreach.data || [], 'status'),
    recentRuns: runs.data || [],
    avgAuthorityScore: average((outlets.data || []).map((o: any) => o.authority_score))
  };
}

function groupBy(arr: any[], key: string): Record<string, number> {
  return arr.reduce((acc, item) => {
    const k = item[key] || 'unknown';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

function average(arr: number[]): number {
  if (arr.length === 0) return 0;
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

// Weekly refresh workflow
async function weeklyRefresh(supabase: any, userId: string): Promise<any> {
  const results = { verified: 0, updated: 0, errors: [] as string[] };
  
  // Get top 200 contacts by authority score
  const { data: contacts, error } = await supabase
    .from('journalist_contacts')
    .select('*, media_outlets(*)')
    .order('authority_score', { ascending: false })
    .limit(200);
  
  if (error) throw error;
  
  for (const contact of contacts || []) {
    try {
      // Use Grok for fast freshness check
      const grokPrompt = `Quick verification check for journalist: ${contact.full_name}
      Outlet: ${contact.media_outlets?.outlet_name || 'Unknown'}
      Website: ${contact.website || contact.media_outlets?.website_url || 'Unknown'}
      
      Check if:
      1. They are still active (recent posts/articles in last 3 months)
      2. Their role has changed
      3. The outlet is still active
      
      Return JSON: {"is_active": true/false, "role_changed": true/false, "outlet_active": true/false, "notes": "string"}`;
      
      const grokResult = await callGrok(grokPrompt,
        'You are a fast media scanner. Return valid JSON only.');
      
      if (grokResult) {
        try {
          const check = JSON.parse(grokResult.replace(/```json\n?|\n?```/g, ''));
          
          await supabase
            .from('journalist_contacts')
            .update({
              is_active: check.is_active,
              last_verified_at: new Date().toISOString(),
              credibility_notes: check.notes
            })
            .eq('id', contact.id);
          
          results.verified++;
          if (check.role_changed) results.updated++;
        } catch {
          results.errors.push(`Parse error for ${contact.full_name}`);
        }
      }
    } catch {
      results.errors.push(`Failed to verify ${contact.full_name}`);
    }
  }
  
  // Log the refresh
  await supabase.from('pr_scrape_audit_log').insert({
    action: 'weekly_refresh',
    records_affected: results.verified,
    models_used: ['grok'],
    status: 'completed',
    created_by: userId
  });
  
  return results;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await safeParseBody(req);
    const { action, ...params } = body;
    
    // Get user from auth header (for audit trail)
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    console.log(`PR Media Agent: ${action}`, params);

    let result: any;

    switch (action) {
      case 'discover':
        result = await discoverWorkflow(params as DiscoverParams, supabase, userId!);
        break;
        
      case 'enrich':
        result = await enrichWorkflow(params as EnrichParams, supabase, userId!);
        break;
        
      case 'generate_outreach':
        result = await generateOutreach(params as OutreachParams, supabase);
        break;
        
      case 'dashboard':
        result = await getDashboardStats(supabase);
        break;
        
      case 'weekly_refresh':
        result = await weeklyRefresh(supabase, userId!);
        break;
        
      case 'get_outlets':
        const { data: outlets, error: outletsError } = await supabase
          .from('media_outlets')
          .select('*')
          .order('authority_score', { ascending: false })
          .limit(params.limit || 100);
        if (outletsError) throw outletsError;
        result = { outlets };
        break;
        
      case 'get_contacts':
        const { data: contacts, error: contactsError } = await supabase
          .from('journalist_contacts')
          .select('*, media_outlets(*)')
          .order('authority_score', { ascending: false })
          .limit(params.limit || 100);
        if (contactsError) throw contactsError;
        result = { contacts };
        break;
        
      case 'get_segments':
        const { data: segments, error: segmentsError } = await supabase
          .from('pr_lists_segments')
          .select('*')
          .order('created_at', { ascending: false });
        if (segmentsError) throw segmentsError;
        result = { segments };
        break;
        
      case 'create_segment':
        const { data: newSegment, error: segmentError } = await supabase
          .from('pr_lists_segments')
          .insert({
            name: params.name,
            description: params.description,
            segment_type: params.segment_type || 'manual',
            filters_json: params.filters || {},
            contact_ids: params.contact_ids || [],
            outlet_ids: params.outlet_ids || [],
            created_by: userId
          })
          .select()
          .single();
        if (segmentError) throw segmentError;
        result = { segment: newSegment };
        break;
        
      case 'save_outreach':
        const { data: outreach, error: outreachError } = await supabase
          .from('outreach_history')
          .insert({
            journalist_id: params.journalist_id,
            outlet_id: params.outlet_id,
            outreach_type: params.outreach_type || 'email',
            message_summary: params.message_summary,
            message_content: params.message_content,
            subject_line: params.subject_line,
            campaign_name: params.campaign_name,
            status: params.status || 'draft',
            created_by: userId
          })
          .select()
          .single();
        if (outreachError) throw outreachError;
        result = { outreach };
        break;
        
      case 'get_outreach_history':
        const { data: history, error: historyError } = await supabase
          .from('outreach_history')
          .select('*, journalist_contacts(*), media_outlets(*)')
          .order('outreach_date', { ascending: false })
          .limit(params.limit || 50);
        if (historyError) throw historyError;
        result = { history };
        break;
        
      case 'delete_contact':
        const { error: deleteContactError } = await supabase
          .from('journalist_contacts')
          .delete()
          .eq('id', params.id);
        if (deleteContactError) throw deleteContactError;
        result = { success: true };
        break;
        
      case 'delete_outlet':
        const { error: deleteOutletError } = await supabase
          .from('media_outlets')
          .delete()
          .eq('id', params.id);
        if (deleteOutletError) throw deleteOutletError;
        result = { success: true };
        break;
        
      case 'get_audit_log':
        const { data: auditLog, error: auditError } = await supabase
          .from('pr_scrape_audit_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        if (auditError) throw auditError;
        result = { auditLog };
        break;
        
      case 'export_csv':
        const exportType = params.type || 'contacts';
        let exportData: any[] = [];
        
        if (exportType === 'contacts') {
          const { data } = await supabase
            .from('journalist_contacts')
            .select('*, media_outlets(outlet_name)')
            .order('authority_score', { ascending: false });
          exportData = (data || []).map((c: any) => ({
            name: c.full_name,
            role: c.role_title,
            outlet: c.media_outlets?.outlet_name,
            email: c.email,
            country: c.location_country,
            tags: (c.coverage_focus_tags || []).join('; '),
            authority_score: c.authority_score,
            credibility_score: c.underground_credibility_score,
            status: c.relationship_status
          }));
        } else {
          const { data } = await supabase
            .from('media_outlets')
            .select('*')
            .order('authority_score', { ascending: false });
          exportData = (data || []).map((o: any) => ({
            name: o.outlet_name,
            type: o.outlet_type,
            region: o.region,
            country: o.country,
            website: o.website_url,
            authority_score: o.authority_score,
            credibility_score: o.underground_credibility_score
          }));
        }
        
        result = { data: exportData, type: exportType };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('PR Media Agent error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
