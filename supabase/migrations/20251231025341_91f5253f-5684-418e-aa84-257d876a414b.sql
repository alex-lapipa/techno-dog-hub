-- Create documentary categories table
CREATE TABLE public.documentary_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create documentaries table
CREATE TABLE public.documentaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  youtube_video_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  channel_name TEXT,
  channel_id TEXT,
  thumbnail_url TEXT,
  duration TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER,
  category_id UUID REFERENCES public.documentary_categories(id),
  why_watch TEXT,
  curator_notes TEXT,
  tags TEXT[],
  featured_order INTEGER,
  is_featured BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  discovery_source TEXT,
  relevance_score NUMERIC(3,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documentary_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentaries ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Documentary categories are viewable by everyone"
ON public.documentary_categories
FOR SELECT
USING (true);

CREATE POLICY "Published documentaries are viewable by everyone"
ON public.documentaries
FOR SELECT
USING (status = 'published');

-- Create indexes
CREATE INDEX idx_documentaries_category ON public.documentaries(category_id);
CREATE INDEX idx_documentaries_youtube_id ON public.documentaries(youtube_video_id);
CREATE INDEX idx_documentaries_status ON public.documentaries(status);
CREATE INDEX idx_documentaries_featured ON public.documentaries(is_featured, featured_order);

-- Insert default categories
INSERT INTO public.documentary_categories (name, slug, description, display_order) VALUES
('Scenes & Movements', 'scenes', 'Documentaries about techno scenes from Berlin to Detroit, Tbilisi to Tokyo', 1),
('Pioneers & Artists', 'pioneers', 'Profiles and interviews with legendary figures in techno history', 2),
('Sound & Production', 'sound', 'Deep dives into synthesis, production techniques, and the sonic philosophy', 3),
('Gear & Technology', 'gear', 'The machines that shaped the sound - from 909 to modular', 4),
('Clubs & Venues', 'clubs', 'The spaces where the culture lives - from warehouses to institutions', 5),
('Collectives & Labels', 'collectives', 'The crews, labels, and movements that built the underground', 6),
('Rave Culture', 'rave', 'Free parties, illegal raves, and the political resistance of dance music', 7),
('Philosophy & Impact', 'philosophy', 'The deeper meaning - technology, humanity, and sonic transcendence', 8);

-- Create trigger for updated_at
CREATE TRIGGER update_documentaries_updated_at
BEFORE UPDATE ON public.documentaries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documentary_categories_updated_at
BEFORE UPDATE ON public.documentary_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();