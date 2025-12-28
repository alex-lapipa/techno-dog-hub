import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SecurityFinding {
  category: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  recommendation: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Security Auditor: Starting security scan...");

  const findings: SecurityFinding[] = [];

  // 1. Check for admin users
  try {
    const { data: admins, count } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact' })
      .eq('role', 'admin');
    
    if (count && count > 10) {
      findings.push({
        category: 'access_control',
        severity: 'warning',
        title: 'High number of admin users',
        description: `There are ${count} admin users in the system`,
        recommendation: 'Review admin list and remove unnecessary admin privileges'
      });
    }
    
    console.log(`Found ${count || 0} admin users`);
  } catch (e) {
    console.error("Admin check failed:", e);
  }

  // 2. Check for suspicious API usage patterns
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentUsage } = await supabase
      .from('api_usage')
      .select('api_key_id, request_count')
      .gte('created_at', oneHourAgo);
    
    if (recentUsage) {
      const keyUsage: Record<string, number> = {};
      for (const usage of recentUsage) {
        keyUsage[usage.api_key_id] = (keyUsage[usage.api_key_id] || 0) + usage.request_count;
      }
      
      const highUsageKeys = Object.entries(keyUsage).filter(([_, count]) => count > 500);
      
      if (highUsageKeys.length > 0) {
        findings.push({
          category: 'api_security',
          severity: 'info',
          title: 'High API usage detected',
          description: `${highUsageKeys.length} API keys with 500+ requests in last hour`,
          recommendation: 'Review usage patterns for potential abuse'
        });
      }
    }
  } catch (e) {
    console.error("API usage check failed:", e);
  }

  // 3. Check for rate limit violations
  try {
    const { count } = await supabase
      .from('ip_rate_limits')
      .select('*', { count: 'exact', head: true })
      .gte('request_count', 50);
    
    if (count && count > 20) {
      findings.push({
        category: 'rate_limiting',
        severity: 'warning',
        title: 'Multiple IPs hitting rate limits',
        description: `${count} IPs have hit rate limit thresholds`,
        recommendation: 'Consider adjusting rate limits or investigating traffic sources'
      });
    }
  } catch (e) {
    console.error("Rate limit check failed:", e);
  }

  // 4. Check for revoked/inactive API keys still being used
  try {
    const { data: inactiveKeys } = await supabase
      .from('api_keys')
      .select('id, prefix, last_used_at')
      .eq('status', 'revoked');
    
    if (inactiveKeys && inactiveKeys.length > 0) {
      const recentlyUsed = inactiveKeys.filter(k => {
        if (!k.last_used_at) return false;
        const lastUsed = new Date(k.last_used_at);
        return Date.now() - lastUsed.getTime() < 24 * 60 * 60 * 1000;
      });
      
      if (recentlyUsed.length > 0) {
        findings.push({
          category: 'api_security',
          severity: 'critical',
          title: 'Revoked API keys used recently',
          description: `${recentlyUsed.length} revoked keys were used in the last 24 hours`,
          recommendation: 'Investigate potential security breach'
        });
      }
    }
  } catch (e) {
    console.error("Revoked key check failed:", e);
  }

  // 5. Check for unverified community members with high trust scores
  try {
    const { count } = await supabase
      .from('community_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .gte('trust_score', 50);
    
    if (count && count > 0) {
      findings.push({
        category: 'community',
        severity: 'info',
        title: 'Unverified members with high trust',
        description: `${count} pending members have elevated trust scores`,
        recommendation: 'Review and verify these community members'
      });
    }
  } catch (e) {
    console.error("Community check failed:", e);
  }

  // 6. Check for webhooks with high failure rates
  try {
    const { data: webhooks } = await supabase
      .from('webhooks')
      .select('id, name, failure_count, status')
      .gte('failure_count', 5);
    
    if (webhooks && webhooks.length > 0) {
      findings.push({
        category: 'integrations',
        severity: 'warning',
        title: 'Webhooks with high failure rates',
        description: `${webhooks.length} webhooks have 5+ failures`,
        recommendation: 'Review and fix or disable failing webhooks'
      });
    }
  } catch (e) {
    console.error("Webhook check failed:", e);
  }

  // Log findings as agent reports
  for (const finding of findings) {
    await supabase.from('agent_reports').insert({
      agent_name: 'Security Auditor',
      agent_category: 'security',
      report_type: 'finding',
      severity: finding.severity,
      title: finding.title,
      description: finding.description,
      details: { ...finding }
    });
  }

  console.log(`Security Auditor: Complete. Found ${findings.length} security findings.`);

  return new Response(JSON.stringify({
    success: true,
    timestamp: new Date().toISOString(),
    findingsCount: findings.length,
    findings
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});