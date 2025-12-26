-- Create YouTube cache table
CREATE TABLE public.youtube_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_name TEXT NOT NULL,
  videos JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days')
);

-- Create unique index on artist name for fast lookups
CREATE UNIQUE INDEX idx_youtube_cache_artist ON public.youtube_cache (LOWER(artist_name));

-- Create index on expiration for cleanup queries
CREATE INDEX idx_youtube_cache_expires ON public.youtube_cache (expires_at);

-- Enable RLS
ALTER TABLE public.youtube_cache ENABLE ROW LEVEL SECURITY;

-- Cache is publicly readable (no auth required)
CREATE POLICY "YouTube cache is publicly readable"
ON public.youtube_cache
FOR SELECT
USING (true);

-- Only service role can insert/update/delete (via edge function)
CREATE POLICY "Service role can manage cache"
ON public.youtube_cache
FOR ALL
USING (true)
WITH CHECK (true);