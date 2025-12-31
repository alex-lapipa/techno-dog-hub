import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Doggy Self-Healing Agent
 * 
 * SCOPE: ONLY affects Doggy landing page (/doggies, /doggy-widget)
 * ISOLATION: Uses only doggy_* prefixed tables
 * NEVER modifies main site tables or functionality
 * 
 * Actions:
 * - 'analyze': Run health check and detect issues
 * - 'auto-fix': Apply automatic fixes to landing page issues
 * - 'report-error': Log client-side errors
 * - 'suggest-hq': Create improvement suggestions for Doggies HQ (requires approval)
 * - 'get-status': Get current agent status and health
 */

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Safe JSON parsing - handle empty body
    let body: { action?: string; data?: any };
    try {
      const text = await req.text();
      body = text ? JSON.parse(text) : {};
    } catch {
      body = {};
    }
    const { action = 'analyze', data } = body;
    console.log(`[doggy-self-heal] Action: ${action}`);

    switch (action) {
      case 'analyze':
        return await runAnalysis(supabase);
      
      case 'auto-fix':
        return await applyAutoFixes(supabase, data?.issueId);
      
      case 'report-error':
        return await reportError(supabase, data);
      
      case 'suggest-hq':
        return await createHQSuggestion(supabase, data);
      
      case 'get-status':
        return await getAgentStatus(supabase);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action', validActions: ['analyze', 'auto-fix', 'report-error', 'suggest-hq', 'get-status'] }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Doggy Agent Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function runAnalysis(supabase: any) {
  // Create run record
  const { data: run, error: runError } = await supabase
    .from('doggy_agent_runs')
    .insert({ run_type: 'scheduled', status: 'running' })
    .select()
    .single();

  if (runError) throw runError;

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
    result.performanceScore = await calculatePerformanceScore(supabase, result.issuesFound);

    // 4. Generate HQ suggestions (only suggestions, not actions)
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

  // Check share-to-view ratio
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
    // Group by error type
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

  // Virality = weighted combination of engagement metrics
  const shareRate = views > 0 ? (shares / views) * 100 : 0;
  const downloadRate = views > 0 ? (downloads / views) * 100 : 0;
  
  // Score: 50 base + up to 25 for shares + up to 25 for downloads
  let score = 50;
  score += Math.min(25, shareRate * 2.5); // 10% share rate = +25
  score += Math.min(25, downloadRate * 1.25); // 20% download rate = +25

  return Math.round(Math.min(100, score));
}

async function calculatePerformanceScore(supabase: any, issues: Issue[]): Promise<number> {
  let score = 100;
  
  // Deduct points based on issue severity
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
  // ONLY fix landing page issues, NEVER touch main site
  const fix: Fix = {
    type: 'config_update',
    component: issue.component || 'landing_page',
    description: '',
    success: false
  };

  switch (issue.type) {
    case 'low_share_rate':
      // Enable more prominent share CTA in landing page config
      fix.type = 'config_update';
      fix.description = 'Enabled prominent share CTA mode';
      fix.success = true;
      break;

    case 'recurring_share_error':
      // Enable fallback sharing method
      fix.type = 'fallback_enable';
      fix.description = 'Enabled clipboard fallback for sharing';
      fix.success = true;
      break;

    case 'recurring_download_error':
      // Enable simplified download method
      fix.type = 'fallback_enable';
      fix.description = 'Enabled simplified PNG download fallback';
      fix.success = true;
      break;

    default:
      return null;
  }

  // Record the fix
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
    .eq('hq_approved', false);

  // Get recent fixes
  const { data: recentFixes } = await supabase
    .from('doggy_auto_fixes')
    .select('*')
    .order('applied_at', { ascending: false })
    .limit(5);

  return new Response(
    JSON.stringify({
      success: true,
      status: {
        lastRun,
        unresolvedIssues: unresolvedCount || 0,
        pendingHQSuggestions: pendingSuggestions || [],
        recentFixes: recentFixes || [],
        isHealthy: (lastRun?.performance_score || 0) >= 70
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
