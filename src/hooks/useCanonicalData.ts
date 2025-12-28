/**
 * React Query hooks for Canonical Artist Data
 * 
 * Provides unified data access with automatic source switching
 * based on feature flags. Backwards compatible with existing hooks.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { 
  loadArtistsSummaryUnified, 
  loadArtistByIdUnified,
  loadCanonicalArtistsSummary,
  loadCanonicalArtistById,
  type CanonicalArtistSummary,
  type FullCanonicalArtist,
} from '@/data/canonical-artists-loader';
import { getFeatureFlags, getCurrentMigrationPhase } from '@/lib/featureFlags';

// Query keys
export const artistQueryKeys = {
  all: ['artists'] as const,
  lists: () => [...artistQueryKeys.all, 'list'] as const,
  list: (source: 'legacy' | 'canonical' | 'unified') => 
    [...artistQueryKeys.lists(), source] as const,
  details: () => [...artistQueryKeys.all, 'detail'] as const,
  detail: (id: string, source: 'legacy' | 'canonical' | 'unified') => 
    [...artistQueryKeys.details(), id, source] as const,
  migration: () => ['migration', 'status'] as const,
};

/**
 * Hook for fetching unified artist list
 * Automatically uses correct data source based on feature flags
 */
export function useUnifiedArtists() {
  const phase = getCurrentMigrationPhase();
  
  return useQuery({
    queryKey: artistQueryKeys.list(phase === 'legacy' ? 'legacy' : 'unified'),
    queryFn: loadArtistsSummaryUnified,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook for fetching single unified artist
 */
export function useUnifiedArtist(id: string | undefined) {
  const phase = getCurrentMigrationPhase();
  
  return useQuery({
    queryKey: artistQueryKeys.detail(id || '', phase === 'legacy' ? 'legacy' : 'unified'),
    queryFn: () => id ? loadArtistByIdUnified(id) : null,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for canonical-only artist list (for admin/debugging)
 */
export function useCanonicalArtists() {
  return useQuery({
    queryKey: artistQueryKeys.list('canonical'),
    queryFn: loadCanonicalArtistsSummary,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for canonical-only artist details
 */
export function useCanonicalArtist(slug: string | undefined) {
  return useQuery({
    queryKey: artistQueryKeys.detail(slug || '', 'canonical'),
    queryFn: () => slug ? loadCanonicalArtistById(slug) : null,
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for prefetching artist data
 */
export function usePrefetchUnifiedArtist() {
  const queryClient = useQueryClient();
  const phase = getCurrentMigrationPhase();
  
  return useCallback((id: string) => {
    queryClient.prefetchQuery({
      queryKey: artistQueryKeys.detail(id, phase === 'legacy' ? 'legacy' : 'unified'),
      queryFn: () => loadArtistByIdUnified(id),
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient, phase]);
}

/**
 * Hook for migration status
 */
export function useMigrationStatus() {
  return useQuery({
    queryKey: artistQueryKeys.migration(),
    queryFn: async () => {
      const flags = getFeatureFlags();
      const phase = getCurrentMigrationPhase();
      
      // Call migration status endpoint
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/artist-migration`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'status' }),
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch migration status');
      }
      
      const data = await response.json();
      
      return {
        phase,
        flags,
        ...data.status,
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refresh every minute
  });
}

/**
 * Hook for triggering migration operations
 */
export function useMigrationOperations() {
  const queryClient = useQueryClient();
  
  const runMigration = useCallback(async (
    action: 'migrate_rag' | 'migrate_content_sync' | 'migrate_all' | 'validate',
    options?: { dryRun?: boolean; batchSize?: number }
  ) => {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/artist-migration`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action, 
          dryRun: options?.dryRun ?? false,
          batchSize: options?.batchSize ?? 50,
        }),
      }
    );
    
    if (!response.ok) {
      throw new Error('Migration operation failed');
    }
    
    const result = await response.json();
    
    // Invalidate queries after migration
    queryClient.invalidateQueries({ queryKey: artistQueryKeys.all });
    queryClient.invalidateQueries({ queryKey: artistQueryKeys.migration() });
    
    return result;
  }, [queryClient]);
  
  const syncEmbeddings = useCallback(async (
    options?: { artistId?: string; forceRegenerate?: boolean; batchSize?: number }
  ) => {
    const action = options?.artistId ? 'sync_artist' : 'sync_all';
    
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/artist-embedding-sync`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action,
          artistId: options?.artistId,
          forceRegenerate: options?.forceRegenerate ?? false,
          batchSize: options?.batchSize ?? 10,
        }),
      }
    );
    
    if (!response.ok) {
      throw new Error('Embedding sync failed');
    }
    
    return response.json();
  }, []);
  
  return { runMigration, syncEmbeddings };
}

// Re-export types for convenience
export type { CanonicalArtistSummary, FullCanonicalArtist };
