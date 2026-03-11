import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { generateVoyageEmbedding } from "../_shared/voyage-embeddings.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { text } = await req.json();
    
    if (!text || typeof text !== 'string') {
      return errorResponse('Text is required', 400);
    }
    
    if (text.length > 10000) {
      return errorResponse('Text exceeds maximum length of 10000 characters', 400);
    }

    console.log('Generating Voyage 1024d embedding for text of length:', text.length);

    const result = await generateVoyageEmbedding(text.trim());

    if (!result) {
      throw new Error('Embedding generation failed — both Voyage and OpenAI fallback unavailable');
    }

    console.log(`Generated ${result.dimensions}d embedding via ${result.provider}`);

    return jsonResponse({
      embedding: result.embedding,
      provider: result.provider,
      dimensions: result.dimensions,
    }, { 'Cache-Control': 'private, max-age=86400' });
  } catch (error: unknown) {
    console.error('Error in generate-embedding:', error);
    return errorResponse(error instanceof Error ? error.message : 'Unknown error');
  }
});
