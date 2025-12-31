/**
 * Knowledge Cache Service
 * 
 * Provides caching layer for search queries with TTL support.
 * Reduces external API calls and improves response times.
 */

import { supabase } from '@/integrations/supabase/client';
import { isKnowledgeCacheEnabled, isShadowModeEnabled, logShadowActivity } from './knowledgeFeatureFlags';

// TTL rules in milliseconds
export const CACHE_TTL = {
  ARTIST: 30 * 24 * 60 * 60 * 1000,    // 30 days
  LABEL: 30 * 24 * 60 * 60 * 1000,     // 30 days
  VENUE: 30 * 24 * 60 * 60 * 1000,     // 30 days
  GENRE: 30 * 24 * 60 * 60 * 1000,     // 30 days
  EVENT: 12 * 60 * 60 * 1000,          // 12 hours
  NEWS: 24 * 60 * 60 * 1000,           // 24 hours
  SEARCH: 60 * 60 * 1000,              // 1 hour
} as const;

export type CacheType = keyof typeof CACHE_TTL;

interface CacheEntry {
  id: string;
  query_hash: string;
  query_text: string;
  filters_json: Record<string, unknown>;
  cache_type: string;
  result_json: unknown;
  created_at: string;
  expires_at: string;
  hit_count: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
}

// In-memory stats tracking
const stats: CacheStats = { hits: 0, misses: 0, hitRate: 0 };

/**
 * Generate a stable hash for a query
 */
export function generateQueryHash(
  queryText: string,
  filters?: Record<string, unknown>
): string {
  const normalized = queryText.toLowerCase().trim();
  const filterStr = filters ? JSON.stringify(sortObjectKeys(filters)) : '';
  const combined = `${normalized}|${filterStr}`;
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Sort object keys for consistent hashing
 */
function sortObjectKeys(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.keys(obj).sort().reduce((sorted, key) => {
    sorted[key] = obj[key];
    return sorted;
  }, {} as Record<string, unknown>);
}

/**
 * Get cached result if available and not expired
 */
export async function getCachedResult<T>(
  queryText: string,
  cacheType: CacheType = 'SEARCH',
  filters?: Record<string, unknown>
): Promise<{ data: T; fromCache: true } | { data: null; fromCache: false }> {
  const queryHash = generateQueryHash(queryText, filters);
  
  // Shadow mode logging
  if (isShadowModeEnabled()) {
    logShadowActivity('cache_lookup', { queryHash, queryText, cacheType });
  }
  
  // Check if caching is enabled
  if (!isKnowledgeCacheEnabled()) {
    stats.misses++;
    updateHitRate();
    return { data: null, fromCache: false };
  }

  try {
    const { data, error } = await supabase
      .from('kl_cached_search')
      .select('*')
      .eq('query_hash', queryHash)
      .eq('cache_type', cacheType.toLowerCase())
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      stats.misses++;
      updateHitRate();
      console.log(`[CACHE MISS] ${cacheType}: ${queryText}`);
      return { data: null, fromCache: false };
    }

    // Update hit count
    await supabase
      .from('kl_cached_search')
      .update({ 
        hit_count: (data as CacheEntry).hit_count + 1,
        last_accessed_at: new Date().toISOString()
      })
      .eq('id', (data as CacheEntry).id);

    stats.hits++;
    updateHitRate();
    console.log(`[CACHE HIT] ${cacheType}: ${queryText}`);
    
    return { data: (data as CacheEntry).result_json as T, fromCache: true };
  } catch (e) {
    console.error('Cache lookup error:', e);
    stats.misses++;
    updateHitRate();
    return { data: null, fromCache: false };
  }
}

/**
 * Store result in cache
 */
export async function setCachedResult<T>(
  queryText: string,
  result: T,
  cacheType: CacheType = 'SEARCH',
  filters?: Record<string, unknown>
): Promise<void> {
  const queryHash = generateQueryHash(queryText, filters);
  const ttl = CACHE_TTL[cacheType];
  const expiresAt = new Date(Date.now() + ttl).toISOString();

  // Shadow mode logging
  if (isShadowModeEnabled()) {
    logShadowActivity('cache_write', { queryHash, cacheType, expiresAt });
  }

  // Check if caching is enabled
  if (!isKnowledgeCacheEnabled()) {
    return;
  }

  try {
    // Upsert to handle duplicates
    const { error } = await supabase
      .from('kl_cached_search')
      .upsert({
        query_hash: queryHash,
        query_text: queryText,
        filters_json: filters || {},
        cache_type: cacheType.toLowerCase(),
        result_json: result as Record<string, unknown>,
        expires_at: expiresAt,
        hit_count: 0,
        last_accessed_at: new Date().toISOString(),
      } as never, {
        onConflict: 'query_hash'
      });

    if (error) {
      console.error('Cache write error:', error);
    } else {
      console.log(`[CACHE WRITE] ${cacheType}: ${queryText}, expires: ${expiresAt}`);
    }
  } catch (e) {
    console.error('Cache write error:', e);
  }
}

/**
 * Invalidate cache for a specific query
 */
export async function invalidateCache(
  queryText: string,
  cacheType?: CacheType,
  filters?: Record<string, unknown>
): Promise<void> {
  const queryHash = generateQueryHash(queryText, filters);

  try {
    let query = supabase
      .from('kl_cached_search')
      .delete()
      .eq('query_hash', queryHash);

    if (cacheType) {
      query = query.eq('cache_type', cacheType.toLowerCase());
    }

    await query;
    console.log(`[CACHE INVALIDATE] ${queryText}`);
  } catch (e) {
    console.error('Cache invalidation error:', e);
  }
}

/**
 * Clear all expired cache entries
 */
export async function clearExpiredCache(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('kl_cached_search')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id');

    if (error) {
      console.error('Cache cleanup error:', error);
      return 0;
    }

    const count = data?.length || 0;
    console.log(`[CACHE CLEANUP] Removed ${count} expired entries`);
    return count;
  } catch (e) {
    console.error('Cache cleanup error:', e);
    return 0;
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): CacheStats {
  return { ...stats };
}

/**
 * Reset cache statistics
 */
export function resetCacheStats(): void {
  stats.hits = 0;
  stats.misses = 0;
  stats.hitRate = 0;
}

/**
 * Update hit rate calculation
 */
function updateHitRate(): void {
  const total = stats.hits + stats.misses;
  stats.hitRate = total > 0 ? stats.hits / total : 0;
}

/**
 * Wrapper function for cached operations
 */
export async function withCache<T>(
  queryText: string,
  cacheType: CacheType,
  fetchFn: () => Promise<T>,
  filters?: Record<string, unknown>
): Promise<{ data: T; fromCache: boolean }> {
  // Try cache first
  const cached = await getCachedResult<T>(queryText, cacheType, filters);
  if (cached.fromCache) {
    return { data: cached.data!, fromCache: true };
  }

  // Execute fetch function
  const result = await fetchFn();

  // Store in cache (async, don't wait)
  setCachedResult(queryText, result, cacheType, filters);

  return { data: result, fromCache: false };
}
