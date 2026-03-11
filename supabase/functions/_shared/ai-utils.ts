// AI utility functions for edge functions
// 
// ARCHITECTURE NOTE (2025-03):
// - Embeddings: Use voyage-embeddings.ts (Voyage-3-large 1024d primary, OpenAI fallback)
// - Chat/Completions: Use lovable-ai.ts (Lovable AI Gateway)
// - This file re-exports embedding functions for backwards compatibility

import { generateVoyageEmbedding, formatEmbeddingForStorage } from './voyage-embeddings.ts';

const MAX_EMBEDDING_TEXT_LENGTH = 8000;

// Lovable AI Gateway for chat completions (unified routing)
const LOVABLE_AI_GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions';

/**
 * Generate embedding using unified Voyage pipeline (1024d).
 * @deprecated Import from voyage-embeddings.ts directly for new code.
 */
export async function generateEmbedding(
  text: string,
  _apiKey?: string
): Promise<number[] | null> {
  const result = await generateVoyageEmbedding(text.slice(0, MAX_EMBEDDING_TEXT_LENGTH));
  return result ? result.embedding : null;
}

/**
 * Generate chat completion - NOW ROUTES THROUGH LOVABLE AI GATEWAY
 * @deprecated Prefer importing from lovable-ai.ts for new code
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

  const lovableKey = Deno.env.get('LOVABLE_API_KEY');
  
  if (lovableKey) {
    try {
      const response = await fetch(LOVABLE_AI_GATEWAY, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0]?.message?.content || null;
      }
      console.error('Lovable AI Gateway error:', response.status);
    } catch (error) {
      console.error('Lovable AI Gateway error, falling back:', error);
    }
  }

  const openaiKey = options.apiKey || Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) {
    console.error('No API key available');
    return null;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model.startsWith('google/') ? 'gpt-4o-mini' : model,
        messages, temperature, max_tokens: maxTokens,
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.choices[0]?.message?.content || null;
  } catch {
    return null;
  }
}

/**
 * Stream chat completion - NOW ROUTES THROUGH LOVABLE AI GATEWAY
 * @deprecated Prefer importing from lovable-ai.ts for new code
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

  const lovableKey = Deno.env.get('LOVABLE_API_KEY');
  
  if (lovableKey) {
    try {
      const response = await fetch(LOVABLE_AI_GATEWAY, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${lovableKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens, stream: true }),
      });
      if (response.ok) return response.body;
    } catch (error) {
      console.error('Gateway stream error:', error);
    }
  }

  const openaiKey = options.apiKey || Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) return null;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model.startsWith('google/') ? 'gpt-4o-mini' : model,
        messages, temperature, max_tokens: maxTokens, stream: true,
      }),
    });
    if (!response.ok) return null;
    return response.body;
  } catch {
    return null;
  }
}

export function sanitizeTextForEmbedding(text: string): string {
  return text.replace(/\s+/g, ' ').replace(/[^\\w\\s.,!?-]/g, '').trim().slice(0, MAX_EMBEDDING_TEXT_LENGTH);
}

export function chunkText(text: string, chunkSize = 1000, overlap = 100): string[] {
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
