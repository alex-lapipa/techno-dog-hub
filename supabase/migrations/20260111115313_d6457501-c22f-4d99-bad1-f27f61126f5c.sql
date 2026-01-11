-- Phase 2: Add performance indexes for high-traffic query patterns

-- 1. user_roles: Add single-column index on user_id for fast admin checks
-- The has_role() function queries by user_id first
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id 
ON public.user_roles (user_id);

-- 2. agent_status: Add index on status for filtering active/idle agents
CREATE INDEX IF NOT EXISTS idx_agent_status_status 
ON public.agent_status (status);

-- 3. agent_status: Add index on last_run_at for recent activity queries
CREATE INDEX IF NOT EXISTS idx_agent_status_last_run 
ON public.agent_status (last_run_at DESC NULLS LAST);

-- 4. documents: Add index on source for category filtering
CREATE INDEX IF NOT EXISTS idx_documents_source 
ON public.documents (source);

-- 5. documents: Add embedding vector index for RAG similarity search
CREATE INDEX IF NOT EXISTS idx_documents_embedding 
ON public.documents USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);

-- 6. analytics_events: Add composite index for time-range queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_time_type 
ON public.analytics_events (created_at DESC, event_type);

-- 7. youtube_cache: Add index on expires_at for cache invalidation
CREATE INDEX IF NOT EXISTS idx_youtube_cache_expires 
ON public.youtube_cache (expires_at)
WHERE expires_at IS NOT NULL;