/**
 * Shared AI completion logic for RAG functions.
 * Handles system prompt construction, streaming, and non-streaming responses.
 */

import { corsHeaders } from "./cors.ts";

const RAG_SYSTEM_PROMPT = `You are an expert curator of underground techno music with deep knowledge of artists, labels, venues, and the global scene. 

IMPORTANT: You MUST always respond in English, regardless of the language of the user's question. All responses must be in English only.

Your knowledge comes from an authoritative ranking of 100 techno artists scored on underground authenticity, innovation, and scene contribution, plus a curated knowledge base of techno culture.

When answering about artists, use the DJ ARTISTS DATABASE information which includes:
- Rankings (1-100, lower is more influential/authentic)
- Real names, nationalities, years active
- Subgenres they represent
- Labels they've released on
- Key tracks
- What they're known for

Be concise, knowledgeable, and speak with authority about techno culture. Reference specific artists, labels, tracks, and venues when relevant.

If asked about rankings, tiers, or comparisons, base your answers on the provided context. The artists are ranked across dimensions: commitment to underground values, resistance to commercialization, influential tracks, scene contribution, longevity, innovation, and resistance to industry trends.`;

const DEFAULT_MODEL = 'google/gemini-2.5-flash';
const DEFAULT_MAX_TOKENS = 1024;

export interface CompletionOptions {
  query: string;
  context: string;
  apiKey: string;
  stream?: boolean;
  model?: string;
  maxTokens?: number;
}

/** Build the full system prompt with RAG context injected */
export function buildSystemPrompt(context: string): string {
  return `${RAG_SYSTEM_PROMPT}

CONTEXT:
${context || 'No relevant data found. Respond based on general techno knowledge.'}`;
}

/** Call the Lovable AI Gateway and return the raw Response */
export async function callCompletion(options: CompletionOptions): Promise<Response> {
  const {
    query,
    context,
    apiKey,
    stream = true,
    model = DEFAULT_MODEL,
    maxTokens = DEFAULT_MAX_TOKENS,
  } = options;

  const systemPrompt = buildSystemPrompt(context);

  console.log(`Calling Lovable AI with model: ${model}`);

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      stream,
      max_tokens: maxTokens,
    }),
  });

  return response;
}

/** Handle AI gateway error responses with proper status codes */
export function handleCompletionError(aiResponse: Response): Response | null {
  if (aiResponse.ok) return null;

  if (aiResponse.status === 429) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  if (aiResponse.status === 402) {
    return new Response(
      JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
      { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return null; // Let caller handle other errors
}

/** Build a streaming response with metadata prepended */
export function buildStreamingResponse(
  aiResponse: Response,
  artistMeta: unknown[]
): Response {
  const metaEvent = `data: ${JSON.stringify({ type: 'metadata', artists: artistMeta })}\n\n`;
  const metaBytes = new TextEncoder().encode(metaEvent);

  const combinedStream = new ReadableStream({
    async start(controller) {
      controller.enqueue(metaBytes);

      const reader = aiResponse.body!.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(combinedStream, {
    headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
  });
}

/** Parse a non-streaming AI response into structured data */
export async function parseNonStreamingResponse(
  aiResponse: Response,
  documents: Array<{ title: string; source?: string }>,
  artists: Array<{ artist_name: string; rank: number }>
): Promise<{ answer: string; sources: unknown[]; artists: unknown[] }> {
  const data = await aiResponse.json();
  const answer = data.choices?.[0]?.message?.content || '';
  const sources = documents.map((d) => ({ title: d.title, source: d.source }));
  const artistList = artists.map((a) => ({ name: a.artist_name, rank: a.rank }));

  return { answer, sources, artists: artistList };
}
