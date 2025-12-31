import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Type declarations for GTM dataLayer
declare global {
  interface Window {
    dataLayer: DataLayerEvent[];
  }
}

interface DataLayerEvent {
  event: string;
  [key: string]: any;
}

// Content categorization for GA4
const CONTENT_GROUPS: Record<string, string> = {
  '/artists': 'Artists',
  '/festivals': 'Festivals',
  '/venues': 'Venues',
  '/gear': 'Gear',
  '/labels': 'Labels',
  '/crews': 'Crews',
  '/books': 'Books',
  '/documentaries': 'Documentaries',
  '/news': 'News',
  '/doggies': 'Doggies',
  '/community': 'Community',
  '/admin': 'Admin',
  '/developer': 'Developer',
  '/store': 'Store',
};

const getContentGroup = (path: string): string => {
  for (const [prefix, group] of Object.entries(CONTENT_GROUPS)) {
    if (path.startsWith(prefix)) return group;
  }
  return 'General';
};

const getContentType = (path: string): string => {
  const parts = path.split('/').filter(Boolean);
  if (parts.length >= 2 && parts[0] !== 'admin') return 'detail';
  if (parts.length === 1) return 'list';
  return 'page';
};

/**
 * Enhanced GTM DataLayer Hook
 * Pushes rich events to window.dataLayer for Google Tag Manager
 */
export const useGTMDataLayer = () => {
  const location = useLocation();
  const sessionStartTime = useRef<number>(Date.now());
  const pageViewTime = useRef<number>(Date.now());
  const interactionSequence = useRef<number>(0);
  const hoverTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Initialize dataLayer
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
  }, []);

  // Core push function
  const pushEvent = useCallback((event: DataLayerEvent) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        ...event,
        timestamp: new Date().toISOString(),
        sessionDuration: Math.round((Date.now() - sessionStartTime.current) / 1000),
        pageTime: Math.round((Date.now() - pageViewTime.current) / 1000),
        interactionIndex: interactionSequence.current++,
      });
    }
  }, []);

  // Enhanced page view with user journey context
  const pushPageView = useCallback((customData?: Record<string, any>) => {
    pageViewTime.current = Date.now();
    
    pushEvent({
      event: 'page_view_enhanced',
      page_path: location.pathname,
      page_search: location.search,
      page_hash: location.hash,
      page_title: document.title,
      page_referrer: document.referrer,
      content_group: getContentGroup(location.pathname),
      content_type: getContentType(location.pathname),
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      device_pixel_ratio: window.devicePixelRatio,
      connection_type: (navigator as any).connection?.effectiveType || 'unknown',
      user_agent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      is_mobile: /Mobile|Android|iPhone/i.test(navigator.userAgent),
      is_touch_device: 'ontouchstart' in window,
      ...customData,
    });
  }, [location, pushEvent]);

  // Track all clicks with element context
  const pushClick = useCallback((
    elementType: string,
    elementId: string,
    elementText: string,
    additionalData?: Record<string, any>
  ) => {
    pushEvent({
      event: 'element_click',
      element_type: elementType,
      element_id: elementId,
      element_text: elementText.slice(0, 100),
      click_path: location.pathname,
      click_x: (additionalData?.clientX ?? 0),
      click_y: (additionalData?.clientY ?? 0),
      ...additionalData,
    });
  }, [location.pathname, pushEvent]);

  // Track hovers with dwell time (debounced to 500ms minimum)
  const pushHover = useCallback((
    elementType: string,
    elementId: string,
    action: 'enter' | 'leave',
    dwellTime?: number
  ) => {
    if (action === 'enter') {
      // Clear any existing timeout
      const existingTimeout = hoverTimeouts.current.get(elementId);
      if (existingTimeout) clearTimeout(existingTimeout);
      
      // Set new timeout to only track meaningful hovers
      const timeout = setTimeout(() => {
        pushEvent({
          event: 'element_hover',
          element_type: elementType,
          element_id: elementId,
          hover_action: 'engaged',
          hover_path: location.pathname,
        });
      }, 500);
      
      hoverTimeouts.current.set(elementId, timeout);
    } else {
      const timeout = hoverTimeouts.current.get(elementId);
      if (timeout) {
        clearTimeout(timeout);
        hoverTimeouts.current.delete(elementId);
      }
      
      if (dwellTime && dwellTime >= 500) {
        pushEvent({
          event: 'element_hover_complete',
          element_type: elementType,
          element_id: elementId,
          dwell_time_ms: dwellTime,
          hover_path: location.pathname,
        });
      }
    }
  }, [location.pathname, pushEvent]);

  // Track scroll milestones
  const pushScrollMilestone = useCallback((
    depth: number,
    direction: 'down' | 'up',
    contentHeight: number
  ) => {
    pushEvent({
      event: 'scroll_milestone',
      scroll_depth_percent: depth,
      scroll_direction: direction,
      content_height: contentHeight,
      viewport_height: window.innerHeight,
      scroll_path: location.pathname,
    });
  }, [location.pathname, pushEvent]);

  // Track search interactions
  const pushSearch = useCallback((
    searchTerm: string,
    searchType: string,
    resultsCount: number,
    filters?: string[]
  ) => {
    pushEvent({
      event: 'search_performed',
      search_term: searchTerm,
      search_type: searchType,
      search_results_count: resultsCount,
      search_filters: filters?.join(',') || '',
      search_term_length: searchTerm.length,
      search_path: location.pathname,
    });
  }, [location.pathname, pushEvent]);

  // Track filter usage
  const pushFilter = useCallback((
    filterType: string,
    filterValue: string,
    filterAction: 'apply' | 'remove' | 'clear'
  ) => {
    pushEvent({
      event: 'filter_interaction',
      filter_type: filterType,
      filter_value: filterValue,
      filter_action: filterAction,
      filter_path: location.pathname,
    });
  }, [location.pathname, pushEvent]);

  // Track content engagement
  const pushContentEngagement = useCallback((
    contentType: string,
    contentId: string,
    contentName: string,
    engagementType: 'view' | 'click' | 'expand' | 'share' | 'save' | 'external_link'
  ) => {
    pushEvent({
      event: 'content_engagement',
      content_type: contentType,
      content_id: contentId,
      content_name: contentName.slice(0, 100),
      engagement_type: engagementType,
      engagement_path: location.pathname,
    });
  }, [location.pathname, pushEvent]);

  // Track form interactions
  const pushFormInteraction = useCallback((
    formName: string,
    action: 'start' | 'field_focus' | 'field_blur' | 'field_error' | 'submit_attempt' | 'submit_success' | 'submit_error',
    fieldName?: string,
    errorMessage?: string
  ) => {
    pushEvent({
      event: 'form_interaction',
      form_name: formName,
      form_action: action,
      form_field: fieldName || '',
      form_error: errorMessage || '',
      form_path: location.pathname,
    });
  }, [location.pathname, pushEvent]);

  // Track navigation patterns
  const pushNavigation = useCallback((
    navigationType: 'menu_click' | 'breadcrumb' | 'internal_link' | 'back_button' | 'logo' | 'cta',
    fromPath: string,
    toPath: string
  ) => {
    pushEvent({
      event: 'navigation_event',
      navigation_type: navigationType,
      navigation_from: fromPath,
      navigation_to: toPath,
    });
  }, [pushEvent]);

  // Track outbound links
  const pushOutboundLink = useCallback((
    url: string,
    linkText: string,
    linkContext: string
  ) => {
    const domain = new URL(url).hostname;
    pushEvent({
      event: 'outbound_link_click',
      outbound_url: url,
      outbound_domain: domain,
      outbound_text: linkText.slice(0, 100),
      outbound_context: linkContext,
      outbound_path: location.pathname,
    });
  }, [location.pathname, pushEvent]);

  // Track media interactions
  const pushMediaEvent = useCallback((
    mediaType: 'video' | 'audio' | 'image',
    action: 'play' | 'pause' | 'complete' | 'progress' | 'fullscreen' | 'mute',
    mediaId: string,
    mediaTitle: string,
    progress?: number
  ) => {
    pushEvent({
      event: 'media_interaction',
      media_type: mediaType,
      media_action: action,
      media_id: mediaId,
      media_title: mediaTitle.slice(0, 100),
      media_progress_percent: progress || 0,
      media_path: location.pathname,
    });
  }, [location.pathname, pushEvent]);

  // Track ecommerce/store events
  const pushEcommerce = useCallback((
    action: 'view_item' | 'add_to_cart' | 'remove_from_cart' | 'begin_checkout' | 'purchase',
    items: Array<{id: string; name: string; price?: number; quantity?: number}>,
    value?: number,
    currency?: string
  ) => {
    pushEvent({
      event: `ecommerce_${action}`,
      ecommerce_action: action,
      ecommerce_items: items,
      ecommerce_value: value || 0,
      ecommerce_currency: currency || 'EUR',
      ecommerce_item_count: items.length,
    });
  }, [pushEvent]);

  // Track user journey milestones
  const pushJourneyMilestone = useCallback((
    milestone: 'first_interaction' | 'engaged_user' | 'returning_visit' | 'deep_scroll' | 'multi_page' | 'conversion',
    details?: Record<string, any>
  ) => {
    pushEvent({
      event: 'user_journey_milestone',
      milestone_type: milestone,
      milestone_details: details || {},
      pages_viewed: interactionSequence.current,
      session_duration_seconds: Math.round((Date.now() - sessionStartTime.current) / 1000),
    });
  }, [pushEvent]);

  // Track errors
  const pushError = useCallback((
    errorType: 'javascript' | 'network' | 'api' | 'validation' | '404',
    errorMessage: string,
    errorStack?: string
  ) => {
    pushEvent({
      event: 'error_occurred',
      error_type: errorType,
      error_message: errorMessage.slice(0, 200),
      error_stack: errorStack?.slice(0, 500) || '',
      error_path: location.pathname,
    });
  }, [location.pathname, pushEvent]);

  // Track performance metrics
  const pushPerformance = useCallback((
    metric: 'page_load' | 'api_response' | 'render_time',
    value: number,
    context?: string
  ) => {
    pushEvent({
      event: 'performance_metric',
      performance_metric: metric,
      performance_value_ms: value,
      performance_context: context || '',
      performance_path: location.pathname,
    });
  }, [location.pathname, pushEvent]);

  // Auto-track page views on route change
  useEffect(() => {
    pushPageView();
  }, [location.pathname, pushPageView]);

  // Track visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      pushEvent({
        event: 'page_visibility_change',
        visibility_state: document.hidden ? 'hidden' : 'visible',
        visibility_path: location.pathname,
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [location.pathname, pushEvent]);

  // Track session end
  useEffect(() => {
    const handleBeforeUnload = () => {
      pushEvent({
        event: 'session_end',
        session_duration_seconds: Math.round((Date.now() - sessionStartTime.current) / 1000),
        pages_viewed: interactionSequence.current,
        final_path: location.pathname,
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [location.pathname, pushEvent]);

  return {
    pushEvent,
    pushPageView,
    pushClick,
    pushHover,
    pushScrollMilestone,
    pushSearch,
    pushFilter,
    pushContentEngagement,
    pushFormInteraction,
    pushNavigation,
    pushOutboundLink,
    pushMediaEvent,
    pushEcommerce,
    pushJourneyMilestone,
    pushError,
    pushPerformance,
  };
};
