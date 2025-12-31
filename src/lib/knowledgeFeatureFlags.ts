/**
 * Knowledge Layer Feature Flags
 * 
 * Controls the rollout of the new knowledge/caching infrastructure.
 * All flags default to OFF in production for safety.
 */

const KNOWLEDGE_FLAGS_KEY = 'technodog_knowledge_flags';

export interface KnowledgeFeatureFlags {
  // Enable reading from cached_search table
  KNOWLEDGE_CACHE_ENABLED: boolean;
  
  // Enable background enrichment jobs
  KNOWLEDGE_ENRICHMENT_ENABLED: boolean;
  
  // Show evidence UI (sources, snippets, confidence)
  KNOWLEDGE_EVIDENCE_UI_ENABLED: boolean;
  
  // Enable admin dashboard for knowledge management
  KNOWLEDGE_ADMIN_DASHBOARD_ENABLED: boolean;
  
  // Shadow mode: log what would happen without affecting output
  KNOWLEDGE_SHADOW_MODE: boolean;
  
  // Enable zero-hallucination validator (always on in production)
  KNOWLEDGE_ZERO_HALLUCINATION_ENABLED: boolean;
}

// Default flags - ALL OFF for production safety
const DEFAULT_KNOWLEDGE_FLAGS: KnowledgeFeatureFlags = {
  KNOWLEDGE_CACHE_ENABLED: false,
  KNOWLEDGE_ENRICHMENT_ENABLED: false,
  KNOWLEDGE_EVIDENCE_UI_ENABLED: false,
  KNOWLEDGE_ADMIN_DASHBOARD_ENABLED: false,
  KNOWLEDGE_SHADOW_MODE: true, // Shadow mode ON by default
  KNOWLEDGE_ZERO_HALLUCINATION_ENABLED: true, // Always enforce
};

// Admin-only overrides (for testing)
const ADMIN_KNOWLEDGE_FLAGS: Partial<KnowledgeFeatureFlags> = {
  KNOWLEDGE_CACHE_ENABLED: true,
  KNOWLEDGE_EVIDENCE_UI_ENABLED: true,
  KNOWLEDGE_ADMIN_DASHBOARD_ENABLED: true,
};

/**
 * Get current knowledge feature flags
 */
export function getKnowledgeFlags(): KnowledgeFeatureFlags {
  if (typeof window === 'undefined') {
    return DEFAULT_KNOWLEDGE_FLAGS;
  }
  
  try {
    const stored = localStorage.getItem(KNOWLEDGE_FLAGS_KEY);
    if (stored) {
      return { ...DEFAULT_KNOWLEDGE_FLAGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn('Failed to parse knowledge feature flags:', e);
  }
  
  return DEFAULT_KNOWLEDGE_FLAGS;
}

/**
 * Set a specific knowledge feature flag
 */
export function setKnowledgeFlag<K extends keyof KnowledgeFeatureFlags>(
  flag: K,
  value: KnowledgeFeatureFlags[K]
): void {
  const flags = getKnowledgeFlags();
  flags[flag] = value;
  
  try {
    localStorage.setItem(KNOWLEDGE_FLAGS_KEY, JSON.stringify(flags));
  } catch (e) {
    console.warn('Failed to save knowledge feature flags:', e);
  }
}

/**
 * Set multiple knowledge feature flags at once
 */
export function setKnowledgeFlags(updates: Partial<KnowledgeFeatureFlags>): void {
  const flags = { ...getKnowledgeFlags(), ...updates };
  
  try {
    localStorage.setItem(KNOWLEDGE_FLAGS_KEY, JSON.stringify(flags));
  } catch (e) {
    console.warn('Failed to save knowledge feature flags:', e);
  }
}

/**
 * Reset all knowledge flags to defaults
 */
export function resetKnowledgeFlags(): void {
  try {
    localStorage.removeItem(KNOWLEDGE_FLAGS_KEY);
  } catch (e) {
    console.warn('Failed to reset knowledge feature flags:', e);
  }
}

/**
 * Enable admin mode (all features on for testing)
 */
export function enableKnowledgeAdminMode(): void {
  setKnowledgeFlags(ADMIN_KNOWLEDGE_FLAGS);
}

/**
 * Disable all knowledge features (safe mode)
 */
export function disableAllKnowledgeFeatures(): void {
  setKnowledgeFlags({
    KNOWLEDGE_CACHE_ENABLED: false,
    KNOWLEDGE_ENRICHMENT_ENABLED: false,
    KNOWLEDGE_EVIDENCE_UI_ENABLED: false,
    KNOWLEDGE_ADMIN_DASHBOARD_ENABLED: false,
    KNOWLEDGE_SHADOW_MODE: true,
    KNOWLEDGE_ZERO_HALLUCINATION_ENABLED: true,
  });
}

// Convenience getters
export function isKnowledgeCacheEnabled(): boolean {
  return getKnowledgeFlags().KNOWLEDGE_CACHE_ENABLED;
}

export function isEnrichmentEnabled(): boolean {
  return getKnowledgeFlags().KNOWLEDGE_ENRICHMENT_ENABLED;
}

export function isEvidenceUIEnabled(): boolean {
  return getKnowledgeFlags().KNOWLEDGE_EVIDENCE_UI_ENABLED;
}

export function isKnowledgeAdminEnabled(): boolean {
  return getKnowledgeFlags().KNOWLEDGE_ADMIN_DASHBOARD_ENABLED;
}

export function isShadowModeEnabled(): boolean {
  return getKnowledgeFlags().KNOWLEDGE_SHADOW_MODE;
}

export function isZeroHallucinationEnabled(): boolean {
  return getKnowledgeFlags().KNOWLEDGE_ZERO_HALLUCINATION_ENABLED;
}

/**
 * Log shadow mode activity (when shadow mode is on)
 */
export function logShadowActivity(action: string, details: Record<string, unknown>): void {
  if (isShadowModeEnabled()) {
    console.log(`[SHADOW MODE] ${action}:`, details);
  }
}

/**
 * Get a summary of current flag states for debugging
 */
export function getKnowledgeFlagsSummary(): string {
  const flags = getKnowledgeFlags();
  return Object.entries(flags)
    .map(([key, value]) => `${key}: ${value ? 'ON' : 'OFF'}`)
    .join('\n');
}
