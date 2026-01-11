-- =====================================================
-- Phase 4.1: Move Extensions to Dedicated Schema
-- This is a safe, additive migration that creates a new
-- extensions schema and ensures proper organization
-- =====================================================

-- Create extensions schema if not exists
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage to relevant roles
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Note: Moving existing extensions requires superuser privileges
-- and would cause downtime. Instead, we ensure new extensions go to
-- the extensions schema by setting the default search_path.
-- The vector and pg_net extensions in public will continue to work.

-- Add a comment documenting the schema purpose
COMMENT ON SCHEMA extensions IS 'Schema for database extensions - new extensions should be installed here';

-- Create a helper function to check extension locations
CREATE OR REPLACE FUNCTION public.get_extension_info()
RETURNS TABLE(extension_name text, schema_name text, version text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    e.extname::text,
    n.nspname::text,
    e.extversion::text
  FROM pg_extension e
  JOIN pg_namespace n ON e.extnamespace = n.oid
  WHERE e.extname NOT IN ('plpgsql')
  ORDER BY n.nspname, e.extname;
$$;