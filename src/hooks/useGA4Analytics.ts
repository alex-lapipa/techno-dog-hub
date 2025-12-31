import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

type GA4EventParams = Record<string, string | number | boolean | null | undefined>;

interface EngagementMetrics {
  timeOnPage: number;
  scrollDepth: number;
  interactions: number;
  contentType: string;
}

/**
 * Advanced GA4 Analytics Hook
 * Provides deep event tracking for comprehensive analytics
 */
export const useGA4Analytics = () => {
  const location = useLocation();
  const pageLoadTime = useRef<number>(Date.now());
  const interactionCount = useRef<number>(0);
  const maxScrollDepth = useRef<number>(0);

  // Core gtag event function
  const trackEvent = useCallback((
    eventName: string,
    params?: GA4EventParams
  ) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        ...params,
        page_location: window.location.href,
        page_path: location.pathname,
        page_title: document.title,
        timestamp: new Date().toISOString(),
      });
    }
  }, [location.pathname]);

  // Enhanced page view tracking with content categorization
  const trackPageView = useCallback((
    pageTitle: string,
    contentGroup?: string,
    contentType?: string
  ) => {
    trackEvent('page_view', {
      page_title: pageTitle,
      content_group: contentGroup || 'general',
      content_type: contentType || 'page',
      page_referrer: document.referrer || '(direct)',
      user_agent_category: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
    });
    
    // Reset metrics for new page
    pageLoadTime.current = Date.now();
    interactionCount.current = 0;
    maxScrollDepth.current = 0;
  }, [trackEvent]);

  // Track user engagement with content
  const trackEngagement = useCallback((
    engagementType: 'click' | 'view' | 'hover' | 'focus' | 'submit',
    elementName: string,
    elementType: string,
    additionalParams?: GA4EventParams
  ) => {
    interactionCount.current += 1;
    
    trackEvent('user_engagement', {
      engagement_type: engagementType,
      element_name: elementName,
      element_type: elementType,
      interaction_count: interactionCount.current,
      time_since_page_load: Date.now() - pageLoadTime.current,
      ...additionalParams,
    });
  }, [trackEvent]);

  // Track content interactions (cards, items, etc.)
  const trackContentInteraction = useCallback((
    contentType: 'artist' | 'festival' | 'venue' | 'gear' | 'label' | 'news' | 'book' | 'documentary',
    action: 'view' | 'click' | 'expand' | 'share' | 'save',
    contentId: string,
    contentName: string,
    additionalParams?: GA4EventParams
  ) => {
    trackEvent('content_interaction', {
      content_type: contentType,
      content_action: action,
      content_id: contentId,
      content_name: contentName,
      ...additionalParams,
    });
  }, [trackEvent]);

  // Track search behavior
  const trackSearch = useCallback((
    searchTerm: string,
    searchType: 'global' | 'artists' | 'gear' | 'festivals' | 'venues' | 'labels',
    resultsCount: number,
    filtersApplied?: string[]
  ) => {
    trackEvent('search', {
      search_term: searchTerm,
      search_type: searchType,
      results_count: resultsCount,
      filters_applied: filtersApplied?.join(',') || 'none',
      search_length: searchTerm.length,
    });
  }, [trackEvent]);

  // Track filter usage
  const trackFilter = useCallback((
    filterType: string,
    filterValue: string,
    pageContext: string
  ) => {
    trackEvent('filter_applied', {
      filter_type: filterType,
      filter_value: filterValue,
      page_context: pageContext,
    });
  }, [trackEvent]);

  // Track navigation behavior
  const trackNavigation = useCallback((
    navigationType: 'menu' | 'link' | 'button' | 'breadcrumb' | 'pagination',
    fromSection: string,
    toSection: string,
    navigationMethod: 'click' | 'keyboard' | 'swipe' = 'click'
  ) => {
    trackEvent('navigation', {
      navigation_type: navigationType,
      from_section: fromSection,
      to_section: toSection,
      navigation_method: navigationMethod,
    });
  }, [trackEvent]);

  // Track scroll depth with enhanced metrics
  const trackScrollDepth = useCallback((
    depth: number,
    contentLength: 'short' | 'medium' | 'long',
    pageName: string
  ) => {
    if (depth > maxScrollDepth.current) {
      maxScrollDepth.current = depth;
      
      // Track milestone depths
      const milestones = [25, 50, 75, 90, 100];
      milestones.forEach(milestone => {
        if (depth >= milestone && maxScrollDepth.current < milestone) {
          trackEvent('scroll_milestone', {
            scroll_depth: milestone,
            content_length: contentLength,
            page_name: pageName,
            time_to_reach: Date.now() - pageLoadTime.current,
          });
        }
      });
    }
  }, [trackEvent]);

  // Track form interactions
  const trackFormInteraction = useCallback((
    formName: string,
    action: 'start' | 'field_focus' | 'field_blur' | 'submit' | 'error' | 'success',
    fieldName?: string,
    errorMessage?: string
  ) => {
    trackEvent('form_interaction', {
      form_name: formName,
      form_action: action,
      field_name: fieldName || null,
      error_message: errorMessage || null,
      form_time: Date.now() - pageLoadTime.current,
    });
  }, [trackEvent]);

  // Track outbound links
  const trackOutboundLink = useCallback((
    url: string,
    linkText: string,
    linkContext: string
  ) => {
    trackEvent('outbound_click', {
      link_url: url,
      link_text: linkText,
      link_context: linkContext,
      link_domain: new URL(url).hostname,
    });
  }, [trackEvent]);

  // Track file downloads
  const trackDownload = useCallback((
    fileName: string,
    fileType: string,
    fileSize?: number
  ) => {
    trackEvent('file_download', {
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize || null,
    });
  }, [trackEvent]);

  // Track video/audio interactions
  const trackMediaInteraction = useCallback((
    mediaType: 'video' | 'audio',
    action: 'play' | 'pause' | 'complete' | 'progress',
    mediaTitle: string,
    progressPercent?: number
  ) => {
    trackEvent('media_interaction', {
      media_type: mediaType,
      media_action: action,
      media_title: mediaTitle,
      progress_percent: progressPercent || null,
    });
  }, [trackEvent]);

  // Track social shares
  const trackSocialShare = useCallback((
    platform: string,
    contentType: string,
    contentId: string,
    shareMethod: 'button' | 'native' | 'copy_link'
  ) => {
    trackEvent('social_share', {
      share_platform: platform,
      content_type: contentType,
      content_id: contentId,
      share_method: shareMethod,
    });
  }, [trackEvent]);

  // Track errors
  const trackError = useCallback((
    errorType: 'javascript' | 'network' | 'validation' | 'api',
    errorMessage: string,
    errorContext?: string
  ) => {
    trackEvent('error_occurred', {
      error_type: errorType,
      error_message: errorMessage.slice(0, 100),
      error_context: errorContext || location.pathname,
    });
  }, [trackEvent, location.pathname]);

  // Track timing for performance monitoring
  const trackTiming = useCallback((
    category: string,
    variable: string,
    value: number,
    label?: string
  ) => {
    trackEvent('timing_complete', {
      timing_category: category,
      timing_variable: variable,
      timing_value: value,
      timing_label: label || null,
    });
  }, [trackEvent]);

  // Track conversion events
  const trackConversion = useCallback((
    conversionType: 'signup' | 'submission' | 'api_request' | 'newsletter' | 'support',
    conversionValue?: number,
    conversionLabel?: string
  ) => {
    trackEvent('conversion', {
      conversion_type: conversionType,
      conversion_value: conversionValue || 0,
      conversion_label: conversionLabel || null,
    });
  }, [trackEvent]);

  // Track engagement metrics on page leave
  useEffect(() => {
    const handleBeforeUnload = () => {
      const timeOnPage = Date.now() - pageLoadTime.current;
      
      trackEvent('page_exit', {
        time_on_page: timeOnPage,
        max_scroll_depth: maxScrollDepth.current,
        total_interactions: interactionCount.current,
        engagement_score: Math.min(100, (timeOnPage / 1000) + (maxScrollDepth.current / 2) + (interactionCount.current * 5)),
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [trackEvent]);

  // Track visibility changes (tab switches)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        trackEvent('page_visibility', {
          visibility_state: 'hidden',
          time_visible: Date.now() - pageLoadTime.current,
        });
      } else {
        trackEvent('page_visibility', {
          visibility_state: 'visible',
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackEngagement,
    trackContentInteraction,
    trackSearch,
    trackFilter,
    trackNavigation,
    trackScrollDepth,
    trackFormInteraction,
    trackOutboundLink,
    trackDownload,
    trackMediaInteraction,
    trackSocialShare,
    trackError,
    trackTiming,
    trackConversion,
  };
};
