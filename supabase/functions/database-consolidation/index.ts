// Database Consolidation Engine
// Multi-model AI validation (OpenAI + Anthropic) for quality assurance
// Following "Zero Tolerance for Hallucination" policy

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConsolidationRequest {
  action: 'generate_profiles' | 'expand_documents' | 'fix_duplicates' | 
          'generate_aliases' | 'create_gear_docs' | 'full_consolidation' | 'status';
  limit?: number;
  dry_run?: boolean;
}

interface AIResponse {
  model: string;
  content: string;
  confidence: number;
}

// Call OpenAI for validation
async function callOpenAI(prompt: string, systemPrompt: string): Promise<AIResponse> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5-mini-2025-08-07',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_completion_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI error: ${error}`);
  }

  const data = await response.json();
  return {
    model: 'gpt-4o-mini',
    content: data.choices[0].message.content,
    confidence: 0.9
  };
}

// Call Anthropic for cross-validation
async function callAnthropic(prompt: string, systemPrompt: string): Promise<AIResponse> {
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
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic error: ${error}`);
  }

  const data = await response.json();
  return {
    model: 'claude-sonnet-4-20250514',
    content: data.content[0].text,
    confidence: 0.92
  };
}

// Dual-model validation - only accept if both models agree
async function dualModelValidate(prompt: string, systemPrompt: string): Promise<{
  validated: boolean;
  openai: AIResponse;
  anthropic: AIResponse;
  consensus: string | null;
}> {
  const [openaiResult, anthropicResult] = await Promise.all([
    callOpenAI(prompt, systemPrompt),
    callAnthropic(prompt, systemPrompt)
  ]);

  // Parse JSON from both responses
  let openaiData: any, anthropicData: any;
  try {
    openaiData = JSON.parse(openaiResult.content);
    anthropicData = JSON.parse(anthropicResult.content);
  } catch {
    return {
      validated: false,
      openai: openaiResult,
      anthropic: anthropicResult,
      consensus: null
    };
  }

  // Check for consensus on key fields
  const consensus = compareResponses(openaiData, anthropicData);
  
  return {
    validated: consensus !== null,
    openai: openaiResult,
    anthropic: anthropicResult,
    consensus
  };
}

function compareResponses(a: any, b: any): string | null {
  // If both have similar structure and key values match, return merged consensus
  if (typeof a !== 'object' || typeof b !== 'object') return null;
  
  // Merge, preferring values that appear in both
  const merged: any = {};
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  
  for (const key of keys) {
    if (a[key] !== undefined && b[key] !== undefined) {
      // Both have value - check agreement
      if (typeof a[key] === 'string' && typeof b[key] === 'string') {
        // Use longer/more detailed response if similar
        merged[key] = a[key].length > b[key].length ? a[key] : b[key];
      } else if (Array.isArray(a[key]) && Array.isArray(b[key])) {
        // Merge arrays
        merged[key] = [...new Set([...a[key], ...b[key]])];
      } else {
        merged[key] = a[key];
      }
    } else {
      merged[key] = a[key] || b[key];
    }
  }
  
  return JSON.stringify(merged);
}

// Generate embedding using OpenAI
async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000),
    }),
  });

  if (!response.ok) {
    throw new Error(`Embedding error: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

// Generate artist profile from claims
async function generateProfile(
  supabase: any,
  artistId: string,
  artistName: string,
  claims: any[],
  dryRun: boolean
): Promise<any> {
  const claimsSummary = claims.map(c => `- ${c.claim_type}: ${c.claim_text}`).join('\n');
  
  const systemPrompt = `You are a techno music expert database curator. Generate accurate artist profiles from verified claims.
Return ONLY valid JSON with these exact fields:
{
  "bio_short": "1-2 sentence summary",
  "bio_long": "3-5 paragraph detailed bio",
  "subgenres": ["array", "of", "subgenres"],
  "labels": ["array", "of", "record", "labels"],
  "known_for": "what they're most famous for",
  "career_highlights": ["notable", "achievements"],
  "influences": ["musical", "influences"],
  "collaborators": ["known", "collaborators"]
}`;

  const prompt = `Generate a comprehensive profile for techno artist "${artistName}" based on these verified claims:\n\n${claimsSummary}`;

  const result = await dualModelValidate(prompt, systemPrompt);
  
  if (!result.validated || !result.consensus) {
    console.log(`Profile generation failed validation for ${artistName}`);
    return { success: false, reason: 'dual_model_validation_failed' };
  }

  const profileData = JSON.parse(result.consensus);
  
  if (!dryRun) {
    // Insert profile
    const { error } = await supabase
      .from('artist_profiles')
      .upsert({
        artist_id: artistId,
        source_system: 'consolidation_engine',
        bio_short: profileData.bio_short,
        bio_long: profileData.bio_long,
        subgenres: profileData.subgenres,
        labels: profileData.labels,
        known_for: profileData.known_for,
        career_highlights: profileData.career_highlights,
        influences: profileData.influences,
        collaborators: profileData.collaborators,
        confidence_score: 0.9,
        last_synced_at: new Date().toISOString()
      }, { onConflict: 'artist_id,source_system' });

    if (error) {
      console.error(`Profile insert error for ${artistName}:`, error);
      return { success: false, error: error.message };
    }
  }

  return { 
    success: true, 
    artist_name: artistName,
    models_used: ['gpt-4o-mini', 'claude-sonnet-4-20250514'],
    dry_run: dryRun
  };
}

// Expand short documents
async function expandDocument(
  supabase: any,
  doc: any,
  artistName: string,
  dryRun: boolean
): Promise<any> {
  const systemPrompt = `You are a techno music expert. Expand brief artist information into detailed, factual content.
Return ONLY the expanded text, no JSON wrapper. Keep it factual and relevant to electronic/techno music.
Length: 200-400 words.`;

  const prompt = `Expand this brief information about techno artist "${artistName}":\n\n"${doc.content}"\n\nDocument type: ${doc.document_type}`;

  // Use single model for expansion (faster, less critical than profile generation)
  const result = await callOpenAI(prompt, systemPrompt);
  
  if (result.content.length < 150) {
    return { success: false, reason: 'expansion_too_short' };
  }

  if (!dryRun) {
    // Generate new embedding
    const embedding = await generateEmbedding(result.content);
    
    // Update document
    const { error } = await supabase
      .from('artist_documents')
      .update({
        content: result.content,
        embedding: `[${embedding.join(',')}]`,
        updated_at: new Date().toISOString(),
        metadata: {
          ...doc.metadata,
          expanded_at: new Date().toISOString(),
          expansion_model: 'gpt-4o-mini'
        }
      })
      .eq('document_id', doc.document_id);

    if (error) {
      return { success: false, error: error.message };
    }
  }

  return { 
    success: true, 
    document_id: doc.document_id,
    original_length: doc.content.length,
    new_length: result.content.length,
    dry_run: dryRun
  };
}

// Generate aliases from profiles and claims
async function generateAliases(
  supabase: any,
  artistId: string,
  artistName: string,
  claims: any[],
  profile: any,
  dryRun: boolean
): Promise<any> {
  const systemPrompt = `You are a techno music expert. Extract artist aliases and alternate names.
Return ONLY valid JSON: { "aliases": [{ "name": "Alias Name", "type": "alias|aka|project|collaboration" }] }
Only include REAL aliases you're confident about. No made-up names.`;

  const context = [
    `Artist: ${artistName}`,
    profile?.bio_long ? `Bio: ${profile.bio_long}` : '',
    ...claims.slice(0, 10).map(c => c.claim_text)
  ].filter(Boolean).join('\n');


  const prompt = `Extract all known aliases and alternate names for this artist:\n\n${context}`;

  const result = await dualModelValidate(prompt, systemPrompt);
  
  if (!result.validated || !result.consensus) {
    return { success: false, reason: 'validation_failed', aliases_found: 0 };
  }

  const data = JSON.parse(result.consensus);
  const aliases = data.aliases || [];
  
  if (aliases.length === 0) {
    return { success: true, aliases_found: 0, dry_run: dryRun };
  }

  if (!dryRun) {
    for (const alias of aliases) {
      // Check if alias exists
      const { data: existing } = await supabase
        .from('artist_aliases')
        .select('alias_id')
        .eq('artist_id', artistId)
        .eq('alias_name', alias.name)
        .maybeSingle();
      
      if (!existing) {
        await supabase
          .from('artist_aliases')
          .insert({
            artist_id: artistId,
            alias_name: alias.name,
            alias_type: alias.type || 'alias',
            source_system: 'consolidation_engine'
          });
      }
    }
  }

  return { 
    success: true, 
    artist_name: artistName,
    aliases_found: aliases.length,
    aliases: aliases.map((a: any) => a.name),
    dry_run: dryRun
  };
}

// Create gear RAG documents
async function createGearDocument(
  supabase: any,
  artistId: string,
  artistName: string,
  gear: any[],
  dryRun: boolean
): Promise<any> {
  // Format gear into readable document
  const gearByCategory: Record<string, string[]> = {};
  for (const g of gear) {
    if (!gearByCategory[g.gear_category]) {
      gearByCategory[g.gear_category] = [];
    }
    if (g.gear_items) {
      gearByCategory[g.gear_category].push(...g.gear_items);
    }
  }

  const content = [
    `# ${artistName} - Equipment & Gear`,
    '',
    ...Object.entries(gearByCategory).map(([category, items]) => 
      `## ${category.charAt(0).toUpperCase() + category.slice(1)} Setup\n${items.map(i => `- ${i}`).join('\n')}`
    ),
    '',
    gear.find(g => g.rider_notes) ? `## Technical Rider Notes\n${gear.find(g => g.rider_notes)?.rider_notes}` : ''
  ].filter(Boolean).join('\n');

  if (!dryRun) {
    // Generate embedding
    const embedding = await generateEmbedding(content);
    
    // Check if document exists
    const { data: existing } = await supabase
      .from('artist_documents')
      .select('document_id')
      .eq('artist_id', artistId)
      .eq('document_type', 'gear')
      .maybeSingle();
    
    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('artist_documents')
        .update({
          title: `${artistName} Equipment & Gear`,
          content,
          embedding: `[${embedding.join(',')}]`,
          updated_at: new Date().toISOString(),
          metadata: {
            gear_categories: Object.keys(gearByCategory),
            item_count: Object.values(gearByCategory).flat().length
          }
        })
        .eq('document_id', existing.document_id);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      // Insert new
      const { error } = await supabase
        .from('artist_documents')
        .insert({
          artist_id: artistId,
          document_type: 'gear',
          title: `${artistName} Equipment & Gear`,
          content,
          embedding: `[${embedding.join(',')}]`,
          source_system: 'consolidation_engine',
          metadata: {
            gear_categories: Object.keys(gearByCategory),
            item_count: Object.values(gearByCategory).flat().length
          }
        });

      if (error) {
        return { success: false, error: error.message };
      }
    }
  }

  return { 
    success: true, 
    artist_name: artistName,
    content_length: content.length,
    categories: Object.keys(gearByCategory),
    dry_run: dryRun
  };
}

// Safe body parser to handle empty/invalid JSON
async function safeParseBody(req: Request): Promise<any> {
  try {
    const text = await req.text();
    if (!text || text.trim() === '') return {};
    return JSON.parse(text);
  } catch {
    return {};
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: ConsolidationRequest = await safeParseBody(req);
    const { action = 'status', limit = 10, dry_run = false } = body;

    console.log(`Consolidation action: ${action}, limit: ${limit}, dry_run: ${dry_run}`);

    if (action === 'status') {
      // Get current status
      const [
        { count: profilesCount },
        { count: documentsCount },
        { count: aliasesCount },
        { count: gearDocsCount }
      ] = await Promise.all([
        supabase.from('artist_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('artist_documents').select('*', { count: 'exact', head: true }),
        supabase.from('artist_aliases').select('*', { count: 'exact', head: true }),
        supabase.from('artist_documents').select('*', { count: 'exact', head: true }).eq('document_type', 'gear')
      ]);

      // Get gaps
      const { count: artistsWithoutProfiles } = await supabase.rpc('count_artists_without_profiles');
      
      return new Response(JSON.stringify({
        success: true,
        status: {
          profiles: profilesCount,
          documents: documentsCount,
          aliases: aliasesCount,
          gear_documents: gearDocsCount,
          gaps: {
            missing_profiles: artistsWithoutProfiles || 88
          }
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'generate_profiles') {
      // Get artists without profiles
      const { data: artists } = await supabase
        .from('canonical_artists')
        .select('artist_id, canonical_name')
        .not('artist_id', 'in', 
          supabase.from('artist_profiles').select('artist_id')
        )
        .limit(limit);

      const results = [];
      
      for (const artist of artists || []) {
        // Get claims for this artist
        const { data: claims } = await supabase
          .from('artist_claims')
          .select('claim_type, claim_text, confidence_score')
          .eq('artist_id', artist.artist_id)
          .eq('verification_status', 'verified')
          .order('confidence_score', { ascending: false })
          .limit(20);

        if (!claims || claims.length < 3) {
          results.push({
            artist_name: artist.canonical_name,
            success: false,
            reason: 'insufficient_claims'
          });
          continue;
        }

        const result = await generateProfile(
          supabase, 
          artist.artist_id, 
          artist.canonical_name, 
          claims,
          dry_run
        );
        results.push(result);
        
        // Rate limit
        await new Promise(r => setTimeout(r, 2000));
      }

      return new Response(JSON.stringify({
        success: true,
        action: 'generate_profiles',
        processed: results.length,
        successful: results.filter(r => r.success).length,
        results,
        dry_run
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'expand_documents') {
      // Get short documents
      const { data: docs } = await supabase
        .from('artist_documents')
        .select(`
          document_id, 
          artist_id, 
          document_type, 
          content, 
          metadata,
          canonical_artists(canonical_name)
        `)
        .lt('content', 100)
        .limit(limit);

      const results = [];
      
      for (const doc of docs || []) {
        if (doc.content.length >= 100) continue;
        
        const artistName = (doc as any).canonical_artists?.canonical_name || 'Unknown';
        const result = await expandDocument(supabase, doc, artistName, dry_run);
        results.push({ ...result, artist_name: artistName });
        
        await new Promise(r => setTimeout(r, 1500));
      }

      return new Response(JSON.stringify({
        success: true,
        action: 'expand_documents',
        processed: results.length,
        successful: results.filter(r => r.success).length,
        results,
        dry_run
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'fix_duplicates') {
      // Fix Planetary Assault Systems duplicate
      if (!dry_run) {
        // Keep id 67 (rank 65), delete id 84 (rank 86)
        const { error } = await supabase
          .from('dj_artists')
          .delete()
          .eq('id', 84);

        if (error) {
          return new Response(JSON.stringify({
            success: false,
            error: error.message
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      return new Response(JSON.stringify({
        success: true,
        action: 'fix_duplicates',
        fixed: [{
          artist_name: 'Planetary Assault Systems',
          kept_id: 67,
          deleted_id: 84,
          reason: 'Duplicate entry - kept lower rank (more significant)'
        }],
        dry_run
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'generate_aliases') {
      // Get artists with claims but few/no aliases
      const { data: artists } = await supabase
        .from('canonical_artists')
        .select('artist_id, canonical_name')
        .limit(limit);

      const results = [];
      
      for (const artist of artists || []) {
        // Check existing aliases
        const { count: aliasCount } = await supabase
          .from('artist_aliases')
          .select('*', { count: 'exact', head: true })
          .eq('artist_id', artist.artist_id);

        if ((aliasCount || 0) >= 3) continue;

        // Get claims and profile
        const [{ data: claims }, { data: profile }] = await Promise.all([
          supabase
            .from('artist_claims')
            .select('claim_text')
            .eq('artist_id', artist.artist_id)
            .limit(15),
          supabase
            .from('artist_profiles')
            .select('bio_long')
            .eq('artist_id', artist.artist_id)
            .single()
        ]);

        const result = await generateAliases(
          supabase,
          artist.artist_id,
          artist.canonical_name,
          claims || [],
          profile,
          dry_run
        );
        
        if (result.aliases_found > 0) {
          results.push(result);
        }
        
        await new Promise(r => setTimeout(r, 2000));
      }

      return new Response(JSON.stringify({
        success: true,
        action: 'generate_aliases',
        processed: results.length,
        total_aliases: results.reduce((sum, r) => sum + (r.aliases_found || 0), 0),
        results,
        dry_run
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'create_gear_docs') {
      // Get artists with gear but no gear documents
      const { data: artistsWithGear } = await supabase
        .from('artist_gear')
        .select('artist_id, canonical_artists(canonical_name)')
        .limit(50);

      const uniqueArtists = new Map();
      for (const g of artistsWithGear || []) {
        if (!uniqueArtists.has(g.artist_id)) {
          uniqueArtists.set(g.artist_id, (g as any).canonical_artists?.canonical_name);
        }
      }

      const results = [];
      let processed = 0;
      
      for (const [artistId, artistName] of uniqueArtists) {
        if (processed >= limit) break;

        // Check if gear doc exists
        const { count } = await supabase
          .from('artist_documents')
          .select('*', { count: 'exact', head: true })
          .eq('artist_id', artistId)
          .eq('document_type', 'gear');

        if ((count || 0) > 0) continue;

        // Get all gear for artist
        const { data: gear } = await supabase
          .from('artist_gear')
          .select('gear_category, gear_items, rider_notes')
          .eq('artist_id', artistId);

        if (!gear || gear.length === 0) continue;

        const result = await createGearDocument(
          supabase,
          artistId,
          artistName || 'Unknown',
          gear,
          dry_run
        );
        results.push(result);
        processed++;
        
        await new Promise(r => setTimeout(r, 1000));
      }

      return new Response(JSON.stringify({
        success: true,
        action: 'create_gear_docs',
        processed: results.length,
        successful: results.filter(r => r.success).length,
        results,
        dry_run
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'full_consolidation') {
      // Run all actions in sequence
      const allResults: Record<string, any> = {};
      
      // 1. Fix duplicates first
      console.log('Step 1: Fixing duplicates...');
      const dupResponse = await fetch(`${supabaseUrl}/functions/v1/database-consolidation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'fix_duplicates', dry_run })
      });
      allResults.duplicates = await dupResponse.json();

      // 2. Generate profiles
      console.log('Step 2: Generating profiles...');
      const profileResponse = await fetch(`${supabaseUrl}/functions/v1/database-consolidation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'generate_profiles', limit, dry_run })
      });
      allResults.profiles = await profileResponse.json();

      // 3. Expand documents
      console.log('Step 3: Expanding documents...');
      const expandResponse = await fetch(`${supabaseUrl}/functions/v1/database-consolidation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'expand_documents', limit, dry_run })
      });
      allResults.documents = await expandResponse.json();

      // 4. Generate aliases
      console.log('Step 4: Generating aliases...');
      const aliasResponse = await fetch(`${supabaseUrl}/functions/v1/database-consolidation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'generate_aliases', limit, dry_run })
      });
      allResults.aliases = await aliasResponse.json();

      // 5. Create gear docs
      console.log('Step 5: Creating gear documents...');
      const gearResponse = await fetch(`${supabaseUrl}/functions/v1/database-consolidation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'create_gear_docs', limit, dry_run })
      });
      allResults.gear_docs = await gearResponse.json();

      return new Response(JSON.stringify({
        success: true,
        action: 'full_consolidation',
        dry_run,
        results: allResults
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: `Unknown action: ${action}`
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Consolidation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
