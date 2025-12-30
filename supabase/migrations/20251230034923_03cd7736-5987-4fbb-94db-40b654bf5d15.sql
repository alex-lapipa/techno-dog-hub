-- Create doggy_placeholders table to track entities using doggy images as placeholders
CREATE TABLE public.doggy_placeholders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    doggy_variant TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by TEXT,
    UNIQUE(entity_type, entity_id)
);

-- Add index for quick lookups
CREATE INDEX idx_doggy_placeholders_entity ON public.doggy_placeholders(entity_type, entity_id);

-- Enable RLS
ALTER TABLE public.doggy_placeholders ENABLE ROW LEVEL SECURITY;

-- Allow public read access (placeholders are visible to all)
CREATE POLICY "Doggy placeholders are viewable by everyone"
ON public.doggy_placeholders FOR SELECT
USING (true);

-- Allow authenticated users to manage placeholders
CREATE POLICY "Authenticated users can manage placeholders"
ON public.doggy_placeholders FOR ALL
USING (true)
WITH CHECK (true);

-- Add comment for documentation
COMMENT ON TABLE public.doggy_placeholders IS 'Tracks entities using Techno Doggy images as temporary placeholders until real images are available';