

# Caching Strategy for techno.dog — Audit & Improvement Plan

## Current State

### What's Already Cached

| Layer | Implementation | Status |
|-------|---------------|--------|
| **React Query (frontend)** | `staleTime` set on 13+ hooks (5-10 min typical) | Active, but default `QueryClient` has no global defaults — each hook sets its own |
| **RAG Chat (backend)** | Hash-based response cache in `kl_cached_search` table, 1-hour TTL | Active, saves ~50% on repeated queries |
| **AI Artist Research** | In-memory `Map` cache, 5-min TTL per Deno isolate | Active but volatile (lost on cold start) |
| **YouTube Cache** | Dedicated `youtube_cache` table with upsert | Active |
| **Knowledge Cache** | Full `knowledgeCache.ts` utility with `withCache()` wrapper | **Built but DISABLED** — feature flag `KNOWLEDGE_CACHE_ENABLED` defaults to `false`. Zero consumers besides the admin page |
| **Edge Function HTTP headers** | `Cache-Control` on image-proxy (24h), sitemap (1h), OG images (1d client/7d CDN), ticketing widget (5min) | Partial — most edge functions return **no cache headers** |
| **Static assets** | Vite handles hashed filenames for JS/CSS bundles | Automatic via Vite |

### Key Gaps

1. **No global React Query defaults** — `QueryClient` is created with zero config, so any hook without explicit `staleTime` refetches on every mount
2. **Knowledge cache is off** — The entire `knowledgeCache.ts` system is disabled and has zero consumers
3. **Edge functions missing cache headers** — 100+ functions return no `Cache-Control`, meaning browsers and CDNs can't cache responses
4. **No service worker** — No offline support or asset precaching
5. **Six parallel DB calls on homepage** (`useGlobalStats`) — hits Supabase on every visit with no deduplication beyond React Query
6. **Shopify product fetches** — 3 separate pages all call `fetchProducts(50)` with independent 5-min stale times but no shared prefetch
7. **Image proxy** — 24h cache is good, but no CDN layer in front of it

---

## Recommended Implementation Plan (5 Steps)

### Step 1: Set Global React Query Defaults
**Impact: High | Effort: Tiny | Risk: None**

Configure `QueryClient` with sensible global defaults so every hook benefits automatically:
- `staleTime: 5 * 60 * 1000` (5 min) — data rarely changes mid-session
- `gcTime: 30 * 60 * 1000` (30 min) — keep unused cache longer
- `refetchOnWindowFocus: false` — stop unnecessary refetches when user tabs back
- `retry: 1` — reduce failed retry spam

This single change eliminates dozens of redundant Supabase calls per session.

### Step 2: Activate and Wire the Knowledge Cache
**Impact: High | Effort: Medium | Risk: Low**

The `knowledgeCache.ts` infrastructure is fully built but sitting idle. Steps:
- Enable `KNOWLEDGE_CACHE_ENABLED` by default (flip the flag)
- Wire `withCache()` into the heaviest data loaders: `loadArtistsSummaryUnified`, `loadVenuesSummary`, `loadFestivalsSummary`, `fetchGlobalStats`
- This adds a DB-backed cache layer below React Query — survives page refreshes and new sessions
- Add a scheduled cleanup (clear expired entries) via a lightweight cron edge function

### Step 3: Add Cache Headers to High-Traffic Edge Functions
**Impact: High | Effort: Low | Risk: None**

Add `Cache-Control` response headers to the most-called edge functions so browsers and any CDN/proxy can cache responses:

| Function | Recommended Header |
|----------|-------------------|
| `search-dj-artists` | `public, max-age=300` (5 min) |
| `rag-chat` (non-stream) | `private, max-age=3600` (1 hour, already DB-cached) |
| `generate-embedding` | `private, max-age=86400` (embeddings are deterministic) |
| `sitemap-xml` | Already set (1h) |
| `og-image` | Already set (1d/7d) |
| `privacy-manifest` | Already set (24h) |
| Static data functions (gear, labels, books) | `public, max-age=1800` (30 min) |

### Step 4: Deduplicate and Prefetch Shared Data
**Impact: Medium | Effort: Low | Risk: None**

- **Shopify products**: Prefetch once in `App.tsx` or a shared provider instead of 3 independent fetches in Store, Lookbook, AdminStore
- **Global stats**: Move `useGlobalStats` prefetch to app init so homepage loads instantly
- **Artist summary**: Already prefetched — but increase `staleTime` to 30 min (this data changes at most daily)
- **Venues/Festivals**: Bump `staleTime` to 30 min (static reference data)

### Step 5: Add Stale-While-Revalidate Pattern for AI Responses
**Impact: Medium | Effort: Medium | Risk: Low**

For `rag-chat` and `dog-agent`: serve stale cached responses immediately while revalidating in the background. Steps:
- When a cache hit is found but approaching expiry (>75% of TTL elapsed), return cached data AND trigger a background re-fetch
- Store the fresh result for next time
- Users get instant responses; freshness improves silently

---

## Cost Impact Estimate

| Optimization | Estimated Savings |
|-------------|-------------------|
| Global React Query defaults | ~40% fewer Supabase reads per session |
| Knowledge cache activation | ~30% fewer repeated data loads across sessions |
| Edge function cache headers | ~50% fewer function invocations for repeat visitors |
| Data prefetch deduplication | ~15% fewer redundant Shopify/DB calls |
| **Combined** | **~50-60% reduction in backend calls and AI API spend** |

---

## Batch Execution Order

1. ~~**Step 1** first (one-line change, immediate global benefit)~~ ✅ DONE
2. ~~**Step 3** next (additive headers, no code logic changes)~~ ✅ DONE
3. ~~**Step 4** (prefetch wiring, small refactor)~~ ✅ DONE
4. ~~**Step 2** (knowledge cache activation, needs testing)~~ ✅ DONE — flag flipped to `true`
5. **Step 5** (SWR pattern, most complex) — NEXT

Each step is independently deployable and reversible. No breaking changes at any point.

