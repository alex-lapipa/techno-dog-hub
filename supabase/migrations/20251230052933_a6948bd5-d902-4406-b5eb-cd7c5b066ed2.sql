-- Create techno_journalists table for PR/Media agent enrichment
CREATE TABLE public.techno_journalists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  journalist_name TEXT NOT NULL,
  journalist_name_citation TEXT,
  publications JSONB DEFAULT '[]'::jsonb,
  focus_areas JSONB DEFAULT '[]'::jsonb,
  location TEXT,
  location_citation TEXT,
  region TEXT,
  country TEXT,
  city TEXT,
  email TEXT,
  twitter_handle TEXT,
  linkedin_url TEXT,
  website_url TEXT,
  contact_form_url TEXT,
  bio TEXT,
  notes TEXT,
  stakeholder_type TEXT DEFAULT 'journalist',
  relationship_status TEXT DEFAULT 'new',
  techno_doc_fit_score INTEGER DEFAULT 0,
  verification_confidence INTEGER DEFAULT 0,
  last_verified_at TIMESTAMP WITH TIME ZONE,
  sources_json JSONB DEFAULT '[]'::jsonb,
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_techno_journalists_name ON public.techno_journalists(journalist_name);
CREATE INDEX idx_techno_journalists_region ON public.techno_journalists(region);
CREATE INDEX idx_techno_journalists_stakeholder_type ON public.techno_journalists(stakeholder_type);

-- Enable RLS
ALTER TABLE public.techno_journalists ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies
CREATE POLICY "Admin read techno_journalists" ON public.techno_journalists
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin insert techno_journalists" ON public.techno_journalists
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin update techno_journalists" ON public.techno_journalists
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin delete techno_journalists" ON public.techno_journalists
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Create updated_at trigger
CREATE TRIGGER update_techno_journalists_updated_at
  BEFORE UPDATE ON public.techno_journalists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create data_imports table to track imported datasets
CREATE TABLE public.data_imports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  import_name TEXT NOT NULL,
  source_file TEXT,
  entity_type TEXT NOT NULL,
  records_imported INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  import_status TEXT DEFAULT 'pending',
  error_log JSONB,
  imported_by TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for data_imports
ALTER TABLE public.data_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read data_imports" ON public.data_imports
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin insert data_imports" ON public.data_imports
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin update data_imports" ON public.data_imports
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );