-- Curated channel videos table
-- Stores videos from owner's YouTube channel for manual/AI curation
CREATE TABLE public.curated_channel_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  channel_title TEXT,
  playlist_id TEXT,
  playlist_title TEXT,
  published_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  view_count INTEGER,
  -- AI analysis fields
  ai_summary TEXT,
  ai_tags TEXT[],
  ai_relevance_score NUMERIC(3,2),
  ai_analyzed_at TIMESTAMPTZ,
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Page assignments for curated videos
-- Links videos to specific pages/entities on the site
CREATE TABLE public.curated_video_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES public.curated_channel_videos(id) ON DELETE CASCADE,
  page_type TEXT NOT NULL, -- 'crew', 'venue', 'festival', 'artist', 'doggies', 'homepage', 'technopedia', 'gear'
  entity_slug TEXT, -- e.g., 'spiral-tribe', 'tresor', null for homepage
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  -- Assignment metadata
  assigned_by TEXT, -- 'ai' or 'manual'
  assignment_reason TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Ensure unique video per page/entity combination
  UNIQUE(video_id, page_type, entity_slug)
);

-- Channel sync status
CREATE TABLE public.youtube_channel_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id TEXT NOT NULL,
  channel_handle TEXT,
  last_sync_at TIMESTAMPTZ,
  videos_synced INTEGER DEFAULT 0,
  playlists_synced INTEGER DEFAULT 0,
  sync_status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_curated_videos_playlist ON public.curated_channel_videos(playlist_id);
CREATE INDEX idx_curated_videos_ai_score ON public.curated_channel_videos(ai_relevance_score DESC);
CREATE INDEX idx_video_assignments_page ON public.curated_video_assignments(page_type, entity_slug);
CREATE INDEX idx_video_assignments_active ON public.curated_video_assignments(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.curated_channel_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curated_video_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_channel_sync ENABLE ROW LEVEL SECURITY;

-- Public read access for videos (they're displayed on public pages)
CREATE POLICY "Curated videos are publicly readable"
ON public.curated_channel_videos FOR SELECT
USING (true);

CREATE POLICY "Video assignments are publicly readable"
ON public.curated_video_assignments FOR SELECT
USING (is_active = true);

-- Only authenticated users can modify
CREATE POLICY "Authenticated users can manage curated videos"
ON public.curated_channel_videos FOR ALL
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage assignments"
ON public.curated_video_assignments FOR ALL
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage sync status"
ON public.youtube_channel_sync FOR ALL
USING (auth.role() = 'authenticated');

-- Trigger for updated_at
CREATE TRIGGER update_curated_videos_updated_at
  BEFORE UPDATE ON public.curated_channel_videos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_video_assignments_updated_at
  BEFORE UPDATE ON public.curated_video_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();