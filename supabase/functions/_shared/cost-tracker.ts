// Cost tracking utility for AI and API usage
// Phase 0: Visibility Quick Wins

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Approximate token costs per model (USD per 1K tokens)
export const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  'google/gemini-2.5-flash-lite': { input: 0.000075, output: 0.0003 },
  'google/gemini-2.5-flash': { input: 0.00015, output: 0.0006 },
  'google/gemini-2.5-pro': { input: 0.00125, output: 0.005 },
  'google/gemini-3-flash-preview': { input: 0.0002, output: 0.0008 },
  'google/gemini-3-pro-preview': { input: 0.0015, output: 0.006 },
  'openai/gpt-5-nano': { input: 0.0001, output: 0.0004 },
  'openai/gpt-5-mini': { input: 0.0004, output: 0.0016 },
  'openai/gpt-5': { input: 0.005, output: 0.015 },
  'openai/gpt-5.2': { input: 0.006, output: 0.018 },
  // Legacy/fallback
  'default': { input: 0.0002, output: 0.0008 },
};

export interface UsageEvent {
  functionName: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  estimatedCostUsd?: number;
  requestId?: string;
  cached?: boolean;
  durationMs?: number;
  success: boolean;
  errorType?: string;
}

// Estimate cost from token counts
export function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  const costs = MODEL_COSTS[model] || MODEL_COSTS['default'];
  return (inputTokens / 1000) * costs.input + (outputTokens / 1000) * costs.output;
}

// Rough token estimation from text length (for when actual counts unavailable)
export function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token for English
  return Math.ceil(text.length / 4);
}

// Log usage event to database (non-blocking)
export async function logUsageEvent(event: UsageEvent): Promise<void> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('[cost-tracker] Supabase not configured, skipping usage log');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Log to analytics_events table (already exists)
    await supabase.from('analytics_events').insert({
      event_type: 'ai_usage',
      event_name: `ai_${event.functionName}`,
      page_path: `/functions/${event.functionName}`,
      event_data: {
        model: event.model,
        input_tokens: event.inputTokens,
        output_tokens: event.outputTokens,
        estimated_cost_usd: event.estimatedCostUsd,
        cached: event.cached,
        duration_ms: event.durationMs,
        success: event.success,
        error_type: event.errorType,
      },
      session_id: event.requestId,
    });
  } catch (error) {
    // Non-blocking - log but don't fail
    console.error('[cost-tracker] Failed to log usage event:', error);
  }
}

// Create a usage tracker for a function invocation
export function createUsageTracker(functionName: string, requestId?: string) {
  const startTime = Date.now();
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalCost = 0;
  let callCount = 0;

  return {
    trackCall(model: string, inputTokens: number, outputTokens: number, cached = false): void {
      callCount++;
      if (!cached) {
        totalInputTokens += inputTokens;
        totalOutputTokens += outputTokens;
        totalCost += estimateCost(model, inputTokens, outputTokens);
      }
    },

    trackFromText(model: string, prompt: string, response: string, cached = false): void {
      const inputTokens = estimateTokens(prompt);
      const outputTokens = estimateTokens(response);
      this.trackCall(model, inputTokens, outputTokens, cached);
    },

    async finalize(success: boolean, errorType?: string): Promise<void> {
      const durationMs = Date.now() - startTime;
      
      await logUsageEvent({
        functionName,
        model: 'aggregated',
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
        estimatedCostUsd: totalCost,
        requestId,
        durationMs,
        success,
        errorType,
      });
    },

    getSummary() {
      return {
        callCount,
        totalInputTokens,
        totalOutputTokens,
        totalCostUsd: totalCost,
        durationMs: Date.now() - startTime,
      };
    },
  };
}
