-- Create doggy variants table for managing the pack
CREATE TABLE public.doggy_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    personality TEXT,
    status TEXT DEFAULT 'good boy',
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create doggy analytics table for tracking shares/downloads
CREATE TABLE public.doggy_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID REFERENCES public.doggy_variants(id) ON DELETE CASCADE,
    variant_name TEXT NOT NULL,
    action_type TEXT NOT NULL, -- 'share_whatsapp', 'share_twitter', 'share_telegram', 'share_email', 'download', 'view'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.doggy_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doggy_analytics ENABLE ROW LEVEL SECURITY;

-- Public read access for variants (anyone can see active dogs)
CREATE POLICY "Anyone can view active doggy variants"
ON public.doggy_variants
FOR SELECT
USING (is_active = true);

-- Public insert for analytics (anyone can log shares/downloads)
CREATE POLICY "Anyone can log doggy analytics"
ON public.doggy_analytics
FOR INSERT
WITH CHECK (true);

-- Public read for analytics (for admin dashboard)
CREATE POLICY "Anyone can view doggy analytics"
ON public.doggy_analytics
FOR SELECT
USING (true);

-- Admin full access to variants (using authenticated for now, can be tightened)
CREATE POLICY "Authenticated users can manage doggy variants"
ON public.doggy_variants
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Insert default dog variants
INSERT INTO public.doggy_variants (name, slug, personality, status, sort_order) VALUES
('Happy', 'happy', 'Always wagging, perpetually optimistic', 'good boy', 1),
('Sleepy', 'sleepy', 'Dreams of infinite belly rubs', 'napping', 2),
('Excited', 'excited', 'Cannot contain the zoomies', 'zooming', 3),
('Grumpy', 'grumpy', 'Seen too many bad drops', 'judging', 4),
('Curious', 'curious', 'Sniffs out the best tracks', 'investigating', 5),
('Party', 'party', 'First on the dancefloor, last to leave', 'celebrating', 6),
('DJ', 'dj', 'Drops bass, not treats', 'mixing', 7),
('Puppy', 'puppy', 'New to the scene, learning the vibes', 'training', 8),
('Old', 'old', 'Veteran of a thousand raves', 'wise', 9),
('Techno', 'techno', 'Pure warehouse energy embodied', 'glitching', 10);

-- Create index for analytics queries
CREATE INDEX idx_doggy_analytics_variant ON public.doggy_analytics(variant_name);
CREATE INDEX idx_doggy_analytics_action ON public.doggy_analytics(action_type);
CREATE INDEX idx_doggy_analytics_created ON public.doggy_analytics(created_at DESC);