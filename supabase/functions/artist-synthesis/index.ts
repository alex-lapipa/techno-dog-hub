// Artist Knowledge Expansion Engine - RAG Document Synthesis
// Role C: Creates artist knowledge documents for vectorization from verified claims

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SynthesisRequest {
  action: 'synthesize_artist' | 'generate_rag_docs' | 'update_vectors' | 'status';
  artist_id?: string;
  include_partial?: boolean; // Include partially_verified claims
  force_regenerate?: boolean;
}

const SYNTHESIS_PROMPT = `You are a music encyclopedia editor creating authoritative artist profiles.

Using the verified claims below, synthesize a comprehensive artist knowledge document. Structure it as:

1. **Biography Overview** (2-3 paragraphs)
   - Background, origin, real name if known
   - Career trajectory and key milestones
   - Current status and activities

2. **Musical Style & Sound**
   - Genre and subgenres
   - Production techniques and equipment
   - Influences and influenced artists

3. **Discography Highlights**
   - Key releases, albums, EPs
   - Notable tracks and remixes
   - Label affiliations

4. **Career Achievements**
   - Awards and recognition
   - Festival appearances and residencies
   - Collaborations and side projects

IMPORTANT:
- Only use facts from the verified claims provided
- Write in an encyclopedic, neutral tone
- Include specific dates, names, and details when available
- Do not invent or assume facts not in the claims

VERIFIED CLAIMS:
{claims}

Return the document as markdown.`;

async function callLovableAI(messages: any[], model = 'google/gemini-2.5-flash'): Promise<string | null> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) {
    throw new Error('LOVABLE_API_KEY not configured');
  }

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.5,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Lovable AI error:', response.status, error);
    throw new Error(`Lovable AI error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || null;
}

async function generateEmbedding(text: string): Promise<number[] | null> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) {
    console.warn('OPENAI_API_KEY not set, skipping embedding');
    return null;
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000),
    }),
  });

  if (!response.ok) {
    console.error('Embedding error:', await response.text());
    return null;
  }

  const data = await response.json();
  return data.data[0]?.embedding || null;
}

// Create deterministic chunk ID
function createChunkId(artistId: string, docType: string, chunkIndex: number): string {
  const input = `${artistId}:${docType}:${chunkIndex}`;
  // Simple hash
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `chunk_${Math.abs(hash).toString(16)}`;
}

// Split text into chunks
function chunkText(text: string, maxChunkSize = 1500): string[] {
  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const para of paragraphs) {
    if (currentChunk.length + para.length > maxChunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = para;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + para;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

async function synthesizeArtist(
  supabase: any,
  artistId: string,
  includePartial: boolean
): Promise<{ document: string; sources: string[] }> {
  // Get artist info
  const { data: artist } = await supabase
    .from('canonical_artists')
    .select('canonical_name, country, city, primary_genre')
    .eq('artist_id', artistId)
    .single();
  
  if (!artist) {
    throw new Error(`Artist not found: ${artistId}`);
  }
  
  // Get claims - verified first, then unverified if includePartial
  const statuses = ['verified', 'partially_verified'];
  if (includePartial) statuses.push('unverified');
  
  const { data: claims } = await supabase
    .from('artist_claims')
    .select(`
      claim_id,
      claim_type,
      claim_text,
      value_structured,
      confidence_score,
      verification_status,
      artist_sources(url, domain)
    `)
    .eq('artist_id', artistId)
    .in('verification_status', statuses)
    .order('confidence_score', { ascending: false })
    .limit(100); // Limit to avoid token overflow
  
  if (!claims?.length) {
    // Return basic profile from canonical data
    return {
      document: `# ${artist.canonical_name}\n\n${artist.canonical_name} is a ${artist.primary_genre || 'techno'} artist from ${artist.city || artist.country || 'unknown location'}.\n\n*No verified claims available yet.*`,
      sources: []
    };
  }
  
  // Format claims for prompt
  const claimsText = claims
    .map((c: any) => `- [${c.claim_type}] ${c.claim_text} (confidence: ${c.confidence_score.toFixed(2)})`)
    .join('\n');
  
  const prompt = SYNTHESIS_PROMPT.replace('{claims}', claimsText);
  
  const document = await callLovableAI([
    { role: 'system', content: 'You are a music encyclopedia editor.' },
    { role: 'user', content: `Artist: ${artist.canonical_name}\n\n${prompt}` }
  ]);
  
  // Collect unique sources
  const sources = new Set<string>();
  for (const claim of claims) {
    for (const source of claim.artist_sources || []) {
      sources.add(source.url);
    }
  }
  
  return {
    document: document || `# ${artist.canonical_name}\n\nProfile generation failed.`,
    sources: Array.from(sources)
  };
}

async function generateRagDocs(
  supabase: any,
  artistId: string,
  document: string,
  sources: string[],
  forceRegenerate: boolean
): Promise<{ documents_created: number; chunks_embedded: number }> {
  // Get artist info
  const { data: artist } = await supabase
    .from('canonical_artists')
    .select('canonical_name')
    .eq('artist_id', artistId)
    .single();
  
  const docTypes = [
    { type: 'enriched_profile', content: document, title: `${artist?.canonical_name} - Enriched Profile` }
  ];
  
  let documentsCreated = 0;
  let chunksEmbedded = 0;
  
  for (const doc of docTypes) {
    // Check if document already exists
    if (!forceRegenerate) {
      const { data: existing } = await supabase
        .from('artist_documents')
        .select('document_id')
        .eq('artist_id', artistId)
        .eq('document_type', doc.type)
        .eq('chunk_index', 0)
        .single();
      
      if (existing) {
        console.log(`Document ${doc.type} already exists for ${artistId}`);
        continue;
      }
    }
    
    // Delete old documents of this type (mark as inactive would be better but keeping it simple)
    if (forceRegenerate) {
      await supabase
        .from('artist_documents')
        .delete()
        .eq('artist_id', artistId)
        .eq('document_type', doc.type)
        .eq('source_system', 'enrichment_pipeline');
    }
    
    // Chunk the document
    const chunks = chunkText(doc.content);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkId = createChunkId(artistId, doc.type, i);
      
      // Generate embedding
      const embedding = await generateEmbedding(chunk);
      
      // Store document chunk (chunk_id is auto-generated, don't include it)
      const { error } = await supabase
        .from('artist_documents')
        .insert({
          artist_id: artistId,
          document_type: doc.type,
          title: doc.title,
          content: chunk,
          chunk_index: i,
          embedding: embedding ? `[${embedding.join(',')}]` : null,
          source_system: 'enrichment_pipeline',
          metadata: {
            sources: sources.slice(0, 10),
            generated_at: new Date().toISOString(),
            total_chunks: chunks.length
          }
        });
      
      if (error) {
        console.error('Error storing document chunk:', error);
        continue;
      }
      
      if (embedding) chunksEmbedded++;
    }
    
    documentsCreated++;
  }
  
  return { documents_created: documentsCreated, chunks_embedded: chunksEmbedded };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const body: SynthesisRequest = await req.json();
    const { action, artist_id, include_partial = true, force_regenerate = false } = body;

    console.log(`Artist synthesis action: ${action}`);

    if (action === 'synthesize_artist') {
      if (!artist_id) {
        throw new Error('artist_id required');
      }
      
      const result = await synthesizeArtist(supabase, artist_id, include_partial);
      
      return new Response(JSON.stringify({
        success: true,
        document: result.document,
        sources_count: result.sources.length,
        sources: result.sources
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'generate_rag_docs') {
      if (!artist_id) {
        throw new Error('artist_id required');
      }
      
      // Step 1: Synthesize
      const synthesis = await synthesizeArtist(supabase, artist_id, include_partial);
      
      // Step 2: Generate RAG documents
      const result = await generateRagDocs(
        supabase, 
        artist_id, 
        synthesis.document, 
        synthesis.sources,
        force_regenerate
      );
      
      return new Response(JSON.stringify({
        success: true,
        ...result,
        document_preview: synthesis.document.slice(0, 500) + '...'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'update_vectors') {
      // Batch update vectors for all artists with verified claims but outdated docs
      const { data: artists } = await supabase
        .from('canonical_artists')
        .select('artist_id, canonical_name')
        .limit(50);
      
      const results = [];
      
      for (const artist of artists || []) {
        try {
          // Check if has verified claims
          const { count } = await supabase
            .from('artist_claims')
            .select('*', { count: 'exact', head: true })
            .eq('artist_id', artist.artist_id)
            .in('verification_status', ['verified', 'partially_verified']);
          
          if (!count || count === 0) continue;
          
          // Check if has enriched profile
          const { data: existingDoc } = await supabase
            .from('artist_documents')
            .select('document_id, updated_at')
            .eq('artist_id', artist.artist_id)
            .eq('document_type', 'enriched_profile')
            .eq('source_system', 'enrichment_pipeline')
            .single();
          
          // Skip if recent
          if (existingDoc) {
            const docAge = Date.now() - new Date(existingDoc.updated_at).getTime();
            if (docAge < 24 * 60 * 60 * 1000) continue; // Less than 24h old
          }
          
          // Generate
          const synthesis = await synthesizeArtist(supabase, artist.artist_id, true);
          const result = await generateRagDocs(
            supabase,
            artist.artist_id,
            synthesis.document,
            synthesis.sources,
            true
          );
          
          results.push({
            artist_id: artist.artist_id,
            name: artist.canonical_name,
            ...result
          });
          
          // Rate limit
          await new Promise(r => setTimeout(r, 2000));
        } catch (err) {
          console.error(`Error updating ${artist.artist_id}:`, err);
        }
      }
      
      return new Response(JSON.stringify({
        success: true,
        artists_processed: results.length,
        results
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'status') {
      // Get synthesis stats
      const { data: enrichedDocs } = await supabase
        .from('artist_documents')
        .select('artist_id, document_type, updated_at')
        .eq('source_system', 'enrichment_pipeline')
        .eq('chunk_index', 0);
      
      const artistsWithDocs = new Set(enrichedDocs?.map((d: any) => d.artist_id) || []);
      
      const { count: totalArtists } = await supabase
        .from('canonical_artists')
        .select('*', { count: 'exact', head: true });
      
      const { count: artistsWithClaims } = await supabase
        .from('artist_claims')
        .select('artist_id', { count: 'exact', head: true })
        .in('verification_status', ['verified', 'partially_verified']);
      
      return new Response(JSON.stringify({
        success: true,
        stats: {
          total_artists: totalArtists,
          artists_with_verified_claims: artistsWithClaims,
          artists_with_enriched_docs: artistsWithDocs.size,
          total_enriched_docs: enrichedDocs?.length || 0
        }
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
    console.error('Artist synthesis error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
