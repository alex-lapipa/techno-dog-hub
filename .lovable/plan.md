

# techno.dog RAG Infrastructure Audit & Voyage AI Integration Plan

## Current State Audit

### 1. Vector Stores & Embedding Dimensions (CRITICAL INCONSISTENCY)

| Table | Rows | With Embeddings | Dimensions | Model Used |
|-------|------|----------------|------------|------------|
| `documents` | 120 | 120 | **768** | text-embedding-3-small (768) |
| `artist_documents` | 466 | 466 | **1536** | text-embedding-3-small (default) |
| `dj_artists` | 99 | 99 | **1536** | text-embedding-3-small / ada-002 |
| `gear_catalog` | 99 | 99 | **1536** | text-embedding-3-small (1536) |
| `labels_documents` | 0 | 0 | — | Empty table |

**Problem**: Mixed dimensions (768 vs 1536) across tables. The `documents` table (books, RAG docs) uses 768d while `artist_documents`, `dj_artists`, and `gear_catalog` use 1536d. The `rag-chat` function generates query embeddings at 768d, so it can only match against `documents` — not the richer `artist_documents` or `gear_catalog` vectors.

### 2. Edge Functions Using Embeddings (17 functions)

| Function | Model | Dimensions | Purpose |
|----------|-------|-----------|---------|
| `rag-chat` | text-embedding-3-small | 768 | Main RAG chat query |
| `dog-agent` | text-embedding-3-small | 768 | Dog agent knowledge lookup |
| `dog-agent-stream` | — (no embedding) | — | Streaming responses |
| `embed-book-metadata` | text-embedding-3-small | 768 | Book metadata embedding |
| `extract-book-knowledge` | text-embedding-3-small | 768 | Book extraction |
| `knowledge-ingest` | text-embedding-3-small | 768 | Wikipedia/knowledge ingest |
| `ingest-documents` | text-embedding-3-small | 768 | Document ingest |
| `generate-embedding` | text-embedding-3-small | **1536** | Standalone embedding API |
| `artist-embedding-sync` | text-embedding-3-small | default (1536) | Artist doc sync |
| `artist-synthesis` | text-embedding-3-small | default (1536) | Artist RAG doc generation |
| `batch-embed-documents` | text-embedding-3-small | default (1536) | Batch artist/RAG docs |
| `regenerate-embeddings` | text-embedding-3-small | default (1536) | Re-embed missing |
| `gear-expert-agent` | text-embedding-3-small | 1536 | Gear semantic search |
| `search-dj-artists` | text-embedding-**ada-002** | default | Legacy search |
| `upload-dj-artists` | text-embedding-**ada-002** | default | Legacy upload |
| `batch-upload-artists` | text-embedding-**ada-002** | default | Legacy batch |
| `database-consolidation` | text-embedding-3-small | default (1536) | Consolidation |
| `_shared/ai-utils.ts` | text-embedding-3-small | 1536 | Shared utility |

### 3. DB Functions for Vector Search

- `search_dj_artists(query_embedding vector, ...)` — searches `dj_artists` (1536d)
- `match_documents(query_embedding vector, ...)` — searches `documents` (768d)
- `search_artist_documents(query_embedding vector, ...)` — searches `artist_documents` (1536d)
- `search_gear_by_embedding(query_embedding vector, ...)` — searches `gear_catalog` (1536d)

### 4. AI Agents & Orchestration (18+ agents)

Dog Agent, News Agent, SEO Strategy Agent, Artist Research Agent, Gear Expert Agent, Media Curator, Content Orchestrator, Health Monitor, Security Auditor, Analytics Reporter, PR Media Agent, Artist Label Agent, Collectives Agent, Playbook Agent, Outreach Engine, Knowledge Gap Detector, Translation Agent, Dog Scribe/Transcribe.

### 5. Secrets Available

`VOYAGE_API_KEY` is already configured. `OPENAI_API_KEY` for current embeddings. `LOVABLE_API_KEY` for chat completions.

---

## Issues Identified

1. **Dimension mismatch**: 768d in `documents`/`rag-chat` vs 1536d in `artist_documents`/`gear_catalog` — cross-table search is impossible
2. **Legacy models**: 3 functions still use `text-embedding-ada-002` (inferior, deprecated)
3. **Empty `labels_documents`**: Labels have no vector store entries
4. **No unified embedding utility**: Each function has its own inline `generateEmbedding()` — 17 duplicated implementations
5. **No Voyage AI integration**: Despite the key being configured, nothing uses it

---

## Implementation Plan (6 Batches, Safe & Non-Breaking)

### ✅ Batch 1: Create Shared Voyage Embedding Utility — COMPLETED
- Created `supabase/functions/_shared/voyage-embeddings.ts` with centralized `generateVoyageEmbedding()` and `generateVoyageBatchEmbeddings()`
- Uses `voyage-3-large` model at **1024 dimensions**
- Includes automatic fallback to OpenAI `text-embedding-3-small` at 1024d (dimension-matched)
- Batch embedding support with `formatEmbeddingForStorage()` helper

### ✅ Batch 2: Add `voyage_embedding` Columns — COMPLETED
- Added `voyage_embedding vector(1024)` columns to all 5 tables
- Created HNSW indexes with `vector_cosine_ops` (m=16, ef_construction=64)
- Created 4 new DB search functions:
  - `match_documents_voyage()`
  - `search_artist_documents_voyage()`
  - `search_dj_artists_voyage()`
  - `search_gear_by_voyage_embedding()`
- All existing `embedding` columns and search functions preserved (zero breaking changes)

### ✅ Batch 3: Populate Voyage Embeddings — COMPLETED
- Created and deployed `supabase/functions/voyage-embed-sync/index.ts`
- Successfully embedded **all 785 rows** across 4 tables:
  - `documents`: 120/120 ✅
  - `dj_artists`: 99/99 ✅
  - `gear_catalog`: 100/100 ✅
  - `artist_documents`: 466/466 ✅
- Zero errors. Provider: primarily `voyage-3-large`, with OpenAI 1024d fallback on rate limits
- Status endpoint confirms: `total: 0` missing

### Batch 4: Wire RAG Chat & Dog Agent to Voyage
- Update `rag-chat` to use Voyage for query embeddings and the new `search_*_voyage` DB functions
- Update `dog-agent` similarly
- Keep OpenAI fallback if Voyage is unavailable
- This fixes the dimension mismatch: all queries and all stores will be 1024d

### Batch 5: Update All Embedding Functions to Dual-Write
- Update `embed-book-metadata`, `artist-embedding-sync`, `artist-synthesis`, `knowledge-ingest`, `ingest-documents`, `batch-embed-documents`, `gear-expert-agent` to write both `embedding` (OpenAI, legacy) and `voyage_embedding` (Voyage, primary)
- Retire ada-002 references in `search-dj-artists`, `upload-dj-artists`, `batch-upload-artists`
- Populate `labels_documents` with label data embeddings

### Batch 6: Validation & Cleanup
- Create a validation edge function to verify all tables have Voyage embeddings
- Run retrieval quality comparison (same queries against OpenAI vs Voyage embeddings)
- Update `_shared/ai-utils.ts` architecture notes
- Update `useModelRouter.ts` to reflect Voyage for embeddings

### Technical Details

**Voyage API call pattern:**
```typescript
const response = await fetch('https://api.voyageai.com/v1/embeddings', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${VOYAGE_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'voyage-3-large',
    input: [text],           // supports batch
    output_dimension: 1024,  // Matryoshka: 256/512/1024/2048
  }),
});
```

**Why 1024 dimensions**: Voyage-3-large at 1024d outperforms OpenAI text-embedding-3-small at 1536d by ~10% on retrieval benchmarks, while using 33% less storage. This unifies all tables to a single dimension.

**Safety guarantees:**
- All existing `embedding` columns and search functions preserved
- New `voyage_embedding` columns are additive
- Fallback chain: Voyage → OpenAI (never lose embedding capability)
- Each batch is independently deployable and reversible
