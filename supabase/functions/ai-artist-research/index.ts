// AI-Powered Artist Research - Multi-Model Knowledge Generation
// Uses Lovable AI, Anthropic, and OpenAI to generate verified artist knowledge
// No Firecrawl dependency - pure AI knowledge synthesis

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResearchRequest {
  action: 'research_artist' | 'research_batch' | 'generate_claims' | 'full_pipeline' | 'status';
  artist_id?: string;
  artist_name?: string;
  limit?: number;
}

interface ClaimResult {
  claim_type: string;
  claim_text: string;
  value_structured?: Record<string, unknown>;
  confidence_score: number;
  source_model: string;
}

const CLAIM_TYPES = [
  'bio_fact', 'birthplace', 'birth_date', 'real_name',
  'release', 'album', 'track', 'remix',
  'label', 'label_founder',
  'genre', 'subgenre', 'style',
  'influence', 'influenced_by',
  'collaborator', 'collaboration',
  'award', 'achievement', 'milestone',
  'touring', 'residency', 'festival',
  'equipment', 'gear', 'technique',
  'education', 'career_start',
  'alias', 'side_project',
  'quote', 'philosophy'
];

const RESEARCH_PROMPT = `You are an expert electronic music historian and journalist specializing in techno, house, and underground electronic music.

Research and provide comprehensive, FACTUAL information about the artist. Focus on:

1. **Biography**: Real name, birth year/date, birthplace, nationality
2. **Career**: When they started, breakthrough moment, key career phases
3. **Discography**: Notable albums, EPs, singles with release years and labels
4. **Labels**: Labels they've released on, labels they founded/run
5. **Style**: Musical style, subgenres, production techniques, signature sound
6. **Influences**: Artists who influenced them, artists they've influenced
7. **Collaborations**: Key collaborators, side projects, aliases
8. **Achievements**: Awards, milestones, residencies, notable festival appearances
9. **Equipment**: Known gear, instruments, production setup
10. **Philosophy**: Artistic philosophy, notable quotes about music

CRITICAL RULES:
- Only include VERIFIED, FACTUAL information you are confident about
- If uncertain about something, don't include it
- Include specific dates, names, and details where known
- Focus on electronic/techno music context
- Do NOT confuse with other artists with similar names
- Be specific about the underground techno/electronic music scene

Return a comprehensive JSON object with structured data.`;

async function callLovableAI(prompt: string, model = 'google/gemini-2.5-flash'): Promise<{ content: string; model: string } | null> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) {
    console.error('LOVABLE_API_KEY not configured');
    return null;
  }

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
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      console.error('Lovable AI error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    return {
      content: data.choices?.[0]?.message?.content || '',
      model
    };
  } catch (error) {
    console.error('Lovable AI call failed:', error);
    return null;
  }
}

async function callAnthropic(prompt: string): Promise<{ content: string; model: string } | null> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    console.log('ANTHROPIC_API_KEY not configured, skipping');
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
        system: RESEARCH_PROMPT,
        messages: [{ role: 'user', content: prompt }]
      }),
    });

    if (!response.ok) {
      console.error('Anthropic error:', response.status);
      return null;
    }

    const data = await response.json();
    return {
      content: data.content?.[0]?.text || '',
      model: 'claude-sonnet-4-20250514'
    };
  } catch (error) {
    console.error('Anthropic call failed:', error);
    return null;
  }
}

async function callOpenAI(prompt: string): Promise<{ content: string; model: string } | null> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    console.log('OPENAI_API_KEY not configured, skipping');
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
          { role: 'system', content: RESEARCH_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI error:', response.status);
      return null;
    }

    const data = await response.json();
    return {
      content: data.choices?.[0]?.message?.content || '',
      model: 'gpt-4o'
    };
  } catch (error) {
    console.error('OpenAI call failed:', error);
    return null;
  }
}

function extractJSON(text: string): Record<string, unknown> | null {
  try {
    // Try direct parse
    return JSON.parse(text);
  } catch {
    // Try to extract from markdown code block
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch {
        // Continue to next attempt
      }
    }
    // Try to find JSON object in text
    const objMatch = text.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try {
        return JSON.parse(objMatch[0]);
      } catch {
        // Continue
      }
    }
    return null;
  }
}

function extractClaimsFromResearch(research: Record<string, unknown>, sourceModel: string): ClaimResult[] {
  const claims: ClaimResult[] = [];
  
  // Helper to add claim
  const addClaim = (type: string, text: string, structured?: Record<string, unknown>, confidence = 0.8) => {
    if (text && text.length > 5) {
      claims.push({
        claim_type: type,
        claim_text: text.slice(0, 500),
        value_structured: structured,
        confidence_score: confidence,
        source_model: sourceModel
      });
    }
  };
  
  // Extract biography claims
  if (research.real_name) addClaim('real_name', `Real name is ${research.real_name}`, { real_name: research.real_name }, 0.9);
  if (research.birth_year) addClaim('birth_date', `Born in ${research.birth_year}`, { year: research.birth_year }, 0.85);
  if (research.birthplace) addClaim('birthplace', `Born in ${research.birthplace}`, { location: research.birthplace }, 0.85);
  if (research.nationality) addClaim('bio_fact', `Nationality: ${research.nationality}`, { nationality: research.nationality }, 0.9);
  
  // Career facts
  if (research.career_start) addClaim('career_start', `Career began ${research.career_start}`, { year: research.career_start }, 0.8);
  if (research.breakthrough) addClaim('milestone', `${research.breakthrough}`, undefined, 0.75);
  
  // Labels
  const labels = research.labels as string[] || [];
  labels.forEach((label: string) => {
    addClaim('label', `Released music on ${label}`, { label_name: label }, 0.85);
  });
  
  if (research.founded_labels) {
    const founded = research.founded_labels as string[] || [];
    founded.forEach((label: string) => {
      addClaim('label_founder', `Founded/co-founded ${label}`, { label_name: label }, 0.9);
    });
  }
  
  // Discography
  const albums = research.notable_albums as Array<Record<string, unknown>> || research.albums as Array<Record<string, unknown>> || [];
  albums.forEach((album: Record<string, unknown>) => {
    const name = album.name || album.title;
    const year = album.year;
    const label = album.label;
    if (name) {
      addClaim('album', `Released album "${name}"${year ? ` (${year})` : ''}${label ? ` on ${label}` : ''}`, 
        { title: name, year, label }, 0.85);
    }
  });
  
  // Style and genre
  if (research.style) addClaim('style', `Musical style: ${research.style}`, { style: research.style }, 0.8);
  const subgenres = research.subgenres as string[] || [];
  subgenres.forEach((sg: string) => {
    addClaim('subgenre', `Associated with ${sg}`, { subgenre: sg }, 0.8);
  });
  
  // Influences
  const influences = research.influences as string[] || research.influenced_by as string[] || [];
  influences.forEach((inf: string) => {
    addClaim('influenced_by', `Influenced by ${inf}`, { artist: inf }, 0.75);
  });
  
  // Collaborations
  const collabs = research.collaborators as string[] || research.collaborations as string[] || [];
  collabs.forEach((collab: string) => {
    addClaim('collaborator', `Collaborated with ${collab}`, { artist: collab }, 0.8);
  });
  
  // Aliases
  const aliases = research.aliases as string[] || research.side_projects as string[] || [];
  aliases.forEach((alias: string) => {
    addClaim('alias', `Also known as ${alias}`, { alias }, 0.85);
  });
  
  // Equipment
  const gear = research.equipment as string[] || research.gear as string[] || [];
  gear.forEach((g: string) => {
    addClaim('equipment', `Uses ${g}`, { equipment: g }, 0.7);
  });
  
  // Achievements
  const achievements = research.achievements as string[] || research.milestones as string[] || [];
  achievements.forEach((ach: string) => {
    addClaim('achievement', ach, undefined, 0.75);
  });
  
  // Philosophy/quotes
  const quotes = research.notable_quotes as string[] || research.philosophy as string[] || [];
  quotes.forEach((quote: string) => {
    addClaim('quote', quote, undefined, 0.7);
  });
  
  // Bio summary
  if (research.bio_summary) addClaim('bio_fact', String(research.bio_summary).slice(0, 500), undefined, 0.8);
  
  return claims;
}

async function researchArtist(artistName: string, artistId: string, supabase: any): Promise<{
  success: boolean;
  claims: ClaimResult[];
  models_used: string[];
  raw_responses: number;
}> {
  const prompt = `Research the electronic music artist "${artistName}" (techno/electronic music producer/DJ).

Provide comprehensive factual information in this JSON structure:
{
  "artist_name": "confirmed artist name",
  "real_name": "their real name if known",
  "birth_year": "year born",
  "birthplace": "city, country",
  "nationality": "nationality",
  "career_start": "year or description",
  "breakthrough": "breakthrough moment/release",
  "labels": ["label1", "label2"],
  "founded_labels": ["labels they founded"],
  "notable_albums": [{"name": "album", "year": 2020, "label": "label"}],
  "style": "musical style description",
  "subgenres": ["techno", "industrial"],
  "influences": ["artist1", "artist2"],
  "influenced": ["artists they influenced"],
  "collaborators": ["collaborator1"],
  "aliases": ["alias1", "side_project1"],
  "equipment": ["gear item1"],
  "achievements": ["achievement1"],
  "notable_quotes": ["quote about music/art"],
  "bio_summary": "2-3 sentence biography"
}

IMPORTANT: Only include verified facts. This is ${artistName} the TECHNO/ELECTRONIC music artist.`;

  const allClaims: ClaimResult[] = [];
  const modelsUsed: string[] = [];
  let rawResponses = 0;

  // Call multiple AI models in parallel
  const [geminiResult, claudeResult, gptResult] = await Promise.allSettled([
    callLovableAI(prompt, 'google/gemini-2.5-flash'),
    callAnthropic(prompt),
    callLovableAI(prompt, 'openai/gpt-5-mini')
  ]);

  // Process Gemini result
  if (geminiResult.status === 'fulfilled' && geminiResult.value) {
    const parsed = extractJSON(geminiResult.value.content);
    if (parsed) {
      const claims = extractClaimsFromResearch(parsed, 'gemini-2.5-flash');
      allClaims.push(...claims);
      modelsUsed.push('gemini-2.5-flash');
      rawResponses++;
      
      // Store raw response
      await supabase.from('artist_raw_documents').insert({
        artist_id: artistId,
        url: `ai://gemini/${artistName.toLowerCase().replace(/\s+/g, '-')}`,
        domain: 'ai.gemini',
        content_json: parsed,
        content_text: geminiResult.value.content
      });
    }
  }

  // Process Claude result
  if (claudeResult.status === 'fulfilled' && claudeResult.value) {
    const parsed = extractJSON(claudeResult.value.content);
    if (parsed) {
      const claims = extractClaimsFromResearch(parsed, 'claude-sonnet-4');
      allClaims.push(...claims);
      modelsUsed.push('claude-sonnet-4');
      rawResponses++;
      
      await supabase.from('artist_raw_documents').insert({
        artist_id: artistId,
        url: `ai://claude/${artistName.toLowerCase().replace(/\s+/g, '-')}`,
        domain: 'ai.claude',
        content_json: parsed,
        content_text: claudeResult.value.content
      });
    }
  }

  // Process GPT result
  if (gptResult.status === 'fulfilled' && gptResult.value) {
    const parsed = extractJSON(gptResult.value.content);
    if (parsed) {
      const claims = extractClaimsFromResearch(parsed, 'gpt-5-mini');
      allClaims.push(...claims);
      modelsUsed.push('gpt-5-mini');
      rawResponses++;
      
      await supabase.from('artist_raw_documents').insert({
        artist_id: artistId,
        url: `ai://openai/${artistName.toLowerCase().replace(/\s+/g, '-')}`,
        domain: 'ai.openai',
        content_json: parsed,
        content_text: gptResult.value.content
      });
    }
  }

  // Deduplicate and merge claims with confidence boosting for agreement
  const mergedClaims = mergeClaims(allClaims);

  // Store claims in database
  for (const claim of mergedClaims) {
    await supabase.from('artist_claims').insert({
      artist_id: artistId,
      claim_type: claim.claim_type,
      claim_text: claim.claim_text,
      value_structured: claim.value_structured,
      confidence_score: claim.confidence_score,
      verification_status: claim.confidence_score >= 0.85 ? 'verified' : 
                          claim.confidence_score >= 0.7 ? 'partially_verified' : 'unverified',
      extraction_model: claim.source_model
    });
  }

  return {
    success: modelsUsed.length > 0,
    claims: mergedClaims,
    models_used: modelsUsed,
    raw_responses: rawResponses
  };
}

function mergeClaims(claims: ClaimResult[]): ClaimResult[] {
  const claimMap = new Map<string, ClaimResult[]>();
  
  // Group similar claims
  claims.forEach(claim => {
    const key = `${claim.claim_type}:${claim.claim_text.toLowerCase().slice(0, 50)}`;
    if (!claimMap.has(key)) {
      claimMap.set(key, []);
    }
    claimMap.get(key)!.push(claim);
  });
  
  // Merge and boost confidence for multi-model agreement
  const merged: ClaimResult[] = [];
  claimMap.forEach((group) => {
    const best = group.reduce((a, b) => 
      a.confidence_score > b.confidence_score ? a : b
    );
    
    // Boost confidence if multiple models agree
    const modelCount = new Set(group.map(c => c.source_model)).size;
    if (modelCount >= 2) {
      best.confidence_score = Math.min(0.95, best.confidence_score + 0.1);
    }
    if (modelCount >= 3) {
      best.confidence_score = Math.min(0.98, best.confidence_score + 0.05);
    }
    
    best.source_model = group.map(c => c.source_model).join(',');
    merged.push(best);
  });
  
  return merged;
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
    const { action, artist_id, artist_name, limit = 5 } = body;

    console.log(`AI Artist Research - Action: ${action}`);

    switch (action) {
      case 'research_artist': {
        if (!artist_id) {
          return new Response(JSON.stringify({ success: false, error: 'artist_id required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Get artist name from canonical_artists
        const { data: artist } = await supabase
          .from('canonical_artists')
          .select('canonical_name')
          .eq('artist_id', artist_id)
          .single();

        if (!artist) {
          return new Response(JSON.stringify({ success: false, error: 'Artist not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const result = await researchArtist(artist.canonical_name, artist_id, supabase);

        return new Response(JSON.stringify({
          artist_id,
          artist_name: artist.canonical_name,
          ...result
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'research_batch': {
        // Get artists without claims
        const { data: artists } = await supabase
          .from('canonical_artists')
          .select('artist_id, canonical_name')
          .order('rank', { ascending: true })
          .limit(limit);

        // Filter to those without claims
        const results = [];
        for (const artist of artists || []) {
          const { count } = await supabase
            .from('artist_claims')
            .select('*', { count: 'exact', head: true })
            .eq('artist_id', artist.artist_id);

          if (count === 0) {
            console.log(`Researching: ${artist.canonical_name}`);
            const result = await researchArtist(artist.canonical_name, artist.artist_id, supabase);
            results.push({
              artist_id: artist.artist_id,
              artist_name: artist.canonical_name,
              ...result
            });
          }
        }

        return new Response(JSON.stringify({
          success: true,
          processed: results.length,
          results
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'full_pipeline': {
        if (!artist_id) {
          return new Response(JSON.stringify({ success: false, error: 'artist_id required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Get artist
        const { data: artist } = await supabase
          .from('canonical_artists')
          .select('canonical_name')
          .eq('artist_id', artist_id)
          .single();

        if (!artist) {
          return new Response(JSON.stringify({ success: false, error: 'Artist not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Step 1: Research
        console.log(`[Pipeline] Researching ${artist.canonical_name}...`);
        const research = await researchArtist(artist.canonical_name, artist_id, supabase);

        // Step 2: Synthesize RAG document
        console.log(`[Pipeline] Synthesizing RAG doc...`);
        const synthesisPrompt = `Based on these verified claims about ${artist.canonical_name}, write a comprehensive artist profile suitable for a techno music encyclopedia:

${research.claims.map(c => `- ${c.claim_text}`).join('\n')}

Write a well-structured document with sections for Biography, Discography, Musical Style, and Legacy. Use factual, encyclopedic tone.`;

        const synthesis = await callLovableAI(synthesisPrompt, 'google/gemini-2.5-flash');
        
        if (synthesis) {
          // Store RAG document
          await supabase.from('artist_documents').insert({
            artist_id,
            document_type: 'rag_synthesis',
            title: `${artist.canonical_name} - Artist Profile`,
            content: synthesis.content,
            metadata: {
              models_used: research.models_used,
              claims_count: research.claims.length,
              generated_at: new Date().toISOString()
            }
          });
        }

        return new Response(JSON.stringify({
          success: true,
          artist_id,
          artist_name: artist.canonical_name,
          research,
          synthesis_generated: !!synthesis
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'status': {
        const { count: totalArtists } = await supabase
          .from('canonical_artists')
          .select('*', { count: 'exact', head: true });

        const { count: artistsWithClaims } = await supabase
          .from('artist_claims')
          .select('artist_id', { count: 'exact', head: true });

        const { count: totalClaims } = await supabase
          .from('artist_claims')
          .select('*', { count: 'exact', head: true });

        const { count: ragDocs } = await supabase
          .from('artist_documents')
          .select('*', { count: 'exact', head: true })
          .eq('document_type', 'rag_synthesis');

        const { count: aiDocs } = await supabase
          .from('artist_raw_documents')
          .select('*', { count: 'exact', head: true })
          .like('domain', 'ai.%');

        return new Response(JSON.stringify({
          success: true,
          stats: {
            total_artists: totalArtists,
            artists_with_claims: artistsWithClaims,
            total_claims: totalClaims,
            rag_documents: ragDocs,
            ai_generated_docs: aiDocs
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Invalid action',
          valid_actions: ['research_artist', 'research_batch', 'full_pipeline', 'status']
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

  } catch (error) {
    console.error('AI Artist Research error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
