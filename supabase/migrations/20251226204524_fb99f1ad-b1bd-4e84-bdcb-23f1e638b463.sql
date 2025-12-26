-- Add unique constraint on artist_name for youtube_cache table
ALTER TABLE public.youtube_cache 
ADD CONSTRAINT youtube_cache_artist_name_key UNIQUE (artist_name);