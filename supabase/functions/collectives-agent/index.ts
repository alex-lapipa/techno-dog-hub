import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CollectiveRecord {
  collective_name: string;
  collective_aliases?: string[];
  collective_type?: string[];
  region?: string;
  country?: string;
  city?: string;
  website_url?: string;
  contact_email?: string;
  philosophy_summary?: string;
  activity_evidence?: string;
  status?: string;
  techno_doc_fit_score?: number;
  credibility_score?: number;
  activity_score?: number;
  verification_confidence?: number;
  sources_json?: object[];
}

// OpenAI: Structure extraction, normalization, outreach drafting
async function callOpenAI(prompt: string, systemPrompt: string): Promise<string> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 4000,
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// Anthropic: Deep reasoning, credibility validation, philosophy extraction
async function callAnthropic(prompt: string, systemPrompt: string): Promise<string> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

// Grok: Freshness checks, emerging discovery, fast scanning
async function callGrok(prompt: string): Promise<string> {
  const apiKey = Deno.env.get('XAI_KEY');
  if (!apiKey) {
    console.log('XAI_KEY not configured, skipping Grok');
    return '';
  }

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          { role: 'system', content: 'You are a scene intelligence agent specializing in techno collectives, sound systems, and open-source music communities. Provide current, accurate information about active collectives in Europe, UK, and North America.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error) {
    console.error('Grok call failed:', error);
    return '';
  }
}

// Firecrawl: Web scraping and discovery
async function firecrawlScrape(url: string): Promise<any> {
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!apiKey) throw new Error('FIRECRAWL_API_KEY not configured');

  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      formats: ['markdown', 'html'],
      onlyMainContent: true,
    }),
  });

  return response.json();
}

async function firecrawlSearch(query: string): Promise<any> {
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!apiKey) throw new Error('FIRECRAWL_API_KEY not configured');

  const response = await fetch('https://api.firecrawl.dev/v1/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      limit: 10,
    }),
  });

  return response.json();
}

// Calculate scores based on extracted data
function calculateScores(data: any): { activityScore: number; credibilityScore: number; fitScore: number; confidence: number } {
  let activityScore = 50;
  let credibilityScore = 50;
  let fitScore = 50;
  let confidence = 50;

  // Activity signals
  if (data.recentEvents) activityScore += 20;
  if (data.activeSocialMedia) activityScore += 15;
  if (data.recentReleases) activityScore += 15;

  // Credibility signals
  if (data.officialWebsite) credibilityScore += 20;
  if (data.establishedHistory) credibilityScore += 15;
  if (data.pressFeatures) credibilityScore += 15;

  // Fit score for techno.doc
  if (data.openSourceFocus) fitScore += 20;
  if (data.communityDriven) fitScore += 15;
  if (data.educationalContent) fitScore += 15;

  // Confidence based on source quality
  if (data.officialSources) confidence += 25;
  if (data.multipleSources) confidence += 15;
  if (data.recentVerification) confidence += 10;

  return {
    activityScore: Math.min(100, activityScore),
    credibilityScore: Math.min(100, credibilityScore),
    fitScore: Math.min(100, fitScore),
    confidence: Math.min(100, confidence),
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, params } = await req.json();
    console.log(`Collectives Agent action: ${action}`, params);

    // Create agent run record
    const { data: runData, error: runError } = await supabase
      .from('collective_agent_runs')
      .insert({
        run_type: action,
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (runError) {
      console.error('Failed to create run record:', runError);
    }

    const runId = runData?.id;
    let result: any = {};

    switch (action) {
      case 'discover': {
        // Discovery workflow: Find collectives in specified regions
        const { regions = ['Europe', 'UK', 'North America'], collectiveTypes = [], depth = 'standard' } = params || {};
        
        const searchQueries = [];
        
        // Build search queries based on types
        const typeQueries = {
          techno_collective: 'techno collective crew underground electronic music',
          sound_system: 'sound system crew rave free party tekno',
          open_source_collective: 'open source music technology collective hackerspace',
          live_coding_collective: 'live coding algorave SuperCollider TidalCycles music collective',
          hybrid_art_tech: 'art technology collective electronic music installation',
        };

        for (const region of regions) {
          for (const type of collectiveTypes.length ? collectiveTypes : Object.keys(typeQueries)) {
            const baseQuery = typeQueries[type as keyof typeof typeQueries] || type;
            searchQueries.push(`${baseQuery} ${region} 2024 2025 active`);
          }
        }

        // Use Grok for fast discovery
        const grokResults = await callGrok(
          `List currently active techno collectives, sound systems, and live coding communities in ${regions.join(', ')}. 
          Focus on: ${collectiveTypes.join(', ') || 'all types'}.
          Include: collective name, city, country, type, website if known, and evidence of recent activity.
          Format as JSON array.`
        );

        let discoveredCollectives: CollectiveRecord[] = [];

        try {
          // Parse Grok results
          const jsonMatch = grokResults.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            discoveredCollectives = parsed.map((c: any) => ({
              collective_name: c.name || c.collective_name,
              region: c.region,
              country: c.country,
              city: c.city,
              collective_type: c.type ? [c.type] : c.collective_type,
              website_url: c.website || c.website_url,
              activity_evidence: c.activity_evidence || c.recent_activity,
              status: 'uncertain',
            }));
          }
        } catch (e) {
          console.error('Failed to parse Grok results:', e);
        }

        // Use OpenAI to structure and normalize
        if (discoveredCollectives.length > 0) {
          const structurePrompt = `
            Normalize and deduplicate these collective records. Ensure consistent formatting.
            Add collective_type tags from: techno_collective, sound_system, open_source_collective, live_coding_collective, hybrid_art_tech.
            Validate region is one of: Europe, UK, North America.
            Return as JSON array.
            
            Input: ${JSON.stringify(discoveredCollectives)}
          `;

          const structured = await callOpenAI(structurePrompt, 
            'You are a data structuring agent for electronic music scene entities. Output valid JSON only.'
          );

          try {
            const jsonMatch = structured.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              discoveredCollectives = JSON.parse(jsonMatch[0]);
            }
          } catch (e) {
            console.error('Failed to parse OpenAI structured results:', e);
          }
        }

        // Insert into database
        let inserted = 0;
        for (const collective of discoveredCollectives) {
          // Check for duplicates
          const { data: existing } = await supabase
            .from('collectives')
            .select('id')
            .ilike('collective_name', collective.collective_name)
            .maybeSingle();

          if (!existing) {
            const scores = calculateScores({
              recentEvents: collective.activity_evidence?.includes('event'),
              officialWebsite: !!collective.website_url,
              openSourceFocus: collective.collective_type?.includes('open_source_collective'),
              communityDriven: true,
            });

            const { error: insertError } = await supabase
              .from('collectives')
              .insert({
                ...collective,
                activity_score: scores.activityScore,
                credibility_score: scores.credibilityScore,
                techno_doc_fit_score: scores.fitScore,
                verification_confidence: scores.confidence,
              });

            if (!insertError) inserted++;
          }
        }

        // Log audit
        await supabase.from('collective_scrape_audit').insert({
          action: 'discover',
          entity_type: 'collective',
          data_extracted: { count: discoveredCollectives.length, inserted },
        });

        result = { discovered: discoveredCollectives.length, inserted };
        break;
      }

      case 'enrich': {
        // Enrich existing collective profiles
        const { collectiveId, collectiveIds } = params || {};
        const ids = collectiveId ? [collectiveId] : (collectiveIds || []);

        let enriched = 0;

        for (const id of ids) {
          const { data: collective } = await supabase
            .from('collectives')
            .select('*')
            .eq('id', id)
            .single();

          if (!collective) continue;

          // Scrape official website if available
          let scrapedContent = '';
          if (collective.website_url) {
            try {
              const scrapeResult = await firecrawlScrape(collective.website_url);
              scrapedContent = scrapeResult.data?.markdown || '';
            } catch (e) {
              console.error('Scrape failed:', e);
            }
          }

          // Use Anthropic for deep analysis
          const analysisPrompt = `
            Analyze this collective and extract:
            1. Philosophy/manifesto summary (3-5 bullet points)
            2. Collaboration preferences
            3. What they like in partnerships
            4. What they dislike/avoid
            5. Key people and their roles
            6. Activity evidence (recent events, releases)
            7. Whether they appear active (last 12 months)
            
            Collective: ${collective.collective_name}
            Location: ${collective.city}, ${collective.country}
            Website content: ${scrapedContent.slice(0, 3000)}
          `;

          const analysis = await callAnthropic(analysisPrompt,
            'You are a cultural analyst specializing in underground electronic music communities. Extract structured insights about collectives for relationship building. Be accurate and evidence-based.'
          );

          // Parse analysis and update
          const updateData: any = {
            last_verified_at: new Date().toISOString(),
          };

          // Extract philosophy summary
          const philosophyMatch = analysis.match(/philosophy[:\s]*([\s\S]*?)(?=\n\d|\n[A-Z]|$)/i);
          if (philosophyMatch) {
            updateData.philosophy_summary = philosophyMatch[1].trim().slice(0, 1000);
          }

          // Extract preferences
          const likesMatch = analysis.match(/like[s]?[:\s]*([\s\S]*?)(?=\n\d|\ndislike|$)/i);
          if (likesMatch) {
            updateData.what_they_like = likesMatch[1].trim().slice(0, 500);
          }

          const dislikesMatch = analysis.match(/dislike[s]?[:\s]*([\s\S]*?)(?=\n\d|\n[A-Z]|$)/i);
          if (dislikesMatch) {
            updateData.what_they_dislike = dislikesMatch[1].trim().slice(0, 500);
          }

          // Update status based on activity evidence
          if (analysis.toLowerCase().includes('active') && !analysis.toLowerCase().includes('inactive')) {
            updateData.status = 'active';
          }

          // Recalculate scores
          const scores = calculateScores({
            recentEvents: analysis.toLowerCase().includes('event') || analysis.toLowerCase().includes('recent'),
            officialWebsite: !!collective.website_url,
            officialSources: !!scrapedContent,
            openSourceFocus: collective.collective_type?.includes('open_source_collective'),
            communityDriven: analysis.toLowerCase().includes('community'),
            educationalContent: analysis.toLowerCase().includes('workshop') || analysis.toLowerCase().includes('education'),
            multipleSources: true,
          });

          updateData.activity_score = scores.activityScore;
          updateData.credibility_score = scores.credibilityScore;
          updateData.techno_doc_fit_score = scores.fitScore;
          updateData.verification_confidence = scores.confidence;

          await supabase
            .from('collectives')
            .update(updateData)
            .eq('id', id);

          enriched++;

          // Log audit
          await supabase.from('collective_scrape_audit').insert({
            action: 'enrich',
            entity_type: 'collective',
            entity_id: id,
            source_url: collective.website_url,
            data_extracted: updateData,
          });
        }

        result = { enriched };
        break;
      }

      case 'find_key_people': {
        // Find key organizers and contacts for collectives
        const { collectiveId } = params || {};

        const { data: collective } = await supabase
          .from('collectives')
          .select('*')
          .eq('id', collectiveId)
          .single();

        if (!collective) {
          throw new Error('Collective not found');
        }

        // Search for key people
        const searchQuery = `${collective.collective_name} organizer founder contact`;
        const searchResults = await firecrawlSearch(searchQuery);

        const peoplePrompt = `
          Find key people associated with ${collective.collective_name} collective.
          Look for: founders, organizers, residents, developers, curators, press contacts.
          
          Search results: ${JSON.stringify(searchResults.data || []).slice(0, 3000)}
          
          Return as JSON array with fields:
          - person_name
          - role_title
          - email (only if publicly listed)
          - social_links (public professional only)
          - preferred_contact_method
        `;

        const peopleResult = await callOpenAI(peoplePrompt,
          'You are extracting professional contact information for music collective organizers. Only include publicly available professional information. Output valid JSON array.'
        );

        let keyPeople: any[] = [];
        try {
          const jsonMatch = peopleResult.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            keyPeople = JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          console.error('Failed to parse key people:', e);
        }

        // Insert key people
        let added = 0;
        for (const person of keyPeople) {
          if (person.person_name) {
            const { error } = await supabase
              .from('collective_key_people')
              .insert({
                collective_id: collectiveId,
                person_name: person.person_name,
                role_title: person.role_title,
                email: person.email,
                social_links_json: person.social_links || {},
                preferred_contact_method: person.preferred_contact_method,
                enrichment_confidence: 60,
                last_verified_at: new Date().toISOString(),
              });

            if (!error) added++;
          }
        }

        result = { found: keyPeople.length, added };
        break;
      }

      case 'generate_outreach': {
        // Generate outreach materials
        const { collectiveId, proposal, goal, tone = 'scene-native' } = params || {};

        const { data: collective } = await supabase
          .from('collectives')
          .select('*')
          .eq('id', collectiveId)
          .single();

        if (!collective) {
          throw new Error('Collective not found');
        }

        const { data: keyPeople } = await supabase
          .from('collective_key_people')
          .select('*')
          .eq('collective_id', collectiveId)
          .limit(5);

        const outreachPrompt = `
          Generate professional outreach materials for contacting ${collective.collective_name}.
          
          Context:
          - Collective type: ${collective.collective_type?.join(', ')}
          - Location: ${collective.city}, ${collective.country}
          - Philosophy: ${collective.philosophy_summary || 'Unknown'}
          - What they like: ${collective.what_they_like || 'Unknown'}
          - What they dislike: ${collective.what_they_dislike || 'Unknown'}
          - Key contacts: ${keyPeople?.map(p => p.person_name).join(', ') || 'Unknown'}
          
          Proposal: ${proposal}
          Goal: ${goal}
          Tone: ${tone}
          
          Generate:
          1. Email pitch (subject + body)
          2. Short DM version for Instagram/X
          3. Partnership proposal summary (one paragraph)
          4. Recommended next steps
          
          Output as JSON with keys: email_subject, email_body, dm_text, proposal_summary, next_steps
        `;

        const outreachResult = await callOpenAI(outreachPrompt,
          'You are a professional partnership development specialist for techno.doc, a cultural archive and documentation platform. Write compelling, respectful outreach that resonates with underground electronic music communities.'
        );

        let outreach: any = {};
        try {
          const jsonMatch = outreachResult.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            outreach = JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          // Return as structured text if JSON parsing fails
          outreach = { raw_content: outreachResult };
        }

        result = { outreach };
        break;
      }

      case 'verify_activity': {
        // Verify if collectives are still active
        const { region, minConfidence = 0 } = params || {};

        let query = supabase
          .from('collectives')
          .select('id, collective_name, website_url, status, last_verified_at')
          .or('status.eq.uncertain,status.eq.active');

        if (region) {
          query = query.eq('region', region);
        }

        if (minConfidence > 0) {
          query = query.gte('verification_confidence', minConfidence);
        }

        const { data: collectives } = await query.limit(20);

        let verified = 0;
        let statusChanges: any[] = [];

        for (const collective of collectives || []) {
          // Use Grok for quick activity check
          const activityCheck = await callGrok(
            `Is ${collective.collective_name} techno collective still active in 2024-2025? 
            Look for: recent events, social media activity, releases, or announcements.
            Answer: ACTIVE, INACTIVE, or UNCERTAIN with brief evidence.`
          );

          let newStatus = 'uncertain';
          if (activityCheck.toUpperCase().includes('ACTIVE') && !activityCheck.toUpperCase().includes('INACTIVE')) {
            newStatus = 'active';
          } else if (activityCheck.toUpperCase().includes('INACTIVE')) {
            newStatus = 'inactive';
          }

          if (newStatus !== collective.status) {
            statusChanges.push({
              id: collective.id,
              name: collective.collective_name,
              oldStatus: collective.status,
              newStatus,
            });
          }

          await supabase
            .from('collectives')
            .update({
              status: newStatus,
              activity_evidence: activityCheck.slice(0, 500),
              last_verified_at: new Date().toISOString(),
            })
            .eq('id', collective.id);

          verified++;
        }

        result = { verified, statusChanges };
        break;
      }

      case 'export': {
        // Export data as JSON
        const { format = 'json', filters = {} } = params || {};

        let query = supabase.from('collectives').select('*');

        if (filters.region) query = query.eq('region', filters.region);
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.minFitScore) query = query.gte('techno_doc_fit_score', filters.minFitScore);

        const { data: collectives } = await query;

        result = { 
          format,
          count: collectives?.length || 0,
          data: collectives,
        };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Update run record
    if (runId) {
      await supabase
        .from('collective_agent_runs')
        .update({
          status: 'completed',
          finished_at: new Date().toISOString(),
          stats: result,
        })
        .eq('id', runId);
    }

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Collectives Agent error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
