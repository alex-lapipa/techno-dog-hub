/**
 * useModelRouter Hook
 * 
 * Centralized model selection with intelligent routing and fallback logic.
 * Implements the multi-LLM orchestration strategy from the platform audit.
 * 
 * Model Selection Policy:
 * - Fast classification/simple tasks → gemini-2.5-flash-lite
 * - Balanced workloads → gemini-2.5-flash  
 * - Complex reasoning → gpt-5 or gemini-2.5-pro
 * - Image generation → gemini-3-pro-image-preview
 */

import { useCallback, useMemo } from 'react';

export type TaskCategory = 
  | 'classification'      // Fast, simple categorization
  | 'summarization'       // Content condensing
  | 'chat'                // Interactive conversation
  | 'enrichment'          // Data augmentation
  | 'research'            // Complex multi-step reasoning
  | 'generation'          // Content creation
  | 'image'               // Image generation
  | 'embedding';          // Vector embeddings (OpenAI only)

export interface ModelConfig {
  model: string;
  maxTokens?: number;
  temperature?: number;
  description: string;
}

// Model routing policy based on task type
const MODEL_ROUTING: Record<TaskCategory, ModelConfig> = {
  classification: {
    model: 'google/gemini-2.5-flash-lite',
    maxTokens: 256,
    temperature: 0.1,
    description: 'Fastest, lowest cost - for simple categorization'
  },
  summarization: {
    model: 'google/gemini-2.5-flash-lite',
    maxTokens: 512,
    temperature: 0.3,
    description: 'Fast summarization with reasonable quality'
  },
  chat: {
    model: 'google/gemini-2.5-flash',
    maxTokens: 1024,
    temperature: 0.7,
    description: 'Balanced for conversational AI'
  },
  enrichment: {
    model: 'google/gemini-2.5-flash',
    maxTokens: 2048,
    temperature: 0.4,
    description: 'Good balance of speed and quality for data enrichment'
  },
  research: {
    model: 'google/gemini-2.5-pro',
    maxTokens: 4096,
    temperature: 0.5,
    description: 'Best reasoning for complex multi-step tasks'
  },
  generation: {
    model: 'openai/gpt-5-mini',
    maxTokens: 2048,
    temperature: 0.8,
    description: 'Creative content generation'
  },
  image: {
    model: 'google/gemini-3-pro-image-preview',
    description: 'Image generation'
  },
  embedding: {
    model: 'text-embedding-3-small',
    description: 'OpenAI embeddings (direct API only)'
  }
};

// Fallback chains for each model
const FALLBACK_CHAINS: Record<string, string[]> = {
  'google/gemini-2.5-pro': ['openai/gpt-5', 'google/gemini-2.5-flash'],
  'google/gemini-2.5-flash': ['openai/gpt-5-mini', 'google/gemini-2.5-flash-lite'],
  'google/gemini-2.5-flash-lite': ['openai/gpt-5-nano', 'google/gemini-2.5-flash'],
  'openai/gpt-5': ['google/gemini-2.5-pro', 'openai/gpt-5-mini'],
  'openai/gpt-5-mini': ['google/gemini-2.5-flash', 'openai/gpt-5-nano'],
  'openai/gpt-5-nano': ['google/gemini-2.5-flash-lite'],
};

export interface UseModelRouterReturn {
  /** Get recommended model config for a task type */
  getModelForTask: (task: TaskCategory) => ModelConfig;
  
  /** Get fallback models for a primary model */
  getFallbacks: (model: string) => string[];
  
  /** All available models */
  availableModels: string[];
  
  /** Check if a model is supported */
  isSupported: (model: string) => boolean;
  
  /** Estimate cost tier (low/medium/high) */
  getCostTier: (model: string) => 'low' | 'medium' | 'high';
}

export function useModelRouter(): UseModelRouterReturn {
  const getModelForTask = useCallback((task: TaskCategory): ModelConfig => {
    return MODEL_ROUTING[task] || MODEL_ROUTING.chat;
  }, []);

  const getFallbacks = useCallback((model: string): string[] => {
    return FALLBACK_CHAINS[model] || [];
  }, []);

  const availableModels = useMemo(() => [
    'google/gemini-2.5-pro',
    'google/gemini-2.5-flash',
    'google/gemini-2.5-flash-lite',
    'google/gemini-3-pro-preview',
    'google/gemini-3-pro-image-preview',
    'openai/gpt-5',
    'openai/gpt-5-mini',
    'openai/gpt-5-nano',
  ], []);

  const isSupported = useCallback((model: string): boolean => {
    return availableModels.includes(model);
  }, [availableModels]);

  const getCostTier = useCallback((model: string): 'low' | 'medium' | 'high' => {
    if (model.includes('flash-lite') || model.includes('nano')) return 'low';
    if (model.includes('flash') || model.includes('mini')) return 'medium';
    return 'high';
  }, []);

  return {
    getModelForTask,
    getFallbacks,
    availableModels,
    isSupported,
    getCostTier
  };
}

/**
 * Utility function for edge functions (non-React context)
 */
export function getModelConfig(task: TaskCategory): ModelConfig {
  return MODEL_ROUTING[task] || MODEL_ROUTING.chat;
}

export function getModelFallbacks(model: string): string[] {
  return FALLBACK_CHAINS[model] || [];
}
