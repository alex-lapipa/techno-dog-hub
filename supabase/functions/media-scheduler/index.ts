import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, batchSize = 5 } = await req.json().catch(() => ({ action: 'process-queue' }));

    console.log(`Media scheduler action: ${action}`);

    switch (action) {
      case 'process-queue': {
        // Process multiple jobs from the queue
        const results = [];
        
        for (let i = 0; i < batchSize; i++) {
          try {
            const response = await fetch(`${supabaseUrl}/functions/v1/media-curator`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({ action: 'process' }),
            });
            
            const result = await response.json();
            results.push(result);
            
            // If no more jobs, stop
            if (result.message === 'No jobs in queue') {
              break;
            }
            
            // Small delay between jobs
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error: unknown) {
            console.error('Error processing job:', error);
            const msg = error instanceof Error ? error.message : 'Unknown error';
            results.push({ error: msg });
          }
        }

        return new Response(JSON.stringify({ 
          success: true,
          processed: results.length,
          results,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'enqueue-missing': {
        // Find entities without images and enqueue jobs
        // This would query your entity tables - for now we'll return instructions
        
        // Get current stats
        const { data: existingAssets } = await supabase
          .from('media_assets')
          .select('entity_type, entity_id')
          .eq('final_selected', true);

        const existingKeys = new Set(
          existingAssets?.map(a => `${a.entity_type}:${a.entity_id}`) || []
        );

        return new Response(JSON.stringify({ 
          success: true,
          message: 'To enqueue missing entities, call with specific entity lists',
          existingCount: existingKeys.size,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'cleanup-failed': {
        // Reset failed jobs for retry
        const { data, error } = await supabase
          .from('media_pipeline_jobs')
          .update({ 
            status: 'queued',
            attempts: 0,
            error_log: null,
          })
          .eq('status', 'failed')
          .lt('attempts', 3)
          .select();

        if (error) throw error;

        return new Response(JSON.stringify({ 
          success: true,
          reset: data?.length || 0,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'cleanup-stale': {
        // Reset jobs that have been running for too long
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        
        const { data, error } = await supabase
          .from('media_pipeline_jobs')
          .update({ 
            status: 'queued',
            error_log: 'Reset: job was stale',
          })
          .eq('status', 'running')
          .lt('started_at', oneHourAgo)
          .select();

        if (error) throw error;

        return new Response(JSON.stringify({ 
          success: true,
          reset: data?.length || 0,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error: unknown) {
    console.error('Media scheduler error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
