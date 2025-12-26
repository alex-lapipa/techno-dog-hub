import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Generate a session ID that persists for the browser session
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

type JsonValue = string | number | boolean | null;
type JsonMetadata = Record<string, JsonValue>;

interface TrackEventOptions {
  eventType: string;
  eventName: string;
  metadata?: JsonMetadata;
}

export const useAnalytics = () => {
  const { user } = useAuth();
  const location = useLocation();
  const lastPathRef = useRef<string>('');

  const trackEvent = useCallback(async ({ eventType, eventName, metadata = {} }: TrackEventOptions) => {
    try {
      await supabase.from('analytics_events').insert([{
        user_id: user?.id || null,
        event_type: eventType,
        event_name: eventName,
        page_path: location.pathname,
        metadata,
        session_id: getSessionId(),
      }]);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }, [user?.id, location.pathname]);

  // Track page views automatically
  useEffect(() => {
    if (location.pathname !== lastPathRef.current) {
      lastPathRef.current = location.pathname;
      trackEvent({
        eventType: 'page_view',
        eventName: 'view',
        metadata: {
          referrer: document.referrer,
          title: document.title,
        },
      });
    }
  }, [location.pathname, trackEvent]);

  // Convenience methods
  const trackClick = useCallback((elementName: string, metadata?: JsonMetadata) => {
    trackEvent({ eventType: 'interaction', eventName: `click_${elementName}`, metadata });
  }, [trackEvent]);

  const trackSearch = useCallback((query: string, resultsCount: number) => {
    trackEvent({ 
      eventType: 'search', 
      eventName: 'search_query', 
      metadata: { query, resultsCount } 
    });
  }, [trackEvent]);

  const trackNavigation = useCallback((from: string, to: string) => {
    trackEvent({ 
      eventType: 'navigation', 
      eventName: 'navigate', 
      metadata: { from, to } 
    });
  }, [trackEvent]);

  const trackError = useCallback((errorMessage: string, errorStack?: string) => {
    trackEvent({ 
      eventType: 'error', 
      eventName: 'client_error', 
      metadata: { errorMessage, errorStack: errorStack || null } 
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackClick,
    trackSearch,
    trackNavigation,
    trackError,
  };
};
