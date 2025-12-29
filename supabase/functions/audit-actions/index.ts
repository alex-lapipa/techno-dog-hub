import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuditAction {
  action: 'scan' | 'preview' | 'apply';
  fixType?: string;
  targetTable?: string;
  targetIds?: string[];
  dryRun?: boolean;
}

interface FixResult {
  success: boolean;
  action: string;
  affectedCount: number;
  details: string;
  rollbackData?: any;
  previewData?: any[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body: AuditAction = await req.json();
    const { action, fixType, targetTable, targetIds, dryRun = true } = body;

    console.log(`Audit Actions: ${action} - ${fixType || 'scan'} (dryRun: ${dryRun})`);

    // SCAN: Get real data from database
    if (action === 'scan') {
      const scanResults = await performFullScan(supabase);
      return new Response(JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        ...scanResults
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PREVIEW: Show what would be affected without changes
    if (action === 'preview') {
      const preview = await getPreview(supabase, fixType!, targetTable, targetIds);
      return new Response(JSON.stringify({
        success: true,
        dryRun: true,
        preview
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // APPLY: Execute fix (always creates rollback snapshot first)
    if (action === 'apply') {
      if (dryRun) {
        // Safe mode - just preview
        const preview = await getPreview(supabase, fixType!, targetTable, targetIds);
        return new Response(JSON.stringify({
          success: true,
          dryRun: true,
          message: "Dry run complete. Set dryRun: false to apply changes.",
          preview
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const result = await applyFix(supabase, fixType!, targetTable, targetIds);
      return new Response(JSON.stringify({
        success: true,
        result
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Audit action error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function performFullScan(supabase: any) {
  const issues: any[] = [];
  const proposals: any[] = [];
  const healthScores: Record<string, number> = {};
  const schema: any = { tables: [] };

  // Get table stats
  const tables = [
    { name: 'dj_artists', entity: 'artists' },
    { name: 'canonical_artists', entity: 'artists' },
    { name: 'media_assets', entity: 'media' },
    { name: 'td_news_articles', entity: 'articles' },
    { name: 'community_submissions', entity: 'submissions' },
    { name: 'media_pipeline_jobs', entity: 'jobs' },
  ];

  for (const table of tables) {
    try {
      const { count } = await supabase
        .from(table.name)
        .select('*', { count: 'exact', head: true });
      
      schema.tables.push({
        name: table.name,
        entity: table.entity,
        rows: count || 0,
        hasRelations: true
      });
    } catch (e) {
      console.error(`Failed to get stats for ${table.name}:`, e);
    }
  }

  // Check duplicates in dj_artists
  try {
    const { data: artists } = await supabase
      .from('dj_artists')
      .select('id, artist_name, rank');
    
    if (artists) {
      const nameCounts: Record<string, any[]> = {};
      for (const artist of artists) {
        const name = artist.artist_name.toLowerCase().trim();
        if (!nameCounts[name]) nameCounts[name] = [];
        nameCounts[name].push(artist);
      }
      
      const duplicates = Object.entries(nameCounts).filter(([_, arr]) => arr.length > 1);
      if (duplicates.length > 0) {
        issues.push({
          id: `dup-dj-artists`,
          type: 'duplicate',
          severity: 'high',
          entity: 'artists',
          table: 'dj_artists',
          message: `${duplicates.length} duplicate artist names detected`,
          count: duplicates.length,
          fixable: true,
          fixType: 'merge_duplicates'
        });

        // Create proposals for each duplicate
        duplicates.slice(0, 5).forEach(([name, records], idx) => {
          proposals.push({
            id: `merge-${idx}`,
            action: 'merge',
            entity: 'artists',
            table: 'dj_artists',
            description: `Merge "${records[0].artist_name}" duplicates (${records.length} records)`,
            confidence: 0.92,
            risk: 'low',
            targetIds: records.map(r => r.id.toString()),
            fixType: 'merge_duplicates'
          });
        });
      }
      
      // Calculate health score
      const totalArtists = artists.length;
      const duplicateCount = duplicates.reduce((sum, [_, arr]) => sum + arr.length - 1, 0);
      healthScores.artists = Math.max(0, Math.round(100 - (duplicateCount / totalArtists) * 100));
    }
  } catch (e) {
    console.error("Artist duplicate check failed:", e);
  }

  // Check for orphaned media assets
  try {
    const { data: mediaAssets, count: mediaCount } = await supabase
      .from('media_assets')
      .select('id, entity_id, entity_type, entity_name', { count: 'exact' });
    
    if (mediaAssets) {
      const orphaned: any[] = [];
      for (const asset of mediaAssets.slice(0, 50)) {
        if (asset.entity_type === 'artist') {
          const { data: artist } = await supabase
            .from('dj_artists')
            .select('id')
            .eq('id', parseInt(asset.entity_id))
            .maybeSingle();
          
          if (!artist) {
            orphaned.push(asset);
          }
        }
      }
      
      if (orphaned.length > 0) {
        issues.push({
          id: `orphan-media`,
          type: 'orphaned',
          severity: 'medium',
          entity: 'media',
          table: 'media_assets',
          message: `${orphaned.length} media assets with missing entities (sampled 50)`,
          count: orphaned.length,
          fixable: true,
          fixType: 'archive_orphaned'
        });

        proposals.push({
          id: `archive-orphaned-media`,
          action: 'archive',
          entity: 'media',
          table: 'media_assets',
          description: `Archive ${orphaned.length} orphaned media assets`,
          confidence: 0.95,
          risk: 'low',
          targetIds: orphaned.map(o => o.id),
          fixType: 'archive_orphaned'
        });
      }

      healthScores.media = Math.max(0, Math.round(100 - (orphaned.length / Math.max(1, mediaCount || 1)) * 200));
    }
  } catch (e) {
    console.error("Orphaned media check failed:", e);
  }

  // Check stale submissions
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: staleSubmissions, count } = await supabase
      .from('community_submissions')
      .select('id, name, created_at', { count: 'exact' })
      .eq('status', 'pending')
      .lt('created_at', sevenDaysAgo);
    
    if (count && count > 0) {
      issues.push({
        id: `stale-submissions`,
        type: 'stale',
        severity: 'low',
        entity: 'submissions',
        table: 'community_submissions',
        message: `${count} submissions pending for over 7 days`,
        count,
        fixable: true,
        fixType: 'flag_stale'
      });

        proposals.push({
          id: `flag-stale-submissions`,
          action: 'flag',
          entity: 'submissions',
          table: 'community_submissions',
          description: `Flag ${count} stale submissions for review`,
          confidence: 0.99,
          risk: 'low',
          targetIds: staleSubmissions?.map((s: { id: string }) => s.id) || [],
        fixType: 'flag_stale'
      });

      healthScores.submissions = Math.max(50, 100 - count * 2);
    } else {
      healthScores.submissions = 100;
    }
  } catch (e) {
    console.error("Stale submission check failed:", e);
  }

  // Check failed pipeline jobs
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: failedJobs, count } = await supabase
      .from('media_pipeline_jobs')
      .select('id, entity_name, error_log', { count: 'exact' })
      .eq('status', 'failed')
      .lt('updated_at', oneDayAgo);
    
    if (count && count > 0) {
      issues.push({
        id: `stuck-jobs`,
        type: 'stuck',
        severity: 'medium',
        entity: 'jobs',
        table: 'media_pipeline_jobs',
        message: `${count} failed jobs stuck for over 24 hours`,
        count,
        fixable: true,
        fixType: 'reset_failed_jobs'
      });

        proposals.push({
          id: `reset-failed-jobs`,
          action: 'reset',
          entity: 'jobs',
          table: 'media_pipeline_jobs',
          description: `Reset ${count} stuck failed jobs for retry`,
          confidence: 0.88,
          risk: 'low',
          targetIds: failedJobs?.map((j: { id: string }) => j.id) || [],
        fixType: 'reset_failed_jobs'
      });

      healthScores.jobs = Math.max(30, 100 - count * 5);
    } else {
      healthScores.jobs = 100;
    }
  } catch (e) {
    console.error("Failed jobs check failed:", e);
  }

  // Check articles with missing fields
  try {
    const { count: missingCount } = await supabase
      .from('td_news_articles')
      .select('*', { count: 'exact', head: true })
      .or('title.is.null,body_markdown.is.null');
    
    const { count: totalCount } = await supabase
      .from('td_news_articles')
      .select('*', { count: 'exact', head: true });

    if (missingCount && missingCount > 0) {
      issues.push({
        id: `missing-article-fields`,
        type: 'missing_fields',
        severity: 'medium',
        entity: 'articles',
        table: 'td_news_articles',
        message: `${missingCount} articles with missing required fields`,
        count: missingCount,
        fixable: false,
        fixType: 'manual_review'
      });

      healthScores.articles = Math.max(0, Math.round(100 - (missingCount / Math.max(1, totalCount || 1)) * 100));
    } else {
      healthScores.articles = 100;
    }
  } catch (e) {
    console.error("Article field check failed:", e);
  }

  // Set default health scores
  healthScores.artists = healthScores.artists || 85;
  healthScores.media = healthScores.media || 80;
  healthScores.articles = healthScores.articles || 90;
  healthScores.submissions = healthScores.submissions || 95;
  healthScores.jobs = healthScores.jobs || 90;

  return {
    schema,
    healthScores,
    issues,
    proposals,
    totalRecords: schema.tables.reduce((sum: number, t: any) => sum + t.rows, 0)
  };
}

async function getPreview(supabase: any, fixType: string, targetTable?: string, targetIds?: string[]) {
  const preview: any = {
    fixType,
    table: targetTable,
    affectedRecords: [],
    estimatedChanges: 0
  };

  switch (fixType) {
    case 'merge_duplicates':
      if (targetIds && targetIds.length > 0) {
        const { data } = await supabase
          .from('dj_artists')
          .select('*')
          .in('id', targetIds.map(id => parseInt(id)));
        preview.affectedRecords = data || [];
        preview.estimatedChanges = data?.length || 0;
        preview.action = 'Will keep the highest-ranked record and archive duplicates';
      }
      break;

    case 'archive_orphaned':
      if (targetIds && targetIds.length > 0) {
        const { data } = await supabase
          .from('media_assets')
          .select('*')
          .in('id', targetIds);
        preview.affectedRecords = data || [];
        preview.estimatedChanges = data?.length || 0;
        preview.action = 'Will mark assets as archived (soft delete)';
      }
      break;

    case 'reset_failed_jobs':
      if (targetIds && targetIds.length > 0) {
        const { data } = await supabase
          .from('media_pipeline_jobs')
          .select('*')
          .in('id', targetIds);
        preview.affectedRecords = data || [];
        preview.estimatedChanges = data?.length || 0;
        preview.action = 'Will reset status to pending and clear error log';
      }
      break;

    case 'flag_stale':
      if (targetIds && targetIds.length > 0) {
        const { data } = await supabase
          .from('community_submissions')
          .select('*')
          .in('id', targetIds);
        preview.affectedRecords = data || [];
        preview.estimatedChanges = data?.length || 0;
        preview.action = 'Will add admin note flagging as stale';
      }
      break;
  }

  return preview;
}

async function applyFix(supabase: any, fixType: string, targetTable?: string, targetIds?: string[]): Promise<FixResult> {
  // Always create rollback snapshot first
  const rollbackData = await createRollbackSnapshot(supabase, fixType, targetTable, targetIds);

  switch (fixType) {
    case 'merge_duplicates':
      return await mergeDuplicates(supabase, targetIds || [], rollbackData);

    case 'archive_orphaned':
      return await archiveOrphaned(supabase, targetIds || [], rollbackData);

    case 'reset_failed_jobs':
      return await resetFailedJobs(supabase, targetIds || [], rollbackData);

    case 'flag_stale':
      return await flagStaleSubmissions(supabase, targetIds || [], rollbackData);

    default:
      return {
        success: false,
        action: fixType,
        affectedCount: 0,
        details: 'Unknown fix type'
      };
  }
}

async function createRollbackSnapshot(supabase: any, fixType: string, table?: string, ids?: string[]) {
  const snapshot = {
    fixType,
    table,
    ids,
    createdAt: new Date().toISOString(),
    originalData: [] as any[]
  };

  if (table && ids && ids.length > 0) {
    const { data } = await supabase
      .from(table)
      .select('*')
      .in('id', ids);
    snapshot.originalData = data || [];
  }

  // Log to agent_reports for audit trail
  await supabase.from('agent_reports').insert({
    agent_name: 'Audit Actions',
    agent_category: 'operations',
    report_type: 'rollback_snapshot',
    severity: 'info',
    title: `Rollback snapshot: ${fixType}`,
    description: `Created rollback snapshot for ${ids?.length || 0} records`,
    details: snapshot
  });

  return snapshot;
}

async function mergeDuplicates(supabase: any, targetIds: string[], rollbackData: any): Promise<FixResult> {
  if (targetIds.length < 2) {
    return { success: false, action: 'merge_duplicates', affectedCount: 0, details: 'Need at least 2 records to merge' };
  }

  const { data: records } = await supabase
    .from('dj_artists')
    .select('*')
    .in('id', targetIds.map(id => parseInt(id)))
    .order('rank', { ascending: true });

  if (!records || records.length < 2) {
    return { success: false, action: 'merge_duplicates', affectedCount: 0, details: 'Records not found' };
  }

  // Keep the highest ranked (lowest number), soft-delete others by adding [DUPLICATE] prefix
  const keepRecord = records[0];
  const duplicateRecords = records.slice(1);
  let updatedCount = 0;

  // Update each duplicate individually to prepend [DUPLICATE]
  for (const record of duplicateRecords) {
    const newName = `[DUPLICATE] ${record.artist_name}`;
    const { error } = await supabase
      .from('dj_artists')
      .update({ artist_name: newName })
      .eq('id', record.id);
    
    if (!error) updatedCount++;
  }

  return {
    success: true,
    action: 'merge_duplicates',
    affectedCount: updatedCount,
    details: `Marked ${updatedCount} duplicates, kept "${keepRecord.artist_name}" (rank ${keepRecord.rank})`,
    rollbackData
  };
}

async function archiveOrphaned(supabase: any, targetIds: string[], rollbackData: any): Promise<FixResult> {
  // Soft delete by updating a field (we don't actually delete)
  // First get the current records to preserve existing alt_text
  const { data: assets } = await supabase
    .from('media_assets')
    .select('id, alt_text')
    .in('id', targetIds);

  let updatedCount = 0;
  
  if (assets) {
    for (const asset of assets) {
      const newAltText = `${asset.alt_text || ''} [ARCHIVED - orphaned]`.trim();
      const { error } = await supabase
        .from('media_assets')
        .update({ 
          alt_text: newAltText,
          updated_at: new Date().toISOString()
        })
        .eq('id', asset.id);
      
      if (!error) updatedCount++;
    }
  }

  return {
    success: true,
    action: 'archive_orphaned',
    affectedCount: updatedCount,
    details: `Archived ${updatedCount} orphaned media assets`,
    rollbackData
  };
}

async function resetFailedJobs(supabase: any, targetIds: string[], rollbackData: any): Promise<FixResult> {
  const { error } = await supabase
    .from('media_pipeline_jobs')
    .update({ 
      status: 'pending',
      attempts: 0,
      error_log: null,
      updated_at: new Date().toISOString()
    })
    .in('id', targetIds);

  if (error) {
    return { success: false, action: 'reset_failed_jobs', affectedCount: 0, details: error.message, rollbackData };
  }

  return {
    success: true,
    action: 'reset_failed_jobs',
    affectedCount: targetIds.length,
    details: `Reset ${targetIds.length} failed jobs to pending`,
    rollbackData
  };
}

async function flagStaleSubmissions(supabase: any, targetIds: string[], rollbackData: any): Promise<FixResult> {
  // Get current records to preserve existing admin_notes
  const { data: submissions } = await supabase
    .from('community_submissions')
    .select('id, admin_notes')
    .in('id', targetIds);

  let updatedCount = 0;

  if (submissions) {
    for (const submission of submissions) {
      const newNotes = `${submission.admin_notes || ''} [FLAGGED: Stale - pending > 7 days]`.trim();
      const { error } = await supabase
        .from('community_submissions')
        .update({ 
          admin_notes: newNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', submission.id);
      
      if (!error) updatedCount++;
    }
  }

  return {
    success: true,
    action: 'flag_stale',
    affectedCount: updatedCount,
    details: `Flagged ${updatedCount} stale submissions`,
    rollbackData
  };
}
