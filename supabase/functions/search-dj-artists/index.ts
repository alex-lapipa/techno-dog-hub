import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";
import { generateVoyageEmbedding, formatEmbeddingForStorage } from "../_shared/voyage-embeddings.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const supabase = createServiceClient();

  try {
    const { query, matchCount = 5, threshold = 0.5 } = await req.json();

    if (!query || typeof query !== 'string') {
      return errorResponse('query string required', 400);
    }

    console.log(`Searching for: "${query}"`);

    // Generate Voyage 1024d embedding for query
    const embResult = await generateVoyageEmbedding(query);
    if (!embResult) {
      return errorResponse('Failed to generate query embedding', 500);
    }

    const embeddingStr = formatEmbeddingForStorage(embResult.embedding);

    // Search using voyage_embedding column
    const { data, error } = await supabase.rpc('search_dj_artists_voyage', {
      query_embedding: embeddingStr,
      match_count: matchCount,
      similarity_threshold: threshold,
    });

    if (error) {
      console.error('Search error:', error);
      throw error;
    }

    console.log(`Found ${data?.length || 0} matching artists via ${embResult.provider}`);

    return jsonResponse({
      success: true,
      query,
      results: data || [],
      count: data?.length || 0,
      provider: embResult.provider,
    }, { 'Cache-Control': 'public, max-age=300' });

  } catch (error) {
    console.error('Search error:', error);
    return errorResponse(error instanceof Error ? error.message : 'Unknown error');
  }
});
