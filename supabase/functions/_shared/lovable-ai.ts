// Lovable AI Gateway utilities
// Uses the pre-configured LOVABLE_API_KEY secret

const LOVABLE_AI_GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemini-2.5-flash';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

// Get Lovable AI API key from environment
export function getLovableApiKey(): string {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) {
    throw new Error('LOVABLE_API_KEY is not configured');
  }
  return apiKey;
}

// Generate chat completion using Lovable AI Gateway
export async function generateChatCompletion(
  messages: ChatMessage[],
  options: ChatCompletionOptions = {}
): Promise<string | null> {
  const {
    model = DEFAULT_MODEL,
    temperature = 0.7,
    maxTokens = 1000,
    stream = false,
  } = options;

  const apiKey = getLovableApiKey();

  try {
    const response = await fetch(LOVABLE_AI_GATEWAY, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Lovable AI error:', response.status, error);
      return null;
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('Error generating chat completion:', error);
    return null;
  }
}

// Stream chat completion using Lovable AI Gateway
export async function streamChatCompletion(
  messages: ChatMessage[],
  options: ChatCompletionOptions = {}
): Promise<Response | null> {
  const {
    model = DEFAULT_MODEL,
    temperature = 0.7,
    maxTokens = 1000,
  } = options;

  const apiKey = getLovableApiKey();

  try {
    const response = await fetch(LOVABLE_AI_GATEWAY, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(
          JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        console.error('Payment required');
        return new Response(
          JSON.stringify({ error: 'Payment required, please add funds.' }),
          { status: 402, headers: { 'Content-Type': 'application/json' } }
        );
      }
      const error = await response.text();
      console.error('Lovable AI stream error:', error);
      return null;
    }

    return response;
  } catch (error) {
    console.error('Error streaming chat completion:', error);
    return null;
  }
}

// Generate completion with function/tool calling for structured output
export async function generateWithTools(
  messages: ChatMessage[],
  tools: any[],
  options: ChatCompletionOptions & { toolChoice?: any } = {}
): Promise<any | null> {
  const {
    model = DEFAULT_MODEL,
    temperature = 0.7,
    maxTokens = 1000,
    toolChoice,
  } = options;

  const apiKey = getLovableApiKey();

  try {
    const body: any = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      tools,
    };

    if (toolChoice) {
      body.tool_choice = toolChoice;
    }

    const response = await fetch(LOVABLE_AI_GATEWAY, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Lovable AI tools error:', response.status, error);
      return null;
    }

    const data = await response.json();
    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      return JSON.parse(toolCall.function.arguments);
    }
    
    return data.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('Error generating with tools:', error);
    return null;
  }
}
