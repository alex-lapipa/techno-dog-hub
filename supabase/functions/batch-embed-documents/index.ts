/**
 * Batch Embedding Generator — Voyage 1024d with dual-write
 * Generates voyage_embedding for documents missing them.
 */

import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";
import { generateVoyageEmbedding, formatEmbeddingForStorage } from "../_shared/voyage-embeddings.ts";

interface BatchRequest {
  action: 'embed_artist_documents' | 'embed_rag_documents' | 'status';
  batch_size?: number;
  document_type?: string;
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createServiceClient();
    const body: BatchRequest = await req.json();
    const { action, batch_size = 20, document_type } = body;

    console.log(`Batch embed action: ${action}, batch_size: ${batch_size}`);

    if (action === 'status') {
      const { data: artistDocs } = await supabase
        .from('artist_documents')
        .select('document_type, voyage_embedding')
        .is('voyage_embedding', null);

      const { data: ragDocs } = await supabase
        .from('documents')
        .select('id, voyage_embedding')
        .is('voyage_embedding', null);

      const byType: Record<string, number> = {};
      for (const doc of artistDocs || []) {
        byType[doc.document_type] = (byType[doc.document_type] || 0) + 1;
      }

      return jsonResponse({
        success: true,
        stats: {
          artist_documents_missing_voyage: artistDocs?.length || 0,
          rag_documents_missing_voyage: ragDocs?.length || 0,
          by_document_type: byType,
        },
      });
    }

    if (action === 'embed_artist_documents') {
      let query = supabase
        .from('artist_documents')
        .select('document_id, artist_id, content, document_type')
        .is('voyage_embedding', null)
        .limit(batch_size);

      if (document_type) query = query.eq('document_type', document_type);

      const { data: documents, error: fetchError } = await query;
      if (fetchError) throw new Error(`Fetch failed: ${fetchError.message}`);

      if (!documents?.length) {
        return jsonResponse({ success: true, message: 'No documents need voyage embeddings', processed: 0 });
      }

      let successCount = 0;
      let errorCount = 0;
      const results: any[] = [];

      for (const doc of documents) {
        if (!doc.content || doc.content.length < 10) continue;

        const embResult = await generateVoyageEmbedding(doc.content);

        if (embResult) {
          const embStr = formatEmbeddingForStorage(embResult.embedding);
          const { error: updateError } = await supabase
            .from('artist_documents')
            .update({ voyage_embedding: embStr })
            .eq('document_id', doc.document_id);

          if (updateError) {
            errorCount++;
            results.push({ document_id: doc.document_id, success: false, error: updateError.message });
          } else {
            successCount++;
            results.push({ document_id: doc.document_id, success: true, provider: embResult.provider });
          }
        } else {
          errorCount++;
          results.push({ document_id: doc.document_id, success: false, error: 'Embedding failed' });
        }

        await new Promise(r => setTimeout(r, 100));
      }

      return jsonResponse({
        success: true, processed: documents.length, successful: successCount, errors: errorCount,
        results: results.slice(0, 10),
      });
    }

    if (action === 'embed_rag_documents') {
      const { data: documents, error: fetchError } = await supabase
        .from('documents')
        .select('id, content, title')
        .is('voyage_embedding', null)
        .limit(batch_size);

      if (fetchError) throw new Error(`Fetch failed: ${fetchError.message}`);
      if (!documents?.length) {
        return jsonResponse({ success: true, message: 'No RAG documents need voyage embeddings', processed: 0 });
      }

      let successCount = 0;
      let errorCount = 0;

      for (const doc of documents) {
        if (!doc.content || doc.content.length < 10) continue;

        const embResult = await generateVoyageEmbedding(doc.content);
        if (embResult) {
          const embStr = formatEmbeddingForStorage(embResult.embedding);
          const { error: updateError } = await supabase
            .from('documents')
            .update({ voyage_embedding: embStr })
            .eq('id', doc.id);

          if (updateError) errorCount++;
          else successCount++;
        } else {
          errorCount++;
        }

        await new Promise(r => setTimeout(r, 100));
      }

      return jsonResponse({ success: true, processed: documents.length, successful: successCount, errors: errorCount });
    }

    return errorResponse('Invalid action', 400);
  } catch (error: unknown) {
    console.error('Error in batch-embed-documents:', error);
    return errorResponse(error instanceof Error ? error.message : 'Internal server error');
  }
});
