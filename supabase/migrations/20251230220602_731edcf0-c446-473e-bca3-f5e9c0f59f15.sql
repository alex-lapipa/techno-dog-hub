-- Insert Eulogio and M.E.N into canonical_artists
INSERT INTO public.canonical_artists (
  canonical_name,
  slug,
  sort_name,
  city,
  country,
  region,
  active_years,
  primary_genre,
  is_active,
  needs_review
) VALUES 
(
  'Eulogio',
  'eulogio',
  'eulogio',
  'Oviedo',
  'Spain',
  'Europe',
  '1995–present',
  'Techno',
  true,
  false
),
(
  'M.E.N',
  'men',
  'm.e.n',
  'Barcelona',
  'Spain',
  'Europe',
  '2010–present',
  'Techno',
  true,
  false
);

-- Insert profiles for Eulogio
INSERT INTO public.artist_profiles (
  artist_id,
  source_system,
  source_priority,
  bio_long,
  bio_short,
  known_for,
  labels,
  tags,
  subgenres,
  career_highlights,
  confidence_score
) VALUES 
(
  (SELECT artist_id FROM canonical_artists WHERE slug = 'eulogio'),
  'legacy',
  100,
  'Asturian techno pioneer from Oviedo. A foundational figure at La Real, the legendary club that shaped Oviedo''s electronic music scene in the late ''90s and 2000s. His deep, hypnotic selections carry decades of crate-digging wisdom and an uncompromising dedication to underground sound. Eulogio bridges the classic and contemporary, bringing northern Spain''s raw, honest approach to techno to dancefloors across the country.',
  'Asturian techno pioneer and La Real resident',
  'Asturian techno scene pioneer. 25+ years of underground dedication. Deep, hypnotic selections.',
  ARRAY['PoleGroup', 'Semantica'],
  ARRAY['Spanish', 'hypnotic', 'deep', 'Asturias', 'La Real'],
  ARRAY['hypnotic', 'deep techno'],
  ARRAY['Resident and key figure at La Real, Oviedo', 'Asturian techno scene pioneer since mid-''90s', 'PoleGroup affiliate', '25+ years in Spanish underground techno'],
  0.95
),
(
  (SELECT artist_id FROM canonical_artists WHERE slug = 'men'),
  'legacy',
  100,
  'Barcelona-based. Resident at Moog Barcelona—the city''s legendary basement club. His sets are deep, hypnotic, and perfectly tailored for intimate spaces. A key figure in the Catalan techno scene.',
  'Moog Barcelona resident',
  'Moog Barcelona resident. Deep hypnotic specialist. Catalan techno ambassador.',
  ARRAY['Moog Barcelona'],
  ARRAY['Spanish', 'Barcelona', 'Moog', 'hypnotic', 'deep'],
  ARRAY['hypnotic', 'deep techno'],
  ARRAY['Moog Barcelona resident', 'Barcelona scene leader', 'Intimate club specialist', 'Catalan techno ambassador'],
  0.95
);

-- Insert gear for Eulogio
INSERT INTO public.artist_gear (
  artist_id,
  gear_category,
  gear_items,
  rider_notes,
  source_system
) VALUES 
(
  (SELECT artist_id FROM canonical_artists WHERE slug = 'eulogio'),
  'studio',
  ARRAY['Roland TR-909', 'Korg MS-20', 'Ableton Live'],
  NULL,
  'legacy'
),
(
  (SELECT artist_id FROM canonical_artists WHERE slug = 'eulogio'),
  'dj',
  ARRAY['Pioneer CDJ-3000', 'Allen & Heath Xone:92'],
  'Extended sets preferred. Analog mixer.',
  'legacy'
);