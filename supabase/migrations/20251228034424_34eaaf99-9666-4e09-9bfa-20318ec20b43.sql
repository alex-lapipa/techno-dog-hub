-- Fix #1: Update td_knowledge_entities type constraint to allow all entity types
-- The news-agent is trying to insert types like 'event', 'record_label', 'crew', 'radio_show', 'podcast', etc.

-- Drop the old constraint
ALTER TABLE public.td_knowledge_entities 
DROP CONSTRAINT IF EXISTS td_knowledge_entities_type_check;

-- Add new comprehensive constraint with all entity types
ALTER TABLE public.td_knowledge_entities 
ADD CONSTRAINT td_knowledge_entities_type_check 
CHECK (type = ANY (ARRAY[
  -- Core entities
  'artist'::text, 
  'label'::text, 
  'record_label'::text,
  'club'::text, 
  'venue'::text, 
  'festival'::text,
  -- Organizations & groups
  'promoter'::text, 
  'collective'::text,
  'crew'::text,
  'agency'::text,
  -- Locations
  'city'::text, 
  'scene'::text,
  'country'::text,
  'region'::text,
  -- Content
  'release'::text,
  'track'::text,
  'album'::text,
  'ep'::text,
  -- Events
  'event'::text,
  'party'::text,
  'rave'::text,
  -- Media
  'radio_show'::text,
  'podcast'::text,
  'mix'::text,
  'documentary'::text,
  -- Equipment
  'gear'::text,
  'synthesizer'::text,
  'drum_machine'::text,
  -- Other
  'genre'::text,
  'subgenre'::text,
  'movement'::text,
  'era'::text,
  'other'::text
]));