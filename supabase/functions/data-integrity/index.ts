import { corsHeaders, handleCors, jsonResponse } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";

interface IntegrityIssue {
  type: string;
  table: string;
  count: number;
  description: string;
  severity: 'info' | 'warning' | 'critical';
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const supabase = createServiceClient();

  console.log("Data Integrity Agent: Starting scan...");

  const issues: IntegrityIssue[] = [];

  // 1. Check for duplicate artists by name
  try {
    const { data: artists } = await supabase
      .from('dj_artists')
      .select('artist_name');
    
    if (artists) {
      const nameCounts: Record<string, number> = {};
      for (const artist of artists) {
        const name = artist.artist_name.toLowerCase().trim();
        nameCounts[name] = (nameCounts[name] || 0) + 1;
      }
      
      const duplicates = Object.entries(nameCounts).filter(([_, count]) => count > 1);
      if (duplicates.length > 0) {
        issues.push({
          type: 'duplicates',
          table: 'dj_artists',
          count: duplicates.length,
          description: `Found ${duplicates.length} duplicate artist names`,
          severity: 'warning'
        });
      }
    }
  } catch (e) {
    console.error("Artist duplicate check failed:", e);
  }

  // 2. Check for orphaned media assets (entity doesn't exist)
  try {
    const { data: mediaAssets } = await supabase
      .from('media_assets')
      .select('id, entity_id, entity_type');
    
    if (mediaAssets) {
      let orphanedCount = 0;
      for (const asset of mediaAssets.slice(0, 100)) { // Sample first 100
        if (asset.entity_type === 'artist') {
          const { data: artist } = await supabase
            .from('dj_artists')
            .select('id')
            .eq('id', parseInt(asset.entity_id))
            .single();
          
          if (!artist) orphanedCount++;
        }
      }
      
      if (orphanedCount > 0) {
        issues.push({
          type: 'orphaned_records',
          table: 'media_assets',
          count: orphanedCount,
          description: `Found ${orphanedCount} media assets with missing entities (sampled 100)`,
          severity: 'info'
        });
      }
    }
  } catch (e) {
    console.error("Orphaned media check failed:", e);
  }

  // 3. Check for articles without required fields
  try {
    const { data: articles, count } = await supabase
      .from('td_news_articles')
      .select('*', { count: 'exact' })
      .or('title.is.null,body_markdown.is.null,author_pseudonym.is.null');
    
    if (count && count > 0) {
      issues.push({
        type: 'missing_fields',
        table: 'td_news_articles',
        count,
        description: `Found ${count} articles with missing required fields`,
        severity: 'warning'
      });
    }
  } catch (e) {
    console.error("Article field check failed:", e);
  }

  // 4. Check for stale pending submissions (older than 7 days)
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('community_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .lt('created_at', sevenDaysAgo);
    
    if (count && count > 0) {
      issues.push({
        type: 'stale_pending',
        table: 'community_submissions',
        count,
        description: `Found ${count} submissions pending for over 7 days`,
        severity: 'info'
      });
    }
  } catch (e) {
    console.error("Stale submission check failed:", e);
  }

  // 5. Check for failed media pipeline jobs stuck for 24+ hours
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('media_pipeline_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'failed')
      .lt('updated_at', oneDayAgo);
    
    if (count && count > 0) {
      issues.push({
        type: 'stuck_jobs',
        table: 'media_pipeline_jobs',
        count,
        description: `Found ${count} failed jobs older than 24 hours`,
        severity: 'warning'
      });
    }
  } catch (e) {
    console.error("Stuck jobs check failed:", e);
  }

  // 6. Check for users without profiles
  try {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id');
    
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id');
    
    if (profiles && roles) {
      const profileUserIds = new Set(profiles.map(p => p.user_id));
      const rolesWithoutProfiles = roles.filter(r => !profileUserIds.has(r.user_id));
      
      if (rolesWithoutProfiles.length > 0) {
        issues.push({
          type: 'missing_profiles',
          table: 'profiles',
          count: rolesWithoutProfiles.length,
          description: `Found ${rolesWithoutProfiles.length} users with roles but no profile`,
          severity: 'warning'
        });
      }
    }
  } catch (e) {
    console.error("Missing profiles check failed:", e);
  }

  // Log issues as agent reports
  for (const issue of issues) {
    await supabase.from('agent_reports').insert({
      agent_name: 'Data Integrity',
      agent_category: 'operations',
      report_type: 'finding',
      severity: issue.severity,
      title: `${issue.type}: ${issue.table}`,
      description: issue.description,
      details: issue
    });
  }

  console.log(`Data Integrity Agent: Complete. Found ${issues.length} issues.`);

  return jsonResponse({
    success: true,
    timestamp: new Date().toISOString(),
    issuesFound: issues.length,
    issues
  });
});