-- Creative Studio V2: Shopify-First Architecture
-- Archive table for existing drafts + New draft management

-- Archive table to preserve V1 workflow states
CREATE TABLE IF NOT EXISTS public.creative_studio_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_id TEXT,
  workflow_version TEXT DEFAULT 'v1',
  brand_book TEXT,
  workflow_state JSONB,
  archived_at TIMESTAMPTZ DEFAULT now(),
  archived_by UUID,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.creative_studio_archive ENABLE ROW LEVEL SECURITY;

-- Archive is readable by authenticated users
CREATE POLICY "Archive readable by authenticated users"
ON public.creative_studio_archive FOR SELECT
USING (auth.uid() IS NOT NULL);

-- V2 Drafts table - Shopify-first design
CREATE TABLE IF NOT EXISTS public.shopify_studio_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Shopify Product Link (null = new product, value = editing existing)
  shopify_product_id TEXT,
  shopify_product_handle TEXT,
  
  -- Product Core Data
  title TEXT NOT NULL,
  description TEXT,
  product_type TEXT,
  vendor TEXT DEFAULT 'techno.dog',
  tags TEXT[],
  
  -- Variant Configuration (Shopify-aligned)
  variants JSONB DEFAULT '[]'::jsonb,
  options JSONB DEFAULT '[]'::jsonb,
  
  -- Brand & Design
  brand_book TEXT CHECK (brand_book IN ('techno-dog', 'techno-doggies')),
  mascot_id TEXT,
  color_line TEXT CHECK (color_line IN ('green-line', 'white-line')),
  
  -- AI-Generated Content
  ai_generated_copy JSONB,
  ai_mockup_urls TEXT[],
  
  -- RAG Context
  rag_context JSONB,
  
  -- Workflow State
  current_step INTEGER DEFAULT 1,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'published', 'archived')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.shopify_studio_drafts ENABLE ROW LEVEL SECURITY;

-- Users can view their own drafts
CREATE POLICY "Users can view own drafts"
ON public.shopify_studio_drafts FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own drafts
CREATE POLICY "Users can create own drafts"
ON public.shopify_studio_drafts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own drafts
CREATE POLICY "Users can update own drafts"
ON public.shopify_studio_drafts FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own drafts
CREATE POLICY "Users can delete own drafts"
ON public.shopify_studio_drafts FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_shopify_studio_drafts_updated_at
BEFORE UPDATE ON public.shopify_studio_drafts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();