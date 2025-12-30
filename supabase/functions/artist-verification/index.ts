// Artist Knowledge Expansion Engine - AI Verification & Contradiction Detection
// Role B: Uses OpenAI GPT to verify claims and detect contradictions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerificationRequest {
  action: 'verify_claim' | 'verify_batch' | 'detect_contradictions' | 'verify_artist';
  artist_id?: string;
  claim_id?: string;
  limit?: number;
}

interface VerificationResult {
  claim_id: string;
  verification_status: 'unverified' | 'partially_verified' | 'verified' | 'disputed';
  confidence_score: number;
  reasoning: string;
  contradictions?: string[];
  source_quality_assessment?: string;
}

const VERIFICATION_PROMPT = `You are a meticulous fact-checker specializing in electronic music and techno artists.

Your task is to verify claims about an artist by:
1. Checking if the claim is supported by the provided sources
2. Assessing source quality and reliability
3. Detecting any contradictions with known facts
4. Assigning a verification status and confidence score

VERIFICATION RULES:
- A claim is "verified" if supported by 2+ independent sources OR 1 high-authority primary source
- A claim is "partially_verified" if supported by 1 source of moderate quality
- A claim is "disputed" if there are contradicting claims or sources
- A claim remains "unverified" if there's insufficient evidence

KNOWN FACTS ABOUT THIS ARTIST (treat as baseline truth):
{known_facts}

CLAIM TO VERIFY:
{claim}

SUPPORTING SOURCES:
{sources}

Return JSON:
{
  "verification_status": "verified" | "partially_verified" | "disputed" | "unverified",
  "confidence_score": 0.0-1.0,
  "reasoning": "Brief explanation of verification decision",
  "contradictions": ["List any contradicting claims or facts"],
  "source_quality_assessment": "Assessment of source reliability"
}`;

const CONTRADICTION_PROMPT = `You are analyzing a set of claims about an artist to detect contradictions.

CLAIMS:
{claims}

For each potential contradiction, identify:
1. The conflicting claims (by their IDs)
2. The nature of the conflict
3. Which claim (if any) is more likely correct based on source quality

Return JSON:
{
  "contradictions": [
    {
      "claim_a_id": "uuid",
      "claim_b_id": "uuid",
      "conflict_type": "date" | "fact" | "attribution" | "value",
      "description": "What specifically contradicts",
      "recommended_resolution": "Which claim to trust and why"
    }
  ]
}`;

async function callAI(prompt: string): Promise<any> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) throw new Error('LOVABLE_API_KEY not configured');
  
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content: 'You are a fact-checking assistant. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('AI API error:', error);
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  
  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  throw new Error('Failed to extract JSON from AI response');
}

async function getKnownFacts(supabase: any, artistId: string): Promise<string> {
  // Get verified claims as known facts
  const { data: verifiedClaims } = await supabase
    .from('artist_claims')
    .select('claim_type, claim_text, confidence_score')
    .eq('artist_id', artistId)
    .eq('verification_status', 'verified')
    .order('confidence_score', { ascending: false })
    .limit(20);
  
  if (!verifiedClaims?.length) {
    // Get artist basic info as baseline
    const { data: artist } = await supabase
      .from('canonical_artists')
      .select('canonical_name, country, city, primary_genre, active_years')
      .eq('artist_id', artistId)
      .single();
    
    if (artist) {
      return `Name: ${artist.canonical_name}\nCountry: ${artist.country || 'Unknown'}\nCity: ${artist.city || 'Unknown'}\nGenre: ${artist.primary_genre || 'Techno'}\nActive Years: ${artist.active_years || 'Unknown'}`;
    }
    return 'No verified facts available yet.';
  }
  
  return verifiedClaims
    .map((c: any) => `- [${c.claim_type}] ${c.claim_text} (confidence: ${c.confidence_score})`)
    .join('\n');
}

async function getClaimSources(supabase: any, claimId: string): Promise<string> {
  const { data: sources } = await supabase
    .from('artist_sources')
    .select('url, domain, quote_snippet, source_quality_score')
    .eq('claim_id', claimId);
  
  if (!sources?.length) {
    return 'No sources available.';
  }
  
  return sources
    .map((s: any) => `Source: ${s.domain} (quality: ${s.source_quality_score})\nURL: ${s.url}\nEvidence: "${s.quote_snippet}"`)
    .join('\n\n');
}

async function verifyClaim(
  supabase: any,
  claimId: string
): Promise<VerificationResult> {
  // Get claim
  const { data: claim, error: claimError } = await supabase
    .from('artist_claims')
    .select('*, canonical_artists(canonical_name)')
    .eq('claim_id', claimId)
    .single();
  
  if (claimError || !claim) {
    throw new Error(`Claim not found: ${claimId}`);
  }
  
  // Get known facts and sources
  const knownFacts = await getKnownFacts(supabase, claim.artist_id);
  const sources = await getClaimSources(supabase, claimId);
  
  // Build prompt
  const prompt = VERIFICATION_PROMPT
    .replace('{known_facts}', knownFacts)
    .replace('{claim}', `[${claim.claim_type}] ${claim.claim_text}`)
    .replace('{sources}', sources);
  
  // Call AI
  const result = await callAI(prompt);
  
  // Update claim with verification
  await supabase
    .from('artist_claims')
    .update({
      verification_status: result.verification_status,
      confidence_score: result.confidence_score,
      verification_model: 'gemini-2.5-flash',
      verified_at: new Date().toISOString()
    })
    .eq('claim_id', claimId);
  
  // If disputed, try to find the contradicting claim
  if (result.verification_status === 'disputed' && result.contradictions?.length) {
    // Log contradiction for manual review
    console.log(`Disputed claim ${claimId}:`, result.contradictions);
  }
  
  return {
    claim_id: claimId,
    ...result
  };
}

async function detectContradictions(
  supabase: any,
  artistId: string
): Promise<any[]> {
  // Get all claims for artist
  const { data: claims } = await supabase
    .from('artist_claims')
    .select('claim_id, claim_type, claim_text, value_structured, confidence_score')
    .eq('artist_id', artistId)
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (!claims?.length || claims.length < 2) {
    return [];
  }
  
  // Format claims for prompt
  const claimsText = claims
    .map((c: any) => `ID: ${c.claim_id}\nType: ${c.claim_type}\nClaim: ${c.claim_text}\nStructured: ${JSON.stringify(c.value_structured || {})}`)
    .join('\n\n');
  
  const prompt = CONTRADICTION_PROMPT.replace('{claims}', claimsText);
  const result = await callAI(prompt);
  
  // Update contradicting claims
  for (const contradiction of result.contradictions || []) {
    // Mark claim A as disputed, link to claim B
    await supabase
      .from('artist_claims')
      .update({
        verification_status: 'disputed',
        contradicts_claim_id: contradiction.claim_b_id
      })
      .eq('claim_id', contradiction.claim_a_id);
  }
  
  return result.contradictions || [];
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
    const body: VerificationRequest = await safeParseBody(req);
    const { action = 'status', artist_id, claim_id, limit = 10 } = body;

    console.log(`Artist verification action: ${action}`);

    if (action === 'verify_claim') {
      if (!claim_id) {
        throw new Error('claim_id required');
      }
      
      const result = await verifyClaim(supabase, claim_id);
      
      return new Response(JSON.stringify({
        success: true,
        result
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'verify_batch') {
      if (!artist_id) {
        throw new Error('artist_id required');
      }
      
      // Get unverified claims
      const { data: claims } = await supabase
        .from('artist_claims')
        .select('claim_id')
        .eq('artist_id', artist_id)
        .eq('verification_status', 'unverified')
        .order('created_at', { ascending: true })
        .limit(limit);
      
      const results: VerificationResult[] = [];
      
      for (const claim of claims || []) {
        try {
          const result = await verifyClaim(supabase, claim.claim_id);
          results.push(result);
          
          // Rate limit
          await new Promise(r => setTimeout(r, 1000));
        } catch (err) {
          console.error(`Error verifying ${claim.claim_id}:`, err);
          results.push({
            claim_id: claim.claim_id,
            verification_status: 'unverified',
            confidence_score: 0,
            reasoning: `Error: ${err instanceof Error ? err.message : 'Unknown'}`
          });
        }
      }
      
      // Summary stats
      const stats = {
        total: results.length,
        verified: results.filter(r => r.verification_status === 'verified').length,
        partially_verified: results.filter(r => r.verification_status === 'partially_verified').length,
        disputed: results.filter(r => r.verification_status === 'disputed').length,
        unverified: results.filter(r => r.verification_status === 'unverified').length
      };
      
      return new Response(JSON.stringify({
        success: true,
        stats,
        results
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'detect_contradictions') {
      if (!artist_id) {
        throw new Error('artist_id required');
      }
      
      const contradictions = await detectContradictions(supabase, artist_id);
      
      return new Response(JSON.stringify({
        success: true,
        contradictions_found: contradictions.length,
        contradictions
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'verify_artist') {
      // Full verification pipeline for an artist
      if (!artist_id) {
        throw new Error('artist_id required');
      }
      
      // Step 1: Verify all unverified claims
      const { data: unverifiedClaims } = await supabase
        .from('artist_claims')
        .select('claim_id')
        .eq('artist_id', artist_id)
        .eq('verification_status', 'unverified')
        .limit(limit);
      
      const verificationResults: VerificationResult[] = [];
      
      for (const claim of unverifiedClaims || []) {
        try {
          const result = await verifyClaim(supabase, claim.claim_id);
          verificationResults.push(result);
          await new Promise(r => setTimeout(r, 1000));
        } catch (err) {
          console.error(`Error verifying ${claim.claim_id}:`, err);
        }
      }
      
      // Step 2: Detect contradictions
      const contradictions = await detectContradictions(supabase, artist_id);
      
      // Step 3: Update enrichment run if exists
      const { data: latestRun } = await supabase
        .from('artist_enrichment_runs')
        .select('run_id, stats')
        .eq('artist_id', artist_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (latestRun) {
        const updatedStats = {
          ...(latestRun.stats || {}),
          verified_claims: verificationResults.filter(r => r.verification_status === 'verified').length,
          disputed_claims: verificationResults.filter(r => r.verification_status === 'disputed').length,
          contradictions_found: contradictions.length
        };
        
        await supabase
          .from('artist_enrichment_runs')
          .update({
            stats: updatedStats,
            models_used: ['gpt-4o-mini']
          })
          .eq('run_id', latestRun.run_id);
      }
      
      return new Response(JSON.stringify({
        success: true,
        claims_verified: verificationResults.length,
        contradictions_found: contradictions.length,
        stats: {
          verified: verificationResults.filter(r => r.verification_status === 'verified').length,
          partially_verified: verificationResults.filter(r => r.verification_status === 'partially_verified').length,
          disputed: verificationResults.filter(r => r.verification_status === 'disputed').length
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
    console.error('Artist verification error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
