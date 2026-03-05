/**
 * Voyage AI Embedding Utility for techno.dog
 * 
 * Centralized embedding generation using Voyage AI voyage-3-large model.
 * Standardizes all embeddings to 1024 dimensions across the platform.
 * Includes OpenAI text-embedding-3-small fallback for resilience.
 * 
 * Architecture:
 * - Primary: Voyage AI voyage-3-large @ 1024d (Matryoshka)
 * - Fallback: OpenAI text-embedding-3-small @ 1024d (dimension-matched)
 * - All tables unified to vector(1024) via voyage_embedding columns
 */

// === Configuration ===
const VOYAGE_API_URL = 'https://api.voyageai.com/v1/embeddings';
const VOYAGE_MODEL = 'voyage-3-large';
const VOYAGE_DIMENSIONS = 1024;
const MAX_TEXT_LENGTH = 8000;
const MAX_BATCH_SIZE = 20; // Voyage supports up to 128 inputs, but we limit for safety

// OpenAI fallback config (dimension-matched to Voyage)
const OPENAI_API_URL = 'https://api.openai.com/v1/embeddings';
const OPENAI_MODEL = 'text-embedding-3-small';
const OPENAI_FALLBACK_DIMENSIONS = 1024;

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  dimensions: number;
  provider: 'voyage' | 'openai';
}

export interface BatchEmbeddingResult {
  embeddings: EmbeddingResult[];
  model: string;
  provider: 'voyage' | 'openai';
  total_tokens?: number;
}

/**
 * Generate a single embedding using Voyage AI with OpenAI fallback.
 * Returns null only if both providers fail.
 */
export async function generateVoyageEmbedding(
  text: string,
  options?: { skipFallback?: boolean }
): Promise<EmbeddingResult | null> {
  const result = await generateVoyageBatchEmbeddings([text], options);
  if (!result || result.embeddings.length === 0) return null;
  return result.embeddings[0];
}

/**
 * Generate batch embeddings using Voyage AI with OpenAI fallback.
 * Supports up to MAX_BATCH_SIZE inputs per call.
 */
export async function generateVoyageBatchEmbeddings(
  texts: string[],
  options?: { skipFallback?: boolean }
): Promise<BatchEmbeddingResult | null> {
  if (!texts.length) return null;

  // Sanitize and truncate inputs
  const sanitizedTexts = texts.map(t => t.trim().slice(0, MAX_TEXT_LENGTH));
  const batch = sanitizedTexts.slice(0, MAX_BATCH_SIZE);

  // Try Voyage AI first
  const voyageKey = Deno.env.get('VOYAGE_API_KEY');
  if (voyageKey) {
    try {
      const result = await callVoyageAPI(batch, voyageKey);
      if (result) return result;
    } catch (err) {
      console.error('[voyage-embeddings] Voyage API error:', err);
    }
  } else {
    console.warn('[voyage-embeddings] VOYAGE_API_KEY not configured');
  }

  // Fallback to OpenAI (dimension-matched to 1024)
  if (options?.skipFallback) {
    console.error('[voyage-embeddings] Voyage failed and fallback disabled');
    return null;
  }

  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) {
    console.error('[voyage-embeddings] No fallback: OPENAI_API_KEY not configured');
    return null;
  }

  try {
    return await callOpenAIFallback(batch, openaiKey);
  } catch (err) {
    console.error('[voyage-embeddings] OpenAI fallback error:', err);
    return null;
  }
}

/**
 * Format embedding array for Supabase vector column storage.
 */
export function formatEmbeddingForStorage(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}

/**
 * Get the standard embedding dimensions used across the platform.
 */
export function getVoyageDimensions(): number {
  return VOYAGE_DIMENSIONS;
}

// === Internal API callers ===

async function callVoyageAPI(
  texts: string[],
  apiKey: string
): Promise<BatchEmbeddingResult | null> {
  const response = await fetch(VOYAGE_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: VOYAGE_MODEL,
      input: texts,
      output_dimension: VOYAGE_DIMENSIONS,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[voyage-embeddings] Voyage API ${response.status}:`, errorText);
    
    // Rate limit — don't fallback, let caller retry
    if (response.status === 429) {
      throw new Error(`Voyage rate limited: ${errorText}`);
    }
    return null;
  }

  const data = await response.json();
  const embeddings: EmbeddingResult[] = (data.data || []).map((item: any) => ({
    embedding: item.embedding,
    model: VOYAGE_MODEL,
    dimensions: VOYAGE_DIMENSIONS,
    provider: 'voyage' as const,
  }));

  return {
    embeddings,
    model: VOYAGE_MODEL,
    provider: 'voyage',
    total_tokens: data.usage?.total_tokens,
  };
}

async function callOpenAIFallback(
  texts: string[],
  apiKey: string
): Promise<BatchEmbeddingResult | null> {
  console.log('[voyage-embeddings] Falling back to OpenAI at 1024d');
  
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: texts,
      dimensions: OPENAI_FALLBACK_DIMENSIONS, // Match Voyage dimensions
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[voyage-embeddings] OpenAI fallback ${response.status}:`, errorText);
    return null;
  }

  const data = await response.json();
  const embeddings: EmbeddingResult[] = (data.data || []).map((item: any) => ({
    embedding: item.embedding,
    model: OPENAI_MODEL,
    dimensions: OPENAI_FALLBACK_DIMENSIONS,
    provider: 'openai' as const,
  }));

  return {
    embeddings,
    model: OPENAI_MODEL,
    provider: 'openai',
    total_tokens: data.usage?.total_tokens,
  };
}
