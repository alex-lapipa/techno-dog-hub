// AI-Powered Artist Research - Multi-Model Knowledge Generation
// ZERO TOLERANCE HALLUCINATION POLICY
// Uses Lovable AI, Anthropic, and OpenAI with strict cross-validation
// Only facts confirmed by 2+ models are accepted

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResearchRequest {
  action: 'research_artist' | 'research_batch' | 'full_pipeline' | 'verify_claims' | 'audit' | 'status';
  artist_id?: string;
  artist_name?: string;
  limit?: number;
}

interface ClaimResult {
  claim_type: string;
  claim_text: string;
  value_structured?: Record<string, unknown>;
  confidence_score: number;
  source_models: string[];
  model_agreement: number;
}

// STRICT RESEARCH PROMPT - Zero tolerance for speculation
const RESEARCH_PROMPT = `You are a meticulous electronic music archivist. Your ONLY job is to provide VERIFIED FACTS.

ZERO TOLERANCE POLICY:
- ONLY include information you are 100% certain about
- If you have ANY doubt, DO NOT include it
- Better to return less data than include speculation
- No guessing dates, locations, or relationships
- Cross-reference your knowledge carefully

For the techno/electronic artist, provide ONLY verified facts:

1. **Real Name**: Only if publicly confirmed
2. **Birth Year**: Only if publicly documented (not estimated)
3. **Birthplace**: City and country, only if confirmed
4. **Labels**: Only labels where they DEFINITELY released music
5. **Key Releases**: Only albums/EPs you're certain about with correct years
6. **Collaborators**: Only confirmed collaborations
7. **Style**: Their actual musical style description

CRITICAL DISAMBIGUATION:
- Ensure you have the correct artist - many have similar names
- This is about TECHNO/ELECTRONIC music artists
- Double-check before including any fact

Return ONLY a JSON object - no explanation text:
{
  "confidence_level": "high|medium|low",
  "artist_name": "confirmed name",
  "real_name": "only if certain",
  "birth_year": "only if certain",
  "birthplace": "only if certain", 
  "nationality": "only if certain",
  "labels": ["confirmed labels only"],
  "notable_releases": [{"title": "name", "year": 2000, "label": "label"}],
  "style_description": "factual style description",
  "collaborators": ["confirmed only"],
  "aliases": ["confirmed only"]
}

If you're not confident about this artist, return:
{"confidence_level": "low", "error": "Insufficient verified information"}`;

async function callLovableAI(prompt: string, model = 'google/gemini-2.5-flash'): Promise<{ content: string; model: string } | null> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) return null;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: RESEARCH_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      console.error(`${model} error:`, response.status);
      return null;
    }

    const data = await response.json();
    return { content: data.choices?.[0]?.message?.content || '', model };
  } catch (error) {
    console.error(`${model} call failed:`, error);
    return null;
  }
}

async function callAnthropic(prompt: string): Promise<{ content: string; model: string } | null> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) return null;

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
        max_tokens: 3000,
        system: RESEARCH_PROMPT,
        messages: [{ role: 'user', content: prompt }]
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return { content: data.content?.[0]?.text || '', model: 'claude-sonnet-4' };
  } catch {
    return null;
  }
}

function extractJSON(text: string): Record<string, unknown> | null {
  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[1]); } catch { /* continue */ }
    }
    const objMatch = text.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try { return JSON.parse(objMatch[0]); } catch { /* continue */ }
    }
    return null;
  }
}

// Cross-validate facts between model responses
function crossValidateFacts(responses: Array<{ data: Record<string, unknown>; model: string }>): ClaimResult[] {
  const claims: ClaimResult[] = [];
  const factMap = new Map<string, { value: unknown; models: string[]; type: string }>();
  
  for (const { data, model } of responses) {
    if (data.confidence_level === 'low' || data.error) continue;
    
    if (data.real_name && typeof data.real_name === 'string') {
      const key = `real_name:${data.real_name.toLowerCase().trim()}`;
      if (!factMap.has(key)) factMap.set(key, { value: data.real_name, models: [], type: 'real_name' });
      factMap.get(key)!.models.push(model);
    }
    
    if (data.birth_year) {
      const year = String(data.birth_year).replace(/[^0-9]/g, '').slice(0, 4);
      if (year.length === 4) {
        const key = `birth_year:${year}`;
        if (!factMap.has(key)) factMap.set(key, { value: year, models: [], type: 'birth_date' });
        factMap.get(key)!.models.push(model);
      }
    }
    
    if (data.birthplace && typeof data.birthplace === 'string') {
      const normalized = data.birthplace.toLowerCase().trim();
      const key = `birthplace:${normalized}`;
      if (!factMap.has(key)) factMap.set(key, { value: data.birthplace, models: [], type: 'birthplace' });
      factMap.get(key)!.models.push(model);
    }
    
    if (data.nationality && typeof data.nationality === 'string') {
      const normalized = data.nationality.toLowerCase().trim();
      const key = `nationality:${normalized}`;
      if (!factMap.has(key)) factMap.set(key, { value: data.nationality, models: [], type: 'bio_fact' });
      factMap.get(key)!.models.push(model);
    }
    
    const labels = data.labels as string[] || [];
    for (const label of labels) {
      if (typeof label === 'string' && label.length > 1) {
        const normalized = label.toLowerCase().trim();
        const key = `label:${normalized}`;
        if (!factMap.has(key)) factMap.set(key, { value: label, models: [], type: 'label' });
        factMap.get(key)!.models.push(model);
      }
    }
    
    const aliases = data.aliases as string[] || [];
    for (const alias of aliases) {
      if (typeof alias === 'string' && alias.length > 1) {
        const normalized = alias.toLowerCase().trim();
        const key = `alias:${normalized}`;
        if (!factMap.has(key)) factMap.set(key, { value: alias, models: [], type: 'alias' });
        factMap.get(key)!.models.push(model);
      }
    }
    
    const collabs = data.collaborators as string[] || [];
    for (const collab of collabs) {
      if (typeof collab === 'string' && collab.length > 1) {
        const normalized = collab.toLowerCase().trim();
        const key = `collaborator:${normalized}`;
        if (!factMap.has(key)) factMap.set(key, { value: collab, models: [], type: 'collaborator' });
        factMap.get(key)!.models.push(model);
      }
    }
    
    const releases = data.notable_releases as Array<Record<string, unknown>> || [];
    for (const release of releases) {
      if (release.title && release.year) {
        const key = `release:${String(release.title).toLowerCase()}:${release.year}`;
        if (!factMap.has(key)) factMap.set(key, { value: release, models: [], type: 'album' });
        factMap.get(key)!.models.push(model);
      }
    }
    
    if (data.style_description && typeof data.style_description === 'string') {
      const key = `style:general`;
      if (!factMap.has(key)) factMap.set(key, { value: data.style_description, models: [], type: 'style' });
      factMap.get(key)!.models.push(model);
    }
  }
  
  // ZERO TOLERANCE: Only accept facts confirmed by 2+ models
  for (const [, fact] of factMap) {
    const uniqueModels = [...new Set(fact.models)];
    
    if (uniqueModels.length >= 2) {
      const confidence = Math.min(0.95, 0.7 + (uniqueModels.length * 0.1));
      
      let claimText = '';
      let valueStructured: Record<string, unknown> = {};
      
      switch (fact.type) {
        case 'real_name':
          claimText = `Real name is ${fact.value}`;
          valueStructured = { real_name: fact.value };
          break;
        case 'birth_date':
          claimText = `Born in ${fact.value}`;
          valueStructured = { year: fact.value };
          break;
        case 'birthplace':
          claimText = `Born in ${fact.value}`;
          valueStructured = { location: fact.value };
          break;
        case 'bio_fact':
          claimText = `Nationality: ${fact.value}`;
          valueStructured = { nationality: fact.value };
          break;
        case 'label':
          claimText = `Released music on ${fact.value}`;
          valueStructured = { label_name: fact.value };
          break;
        case 'alias':
          claimText = `Also known as ${fact.value}`;
          valueStructured = { alias: fact.value };
          break;
        case 'collaborator':
          claimText = `Collaborated with ${fact.value}`;
          valueStructured = { artist: fact.value };
          break;
        case 'album':
          const rel = fact.value as Record<string, unknown>;
          claimText = `Released "${rel.title}"${rel.year ? ` (${rel.year})` : ''}${rel.label ? ` on ${rel.label}` : ''}`;
          valueStructured = rel;
          break;
        case 'style':
          claimText = `Musical style: ${fact.value}`;
          valueStructured = { style: fact.value };
          break;
      }
      
      if (claimText) {
        claims.push({
          claim_type: fact.type,
          claim_text: claimText,
          value_structured: valueStructured,
          confidence_score: confidence,
          source_models: uniqueModels,
          model_agreement: uniqueModels.length
        });
      }
    }
  }
  
  return claims;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function researchArtistStrict(artistName: string, artistId: string, supabase: any): Promise<{
  success: boolean;
  claims: ClaimResult[];
  models_queried: number;
  models_responded: number;
  verification_level: string;
}> {
  const prompt = `Provide ONLY verified facts about "${artistName}" (techno/electronic music artist).

Remember: ZERO TOLERANCE for speculation. Only include facts you are 100% certain about.
If unsure, return {"confidence_level": "low", "error": "Insufficient verified information"}`;

  const responses: Array<{ data: Record<string, unknown>; model: string }> = [];
  let modelsQueried = 0;
  let modelsResponded = 0;

  const modelCalls = [
    callLovableAI(prompt, 'google/gemini-2.5-flash'),
    callAnthropic(prompt),
    callLovableAI(prompt, 'openai/gpt-5-mini'),
    callLovableAI(prompt, 'google/gemini-2.5-pro')
  ];

  modelsQueried = modelCalls.length;
  const results = await Promise.allSettled(modelCalls);

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      const parsed = extractJSON(result.value.content);
      if (parsed && parsed.confidence_level !== 'low' && !parsed.error) {
        responses.push({ data: parsed, model: result.value.model });
        modelsResponded++;
        
        try {
          await supabase.from('artist_raw_documents').insert({
            artist_id: artistId,
            url: `ai-verified://${result.value.model}/${artistName.toLowerCase().replace(/\s+/g, '-')}/${Date.now()}`,
            domain: `ai.${result.value.model.split('/').pop()}`,
            content_json: parsed,
            content_text: result.value.content
          });
        } catch (e) {
          console.error('Raw doc insert error:', e);
        }
      }
    }
  }

  const verifiedClaims = crossValidateFacts(responses);

  let verificationLevel = 'unverified';
  if (modelsResponded >= 3 && verifiedClaims.length > 0) {
    verificationLevel = 'verified';
  } else if (modelsResponded >= 2 && verifiedClaims.length > 0) {
    verificationLevel = 'partially_verified';
  }

  for (const claim of verifiedClaims) {
    try {
      await supabase.from('artist_claims').insert({
        artist_id: artistId,
        claim_type: claim.claim_type,
        claim_text: claim.claim_text,
        value_structured: claim.value_structured,
        confidence_score: claim.confidence_score,
        verification_status: verificationLevel,
        extraction_model: claim.source_models.join(','),
        verification_model: `multi-model-${claim.model_agreement}`
      });
    } catch (err) {
      console.error('Claim insert error:', err);
    }
  }

  return {
    success: verifiedClaims.length > 0,
    claims: verifiedClaims,
    models_queried: modelsQueried,
    models_responded: modelsResponded,
    verification_level: verificationLevel
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function synthesizeRAGDocument(artistId: string, artistName: string, supabase: any): Promise<boolean> {
  const { data: claims } = await supabase
    .from('artist_claims')
    .select('claim_text, claim_type, confidence_score, verification_status')
    .eq('artist_id', artistId)
    .in('verification_status', ['verified', 'partially_verified'])
    .gte('confidence_score', 0.75)
    .order('confidence_score', { ascending: false })
    .limit(50);

  if (!claims?.length) {
    console.log(`No verified claims for ${artistName}`);
    return false;
  }

  const claimsArray = claims as Array<{ claim_type: string; claim_text: string }>;
  const synthesisPrompt = `Create a factual artist profile for ${artistName} using ONLY these verified facts:

${claimsArray.map(c => `- [${c.claim_type}] ${c.claim_text}`).join('\n')}

Write a well-structured, encyclopedic document. Do not add any information not in the facts above.`;

  const synthesis = await callLovableAI(synthesisPrompt, 'google/gemini-2.5-flash');
  
  if (synthesis) {
    await supabase
      .from('artist_documents')
      .delete()
      .eq('artist_id', artistId)
      .eq('document_type', 'rag_synthesis');

    await supabase.from('artist_documents').insert({
      artist_id: artistId,
      document_type: 'rag_synthesis',
      title: `${artistName} - Verified Artist Profile`,
      content: synthesis.content,
      metadata: {
        claims_used: claimsArray.length,
        generated_at: new Date().toISOString(),
        verification_policy: 'zero-tolerance'
      }
    });
    return true;
  }
  return false;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: ResearchRequest = await req.json();
    const { action, artist_id } = body;

    console.log(`[Zero-Tolerance Research] Action: ${action}`);

    switch (action) {
      case 'research_artist': {
        if (!artist_id) {
          return new Response(JSON.stringify({ success: false, error: 'artist_id required' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const { data: artist } = await supabase
          .from('canonical_artists')
          .select('canonical_name')
          .eq('artist_id', artist_id)
          .single();

        if (!artist) {
          return new Response(JSON.stringify({ success: false, error: 'Artist not found' }), {
            status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const result = await researchArtistStrict(artist.canonical_name, artist_id, supabase);

        return new Response(JSON.stringify({
          artist_id,
          artist_name: artist.canonical_name,
          policy: 'zero-tolerance',
          ...result
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'full_pipeline': {
        if (!artist_id) {
          return new Response(JSON.stringify({ success: false, error: 'artist_id required' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const { data: artist } = await supabase
          .from('canonical_artists')
          .select('canonical_name')
          .eq('artist_id', artist_id)
          .single();

        if (!artist) {
          return new Response(JSON.stringify({ success: false, error: 'Artist not found' }), {
            status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const research = await researchArtistStrict(artist.canonical_name, artist_id, supabase);
        const ragGenerated = await synthesizeRAGDocument(artist_id, artist.canonical_name, supabase);

        return new Response(JSON.stringify({
          artist_id,
          artist_name: artist.canonical_name,
          policy: 'zero-tolerance',
          research,
          rag_generated: ragGenerated
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'audit': {
        // Delete unverified and low-confidence claims
        await supabase
          .from('artist_claims')
          .delete()
          .or('confidence_score.lt.0.65,verification_status.eq.unverified');

        const { count: remainingClaims } = await supabase
          .from('artist_claims')
          .select('*', { count: 'exact', head: true });

        return new Response(JSON.stringify({
          success: true,
          action: 'audit',
          remaining_claims: remainingClaims,
          policy: 'zero-tolerance'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'status': {
        const { count: totalArtists } = await supabase
          .from('canonical_artists')
          .select('*', { count: 'exact', head: true });

        const { count: totalClaims } = await supabase
          .from('artist_claims')
          .select('*', { count: 'exact', head: true });

        const { count: verifiedClaims } = await supabase
          .from('artist_claims')
          .select('*', { count: 'exact', head: true })
          .in('verification_status', ['verified', 'partially_verified']);

        const { count: ragDocs } = await supabase
          .from('artist_documents')
          .select('*', { count: 'exact', head: true })
          .eq('document_type', 'rag_synthesis');

        return new Response(JSON.stringify({
          success: true,
          policy: 'zero-tolerance',
          stats: {
            total_artists: totalArtists,
            total_claims: totalClaims,
            verified_claims: verifiedClaims,
            rag_documents: ragDocs,
            verification_rate: totalClaims ? ((verifiedClaims || 0) / (totalClaims || 1) * 100).toFixed(1) + '%' : '0%'
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Invalid action',
          valid_actions: ['research_artist', 'full_pipeline', 'audit', 'status']
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

  } catch (error) {
    console.error('Zero-Tolerance Research error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
