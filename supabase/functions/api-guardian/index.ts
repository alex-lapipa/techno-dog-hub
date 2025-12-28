import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EndpointHealth {
  name: string;
  endpoint: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime?: number;
  error?: string;
  lastChecked: string;
}

interface ApiKeyStats {
  totalKeys: number;
  activeKeys: number;
  revokedKeys: number;
  keysWithNoUsage: number;
  totalRequests: number;
  avgRequestsPerKey: number;
}

interface RateLimitStats {
  totalLimitedRequests: number;
  usersNearLimit: number;
  highUsageKeys: { prefix: string; usage: number; limit: number }[];
}

interface Finding {
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: string;
  title: string;
  description: string;
  details?: Record<string, unknown>;
}

// Check endpoint health by making a test request
async function checkEndpointHealth(
  supabaseUrl: string,
  endpoint: string,
  name: string
): Promise<EndpointHealth> {
  const url = `${supabaseUrl}/functions/v1/${endpoint}`;
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      method: 'OPTIONS',
      headers: { 'Content-Type': 'application/json' },
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.ok || response.status === 204) {
      return {
        name,
        endpoint,
        status: responseTime < 1000 ? 'healthy' : 'degraded',
        responseTime,
        lastChecked: new Date().toISOString(),
      };
    }
    
    return {
      name,
      endpoint,
      status: 'degraded',
      responseTime,
      error: `HTTP ${response.status}`,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      name,
      endpoint,
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
      lastChecked: new Date().toISOString(),
    };
  }
}

// AI-powered analysis using Lovable AI
async function analyzeWithAI(
  context: string,
  lovableApiKey: string
): Promise<string> {
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are the API Guardian, an AI agent monitoring the techno.dog Developer API. 
Your role is to analyze API health, usage patterns, and security concerns.
Provide concise, actionable insights. Focus on:
1. Security vulnerabilities or anomalies
2. Performance issues
3. Usage patterns that indicate problems
4. Recommendations for improvement
Keep responses under 200 words. Use technical but clear language.`
          },
          {
            role: 'user',
            content: context
          }
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI analysis failed:', response.status, errorText);
      return 'AI analysis unavailable - manual review recommended.';
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No analysis generated.';
  } catch (error) {
    console.error('AI analysis error:', error);
    return 'AI analysis failed - check logs for details.';
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log('🛡️ API Guardian Agent starting comprehensive audit...');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const findings: Finding[] = [];
    const endpointHealth: EndpointHealth[] = [];

    // ============================================
    // 1. CHECK ALL API ENDPOINT HEALTH
    // ============================================
    console.log('📡 Checking API endpoint health...');
    
    const endpoints = [
      { name: 'API Ping', endpoint: 'api-v1-ping' },
      { name: 'API Search', endpoint: 'api-v1-search' },
      { name: 'API Docs', endpoint: 'api-v1-docs' },
      { name: 'API Chunks', endpoint: 'api-v1-chunks' },
      { name: 'API Keys', endpoint: 'api-keys' },
      { name: 'Webhook Dispatch', endpoint: 'webhook-dispatch' },
    ];

    for (const ep of endpoints) {
      const health = await checkEndpointHealth(supabaseUrl, ep.endpoint, ep.name);
      endpointHealth.push(health);
      
      if (health.status === 'down') {
        findings.push({
          severity: 'critical',
          category: 'endpoint_health',
          title: `${ep.name} endpoint is DOWN`,
          description: `The ${ep.endpoint} endpoint is not responding. Error: ${health.error}`,
          details: { ...health },
        });
      } else if (health.status === 'degraded') {
        findings.push({
          severity: 'warning',
          category: 'endpoint_health',
          title: `${ep.name} endpoint is degraded`,
          description: `Response time: ${health.responseTime}ms (threshold: 1000ms)`,
          details: { ...health },
        });
      }
    }

    const healthyEndpoints = endpointHealth.filter(e => e.status === 'healthy').length;
    console.log(`✓ Endpoint health: ${healthyEndpoints}/${endpoints.length} healthy`);

    // ============================================
    // 2. ANALYZE API KEY STATISTICS
    // ============================================
    console.log('🔑 Analyzing API key statistics...');

    const { data: allKeys, error: keysError } = await supabase
      .from('api_keys')
      .select('id, prefix, status, total_requests, rate_limit_per_day, last_used_at, created_at, user_id');

    if (keysError) {
      console.error('Failed to fetch API keys:', keysError);
      findings.push({
        severity: 'error',
        category: 'database',
        title: 'Failed to query API keys',
        description: keysError.message,
      });
    }

    const keys = allKeys || [];
    const activeKeys = keys.filter(k => k.status === 'active');
    const revokedKeys = keys.filter(k => k.status === 'revoked');
    const keysWithNoUsage = activeKeys.filter(k => !k.last_used_at || k.total_requests === 0);
    const totalRequests = keys.reduce((sum, k) => sum + (k.total_requests || 0), 0);

    const apiKeyStats: ApiKeyStats = {
      totalKeys: keys.length,
      activeKeys: activeKeys.length,
      revokedKeys: revokedKeys.length,
      keysWithNoUsage: keysWithNoUsage.length,
      totalRequests,
      avgRequestsPerKey: activeKeys.length > 0 ? Math.round(totalRequests / activeKeys.length) : 0,
    };

    console.log(`✓ API Keys: ${activeKeys.length} active, ${revokedKeys.length} revoked, ${totalRequests} total requests`);

    // Check for issues
    if (activeKeys.length === 0) {
      findings.push({
        severity: 'info',
        category: 'api_keys',
        title: 'No active API keys',
        description: 'There are currently no active API keys issued. This may indicate the developer program needs promotion.',
      });
    }

    // Check for stale keys (active but no usage in 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const staleKeys = activeKeys.filter(k => {
      if (!k.last_used_at) return true;
      return new Date(k.last_used_at) < thirtyDaysAgo;
    });

    if (staleKeys.length > 0) {
      findings.push({
        severity: 'info',
        category: 'api_keys',
        title: `${staleKeys.length} stale API keys detected`,
        description: 'These keys are active but have not been used in 30+ days.',
        details: { staleKeyPrefixes: staleKeys.map(k => k.prefix) },
      });
    }

    // ============================================
    // 3. CHECK RATE LIMITING & USAGE PATTERNS
    // ============================================
    console.log('📊 Analyzing rate limiting and usage...');

    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const { data: recentUsage, error: usageError } = await supabase
      .from('api_usage')
      .select('api_key_id, endpoint, request_count, window_start')
      .gte('window_start', oneHourAgo.toISOString());

    if (usageError) {
      console.error('Failed to fetch API usage:', usageError);
    }

    // Aggregate usage by key
    const usageByKey = new Map<string, number>();
    (recentUsage || []).forEach(u => {
      const current = usageByKey.get(u.api_key_id) || 0;
      usageByKey.set(u.api_key_id, current + u.request_count);
    });

    // Find high usage keys
    const highUsageKeys: { prefix: string; usage: number; limit: number }[] = [];
    for (const key of activeKeys) {
      const usage = usageByKey.get(key.id) || 0;
      const hourlyLimit = (key.rate_limit_per_day || 10000) / 24;
      
      if (usage > hourlyLimit * 0.8) {
        highUsageKeys.push({
          prefix: key.prefix,
          usage,
          limit: Math.round(hourlyLimit),
        });
      }
    }

    if (highUsageKeys.length > 0) {
      findings.push({
        severity: 'warning',
        category: 'rate_limiting',
        title: `${highUsageKeys.length} keys approaching rate limits`,
        description: 'These API keys are at 80%+ of their hourly quota.',
        details: { highUsageKeys },
      });
    }

    // ============================================
    // 4. CHECK WEBHOOK HEALTH
    // ============================================
    console.log('🔗 Checking webhook health...');

    const { data: webhooks, error: webhooksError } = await supabase
      .from('webhooks')
      .select('id, name, url, status, failure_count, last_error, last_success_at, last_failure_at');

    if (!webhooksError && webhooks) {
      const failingWebhooks = webhooks.filter(w => w.failure_count >= 3);
      const pausedWebhooks = webhooks.filter(w => w.status === 'paused');

      if (failingWebhooks.length > 0) {
        findings.push({
          severity: 'error',
          category: 'webhooks',
          title: `${failingWebhooks.length} webhooks failing`,
          description: 'These webhooks have failed 3+ times consecutively.',
          details: { 
            webhooks: failingWebhooks.map(w => ({
              name: w.name,
              failures: w.failure_count,
              lastError: w.last_error,
            }))
          },
        });
      }

      if (pausedWebhooks.length > 0) {
        findings.push({
          severity: 'warning',
          category: 'webhooks',
          title: `${pausedWebhooks.length} webhooks paused`,
          description: 'These webhooks are currently paused and not receiving events.',
          details: { webhookNames: pausedWebhooks.map(w => w.name) },
        });
      }

      console.log(`✓ Webhooks: ${webhooks.length} total, ${failingWebhooks.length} failing`);
    }

    // ============================================
    // 5. CHECK DOCUMENTS/RAG CONTENT HEALTH
    // ============================================
    console.log('📚 Checking RAG content health...');

    const { count: docCount } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true });

    const { count: docWithEmbeddings } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .not('embedding', 'is', null);

    if (docCount !== null && docWithEmbeddings !== null) {
      const missingEmbeddings = docCount - docWithEmbeddings;
      
      if (missingEmbeddings > 0) {
        findings.push({
          severity: 'warning',
          category: 'rag_content',
          title: `${missingEmbeddings} documents missing embeddings`,
          description: 'These documents cannot be found via semantic search.',
          details: { totalDocs: docCount, withEmbeddings: docWithEmbeddings },
        });
      }

      if (docCount < 10) {
        findings.push({
          severity: 'info',
          category: 'rag_content',
          title: 'Limited RAG content',
          description: `Only ${docCount} documents available for API search. Consider adding more content.`,
        });
      }

      console.log(`✓ Documents: ${docCount} total, ${docWithEmbeddings} with embeddings`);
    }

    // ============================================
    // 6. SECURITY CHECKS
    // ============================================
    console.log('🔒 Running security checks...');

    // Check for suspicious patterns in recent requests
    const { data: recentLogs } = await supabase
      .from('ip_rate_limits')
      .select('ip_address, endpoint, request_count, window_start')
      .gte('window_start', oneHourAgo.toISOString())
      .order('request_count', { ascending: false })
      .limit(20);

    if (recentLogs) {
      const suspiciousIPs = recentLogs.filter(l => l.request_count > 100);
      
      if (suspiciousIPs.length > 0) {
        findings.push({
          severity: 'warning',
          category: 'security',
          title: `${suspiciousIPs.length} IPs with high request volume`,
          description: 'These IPs have made 100+ requests in the last hour.',
          details: { 
            ips: suspiciousIPs.map(l => ({
              ip: l.ip_address.substring(0, 8) + '...',
              requests: l.request_count,
            }))
          },
        });
      }
    }

    // ============================================
    // 7. AI-POWERED ANALYSIS (if API key available)
    // ============================================
    let aiAnalysis = '';
    if (lovableApiKey) {
      console.log('🤖 Running AI-powered analysis...');
      
      const analysisContext = `
API Guardian Audit Report - ${new Date().toISOString()}

ENDPOINT HEALTH:
${endpointHealth.map(e => `- ${e.name}: ${e.status} (${e.responseTime || 'N/A'}ms)`).join('\n')}

API KEY STATISTICS:
- Total Keys: ${apiKeyStats.totalKeys}
- Active Keys: ${apiKeyStats.activeKeys}
- Revoked Keys: ${apiKeyStats.revokedKeys}
- Keys with no usage: ${apiKeyStats.keysWithNoUsage}
- Total API Requests: ${apiKeyStats.totalRequests}

FINDINGS (${findings.length} total):
${findings.map(f => `[${f.severity.toUpperCase()}] ${f.title}: ${f.description}`).join('\n')}

Please analyze this data and provide:
1. Overall API health assessment
2. Top 3 priority issues to address
3. Any patterns or concerns not explicitly listed
`;

      aiAnalysis = await analyzeWithAI(analysisContext, lovableApiKey);
      console.log('✓ AI analysis complete');
    }

    // ============================================
    // 8. STORE FINDINGS AS AGENT REPORTS
    // ============================================
    console.log('💾 Storing findings...');

    // Create a summary report
    const summaryReport = {
      agent_name: 'API Guardian',
      agent_category: 'operations',
      report_type: 'api_audit',
      severity: findings.some(f => f.severity === 'critical') ? 'critical' :
                findings.some(f => f.severity === 'error') ? 'error' :
                findings.some(f => f.severity === 'warning') ? 'warning' : 'info',
      title: `API Audit: ${findings.length} findings, ${healthyEndpoints}/${endpoints.length} endpoints healthy`,
      description: aiAnalysis || `Comprehensive API audit completed. Found ${findings.filter(f => f.severity === 'error' || f.severity === 'critical').length} critical/error issues.`,
      details: {
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - startTime,
        endpointHealth,
        apiKeyStats,
        findingsSummary: {
          critical: findings.filter(f => f.severity === 'critical').length,
          error: findings.filter(f => f.severity === 'error').length,
          warning: findings.filter(f => f.severity === 'warning').length,
          info: findings.filter(f => f.severity === 'info').length,
        },
        findings,
        aiAnalysis: aiAnalysis || null,
      },
    };

    const { error: insertError } = await supabase
      .from('agent_reports')
      .insert(summaryReport);

    if (insertError) {
      console.error('Failed to store report:', insertError);
    }

    // Store individual critical/error findings
    for (const finding of findings.filter(f => f.severity === 'critical' || f.severity === 'error')) {
      await supabase.from('agent_reports').insert({
        agent_name: 'API Guardian',
        agent_category: 'operations',
        report_type: finding.category,
        severity: finding.severity,
        title: finding.title,
        description: finding.description,
        details: finding.details,
      });
    }

    const duration = Date.now() - startTime;
    console.log(`🛡️ API Guardian audit complete in ${duration}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        durationMs: duration,
        summary: {
          endpointsChecked: endpoints.length,
          healthyEndpoints,
          apiKeys: apiKeyStats,
          findingsCount: {
            total: findings.length,
            critical: findings.filter(f => f.severity === 'critical').length,
            error: findings.filter(f => f.severity === 'error').length,
            warning: findings.filter(f => f.severity === 'warning').length,
            info: findings.filter(f => f.severity === 'info').length,
          },
        },
        endpointHealth,
        findings,
        aiAnalysis: aiAnalysis || null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('🛡️ API Guardian error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
