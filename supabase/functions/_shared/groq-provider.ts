/**
 * Groq LPU Provider for Ultra-Fast Inference
 * Target: sub-100ms latency for simple queries
 * 
 * READ-ONLY: This module only makes AI calls, never writes to database
 */

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqResponse {
  choices: Array<{
    message: { content: string };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

export interface GroqResult {
  content: string;
  latencyMs: number;
  tokens: number;
  model: string;
}

export interface GroqOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}

const DEFAULT_OPTIONS: GroqOptions = {
  model: 'llama-3.3-70b-versatile',
  maxTokens: 500,
  temperature: 0.7,
  timeoutMs: 5000
};

/**
 * Check if Groq is available (API key configured)
 */
export function isGroqAvailable(): boolean {
  return !!Deno.env.get('GROQ_API_KEY');
}

/**
 * Call Groq API for ultra-fast inference
 * Returns null if Groq unavailable or times out (fallback should be used)
 */
export async function callGroq(
  messages: GroqMessage[],
  options: GroqOptions = {}
): Promise<GroqResult | null> {
  const {
    model = DEFAULT_OPTIONS.model,
    maxTokens = DEFAULT_OPTIONS.maxTokens,
    temperature = DEFAULT_OPTIONS.temperature,
    timeoutMs = DEFAULT_OPTIONS.timeoutMs
  } = options;

  const groqApiKey = Deno.env.get('GROQ_API_KEY');
  if (!groqApiKey) {
    console.log('[Groq] API key not configured, skipping');
    return null;
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    console.log(`[Groq] Calling ${model} with ${messages.length} messages`);
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`[Groq] API error: ${response.status} - ${errorText}`);
      return null;
    }

    const data: GroqResponse = await response.json();
    const content = data.choices[0]?.message?.content || '';
    const tokens = data.usage?.total_tokens || 0;

    console.log(`[Groq] Success in ${latencyMs}ms, ${tokens} tokens, model: ${data.model}`);
    
    return { 
      content, 
      latencyMs, 
      tokens,
      model: data.model 
    };

  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn(`[Groq] Timeout after ${timeoutMs}ms, will fallback`);
    } else {
      console.error('[Groq] Error:', error);
    }
    
    return null;
  }
}

/**
 * Call Groq with automatic fallback to Lovable AI
 */
export async function callGroqWithFallback(
  messages: GroqMessage[],
  options: GroqOptions = {},
  fallbackFn: (messages: GroqMessage[]) => Promise<string | null>
): Promise<{ content: string; provider: 'groq' | 'lovable-ai'; latencyMs: number }> {
  const startTime = Date.now();
  
  // Try Groq first
  const groqResult = await callGroq(messages, options);
  
  if (groqResult?.content) {
    return {
      content: groqResult.content,
      provider: 'groq',
      latencyMs: groqResult.latencyMs
    };
  }
  
  // Fallback to Lovable AI
  console.log('[Groq] Falling back to Lovable AI');
  const fallbackContent = await fallbackFn(messages);
  const latencyMs = Date.now() - startTime;
  
  if (!fallbackContent) {
    throw new Error('Both Groq and fallback failed');
  }
  
  return {
    content: fallbackContent,
    provider: 'lovable-ai',
    latencyMs
  };
}
