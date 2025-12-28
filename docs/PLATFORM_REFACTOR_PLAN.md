# techno.dog Platform Refactor Plan

## Executive Summary

This document outlines a comprehensive platform consolidation and production hardening plan for techno.dog. The audit identified significant opportunities to reduce duplication, improve performance, and establish consistent patterns across the codebase.

**Current State:**
- 54 pages, 41+ components, 10 hooks, 14 data files
- 53 edge functions with significant duplication
- Mixed state management (React Context + Zustand)
- Monolithic files requiring decomposition

---

## 1. INVENTORY & AUDIT FINDINGS

### 1.1 Frontend Architecture

| Category | Count | Status |
|----------|-------|--------|
| Pages | 54 | Many monolithic (ApiDocs: 1093 lines) |
| Components | 41+ | Good component library, some duplication |
| Hooks | 10 | Well-organized |
| Contexts | 3 | Auth, AdminAuth, Language |
| Stores | 1 | Zustand (cartStore) |

### 1.2 Backend Architecture

| Category | Count | Status |
|----------|-------|--------|
| Edge Functions | 53 | Heavy duplication |
| Shared Utilities | 4 | Created but underutilized |
| Database Tables | 30+ | Well-structured with RLS |

### 1.3 Critical Issues Identified

#### A. Edge Function Duplication (HIGH PRIORITY)
- 50+ functions duplicate CORS headers locally
- 50+ functions duplicate Supabase client initialization
- Shared utilities (`_shared/cors.ts`, `_shared/supabase.ts`) exist but unused
- Monolithic functions: `admin-api` (1173 lines), `media-engine` (664 lines)

#### B. Frontend Monoliths (MEDIUM PRIORITY)
- `ApiDocs.tsx`: 1093 lines with local CodeBlock, TryItPanel, EndpointCard
- `Community.tsx`: 499 lines
- `News.tsx`: Uses static data array instead of database

#### C. Duplicate Components
- `CodeBlock` defined in both `ApiDocs.tsx` and `api-docs/CodeBlock.tsx`
- `TryItPanel` defined in both `ApiDocs.tsx` and `api-docs/TryItPanel.tsx`
- `HistoryContext` defined in both files

#### D. Data Layer Inconsistencies
- Static data files (`artists.ts`, `festivals.ts`, `venues.ts`) alongside database
- Legacy loader pattern (`*-loader.ts`) not consistently used
- No centralized data fetching hooks

#### E. State Management Gaps
- No global UI state store (modals, sidebars, toasts)
- Duplicate context definitions
- No React Query integration for entity data

---

## 2. TARGET ARCHITECTURE

### 2.1 Folder Structure (Target)

```
src/
├── app/                    # App shell and providers
│   ├── App.tsx
│   ├── providers/
│   └── routes/
├── components/
│   ├── common/             # Shared across features
│   │   ├── Layout/
│   │   ├── Navigation/
│   │   └── ui/
│   ├── features/           # Feature-specific components
│   │   ├── news/
│   │   ├── community/
│   │   ├── store/
│   │   └── admin/
│   └── api-docs/           # Already modularized
├── hooks/
│   ├── queries/            # React Query hooks
│   │   ├── useArtists.ts
│   │   ├── useFestivals.ts
│   │   └── useNews.ts
│   └── utilities/          # Utility hooks
├── stores/                 # Zustand stores
│   ├── cartStore.ts
│   └── uiStore.ts          # NEW: Global UI state
├── services/               # NEW: API abstraction layer
│   ├── api.ts
│   ├── artists.ts
│   └── news.ts
├── lib/                    # Utilities and helpers
└── types/                  # TypeScript definitions

supabase/functions/
├── _shared/
│   ├── cors.ts             # ✅ Created
│   ├── supabase.ts         # ✅ Created
│   ├── ai-utils.ts         # ✅ Created
│   ├── lovable-ai.ts       # ✅ Created
│   ├── response.ts         # NEW: Standardized responses
│   └── validation.ts       # NEW: Shared schemas
├── [grouped by domain]/    # Refactored functions
```

### 2.2 State Management Strategy

```
Global State Architecture:
┌─────────────────────────────────────────────────────────┐
│                    React Query                          │
│  (Server State: API data, caching, background refetch)  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    Zustand Stores                        │
│  ├── cartStore (e-commerce)                             │
│  ├── uiStore (modals, sidebars, toasts)                 │
│  └── userPrefsStore (theme, preferences)                │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  React Context                           │
│  ├── AuthContext (authentication only)                  │
│  ├── AdminAuthContext (admin sessions)                  │
│  └── LanguageContext (i18n)                             │
└─────────────────────────────────────────────────────────┘
```

---

## 3. CONSOLIDATION ACTIONS

### 3.1 Edge Functions Refactor

**Phase 1: Adopt Shared Utilities (2-3 days)**
```typescript
// BEFORE (50+ functions)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);
  // ... logic
});

// AFTER
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  
  const supabase = createServiceClient();
  // ... logic
  return jsonResponse(data);
});
```

**Priority Functions to Refactor:**
1. `admin-api` (1173 lines) → Split into domain modules
2. `media-engine` (664 lines) → Extract utilities
3. `knowledge-ingest` (395 lines)
4. `alert-dispatcher` (358 lines)

### 3.2 Frontend Consolidation

**Phase 1: ApiDocs.tsx Cleanup (1 day)**
```typescript
// Current: ApiDocs.tsx defines CodeBlock, TryItPanel, EndpointCard locally
// Target: Use existing api-docs/ components

// BEFORE (ApiDocs.tsx:30-53)
const CodeBlock = ({ code, language = "bash" }) => { ... }

// AFTER
import { CodeBlock, TryItPanel, EndpointCard } from '@/components/api-docs';
```

**Phase 2: News Page Database Integration (1 day)**
```typescript
// Current: Static array in News.tsx
const newsItems = [
  { id: "bassiani-anniversary", ... },
  { id: "surgeon-live", ... },
];

// Target: Use td_news_articles table
import { useQuery } from '@tanstack/react-query';

const usePublishedNews = () => useQuery({
  queryKey: ['news', 'published'],
  queryFn: async () => {
    const { data } = await supabase
      .from('td_news_articles')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });
    return data;
  }
});
```

### 3.3 Component Library Standardization

**Extract Shared Components:**
| Component | Current Location | Target Location |
|-----------|------------------|-----------------|
| CodeBlock | ApiDocs.tsx (local) | components/api-docs/CodeBlock.tsx ✅ |
| TryItPanel | ApiDocs.tsx (local) | components/api-docs/TryItPanel.tsx ✅ |
| SocialShareButtons | Multiple places | components/social/SocialShareButtons.tsx ✅ |
| PageLayout | Each page | components/common/PageLayout.tsx (NEW) |
| EntityCard | Multiple places | components/common/EntityCard.tsx (NEW) |

---

## 4. MIGRATION STEPS

### Phase 1: Foundation (Week 1)
- [ ] Refactor 10 highest-traffic edge functions to use `_shared/*`
- [ ] Create `PageLayout` component to standardize page structure
- [ ] Update `ApiDocs.tsx` to use existing api-docs components
- [ ] Add React Query hooks for core entities

### Phase 2: Data Layer (Week 2)
- [ ] Create service layer (`src/services/`)
- [ ] Migrate static data to React Query hooks
- [ ] Standardize error handling across API calls
- [ ] Add loading/error states to all data-dependent components

### Phase 3: State Consolidation (Week 3)
- [ ] Create `uiStore` for global UI state
- [ ] Remove duplicate context definitions
- [ ] Standardize toast usage (single library)
- [ ] Add optimistic updates for mutations

### Phase 4: Edge Function Cleanup (Week 4)
- [ ] Refactor remaining edge functions
- [ ] Split monolithic functions (`admin-api`, `media-engine`)
- [ ] Add comprehensive logging
- [ ] Add input validation with shared schemas

---

## 5. TESTING STRATEGY

### Required Tests Before Changes

```typescript
// Critical Path Tests
describe('Authentication Flow', () => {
  it('should sign in with valid credentials');
  it('should handle admin role checking');
  it('should persist session across refreshes');
});

describe('API Endpoints', () => {
  it('should return artists with valid API key');
  it('should handle rate limiting');
  it('should reject invalid requests');
});

describe('E-commerce Flow', () => {
  it('should add items to cart');
  it('should create Shopify checkout');
  it('should persist cart across sessions');
});
```

### Route-Level Smoke Tests
```typescript
const criticalRoutes = [
  '/',
  '/news',
  '/artists',
  '/festivals',
  '/venues',
  '/community',
  '/store',
  '/developer',
  '/admin',
];

criticalRoutes.forEach(route => {
  it(`${route} should render without errors`);
});
```

---

## 6. PERFORMANCE STRATEGY

### 6.1 Code Splitting (Already Implemented ✅)
- Lazy loading for all secondary routes
- Suspense boundaries with PageLoader fallback

### 6.2 Bundle Optimization
```typescript
// Current: All icons from lucide-react
import { ArrowRight, ArrowUpRight, ... } from "lucide-react";

// Target: Tree-shakeable imports (already correct)
// No changes needed - Vite handles this
```

### 6.3 Data Caching Strategy
```typescript
// React Query Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 minutes
      gcTime: 30 * 60 * 1000,      // 30 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

### 6.4 API Round-Trip Optimization
- Batch related queries where possible
- Implement proper cache invalidation
- Use optimistic updates for mutations

### 6.5 Image Optimization
- Already using `LazyImage` component
- Consider adding Shopify CDN transforms for store images

---

## 7. IMMEDIATE ACTION ITEMS

### Critical Priority (This Sprint)
1. **Refactor ApiDocs.tsx** to use existing api-docs components
2. **Update 5 core edge functions** to use shared utilities
3. **Create useNews hook** to replace static data

### High Priority (Next Sprint)
1. Split `admin-api` into domain-specific functions
2. Create PageLayout component
3. Standardize error handling

### Medium Priority (Backlog)
1. Create UI state store
2. Add comprehensive test coverage
3. Performance audit with Lighthouse

---

## 8. SUCCESS METRICS

| Metric | Current | Target |
|--------|---------|--------|
| Duplicated CORS code | 50+ files | 0 files |
| Duplicated Supabase init | 50+ files | 0 files |
| Largest page file | 1093 lines | <300 lines |
| Largest edge function | 1173 lines | <400 lines |
| Test coverage | ~0% | >60% critical paths |
| Lighthouse Performance | TBD | >80 |

---

## 9. RISKS & MITIGATIONS

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing functionality | High | Incremental changes, comprehensive testing |
| Edge function deployment failures | Medium | Test locally with Supabase CLI |
| Data migration issues | Medium | Keep static data as fallback during transition |
| Performance regression | Low | Benchmark before/after each phase |

---

## Appendix: Files Requiring Attention

### Monolithic Files (>500 lines)
- `src/pages/ApiDocs.tsx` (1093 lines)
- `supabase/functions/admin-api/index.ts` (1173 lines)
- `supabase/functions/media-engine/index.ts` (664 lines)

### Duplicate Definitions
- `HistoryContext`: ApiDocs.tsx + api-docs/TryItPanel.tsx
- `CodeBlock`: ApiDocs.tsx + api-docs/CodeBlock.tsx
- `corsHeaders`: 50+ edge functions

### Static Data Files (Consider DB Migration)
- `src/data/artists.ts`
- `src/data/festivals.ts`
- `src/data/venues.ts`
- `src/data/labels.ts`
- `src/data/releases.ts`
- `src/data/gear.ts`

---

*Document generated: 2025-12-28*
*Last updated: 2025-12-28*
