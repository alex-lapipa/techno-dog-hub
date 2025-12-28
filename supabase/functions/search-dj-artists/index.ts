import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createServiceClient, getRequiredEnv } from "../_shared/supabase.ts";

// Generate embedding using OpenAI
async function generateEmbedding(text: string, openaiKey: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI embedding error:', error);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const openaiKey = Deno.env.get('OPENAI_API_KEY');

  if (!openaiKey) {
    return errorResponse('OPENAI_API_KEY not configured', 500);
  }

  const supabase = createServiceClient();

  try {
    const { query, matchCount = 5, threshold = 0.5 } = await req.json();

    if (!query || typeof query !== 'string') {
      return errorResponse('query string required', 400);
    }

    console.log(`Searching for: "${query}"`);

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query, openaiKey);

    // Call the search function
    const { data, error } = await supabase.rpc('search_dj_artists', {
      query_embedding: queryEmbedding,
      match_count: matchCount,
      similarity_threshold: threshold,
    });

    if (error) {
      console.error('Search error:', error);
      throw error;
    }

    console.log(`Found ${data?.length || 0} matching artists`);

    return jsonResponse({
      success: true,
      query,
      results: data || [],
      count: data?.length || 0,
    });

  } catch (error) {
    console.error('Search error:', error);
    return errorResponse(error instanceof Error ? error.message : 'Unknown error');
  }
});
