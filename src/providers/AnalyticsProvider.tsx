import { createContext, useContext, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useGTMDataLayer } from '@/hooks/useGTMDataLayer';
import { useGA4Analytics } from '@/hooks/useGA4Analytics';
import { useAnalytics } from '@/hooks/useAnalytics';

// Enhanced GTM configuration
interface GTMConfig {
  containerId: string;
  dataLayerName: string;
  enableDebug: boolean;
}

const GTM_CONFIG: GTMConfig = {
  containerId: 'GTM-532T46V5',
  dataLayerName: 'dataLayer',
  enableDebug: import.meta.env.DEV,
};

// Unified analytics context
interface AnalyticsContextType {
  // GTM
  pushGTMEvent: (event: string, data?: Record<string, any>) => void;
  // GA4
  trackGA4Event: (event: string, params?: Record<string, any>) => void;
  // Unified tracking
  trackPageView: (pageName: string, metadata?: Record<string, any>) => void;
  trackUserAction: (action: string, category: string, label?: string, value?: number) => void;
  trackContentView: (contentType: string, contentId: string, contentName: string) => void;
  trackSearch: (query: string, category: string, resultsCount: number) => void;
  trackClick: (element: string, context: string, url?: string) => void;
  trackError: (errorType: string, message: string, context?: string) => void;
  trackConversion: (conversionType: string, value?: number) => void;
  trackEngagement: (engagementType: string, durationMs?: number) => void;
  trackSocialShare: (platform: string, contentType: string, contentId: string) => void;
  trackMediaPlay: (mediaType: 'audio' | 'video', mediaId: string, mediaTitle: string) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

// User engagement tracking
interface EngagementState {
  pageEntryTime: number;
  scrollDepthMax: number;
  clickCount: number;
  timeOnPage: number;
  isEngaged: boolean;
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const gtm = useGTMDataLayer();
  const ga4 = useGA4Analytics();
  const internal = useAnalytics();
  
  const engagementState = useRef<EngagementState>({
    pageEntryTime: Date.now(),
    scrollDepthMax: 0,
    clickCount: 0,
    timeOnPage: 0,
    isEngaged: false,
  });

  // Initialize enhanced GTM tracking
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Ensure dataLayer exists
    window.dataLayer = window.dataLayer || [];

    // Push initial config
    window.dataLayer.push({
      event: 'gtm.init',
      'gtm.containerId': GTM_CONFIG.containerId,
      'gtm.debug': GTM_CONFIG.enableDebug,
      pageType: getPageType(location.pathname),
      contentGroup: getContentGroup(location.pathname),
      userType: getUserType(),
      deviceCategory: getDeviceCategory(),
      browserInfo: getBrowserInfo(),
    });

    // Set up enhanced link tracking
    setupEnhancedLinkTracking();

    // Set up scroll tracking
    setupScrollTracking();

    // Set up error tracking
    setupErrorTracking();

    // Set up performance tracking
    setupPerformanceTracking();
  }, []);

  // Track page views with enhanced context
  useEffect(() => {
    engagementState.current = {
      pageEntryTime: Date.now(),
      scrollDepthMax: 0,
      clickCount: 0,
      timeOnPage: 0,
      isEngaged: false,
    };

    const pageData = {
      event: 'page_view',
      page_path: location.pathname,
      page_search: location.search,
      page_title: document.title,
      page_type: getPageType(location.pathname),
      content_group: getContentGroup(location.pathname),
      content_category: getContentCategory(location.pathname),
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
      user_type: getUserType(),
      session_id: getSessionId(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };

    window.dataLayer?.push(pageData);
    
    if (GTM_CONFIG.enableDebug) {
      console.log('[GTM Enhanced] Page View:', pageData);
    }
  }, [location.pathname, location.search]);

  // Unified push to GTM
  const pushGTMEvent = useCallback((event: string, data?: Record<string, any>) => {
    const eventData = {
      event,
      ...data,
      timestamp: new Date().toISOString(),
      page_path: location.pathname,
      session_id: getSessionId(),
    };

    window.dataLayer?.push(eventData);
    
    if (GTM_CONFIG.enableDebug) {
      console.log('[GTM Enhanced] Event:', eventData);
    }
  }, [location.pathname]);

  // Unified GA4 tracking
  const trackGA4Event = useCallback((event: string, params?: Record<string, any>) => {
    ga4.trackEvent(event, params);
  }, [ga4]);

  // Unified page view tracking
  const trackPageView = useCallback((pageName: string, metadata?: Record<string, any>) => {
    pushGTMEvent('virtual_page_view', {
      page_name: pageName,
      ...metadata,
    });
    ga4.trackPageView(pageName, metadata?.contentGroup);
    internal.trackEvent({
      eventType: 'page_view',
      eventName: pageName,
      metadata: metadata as any,
    });
  }, [pushGTMEvent, ga4, internal]);

  // User action tracking
  const trackUserAction = useCallback((action: string, category: string, label?: string, value?: number) => {
    engagementState.current.clickCount++;
    
    pushGTMEvent('user_action', {
      action_name: action,
      action_category: category,
      action_label: label,
      action_value: value,
    });
    
    ga4.trackEvent(action, {
      event_category: category,
      event_label: label,
      value,
    });
  }, [pushGTMEvent, ga4]);

  // Content view tracking
  const trackContentView = useCallback((contentType: string, contentId: string, contentName: string) => {
    pushGTMEvent('content_view', {
      content_type: contentType,
      content_id: contentId,
      content_name: contentName,
    });
    
    ga4.trackContentInteraction(
      contentType as any,
      'view',
      contentId,
      contentName
    );
    
    gtm.pushContentEngagement(contentType, contentId, contentName, 'view');
  }, [pushGTMEvent, ga4, gtm]);

  // Search tracking
  const trackSearch = useCallback((query: string, category: string, resultsCount: number) => {
    pushGTMEvent('site_search', {
      search_term: query,
      search_category: category,
      search_results_count: resultsCount,
    });
    
    ga4.trackSearch(query, category as any, resultsCount);
    internal.trackSearch(query, resultsCount);
    gtm.pushSearch(query, category, resultsCount);
  }, [pushGTMEvent, ga4, internal, gtm]);

  // Click tracking with context
  const trackClick = useCallback((element: string, context: string, url?: string) => {
    engagementState.current.clickCount++;
    
    const isOutbound = url && !url.includes(window.location.hostname);
    
    pushGTMEvent(isOutbound ? 'outbound_click' : 'element_click', {
      click_element: element,
      click_context: context,
      click_url: url,
      is_outbound: isOutbound,
    });
    
    if (isOutbound && url) {
      gtm.pushOutboundLink(url, element, context);
    } else {
      gtm.pushClick('element', element, element, { context });
    }
    
    internal.trackClick(element, { context, url });
  }, [pushGTMEvent, gtm, internal]);

  // Error tracking
  const trackError = useCallback((errorType: string, message: string, context?: string) => {
    pushGTMEvent('error_tracking', {
      error_type: errorType,
      error_message: message,
      error_context: context,
    });
    
    ga4.trackError(errorType as any, message, context);
    gtm.pushError(errorType as any, message);
    internal.trackError(message, context);
  }, [pushGTMEvent, ga4, gtm, internal]);

  // Conversion tracking
  const trackConversion = useCallback((conversionType: string, value?: number) => {
    pushGTMEvent('conversion', {
      conversion_type: conversionType,
      conversion_value: value,
    });
    
    ga4.trackConversion(conversionType as any, value);
  }, [pushGTMEvent, ga4]);

  // Engagement tracking
  const trackEngagement = useCallback((engagementType: string, durationMs?: number) => {
    engagementState.current.isEngaged = true;
    
    pushGTMEvent('user_engagement', {
      engagement_type: engagementType,
      engagement_duration_ms: durationMs,
      total_clicks: engagementState.current.clickCount,
      max_scroll_depth: engagementState.current.scrollDepthMax,
    });
    
    gtm.pushJourneyMilestone('engaged_user', {
      engagementType,
      durationMs,
    });
  }, [pushGTMEvent, gtm]);

  // Social share tracking
  const trackSocialShare = useCallback((platform: string, contentType: string, contentId: string) => {
    pushGTMEvent('social_share', {
      share_platform: platform,
      share_content_type: contentType,
      share_content_id: contentId,
    });
    
    ga4.trackSocialShare(platform, contentType, contentId, 'button');
    gtm.pushContentEngagement(contentType, contentId, '', 'share');
  }, [pushGTMEvent, ga4, gtm]);

  // Media play tracking
  const trackMediaPlay = useCallback((mediaType: 'audio' | 'video', mediaId: string, mediaTitle: string) => {
    pushGTMEvent('media_play', {
      media_type: mediaType,
      media_id: mediaId,
      media_title: mediaTitle,
    });
    
    ga4.trackMediaInteraction(mediaType, 'play', mediaTitle);
    gtm.pushMediaEvent(mediaType, 'play', mediaId, mediaTitle);
  }, [pushGTMEvent, ga4, gtm]);

  const contextValue: AnalyticsContextType = {
    pushGTMEvent,
    trackGA4Event,
    trackPageView,
    trackUserAction,
    trackContentView,
    trackSearch,
    trackClick,
    trackError,
    trackConversion,
    trackEngagement,
    trackSocialShare,
    trackMediaPlay,
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useEnhancedAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useEnhancedAnalytics must be used within AnalyticsProvider');
  }
  return context;
}

// Helper functions
function getPageType(path: string): string {
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) return 'homepage';
  if (segments.length === 1) return 'category';
  if (segments.length >= 2) return 'detail';
  return 'page';
}

function getContentGroup(path: string): string {
  const groups: Record<string, string> = {
    '/artists': 'Artists',
    '/festivals': 'Festivals',
    '/venues': 'Venues',
    '/gear': 'Gear',
    '/labels': 'Labels',
    '/books': 'Books',
    '/documentaries': 'Documentaries',
    '/news': 'News',
    '/doggies': 'Doggies',
    '/technopedia': 'Technopedia',
    '/scenes': 'Scenes',
    '/store': 'Store',
    '/admin': 'Admin',
    '/developer': 'Developer',
  };
  
  for (const [prefix, group] of Object.entries(groups)) {
    if (path.startsWith(prefix)) return group;
  }
  return 'General';
}

function getContentCategory(path: string): string {
  const segments = path.split('/').filter(Boolean);
  return segments[0] || 'home';
}

function getUserType(): string {
  const isReturning = localStorage.getItem('td_returning_user');
  if (!isReturning) {
    localStorage.setItem('td_returning_user', 'true');
    return 'new';
  }
  return 'returning';
}

function getSessionId(): string {
  let sessionId = sessionStorage.getItem('td_session_id');
  if (!sessionId) {
    sessionId = `s_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('td_session_id', sessionId);
  }
  return sessionId;
}

function getDeviceCategory(): string {
  const ua = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone/.test(ua)) return 'mobile';
  if (/tablet|ipad/.test(ua)) return 'tablet';
  return 'desktop';
}

function getBrowserInfo(): Record<string, any> {
  return {
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
  };
}

// Enhanced link tracking setup
function setupEnhancedLinkTracking() {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a');
    
    if (link) {
      const href = link.getAttribute('href');
      const text = link.textContent?.trim() || '';
      const isExternal = href && !href.startsWith('/') && !href.includes(window.location.hostname);
      
      window.dataLayer?.push({
        event: isExternal ? 'outbound_link' : 'internal_link',
        link_url: href,
        link_text: text.slice(0, 100),
        link_domain: isExternal && href ? new URL(href).hostname : window.location.hostname,
        link_classes: link.className,
        link_id: link.id,
        click_x: e.clientX,
        click_y: e.clientY,
      });
    }
  });
}

// Scroll depth tracking setup
function setupScrollTracking() {
  let maxScroll = 0;
  const thresholds = [25, 50, 75, 90, 100];
  const triggered = new Set<number>();

  const handleScroll = () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);
    
    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent;
      
      thresholds.forEach(threshold => {
        if (scrollPercent >= threshold && !triggered.has(threshold)) {
          triggered.add(threshold);
          window.dataLayer?.push({
            event: 'scroll_depth',
            scroll_threshold: threshold,
            scroll_direction: 'down',
            page_height: document.documentElement.scrollHeight,
          });
        }
      });
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
}

// Error tracking setup
function setupErrorTracking() {
  window.addEventListener('error', (e) => {
    window.dataLayer?.push({
      event: 'javascript_error',
      error_message: e.message,
      error_filename: e.filename,
      error_lineno: e.lineno,
      error_colno: e.colno,
    });
  });

  window.addEventListener('unhandledrejection', (e) => {
    window.dataLayer?.push({
      event: 'promise_rejection',
      rejection_reason: e.reason?.message || String(e.reason),
    });
  });
}

// Performance tracking setup
function setupPerformanceTracking() {
  if ('performance' in window && 'PerformanceObserver' in window) {
    // Track Core Web Vitals
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.dataLayer?.push({
            event: 'web_vitals',
            metric_name: entry.name,
            metric_value: entry.startTime,
            metric_id: (entry as any).id,
          });
        }
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (e) {
      // PerformanceObserver not supported for these metrics
    }

    // Track page load timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (timing) {
          window.dataLayer?.push({
            event: 'page_timing',
            dns_time: timing.domainLookupEnd - timing.domainLookupStart,
            connect_time: timing.connectEnd - timing.connectStart,
            ttfb: timing.responseStart - timing.requestStart,
            dom_load: timing.domContentLoadedEventEnd - timing.startTime,
            page_load: timing.loadEventEnd - timing.startTime,
          });
        }
      }, 0);
    });
  }
}
