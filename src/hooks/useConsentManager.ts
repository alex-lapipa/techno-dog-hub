import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ConsentPreferences {
  essential: boolean; // Always true, required for site function
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

interface ConsentState {
  preferences: ConsentPreferences;
  hasInteracted: boolean;
  consentVersion: string;
  sessionId: string;
}

// ═══════════════════════════════════════════════════════════════════════
// CONSENT STORAGE KEYS - Synchronized with Musikaze Pro SDK
// ═══════════════════════════════════════════════════════════════════════
const CONSENT_STORAGE_KEY = 'technodog_consent_preferences'; // Legacy key
const MZK_CONSENT_KEY = 'mzk_consent'; // Musikaze Pro SDK key
const CONSENT_VERSION = '1.0';

// Generate a session ID for anonymous consent tracking
const generateSessionId = (): string => {
  const existing = sessionStorage.getItem('technodog_session_id');
  if (existing) return existing;
  const newId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('technodog_session_id', newId);
  return newId;
};

// Hash IP/UA for privacy-safe storage
const hashForPrivacy = async (value: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(value + 'technodog_salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
};

const defaultPreferences: ConsentPreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  personalization: false,
};

// ═══════════════════════════════════════════════════════════════════════
// Read consent from Musikaze Pro SDK storage
// ═══════════════════════════════════════════════════════════════════════
const readMzkConsent = (): ConsentPreferences | null => {
  try {
    const stored = localStorage.getItem(MZK_CONSENT_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Musikaze Pro stores in format: { preferences: { analytics, marketing, ... }, ... }
      if (parsed.preferences) {
        return {
          essential: true, // Always true
          analytics: parsed.preferences.analytics ?? false,
          marketing: parsed.preferences.marketing ?? false,
          personalization: parsed.preferences.personalization ?? false,
        };
      }
      // Alternative format: direct consent object
      if (typeof parsed.analytics !== 'undefined') {
        return {
          essential: true,
          analytics: parsed.analytics ?? false,
          marketing: parsed.marketing ?? false,
          personalization: parsed.personalization ?? false,
        };
      }
    }
  } catch {
    // Invalid stored data
  }
  return null;
};

// ═══════════════════════════════════════════════════════════════════════
// Write consent to Musikaze Pro SDK storage (for sync)
// ═══════════════════════════════════════════════════════════════════════
const writeMzkConsent = (preferences: ConsentPreferences): void => {
  try {
    const mzkData = {
      preferences: {
        essential: true,
        analytics: preferences.analytics,
        marketing: preferences.marketing,
        personalization: preferences.personalization,
      },
      version: CONSENT_VERSION,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(MZK_CONSENT_KEY, JSON.stringify(mzkData));
  } catch {
    // Storage error
  }
};

// ═══════════════════════════════════════════════════════════════════════
// Dispatch Musikaze Pro consent change event
// ═══════════════════════════════════════════════════════════════════════
const dispatchMzkConsentEvent = (preferences: ConsentPreferences): void => {
  const event = new CustomEvent('mzk:consent:change', {
    detail: {
      consent: {
        essential: true,
        analytics: preferences.analytics,
        marketing: preferences.marketing,
        personalization: preferences.personalization,
      },
      source: 'technodog_react',
    },
  });
  window.dispatchEvent(event);
};

export function useConsentManager() {
  const isInternalUpdate = useRef(false);
  
  const [state, setState] = useState<ConsentState>(() => {
    const sessionId = typeof window !== 'undefined' ? generateSessionId() : '';
    
    // Priority: 1. Musikaze Pro SDK, 2. Legacy storage
    const mzkConsent = typeof window !== 'undefined' ? readMzkConsent() : null;
    
    if (mzkConsent) {
      return {
        preferences: mzkConsent,
        hasInteracted: true,
        consentVersion: CONSENT_VERSION,
        sessionId,
      };
    }
    
    // Fallback to legacy storage
    const stored = typeof window !== 'undefined' 
      ? localStorage.getItem(CONSENT_STORAGE_KEY) 
      : null;
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const prefs = { ...defaultPreferences, ...parsed.preferences };
        // Sync to Musikaze Pro
        if (typeof window !== 'undefined') {
          writeMzkConsent(prefs);
        }
        return {
          preferences: prefs,
          hasInteracted: true,
          consentVersion: parsed.consentVersion || CONSENT_VERSION,
          sessionId,
        };
      } catch {
        // Invalid stored data
      }
    }
    
    return {
      preferences: defaultPreferences,
      hasInteracted: false,
      consentVersion: CONSENT_VERSION,
      sessionId,
    };
  });

  const [showBanner, setShowBanner] = useState(!state.hasInteracted);

  // ═══════════════════════════════════════════════════════════════════════
  // Listen to Musikaze Pro SDK consent changes
  // ═══════════════════════════════════════════════════════════════════════
  useEffect(() => {
    const handleMzkConsentChange = (e: CustomEvent<{ consent: ConsentPreferences; source?: string }>) => {
      // Ignore events dispatched by this component to avoid loops
      if (e.detail.source === 'technodog_react') return;
      
      isInternalUpdate.current = true;
      
      const newPreferences: ConsentPreferences = {
        essential: true,
        analytics: e.detail.consent.analytics ?? false,
        marketing: e.detail.consent.marketing ?? false,
        personalization: e.detail.consent.personalization ?? false,
      };
      
      setState(prev => ({
        ...prev,
        preferences: newPreferences,
        hasInteracted: true,
      }));
      
      // Also update legacy storage for backwards compatibility
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({
        preferences: newPreferences,
        consentVersion: CONSENT_VERSION,
        updatedAt: new Date().toISOString(),
      }));
      
      setShowBanner(false);
      
      // Record to database
      recordConsentInternal(newPreferences, 'granted');
      
      isInternalUpdate.current = false;
    };
    
    window.addEventListener('mzk:consent:change', handleMzkConsentChange as EventListener);
    
    return () => {
      window.removeEventListener('mzk:consent:change', handleMzkConsentChange as EventListener);
    };
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // Record consent to database (internal helper)
  // ═══════════════════════════════════════════════════════════════════════
  const recordConsentInternal = async (
    preferences: ConsentPreferences,
    action: 'granted' | 'revoked'
  ) => {
    const sessionId = state.sessionId;
    const userAgentHash = await hashForPrivacy(navigator.userAgent);
    
    // Get user if authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    // Record each consent type
    const consentTypes = ['analytics', 'marketing', 'personalization'] as const;
    
    for (const type of consentTypes) {
      const isGranted = preferences[type];
      
      await supabase.from('consent_records').insert({
        session_id: sessionId,
        user_id: user?.id || null,
        consent_type: type,
        is_granted: isGranted,
        user_agent_hash: userAgentHash,
        consent_version: CONSENT_VERSION,
        granted_at: isGranted ? new Date().toISOString() : null,
        revoked_at: !isGranted && action === 'revoked' ? new Date().toISOString() : null,
      });
    }
    
    // Log to privacy audit
    await supabase.from('privacy_audit_log').insert([{
      action_type: action === 'granted' ? 'consent_granted' : 'consent_revoked',
      session_id: sessionId,
      user_id: user?.id || null,
      details: JSON.parse(JSON.stringify({ preferences, consent_version: CONSENT_VERSION })),
    }]);
  };

  // Record consent to database (exposed for external use)
  const recordConsent = useCallback(async (
    preferences: ConsentPreferences,
    action: 'granted' | 'revoked'
  ) => {
    await recordConsentInternal(preferences, action);
  }, [state.sessionId]);

  // ═══════════════════════════════════════════════════════════════════════
  // Accept all cookies - synchronized with Musikaze Pro
  // ═══════════════════════════════════════════════════════════════════════
  const acceptAll = useCallback(async () => {
    const newPreferences: ConsentPreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      personalization: true,
    };
    
    setState(prev => ({
      ...prev,
      preferences: newPreferences,
      hasInteracted: true,
    }));
    
    // Update both storage systems
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({
      preferences: newPreferences,
      consentVersion: CONSENT_VERSION,
      updatedAt: new Date().toISOString(),
    }));
    writeMzkConsent(newPreferences);
    
    setShowBanner(false);
    await recordConsent(newPreferences, 'granted');
    
    // Dispatch event to sync with Musikaze Pro SDK
    dispatchMzkConsentEvent(newPreferences);
    
    // Enable analytics if accepted
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
      });
    }
  }, [recordConsent]);

  // ═══════════════════════════════════════════════════════════════════════
  // Reject all non-essential cookies - synchronized with Musikaze Pro
  // ═══════════════════════════════════════════════════════════════════════
  const rejectAll = useCallback(async () => {
    const newPreferences: ConsentPreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      personalization: false,
    };
    
    setState(prev => ({
      ...prev,
      preferences: newPreferences,
      hasInteracted: true,
    }));
    
    // Update both storage systems
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({
      preferences: newPreferences,
      consentVersion: CONSENT_VERSION,
      updatedAt: new Date().toISOString(),
    }));
    writeMzkConsent(newPreferences);
    
    setShowBanner(false);
    await recordConsent(newPreferences, 'revoked');
    
    // Dispatch event to sync with Musikaze Pro SDK
    dispatchMzkConsentEvent(newPreferences);
    
    // Disable analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
    }
  }, [recordConsent]);

  // ═══════════════════════════════════════════════════════════════════════
  // Save custom preferences - synchronized with Musikaze Pro
  // ═══════════════════════════════════════════════════════════════════════
  const savePreferences = useCallback(async (preferences: ConsentPreferences) => {
    const newPreferences = { ...preferences, essential: true };
    
    setState(prev => ({
      ...prev,
      preferences: newPreferences,
      hasInteracted: true,
    }));
    
    // Update both storage systems
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({
      preferences: newPreferences,
      consentVersion: CONSENT_VERSION,
      updatedAt: new Date().toISOString(),
    }));
    writeMzkConsent(newPreferences);
    
    setShowBanner(false);
    await recordConsent(newPreferences, 'granted');
    
    // Dispatch event to sync with Musikaze Pro SDK
    dispatchMzkConsentEvent(newPreferences);
    
    // Update Google consent mode
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: newPreferences.analytics ? 'granted' : 'denied',
        ad_storage: newPreferences.marketing ? 'granted' : 'denied',
        ad_user_data: newPreferences.marketing ? 'granted' : 'denied',
        ad_personalization: newPreferences.marketing ? 'granted' : 'denied',
      });
    }
  }, [recordConsent]);

  // Open settings to modify preferences
  const openSettings = useCallback(() => {
    setShowBanner(true);
  }, []);

  // Check if a specific consent type is granted
  const hasConsent = useCallback((type: keyof ConsentPreferences): boolean => {
    return state.preferences[type];
  }, [state.preferences]);

  return {
    preferences: state.preferences,
    hasInteracted: state.hasInteracted,
    showBanner,
    setShowBanner,
    acceptAll,
    rejectAll,
    savePreferences,
    openSettings,
    hasConsent,
  };
}

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default useConsentManager;
