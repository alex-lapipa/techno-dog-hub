import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Media Monitor: Checking media pipeline status...");

  const findings = [];

  // 1. Check pending jobs count
  const { count: pendingCount } = await supabase
    .from('media_pipeline_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // 2. Check failed jobs
  const { data: failedJobs, count: failedCount } = await supabase
    .from('media_pipeline_jobs')
    .select('*')
    .eq('status', 'failed')
    .order('updated_at', { ascending: false })
    .limit(10);

  // 3. Check processing jobs stuck for more than 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count: stuckCount } = await supabase
    .from('media_pipeline_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'processing')
    .lt('started_at', tenMinutesAgo);

  // 4. Check media assets without storage URL
  const { count: missingStorageCount } = await supabase
    .from('media_assets')
    .select('*', { count: 'exact', head: true })
    .is('storage_url', null)
    .eq('final_selected', true);

  // Report issues
  if (failedCount && failedCount > 0) {
    findings.push({
      type: 'failed_jobs',
      count: failedCount,
      severity: failedCount > 10 ? 'warning' : 'info',
      title: `${failedCount} failed media jobs`,
      description: 'Media acquisition failed for some entities'
    });
  }

  if (stuckCount && stuckCount > 0) {
    findings.push({
      type: 'stuck_processing',
      count: stuckCount,
      severity: 'warning',
      title: `${stuckCount} jobs stuck processing`,
      description: 'Jobs have been processing for over 10 minutes'
    });
  }

  if (pendingCount && pendingCount > 50) {
    findings.push({
      type: 'queue_backlog',
      count: pendingCount,
      severity: 'info',
      title: `Large queue backlog (${pendingCount})`,
      description: 'Consider increasing processing capacity'
    });
  }

  if (missingStorageCount && missingStorageCount > 0) {
    findings.push({
      type: 'missing_storage',
      count: missingStorageCount,
      severity: 'warning',
      title: `${missingStorageCount} assets missing storage`,
      description: 'Selected assets without uploaded files'
    });
  }

  // Insert findings as reports
  for (const finding of findings) {
    await supabase.from('agent_reports').insert({
      agent_name: 'Media Monitor',
      agent_category: 'content',
      report_type: 'finding',
      severity: finding.severity,
      title: finding.title,
      description: finding.description,
      details: { type: finding.type, count: finding.count }
    });
  }

  console.log(`Media Monitor: Complete. ${findings.length} issues found.`);

  return new Response(JSON.stringify({
    success: true,
    timestamp: new Date().toISOString(),
    stats: {
      pending: pendingCount || 0,
      failed: failedCount || 0,
      stuck: stuckCount || 0,
      missingStorage: missingStorageCount || 0
    },
    findings
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});