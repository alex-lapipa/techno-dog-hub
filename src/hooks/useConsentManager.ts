import { useState, useEffect, useCallback } from 'react';
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

const CONSENT_STORAGE_KEY = 'technodog_consent_preferences';
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

export function useConsentManager() {
  const [state, setState] = useState<ConsentState>(() => {
    const sessionId = typeof window !== 'undefined' ? generateSessionId() : '';
    const stored = typeof window !== 'undefined' 
      ? localStorage.getItem(CONSENT_STORAGE_KEY) 
      : null;
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          preferences: { ...defaultPreferences, ...parsed.preferences },
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

  // Record consent to database
  const recordConsent = useCallback(async (
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
  }, [state.sessionId]);

  // Accept all cookies
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
    
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({
      preferences: newPreferences,
      consentVersion: CONSENT_VERSION,
      updatedAt: new Date().toISOString(),
    }));
    
    setShowBanner(false);
    await recordConsent(newPreferences, 'granted');
    
    // Enable analytics if accepted
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
      });
    }
  }, [recordConsent]);

  // Reject all non-essential cookies
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
    
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({
      preferences: newPreferences,
      consentVersion: CONSENT_VERSION,
      updatedAt: new Date().toISOString(),
    }));
    
    setShowBanner(false);
    await recordConsent(newPreferences, 'revoked');
    
    // Disable analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
      });
    }
  }, [recordConsent]);

  // Save custom preferences
  const savePreferences = useCallback(async (preferences: ConsentPreferences) => {
    const newPreferences = { ...preferences, essential: true };
    
    setState(prev => ({
      ...prev,
      preferences: newPreferences,
      hasInteracted: true,
    }));
    
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({
      preferences: newPreferences,
      consentVersion: CONSENT_VERSION,
      updatedAt: new Date().toISOString(),
    }));
    
    setShowBanner(false);
    await recordConsent(newPreferences, 'granted');
    
    // Update Google consent mode
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: newPreferences.analytics ? 'granted' : 'denied',
        ad_storage: newPreferences.marketing ? 'granted' : 'denied',
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
