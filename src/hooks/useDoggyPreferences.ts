import { useState, useEffect, useCallback } from 'react';

interface DoggyPreferences {
  visitCount: number;
  lastShownDog: string | null;
  hasConsented: boolean;
  selectedDogs: string[];
}

const STORAGE_KEYS = {
  VISIT_COUNT: 'doggy_visit_count',
  LAST_SHOWN: 'doggy_last_shown',
  CONSENT: 'technodog_sticker_consent',
  SELECTED_DOGS: 'doggy_selected_dogs',
} as const;

export function useDoggyPreferences() {
  const [preferences, setPreferences] = useState<DoggyPreferences>(() => ({
    visitCount: 0,
    lastShownDog: null,
    hasConsented: false,
    selectedDogs: [],
  }));

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const visitCount = parseInt(localStorage.getItem(STORAGE_KEYS.VISIT_COUNT) || '0', 10);
    const lastShownDog = localStorage.getItem(STORAGE_KEYS.LAST_SHOWN);
    const hasConsented = localStorage.getItem(STORAGE_KEYS.CONSENT) === 'true';
    const selectedDogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.SELECTED_DOGS) || '[]');

    setPreferences({
      visitCount,
      lastShownDog,
      hasConsented,
      selectedDogs,
    });
  }, []);

  const incrementVisitCount = useCallback(() => {
    setPreferences(prev => {
      const newCount = prev.visitCount + 1;
      localStorage.setItem(STORAGE_KEYS.VISIT_COUNT, String(newCount));
      return { ...prev, visitCount: newCount };
    });
  }, []);

  const setLastShownDog = useCallback((dogName: string) => {
    localStorage.setItem(STORAGE_KEYS.LAST_SHOWN, dogName);
    setPreferences(prev => ({ ...prev, lastShownDog: dogName }));
  }, []);

  const setConsented = useCallback((consented: boolean) => {
    localStorage.setItem(STORAGE_KEYS.CONSENT, String(consented));
    setPreferences(prev => ({ ...prev, hasConsented: consented }));
  }, []);

  const updateSelectedDogs = useCallback((dogs: string[]) => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_DOGS, JSON.stringify(dogs));
    setPreferences(prev => ({ ...prev, selectedDogs: dogs }));
  }, []);

  const clearPreferences = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    setPreferences({
      visitCount: 0,
      lastShownDog: null,
      hasConsented: false,
      selectedDogs: [],
    });
  }, []);

  return {
    ...preferences,
    incrementVisitCount,
    setLastShownDog,
    setConsented,
    updateSelectedDogs,
    clearPreferences,
  };
}

export default useDoggyPreferences;
