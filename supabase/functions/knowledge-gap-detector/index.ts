import { corsHeaders, handleCors, jsonResponse } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const supabase = createServiceClient();

  console.log("Knowledge Gap Detector: Scanning for missing data...");

  const gaps = [];

  // 1. Check for artists without embeddings
  const { count: noEmbeddingCount } = await supabase
    .from('dj_artists')
    .select('*', { count: 'exact', head: true })
    .is('embedding', null);

  if (noEmbeddingCount && noEmbeddingCount > 0) {
    gaps.push({
      type: 'missing_embeddings',
      entity: 'dj_artists',
      count: noEmbeddingCount,
      severity: 'info',
      title: `${noEmbeddingCount} artists without search embeddings`,
      recommendation: 'Run embedding generation for better search'
    });
  }

  // 2. Check for artists without key information
  const { count: incompleteArtists } = await supabase
    .from('dj_artists')
    .select('*', { count: 'exact', head: true })
    .or('known_for.is.null,labels.is.null,nationality.is.null');

  if (incompleteArtists && incompleteArtists > 10) {
    gaps.push({
      type: 'incomplete_profiles',
      entity: 'dj_artists',
      count: incompleteArtists,
      severity: 'info',
      title: `${incompleteArtists} artists with incomplete data`,
      recommendation: 'Enrich artist profiles with missing information'
    });
  }

  // 3. Check for entities without photos
  const { data: artistsWithoutMedia } = await supabase
    .from('dj_artists')
    .select('id, artist_name')
    .limit(200);

  if (artistsWithoutMedia) {
    const artistIds = artistsWithoutMedia.map(a => a.id.toString());
    const { data: mediaAssets } = await supabase
      .from('media_assets')
      .select('entity_id')
      .eq('entity_type', 'artist')
      .in('entity_id', artistIds);

    const artistsWithMedia = new Set(mediaAssets?.map(m => m.entity_id) || []);
    const artistsWithoutMediaCount = artistIds.filter(id => !artistsWithMedia.has(id)).length;

    if (artistsWithoutMediaCount > 20) {
      gaps.push({
        type: 'missing_photos',
        entity: 'dj_artists',
        count: artistsWithoutMediaCount,
        severity: 'warning',
        title: `${artistsWithoutMediaCount} artists without photos`,
        recommendation: 'Queue media pipeline jobs for these artists'
      });
    }
  }

  // 4. Check document coverage
  const { count: documentCount } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true });

  if (!documentCount || documentCount < 50) {
    gaps.push({
      type: 'low_document_count',
      entity: 'documents',
      count: documentCount || 0,
      severity: 'info',
      title: 'Knowledge base could be expanded',
      recommendation: 'Add more reference documents for better chat responses'
    });
  }

  // 5. Check for knowledge entities without descriptions
  const { count: undescribedEntities } = await supabase
    .from('td_knowledge_entities')
    .select('*', { count: 'exact', head: true })
    .is('description', null);

  if (undescribedEntities && undescribedEntities > 5) {
    gaps.push({
      type: 'missing_descriptions',
      entity: 'td_knowledge_entities',
      count: undescribedEntities,
      severity: 'info',
      title: `${undescribedEntities} knowledge entities without descriptions`,
      recommendation: 'Add descriptions for better context'
    });
  }

  // Store findings
  for (const gap of gaps) {
    await supabase.from('agent_reports').insert({
      agent_name: 'Knowledge Gap Detector',
      agent_category: 'growth',
      report_type: 'finding',
      severity: gap.severity,
      title: gap.title,
      description: gap.recommendation,
      details: { type: gap.type, entity: gap.entity, count: gap.count }
    });
  }

  console.log(`Knowledge Gap Detector: Found ${gaps.length} gaps`);

  return jsonResponse({
    success: true,
    timestamp: new Date().toISOString(),
    gapsFound: gaps.length,
    gaps
  });
});