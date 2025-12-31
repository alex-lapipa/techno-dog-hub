/**
 * Intelligent Model Router for Dog Agent
 * 4-Tier routing with Groq, Gemini, GPT-5
 * 
 * READ-ONLY: This module only reads config, never writes to database
 */

export type ModelTier = 'ultra-fast' | 'fast' | 'balanced' | 'complex';
export type ModelProvider = 'groq' | 'lovable-ai';

export interface RoutingDecision {
  tier: ModelTier;
  model: string;
  provider: ModelProvider;
  maxTokens: number;
  temperature: number;
  reason: string;
  fallbacks: string[];
}

export interface RouterConfig {
  useGroq: boolean;
  groqTimeoutMs: number;
  useGpt5ForComplex: boolean;
  maxTokens: {
    ultraFast: number;
    fast: number;
    balanced: number;
    complex: number;
  };
}

export const DEFAULT_ROUTER_CONFIG: RouterConfig = {
  useGroq: false,
  groqTimeoutMs: 5000,
  useGpt5ForComplex: true,
  maxTokens: {
    ultraFast: 300,
    fast: 500,
    balanced: 1500,
    complex: 2500
  }
};

// ============================================
// Pattern matchers for query classification
// ============================================

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
  /best|worst|top.*reason|rank.*why/i,
  /signature sound|production style|creative process/i,
];

const SIMPLE_PATTERNS = [
  /^(hi|hello|hey|yo|sup|what'?s up|woof|arf|bark)/i,
  /^(thanks|thank you|thx|cheers|good boy)/i,
  /^(yes|no|ok|okay|sure|cool|nice|great)/i,
  /^who is [a-z\s]+\??$/i,
  /^what is [a-z\s]+\??$/i,
  /^when (is|was|did)/i,
  /^where (is|was|are)/i,
  /^list |^name /i,
];

/**
 * Classify query complexity based on patterns and heuristics
 */
export function classifyQuery(
  query: string,
  conversationDepth: number = 0
): { tier: ModelTier; reason: string } {
  const normalizedQuery = query.trim().toLowerCase();
  const wordCount = normalizedQuery.split(/\s+/).length;
  
  // Check for complex patterns first (highest priority)
  for (const pattern of COMPLEX_PATTERNS) {
    if (pattern.test(query)) {
      return { tier: 'complex', reason: 'complex_pattern_match' };
    }
  }
  
  // Long queries or deep conversations = complex
  if (wordCount > 20) {
    return { tier: 'complex', reason: 'long_query' };
  }
  
  if (conversationDepth > 4) {
    return { tier: 'complex', reason: 'deep_conversation' };
  }
  
  // Check for simple patterns
  for (const pattern of SIMPLE_PATTERNS) {
    if (pattern.test(query) && wordCount <= 8) {
      return { tier: 'ultra-fast', reason: 'simple_pattern_match' };
    }
  }
  
  // Very short = fast
  if (wordCount <= 5) {
    return { tier: 'fast', reason: 'short_query' };
  }
  
  // Medium length = balanced
  if (wordCount <= 12) {
    return { tier: 'balanced', reason: 'medium_query' };
  }
  
  // Default to balanced for anything else
  return { tier: 'balanced', reason: 'default' };
}

/**
 * Get routing decision based on query and config
 */
export function getRoutingDecision(
  query: string,
  conversationDepth: number = 0,
  config: RouterConfig = DEFAULT_ROUTER_CONFIG
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
        model: config.useGpt5ForComplex ? 'openai/gpt-5' : 'google/gemini-2.5-pro',
        provider: 'lovable-ai',
        maxTokens: config.maxTokens.complex,
        temperature: 0.7,
        reason: classification.reason,
        fallbacks: config.useGpt5ForComplex 
          ? ['google/gemini-2.5-pro', 'openai/gpt-5-mini']
          : ['openai/gpt-5', 'google/gemini-2.5-flash']
      };
  }
}

/**
 * Convert database config row to RouterConfig
 */
export function configFromDb(dbRow: Record<string, any> | null): RouterConfig {
  if (!dbRow) return DEFAULT_ROUTER_CONFIG;
  
  return {
    useGroq: dbRow.use_groq_for_simple ?? false,
    groqTimeoutMs: dbRow.groq_timeout_ms ?? 5000,
    useGpt5ForComplex: dbRow.use_gpt5_for_complex ?? true,
    maxTokens: {
      ultraFast: dbRow.max_tokens_simple ?? 500,
      fast: dbRow.max_tokens_simple ?? 500,
      balanced: dbRow.max_tokens_balanced ?? 1500,
      complex: dbRow.max_tokens_complex ?? 2500
    }
  };
}

/**
 * Get tier label for logging/display
 */
export function getTierLabel(tier: ModelTier): string {
  switch (tier) {
    case 'ultra-fast': return 'Ultra-Fast (Groq/Flash-Lite)';
    case 'fast': return 'Fast (Flash-Lite)';
    case 'balanced': return 'Balanced (Flash)';
    case 'complex': return 'Complex (GPT-5/Pro)';
  }
}

// Example classifications for testing/validation
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
