import { useEffect, useRef } from 'react';
import { useAnalytics } from './useAnalytics';

interface ScrollDepthOptions {
  pageName: string;
  thresholds?: number[];
}

export const useScrollDepth = ({ pageName, thresholds = [25, 50, 75, 100] }: ScrollDepthOptions) => {
  const { trackEvent } = useAnalytics();
  const trackedThresholds = useRef<Set<number>>(new Set());
  const maxScrollDepth = useRef<number>(0);

  useEffect(() => {
    // Reset on page change
    trackedThresholds.current = new Set();
    maxScrollDepth.current = 0;

    const calculateScrollDepth = (): number => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      
      if (scrollHeight <= 0) return 100;
      
      return Math.min(100, Math.round((scrollTop / scrollHeight) * 100));
    };

    const handleScroll = () => {
      const currentDepth = calculateScrollDepth();
      
      // Track each threshold only once per page load
      thresholds.forEach((threshold) => {
        if (currentDepth >= threshold && !trackedThresholds.current.has(threshold)) {
          trackedThresholds.current.add(threshold);
          trackEvent({
            eventType: 'scroll',
            eventName: `scroll_depth_${threshold}`,
            metadata: { 
              page: pageName, 
              threshold,
              timestamp: Date.now()
            },
          });
        }
      });

      // Track max scroll depth
      if (currentDepth > maxScrollDepth.current) {
        maxScrollDepth.current = currentDepth;
      }
    };

    // Throttle scroll handler for performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });

    // Track max depth on page leave
    const handleBeforeUnload = () => {
      if (maxScrollDepth.current > 0) {
        trackEvent({
          eventType: 'scroll',
          eventName: 'max_scroll_depth',
          metadata: { 
            page: pageName, 
            maxDepth: maxScrollDepth.current 
          },
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pageName, thresholds, trackEvent]);
};
