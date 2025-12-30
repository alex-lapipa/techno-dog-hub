-- Rename columns from techno_doc to techno_dog across all tables

-- 1. Rename in collectives table
ALTER TABLE public.collectives 
  RENAME COLUMN techno_doc_fit_score TO techno_dog_fit_score;

-- 2. Rename in techno_journalists table  
ALTER TABLE public.techno_journalists 
  RENAME COLUMN techno_doc_fit_score TO techno_dog_fit_score;

-- 3. Rename in governance_models table
ALTER TABLE public.governance_models 
  RENAME COLUMN recommended_for_techno_doc TO recommended_for_techno_dog;

-- Add comments for clarity
COMMENT ON COLUMN public.collectives.techno_dog_fit_score IS 'Score indicating how well this collective fits with techno.dog platform';
COMMENT ON COLUMN public.techno_journalists.techno_dog_fit_score IS 'Score indicating how well this journalist fits with techno.dog platform';
COMMENT ON COLUMN public.governance_models.recommended_for_techno_dog IS 'Whether this governance model is recommended for techno.dog';