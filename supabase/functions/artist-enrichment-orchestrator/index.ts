// Artist Knowledge Expansion Engine - Main Orchestrator
// Coordinates the full enrichment pipeline: Research → Extract → Verify → Synthesize

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrchestrationRequest {
  action: 'enrich_artist' | 'enrich_batch' | 'queue_artist' | 'process_queue' | 'status' | 'dashboard';
  artist_id?: string;
  priority?: number;
  reason?: string;
  limit?: number;
  objectives?: string[];
}

// Call another edge function
async function callFunction(
  supabaseUrl: string,
  serviceKey: string,
  functionName: string,
  body: any
): Promise<any> {
  const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error(`${functionName} error:`, error);
    throw new Error(`${functionName} failed: ${response.status}`);
  }
  
  return response.json();
}

async function enrichArtist(
  supabaseUrl: string,
  serviceKey: string,
  supabase: any,
  artistId: string,
  objectives: string[] = ['bio', 'discography', 'labels']
): Promise<any> {
  // Get artist info
  const { data: artist, error: artistError } = await supabase
    .from('canonical_artists')
    .select('canonical_name, slug')
    .eq('artist_id', artistId)
    .single();
  
  if (artistError || !artist) {
    throw new Error(`Artist not found: ${artistId}`);
  }
  
  // Get aliases
  const { data: aliases } = await supabase
    .from('artist_aliases')
    .select('alias_name')
    .eq('artist_id', artistId);
  
  const aliasNames = aliases?.map((a: any) => a.alias_name) || [];
  
  const results: any = {
    artist_id: artistId,
    artist_name: artist.canonical_name,
    steps: {}
  };
  
  try {
    // Step 1: Research - Discover and scrape web content
    console.log(`Step 1: Research for ${artist.canonical_name}`);
    const researchResult = await callFunction(supabaseUrl, serviceKey, 'artist-research', {
      action: 'research_artist',
      artist_id: artistId,
      artist_name: artist.canonical_name,
      aliases: aliasNames,
      objectives,
      limit: 10
    });
    results.steps.research = {
      success: researchResult.success,
      documents_stored: researchResult.stats?.documents_stored || 0,
      sources_discovered: researchResult.stats?.sources_discovered || 0
    };
    
    // Wait before next step
    await new Promise(r => setTimeout(r, 2000));
    
    // Step 2: Extraction - Extract claims from documents
    console.log(`Step 2: Extraction for ${artist.canonical_name}`);
    const extractionResult = await callFunction(supabaseUrl, serviceKey, 'artist-extraction', {
      action: 'extract_batch',
      artist_id: artistId,
      limit: 5
    });
    results.steps.extraction = {
      success: extractionResult.success,
      documents_processed: extractionResult.documents_processed || 0,
      claims_extracted: extractionResult.total_claims_extracted || 0
    };
    
    // Wait before next step
    await new Promise(r => setTimeout(r, 2000));
    
    // Step 3: Verification - Verify claims and detect contradictions
    console.log(`Step 3: Verification for ${artist.canonical_name}`);
    const verificationResult = await callFunction(supabaseUrl, serviceKey, 'artist-verification', {
      action: 'verify_artist',
      artist_id: artistId,
      limit: 20
    });
    results.steps.verification = {
      success: verificationResult.success,
      claims_verified: verificationResult.claims_verified || 0,
      contradictions_found: verificationResult.contradictions_found || 0,
      stats: verificationResult.stats
    };
    
    // Wait before next step
    await new Promise(r => setTimeout(r, 2000));
    
    // Step 4: Synthesis - Generate RAG documents
    console.log(`Step 4: Synthesis for ${artist.canonical_name}`);
    const synthesisResult = await callFunction(supabaseUrl, serviceKey, 'artist-synthesis', {
      action: 'generate_rag_docs',
      artist_id: artistId,
      include_partial: true,
      force_regenerate: true
    });
    results.steps.synthesis = {
      success: synthesisResult.success,
      documents_created: synthesisResult.documents_created || 0,
      chunks_embedded: synthesisResult.chunks_embedded || 0
    };
    
    results.success = true;
    
    // Update enrichment run
    await supabase
      .from('artist_enrichment_runs')
      .update({
        status: 'success',
        finished_at: new Date().toISOString(),
        models_used: ['claude-sonnet-4-20250514', 'gpt-4o-mini', 'google/gemini-2.5-flash'],
        stats: results.steps
      })
      .eq('artist_id', artistId)
      .eq('status', 'running')
      .order('created_at', { ascending: false })
      .limit(1);
    
  } catch (err) {
    results.success = false;
    results.error = err instanceof Error ? err.message : 'Unknown error';
    
    // Update enrichment run
    await supabase
      .from('artist_enrichment_runs')
      .update({
        status: 'failed',
        finished_at: new Date().toISOString(),
        errors: { message: results.error, steps: results.steps }
      })
      .eq('artist_id', artistId)
      .eq('status', 'running')
      .order('created_at', { ascending: false })
      .limit(1);
  }
  
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
    const body: OrchestrationRequest = await req.json();
    const { action, artist_id, priority = 0, reason, limit = 5, objectives } = body;

    console.log(`Orchestrator action: ${action}`);

    if (action === 'enrich_artist') {
      if (!artist_id) {
        throw new Error('artist_id required');
      }
      
      const result = await enrichArtist(supabaseUrl, supabaseKey, supabase, artist_id, objectives);
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'queue_artist') {
      if (!artist_id) {
        throw new Error('artist_id required');
      }
      
      // Add to queue
      const { data, error } = await supabase
        .from('artist_enrichment_queue')
        .upsert({
          artist_id,
          priority,
          reason: reason || 'manual_request',
          status: 'pending',
          attempts: 0
        }, {
          onConflict: 'artist_id,status',
          ignoreDuplicates: true
        })
        .select()
        .single();
      
      return new Response(JSON.stringify({
        success: !error,
        queued: !!data,
        queue_id: data?.queue_id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'process_queue') {
      // Get pending items from queue
      const { data: queueItems } = await supabase
        .from('artist_enrichment_queue')
        .select('queue_id, artist_id, priority, attempts')
        .eq('status', 'pending')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(limit);
      
      const results = [];
      
      for (const item of queueItems || []) {
        // Mark as processing
        await supabase
          .from('artist_enrichment_queue')
          .update({
            status: 'processing',
            last_attempt_at: new Date().toISOString(),
            attempts: item.attempts + 1
          })
          .eq('queue_id', item.queue_id);
        
        try {
          const result = await enrichArtist(supabaseUrl, supabaseKey, supabase, item.artist_id, objectives);
          
          // Mark as completed
          await supabase
            .from('artist_enrichment_queue')
            .update({ status: 'completed' })
            .eq('queue_id', item.queue_id);
          
          results.push({
            queue_id: item.queue_id,
            artist_id: item.artist_id,
            ...result
          });
        } catch (err) {
          // Mark as failed (will retry if attempts < max)
          const maxAttempts = 3;
          await supabase
            .from('artist_enrichment_queue')
            .update({
              status: item.attempts + 1 >= maxAttempts ? 'failed' : 'pending',
              last_error: err instanceof Error ? err.message : 'Unknown error'
            })
            .eq('queue_id', item.queue_id);
          
          results.push({
            queue_id: item.queue_id,
            artist_id: item.artist_id,
            success: false,
            error: err instanceof Error ? err.message : 'Unknown error'
          });
        }
        
        // Rate limit between artists
        await new Promise(r => setTimeout(r, 5000));
      }
      
      return new Response(JSON.stringify({
        success: true,
        processed: results.length,
        results
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'status') {
      // Get queue status
      const { data: queueStats } = await supabase
        .from('artist_enrichment_queue')
        .select('status');
      
      const statusCounts: Record<string, number> = {};
      for (const item of queueStats || []) {
        statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
      }
      
      // Get recent runs
      const { data: recentRuns } = await supabase
        .from('artist_enrichment_runs')
        .select('run_id, artist_id, status, started_at, finished_at, stats')
        .order('created_at', { ascending: false })
        .limit(10);
      
      return new Response(JSON.stringify({
        success: true,
        queue: statusCounts,
        recent_runs: recentRuns
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'dashboard') {
      // Comprehensive dashboard stats
      
      // Queue stats
      const { data: queueItems } = await supabase
        .from('artist_enrichment_queue')
        .select('status');
      
      const queueStats: Record<string, number> = {};
      for (const item of queueItems || []) {
        queueStats[item.status] = (queueStats[item.status] || 0) + 1;
      }
      
      // Claims stats
      const { data: claimStats } = await supabase
        .from('artist_claims')
        .select('verification_status');
      
      const claimCounts: Record<string, number> = {};
      for (const claim of claimStats || []) {
        claimCounts[claim.verification_status] = (claimCounts[claim.verification_status] || 0) + 1;
      }
      
      // Document stats
      const { count: rawDocsCount } = await supabase
        .from('artist_raw_documents')
        .select('*', { count: 'exact', head: true });
      
      const { count: enrichedDocsCount } = await supabase
        .from('artist_documents')
        .select('*', { count: 'exact', head: true })
        .eq('source_system', 'enrichment_pipeline');
      
      // Source domain stats
      const { data: topDomains } = await supabase
        .from('artist_raw_documents')
        .select('domain')
        .limit(1000);
      
      const domainCounts: Record<string, number> = {};
      for (const doc of topDomains || []) {
        if (doc.domain) {
          domainCounts[doc.domain] = (domainCounts[doc.domain] || 0) + 1;
        }
      }
      
      const topDomainsArray = Object.entries(domainCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([domain, count]) => ({ domain, count }));
      
      // Recent enrichment runs
      const { data: recentRuns } = await supabase
        .from('artist_enrichment_runs')
        .select(`
          run_id,
          artist_id,
          status,
          started_at,
          finished_at,
          stats,
          canonical_artists(canonical_name)
        `)
        .order('created_at', { ascending: false })
        .limit(20);
      
      // Artists needing enrichment (no verified claims)
      const { data: artistsWithClaims } = await supabase
        .from('artist_claims')
        .select('artist_id')
        .in('verification_status', ['verified', 'partially_verified']);
      
      const artistsWithClaimsSet = new Set(artistsWithClaims?.map((a: any) => a.artist_id) || []);
      
      const { count: totalArtists } = await supabase
        .from('canonical_artists')
        .select('*', { count: 'exact', head: true });
      
      return new Response(JSON.stringify({
        success: true,
        dashboard: {
          queue: queueStats,
          claims: {
            total: Object.values(claimCounts).reduce((a, b) => a + b, 0),
            by_status: claimCounts
          },
          documents: {
            raw: rawDocsCount,
            enriched: enrichedDocsCount
          },
          artists: {
            total: totalArtists,
            with_verified_claims: artistsWithClaimsSet.size,
            needing_enrichment: (totalArtists || 0) - artistsWithClaimsSet.size
          },
          top_sources: topDomainsArray,
          recent_runs: recentRuns?.map((r: any) => ({
            ...r,
            artist_name: r.canonical_artists?.canonical_name
          }))
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
    console.error('Orchestrator error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
