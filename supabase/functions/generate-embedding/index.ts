import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { getRequiredEnv } from "../_shared/supabase.ts";

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { text } = await req.json();
    
    if (!text || typeof text !== 'string') {
      return errorResponse('Text is required', 400);
    }
    
    // Security: Limit text length to prevent resource exhaustion
    if (text.length > 10000) {
      return errorResponse('Text exceeds maximum length of 10000 characters', 400);
    }
    
    const sanitizedText = text.trim().slice(0, 10000);

    const OPENAI_API_KEY = getRequiredEnv('OPENAI_API_KEY');

    console.log('Generating embedding for text of length:', sanitizedText.length);

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: sanitizedText,
        dimensions: 768
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI Embedding API error:', response.status, errorText);
      
      if (response.status === 429) {
        return errorResponse('Rate limit exceeded', 429);
      }
      
      throw new Error(`Embedding generation failed: ${errorText}`);
    }

    const data = await response.json();
    const embedding = data.data?.[0]?.embedding;

    if (!embedding) {
      throw new Error('No embedding returned from API');
    }

    console.log('Generated embedding with', embedding.length, 'dimensions');

    return jsonResponse({ embedding });
  } catch (error: unknown) {
    console.error('Error in generate-embedding:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(message);
  }
});
