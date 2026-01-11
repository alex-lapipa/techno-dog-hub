
-- Add slug columns to gear_catalog and collectives for SEO-friendly URLs
-- This is a non-destructive enhancement

-- 1. Add slug column to gear_catalog
ALTER TABLE public.gear_catalog 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Add slug column to collectives
ALTER TABLE public.collectives 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- 3. Create unique indexes for slug lookups
CREATE UNIQUE INDEX IF NOT EXISTS gear_catalog_slug_idx ON public.gear_catalog(slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS collectives_slug_idx ON public.collectives(slug) WHERE slug IS NOT NULL;

-- 4. Create function to generate slugs from names
CREATE OR REPLACE FUNCTION public.generate_slug(name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        TRIM(name),
        '[^a-zA-Z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    )
  );
END;
$$;

-- 5. Populate existing gear_catalog slugs (brand-name format)
UPDATE public.gear_catalog 
SET slug = public.generate_slug(brand || '-' || name)
WHERE slug IS NULL;

-- 6. Populate existing collectives slugs
UPDATE public.collectives 
SET slug = public.generate_slug(collective_name)
WHERE slug IS NULL;

-- 7. Create trigger to auto-generate slugs on insert for gear_catalog
CREATE OR REPLACE FUNCTION public.auto_generate_gear_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_slug(NEW.brand || '-' || NEW.name);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER gear_catalog_auto_slug
  BEFORE INSERT ON public.gear_catalog
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_gear_slug();

-- 8. Create trigger to auto-generate slugs on insert for collectives
CREATE OR REPLACE FUNCTION public.auto_generate_collective_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_slug(NEW.collective_name);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER collectives_auto_slug
  BEFORE INSERT ON public.collectives
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_collective_slug();
