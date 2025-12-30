// AI utility functions for edge functions

const OPENAI_EMBEDDING_MODEL = 'text-embedding-3-small';
const OPENAI_EMBEDDING_DIMENSIONS = 1536;
const MAX_EMBEDDING_TEXT_LENGTH = 8000;

// Generate embeddings using OpenAI API
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

// Generate chat completion using OpenAI API
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
    apiKey,
  } = options;

  const openaiKey = apiKey || Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiKey) {
    console.error('Missing OPENAI_API_KEY');
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
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI chat error:', error);
      return null;
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('Error generating chat completion:', error);
    return null;
  }
}

// Stream chat completion (returns ReadableStream)
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
    apiKey,
  } = options;

  const openaiKey = apiKey || Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiKey) {
    console.error('Missing OPENAI_API_KEY');
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
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI stream error:', error);
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
