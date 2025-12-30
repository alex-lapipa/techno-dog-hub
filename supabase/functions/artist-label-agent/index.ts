import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AgentRequest {
  action: 'ingest_artists' | 'find_managers' | 'find_labels' | 'enrich_contacts' | 'generate_outreach' | 'verify_freshness' | 'weekly_refresh';
  params?: {
    regionFocus?: string[];
    artistIds?: string[];
    labelIds?: string[];
    managerIds?: string[];
    contactId?: string;
    collaborationType?: string;
    tone?: string;
    projectContext?: string;
    goal?: string;
    batchSize?: number;
  };
}

// Model orchestration layer - each model has specific responsibilities
const ModelRoles = {
  OPENAI: ['extraction', 'normalization', 'drafting', 'deduplication', 'structuring'],
  ANTHROPIC: ['validation', 'policy_analysis', 'relationship_strategy', 'ethical_review'],
  GROK: ['freshness_scan', 'trend_detection', 'roster_changes', 'discovery']
};

async function callLovableAI(messages: { role: string; content: string }[], model: string = 'google/gemini-2.5-flash') {
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
    const error = await response.text();
    throw new Error(`AI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// OpenAI: Structure extraction and normalization
async function extractAndNormalizeArtists(artistsData: any[]) {
  const prompt = `You are an expert music industry data analyst. Extract and normalize artist information for EU/UK/North America electronic/techno artists.

Input data:
${JSON.stringify(artistsData.slice(0, 20), null, 2)}

For each artist, determine:
1. Normalized name (handle aliases, stage names)
2. Region focus (EU, UK, North America, or both)
3. Active status based on evidence
4. Activity score (0-100)

Return JSON array with structure:
[{
  "artist_name": "string",
  "artist_aliases": ["array"],
  "region_focus": "EU|UK|North America|both",
  "country_base": "string",
  "city_base": "string",
  "active_status": "active|uncertain|inactive",
  "evidence_of_activity": "string",
  "verification_confidence": 0-100
}]

Only include artists relevant to techno/electronic scene in EU, UK, or North America.`;

  const result = await callLovableAI([
    { role: 'system', content: 'You are a music industry data specialist. Return only valid JSON.' },
    { role: 'user', content: prompt }
  ], 'google/gemini-2.5-flash');

  try {
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch {
    console.error('Failed to parse OpenAI response:', result);
    return [];
  }
}

// Anthropic: Deep validation and policy analysis
async function validateAndAnalyzeManager(managerData: any, artistContext: string) {
  const prompt = `You are an expert music industry relationships analyst with deep knowledge of electronic music management.

Analyze this manager/agent information:
${JSON.stringify(managerData, null, 2)}

Artist context: ${artistContext}

Provide:
1. Is this the current/primary manager? (confidence 0-100)
2. What do they like in collaborations?
3. What should we avoid?
4. Best approach strategy
5. Preferred outreach channel
6. Red flags to watch for

Return JSON:
{
  "is_primary_manager": boolean,
  "confidence": 0-100,
  "what_they_like": "string",
  "what_they_dislike": "string",
  "best_approach_notes": "string",
  "outreach_channel_preference": "email|phone|form|intro",
  "collaboration_policy_summary": "string",
  "red_flags": ["array"]
}`;

  const result = await callLovableAI([
    { role: 'system', content: 'You are a music industry relationships expert. Be thorough but concise. Return valid JSON.' },
    { role: 'user', content: prompt }
  ], 'anthropic/claude-sonnet');

  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch {
    console.error('Failed to parse Anthropic response:', result);
    return null;
  }
}

// Anthropic: Label collaboration policy analysis
async function analyzeLabelPolicy(labelData: any) {
  const prompt = `You are an expert music industry analyst specializing in record label operations and artist relations.

Analyze this label:
${JSON.stringify(labelData, null, 2)}

Evaluate:
1. Collaboration openness (0-100)
2. Preferred collaboration types
3. What they value in partners
4. What to avoid
5. Best approach for techno.dog (a knowledge/archive/documentary platform)

Return JSON:
{
  "collaboration_openness_score": 0-100,
  "preferred_collaboration_types": ["content", "educational", "documentary", "events", "partnerships"],
  "what_they_like": "string",
  "what_they_dislike": "string",
  "best_approach_notes": "string",
  "red_flags": ["array"]
}`;

  const result = await callLovableAI([
    { role: 'system', content: 'You are a music industry expert. Return valid JSON.' },
    { role: 'user', content: prompt }
  ], 'anthropic/claude-sonnet');

  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch {
    return null;
  }
}

// Grok: Fast freshness scan and discovery
async function scanForFreshness(entityData: any, entityType: string) {
  const prompt = `You are a fast-scanning music industry intelligence agent. Check freshness signals for this ${entityType}:

${JSON.stringify(entityData, null, 2)}

Quickly assess:
1. Is this information current? (recent activity indicators)
2. Any recent changes detected? (role changes, new projects, roster updates)
3. Current activity level (high/medium/low/inactive)
4. Freshness confidence (0-100)

Return JSON:
{
  "is_current": boolean,
  "activity_level": "high|medium|low|inactive",
  "recent_changes_detected": ["array"],
  "freshness_confidence": 0-100,
  "needs_update": boolean,
  "update_priority": "high|medium|low"
}`;

  const result = await callLovableAI([
    { role: 'system', content: 'You are a fast intelligence scanner. Be quick and accurate. Return valid JSON.' },
    { role: 'user', content: prompt }
  ], 'google/gemini-2.5-flash-lite'); // Using fast model for Grok-like speed

  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch {
    return null;
  }
}

// Firecrawl integration for discovery
async function discoverWithFirecrawl(searchQuery: string, entityType: string) {
  const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!firecrawlKey) {
    console.log('Firecrawl not configured, skipping web discovery');
    return null;
  }

  try {
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 10,
        scrapeOptions: { formats: ['markdown'] }
      }),
    });

    if (!response.ok) {
      console.error('Firecrawl search failed:', await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Firecrawl error:', error);
    return null;
  }
}

// OpenAI: Generate outreach content
async function generateOutreach(context: {
  target: any;
  targetType: string;
  collaborationType: string;
  tone: string;
  projectContext: string;
  goal: string;
}) {
  const prompt = `You are an expert PR professional for techno.dog, an underground techno knowledge platform.

Generate outreach content for:
Target: ${JSON.stringify(context.target, null, 2)}
Target Type: ${context.targetType}
Collaboration Type: ${context.collaborationType}
Tone: ${context.tone}
Project Context: ${context.projectContext}
Goal: ${context.goal}

Create:
1. Email subject line
2. Email body (professional, scene-aware, not spammy)
3. Short DM version (if appropriate)
4. Follow-up email (shorter)
5. Key talking points

Return JSON:
{
  "email_subject": "string",
  "email_body": "string",
  "dm_script": "string",
  "follow_up_email": "string",
  "key_talking_points": ["array"],
  "recommended_timing": "string",
  "follow_up_cadence": "string"
}`;

  const result = await callLovableAI([
    { role: 'system', content: 'You are a music industry PR professional. Write authentic, non-spammy outreach. Return valid JSON.' },
    { role: 'user', content: prompt }
  ], 'openai/gpt-5');

  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch {
    return null;
  }
}

// Main handler
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, params = {} } = await req.json() as AgentRequest;
    console.log(`Artist-Label Agent: ${action}`, params);

    // Create agent run record
    const { data: runRecord } = await supabase
      .from('artist_label_agent_runs')
      .insert({ run_type: action, status: 'running' })
      .select()
      .single();

    const runId = runRecord?.id;

    let result: any = { success: false };

    try {
      switch (action) {
        case 'ingest_artists': {
          // Read from canonical_artists (read-only)
          const { data: canonicalArtists } = await supabase
            .from('canonical_artists')
            .select('*')
            .limit(params.batchSize || 50);

          if (!canonicalArtists?.length) {
            result = { success: true, message: 'No artists to ingest', ingested: 0 };
            break;
          }

          // Use OpenAI for extraction and normalization
          const normalizedArtists = await extractAndNormalizeArtists(canonicalArtists);

          // Filter for EU/UK/North America
          const regionFiltered = normalizedArtists.filter((a: any) => 
            params.regionFocus?.includes(a.region_focus) || 
            ['EU', 'UK', 'North America', 'both'].includes(a.region_focus)
          );

          // Insert into artists_active
          let insertedCount = 0;
          for (const artist of regionFiltered) {
            const { error } = await supabase
              .from('artists_active')
              .upsert({
                ...artist,
                canonical_artist_id: canonicalArtists.find((ca: any) => 
                  ca.canonical_name?.toLowerCase() === artist.artist_name?.toLowerCase()
                )?.artist_id,
                source_urls_json: ['canonical_artists_import'],
                last_verified_at: new Date().toISOString()
              }, { onConflict: 'artist_name' });

            if (!error) insertedCount++;
          }

          // Log audit
          await supabase.from('artist_label_scrape_audit').insert({
            action: 'ingest_artists',
            entity_type: 'artists_active',
            data_extracted: { count: insertedCount, source: 'canonical_artists' }
          });

          result = { success: true, ingested: insertedCount, total: canonicalArtists.length };
          break;
        }

        case 'find_managers': {
          const { artistIds } = params;
          
          // Get artists to process
          let query = supabase.from('artists_active').select('*').eq('active_status', 'active');
          if (artistIds?.length) {
            query = query.in('id', artistIds);
          }
          const { data: artists } = await query.limit(params.batchSize || 10);

          if (!artists?.length) {
            result = { success: true, message: 'No artists to process', found: 0 };
            break;
          }

          let managersFound = 0;

          for (const artist of artists) {
            // Use Firecrawl to search for manager info
            const searchQuery = `"${artist.artist_name}" techno DJ manager booking agent contact`;
            const searchResults = await discoverWithFirecrawl(searchQuery, 'manager');

            if (searchResults?.data?.length) {
              // Use OpenAI to extract manager data from search results
              const extractionPrompt = `Extract manager/agent information for artist "${artist.artist_name}" from these search results:
${JSON.stringify(searchResults.data.slice(0, 5), null, 2)}

Return JSON array of managers found:
[{
  "manager_name": "string",
  "manager_role": "manager|agent|booking|PR|label_manager",
  "management_company": "string",
  "company_website": "string",
  "email": "string or null",
  "phone": "string or null",
  "contact_form_url": "string or null",
  "region_coverage": "EU|North America|global|UK",
  "data_source_url": "string"
}]`;

              const extractedManagers = await callLovableAI([
                { role: 'system', content: 'Extract only verified manager info. Return valid JSON array.' },
                { role: 'user', content: extractionPrompt }
              ], 'google/gemini-2.5-flash');

              try {
                const managers = JSON.parse(extractedManagers.match(/\[[\s\S]*\]/)?.[0] || '[]');
                
                for (const manager of managers) {
                  if (!manager.manager_name) continue;

                  // Use Anthropic for validation and policy analysis
                  const validation = await validateAndAnalyzeManager(manager, artist.artist_name);

                  if (validation?.confidence >= 50) {
                    await supabase.from('artist_managers').upsert({
                      artist_id: artist.id,
                      ...manager,
                      ...validation,
                      enrichment_confidence: validation.confidence,
                      last_verified_at: new Date().toISOString()
                    }, { onConflict: 'artist_id,manager_name' });
                    managersFound++;
                  }
                }
              } catch (e) {
                console.error('Failed to parse managers:', e);
              }
            }
          }

          await supabase.from('artist_label_scrape_audit').insert({
            action: 'find_managers',
            entity_type: 'artist_managers',
            data_extracted: { managers_found: managersFound }
          });

          result = { success: true, found: managersFound };
          break;
        }

        case 'find_labels': {
          const { artistIds } = params;
          
          let query = supabase.from('artists_active').select('*').eq('active_status', 'active');
          if (artistIds?.length) {
            query = query.in('id', artistIds);
          }
          const { data: artists } = await query.limit(params.batchSize || 10);

          if (!artists?.length) {
            result = { success: true, message: 'No artists to process', found: 0 };
            break;
          }

          let labelsFound = 0;

          for (const artist of artists) {
            const searchQuery = `"${artist.artist_name}" techno record label releases discography`;
            const searchResults = await discoverWithFirecrawl(searchQuery, 'label');

            if (searchResults?.data?.length) {
              const extractionPrompt = `Extract record label information for artist "${artist.artist_name}" from these search results:
${JSON.stringify(searchResults.data.slice(0, 5), null, 2)}

Return JSON array of labels found:
[{
  "label_name": "string",
  "label_type": "independent|major_imprint|artist_owned|collective",
  "label_website_url": "string",
  "headquarters_country": "string",
  "general_email": "string or null",
  "relationship_type": "primary|frequent|recent",
  "evidence_url": "string"
}]`;

              const extractedLabels = await callLovableAI([
                { role: 'system', content: 'Extract only verified label info. Return valid JSON array.' },
                { role: 'user', content: extractionPrompt }
              ], 'google/gemini-2.5-flash');

              try {
                const labels = JSON.parse(extractedLabels.match(/\[[\s\S]*\]/)?.[0] || '[]');
                
                for (const label of labels) {
                  if (!label.label_name) continue;

                  // Use Anthropic for label policy analysis
                  const policyAnalysis = await analyzeLabelPolicy(label);

                  // Insert or get existing label
                  const { data: existingLabel } = await supabase
                    .from('labels')
                    .select('id')
                    .eq('label_name', label.label_name)
                    .single();

                  let labelId = existingLabel?.id;

                  if (!labelId) {
                    const { data: newLabel } = await supabase
                      .from('labels')
                      .insert({
                        label_name: label.label_name,
                        label_type: label.label_type,
                        label_website_url: label.label_website_url,
                        headquarters_country: label.headquarters_country,
                        general_email: label.general_email,
                        notes: policyAnalysis?.best_approach_notes,
                        verification_confidence: policyAnalysis?.collaboration_openness_score || 50,
                        sources_json: [label.evidence_url],
                        last_verified_at: new Date().toISOString()
                      })
                      .select()
                      .single();
                    labelId = newLabel?.id;
                    labelsFound++;
                  }

                  // Create artist-label relationship
                  if (labelId) {
                    await supabase.from('artist_labels').upsert({
                      artist_id: artist.id,
                      label_id: labelId,
                      relationship_type: label.relationship_type || 'recent',
                      evidence_url: label.evidence_url
                    }, { onConflict: 'artist_id,label_id' });
                  }
                }
              } catch (e) {
                console.error('Failed to parse labels:', e);
              }
            }
          }

          await supabase.from('artist_label_scrape_audit').insert({
            action: 'find_labels',
            entity_type: 'labels',
            data_extracted: { labels_found: labelsFound }
          });

          result = { success: true, found: labelsFound };
          break;
        }

        case 'enrich_contacts': {
          const { labelIds, managerIds } = params;

          let enriched = 0;

          // Enrich label contacts
          if (labelIds?.length) {
            const { data: labels } = await supabase
              .from('labels')
              .select('*')
              .in('id', labelIds);

            for (const label of labels || []) {
              const searchQuery = `"${label.label_name}" A&R PR contact email press`;
              const searchResults = await discoverWithFirecrawl(searchQuery, 'label_contact');

              if (searchResults?.data?.length) {
                const extractionPrompt = `Extract contact persons for label "${label.label_name}" from:
${JSON.stringify(searchResults.data.slice(0, 3), null, 2)}

Return JSON array:
[{
  "contact_person_name": "string",
  "role_title": "string",
  "department": "A&R|PR|partnerships|marketing|label_manager|licensing|general",
  "email": "string or null",
  "phone": "string or null",
  "source_url": "string"
}]`;

                const contacts = await callLovableAI([
                  { role: 'system', content: 'Extract verified contacts only. Return JSON array.' },
                  { role: 'user', content: extractionPrompt }
                ], 'google/gemini-2.5-flash');

                try {
                  const parsedContacts = JSON.parse(contacts.match(/\[[\s\S]*\]/)?.[0] || '[]');
                  for (const contact of parsedContacts) {
                    if (contact.contact_person_name || contact.email) {
                      await supabase.from('label_contacts').insert({
                        label_id: label.id,
                        ...contact,
                        enrichment_confidence: 60,
                        last_verified_at: new Date().toISOString()
                      });
                      enriched++;
                    }
                  }
                } catch (e) {
                  console.error('Failed to parse label contacts:', e);
                }
              }
            }
          }

          // Enrich managers using Grok-like freshness scan
          if (managerIds?.length) {
            const { data: managers } = await supabase
              .from('artist_managers')
              .select('*')
              .in('id', managerIds);

            for (const manager of managers || []) {
              const freshness = await scanForFreshness(manager, 'manager');
              
              if (freshness?.needs_update) {
                // Re-search for updated info
                const searchQuery = `"${manager.manager_name}" "${manager.management_company}" music manager contact`;
                const searchResults = await discoverWithFirecrawl(searchQuery, 'manager');

                if (searchResults?.data?.length) {
                  // Update with new info
                  await supabase.from('artist_managers')
                    .update({
                      last_verified_at: new Date().toISOString(),
                      enrichment_confidence: freshness.freshness_confidence
                    })
                    .eq('id', manager.id);
                  enriched++;
                }
              }
            }
          }

          result = { success: true, enriched };
          break;
        }

        case 'generate_outreach': {
          const { contactId, collaborationType, tone, projectContext, goal } = params;
          
          // Determine target type and get target data
          let target: any = null;
          let targetType = '';

          // Check managers
          const { data: manager } = await supabase
            .from('artist_managers')
            .select('*, artists_active(*)')
            .eq('id', contactId)
            .single();

          if (manager) {
            target = manager;
            targetType = 'manager';
          } else {
            // Check label contacts
            const { data: labelContact } = await supabase
              .from('label_contacts')
              .select('*, labels(*)')
              .eq('id', contactId)
              .single();

            if (labelContact) {
              target = labelContact;
              targetType = 'label_contact';
            }
          }

          if (!target) {
            result = { success: false, error: 'Contact not found' };
            break;
          }

          const outreach = await generateOutreach({
            target,
            targetType,
            collaborationType: collaborationType || 'interview',
            tone: tone || 'scene-native',
            projectContext: projectContext || 'techno.dog - underground techno knowledge platform',
            goal: goal || 'collaboration'
          });

          if (outreach) {
            result = { success: true, outreach };
          } else {
            result = { success: false, error: 'Failed to generate outreach' };
          }
          break;
        }

        case 'verify_freshness': {
          const { batchSize = 20 } = params;

          // Get entities needing verification (oldest first)
          const { data: artists } = await supabase
            .from('artists_active')
            .select('*')
            .order('last_verified_at', { ascending: true, nullsFirst: true })
            .limit(batchSize);

          let verified = 0;
          let needsUpdate = 0;

          for (const artist of artists || []) {
            const freshness = await scanForFreshness(artist, 'artist');
            
            await supabase.from('artists_active')
              .update({
                last_verified_at: new Date().toISOString(),
                verification_confidence: freshness?.freshness_confidence || artist.verification_confidence
              })
              .eq('id', artist.id);

            verified++;
            if (freshness?.needs_update) needsUpdate++;
          }

          result = { success: true, verified, needsUpdate };
          break;
        }

        case 'weekly_refresh': {
          // Refresh top 200 artists and their relations
          const { data: topArtists } = await supabase
            .from('artists_active')
            .select('id')
            .eq('active_status', 'active')
            .order('verification_confidence', { ascending: false })
            .limit(200);

          let refreshed = 0;

          for (const artist of topArtists || []) {
            const freshness = await scanForFreshness(artist, 'artist');
            if (freshness) {
              await supabase.from('artists_active')
                .update({
                  last_verified_at: new Date().toISOString(),
                  verification_confidence: freshness.freshness_confidence
                })
                .eq('id', artist.id);
              refreshed++;
            }
          }

          await supabase.from('artist_label_scrape_audit').insert({
            action: 'weekly_refresh',
            entity_type: 'artists_active',
            data_extracted: { refreshed, total: topArtists?.length || 0 }
          });

          result = { success: true, refreshed };
          break;
        }

        default:
          result = { success: false, error: `Unknown action: ${action}` };
      }

      // Update run record
      await supabase.from('artist_label_agent_runs')
        .update({
          status: result.success ? 'completed' : 'failed',
          finished_at: new Date().toISOString(),
          stats: result,
          error_message: result.error || null
        })
        .eq('id', runId);

    } catch (error) {
      console.error('Agent error:', error);
      await supabase.from('artist_label_agent_runs')
        .update({
          status: 'failed',
          finished_at: new Date().toISOString(),
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', runId);

      result = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Handler error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
