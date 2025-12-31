// AI utility functions for edge functions
// 
// ARCHITECTURE NOTE (2025-01):
// - Embeddings: Use this file (OpenAI text-embedding-3-small)
// - Chat/Completions: Use lovable-ai.ts (Lovable AI Gateway)
// - This file maintains backwards compatibility by routing chat through the gateway

const OPENAI_EMBEDDING_MODEL = 'text-embedding-3-small';
const OPENAI_EMBEDDING_DIMENSIONS = 1536;
const MAX_EMBEDDING_TEXT_LENGTH = 8000;

// Lovable AI Gateway for chat completions (unified routing)
const LOVABLE_AI_GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions';

// Generate embeddings using OpenAI API (primary use case for this file)
export async function generateEmbedding(
  text: string,
  apiKey?: string
): Promise<number[] | null> {
  const openaiKey = apiKey || Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiKey) {
    console.error('Missing OPENAI_API_KEY');
    return null;
  }

  // Truncate text if too long
  const truncatedText = text.slice(0, MAX_EMBEDDING_TEXT_LENGTH);

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_EMBEDDING_MODEL,
        input: truncatedText,
        dimensions: OPENAI_EMBEDDING_DIMENSIONS,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI embedding error:', error);
      return null;
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return null;
  }
}

/**
 * Generate chat completion - NOW ROUTES THROUGH LOVABLE AI GATEWAY
 * @deprecated Prefer importing from lovable-ai.ts for new code
 * This function is maintained for backwards compatibility
 */
export async function generateChatCompletion(
  messages: Array<{ role: string; content: string }>,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    apiKey?: string;
  } = {}
): Promise<string | null> {
  const {
    model = 'google/gemini-2.5-flash',
    temperature = 0.7,
    maxTokens = 1000,
  } = options;

  // Route through Lovable AI Gateway for unified billing and routing
  const lovableKey = Deno.env.get('LOVABLE_API_KEY');
  
  if (lovableKey) {
    try {
      const response = await fetch(LOVABLE_AI_GATEWAY, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Lovable AI Gateway error:', response.status, error);
        // Fall through to OpenAI fallback
      } else {
        const data = await response.json();
        return data.choices[0]?.message?.content || null;
      }
    } catch (error) {
      console.error('Lovable AI Gateway error, falling back to OpenAI:', error);
    }
  }

  // Fallback to direct OpenAI if gateway unavailable
  const openaiKey = options.apiKey || Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiKey) {
    console.error('No API key available (LOVABLE_API_KEY or OPENAI_API_KEY)');
    return null;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model.startsWith('google/') ? 'gpt-4o-mini' : model, // Map Gemini to GPT for fallback
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI fallback error:', error);
      return null;
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('Error generating chat completion:', error);
    return null;
  }
}

/**
 * Stream chat completion - NOW ROUTES THROUGH LOVABLE AI GATEWAY
 * @deprecated Prefer importing from lovable-ai.ts for new code
 * This function is maintained for backwards compatibility
 */
export async function streamChatCompletion(
  messages: Array<{ role: string; content: string }>,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    apiKey?: string;
  } = {}
): Promise<ReadableStream | null> {
  const {
    model = 'google/gemini-2.5-flash',
    temperature = 0.7,
    maxTokens = 1000,
  } = options;

  // Route through Lovable AI Gateway for unified billing and routing
  const lovableKey = Deno.env.get('LOVABLE_API_KEY');
  
  if (lovableKey) {
    try {
      const response = await fetch(LOVABLE_AI_GATEWAY, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: true,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Lovable AI Gateway stream error:', response.status, error);
        // Fall through to OpenAI fallback
      } else {
        return response.body;
      }
    } catch (error) {
      console.error('Lovable AI Gateway error, falling back to OpenAI:', error);
    }
  }

  // Fallback to direct OpenAI if gateway unavailable
  const openaiKey = options.apiKey || Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiKey) {
    console.error('No API key available (LOVABLE_API_KEY or OPENAI_API_KEY)');
    return null;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model.startsWith('google/') ? 'gpt-4o-mini' : model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI stream fallback error:', error);
      return null;
    }

    return response.body;
  } catch (error) {
    console.error('Error streaming chat completion:', error);
    return null;
  }
}

// Sanitize text for embedding (remove special chars, normalize whitespace)
export function sanitizeTextForEmbedding(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s.,!?-]/g, '')
    .trim()
    .slice(0, MAX_EMBEDDING_TEXT_LENGTH);
}

// Chunk text into smaller pieces for embedding
export function chunkText(
  text: string,
  chunkSize = 1000,
  overlap = 100
): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;
    if (start >= text.length) break;
  }

  return chunks;
}
