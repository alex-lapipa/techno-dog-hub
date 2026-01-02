
-- Insert missing artists into canonical_artists
INSERT INTO canonical_artists (
  canonical_name, slug, sort_name, city, country, region, primary_genre, is_active
) VALUES 
  ('Ansome', 'ansome', 'Ansome', 'Manchester', 'United Kingdom', 'Europe', 'Techno', true),
  ('Ski Mask', 'ski-mask', 'Ski Mask', 'Munich', 'Germany', 'Europe', 'Techno', true),
  ('Panther Modern', 'panther-modern', 'Panther Modern', 'Berlin', 'Germany', 'Europe', 'Techno', true),
  ('Only Now', 'only-now', 'Only Now', 'Rome', 'Italy', 'Europe', 'Techno', true)
ON CONFLICT (slug) DO NOTHING;
