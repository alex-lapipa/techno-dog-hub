/**
 * Regenerate Embeddings — Voyage 1024d unified
 * Backfills voyage_embedding for documents and artist_documents.
 */

import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";
import { generateVoyageEmbedding, formatEmbeddingForStorage } from "../_shared/voyage-embeddings.ts";

interface EmbeddingRequest {
  action?: 'documents' | 'artist_documents' | 'status' | 'all';
  batch_size?: number;
  document_type?: string;
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createServiceClient();

    let body: EmbeddingRequest = { action: 'documents', batch_size: 10 };
    try { body = await req.json(); } catch { /* defaults */ }
    
    const { action = 'documents', batch_size = 25, document_type } = body;
    console.log(`Regenerate embeddings: action=${action}, batch_size=${batch_size}`);

    if (action === 'status') {
      const [docsRes, artistDocsRes] = await Promise.all([
        supabase.from('documents').select('id', { count: 'exact', head: true }).is('voyage_embedding', null),
        supabase.from('artist_documents').select('document_id, document_type').is('voyage_embedding', null),
      ]);

      const byType: Record<string, number> = {};
      for (const doc of artistDocsRes.data || []) {
        byType[doc.document_type] = (byType[doc.document_type] || 0) + 1;
      }

      return jsonResponse({
        success: true,
        documents_missing_voyage: docsRes.count || 0,
        artist_documents_missing_voyage: artistDocsRes.data?.length || 0,
        by_document_type: byType,
      });
    }

    // Process artist_documents
    if (action === 'artist_documents' || action === 'all') {
      let query = supabase
        .from('artist_documents')
        .select('document_id, content, document_type, title')
        .is('voyage_embedding', null)
        .limit(batch_size);
      if (document_type) query = query.eq('document_type', document_type);

      const { data: artistDocs, error: fetchError } = await query;
      if (fetchError) throw new Error(`Fetch failed: ${fetchError.message}`);

      if (artistDocs && artistDocs.length > 0) {
        let updated = 0;
        const results: any[] = [];

        for (const doc of artistDocs) {
          if (!doc.content || doc.content.length < 10) continue;
          const embResult = await generateVoyageEmbedding(doc.content);
          if (embResult) {
            const embStr = formatEmbeddingForStorage(embResult.embedding);
            const { error } = await supabase
              .from('artist_documents')
              .update({ voyage_embedding: embStr })
              .eq('document_id', doc.document_id);
            if (!error) { updated++; results.push({ document_id: doc.document_id, success: true }); }
            else results.push({ document_id: doc.document_id, success: false, error: error.message });
          } else {
            results.push({ document_id: doc.document_id, success: false, error: 'Embedding failed' });
          }
          await new Promise(r => setTimeout(r, 100));
        }

        if (action === 'artist_documents') {
          return jsonResponse({ success: true, updated, total: artistDocs.length, results: results.slice(0, 15) });
        }
      } else if (action === 'artist_documents') {
        return jsonResponse({ success: true, message: 'No artist documents need voyage embeddings', updated: 0 });
      }
    }

    // Process documents table
    if (action === 'documents' || action === 'all') {
      const { data: documents, error: fetchError } = await supabase
        .from('documents')
        .select('id, title, content')
        .is('voyage_embedding', null)
        .limit(batch_size);

      if (fetchError) throw new Error(`Fetch failed: ${fetchError.message}`);

      if (!documents?.length) {
        return jsonResponse({ success: true, message: 'No documents need voyage embeddings', updated: 0 });
      }

      let updated = 0;
      const results: any[] = [];

      for (const doc of documents) {
        const embResult = await generateVoyageEmbedding(doc.content);
        if (embResult) {
          const embStr = formatEmbeddingForStorage(embResult.embedding);
          const { error } = await supabase
            .from('documents')
            .update({ voyage_embedding: embStr })
            .eq('id', doc.id);
          if (!error) { updated++; results.push({ id: doc.id, title: doc.title, success: true }); }
          else results.push({ id: doc.id, success: false, error: error.message });
        } else {
          results.push({ id: doc.id, success: false, error: 'Embedding failed' });
        }
        await new Promise(r => setTimeout(r, 100));
      }

      return jsonResponse({ success: true, updated, total: documents.length, results });
    }

    return errorResponse('Invalid action', 400);
  } catch (error: unknown) {
    console.error('Error:', error);
    return errorResponse(error instanceof Error ? error.message : 'Unknown error');
  }
});
