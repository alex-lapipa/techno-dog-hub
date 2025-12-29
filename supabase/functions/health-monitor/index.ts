import { corsHeaders, handleCors, jsonResponse } from "../_shared/cors.ts";
import { createServiceClient, getRequiredEnv } from "../_shared/supabase.ts";

interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latencyMs: number;
  details?: string;
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const supabaseUrl = getRequiredEnv("SUPABASE_URL");
  const supabaseKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createServiceClient();

  console.log("Health Monitor: Starting health checks...");

  const checks: HealthCheck[] = [];

  // 1. Database connectivity check
  const dbStart = Date.now();
  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    const dbLatency = Date.now() - dbStart;
    
    if (error) {
      checks.push({
        name: 'database',
        status: 'down',
        latencyMs: dbLatency,
        details: error.message
      });
    } else {
      checks.push({
        name: 'database',
        status: dbLatency > 1000 ? 'degraded' : 'healthy',
        latencyMs: dbLatency,
        details: `${count || 0} profiles`
      });
    }
  } catch (e) {
    checks.push({
      name: 'database',
      status: 'down',
      latencyMs: Date.now() - dbStart,
      details: e instanceof Error ? e.message : 'Unknown error'
    });
  }

  // 2. Edge functions check (ping test)
  const edgeStart = Date.now();
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/api-v1-ping`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
      }
    });
    
    const edgeLatency = Date.now() - edgeStart;
    
    checks.push({
      name: 'edge_functions',
      status: response.ok ? (edgeLatency > 2000 ? 'degraded' : 'healthy') : 'down',
      latencyMs: edgeLatency,
      details: response.ok ? 'Responding' : `Status ${response.status}`
    });
  } catch (e) {
    checks.push({
      name: 'edge_functions',
      status: 'down',
      latencyMs: Date.now() - edgeStart,
      details: e instanceof Error ? e.message : 'Unknown error'
    });
  }

  // 3. Media pipeline check
  const mediaStart = Date.now();
  try {
    const { data: pendingJobs, error } = await supabase
      .from('media_pipeline_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    const { data: failedJobs } = await supabase
      .from('media_pipeline_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'failed');
    
    const mediaLatency = Date.now() - mediaStart;
    
    const failedCount = (failedJobs as any)?.length || 0;
    
    checks.push({
      name: 'media_pipeline',
      status: failedCount > 5 ? 'degraded' : 'healthy',
      latencyMs: mediaLatency,
      details: failedCount > 0 ? `${failedCount} failed jobs` : 'All clear'
    });
  } catch (e) {
    checks.push({
      name: 'media_pipeline',
      status: 'down',
      latencyMs: Date.now() - mediaStart,
      details: e instanceof Error ? e.message : 'Unknown error'
    });
  }

  // 4. Check for recent errors in analytics
  const analyticsStart = Date.now();
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentErrors, count } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'error')
      .gte('created_at', oneHourAgo);
    
    const analyticsLatency = Date.now() - analyticsStart;
    const errorCount = count || 0;
    
    checks.push({
      name: 'error_rate',
      status: errorCount > 50 ? 'degraded' : (errorCount > 100 ? 'down' : 'healthy'),
      latencyMs: analyticsLatency,
      details: `${errorCount} errors in last hour`
    });
  } catch (e) {
    checks.push({
      name: 'error_rate',
      status: 'healthy',
      latencyMs: Date.now() - analyticsStart,
      details: 'Unable to check'
    });
  }

  // Calculate overall status
  const hasDown = checks.some(c => c.status === 'down');
  const hasDegraded = checks.some(c => c.status === 'degraded');
  const overallStatus = hasDown ? 'down' : (hasDegraded ? 'degraded' : 'healthy');

  // Log any issues as agent reports
  for (const check of checks) {
    if (check.status !== 'healthy') {
      await supabase.from('agent_reports').insert({
        agent_name: 'Health Monitor',
        agent_category: 'operations',
        report_type: 'finding',
        severity: check.status === 'down' ? 'critical' : 'warning',
        title: `${check.name} is ${check.status}`,
        description: check.details,
        details: { latencyMs: check.latencyMs, check }
      });
    }
  }

  console.log(`Health Monitor: Complete. Status: ${overallStatus}`);

  return jsonResponse({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    checks
  });
});