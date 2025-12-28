/**
 * Feature Flags for Canonical Artist Migration
 * 
 * Controls the rollout of the new unified artist database.
 * These flags enable safe, incremental migration with easy rollback.
 */

// Feature flag storage key
const FEATURE_FLAGS_KEY = 'technodog_feature_flags';

export interface FeatureFlags {
  // Phase A: Read from legacy, write to both legacy + canonical
  USE_CANONICAL_ARTISTS_READ: boolean;
  
  // Phase B: Read from canonical, write to both
  USE_CANONICAL_ARTISTS_WRITE: boolean;
  
  // Phase C: Full canonical mode (read and write canonical only)
  CANONICAL_ONLY_MODE: boolean;
  
  // Enable unified RAG vector store
  USE_UNIFIED_VECTOR_STORE: boolean;
  
  // Show merge review admin tools
  SHOW_MERGE_REVIEW_UI: boolean;
  
  // Enable artist document auto-generation
  AUTO_GENERATE_ARTIST_DOCS: boolean;
}

// Default flags - canonical mode by default (database populated with verified data)
const DEFAULT_FLAGS: FeatureFlags = {
  USE_CANONICAL_ARTISTS_READ: true,
  USE_CANONICAL_ARTISTS_WRITE: true,
  CANONICAL_ONLY_MODE: true,
  USE_UNIFIED_VECTOR_STORE: true,
  SHOW_MERGE_REVIEW_UI: false,
  AUTO_GENERATE_ARTIST_DOCS: true,
};

// Get current feature flags
export function getFeatureFlags(): FeatureFlags {
  if (typeof window === 'undefined') {
    return DEFAULT_FLAGS;
  }
  
  try {
    const stored = localStorage.getItem(FEATURE_FLAGS_KEY);
    if (stored) {
      return { ...DEFAULT_FLAGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn('Failed to parse feature flags:', e);
  }
  
  return DEFAULT_FLAGS;
}

// Set a specific feature flag
export function setFeatureFlag<K extends keyof FeatureFlags>(
  flag: K, 
  value: FeatureFlags[K]
): void {
  const flags = getFeatureFlags();
  flags[flag] = value;
  
  try {
    localStorage.setItem(FEATURE_FLAGS_KEY, JSON.stringify(flags));
  } catch (e) {
    console.warn('Failed to save feature flags:', e);
  }
}

// Set multiple feature flags at once
export function setFeatureFlags(updates: Partial<FeatureFlags>): void {
  const flags = { ...getFeatureFlags(), ...updates };
  
  try {
    localStorage.setItem(FEATURE_FLAGS_KEY, JSON.stringify(flags));
  } catch (e) {
    console.warn('Failed to save feature flags:', e);
  }
}

// Reset all flags to defaults
export function resetFeatureFlags(): void {
  try {
    localStorage.removeItem(FEATURE_FLAGS_KEY);
  } catch (e) {
    console.warn('Failed to reset feature flags:', e);
  }
}

// Convenience getters
export function useCanonicalArtistsRead(): boolean {
  const flags = getFeatureFlags();
  return flags.USE_CANONICAL_ARTISTS_READ || flags.CANONICAL_ONLY_MODE;
}

export function useCanonicalArtistsWrite(): boolean {
  const flags = getFeatureFlags();
  return flags.USE_CANONICAL_ARTISTS_WRITE || flags.CANONICAL_ONLY_MODE;
}

export function useUnifiedVectorStore(): boolean {
  return getFeatureFlags().USE_UNIFIED_VECTOR_STORE;
}

// Migration phase helpers
export type MigrationPhase = 'legacy' | 'dual_write' | 'dual_read' | 'canonical';

export function getCurrentMigrationPhase(): MigrationPhase {
  const flags = getFeatureFlags();
  
  if (flags.CANONICAL_ONLY_MODE) {
    return 'canonical';
  }
  
  if (flags.USE_CANONICAL_ARTISTS_READ) {
    return 'dual_read';
  }
  
  if (flags.USE_CANONICAL_ARTISTS_WRITE) {
    return 'dual_write';
  }
  
  return 'legacy';
}

// Enable specific migration phase
export function setMigrationPhase(phase: MigrationPhase): void {
  switch (phase) {
    case 'legacy':
      setFeatureFlags({
        USE_CANONICAL_ARTISTS_READ: false,
        USE_CANONICAL_ARTISTS_WRITE: false,
        CANONICAL_ONLY_MODE: false,
      });
      break;
    case 'dual_write':
      setFeatureFlags({
        USE_CANONICAL_ARTISTS_READ: false,
        USE_CANONICAL_ARTISTS_WRITE: true,
        CANONICAL_ONLY_MODE: false,
      });
      break;
    case 'dual_read':
      setFeatureFlags({
        USE_CANONICAL_ARTISTS_READ: true,
        USE_CANONICAL_ARTISTS_WRITE: true,
        CANONICAL_ONLY_MODE: false,
      });
      break;
    case 'canonical':
      setFeatureFlags({
        USE_CANONICAL_ARTISTS_READ: true,
        USE_CANONICAL_ARTISTS_WRITE: true,
        CANONICAL_ONLY_MODE: true,
      });
      break;
  }
}
