/**
 * Creative Studio Model Router
 * 
 * Routes AI requests to the appropriate model based on user selection.
 * Supports: Grok (xAI), GPT-5 (OpenAI), Gemini (Google), Claude (Anthropic)
 * 
 * All calls go through Lovable AI Gateway EXCEPT Grok which needs direct xAI API.
 */

export type ModelId = 'grok' | 'openai' | 'gemini' | 'anthropic';

export interface ModelConfig {
  id: ModelId;
  gatewayModel: string;      // Model identifier for Lovable AI Gateway
  supportsImages: boolean;
  temperature: number;
  fallbackTo?: ModelId;
}

// Model configurations with Lovable AI Gateway identifiers
const MODEL_CONFIGS: Record<ModelId, ModelConfig> = {
  grok: {
    id: 'grok',
    gatewayModel: 'openai/gpt-5-mini', // Grok not available via gateway, use fallback
    supportsImages: false,
    temperature: 0.9,
    fallbackTo: 'gemini',
  },
  openai: {
    id: 'openai',
    gatewayModel: 'openai/gpt-5-mini',
    supportsImages: true,
    temperature: 0.7,
    fallbackTo: 'gemini',
  },
  gemini: {
    id: 'gemini',
    gatewayModel: 'google/gemini-3-flash-preview',
    supportsImages: true,
    temperature: 0.8,
    fallbackTo: 'openai',
  },
  anthropic: {
    id: 'anthropic',
    gatewayModel: 'openai/gpt-5', // Claude not available via gateway, use GPT-5 as proxy
    supportsImages: false,
    temperature: 0.6,
    fallbackTo: 'gemini',
  },
};

// Image generation models (only Gemini supports this via gateway)
const IMAGE_MODEL = 'google/gemini-2.5-flash-image-preview';

/**
 * Get the best model config for a creative task
 * @param selectedModels - Array of model IDs selected by user
 * @param requiresImages - Whether the task needs image generation
 */
export function getCreativeModelConfig(
  selectedModels: string[] = ['gemini'],
  requiresImages = false
): ModelConfig & { resolvedModel: string; mixer: boolean } {
  // Default to gemini if nothing selected
  const models = selectedModels.length > 0 ? selectedModels : ['gemini'];
  const primaryModel = models[0] as ModelId;
  const config = MODEL_CONFIGS[primaryModel] || MODEL_CONFIGS.gemini;
  
  // For image generation, always use the image model
  const resolvedModel = requiresImages ? IMAGE_MODEL : config.gatewayModel;
  
  return {
    ...config,
    resolvedModel,
    mixer: models.length > 1,
  };
}

/**
 * Get text model for editorial/chat tasks
 */
export function getTextModelConfig(
  selectedModels: string[] = ['gemini']
): { model: string; temperature: number; mixer: boolean } {
  const models = selectedModels.length > 0 ? selectedModels : ['gemini'];
  const primaryModel = models[0] as ModelId;
  const config = MODEL_CONFIGS[primaryModel] || MODEL_CONFIGS.gemini;
  
  return {
    model: config.gatewayModel,
    temperature: config.temperature,
    mixer: models.length > 1,
  };
}

/**
 * Build a mixer-aware prompt prefix for blended outputs
 */
export function getMixerPromptPrefix(selectedModels: string[]): string {
  if (selectedModels.length <= 1) return '';
  
  const traits: Record<string, string> = {
    grok: 'bold, edgy, youth-focused',
    openai: 'balanced, nuanced, polished',
    gemini: 'fast, contextual, adaptive',
    anthropic: 'thoughtful, detailed, thorough',
  };
  
  const blendedTraits = selectedModels
    .map(m => traits[m])
    .filter(Boolean)
    .join(' + ');
  
  return `[MIXER MODE: Blend these creative styles - ${blendedTraits}]\n\n`;
}

/**
 * Get available models summary for logging
 */
export function getModelsSummary(selectedModels: string[]): string {
  const names: Record<string, string> = {
    grok: 'Grok',
    openai: 'GPT-5',
    gemini: 'Gemini',
    anthropic: 'Claude',
  };
  return selectedModels.map(m => names[m] || m).join(', ');
}
