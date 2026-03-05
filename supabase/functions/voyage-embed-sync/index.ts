/**
 * Voyage Embedding Sync — Batch populates voyage_embedding columns
 * for all vector tables using the shared Voyage AI utility.
 * 
 * Actions:
 * - status: Get counts of rows missing Voyage embeddings
 * - sync_documents: Populate documents table
 * - sync_dj_artists: Populate dj_artists table
 * - sync_artist_documents: Populate artist_documents table
 * - sync_gear_catalog: Populate gear_catalog table
 * - sync_all: Sequential sync of all tables
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { 
  generateVoyageBatchEmbeddings, 
  formatEmbeddingForStorage 
} from "../_shared/voyage-embeddings.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type SyncAction = 'status' | 'sync_documents' | 'sync_dj_artists' | 'sync_artist_documents' | 'sync_gear_catalog' | 'sync_all';

interface SyncRequest {
  action: SyncAction;
  batch_size?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, batch_size = 15 }: SyncRequest = await req.json();
    console.log(`[voyage-embed-sync] Action: ${action}, batch: ${batch_size}`);

    // === STATUS ===
    if (action === 'status') {
      const [docs, artists, djArtists, gear] = await Promise.all([
        supabase.from('documents').select('id', { count: 'exact', head: true }).is('voyage_embedding', null),
        supabase.from('artist_documents').select('document_id', { count: 'exact', head: true }).is('voyage_embedding', null),
        supabase.from('dj_artists').select('id', { count: 'exact', head: true }).is('voyage_embedding', null),
        supabase.from('gear_catalog').select('id', { count: 'exact', head: true }).is('voyage_embedding', null),
      ]);

      return jsonResponse({
        success: true,
        missing_voyage_embeddings: {
          documents: docs.count ?? 0,
          artist_documents: artists.count ?? 0,
          dj_artists: djArtists.count ?? 0,
          gear_catalog: gear.count ?? 0,
          total: (docs.count ?? 0) + (artists.count ?? 0) + (djArtists.count ?? 0) + (gear.count ?? 0),
        }
      });
    }

    // === SYNC FUNCTIONS ===
    if (action === 'sync_documents' || action === 'sync_all') {
      const result = await syncTable(supabase, {
        table: 'documents',
        idColumn: 'id',
        textColumn: 'content',
        titleColumn: 'title',
        batchSize: batch_size,
      });
      if (action !== 'sync_all') return jsonResponse({ success: true, documents: result });
      var docsResult = result;
    }

    if (action === 'sync_dj_artists' || action === 'sync_all') {
      const result = await syncTable(supabase, {
        table: 'dj_artists',
        idColumn: 'id',
        textBuilder: (row: any) => {
          const parts = [
            row.artist_name,
            row.real_name ? `Real name: ${row.real_name}` : '',
            row.nationality ? `From: ${row.nationality}` : '',
            row.known_for || '',
            row.subgenres?.length ? `Subgenres: ${row.subgenres.join(', ')}` : '',
            row.labels?.length ? `Labels: ${row.labels.join(', ')}` : '',
            row.top_tracks?.length ? `Tracks: ${row.top_tracks.join(', ')}` : '',
          ].filter(Boolean);
          return parts.join('. ');
        },
        selectColumns: 'id, artist_name, real_name, nationality, known_for, subgenres, labels, top_tracks',
        batchSize: batch_size,
      });
      if (action !== 'sync_all') return jsonResponse({ success: true, dj_artists: result });
      var djResult = result;
    }

    if (action === 'sync_gear_catalog' || action === 'sync_all') {
      const result = await syncTable(supabase, {
        table: 'gear_catalog',
        idColumn: 'id',
        textBuilder: (row: any) => {
          const parts = [
            `${row.brand} ${row.name}`,
            row.category ? `Category: ${row.category}` : '',
            row.short_description || '',
          ].filter(Boolean);
          return parts.join('. ');
        },
        selectColumns: 'id, name, brand, category, short_description',
        batchSize: batch_size,
      });
      if (action !== 'sync_all') return jsonResponse({ success: true, gear_catalog: result });
      var gearResult = result;
    }

    if (action === 'sync_artist_documents' || action === 'sync_all') {
      const result = await syncTable(supabase, {
        table: 'artist_documents',
        idColumn: 'document_id',
        textColumn: 'content',
        titleColumn: 'title',
        batchSize: batch_size,
      });
      if (action !== 'sync_all') return jsonResponse({ success: true, artist_documents: result });
      var artistDocsResult = result;
    }

    if (action === 'sync_all') {
      return jsonResponse({
        success: true,
        results: {
          documents: docsResult!,
          dj_artists: djResult!,
          gear_catalog: gearResult!,
          artist_documents: artistDocsResult!,
        }
      });
    }

    return jsonResponse({ error: 'Invalid action' }, 400);
  } catch (error: unknown) {
    console.error('[voyage-embed-sync] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal error';
    return jsonResponse({ error: message }, 500);
  }
});

// === Generic table sync ===

interface SyncConfig {
  table: string;
  idColumn: string;
  textColumn?: string;
  titleColumn?: string;
  textBuilder?: (row: any) => string;
  selectColumns?: string;
  batchSize: number;
}

async function syncTable(supabase: any, config: SyncConfig) {
  const { table, idColumn, textColumn, titleColumn, textBuilder, batchSize } = config;
  const selectCols = config.selectColumns || `${idColumn}, ${textColumn || 'content'}${titleColumn ? `, ${titleColumn}` : ''}`;

  // Fetch rows missing voyage_embedding
  const { data: rows, error } = await supabase
    .from(table)
    .select(selectCols)
    .is('voyage_embedding', null)
    .limit(batchSize);

  if (error) throw new Error(`Failed to fetch ${table}: ${error.message}`);
  if (!rows || rows.length === 0) return { processed: 0, message: `All ${table} rows already have Voyage embeddings` };

  console.log(`[voyage-embed-sync] Processing ${rows.length} rows from ${table}`);

  // Build text array
  const texts: string[] = rows.map((row: any) => {
    if (textBuilder) return textBuilder(row);
    const title = titleColumn ? row[titleColumn] || '' : '';
    const content = textColumn ? row[textColumn] || '' : '';
    return title ? `${title}: ${content}` : content;
  });

  // Filter out empty texts
  const validIndices: number[] = [];
  const validTexts: string[] = [];
  texts.forEach((t, i) => {
    if (t.trim().length >= 10) {
      validIndices.push(i);
      validTexts.push(t);
    }
  });

  if (validTexts.length === 0) {
    return { processed: 0, skipped: rows.length, message: 'All texts too short' };
  }

  // Generate batch embeddings
  const result = await generateVoyageBatchEmbeddings(validTexts);
  if (!result) throw new Error(`Embedding generation failed for ${table}`);

  // Update each row
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < result.embeddings.length; i++) {
    const row = rows[validIndices[i]];
    const embeddingStr = formatEmbeddingForStorage(result.embeddings[i].embedding);

    const { error: updateError } = await supabase
      .from(table)
      .update({ voyage_embedding: embeddingStr })
      .eq(idColumn, row[idColumn]);

    if (updateError) {
      console.error(`[voyage-embed-sync] Update error for ${table}/${row[idColumn]}:`, updateError);
      errorCount++;
    } else {
      successCount++;
    }
  }

  return {
    processed: rows.length,
    embedded: successCount,
    errors: errorCount,
    skipped: rows.length - validTexts.length,
    provider: result.provider,
    model: result.model,
    tokens_used: result.total_tokens,
  };
}

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
