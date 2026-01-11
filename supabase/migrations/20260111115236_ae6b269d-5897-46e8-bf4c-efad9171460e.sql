-- Phase 2: Harden RLS policies for documents, doggy_variants, and doggy_placeholders
-- These tables currently allow any authenticated user to modify all records
-- We're restricting write access to admins only

-- ============================================
-- 1. Fix documents table (RAG knowledge base)
-- ============================================

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can delete documents" ON public.documents;
DROP POLICY IF EXISTS "Authenticated users can update documents" ON public.documents;

-- Create admin-only policies for modifications
CREATE POLICY "Admins can delete documents"
ON public.documents
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update documents"
ON public.documents
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- 2. Fix doggy_variants table
-- ============================================

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can manage doggy variants" ON public.doggy_variants;

-- Create admin-only policy for modifications
CREATE POLICY "Admins can manage doggy variants"
ON public.doggy_variants
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- 3. Fix doggy_placeholders table
-- ============================================

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can manage placeholders" ON public.doggy_placeholders;

-- Create admin-only policy for modifications
CREATE POLICY "Admins can manage doggy placeholders"
ON public.doggy_placeholders
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));