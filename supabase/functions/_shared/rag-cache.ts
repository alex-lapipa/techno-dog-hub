/**
 * Shared RAG response caching with SWR (Stale-While-Revalidate) support.
 * Uses kl_cached_search table for persistent cache.
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface CachedResult {
  answer: string;
  artists: unknown[];
  sources: unknown[];
}

export interface CacheHit {
  data: CachedResult;
  stale: boolean;
}

// Default TTL: 1 hour
const DEFAULT_CACHE_TTL_HOURS = 1;
// SWR threshold: serve stale data when >75% of TTL has elapsed
const SWR_THRESHOLD = 0.75;

/** Simple deterministic hash for cache keys */
export function hashQuery(query: string): string {
  let hash = 0;
  const normalized = query.toLowerCase().trim();
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'rag_' + Math.abs(hash).toString(36);
}

/** Check cache for an existing response (with SWR support) */
export async function getCachedResponse(
  supabase: SupabaseClient,
  cacheKey: string
): Promise<CacheHit | null> {
  try {
    const { data, error } = await supabase
      .from('kl_cached_search')
      .select('result_json, expires_at, created_at')
      .eq('query_hash', cacheKey)
      .single();

    if (error || !data) return null;

    const now = Date.now();
    const expiresAt = new Date(data.expires_at).getTime();
    const createdAt = new Date(data.created_at).getTime();

    // Fully expired
    if (expiresAt < now) {
      console.log(`Cache expired for key: ${cacheKey}`);
      return null;
    }

    // Check staleness
    const totalTTL = expiresAt - createdAt;
    const elapsed = now - createdAt;
    const isStale = elapsed > totalTTL * SWR_THRESHOLD;

    console.log(`Cache HIT for key: ${cacheKey}${isStale ? ' (STALE)' : ''}`);
    return {
      data: data.result_json as CachedResult,
      stale: isStale,
    };
  } catch {
    return null;
  }
}

/** Save a response to the cache */
export async function setCachedResponse(
  supabase: SupabaseClient,
  cacheKey: string,
  query: string,
  result: CachedResult,
  ttlHours: number = DEFAULT_CACHE_TTL_HOURS
): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

    const { error } = await supabase
      .from('kl_cached_search')
      .upsert(
        {
          query_hash: cacheKey,
          query_text: query,
          cache_type: 'rag-chat',
          result_json: result,
          expires_at: expiresAt.toISOString(),
          hit_count: 0,
        },
        { onConflict: 'query_hash' }
      );

    if (error) {
      console.error('Cache upsert error:', JSON.stringify(error));
    } else {
      console.log(`Cache SET for key: ${cacheKey}, expires: ${expiresAt.toISOString()}`);
    }
  } catch (err) {
    console.error('Cache set error:', err);
  }
}
