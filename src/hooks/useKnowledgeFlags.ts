import { useState, useEffect, useCallback } from 'react';
import {
  getKnowledgeFlags,
  setKnowledgeFlag,
  setKnowledgeFlags,
  resetKnowledgeFlags,
  enableKnowledgeAdminMode,
  disableAllKnowledgeFeatures,
  type KnowledgeFeatureFlags,
} from '@/lib/knowledgeFeatureFlags';

/**
 * React hook for managing knowledge layer feature flags
 */
export function useKnowledgeFlags() {
  const [flags, setFlags] = useState<KnowledgeFeatureFlags>(getKnowledgeFlags);

  // Sync with localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setFlags(getKnowledgeFlags());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateFlag = useCallback(<K extends keyof KnowledgeFeatureFlags>(
    flag: K,
    value: KnowledgeFeatureFlags[K]
  ) => {
    setKnowledgeFlag(flag, value);
    setFlags(getKnowledgeFlags());
  }, []);

  const updateFlags = useCallback((updates: Partial<KnowledgeFeatureFlags>) => {
    setKnowledgeFlags(updates);
    setFlags(getKnowledgeFlags());
  }, []);

  const reset = useCallback(() => {
    resetKnowledgeFlags();
    setFlags(getKnowledgeFlags());
  }, []);

  const enableAdminMode = useCallback(() => {
    enableKnowledgeAdminMode();
    setFlags(getKnowledgeFlags());
  }, []);

  const disableAll = useCallback(() => {
    disableAllKnowledgeFeatures();
    setFlags(getKnowledgeFlags());
  }, []);

  return {
    flags,
    updateFlag,
    updateFlags,
    reset,
    enableAdminMode,
    disableAll,
    // Convenience accessors
    isCacheEnabled: flags.KNOWLEDGE_CACHE_ENABLED,
    isEnrichmentEnabled: flags.KNOWLEDGE_ENRICHMENT_ENABLED,
    isEvidenceUIEnabled: flags.KNOWLEDGE_EVIDENCE_UI_ENABLED,
    isAdminEnabled: flags.KNOWLEDGE_ADMIN_DASHBOARD_ENABLED,
    isShadowMode: flags.KNOWLEDGE_SHADOW_MODE,
    isZeroHallucinationEnabled: flags.KNOWLEDGE_ZERO_HALLUCINATION_ENABLED,
  };
}
