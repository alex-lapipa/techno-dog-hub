-- Create protected terms glossary table
CREATE TABLE public.translation_glossary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  term TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.translation_glossary ENABLE ROW LEVEL SECURITY;

-- Public read access (translations need to work for all users)
CREATE POLICY "Anyone can read glossary terms"
ON public.translation_glossary
FOR SELECT
USING (true);

-- Admin write access
CREATE POLICY "Admins can manage glossary"
ON public.translation_glossary
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Insert the approved protected terms
INSERT INTO public.translation_glossary (term, category, description) VALUES
-- Brand Identity
('techno.dog', 'brand', 'Primary brand name - never translate'),
('T:DOG', 'brand', 'Brand abbreviation'),
('Doggies', 'brand', 'NFT/avatar collection name'),
('Technopedia', 'brand', 'Knowledge base section name'),
('ringleader', 'brand', 'Community role name'),

-- Techno Subgenres & Styles
('Techno', 'genre', 'Core genre - universal term'),
('Acid', 'genre', 'Subgenre using 303 sounds'),
('Industrial', 'genre', 'Hard, mechanical subgenre'),
('Minimal', 'genre', 'Stripped-down subgenre'),
('Dub Techno', 'genre', 'Echo-heavy subgenre'),
('Hard Techno', 'genre', 'Aggressive subgenre'),
('Detroit Techno', 'genre', 'Original techno style'),
('Berlin Techno', 'genre', 'German scene style'),
('Hypnotic', 'genre', 'Repetitive, trance-inducing style'),
('Peak Time', 'genre', 'Main room energy level'),
('Driving', 'genre', 'Propulsive rhythm descriptor'),
('Mental', 'genre', 'Intense/complex style'),

-- Gear & Equipment Brands
('Roland', 'gear', 'Japanese manufacturer'),
('TR-808', 'gear', 'Iconic drum machine'),
('TR-909', 'gear', 'Classic drum machine'),
('TB-303', 'gear', 'Acid bass synthesizer'),
('Moog', 'gear', 'American synthesizer brand'),
('Korg', 'gear', 'Japanese manufacturer'),
('Pioneer', 'gear', 'DJ equipment brand'),
('CDJ', 'gear', 'CD/digital player'),
('Technics', 'gear', 'Turntable brand'),
('SL-1200', 'gear', 'Classic turntable model'),
('Eurorack', 'gear', 'Modular synth format'),
('Elektron', 'gear', 'Swedish gear maker'),
('Native Instruments', 'gear', 'Software/hardware company'),
('Traktor', 'gear', 'DJ software'),
('Ableton', 'gear', 'DAW software'),
('Ableton Live', 'gear', 'Production software'),

-- Technical Terminology
('BPM', 'technical', 'Beats per minute'),
('DJ', 'technical', 'Disc jockey'),
('Set', 'technical', 'DJ performance'),
('Mix', 'technical', 'Blended tracks'),
('Drop', 'technical', 'Breakdown climax'),
('Kick', 'technical', 'Bass drum'),
('Hi-hat', 'technical', 'Cymbal sound'),
('Synth', 'technical', 'Synthesizer'),
('Modular', 'technical', 'Modular synthesizer'),
('DAW', 'technical', 'Digital audio workstation'),
('MIDI', 'technical', 'Musical instrument digital interface'),
('Sidechain', 'technical', 'Compression technique'),
('Filter', 'technical', 'Frequency shaping'),
('Reverb', 'technical', 'Space/echo effect'),
('Delay', 'technical', 'Echo effect'),
('LFO', 'technical', 'Low frequency oscillator'),
('Arpeggiator', 'technical', 'Note pattern generator'),

-- Cities & Scenes
('Berlin', 'city', 'German techno capital'),
('Detroit', 'city', 'Birthplace of techno'),
('Tbilisi', 'city', 'Georgian techno hub'),
('Amsterdam', 'city', 'Dutch scene center'),
('London', 'city', 'UK techno hub'),
('Tokyo', 'city', 'Japanese scene'),
('Madrid', 'city', 'Spanish techno center'),
('Barcelona', 'city', 'Spanish scene hub'),
('Paris', 'city', 'French techno scene'),
('Brussels', 'city', 'Belgian scene'),
('Glasgow', 'city', 'Scottish techno hub'),
('Manchester', 'city', 'UK industrial scene'),
('Chicago', 'city', 'House music birthplace'),
('New York', 'city', 'US techno scene'),

-- Iconic Venues
('Berghain', 'venue', 'Berlin''s legendary club'),
('Tresor', 'venue', 'Berlin institution'),
('Bassiani', 'venue', 'Tbilisi''s main club'),
('fabric', 'venue', 'London institution'),
('De School', 'venue', 'Amsterdam venue'),
('Khidi', 'venue', 'Tbilisi club'),
('Concrete', 'venue', 'Paris venue'),
('Shelter', 'venue', 'Amsterdam club'),
('about blank', 'venue', 'Berlin club'),
('Fuse', 'venue', 'Brussels institution'),
('Fold', 'venue', 'London warehouse'),
('Printworks', 'venue', 'London venue'),

-- Festivals
('Awakenings', 'festival', 'Dutch festival'),
('Dekmantel', 'festival', 'Amsterdam festival'),
('Movement', 'festival', 'Detroit festival'),
('Time Warp', 'festival', 'German festival'),
('Sónar', 'festival', 'Barcelona festival'),
('Neopop', 'festival', 'Portuguese festival'),
('Melt', 'festival', 'German festival'),
('Katharsis', 'festival', 'Berlin festival'),
('Reaktor', 'festival', 'Dutch festival'),
('DGTL', 'festival', 'Amsterdam festival'),
('Possession', 'festival', 'Paris party series'),
('Herrensauna', 'festival', 'Berlin party series'),

-- Labels & Collectives
('Ostgut Ton', 'label', 'Berghain''s label'),
('Tresor Records', 'label', 'Berlin label'),
('R&S Records', 'label', 'Belgian label'),
('Underground Resistance', 'label', 'Detroit collective'),
('Axis Records', 'label', 'Jeff Mills'' label'),
('Mord Records', 'label', 'Dutch label'),
('Soma Records', 'label', 'Scottish label'),
('Drumcode', 'label', 'Swedish label'),
('Token', 'label', 'Belgian label'),
('Planet Rhythm', 'label', 'Dutch label'),
('PoleGroup', 'label', 'Spanish collective'),

-- Culture Terms
('Rave', 'culture', 'Dance event'),
('Underground', 'culture', 'Non-mainstream scene'),
('Warehouse', 'culture', 'Industrial venue type'),
('Afterhours', 'culture', 'Late/morning parties'),
('Closing', 'culture', 'Final DJ set'),
('Warm-up', 'culture', 'Opening DJ set'),
('B2B', 'culture', 'Back-to-back DJ set'),
('Resident', 'culture', 'Regular club DJ'),
('Crew', 'culture', 'Collective/group'),
('Scene', 'culture', 'Local music community'),
('Vinyl', 'culture', 'Record format'),
('Crate digging', 'culture', 'Record hunting');

-- Update trigger
CREATE TRIGGER update_translation_glossary_updated_at
BEFORE UPDATE ON public.translation_glossary
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();