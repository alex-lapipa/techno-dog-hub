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

  console.log("Submissions Triage: Checking new submissions...");

  const findings = [];

  // Get pending submissions
  const { data: pendingSubmissions, count } = await supabase
    .from('community_submissions')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (!pendingSubmissions || pendingSubmissions.length === 0) {
    return new Response(JSON.stringify({
      success: true,
      message: 'No pending submissions',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Analyze each submission
  for (const submission of pendingSubmissions) {
    const issues = [];
    
    // Check for missing required fields
    if (!submission.name || submission.name.trim().length < 2) {
      issues.push('Missing or invalid name');
    }
    
    // Check for suspicious patterns
    if (submission.description) {
      const desc = submission.description.toLowerCase();
      if (desc.includes('http://') || desc.includes('bit.ly') || desc.includes('tinyurl')) {
        issues.push('Contains suspicious links');
      }
    }

    // Check for duplicate submissions
    if (submission.name) {
      const { count: duplicateCount } = await supabase
        .from('community_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('name', submission.name)
        .neq('id', submission.id);
      
      if (duplicateCount && duplicateCount > 0) {
        issues.push(`Potential duplicate (${duplicateCount} similar)`);
      }
    }

    // Check age of submission
    const ageInDays = (Date.now() - new Date(submission.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (ageInDays > 7) {
      issues.push(`Pending for ${Math.floor(ageInDays)} days`);
    }

    // Report findings
    if (issues.length > 0) {
      findings.push({
        submission_id: submission.id,
        name: submission.name,
        type: submission.submission_type,
        issues,
        age_days: Math.floor(ageInDays)
      });

      // Only report critical issues
      if (issues.some(i => i.includes('suspicious') || i.includes('duplicate'))) {
        await supabase.from('agent_reports').insert({
          agent_name: 'Submissions Triage',
          agent_category: 'content',
          report_type: 'review_needed',
          severity: 'warning',
          title: `Review submission: ${submission.name || 'Untitled'}`,
          description: issues.join('; '),
          details: { submission_id: submission.id, issues }
        });
      }
    }
  }

  // Report if there's a large backlog
  if (count && count > 20) {
    await supabase.from('agent_reports').insert({
      agent_name: 'Submissions Triage',
      agent_category: 'content',
      report_type: 'finding',
      severity: 'info',
      title: `${count} submissions pending review`,
      description: 'Consider allocating time to process submission queue',
      details: { pending_count: count }
    });
  }

  console.log(`Submissions Triage: Analyzed ${pendingSubmissions.length} submissions, flagged ${findings.length}`);

  return new Response(JSON.stringify({
    success: true,
    timestamp: new Date().toISOString(),
    analyzed: pendingSubmissions.length,
    flagged: findings.length,
    findings
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});