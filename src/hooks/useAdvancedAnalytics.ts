/**
 * ADVANCED ANALYTICS HOOKS
 * Comprehensive tracking for every interaction across the site
 * Integrates with GA4, GTM, and internal analytics
 */

import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Helper to safely push to dataLayer
const pushToDataLayer = (data: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(data as any);
  }
};

// Helper to safely call gtag
const safeGtag = (command: string, eventName: string, params?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(command as any, eventName, params);
  }
};

// ============================================================================
// CHATBOT ANALYTICS - Track all AI assistant interactions
// ============================================================================
export interface ChatAnalyticsEvent {
  action: 'message_sent' | 'message_received' | 'voice_activated' | 'voice_deactivated' | 
          'suggestion_clicked' | 'error' | 'feedback' | 'copy_response' | 'retry';
  messageLength?: number;
  responseTime?: number;
  voiceDuration?: number;
  suggestion?: string;
  errorType?: string;
  rating?: number;
}

export const useChatAnalytics = (chatType: 'dog_chat' | 'support_chat' | 'voice_assistant' = 'dog_chat') => {
  const messageStartTime = useRef<number>(0);
  const voiceStartTime = useRef<number>(0);
  const conversationLength = useRef<number>(0);
  const location = useLocation();

  const trackChatEvent = useCallback((event: ChatAnalyticsEvent) => {
    const eventData = {
      event: `chat_${event.action}`,
      chat_type: chatType,
      chat_action: event.action,
      message_length: event.messageLength || 0,
      response_time_ms: event.responseTime || 0,
      voice_duration_ms: event.voiceDuration || 0,
      suggestion_text: event.suggestion?.slice(0, 100) || '',
      error_type: event.errorType || '',
      feedback_rating: event.rating || 0,
      conversation_length: conversationLength.current,
      page_path: location.pathname,
      timestamp: new Date().toISOString(),
    };

    pushToDataLayer(eventData);
    safeGtag('event', `chat_${event.action}`, eventData);
  }, [chatType, location.pathname]);

  const startMessage = useCallback(() => {
    messageStartTime.current = Date.now();
  }, []);

  const trackMessageSent = useCallback((messageLength: number) => {
    conversationLength.current++;
    trackChatEvent({
      action: 'message_sent',
      messageLength,
    });
  }, [trackChatEvent]);

  const trackMessageReceived = useCallback((responseLength: number) => {
    const responseTime = Date.now() - messageStartTime.current;
    trackChatEvent({
      action: 'message_received',
      messageLength: responseLength,
      responseTime,
    });
  }, [trackChatEvent]);

  const trackVoiceActivated = useCallback(() => {
    voiceStartTime.current = Date.now();
    trackChatEvent({ action: 'voice_activated' });
  }, [trackChatEvent]);

  const trackVoiceDeactivated = useCallback(() => {
    const voiceDuration = Date.now() - voiceStartTime.current;
    trackChatEvent({ action: 'voice_deactivated', voiceDuration });
  }, [trackChatEvent]);

  const trackSuggestionClicked = useCallback((suggestion: string) => {
    trackChatEvent({ action: 'suggestion_clicked', suggestion });
  }, [trackChatEvent]);

  const trackError = useCallback((errorType: string) => {
    trackChatEvent({ action: 'error', errorType });
  }, [trackChatEvent]);

  return {
    startMessage,
    trackMessageSent,
    trackMessageReceived,
    trackVoiceActivated,
    trackVoiceDeactivated,
    trackSuggestionClicked,
    trackError,
  };
};

// ============================================================================
// NAVIGATION ANALYTICS - Track all navigation interactions
// ============================================================================
export interface NavAnalyticsEvent {
  navType: 'header' | 'footer' | 'sidebar' | 'breadcrumb' | 'pagination' | 'mobile_menu' | 'scene_arrow';
  element: string;
  fromPath: string;
  toPath: string;
  position?: 'primary' | 'secondary' | 'cta';
  isExternal?: boolean;
}

export const useNavAnalytics = () => {
  const location = useLocation();

  const trackNavClick = useCallback((event: NavAnalyticsEvent) => {
    const eventData = {
      event: 'navigation_click',
      nav_type: event.navType,
      nav_element: event.element,
      nav_from: event.fromPath,
      nav_to: event.toPath,
      nav_position: event.position || 'primary',
      is_external: event.isExternal || false,
      timestamp: new Date().toISOString(),
    };

    pushToDataLayer(eventData);
    safeGtag('event', 'navigation_click', eventData);
  }, []);

  const trackHeaderNav = useCallback((element: string, toPath: string, position?: 'primary' | 'secondary' | 'cta') => {
    trackNavClick({
      navType: 'header',
      element,
      fromPath: location.pathname,
      toPath,
      position,
    });
  }, [location.pathname, trackNavClick]);

  const trackFooterNav = useCallback((element: string, toPath: string, section: string) => {
    trackNavClick({
      navType: 'footer',
      element: `${section}:${element}`,
      fromPath: location.pathname,
      toPath,
      isExternal: toPath.startsWith('http'),
    });
  }, [location.pathname, trackNavClick]);

  const trackSceneArrow = useCallback((direction: 'prev' | 'next', targetScene: string) => {
    trackNavClick({
      navType: 'scene_arrow',
      element: direction,
      fromPath: location.pathname,
      toPath: targetScene,
    });
  }, [location.pathname, trackNavClick]);

  const trackMobileMenu = useCallback((action: 'open' | 'close' | 'item_click', element?: string) => {
    const eventData = {
      event: 'mobile_menu_interaction',
      menu_action: action,
      menu_element: element || '',
      page_path: location.pathname,
      timestamp: new Date().toISOString(),
    };

    pushToDataLayer(eventData);
    safeGtag('event', 'mobile_menu_interaction', eventData);
  }, [location.pathname]);

  return {
    trackHeaderNav,
    trackFooterNav,
    trackSceneArrow,
    trackMobileMenu,
    trackNavClick,
  };
};

// ============================================================================
// BLOCK/COMPONENT ANALYTICS - Track content block interactions
// ============================================================================
export interface BlockAnalyticsEvent {
  blockType: 'card' | 'grid' | 'carousel' | 'list' | 'hero' | 'cta' | 'form' | 'modal' | 'accordion' | 'tabs';
  blockId: string;
  action: 'view' | 'click' | 'expand' | 'collapse' | 'scroll_into_view' | 'hover' | 'interact';
  contentType?: string;
  contentId?: string;
  contentName?: string;
  position?: number;
}

export const useBlockAnalytics = (blockType: BlockAnalyticsEvent['blockType'], blockId: string) => {
  const viewTracked = useRef(false);
  const hoverStartTime = useRef<number>(0);
  const location = useLocation();

  const trackBlockEvent = useCallback((event: Omit<BlockAnalyticsEvent, 'blockType' | 'blockId'>) => {
    const eventData = {
      event: `block_${event.action}`,
      block_type: blockType,
      block_id: blockId,
      block_action: event.action,
      content_type: event.contentType || '',
      content_id: event.contentId || '',
      content_name: event.contentName?.slice(0, 100) || '',
      position: event.position || 0,
      page_path: location.pathname,
      timestamp: new Date().toISOString(),
    };

    pushToDataLayer(eventData);
    safeGtag('event', `block_${event.action}`, eventData);
  }, [blockType, blockId, location.pathname]);

  const trackView = useCallback(() => {
    if (!viewTracked.current) {
      viewTracked.current = true;
      trackBlockEvent({ action: 'view' });
    }
  }, [trackBlockEvent]);

  const trackClick = useCallback((contentType?: string, contentId?: string, contentName?: string, position?: number) => {
    trackBlockEvent({ action: 'click', contentType, contentId, contentName, position });
  }, [trackBlockEvent]);

  const trackHoverStart = useCallback(() => {
    hoverStartTime.current = Date.now();
  }, []);

  const trackHoverEnd = useCallback(() => {
    const dwellTime = Date.now() - hoverStartTime.current;
    if (dwellTime >= 500) {
      trackBlockEvent({ action: 'hover' });
    }
  }, [trackBlockEvent]);

  const trackExpand = useCallback(() => {
    trackBlockEvent({ action: 'expand' });
  }, [trackBlockEvent]);

  const trackCollapse = useCallback(() => {
    trackBlockEvent({ action: 'collapse' });
  }, [trackBlockEvent]);

  // Intersection observer for scroll-into-view tracking
  const observeRef = useCallback((element: HTMLElement | null) => {
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            trackBlockEvent({ action: 'scroll_into_view' });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [trackBlockEvent]);

  return {
    trackView,
    trackClick,
    trackHoverStart,
    trackHoverEnd,
    trackExpand,
    trackCollapse,
    observeRef,
  };
};

// ============================================================================
// FORM ANALYTICS - Comprehensive form tracking
// ============================================================================
export const useFormAnalytics = (formName: string) => {
  const formStartTime = useRef<number>(0);
  const fieldsInteracted = useRef<Set<string>>(new Set());
  const location = useLocation();

  const trackFormEvent = useCallback((action: string, data?: Record<string, any>) => {
    const eventData = {
      event: `form_${action}`,
      form_name: formName,
      form_action: action,
      fields_interacted: fieldsInteracted.current.size,
      time_spent_ms: formStartTime.current ? Date.now() - formStartTime.current : 0,
      page_path: location.pathname,
      timestamp: new Date().toISOString(),
      ...data,
    };

    pushToDataLayer(eventData);
    safeGtag('event', `form_${action}`, eventData);
  }, [formName, location.pathname]);

  const trackFormStart = useCallback(() => {
    formStartTime.current = Date.now();
    fieldsInteracted.current.clear();
    trackFormEvent('start');
  }, [trackFormEvent]);

  const trackFieldFocus = useCallback((fieldName: string) => {
    fieldsInteracted.current.add(fieldName);
    trackFormEvent('field_focus', { field_name: fieldName });
  }, [trackFormEvent]);

  const trackFieldBlur = useCallback((fieldName: string, hasValue: boolean) => {
    trackFormEvent('field_blur', { field_name: fieldName, has_value: hasValue });
  }, [trackFormEvent]);

  const trackFieldError = useCallback((fieldName: string, errorMessage: string) => {
    trackFormEvent('field_error', { field_name: fieldName, error_message: errorMessage.slice(0, 100) });
  }, [trackFormEvent]);

  const trackSubmitAttempt = useCallback(() => {
    trackFormEvent('submit_attempt');
  }, [trackFormEvent]);

  const trackSubmitSuccess = useCallback((conversionValue?: number) => {
    trackFormEvent('submit_success', { conversion_value: conversionValue || 0 });
  }, [trackFormEvent]);

  const trackSubmitError = useCallback((errorMessage: string) => {
    trackFormEvent('submit_error', { error_message: errorMessage.slice(0, 200) });
  }, [trackFormEvent]);

  const trackAbandon = useCallback(() => {
    if (fieldsInteracted.current.size > 0) {
      trackFormEvent('abandon', { fields_completed: fieldsInteracted.current.size });
    }
  }, [trackFormEvent]);

  return {
    trackFormStart,
    trackFieldFocus,
    trackFieldBlur,
    trackFieldError,
    trackSubmitAttempt,
    trackSubmitSuccess,
    trackSubmitError,
    trackAbandon,
  };
};

// ============================================================================
// ECOMMERCE ANALYTICS - Store and merchandise tracking
// ============================================================================
export const useEcommerceAnalytics = () => {
  const location = useLocation();

  const trackEcommerceEvent = useCallback((eventName: string, data: Record<string, any>) => {
    const eventData = {
      event: eventName,
      ecommerce: data,
      page_path: location.pathname,
      timestamp: new Date().toISOString(),
    };

    pushToDataLayer({ event: 'ecommerce_clear', ecommerce: null }); // Clear previous ecommerce data
    pushToDataLayer(eventData);
    
    safeGtag('event', eventName, data);
  }, [location.pathname]);

  const trackViewItem = useCallback((item: { id: string; name: string; price: number; category?: string }) => {
    trackEcommerceEvent('view_item', {
      currency: 'EUR',
      value: item.price,
      items: [{
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        item_category: item.category || 'merchandise',
      }],
    });
  }, [trackEcommerceEvent]);

  const trackAddToCart = useCallback((item: { id: string; name: string; price: number; quantity: number }) => {
    trackEcommerceEvent('add_to_cart', {
      currency: 'EUR',
      value: item.price * item.quantity,
      items: [{
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      }],
    });
  }, [trackEcommerceEvent]);

  const trackBeginCheckout = useCallback((items: Array<{ id: string; name: string; price: number; quantity: number }>, value: number) => {
    trackEcommerceEvent('begin_checkout', {
      currency: 'EUR',
      value,
      items: items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });
  }, [trackEcommerceEvent]);

  const trackPurchase = useCallback((transactionId: string, value: number, items: Array<{ id: string; name: string; price: number; quantity: number }>) => {
    trackEcommerceEvent('purchase', {
      transaction_id: transactionId,
      currency: 'EUR',
      value,
      items: items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });
  }, [trackEcommerceEvent]);

  return {
    trackViewItem,
    trackAddToCart,
    trackBeginCheckout,
    trackPurchase,
  };
};

// ============================================================================
// PERFORMANCE ANALYTICS - Core Web Vitals and timing
// ============================================================================
export const usePerformanceAnalytics = () => {
  useEffect(() => {
    // Track Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      
      pushToDataLayer({
        event: 'web_vitals_lcp',
        metric_name: 'LCP',
        metric_value: lastEntry.startTime,
        metric_rating: lastEntry.startTime < 2500 ? 'good' : lastEntry.startTime < 4000 ? 'needs_improvement' : 'poor',
      });
    });

    // Track First Input Delay
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        pushToDataLayer({
          event: 'web_vitals_fid',
          metric_name: 'FID',
          metric_value: entry.processingStart - entry.startTime,
          metric_rating: entry.processingStart - entry.startTime < 100 ? 'good' : entry.processingStart - entry.startTime < 300 ? 'needs_improvement' : 'poor',
        });
      });
    });

    // Track Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries() as any[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
    });

    try {
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      fidObserver.observe({ type: 'first-input', buffered: true });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      // Observers not supported
    }

    // Report CLS on page hide
    const reportCLS = () => {
      pushToDataLayer({
        event: 'web_vitals_cls',
        metric_name: 'CLS',
        metric_value: clsValue,
        metric_rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs_improvement' : 'poor',
      });
    };

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        reportCLS();
      }
    });

    return () => {
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, []);
};

// ============================================================================
// USER IDENTITY & SESSION ANALYTICS
// ============================================================================
export const useUserAnalytics = () => {
  useEffect(() => {
    // Generate or retrieve user ID
    let userId = localStorage.getItem('td_user_id');
    if (!userId) {
      userId = `u_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('td_user_id', userId);
    }

    // Track session count
    let sessionCount = parseInt(localStorage.getItem('td_session_count') || '0', 10);
    const lastSession = localStorage.getItem('td_last_session');
    const now = Date.now();
    
    if (!lastSession || now - parseInt(lastSession, 10) > 30 * 60 * 1000) {
      sessionCount++;
      localStorage.setItem('td_session_count', sessionCount.toString());
      localStorage.setItem('td_last_session', now.toString());
    }

    // Set user properties in GA4
    safeGtag('set', 'user_properties', {
      user_id: userId,
      session_count: sessionCount,
      user_type: sessionCount === 1 ? 'new' : 'returning',
      first_visit_date: localStorage.getItem('td_first_visit') || new Date().toISOString(),
    });

    // Store first visit date
    if (!localStorage.getItem('td_first_visit')) {
      localStorage.setItem('td_first_visit', new Date().toISOString());
    }

    // Push to dataLayer
    pushToDataLayer({
      event: 'user_identified',
      user_id: userId,
      session_number: sessionCount,
      user_type: sessionCount === 1 ? 'new' : 'returning',
    });
  }, []);
};
