-- Create table to store AI-verified content
CREATE TABLE public.content_sync (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type text NOT NULL, -- 'artist', 'venue', 'festival', 'gear', 'label', 'release', 'crew'
  entity_id text NOT NULL,
  original_data jsonb NOT NULL,
  verified_data jsonb,
  corrections jsonb, -- List of corrections made
  photo_url text, -- AI-found photo URL
  photo_source text, -- Attribution info
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'needs_review', 'error'
  last_synced_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(entity_type, entity_id)
);

-- Enable RLS
ALTER TABLE public.content_sync ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Content sync is publicly readable"
ON public.content_sync
FOR SELECT
USING (true);

-- Admin only for modifications
CREATE POLICY "Admins can insert content sync"
ON public.content_sync
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update content sync"
ON public.content_sync
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete content sync"
ON public.content_sync
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Index for faster lookups
CREATE INDEX idx_content_sync_entity ON public.content_sync(entity_type, entity_id);
CREATE INDEX idx_content_sync_status ON public.content_sync(status);

-- Trigger for updated_at
CREATE TRIGGER update_content_sync_updated_at
BEFORE UPDATE ON public.content_sync
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();