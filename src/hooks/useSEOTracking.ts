import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useGA4Analytics } from './useGA4Analytics';

interface ContentMetadata {
  contentType: 'artist' | 'festival' | 'venue' | 'gear' | 'label' | 'news' | 'book' | 'documentary' | 'page';
  contentGroup: string;
  contentId?: string;
  contentName?: string;
  region?: string;
  category?: string;
  tags?: string[];
}

/**
 * Combined SEO and analytics tracking hook
 * Automatically tracks page views with rich content metadata
 */
export const useSEOTracking = (metadata: ContentMetadata) => {
  const location = useLocation();
  const ga4 = useGA4Analytics();

  // Track page view with content metadata on mount and route change
  useEffect(() => {
    ga4.trackPageView(
      document.title,
      metadata.contentGroup,
      metadata.contentType
    );

    // Track content view if it's a specific item
    if (metadata.contentId && metadata.contentName) {
      ga4.trackContentInteraction(
        metadata.contentType as any,
        'view',
        metadata.contentId,
        metadata.contentName,
        {
          region: metadata.region,
          category: metadata.category,
          tags: metadata.tags?.join(','),
        }
      );
    }
  }, [location.pathname, metadata.contentType, metadata.contentGroup, metadata.contentId, metadata.contentName, metadata.region, metadata.category, ga4]);

  // Convenience methods that wrap GA4 with content context
  const trackItemClick = useCallback((itemId: string, itemName: string) => {
    ga4.trackContentInteraction(
      metadata.contentType as any,
      'click',
      itemId,
      itemName,
      { from_page: location.pathname }
    );
  }, [ga4, metadata.contentType, location.pathname]);

  const trackItemShare = useCallback((itemId: string, platform: string) => {
    ga4.trackSocialShare(platform, metadata.contentType, itemId, 'button');
  }, [ga4, metadata.contentType]);

  const trackSearch = useCallback((query: string, resultsCount: number, filters?: string[]) => {
    ga4.trackSearch(
      query,
      metadata.contentType as any,
      resultsCount,
      filters
    );
  }, [ga4, metadata.contentType]);

  const trackFilterApplied = useCallback((filterType: string, filterValue: string) => {
    ga4.trackFilter(filterType, filterValue, metadata.contentGroup);
  }, [ga4, metadata.contentGroup]);

  return {
    ...ga4,
    trackItemClick,
    trackItemShare,
    trackSearch,
    trackFilterApplied,
  };
};

/**
 * Hook for tracking list pages (artists, festivals, venues, etc.)
 */
export const useListPageTracking = (
  pageType: 'artists' | 'festivals' | 'venues' | 'gear' | 'labels' | 'news' | 'books' | 'documentaries',
  region?: string
) => {
  return useSEOTracking({
    contentType: pageType.slice(0, -1) as any, // Remove trailing 's'
    contentGroup: `${pageType}_list`,
    region,
  });
};

/**
 * Hook for tracking detail pages
 */
export const useDetailPageTracking = (
  contentType: ContentMetadata['contentType'],
  contentId: string,
  contentName: string,
  additionalMetadata?: Partial<ContentMetadata>
) => {
  return useSEOTracking({
    contentType,
    contentGroup: `${contentType}_detail`,
    contentId,
    contentName,
    ...additionalMetadata,
  });
};
