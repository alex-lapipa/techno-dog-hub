// Artist Knowledge Expansion Engine - AI Extraction & Normalization
// Role A: Uses Anthropic Claude to extract structured claims from raw documents

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExtractionRequest {
  action: 'extract_from_document' | 'extract_batch' | 'status';
  artist_id?: string;
  raw_doc_id?: string;
  limit?: number;
}

interface ExtractedClaim {
  claim_type: string;
  claim_text: string;
  value_structured?: Record<string, any>;
  evidence_snippet: string;
  confidence: number;
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

const EXTRACTION_PROMPT = `You are an expert music journalist and researcher specializing in electronic music and techno.

Your task is to extract factual claims about the artist from the provided document. Each claim should be:
1. A single, atomic fact (not compound statements)
2. Verifiable from the source text
3. Relevant to the artist's career, music, or biography

For each claim, provide:
- claim_type: One of these categories: ${CLAIM_TYPES.join(', ')}
- claim_text: A clear, factual statement (1-2 sentences max)
- value_structured: Structured data if applicable (dates as ISO strings, lists as arrays)
- evidence_snippet: The exact quote or passage from the source supporting this claim (max 200 chars)
- confidence: Your confidence level 0.0-1.0 based on source quality and clarity

Focus on:
- Career milestones and achievements
- Discography (releases, labels, collaborations)
- Musical style and influences
- Personal background (birthplace, real name)
- Notable quotes and philosophy
- Equipment and production techniques

Do NOT include:
- Opinions or subjective judgments
- Unverifiable claims
- Promotional language
- Speculation

Return a JSON object with:
{
  "artist_name_mentioned": "string", // The artist name as mentioned in the document
  "claims": [ExtractedClaim, ...]
}`;

async function callAnthropic(prompt: string, content: string, apiKey: string): Promise<any> {
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
      messages: [
        {
          role: 'user',
          content: `${prompt}\n\n---\nDOCUMENT CONTENT:\n${content.slice(0, 15000)}`
        }
      ]
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Anthropic API error:', error);
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content[0]?.text || '';
  
  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  throw new Error('Failed to extract JSON from Anthropic response');
}

async function extractFromDocument(
  supabase: any,
  rawDocId: string,
  artistId: string,
  anthropicKey: string
): Promise<{ claims_extracted: number; claims: any[] }> {
  // Get raw document
  const { data: doc, error: docError } = await supabase
    .from('artist_raw_documents')
    .select('*')
    .eq('raw_doc_id', rawDocId)
    .single();
  
  if (docError || !doc) {
    throw new Error(`Document not found: ${rawDocId}`);
  }
  
  // Get artist info
  const { data: artist } = await supabase
    .from('canonical_artists')
    .select('canonical_name, slug')
    .eq('artist_id', artistId)
    .single();
  
  const artistName = artist?.canonical_name || 'Unknown Artist';
  const content = doc.content_markdown || doc.content_text || '';
  
  if (!content || content.length < 100) {
    console.log('Document too short, skipping extraction');
    return { claims_extracted: 0, claims: [] };
  }
  
  // Call Anthropic for extraction
  const prompt = `${EXTRACTION_PROMPT}\n\nARTIST TO FOCUS ON: ${artistName}`;
  const result = await callAnthropic(prompt, content, anthropicKey);
  
  const claims = result.claims || [];
  const storedClaims = [];
  
  for (const claim of claims) {
    // Validate claim type
    if (!CLAIM_TYPES.includes(claim.claim_type)) {
      claim.claim_type = 'bio_fact'; // Default fallback
    }
    
    // Store claim
    const { data: storedClaim, error: claimError } = await supabase
      .from('artist_claims')
      .insert({
        artist_id: artistId,
        claim_type: claim.claim_type,
        claim_text: claim.claim_text,
        value_structured: claim.value_structured || null,
        confidence_score: Math.min(1, Math.max(0, claim.confidence || 0.5)),
        verification_status: 'unverified',
        extraction_model: 'claude-sonnet-4-20250514'
      })
      .select('claim_id')
      .single();
    
    if (claimError) {
      console.error('Error storing claim:', claimError);
      continue;
    }
    
    // Store source link
    await supabase
      .from('artist_sources')
      .insert({
        claim_id: storedClaim.claim_id,
        raw_doc_id: rawDocId,
        url: doc.url,
        domain: doc.domain,
        quote_snippet: (claim.evidence_snippet || '').slice(0, 500),
        source_quality_score: 0.5 // Will be updated during verification
      });
    
    storedClaims.push({
      claim_id: storedClaim.claim_id,
      ...claim
    });
  }
  
  return {
    claims_extracted: storedClaims.length,
    claims: storedClaims
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    
    if (!anthropicKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const body: ExtractionRequest = await req.json();
    const { action, artist_id, raw_doc_id, limit = 10 } = body;

    console.log(`Artist extraction action: ${action}`);

    if (action === 'extract_from_document') {
      if (!artist_id || !raw_doc_id) {
        throw new Error('artist_id and raw_doc_id required');
      }
      
      const result = await extractFromDocument(supabase, raw_doc_id, artist_id, anthropicKey);
      
      return new Response(JSON.stringify({
        success: true,
        ...result
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'extract_batch') {
      if (!artist_id) {
        throw new Error('artist_id required');
      }
      
      // Get unprocessed documents for this artist
      const { data: docs } = await supabase
        .from('artist_raw_documents')
        .select('raw_doc_id, url')
        .eq('artist_id', artist_id)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      // Get already processed doc IDs
      const { data: processedDocs } = await supabase
        .from('artist_sources')
        .select('raw_doc_id')
        .in('raw_doc_id', docs?.map((d: any) => d.raw_doc_id) || []);
      
      const processedIds = new Set(processedDocs?.map((d: any) => d.raw_doc_id) || []);
      const unprocessedDocs = docs?.filter((d: any) => !processedIds.has(d.raw_doc_id)) || [];
      
      const results = [];
      let totalClaims = 0;
      
      for (const doc of unprocessedDocs.slice(0, 5)) { // Process max 5 at a time
        try {
          const result = await extractFromDocument(supabase, doc.raw_doc_id, artist_id, anthropicKey);
          results.push({
            raw_doc_id: doc.raw_doc_id,
            url: doc.url,
            ...result
          });
          totalClaims += result.claims_extracted;
          
          // Rate limit
          await new Promise(r => setTimeout(r, 2000));
        } catch (err) {
          console.error(`Error processing ${doc.raw_doc_id}:`, err);
          results.push({
            raw_doc_id: doc.raw_doc_id,
            url: doc.url,
            error: err instanceof Error ? err.message : 'Unknown error'
          });
        }
      }
      
      return new Response(JSON.stringify({
        success: true,
        documents_processed: results.length,
        total_claims_extracted: totalClaims,
        results
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'status') {
      // Get extraction stats
      const { data: claimStats } = await supabase
        .from('artist_claims')
        .select('verification_status, claim_type')
        .eq('artist_id', artist_id);
      
      const stats = {
        total_claims: claimStats?.length || 0,
        by_status: {} as Record<string, number>,
        by_type: {} as Record<string, number>
      };
      
      for (const claim of claimStats || []) {
        stats.by_status[claim.verification_status] = (stats.by_status[claim.verification_status] || 0) + 1;
        stats.by_type[claim.claim_type] = (stats.by_type[claim.claim_type] || 0) + 1;
      }
      
      return new Response(JSON.stringify({
        success: true,
        stats
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
    console.error('Artist extraction error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
