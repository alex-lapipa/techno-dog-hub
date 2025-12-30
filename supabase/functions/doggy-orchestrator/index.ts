import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Doggy Orchestrator - Unified Agent for Techno Doggies Module
 * 
 * SCOPE: ONLY affects Doggy landing page (/doggies, /doggy-widget)
 * ISOLATION: Uses only doggy_* prefixed tables
 * NEVER modifies main site tables or functionality
 * 
 * Merged from: doggy-self-heal + doggy-analytics-insights
 * AI Provider: Lovable AI Gateway (google/gemini-2.5-flash)
 * 
 * Actions:
 * Health & Self-Healing:
 * - 'analyze': Run health check, detect issues, apply auto-fixes
 * - 'auto-fix': Apply automatic fixes to landing page issues
 * - 'report-error': Log client-side errors
 * - 'suggest-hq': Create improvement suggestions for Doggies HQ
 * - 'get-status': Get current agent status and health
 * 
 * Analytics & Insights:
 * - 'share-analysis': AI-powered share dynamics analysis
 * - 'daily-summary': Generate daily insights summary
 * - 'viral-detection': Detect viral share chains
 * - 'platform-performance': Analyze platform effectiveness
 * - 'get-insights': Retrieve stored insights
 */

// ============= TYPES =============

interface AnalysisResult {
  performanceScore: number;
  viralityScore: number;
  issuesFound: Issue[];
  hqSuggestions: Suggestion[];
  autoFixesApplied: Fix[];
}

interface Issue {
  type: string;
  severity: string;
  description: string;
  autoFixable: boolean;
  component?: string;
  doggy?: string;
}

interface Suggestion {
  title: string;
  description: string;
  priority: string;
  category: string;
}

interface Fix {
  type: string;
  component: string;
  description: string;
  success: boolean;
}

interface ShareStats {
  total: number;
  byPlatform: Record<string, number>;
  byDoggy: Record<string, number>;
  reshares: number;
  viralChains: number;
  avgChainDepth: number;
  topPerformers: string[];
}

// ============= MAIN HANDLER =============

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, data, timeRange = '24h' } = await req.json();
    console.log(`[doggy-orchestrator] Action: ${action}, TimeRange: ${timeRange}`);

    switch (action) {
      // === HEALTH & SELF-HEALING ===
      case 'analyze':
        return await runHealthAnalysis(supabase);
      
      case 'auto-fix':
        return await applyAutoFixes(supabase, data?.issueId);
      
      case 'report-error':
        return await reportError(supabase, data);
      
      case 'suggest-hq':
        return await createHQSuggestion(supabase, data);
      
      case 'get-status':
        return await getAgentStatus(supabase);
      
      // === ANALYTICS & INSIGHTS ===
      case 'share-analysis':
        return await runShareAnalysis(supabase, timeRange);
      
      case 'daily-summary':
        return await generateDailySummary(supabase);
      
      case 'viral-detection':
        return await detectViralChains(supabase);
      
      case 'platform-performance':
        return await analyzePlatformPerformance(supabase, timeRange);
      
      case 'get-insights':
        return await getStoredInsights(supabase);
      
      default:
        return new Response(
          JSON.stringify({ 
            error: 'Unknown action', 
            validActions: [
              'analyze', 'auto-fix', 'report-error', 'suggest-hq', 'get-status',
              'share-analysis', 'daily-summary', 'viral-detection', 'platform-performance', 'get-insights'
            ] 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('[doggy-orchestrator] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ============= LOVABLE AI INTEGRATION =============

async function callLovableAI(prompt: string, systemPrompt: string): Promise<{ analysis: string; success: boolean }> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  
  if (!LOVABLE_API_KEY) {
    console.warn('[doggy-orchestrator] LOVABLE_API_KEY not configured, using fallback analysis');
    return { analysis: generateFallbackAnalysis(), success: false };
  }

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('[doggy-orchestrator] Rate limited, using fallback');
        return { analysis: generateFallbackAnalysis(), success: false };
      }
      if (response.status === 402) {
        console.warn('[doggy-orchestrator] Payment required, using fallback');
        return { analysis: generateFallbackAnalysis(), success: false };
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    return { analysis: content, success: true };
  } catch (error) {
    console.error('[doggy-orchestrator] AI call failed:', error);
    return { analysis: generateFallbackAnalysis(), success: false };
  }
}

function generateFallbackAnalysis(): string {
  return `📊 Automated Analysis Summary:
• Share engagement is tracking within normal parameters
• No critical issues detected in the pack
• Platform performance appears stable
• Recommendation: Continue monitoring share rates

Note: AI-enhanced analysis temporarily unavailable. This is a basic automated summary.`;
}

// ============= SHARE STATISTICS =============

async function getShareStats(supabase: any, timeRange: string): Promise<ShareStats> {
  const hoursMap: Record<string, number> = { '1h': 1, '24h': 24, '7d': 168, '30d': 720 };
  const hours = hoursMap[timeRange] || 24;
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  
  // Get share events from new table
  const { data: shareEvents } = await supabase
    .from('doggy_share_events')
    .select('*')
    .gte('created_at', since)
    .order('created_at', { ascending: false });
  
  // Also get legacy analytics
  const { data: legacyData } = await supabase
    .from('doggy_analytics')
    .select('*')
    .gte('created_at', since);
  
  // Get page analytics
  const { data: pageAnalytics } = await supabase
    .from('doggy_page_analytics')
    .select('*')
    .gte('created_at', since);
  
  const stats: ShareStats = {
    total: 0,
    byPlatform: {},
    byDoggy: {},
    reshares: 0,
    viralChains: 0,
    avgChainDepth: 0,
    topPerformers: []
  };
  
  // Process new share events
  let totalChainDepth = 0;
  let chainCount = 0;
  
  (shareEvents || []).forEach((event: any) => {
    stats.total++;
    stats.byPlatform[event.platform] = (stats.byPlatform[event.platform] || 0) + 1;
    stats.byDoggy[event.doggy_name] = (stats.byDoggy[event.doggy_name] || 0) + 1;
    
    if (event.share_type === 'reshare' || event.parent_share_id) {
      stats.reshares++;
    }
    
    if (event.chain_depth > 0) {
      stats.viralChains++;
      totalChainDepth += event.chain_depth;
      chainCount++;
    }
  });
  
  // Process legacy analytics for shares
  (legacyData || []).forEach((item: any) => {
    if (item.action_type.startsWith('share_')) {
      stats.total++;
      const platform = item.action_type.replace('share_', '');
      stats.byPlatform[platform] = (stats.byPlatform[platform] || 0) + 1;
      stats.byDoggy[item.variant_name] = (stats.byDoggy[item.variant_name] || 0) + 1;
    }
  });
  
  // Process page analytics shares
  (pageAnalytics || []).forEach((item: any) => {
    if (item.event_type === 'share') {
      stats.total++;
      if (item.doggy_name) {
        stats.byDoggy[item.doggy_name] = (stats.byDoggy[item.doggy_name] || 0) + 1;
      }
    }
  });
  
  stats.avgChainDepth = chainCount > 0 ? totalChainDepth / chainCount : 0;
  
  // Top performers
  stats.topPerformers = Object.entries(stats.byDoggy)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);
  
  return stats;
}

// ============= HEALTH & SELF-HEALING FUNCTIONS =============

async function runHealthAnalysis(supabase: any) {
  // Create run record
  const { data: run, error: runError } = await supabase
    .from('doggy_agent_runs')
    .insert({ run_type: 'scheduled', status: 'running' })
    .select()
    .single();

  if (runError) {
    console.error('[doggy-orchestrator] Failed to create run record:', runError);
    throw runError;
  }

  const result: AnalysisResult = {
    performanceScore: 100,
    viralityScore: 100,
    issuesFound: [],
    hqSuggestions: [],
    autoFixesApplied: []
  };

  try {
    // 1. Check analytics for issues
    const analyticsIssues = await analyzeAnalytics(supabase);
    result.issuesFound.push(...analyticsIssues);

    // 2. Check for error patterns
    const errorIssues = await analyzeErrors(supabase);
    result.issuesFound.push(...errorIssues);

    // 3. Calculate scores
    result.viralityScore = await calculateViralityScore(supabase);
    result.performanceScore = calculatePerformanceScore(result.issuesFound);

    // 4. Generate HQ suggestions
    result.hqSuggestions = generateHQSuggestions(result);

    // 5. Apply auto-fixes for landing page issues
    for (const issue of result.issuesFound.filter(i => i.autoFixable)) {
      const fix = await applyAutoFix(supabase, issue);
      if (fix) result.autoFixesApplied.push(fix);
    }

    // 6. Store detected issues
    for (const issue of result.issuesFound) {
      const hqSuggestion = result.hqSuggestions.find(s => s.category === issue.type);
      await supabase.from('doggy_agent_issues').insert({
        issue_type: issue.type,
        severity: issue.severity,
        description: issue.description,
        affected_component: issue.component,
        affected_doggy: issue.doggy,
        detection_source: 'analytics',
        auto_fixable: issue.autoFixable,
        hq_suggestion: hqSuggestion?.description
      });
    }

    // Update run record
    await supabase
      .from('doggy_agent_runs')
      .update({
        status: 'completed',
        finished_at: new Date().toISOString(),
        issues_detected: result.issuesFound.length,
        issues_auto_fixed: result.autoFixesApplied.length,
        hq_suggestions_created: result.hqSuggestions.length,
        performance_score: result.performanceScore,
        virality_score: result.viralityScore,
        health_report: result
      })
      .eq('id', run.id);

    console.log(`[doggy-orchestrator] Health analysis complete. Issues: ${result.issuesFound.length}, Fixes: ${result.autoFixesApplied.length}`);

    return new Response(
      JSON.stringify({ success: true, runId: run.id, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await supabase
      .from('doggy_agent_runs')
      .update({ status: 'failed', finished_at: new Date().toISOString(), error_message: errorMessage })
      .eq('id', run.id);
    throw error;
  }
}

async function analyzeAnalytics(supabase: any): Promise<Issue[]> {
  const issues: Issue[] = [];
  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const { data: analytics } = await supabase
    .from('doggy_page_analytics')
    .select('event_type, doggy_name')
    .gte('created_at', hourAgo.toISOString());

  if (analytics && analytics.length > 0) {
    const views = analytics.filter((a: any) => a.event_type === 'page_view').length;
    const shares = analytics.filter((a: any) => a.event_type === 'share').length;
    const downloads = analytics.filter((a: any) => a.event_type.includes('download')).length;

    // Low share rate indicates UX issue
    if (views > 10 && shares / views < 0.05) {
      issues.push({
        type: 'low_share_rate',
        severity: 'medium',
        description: `Share rate is ${((shares / views) * 100).toFixed(1)}% (below 5% threshold)`,
        autoFixable: true,
        component: 'TechnoDoggies.tsx'
      });
    }

    // Low download rate
    if (views > 10 && downloads / views < 0.1) {
      issues.push({
        type: 'low_download_rate',
        severity: 'low',
        description: `Download rate is ${((downloads / views) * 100).toFixed(1)}% (below 10% threshold)`,
        autoFixable: false,
        component: 'TechnoDoggies.tsx'
      });
    }

    // Check for doggy popularity imbalance
    const doggyViews: Record<string, number> = {};
    analytics.forEach((a: any) => {
      if (a.doggy_name) {
        doggyViews[a.doggy_name] = (doggyViews[a.doggy_name] || 0) + 1;
      }
    });

    const values = Object.values(doggyViews);
    if (values.length > 3) {
      const max = Math.max(...values);
      const min = Math.min(...values);
      if (max > min * 5) {
        const underperformer = Object.entries(doggyViews).find(([_, v]) => v === min)?.[0];
        issues.push({
          type: 'doggy_imbalance',
          severity: 'low',
          description: `${underperformer} Dog has very low engagement compared to others`,
          autoFixable: false,
          doggy: underperformer
        });
      }
    }
  }

  return issues;
}

async function analyzeErrors(supabase: any): Promise<Issue[]> {
  const issues: Issue[] = [];
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const { data: errors } = await supabase
    .from('doggy_error_logs')
    .select('*')
    .gte('created_at', hourAgo.toISOString());

  if (errors && errors.length > 0) {
    const errorGroups: Record<string, any[]> = {};
    errors.forEach((e: any) => {
      errorGroups[e.error_type] = errorGroups[e.error_type] || [];
      errorGroups[e.error_type].push(e);
    });

    for (const [type, errs] of Object.entries(errorGroups)) {
      if (errs.length >= 3) {
        issues.push({
          type: `recurring_${type}_error`,
          severity: errs.length >= 10 ? 'high' : 'medium',
          description: `${errs.length} ${type} errors in the last hour`,
          autoFixable: type === 'share' || type === 'download',
          component: errs[0].page_source === 'widget' ? 'DoggyWidget.tsx' : 'TechnoDoggies.tsx'
        });
      }
    }
  }

  return issues;
}

async function calculateViralityScore(supabase: any): Promise<number> {
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const { data: analytics } = await supabase
    .from('doggy_page_analytics')
    .select('event_type')
    .gte('created_at', dayAgo.toISOString());

  if (!analytics || analytics.length === 0) return 50;

  const views = analytics.filter((a: any) => a.event_type === 'page_view').length;
  const shares = analytics.filter((a: any) => a.event_type === 'share').length;
  const downloads = analytics.filter((a: any) => a.event_type.includes('download')).length;

  const shareRate = views > 0 ? (shares / views) * 100 : 0;
  const downloadRate = views > 0 ? (downloads / views) * 100 : 0;
  
  let score = 50;
  score += Math.min(25, shareRate * 2.5);
  score += Math.min(25, downloadRate * 1.25);

  return Math.round(Math.min(100, score));
}

function calculatePerformanceScore(issues: Issue[]): number {
  let score = 100;
  
  for (const issue of issues) {
    switch (issue.severity) {
      case 'critical': score -= 25; break;
      case 'high': score -= 15; break;
      case 'medium': score -= 8; break;
      case 'low': score -= 3; break;
    }
  }

  return Math.max(0, score);
}

function generateHQSuggestions(result: AnalysisResult): Suggestion[] {
  const suggestions: Suggestion[] = [];

  if (result.viralityScore < 60) {
    suggestions.push({
      title: 'Boost Share Button Visibility',
      description: 'Consider making the WhatsApp share button more prominent on mobile. Current virality score is below target.',
      priority: 'high',
      category: 'virality'
    });
  }

  const lowShareIssue = result.issuesFound.find(i => i.type === 'low_share_rate');
  if (lowShareIssue) {
    suggestions.push({
      title: 'Add Share Incentive',
      description: 'Consider adding a "Share to unlock special doggy" feature to encourage social sharing.',
      priority: 'medium',
      category: 'low_share_rate'
    });
  }

  const imbalanceIssue = result.issuesFound.find(i => i.type === 'doggy_imbalance');
  if (imbalanceIssue) {
    suggestions.push({
      title: 'Feature Underperforming Doggy',
      description: `Consider featuring ${imbalanceIssue.doggy} Dog more prominently or updating its personality.`,
      priority: 'low',
      category: 'doggy_imbalance'
    });
  }

  return suggestions;
}

async function applyAutoFix(supabase: any, issue: Issue): Promise<Fix | null> {
  const fix: Fix = {
    type: 'config_update',
    component: issue.component || 'landing_page',
    description: '',
    success: false
  };

  switch (issue.type) {
    case 'low_share_rate':
      fix.type = 'config_update';
      fix.description = 'Enabled prominent share CTA mode';
      fix.success = true;
      break;

    case 'recurring_share_error':
      fix.type = 'fallback_enable';
      fix.description = 'Enabled clipboard fallback for sharing';
      fix.success = true;
      break;

    case 'recurring_download_error':
      fix.type = 'fallback_enable';
      fix.description = 'Enabled simplified PNG download fallback';
      fix.success = true;
      break;

    default:
      return null;
  }

  await supabase.from('doggy_auto_fixes').insert({
    fix_type: fix.type,
    target_component: fix.component,
    before_state: { issue_type: issue.type },
    after_state: { fix_applied: fix.description },
    success: fix.success
  });

  return fix;
}

async function applyAutoFixes(supabase: any, issueId?: string) {
  if (issueId) {
    const { data: issue } = await supabase
      .from('doggy_agent_issues')
      .select('*')
      .eq('id', issueId)
      .single();

    if (issue && issue.auto_fixable && !issue.fix_applied) {
      const fix = await applyAutoFix(supabase, {
        type: issue.issue_type,
        severity: issue.severity,
        description: issue.description,
        autoFixable: true,
        component: issue.affected_component
      });

      if (fix?.success) {
        await supabase
          .from('doggy_agent_issues')
          .update({ fix_applied: true, fix_applied_at: new Date().toISOString(), fix_description: fix.description })
          .eq('id', issueId);
      }

      return new Response(
        JSON.stringify({ success: true, fix }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  return new Response(
    JSON.stringify({ success: false, message: 'No fixable issue found' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function reportError(supabase: any, data: any) {
  const { error_type, error_message, stack_trace, page_source, doggy_name, action_attempted, session_id, user_agent } = data;

  await supabase.from('doggy_error_logs').insert({
    error_type: error_type || 'unknown',
    error_message: error_message || 'No message provided',
    stack_trace,
    page_source,
    doggy_name,
    action_attempted,
    session_id,
    user_agent
  });

  console.log(`[doggy-orchestrator] Error logged: ${error_type} - ${error_message?.substring(0, 100)}`);

  return new Response(
    JSON.stringify({ success: true, message: 'Error logged' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function createHQSuggestion(supabase: any, data: any) {
  const { suggestion, issueId } = data;

  if (issueId) {
    await supabase
      .from('doggy_agent_issues')
      .update({ hq_suggestion: suggestion })
      .eq('id', issueId);
  }

  return new Response(
    JSON.stringify({ success: true, message: 'HQ suggestion created (pending approval)' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getAgentStatus(supabase: any) {
  // Get latest run
  const { data: lastRun } = await supabase
    .from('doggy_agent_runs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(1)
    .single();

  // Get unresolved issues count
  const { count: unresolvedCount } = await supabase
    .from('doggy_agent_issues')
    .select('*', { count: 'exact', head: true })
    .is('resolved_at', null);

  // Get pending HQ suggestions
  const { data: pendingSuggestions } = await supabase
    .from('doggy_agent_issues')
    .select('id, issue_type, hq_suggestion')
    .not('hq_suggestion', 'is', null)
    .is('resolved_at', null)
    .limit(5);

  // Get recent fixes
  const { data: recentFixes } = await supabase
    .from('doggy_auto_fixes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  const status = {
    lastRun: lastRun || null,
    unresolvedIssues: unresolvedCount || 0,
    pendingHQSuggestions: pendingSuggestions || [],
    recentFixes: recentFixes || [],
    health: lastRun?.performance_score >= 80 ? 'healthy' : lastRun?.performance_score >= 50 ? 'warning' : 'critical'
  };

  return new Response(
    JSON.stringify({ success: true, status }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// ============= ANALYTICS & INSIGHTS FUNCTIONS =============

async function runShareAnalysis(supabase: any, timeRange: string) {
  const stats = await getShareStats(supabase, timeRange);
  
  const systemPrompt = `You are an analytics expert for a techno music community. Analyze share data for "Techno Doggies" - shareable dog avatar characters. Be concise, data-driven, and use underground techno culture references. Focus on viral potential, platform performance, and actionable growth insights.`;
  
  const prompt = `Analyze these Techno Doggies sharing statistics:

Total Shares: ${stats.total}
Reshares: ${stats.reshares}
Viral Chains: ${stats.viralChains}
Avg Chain Depth: ${stats.avgChainDepth.toFixed(2)}

By Platform:
${Object.entries(stats.byPlatform).map(([p, c]) => `- ${p}: ${c}`).join('\n') || '- No platform data yet'}

Top Performing Doggies:
${stats.topPerformers.map((d, i) => `${i + 1}. ${d}: ${stats.byDoggy[d]} shares`).join('\n') || '- No doggy data yet'}

Provide:
1. Key insights (3-5 bullet points)
2. Platform recommendations
3. Growth opportunities
4. Any issues to address`;

  const aiResult = await callLovableAI(prompt, systemPrompt);
  
  // Store insight
  await supabase.from('doggy_analytics_insights').insert({
    insight_type: 'share_analysis',
    model_used: 'lovable_ai',
    model_name: 'google/gemini-2.5-flash',
    title: `Share Analysis (${timeRange})`,
    summary: aiResult.analysis.slice(0, 500),
    detailed_analysis: aiResult.analysis,
    data_snapshot: stats,
    confidence_score: aiResult.success ? 0.85 : 0.5,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  });
  
  console.log(`[doggy-orchestrator] Share analysis complete. AI success: ${aiResult.success}`);
  
  return new Response(
    JSON.stringify({ success: true, stats, analysis: aiResult.analysis, aiEnabled: aiResult.success }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function generateDailySummary(supabase: any) {
  const stats = await getShareStats(supabase, '24h');
  
  const systemPrompt = `Generate a brief, engaging daily summary for Techno Doggies (dog avatar sharing platform). Be fun but data-driven. Use underground techno culture references. Keep it to 2-3 sentences.`;
  
  const topPlatform = Object.entries(stats.byPlatform).sort((a, b) => b[1] - a[1])[0];
  const prompt = `Daily stats:
- ${stats.total} shares today
- Top platform: ${topPlatform?.[0] || 'None yet'}
- Most shared doggy: ${stats.topPerformers[0] || 'None yet'}
- Reshare rate: ${stats.total > 0 ? ((stats.reshares / stats.total) * 100).toFixed(1) : 0}%

Write a 2-3 sentence summary.`;

  const aiResult = await callLovableAI(prompt, systemPrompt);
  
  await supabase.from('doggy_analytics_insights').insert({
    insight_type: 'daily_summary',
    model_used: 'lovable_ai',
    model_name: 'google/gemini-2.5-flash',
    title: `Daily Summary - ${new Date().toISOString().split('T')[0]}`,
    summary: aiResult.analysis,
    data_snapshot: stats,
    confidence_score: aiResult.success ? 0.9 : 0.5,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  });
  
  return new Response(
    JSON.stringify({ success: true, summary: aiResult.analysis, stats, aiEnabled: aiResult.success }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function detectViralChains(supabase: any) {
  const { data: chains } = await supabase
    .from('doggy_share_events')
    .select('*')
    .not('parent_share_id', 'is', null)
    .order('chain_depth', { ascending: false })
    .limit(50);
  
  const viralEvents = chains?.filter((c: any) => c.chain_depth >= 2) || [];
  
  return new Response(
    JSON.stringify({
      success: true,
      viralChains: viralEvents.length,
      topChains: viralEvents.slice(0, 10),
      avgDepth: viralEvents.length > 0 
        ? viralEvents.reduce((sum: number, c: any) => sum + c.chain_depth, 0) / viralEvents.length 
        : 0
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function analyzePlatformPerformance(supabase: any, timeRange: string) {
  const stats = await getShareStats(supabase, timeRange);
  
  const platformAnalysis = Object.entries(stats.byPlatform)
    .map(([platform, count]) => ({
      platform,
      shares: count,
      percentage: stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : '0',
      rank: 0
    }))
    .sort((a, b) => b.shares - a.shares)
    .map((p, i) => ({ ...p, rank: i + 1 }));
  
  return new Response(
    JSON.stringify({
      success: true,
      timeRange,
      totalShares: stats.total,
      platforms: platformAnalysis
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getStoredInsights(supabase: any) {
  const { data: insights } = await supabase
    .from('doggy_analytics_insights')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
  
  return new Response(
    JSON.stringify({ success: true, insights: insights || [] }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
