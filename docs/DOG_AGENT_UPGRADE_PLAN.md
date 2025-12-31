# Dog Agent Upgrade Plan
## Surgical Upgrade Blueprint for Multi-Model Orchestration

**Version:** 1.0  
**Date:** 2025-12-31  
**Status:** Ready for Implementation

---

## A) Upgrade Overview

### What Changes
| Component | Current State | After Upgrade |
|-----------|--------------|---------------|
| **GPT-5 Integration** | ✅ Already using `openai/gpt-5` for complex queries | Enhanced with explicit tier labeling |
| **Ultra-Fast Provider** | Uses `gemini-2.5-flash-lite` | Add Groq LPU as Tier 0 for sub-100ms responses |
| **SSE Streaming** | Partial (in `rag-chat`) | Full streaming in `dog-agent` with token-by-token delivery |
| **Voice Input (STT)** | ElevenLabs Scribe in `dog-transcribe` | Enhanced with real-time Scribe v2 |
| **Model Orchestration** | 3-tier pattern-based routing | 4-tier intelligent router with observability |

### What Stays Untouched
- ✅ Existing chat UI in `DogChat.tsx`
- ✅ Voice output (TTS) via ElevenLabs 
- ✅ RAG knowledge pipeline
- ✅ Database schema & analytics events
- ✅ Circuit breaker pattern in `_shared/circuit-breaker.ts`
- ✅ Conversation history format

### Expected Improvements
| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| **Simple Query Latency** | ~800ms | <100ms | 8x faster |
| **Complex Reasoning Quality** | Good | Excellent | GPT-5 for all complex |
| **Streaming UX** | No streaming | Token-by-token | Immediate feedback |
| **Voice Input** | Works | Enhanced VAD | Better accuracy |
| **Observability** | Basic logging | Full metrics | Complete visibility |

### High-Level Phased Rollout
```
Phase 0: Infrastructure (1 day)
├── Add shared router module
├── Add observability schema
└── Feature flags

Phase 1: GPT-5 + Groq Integration (2 days)
├── Add Groq provider
├── Update model routing
└── Fallback chains

Phase 2: SSE Streaming (2 days)
├── Backend streaming endpoint
├── Frontend consumer
└── Abort/cancel handling

Phase 3: Enhanced Voice STT (1 day)
├── Upgrade to Scribe v2
├── Real-time transcription
└── Better VAD
```

---

## B) Exact Implementation Plan (Phased)

### Phase 0: Infrastructure Foundation

**Milestone:** Observability + Feature Flags  
**Duration:** 1 day  
**Dependencies:** None  
**Rollback:** Delete new files, remove migration

#### Step 0.1: Add Feature Flags Table
```sql
-- Migration: Add dog_agent_config table for feature flags
CREATE TABLE IF NOT EXISTS public.dog_agent_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  use_groq_for_simple BOOLEAN DEFAULT false,
  use_streaming BOOLEAN DEFAULT false,
  use_gpt5_for_complex BOOLEAN DEFAULT true,
  groq_enabled BOOLEAN DEFAULT false,
  groq_timeout_ms INTEGER DEFAULT 5000,
  max_tokens_simple INTEGER DEFAULT 500,
  max_tokens_balanced INTEGER DEFAULT 1500,
  max_tokens_complex INTEGER DEFAULT 2500,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default config
INSERT INTO public.dog_agent_config (id) VALUES ('default')
ON CONFLICT (id) DO NOTHING;
```

#### Step 0.2: Add Observability Events Schema
```sql
-- Migration: Add model routing telemetry columns
ALTER TABLE public.analytics_events 
ADD COLUMN IF NOT EXISTS model_selected TEXT,
ADD COLUMN IF NOT EXISTS model_tier TEXT,
ADD COLUMN IF NOT EXISTS latency_ms INTEGER,
ADD COLUMN IF NOT EXISTS token_count INTEGER,
ADD COLUMN IF NOT EXISTS provider TEXT,
ADD COLUMN IF NOT EXISTS routing_reason TEXT;

-- Create index for model analytics
CREATE INDEX IF NOT EXISTS idx_analytics_model_tier 
ON public.analytics_events (model_tier, created_at DESC)
WHERE event_type = 'dog_agent_chat';
```

#### Step 0.3: Create Shared Router Module
**File:** `supabase/functions/_shared/model-router.ts`

```typescript
/**
 * Intelligent Model Router for Dog Agent
 * 4-Tier routing with Groq, Gemini, GPT-5
 */

export type ModelTier = 'ultra-fast' | 'fast' | 'balanced' | 'complex';

export interface RoutingDecision {
  tier: ModelTier;
  model: string;
  provider: 'groq' | 'lovable-ai';
  maxTokens: number;
  temperature: number;
  reason: string;
  fallbacks: string[];
}

export interface RouterConfig {
  useGroq: boolean;
  groqTimeoutMs: number;
  maxTokens: {
    ultraFast: number;
    fast: number;
    balanced: number;
    complex: number;
  };
}

const DEFAULT_CONFIG: RouterConfig = {
  useGroq: false,
  groqTimeoutMs: 5000,
  maxTokens: {
    ultraFast: 300,
    fast: 500,
    balanced: 1500,
    complex: 2500
  }
};

// Pattern matchers for query classification
const COMPLEX_PATTERNS = [
  /compare|versus|vs\.?|difference between|similarities/i,
  /explain|analyze|breakdown|deep dive|in-depth/i,
  /why|how does|what makes|philosophy|theory/i,
  /history of|evolution of|origins of|trajectory/i,
  /recommend.*based on|suggest.*considering|if i like/i,
  /relationship between|connection|influence.*on/i,
  /controversial|debate|opinion|perspective/i,
  /technical|mechanism|architecture|design of/i,
  /predict|future|trend|where.*heading/i,
  /best|worst|top.*reason|rank.*why/i
];

const SIMPLE_PATTERNS = [
  /^(hi|hello|hey|yo|sup|what'?s up|woof)/i,
  /^(thanks|thank you|thx|cheers)/i,
  /^(yes|no|ok|okay|sure|cool|nice)/i,
  /^who is [a-z\s]+\??$/i,
  /^what is [a-z\s]+\??$/i,
  /^when (is|was|did)/i,
  /^where (is|was|are)/i,
  /^list |^name /i,
];

export function classifyQuery(
  query: string,
  conversationDepth: number = 0
): { tier: ModelTier; reason: string } {
  const wordCount = query.trim().split(/\s+/).length;
  
  // Check for complex patterns first
  const matchedComplex = COMPLEX_PATTERNS.find(p => p.test(query));
  if (matchedComplex) {
    return { tier: 'complex', reason: 'complex_pattern_match' };
  }
  
  // Long queries or deep conversations = complex
  if (wordCount > 20 || conversationDepth > 4) {
    return { tier: 'complex', reason: wordCount > 20 ? 'long_query' : 'deep_conversation' };
  }
  
  // Check for simple patterns
  const matchedSimple = SIMPLE_PATTERNS.find(p => p.test(query));
  if (matchedSimple && wordCount <= 8) {
    return { tier: 'ultra-fast', reason: 'simple_pattern_match' };
  }
  
  // Very short = fast
  if (wordCount <= 5) {
    return { tier: 'fast', reason: 'short_query' };
  }
  
  // Default to balanced
  return { tier: 'balanced', reason: 'default' };
}

export function getRoutingDecision(
  query: string,
  conversationDepth: number = 0,
  config: RouterConfig = DEFAULT_CONFIG
): RoutingDecision {
  const classification = classifyQuery(query, conversationDepth);
  
  switch (classification.tier) {
    case 'ultra-fast':
      return {
        tier: 'ultra-fast',
        model: config.useGroq ? 'llama-3.3-70b-versatile' : 'google/gemini-2.5-flash-lite',
        provider: config.useGroq ? 'groq' : 'lovable-ai',
        maxTokens: config.maxTokens.ultraFast,
        temperature: 0.7,
        reason: classification.reason,
        fallbacks: config.useGroq 
          ? ['google/gemini-2.5-flash-lite', 'openai/gpt-5-nano']
          : ['openai/gpt-5-nano']
      };
      
    case 'fast':
      return {
        tier: 'fast',
        model: 'google/gemini-2.5-flash-lite',
        provider: 'lovable-ai',
        maxTokens: config.maxTokens.fast,
        temperature: 0.8,
        reason: classification.reason,
        fallbacks: ['openai/gpt-5-nano', 'google/gemini-2.5-flash']
      };
      
    case 'balanced':
      return {
        tier: 'balanced',
        model: 'google/gemini-2.5-flash',
        provider: 'lovable-ai',
        maxTokens: config.maxTokens.balanced,
        temperature: 0.8,
        reason: classification.reason,
        fallbacks: ['openai/gpt-5-mini', 'google/gemini-2.5-flash-lite']
      };
      
    case 'complex':
      return {
        tier: 'complex',
        model: 'openai/gpt-5',
        provider: 'lovable-ai',
        maxTokens: config.maxTokens.complex,
        temperature: 0.7,
        reason: classification.reason,
        fallbacks: ['google/gemini-2.5-pro', 'openai/gpt-5-mini']
      };
  }
}

// Example classifications for testing
export const EXAMPLE_CLASSIFICATIONS = [
  { query: "hi", expected: "ultra-fast", reason: "greeting" },
  { query: "who is Jeff Mills?", expected: "ultra-fast", reason: "simple_who_is" },
  { query: "thanks for the info!", expected: "ultra-fast", reason: "thanks" },
  { query: "What gear does Surgeon use?", expected: "fast", reason: "short_factual" },
  { query: "Tell me about Berghain", expected: "fast", reason: "simple_about" },
  { query: "What are some good techno labels?", expected: "balanced", reason: "list_request" },
  { query: "Can you recommend some artists similar to DVS1?", expected: "balanced", reason: "recommendation" },
  { query: "Compare the sound design philosophy of Jeff Mills versus Robert Hood", expected: "complex", reason: "comparison" },
  { query: "Explain the evolution of Detroit techno from its origins in the 1980s to today", expected: "complex", reason: "historical_analysis" },
  { query: "Why is the TB-303 so important to acid techno and how does it create that distinctive sound?", expected: "complex", reason: "technical_why" },
];
```

---

### Phase 1: GPT-5 + Groq Integration

**Milestone:** 4-Tier Model Routing with Groq  
**Duration:** 2 days  
**Dependencies:** Phase 0 complete  
**Rollback:** Set `groq_enabled = false` in config

#### Step 1.1: Add Groq Secret
```
Secret Name: GROQ_API_KEY
```

#### Step 1.2: Create Groq Provider Module
**File:** `supabase/functions/_shared/groq-provider.ts`

```typescript
/**
 * Groq LPU Provider for Ultra-Fast Inference
 * Target: sub-100ms latency for simple queries
 */

export interface GroqResponse {
  choices: Array<{
    message: { content: string };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

export async function callGroq(
  messages: Array<{ role: string; content: string }>,
  options: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    timeoutMs?: number;
  } = {}
): Promise<{ content: string; latencyMs: number; tokens: number } | null> {
  const {
    model = 'llama-3.3-70b-versatile',
    maxTokens = 500,
    temperature = 0.7,
    timeoutMs = 5000
  } = options;

  const groqApiKey = Deno.env.get('GROQ_API_KEY');
  if (!groqApiKey) {
    console.warn('[Groq] API key not configured');
    return null;
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
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
      console.error(`[Groq] Error: ${response.status}`);
      return null;
    }

    const data: GroqResponse = await response.json();
    const content = data.choices[0]?.message?.content || '';
    const tokens = (data.usage?.prompt_tokens || 0) + (data.usage?.completion_tokens || 0);

    console.log(`[Groq] Success in ${latencyMs}ms, ${tokens} tokens`);
    return { content, latencyMs, tokens };

  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.warn(`[Groq] Timeout after ${timeoutMs}ms`);
    } else {
      console.error('[Groq] Error:', error);
    }
    return null;
  }
}
```

#### Step 1.3: Update Dog Agent with 4-Tier Routing
**File:** `supabase/functions/dog-agent/index.ts` (modify existing)

Key changes:
1. Import new router module
2. Fetch config from `dog_agent_config`
3. Use Groq for ultra-fast tier
4. Add telemetry to analytics events

---

### Phase 2: SSE Streaming Implementation

**Milestone:** Token-by-token streaming responses  
**Duration:** 2 days  
**Dependencies:** Phase 1 complete  
**Rollback:** Set `use_streaming = false` in config

#### Step 2.1: Create Streaming Endpoint
**File:** `supabase/functions/dog-agent-stream/index.ts`

```typescript
/**
 * Dog Agent Streaming Endpoint
 * SSE-based token-by-token delivery
 */

import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { createServiceClient, getEnv } from "../_shared/supabase.ts";
import { getRoutingDecision, RouterConfig } from "../_shared/model-router.ts";

// Reuse system prompt builder from dog-agent
import { buildDogSystemPrompt, gatherKnowledgeContext } from "./knowledge.ts";

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { message, conversationHistory = [], stream = true } = await req.json();
    
    if (!stream) {
      // Redirect to non-streaming endpoint
      return new Response(JSON.stringify({ 
        error: 'Use /dog-agent for non-streaming requests' 
      }), { status: 400, headers: corsHeaders });
    }

    const supabase = createServiceClient();
    const lovableApiKey = getEnv('LOVABLE_API_KEY');

    // Get config
    const { data: config } = await supabase
      .from('dog_agent_config')
      .select('*')
      .eq('id', 'default')
      .single();

    if (!config?.use_streaming) {
      return new Response(JSON.stringify({ 
        error: 'Streaming not enabled' 
      }), { status: 400, headers: corsHeaders });
    }

    // Get routing decision
    const routing = getRoutingDecision(
      message,
      conversationHistory.length,
      config as RouterConfig
    );

    // Gather knowledge context (reuse existing logic)
    const knowledgeContext = await gatherKnowledgeContext(supabase, message);
    const systemPrompt = buildDogSystemPrompt(knowledgeContext);

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Start streaming from Lovable AI
    const startTime = Date.now();
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: routing.model,
        messages,
        temperature: routing.temperature,
        max_tokens: routing.maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[DogStream] AI error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'AI error' }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Return the stream directly with proper headers
    const latencyMs = Date.now() - startTime;
    
    // Log async (don't block stream)
    EdgeRuntime.waitUntil(
      supabase.from('analytics_events').insert({
        event_type: 'dog_agent_chat',
        event_name: 'dog_stream_started',
        model_selected: routing.model,
        model_tier: routing.tier,
        provider: routing.provider,
        routing_reason: routing.reason,
        latency_ms: latencyMs,
        metadata: {
          message_length: message.length,
          streaming: true
        }
      })
    );

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });

  } catch (error) {
    console.error('[DogStream] Error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
```

#### Step 2.2: Frontend Streaming Consumer
**File:** `src/hooks/useDogStream.ts`

```typescript
/**
 * useDogStream Hook
 * Consumes SSE stream from dog-agent-stream endpoint
 */

import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface StreamMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface UseDogStreamReturn {
  messages: StreamMessage[];
  isStreaming: boolean;
  sendMessage: (input: string) => Promise<void>;
  cancelStream: () => void;
  clearMessages: () => void;
}

export function useDogStream(): UseDogStreamReturn {
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  const sendMessage = useCallback(async (input: string) => {
    if (!input.trim() || isStreaming) return;

    const userMessage: StreamMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);

    abortControllerRef.current = new AbortController();
    let assistantContent = '';

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dog-agent-stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            message: input,
            conversationHistory: messages,
            stream: true
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast({ title: 'Rate limit', description: 'Please wait a moment', variant: 'destructive' });
        } else if (response.status === 402) {
          toast({ title: 'Credits needed', description: 'Please add credits', variant: 'destructive' });
        }
        throw new Error(`Request failed: ${response.status}`);
      }

      if (!response.body) throw new Error('No response body');

      // Add empty assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process SSE lines
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                if (updated[lastIdx]?.role === 'assistant') {
                  updated[lastIdx] = { ...updated[lastIdx], content: assistantContent };
                }
                return updated;
              });
            }
          } catch {
            // Incomplete JSON, continue
          }
        }
      }

    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log('[DogStream] Cancelled by user');
      } else {
        console.error('[DogStream] Error:', error);
        toast({
          title: 'Connection error',
          description: 'Failed to get response',
          variant: 'destructive'
        });
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [messages, isStreaming, toast]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isStreaming,
    sendMessage,
    cancelStream,
    clearMessages
  };
}
```

---

### Phase 3: Enhanced Voice STT

**Milestone:** Real-time ElevenLabs Scribe v2  
**Duration:** 1 day  
**Dependencies:** None (can run parallel to Phase 2)  
**Rollback:** Revert to existing `dog-transcribe` endpoint

#### Step 3.1: Create Scribe Token Endpoint
**File:** `supabase/functions/elevenlabs-scribe-token/index.ts`

```typescript
/**
 * ElevenLabs Scribe Token Generator
 * Returns single-use token for real-time transcription
 */

import { corsHeaders, handleCors } from "../_shared/cors.ts";

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      return new Response(JSON.stringify({ error: 'ElevenLabs not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const response = await fetch(
      'https://api.elevenlabs.io/v1/single-use-token/realtime_scribe',
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.error('[ScribeToken] Error:', response.status);
      return new Response(JSON.stringify({ error: 'Token generation failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { token } = await response.json();
    
    return new Response(JSON.stringify({ token }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[ScribeToken] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
```

#### Step 3.2: Enhanced Voice Hook with Scribe v2
**File:** `src/hooks/useDogVoice.ts`

```typescript
/**
 * useDogVoice Hook
 * Real-time voice input using ElevenLabs Scribe v2
 */

import { useScribe } from '@elevenlabs/react';
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseDogVoiceReturn {
  isConnected: boolean;
  isListening: boolean;
  partialTranscript: string;
  committedTranscripts: Array<{ id: string; text: string }>;
  startListening: () => Promise<void>;
  stopListening: () => void;
  getFullTranscript: () => string;
  clearTranscripts: () => void;
}

export function useDogVoice(): UseDogVoiceReturn {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const scribe = useScribe({
    modelId: 'scribe_v2_realtime',
    commitStrategy: 'vad', // Voice Activity Detection
    onPartialTranscript: (data) => {
      console.log('[DogVoice] Partial:', data.text);
    },
    onCommittedTranscript: (data) => {
      console.log('[DogVoice] Committed:', data.text);
    },
  });

  const startListening = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Get token from edge function
      const { data, error } = await supabase.functions.invoke('elevenlabs-scribe-token');
      
      if (error || !data?.token) {
        throw new Error('Failed to get transcription token');
      }

      await scribe.connect({
        token: data.token,
        microphone: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      console.log('[DogVoice] Connected to Scribe');

    } catch (error) {
      console.error('[DogVoice] Connection error:', error);
      toast({
        title: 'Voice error',
        description: 'Could not start voice input',
        variant: 'destructive'
      });
    } finally {
      setIsConnecting(false);
    }
  }, [scribe, toast]);

  const stopListening = useCallback(() => {
    scribe.disconnect();
    console.log('[DogVoice] Disconnected');
  }, [scribe]);

  const getFullTranscript = useCallback(() => {
    return scribe.committedTranscripts.map(t => t.text).join(' ');
  }, [scribe]);

  const clearTranscripts = useCallback(() => {
    // Scribe SDK manages this internally on new connection
  }, []);

  return {
    isConnected: scribe.isConnected,
    isListening: scribe.isConnected && !isConnecting,
    partialTranscript: scribe.partialTranscript,
    committedTranscripts: scribe.committedTranscripts,
    startListening,
    stopListening,
    getFullTranscript,
    clearTranscripts
  };
}
```

---

## C) Model Routing Strategy (Core Deliverable)

### Input Classifier Logic

```typescript
// Pseudo-code for query classification

function classifyQueryComplexity(query: string, context: Context): Tier {
  // 1. Pattern Matching (fast, deterministic)
  if (GREETING_PATTERNS.match(query)) return 'ultra-fast';
  if (SIMPLE_FACTUAL_PATTERNS.match(query) && wordCount <= 8) return 'ultra-fast';
  if (COMPLEX_REASONING_PATTERNS.match(query)) return 'complex';
  
  // 2. Heuristics
  if (wordCount > 20) return 'complex';
  if (context.conversationDepth > 4) return 'complex';
  if (wordCount <= 5) return 'fast';
  
  // 3. Default
  return 'balanced';
}
```

### Routing Decision Matrix

| Tier | Provider | Model | Latency Target | Cost | Use Case |
|------|----------|-------|----------------|------|----------|
| ultra-fast | Groq | llama-3.3-70b | <100ms | $ | Greetings, simple facts |
| fast | Lovable | gemini-2.5-flash-lite | <300ms | $ | Short questions |
| balanced | Lovable | gemini-2.5-flash | <800ms | $$ | General chat |
| complex | Lovable | gpt-5 | <2000ms | $$$ | Reasoning, comparisons |

### Hard Constraints

```typescript
const HARD_CONSTRAINTS = {
  maxTokens: {
    ultraFast: 500,    // Groq limit for speed
    fast: 800,
    balanced: 1500,
    complex: 2500
  },
  latencyThresholds: {
    groqTimeout: 5000,  // Fallback if Groq slow
    maxWait: 30000      // Hard timeout
  },
  budget: {
    dailyLimit: 10000,  // Token limit per day
    alertThreshold: 0.8 // Alert at 80%
  }
};
```

### Fallback Rules

```typescript
async function callWithFallback(routing: RoutingDecision, messages: Message[]) {
  const providers = [
    { model: routing.model, provider: routing.provider },
    ...routing.fallbacks.map(m => ({ model: m, provider: 'lovable-ai' }))
  ];
  
  for (const { model, provider } of providers) {
    try {
      if (provider === 'groq') {
        const result = await callGroqWithTimeout(messages, model);
        if (result) return result;
        continue; // Groq failed, try next
      }
      
      return await callLovableAI(messages, model);
      
    } catch (error) {
      if (isRateLimitError(error)) {
        await sleep(1000);
        continue;
      }
      if (isCircuitOpen(model)) {
        continue; // Skip to fallback
      }
      throw error; // Unknown error
    }
  }
  
  throw new Error('All providers failed');
}
```

### Example Classifications

| # | Query | Expected Tier | Reason |
|---|-------|---------------|--------|
| 1 | "hi" | ultra-fast | greeting |
| 2 | "who is Jeff Mills?" | ultra-fast | simple_who_is |
| 3 | "thanks!" | ultra-fast | acknowledgment |
| 4 | "What gear does Surgeon use?" | fast | short_factual |
| 5 | "Tell me about Tresor" | fast | simple_about |
| 6 | "What labels should I check out?" | balanced | list_request |
| 7 | "Recommend artists like Paula Temple" | balanced | recommendation |
| 8 | "Compare Jeff Mills vs Robert Hood" | complex | comparison |
| 9 | "Explain the evolution of Detroit techno" | complex | historical_analysis |
| 10 | "Why is the 303 important to acid?" | complex | technical_why |

---

## D) Code-Level Changes (Concrete)

### New Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/_shared/model-router.ts` | Centralized routing logic |
| `supabase/functions/_shared/groq-provider.ts` | Groq API wrapper |
| `supabase/functions/dog-agent-stream/index.ts` | SSE streaming endpoint |
| `supabase/functions/elevenlabs-scribe-token/index.ts` | STT token generator |
| `src/hooks/useDogStream.ts` | Frontend streaming consumer |
| `src/hooks/useDogVoice.ts` | Enhanced voice input |
| `docs/DOG_AGENT_UPGRADE_PLAN.md` | This document |

### Existing Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/dog-agent/index.ts` | Import router, use 4-tier logic |
| `supabase/config.toml` | Add new function entries |
| `src/components/admin/DogChat.tsx` | Add streaming toggle, voice UI |
| `src/hooks/useModelRouter.ts` | Add Groq model |

### Environment Variables Required

| Variable | Description | Required For |
|----------|-------------|--------------|
| `LOVABLE_API_KEY` | ✅ Already exists | All AI calls |
| `GROQ_API_KEY` | New secret needed | Phase 1 |
| `ELEVENLABS_API_KEY` | ✅ Already exists | Voice STT |
| `OPENAI_API_KEY` | ✅ Already exists | Embeddings |

### Config Object Schema

```typescript
// dog_agent_config table
interface DogAgentConfig {
  id: string;                    // 'default'
  use_groq_for_simple: boolean;  // Enable Groq tier
  use_streaming: boolean;        // Enable SSE
  use_gpt5_for_complex: boolean; // GPT-5 for complex
  groq_enabled: boolean;         // Groq API available
  groq_timeout_ms: number;       // Groq timeout
  max_tokens_simple: number;     // Ultra-fast limit
  max_tokens_balanced: number;   // Balanced limit
  max_tokens_complex: number;    // Complex limit
}
```

---

## E) SSE Streaming Upgrade

### Backend Changes

1. **New endpoint:** `dog-agent-stream`
2. **Stream passthrough:** Return AI gateway's ReadableStream directly
3. **Headers:** `text/event-stream`, `no-cache`, `keep-alive`
4. **Async logging:** Use `EdgeRuntime.waitUntil()` for non-blocking analytics

### Frontend Changes

1. **New hook:** `useDogStream.ts`
2. **AbortController:** For cancel/cleanup
3. **Buffer processing:** Line-by-line SSE parsing
4. **Incremental state:** Update last assistant message

### Partial Token Handling

```typescript
// Handle partial JSON across chunks
let buffer = '';

while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
  let line = buffer.slice(0, newlineIndex);
  buffer = buffer.slice(newlineIndex + 1);
  
  try {
    const parsed = JSON.parse(line.slice(6));
    // Success - emit token
  } catch {
    // Incomplete - put back in buffer
    buffer = line + '\n' + buffer;
    break;
  }
}
```

### Cancel/Abort

```typescript
const abortController = new AbortController();

// User clicks cancel
abortController.abort();

// Cleanup in finally block
finally {
  setIsStreaming(false);
  abortControllerRef.current = null;
}
```

### Fallback for Non-Streaming Clients

```typescript
// In dog-agent-stream
if (!stream || !supportsStreaming(req)) {
  return Response.redirect('/functions/v1/dog-agent');
}
```

---

## F) ElevenLabs Scribe STT Integration

### Frontend Voice Capture UX

1. **Push-to-hold:** Button to start/stop listening
2. **Permission request:** Explain why mic needed
3. **Visual feedback:** Waveform or pulsing indicator
4. **Partial display:** Show text as it's transcribed

### Error States

| State | UX |
|-------|-----|
| No mic permission | Toast + instructions |
| Connection failed | Retry button |
| Token expired | Auto-reconnect |
| Network error | Show partial + retry |

### Backend STT Endpoint

`elevenlabs-scribe-token` returns single-use token for WebSocket connection. No audio passes through backend - direct client-to-ElevenLabs.

### Rate Limiting

```typescript
// In scribe-token endpoint
const MAX_TOKENS_PER_HOUR = 60;

const { count } = await supabase
  .from('analytics_events')
  .select('id', { count: 'exact' })
  .eq('event_type', 'scribe_token_issued')
  .gte('created_at', oneHourAgo);

if (count >= MAX_TOKENS_PER_HOUR) {
  return errorResponse('Rate limit exceeded', 429);
}
```

### Plugging into Chat

```typescript
// When voice input commits
const transcript = getFullTranscript();
if (transcript.trim()) {
  sendMessage(transcript); // Same as text input
  clearTranscripts();
}
```

---

## G) Observability + Quality Control

### Event Schema

```sql
-- Extended analytics_events for model telemetry
{
  event_type: 'dog_agent_chat',
  event_name: 'dog_conversation' | 'dog_stream_started' | 'dog_stream_completed',
  
  -- Model routing
  model_selected: 'openai/gpt-5' | 'google/gemini-2.5-flash' | ...,
  model_tier: 'ultra-fast' | 'fast' | 'balanced' | 'complex',
  provider: 'groq' | 'lovable-ai',
  routing_reason: 'complex_pattern_match' | 'short_query' | ...,
  
  -- Performance
  latency_ms: 234,
  token_count: 156,
  
  -- Quality (future)
  metadata: {
    user_feedback: 'thumbs_up' | 'thumbs_down' | null,
    retry_count: 0,
    fallback_used: false
  }
}
```

### Metrics Dashboard Query

```sql
-- Model usage by tier (last 24h)
SELECT 
  model_tier,
  model_selected,
  COUNT(*) as requests,
  AVG(latency_ms) as avg_latency,
  SUM(token_count) as total_tokens
FROM analytics_events
WHERE event_type = 'dog_agent_chat'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY model_tier, model_selected
ORDER BY requests DESC;
```

### Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| P95 Latency | >2000ms | >5000ms |
| Error Rate | >5% | >10% |
| Fallback Rate | >10% | >25% |
| Daily Cost | 80% budget | 100% budget |

---

## H) Test Plan

### Unit Tests: Router Logic

```typescript
// model-router.test.ts
describe('classifyQuery', () => {
  it('classifies greetings as ultra-fast', () => {
    expect(classifyQuery('hi').tier).toBe('ultra-fast');
    expect(classifyQuery('hello there').tier).toBe('ultra-fast');
  });
  
  it('classifies comparisons as complex', () => {
    expect(classifyQuery('compare X vs Y').tier).toBe('complex');
  });
  
  it('handles deep conversations', () => {
    expect(classifyQuery('yes', 5).tier).toBe('complex');
  });
});
```

### Integration Tests: Providers

```typescript
// Run against actual APIs in staging
describe('Provider Integration', () => {
  it('Groq responds under 100ms', async () => {
    const start = Date.now();
    const result = await callGroq([{ role: 'user', content: 'hi' }]);
    expect(Date.now() - start).toBeLessThan(100);
    expect(result).toBeTruthy();
  });
  
  it('Lovable AI streams tokens', async () => {
    const response = await streamChatCompletion([...]);
    expect(response.headers.get('content-type')).toContain('event-stream');
  });
});
```

### Streaming Tests

```typescript
describe('SSE Streaming', () => {
  it('delivers tokens incrementally', async () => {
    const tokens: string[] = [];
    await streamChat({
      messages: [...],
      onDelta: (t) => tokens.push(t),
      onDone: () => {}
    });
    expect(tokens.length).toBeGreaterThan(1);
  });
  
  it('handles disconnect gracefully', async () => {
    const controller = new AbortController();
    const promise = streamChat({ signal: controller.signal });
    controller.abort();
    await expect(promise).resolves.not.toThrow();
  });
});
```

### Voice STT Tests

```typescript
describe('Voice Input', () => {
  it('handles mic permission denied', async () => {
    mockMediaDevices.reject(new Error('Permission denied'));
    const { startListening } = useDogVoice();
    await startListening();
    expect(toast).toHaveBeenCalledWith({ variant: 'destructive' });
  });
  
  it('commits on silence', async () => {
    // Simulate 2s of silence
    await act(() => vi.advanceTimersByTime(2000));
    expect(scribe.committedTranscripts.length).toBeGreaterThan(0);
  });
});
```

### Evaluation Harness

```typescript
// Compare GPT-5 vs previous model
const TEST_PROMPTS = [
  "Compare Jeff Mills and Robert Hood's production styles",
  "Explain why the TR-909 is iconic",
  // ... more complex prompts
];

async function evaluateModels() {
  for (const prompt of TEST_PROMPTS) {
    const [oldResult, newResult] = await Promise.all([
      callModel('google/gemini-2.5-flash', prompt),
      callModel('openai/gpt-5', prompt)
    ]);
    
    // Log for human review
    console.log({ prompt, old: oldResult, new: newResult });
  }
}
```

---

## I) Risk Register + Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Routing misclassification** | Medium | Medium | Pattern testing suite, fallback to balanced tier |
| **Cost spikes from GPT-5** | High | Medium | Daily token limits, alert at 80% budget |
| **Groq latency > 100ms** | Low | Low | 5s timeout, automatic fallback to Gemini |
| **Streaming bugs (broken SSE)** | Medium | High | Fallback to non-streaming, client reconnect |
| **STT abuse (excessive tokens)** | Medium | Medium | Rate limit 60 tokens/hour per session |
| **Hallucinations in GPT-5** | Medium | High | RAG context always included, "not in my kibble" fallback |
| **Circuit breaker false positives** | Low | Medium | Conservative thresholds, manual reset option |
| **ElevenLabs quota exhausted** | Low | Medium | Graceful degradation to Web Speech API |

### Rollback Procedures

| Phase | Rollback Method | Time to Rollback |
|-------|-----------------|------------------|
| Phase 0 | Delete migration, remove files | 5 min |
| Phase 1 | Set `groq_enabled = false` | Instant |
| Phase 2 | Set `use_streaming = false` | Instant |
| Phase 3 | Revert to `dog-transcribe` | 5 min |

---

## Implementation Checklist

### Phase 0 ☐
- [ ] Run database migration for `dog_agent_config`
- [ ] Run migration for analytics columns
- [ ] Create `_shared/model-router.ts`
- [ ] Test router classifications

### Phase 1 ☐
- [ ] Add `GROQ_API_KEY` secret
- [ ] Create `_shared/groq-provider.ts`
- [ ] Update `dog-agent/index.ts` with 4-tier routing
- [ ] Test Groq latency < 100ms
- [ ] Verify fallback to Gemini works

### Phase 2 ☐
- [ ] Create `dog-agent-stream/index.ts`
- [ ] Update `config.toml` with new function
- [ ] Create `useDogStream.ts` hook
- [ ] Test streaming in DogChat
- [ ] Verify cancel/abort works

### Phase 3 ☐
- [ ] Create `elevenlabs-scribe-token/index.ts`
- [ ] Create `useDogVoice.ts` hook
- [ ] Add voice UI to DogChat
- [ ] Test VAD threshold
- [ ] Verify rate limiting

### Post-Launch ☐
- [ ] Monitor P95 latency
- [ ] Review cost dashboard
- [ ] Gather user feedback
- [ ] Tune routing patterns based on data

---

*Document generated for techno.dog Dog Agent upgrade. Questions? Bark at the pack.*
