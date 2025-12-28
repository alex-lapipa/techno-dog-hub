import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProcessingState {
  lastProcessedIndex: number;
  totalEntities: number;
  processedIds: string[];
  startedAt: string;
  completedAt?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const BATCH_SIZE = 2; // Process 2 artists at a time to avoid timeouts

  try {
    console.log("[BatchProcessor] Starting batch processing run");

    // Get or create processing state
    const { data: stateRow } = await supabase
      .from('agent_reports')
      .select('id, details')
      .eq('agent_name', 'batch-content-processor')
      .eq('status', 'in_progress')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let state: ProcessingState;
    let stateId: string;

    if (stateRow) {
      state = stateRow.details as ProcessingState;
      stateId = stateRow.id;
      console.log(`[BatchProcessor] Resuming from index ${state.lastProcessedIndex}`);
    } else {
      // Start new processing run
      state = {
        lastProcessedIndex: 0,
        totalEntities: 0,
        processedIds: [],
        startedAt: new Date().toISOString(),
      };
      
      const { data: newState, error } = await supabase
        .from('agent_reports')
        .insert({
          agent_name: 'batch-content-processor',
          agent_category: 'content',
          title: 'Batch Content Processing Run',
          description: 'Processing artists in batches overnight',
          severity: 'info',
          status: 'in_progress',
          details: state,
        })
        .select('id')
        .single();
      
      if (error) throw error;
      stateId = newState.id;
      console.log(`[BatchProcessor] Started new processing run: ${stateId}`);
    }

    // Get the latest audit report to know what to process
    const { data: auditReport } = await supabase
      .from('agent_reports')
      .select('details')
      .eq('agent_name', 'content-orchestrator')
      .eq('title', 'Content Audit: artist entities')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!auditReport?.details?.results) {
      console.log("[BatchProcessor] No audit results found, nothing to process");
      return new Response(
        JSON.stringify({ success: true, message: "No audit results to process" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const allEntities = auditReport.details.results as any[];
    state.totalEntities = allEntities.length;

    // Filter out already processed and get next batch
    const unprocessed = allEntities.filter(
      (e: any) => !state.processedIds.includes(e.entityId?.toString())
    );

    if (unprocessed.length === 0) {
      // All done!
      await supabase
        .from('agent_reports')
        .update({
          status: 'completed',
          details: { ...state, completedAt: new Date().toISOString() },
          description: `Completed processing ${state.processedIds.length} artists`,
        })
        .eq('id', stateId);

      console.log(`[BatchProcessor] All entities processed! Total: ${state.processedIds.length}`);
      return new Response(
        JSON.stringify({ success: true, message: "All entities processed", total: state.processedIds.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const batch = unprocessed.slice(0, BATCH_SIZE);
    console.log(`[BatchProcessor] Processing batch of ${batch.length} entities (${unprocessed.length} remaining)`);

    const batchResults: any[] = [];

    // Process each entity in the batch
    for (const entity of batch) {
      console.log(`[BatchProcessor] Processing: ${entity.entityName}`);

      try {
        // Step 1: Research via Firecrawl
        const researchResponse = await supabase.functions.invoke("content-researcher", {
          body: {
            entityName: entity.entityName,
            entityType: entity.entityType,
            searchQueries: entity.suggestedSearchQueries?.slice(0, 2) || [
              `${entity.entityName} techno artist bio`,
              `${entity.entityName} discography`,
            ],
          },
        });

        if (researchResponse.error) {
          console.error(`[BatchProcessor] Research failed for ${entity.entityName}:`, researchResponse.error);
          continue;
        }

        const researchData = researchResponse.data;
        console.log(`[BatchProcessor] Research found ${researchData?.sources?.length || 0} sources`);

        // Step 2: Cross-validate with multiple models
        const validationResponse = await supabase.functions.invoke("content-validator", {
          body: {
            entityName: entity.entityName,
            entityType: entity.entityType,
            currentData: {},
            researchData: researchData?.findings || {},
            sources: researchData?.sources?.slice(0, 5) || [],
          },
        });

        if (validationResponse.error) {
          console.error(`[BatchProcessor] Validation failed for ${entity.entityName}:`, validationResponse.error);
          continue;
        }

        const validation = validationResponse.data;

        batchResults.push({
          entityId: entity.entityId,
          entityName: entity.entityName,
          entityType: entity.entityType,
          gaps: validation.gaps || [],
          missingImages: validation.missingImages || false,
          suggestedUpdates: validation.suggestedUpdates || {},
          confidenceScore: validation.confidenceScore || 0,
          sources: validation.sources || [],
          validationStatus: validation.status || 'needs_review',
          modelAgreement: validation.modelAgreement,
          processedAt: new Date().toISOString(),
        });

        state.processedIds.push(entity.entityId?.toString());
        state.lastProcessedIndex++;

        console.log(`[BatchProcessor] Completed: ${entity.entityName} (confidence: ${validation.confidenceScore})`);
      } catch (err) {
        console.error(`[BatchProcessor] Error processing ${entity.entityName}:`, err);
      }
    }

    // Store batch results
    if (batchResults.length > 0) {
      await supabase.from("agent_reports").insert({
        agent_name: "batch-content-processor",
        agent_category: "content",
        title: `Batch Results: ${batchResults.map(r => r.entityName).join(", ")}`,
        description: `Processed ${batchResults.length} artists with cross-validation`,
        severity: batchResults.some(r => r.confidenceScore < 0.7) ? "warning" : "info",
        status: "completed",
        details: {
          results: batchResults,
          timestamp: new Date().toISOString(),
          batchNumber: Math.floor(state.lastProcessedIndex / BATCH_SIZE),
        },
      });
    }

    // Update processing state
    await supabase
      .from('agent_reports')
      .update({
        details: state,
        description: `Processing: ${state.processedIds.length}/${state.totalEntities} artists`,
      })
      .eq('id', stateId);

    const remaining = state.totalEntities - state.processedIds.length;
    console.log(`[BatchProcessor] Batch complete. Processed: ${state.processedIds.length}, Remaining: ${remaining}`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: batchResults.length,
        total: state.processedIds.length,
        remaining,
        results: batchResults,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[BatchProcessor] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Handle shutdown gracefully
addEventListener('beforeunload', (ev: any) => {
  console.log('[BatchProcessor] Shutdown due to:', ev.detail?.reason || 'unknown');
});
