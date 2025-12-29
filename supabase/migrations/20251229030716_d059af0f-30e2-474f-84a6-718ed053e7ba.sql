-- Create consolidated gear catalog table
CREATE TABLE IF NOT EXISTS public.gear_catalog (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT,
  category TEXT NOT NULL,
  instrument_type TEXT,
  format TEXT,
  manufacturer_company TEXT,
  designer TEXT,
  release_year INTEGER,
  discontinued_year INTEGER,
  production_units INTEGER,
  -- Pricing
  launch_price_usd NUMERIC,
  launch_price_notes TEXT,
  current_price_usd_low NUMERIC,
  current_price_usd_high NUMERIC,
  current_price_notes TEXT,
  -- Technical specs
  synthesis_type TEXT,
  polyphony TEXT,
  timbrality TEXT,
  oscillators_per_voice TEXT,
  oscillator_types TEXT,
  filters TEXT,
  envelopes TEXT,
  lfos TEXT,
  sequencer_arp TEXT,
  effects_onboard TEXT,
  sampling_spec TEXT,
  io_connectivity TEXT,
  midi_sync TEXT,
  modifications TEXT,
  strengths TEXT,
  limitations TEXT,
  notable_features TEXT,
  -- Descriptions
  short_description TEXT,
  techno_applications TEXT,
  -- Notable artists and tracks (JSONB for flexibility)
  notable_artists JSONB DEFAULT '[]'::jsonb,
  famous_tracks JSONB DEFAULT '[]'::jsonb,
  -- Media
  image_url TEXT,
  image_attribution JSONB,
  official_url TEXT,
  youtube_videos JSONB DEFAULT '[]'::jsonb,
  -- Metadata
  sources TEXT[],
  tags TEXT[] DEFAULT '{}',
  related_gear TEXT[] DEFAULT '{}',
  data_sources TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gear_catalog ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Gear catalog is publicly readable"
ON public.gear_catalog FOR SELECT
USING (true);

-- Create update trigger
CREATE TRIGGER update_gear_catalog_updated_at
BEFORE UPDATE ON public.gear_catalog
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for common queries
CREATE INDEX idx_gear_catalog_category ON public.gear_catalog(category);
CREATE INDEX idx_gear_catalog_brand ON public.gear_catalog(brand);
CREATE INDEX idx_gear_catalog_release_year ON public.gear_catalog(release_year);