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

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Remove 'media-api' from path if present
    const apiPath = pathParts[0] === 'media-api' ? pathParts.slice(1) : pathParts;

    // GET /media-api/search?q=...&type=...
    if (req.method === 'GET' && apiPath[0] === 'search') {
      const query = url.searchParams.get('q') || '';
      const entityType = url.searchParams.get('type');
      const limit = parseInt(url.searchParams.get('limit') || '20');

      let dbQuery = supabase
        .from('media_assets')
        .select('*')
        .eq('final_selected', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (entityType) {
        dbQuery = dbQuery.eq('entity_type', entityType);
      }

      if (query) {
        dbQuery = dbQuery.or(`entity_name.ilike.%${query}%,tags.cs.["${query}"]`);
      }

      const { data, error } = await dbQuery;
      if (error) throw error;

      const results = data?.map(asset => ({
        id: asset.id,
        entityType: asset.entity_type,
        entityId: asset.entity_id,
        entityName: asset.entity_name,
        imageUrl: asset.storage_url || asset.source_url,
        tags: asset.tags,
        altText: asset.alt_text,
        license: asset.license_name,
        licenseStatus: asset.license_status,
        copyrightRisk: asset.copyright_risk,
        matchScore: asset.match_score,
        qualityScore: asset.quality_score,
        provider: asset.provider,
      }));

      return new Response(JSON.stringify({ 
        success: true, 
        count: results?.length || 0,
        results 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /media-api/entity/:type/:id
    if (req.method === 'GET' && apiPath[0] === 'entity' && apiPath[1] && apiPath[2]) {
      const entityType = apiPath[1];
      const entityId = apiPath[2];

      // First try to get the selected asset
      let { data: asset, error } = await supabase
        .from('media_assets')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .eq('final_selected', true)
        .single();

      // If no selected asset, get any asset
      if (!asset) {
        const { data: anyAsset } = await supabase
          .from('media_assets')
          .select('*')
          .eq('entity_type', entityType)
          .eq('entity_id', entityId)
          .order('match_score', { ascending: false })
          .limit(1)
          .single();
        asset = anyAsset;
      }

      if (!asset) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'No image found for this entity',
          entityType,
          entityId,
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        success: true,
        id: asset.id,
        imageUrl: asset.storage_url || asset.source_url,
        tags: asset.tags,
        altText: asset.alt_text,
        meta: asset.meta,
        license: {
          name: asset.license_name,
          url: asset.license_url,
          status: asset.license_status,
        },
        copyright: {
          risk: asset.copyright_risk,
          verified: asset.openai_verified,
        },
        scores: {
          match: asset.match_score,
          quality: asset.quality_score,
        },
        provider: asset.provider,
        sourceUrl: asset.source_url,
        selected: asset.final_selected,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /media-api/stats
    if (req.method === 'GET' && apiPath[0] === 'stats') {
      const { data: assets } = await supabase
        .from('media_assets')
        .select('entity_type, final_selected, license_status, copyright_risk');

      const stats = {
        total: assets?.length || 0,
        byType: {} as Record<string, number>,
        selected: 0,
        byLicense: { safe: 0, unknown: 0, rejected: 0 },
        byCopyrightRisk: { low: 0, medium: 0, high: 0 },
      };

      assets?.forEach(asset => {
        stats.byType[asset.entity_type] = (stats.byType[asset.entity_type] || 0) + 1;
        if (asset.final_selected) stats.selected++;
        if (asset.license_status) stats.byLicense[asset.license_status as keyof typeof stats.byLicense]++;
        if (asset.copyright_risk) stats.byCopyrightRisk[asset.copyright_risk as keyof typeof stats.byCopyrightRisk]++;
      });

      const { data: jobs } = await supabase
        .from('media_pipeline_jobs')
        .select('status');

      const jobStats = {
        queued: 0,
        running: 0,
        complete: 0,
        failed: 0,
      };
      jobs?.forEach(job => {
        jobStats[job.status as keyof typeof jobStats]++;
      });

      return new Response(JSON.stringify({ 
        success: true,
        assets: stats,
        jobs: jobStats,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /media-api/candidates - Get all candidates for an entity
    if (req.method === 'POST' && apiPath[0] === 'candidates') {
      const { entityType, entityId } = await req.json();

      const { data, error } = await supabase
        .from('media_assets')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('match_score', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ 
        success: true,
        count: data?.length || 0,
        candidates: data?.map(asset => ({
          id: asset.id,
          sourceUrl: asset.source_url,
          storageUrl: asset.storage_url,
          provider: asset.provider,
          matchScore: asset.match_score,
          qualityScore: asset.quality_score,
          copyrightRisk: asset.copyright_risk,
          licenseStatus: asset.license_status,
          licenseName: asset.license_name,
          verified: asset.openai_verified,
          selected: asset.final_selected,
          altText: asset.alt_text,
          reasoning: asset.reasoning_summary,
          tags: asset.tags,
        })),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /media-api/select - Manually select an asset
    if (req.method === 'POST' && apiPath[0] === 'select') {
      const { assetId } = await req.json();

      // Get the asset to find entity info
      const { data: asset, error: fetchError } = await supabase
        .from('media_assets')
        .select('entity_type, entity_id')
        .eq('id', assetId)
        .single();

      if (fetchError) throw fetchError;

      // Deselect all others for this entity
      await supabase
        .from('media_assets')
        .update({ final_selected: false })
        .eq('entity_type', asset.entity_type)
        .eq('entity_id', asset.entity_id);

      // Select this one
      const { error: updateError } = await supabase
        .from('media_assets')
        .update({ final_selected: true })
        .eq('id', assetId);

      if (updateError) throw updateError;

      return new Response(JSON.stringify({ 
        success: true,
        message: 'Asset selected successfully',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /media-api/reject - Reject an asset
    if (req.method === 'POST' && apiPath[0] === 'reject') {
      const { assetId, reason } = await req.json();

      const { error } = await supabase
        .from('media_assets')
        .update({ 
          license_status: 'rejected',
          final_selected: false,
          reasoning_summary: reason || 'Manually rejected by admin',
        })
        .eq('id', assetId);

      if (error) throw error;

      return new Response(JSON.stringify({ 
        success: true,
        message: 'Asset rejected',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Media API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
