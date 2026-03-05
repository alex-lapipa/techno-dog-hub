import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";
import { verifyAdminAccess } from "../_shared/security.ts";
import { createLogger } from "../_shared/logger.ts";
import { generateVoyageBatchEmbeddings, formatEmbeddingForStorage } from "../_shared/voyage-embeddings.ts";

// Split text into chunks with overlap
function chunkText(text: string, chunkSize = 1500, overlap = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }
  return chunks;
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const logger = createLogger('ingest-documents');

  try {
    // Admin verification via shared security module
    const adminResult = await verifyAdminAccess(req, logger);
    if (!adminResult.isAdmin) {
      const status = adminResult.error?.includes('Authorization') ? 401 : 403;
      return errorResponse(adminResult.error || 'Admin access required', status);
    }

    logger.info('Admin verified', { email: adminResult.email });

    const { documents, generateEmbeddings = true } = await req.json();

    if (!documents || !Array.isArray(documents)) {
      return errorResponse('Documents array is required', 400);
    }

    const supabase = createServiceClient();
    const results: { title: string; chunk: number; id: string; hasEmbedding: boolean; provider?: string }[] = [];
    let embeddingsGenerated = 0;

    for (const doc of documents) {
      const { title, content, source, metadata = {} } = doc;
      if (!title || !content) {
        logger.warn('Skipping document with missing title or content');
        continue;
      }

      const chunks = chunkText(content);
      logger.info(`Processing "${title}" — ${chunks.length} chunks`);

      // Batch-generate Voyage 1024d embeddings for all chunks at once
      let chunkEmbeddings: (ReturnType<typeof formatEmbeddingForStorage> | null)[] = chunks.map(() => null);
      let embeddingProvider = 'none';

      if (generateEmbeddings) {
        const batchResult = await generateVoyageBatchEmbeddings(chunks);
        if (batchResult) {
          embeddingProvider = batchResult.provider;
          chunkEmbeddings = batchResult.embeddings.map(e => formatEmbeddingForStorage(e.embedding));
          logger.info(`Generated ${batchResult.embeddings.length} embeddings via ${embeddingProvider}`, {
            tokens: batchResult.total_tokens,
          });
        } else {
          logger.warn(`Embedding generation failed for "${title}"`);
        }
      }

      // Insert chunks sequentially (order matters for chunk_index)
      for (let i = 0; i < chunks.length; i++) {
        const embeddingStr = chunkEmbeddings[i] || null;

        const { data, error } = await supabase
          .from('documents')
          .insert({
            title: chunks.length > 1 ? `${title} (${i + 1}/${chunks.length})` : title,
            content: chunks[i],
            source,
            voyage_embedding: embeddingStr,
            metadata: { ...metadata, original_title: title, chunk_index: i, total_chunks: chunks.length },
            chunk_index: i,
          })
          .select('id')
          .single();

        if (error) {
          logger.error(`Error inserting chunk ${i} of "${title}"`, { error: error.message });
        } else {
          const hasEmb = !!embeddingStr;
          if (hasEmb) embeddingsGenerated++;
          results.push({ title, chunk: i, id: data.id, hasEmbedding: hasEmb, provider: embeddingProvider });
        }
      }
    }

    logger.info(`Ingested ${results.length} chunks, ${embeddingsGenerated} with embeddings`);

    return jsonResponse({
      success: true,
      ingested: results.length,
      embeddingsGenerated,
      results,
    }, { 'Cache-Control': 'no-store' });
  } catch (error: unknown) {
    logger.error('Ingest error', { error: (error as Error).message });
    return errorResponse((error as Error).message || 'Unknown error');
  }
});
