/**
 * Shopify Creative Studio v2 - Central State Management
 * 
 * Shopify-first architecture: Start with live inventory, enhance with brand assets.
 * All product data structures align with Shopify Admin API schema.
 */

import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { fetchProducts, type ShopifyProductEdge } from '@/lib/shopify';
import type { BrandBookType } from './useBrandBookGuidelines';

// ============================================================================
// TYPES - Aligned with Shopify Product Schema
// ============================================================================

export type StudioStep = 
  | 'product-select'
  | 'variant-config'
  | 'brand-design'
  | 'ai-enhance'
  | 'publish';

export interface ShopifyVariant {
  id?: string;
  title: string;
  price: string;
  compare_at_price?: string; // Shopify best practice: show sale pricing
  sku: string;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  inventory_quantity?: number;
  weight?: number;
  weight_unit?: 'g' | 'kg' | 'lb' | 'oz';
  requires_shipping: boolean;
}

export interface ShopifyMetafield {
  namespace: string;
  key: string;
  value: string;
  type: string;
}

export interface ShopifyOption {
  name: string;
  values: string[];
}

export interface ShopifyImage {
  src: string;
  alt?: string;
  position?: number;
}

export interface StudioDraft {
  id?: string;
  
  // Shopify Product Core
  shopifyProductId: string | null;
  shopifyProductHandle: string | null;
  title: string;
  description: string;
  productType: string;
  vendor: string;
  tags: string[];
  
  // Variants & Options (Shopify structure)
  variants: ShopifyVariant[];
  options: ShopifyOption[];
  images: ShopifyImage[];
  
  // Brand Enhancement
  brandBook: BrandBookType;
  mascotId: string | null;
  mascotName: string | null;
  colorLine: 'green-line' | 'white-line' | null;
  
  // AI Generated Content
  aiCopy: {
    title?: string;
    description?: string;
    seoTitle?: string;
    seoDescription?: string;
    tagline?: string;
  } | null;
  aiMockupUrls: string[];
  
  // SEO (Shopify best practice)
  seoTitle: string;
  seoDescription: string;
  handle: string;
  
  // Metafields (Shopify custom data)
  metafields: ShopifyMetafield[];
  
  // Collections
  collectionIds: string[];
  
  // RAG Context
  ragContext: {
    artists: Array<{ name: string; knownFor?: string }>;
    gear: Array<{ name: string; type: string }>;
    scenePreset?: string;
  } | null;
  
  // Workflow
  currentStep: StudioStep;
  status: 'draft' | 'ready' | 'published' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

export interface StudioStepConfig {
  id: StudioStep;
  number: number;
  title: string;
  description: string;
}

export const STUDIO_STEPS: StudioStepConfig[] = [
  {
    id: 'product-select',
    number: 1,
    title: 'Select Product',
    description: 'Choose from Shopify inventory or create new',
  },
  {
    id: 'variant-config',
    number: 2,
    title: 'Configure Variants',
    description: 'Set sizes, colors, and pricing',
  },
  {
    id: 'brand-design',
    number: 3,
    title: 'Brand Design',
    description: 'Apply mascots and brand assets',
  },
  {
    id: 'ai-enhance',
    number: 4,
    title: 'AI Enhancement',
    description: 'Generate copy and mockups',
  },
  {
    id: 'publish',
    number: 5,
    title: 'Publish',
    description: 'Review and publish to Shopify',
  },
];

const INITIAL_DRAFT: StudioDraft = {
  shopifyProductId: null,
  shopifyProductHandle: null,
  title: '',
  description: '',
  productType: '',
  vendor: 'techno.dog',
  tags: [],
  variants: [],
  options: [],
  images: [],
  brandBook: 'techno-doggies',
  mascotId: null,
  mascotName: null,
  colorLine: null,
  aiCopy: null,
  aiMockupUrls: [],
  seoTitle: '',
  seoDescription: '',
  handle: '',
  metafields: [],
  collectionIds: [],
  ragContext: null,
  currentStep: 'product-select',
  status: 'draft',
};

// ============================================================================
// HOOK
// ============================================================================

export interface UseShopifyStudioReturn {
  // State
  draft: StudioDraft;
  currentStep: StudioStep;
  currentStepConfig: StudioStepConfig;
  stepNumber: number;
  totalSteps: number;
  
  // Shopify Data
  shopifyProducts: ShopifyProductEdge[];
  isLoadingProducts: boolean;
  refreshProducts: () => Promise<void>;
  
  // Navigation
  canGoNext: boolean;
  canGoBack: boolean;
  goNext: () => void;
  goBack: () => void;
  goToStep: (step: StudioStep) => void;
  
  // Draft Updates
  updateDraft: (updates: Partial<StudioDraft>) => void;
  selectShopifyProduct: (product: ShopifyProductEdge | null) => void;
  setBrandBook: (brand: BrandBookType) => void;
  setMascot: (id: string | null, name: string | null) => void;
  setColorLine: (line: 'green-line' | 'white-line' | null) => void;
  setAICopy: (copy: StudioDraft['aiCopy']) => void;
  addMockupUrl: (url: string) => void;
  
  // Persistence
  saveDraft: () => Promise<string | null>;
  loadDraft: (id: string) => Promise<void>;
  resetStudio: () => void;
  
  // Publishing
  publishToShopify: () => Promise<boolean>;
  isPublishing: boolean;
  
  // Validation
  isStepComplete: (step: StudioStep) => boolean;
  completedSteps: StudioStep[];
}

export function useShopifyStudio(): UseShopifyStudioReturn {
  const [draft, setDraft] = useState<StudioDraft>(INITIAL_DRAFT);
  const [shopifyProducts, setShopifyProducts] = useState<ShopifyProductEdge[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Current step derived from draft
  const currentStep = draft.currentStep;
  const currentStepConfig = STUDIO_STEPS.find(s => s.id === currentStep) || STUDIO_STEPS[0];
  const stepNumber = currentStepConfig.number;
  const totalSteps = STUDIO_STEPS.length;

  // ========== SHOPIFY DATA ==========
  
  const refreshProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const products = await fetchProducts(50);
      setShopifyProducts(products);
    } catch (error) {
      console.error('[ShopifyStudio] Failed to fetch products:', error);
      toast.error('Failed to load Shopify products');
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  // ========== STEP VALIDATION ==========
  
  const isStepComplete = useCallback((step: StudioStep): boolean => {
    switch (step) {
      case 'product-select':
        return draft.title.length > 0 && draft.productType.length > 0;
      case 'variant-config':
        return draft.variants.length > 0;
      case 'brand-design':
        return draft.brandBook !== null;
      case 'ai-enhance':
        return true; // Optional step
      case 'publish':
        return draft.status === 'published';
      default:
        return false;
    }
  }, [draft]);

  const completedSteps = useMemo(() => {
    return STUDIO_STEPS.filter(s => isStepComplete(s.id)).map(s => s.id);
  }, [isStepComplete]);

  // ========== NAVIGATION ==========
  
  const currentIndex = STUDIO_STEPS.findIndex(s => s.id === currentStep);
  const canGoBack = currentIndex > 0;
  const canGoNext = isStepComplete(currentStep) && currentIndex < STUDIO_STEPS.length - 1;

  const goToStep = useCallback((step: StudioStep) => {
    setDraft(prev => ({ ...prev, currentStep: step }));
  }, []);

  const goNext = useCallback(() => {
    if (canGoNext) {
      const nextStep = STUDIO_STEPS[currentIndex + 1];
      goToStep(nextStep.id);
    }
  }, [canGoNext, currentIndex, goToStep]);

  const goBack = useCallback(() => {
    if (canGoBack) {
      const prevStep = STUDIO_STEPS[currentIndex - 1];
      goToStep(prevStep.id);
    }
  }, [canGoBack, currentIndex, goToStep]);

  // ========== DRAFT UPDATES ==========
  
  const updateDraft = useCallback((updates: Partial<StudioDraft>) => {
    setDraft(prev => ({ ...prev, ...updates }));
  }, []);

  const selectShopifyProduct = useCallback((product: ShopifyProductEdge | null) => {
    if (!product) {
      // Creating new product
      setDraft(prev => ({
        ...prev,
        shopifyProductId: null,
        shopifyProductHandle: null,
        title: '',
        description: '',
        productType: '',
        variants: [],
        options: [],
        images: [],
      }));
      return;
    }

    const node = product.node;
    
    // Map Shopify product to draft
    const variants: ShopifyVariant[] = node.variants.edges.map(v => ({
      id: v.node.id,
      title: v.node.title,
      price: v.node.price.amount,
      sku: v.node.id.split('/').pop() || '',
      option1: v.node.selectedOptions[0]?.value || null,
      option2: v.node.selectedOptions[1]?.value || null,
      option3: v.node.selectedOptions[2]?.value || null,
      requires_shipping: true,
    }));

    const options: ShopifyOption[] = node.options.map(o => ({
      name: o.name,
      values: o.values,
    }));

    const images: ShopifyImage[] = node.images.edges.map((img, idx) => ({
      src: img.node.url,
      alt: img.node.altText || node.title,
      position: idx + 1,
    }));

    setDraft(prev => ({
      ...prev,
      shopifyProductId: node.id,
      shopifyProductHandle: node.handle,
      title: node.title,
      description: node.description,
      productType: (node as any).productType || '',
      variants,
      options,
      images,
    }));
  }, []);

  const setBrandBook = useCallback((brand: BrandBookType) => {
    setDraft(prev => ({ 
      ...prev, 
      brandBook: brand,
      // Reset mascot if switching brands
      mascotId: null,
      mascotName: null,
      colorLine: null,
    }));
  }, []);

  const setMascot = useCallback((id: string | null, name: string | null) => {
    setDraft(prev => ({ ...prev, mascotId: id, mascotName: name }));
  }, []);

  const setColorLine = useCallback((line: 'green-line' | 'white-line' | null) => {
    setDraft(prev => ({ ...prev, colorLine: line }));
  }, []);

  const setAICopy = useCallback((copy: StudioDraft['aiCopy']) => {
    setDraft(prev => ({ ...prev, aiCopy: copy }));
  }, []);

  const addMockupUrl = useCallback((url: string) => {
    setDraft(prev => ({ 
      ...prev, 
      aiMockupUrls: [...prev.aiMockupUrls, url],
    }));
  }, []);

  // ========== PERSISTENCE ==========
  
  const saveDraft = useCallback(async (): Promise<string | null> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const draftData = {
        user_id: userData.user?.id,
        shopify_product_id: draft.shopifyProductId,
        shopify_product_handle: draft.shopifyProductHandle,
        title: draft.title,
        description: draft.description,
        product_type: draft.productType,
        vendor: draft.vendor,
        tags: draft.tags,
        variants: JSON.parse(JSON.stringify(draft.variants)),
        options: JSON.parse(JSON.stringify(draft.options)),
        brand_book: draft.brandBook,
        mascot_id: draft.mascotId,
        color_line: draft.colorLine,
        ai_generated_copy: draft.aiCopy as any,
        ai_mockup_urls: draft.aiMockupUrls,
        rag_context: draft.ragContext as any,
        current_step: STUDIO_STEPS.findIndex(s => s.id === draft.currentStep) + 1,
        status: draft.status,
      };

      if (draft.id) {
        // Update existing
        const { error } = await supabase
          .from('shopify_studio_drafts')
          .update(draftData as any)
          .eq('id', draft.id);
        
        if (error) throw error;
        toast.success('Draft saved');
        return draft.id;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('shopify_studio_drafts')
          .insert(draftData as any)
          .select('id')
          .single();
        
        if (error) throw error;
        setDraft(prev => ({ ...prev, id: data.id }));
        toast.success('Draft created');
        return data.id;
      }
    } catch (error) {
      console.error('[ShopifyStudio] Save failed:', error);
      toast.error('Failed to save draft');
      return null;
    }
  }, [draft]);

  const loadDraft = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('shopify_studio_drafts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      const stepIndex = (data.current_step || 1) - 1;
      const currentStep = STUDIO_STEPS[stepIndex]?.id || 'product-select';
      
      setDraft({
        id: data.id,
        shopifyProductId: data.shopify_product_id,
        shopifyProductHandle: data.shopify_product_handle,
        title: data.title,
        description: data.description || '',
        productType: data.product_type || '',
        vendor: data.vendor || 'techno.dog',
        tags: data.tags || [],
        variants: (data.variants as unknown as ShopifyVariant[]) || [],
        options: (data.options as unknown as ShopifyOption[]) || [],
        images: [],
        brandBook: data.brand_book as BrandBookType || 'techno-doggies',
        mascotId: data.mascot_id,
        mascotName: null,
        colorLine: data.color_line as 'green-line' | 'white-line' | null,
        aiCopy: data.ai_generated_copy as StudioDraft['aiCopy'],
        aiMockupUrls: data.ai_mockup_urls || [],
        seoTitle: '',
        seoDescription: '',
        handle: data.shopify_product_handle || '',
        metafields: [],
        collectionIds: [],
        ragContext: data.rag_context as StudioDraft['ragContext'],
        currentStep,
        status: data.status as StudioDraft['status'],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      });
    } catch (error) {
      console.error('[ShopifyStudio] Load failed:', error);
      toast.error('Failed to load draft');
    }
  }, []);

  const resetStudio = useCallback(() => {
    setDraft(INITIAL_DRAFT);
  }, []);

  // ========== PUBLISHING ==========
  
  const publishToShopify = useCallback(async (): Promise<boolean> => {
    setIsPublishing(true);
    try {
      // Build Shopify product payload
      const productPayload = {
        title: draft.aiCopy?.title || draft.title,
        body_html: draft.aiCopy?.description || draft.description,
        vendor: draft.vendor,
        product_type: draft.productType,
        tags: [...draft.tags, draft.brandBook, draft.mascotName].filter(Boolean),
        variants: draft.variants.map(v => ({
          title: v.title,
          price: v.price,
          sku: v.sku,
          option1: v.option1,
          option2: v.option2,
          option3: v.option3,
          inventory_management: 'shopify',
          requires_shipping: v.requires_shipping,
        })),
        options: draft.options.length > 0 ? draft.options : undefined,
        images: draft.aiMockupUrls.length > 0 
          ? draft.aiMockupUrls.map((src, idx) => ({ src, position: idx + 1 }))
          : undefined,
        metafields: [
          {
            namespace: 'technodog',
            key: 'brand_book',
            value: draft.brandBook,
            type: 'single_line_text_field',
          },
          draft.mascotId ? {
            namespace: 'technodog',
            key: 'mascot_id',
            value: draft.mascotId,
            type: 'single_line_text_field',
          } : null,
        ].filter(Boolean),
      };

      const { data, error } = await supabase.functions.invoke('shopify-create-product', {
        body: { product: productPayload, draftId: draft.id },
      });

      if (error) throw error;
      
      if (data.success) {
        setDraft(prev => ({ 
          ...prev, 
          status: 'published',
          shopifyProductId: data.product.id,
          shopifyProductHandle: data.product.handle,
        }));
        toast.success('Published to Shopify!', {
          description: `Product ID: ${data.product.id}`,
        });
        return true;
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('[ShopifyStudio] Publish failed:', error);
      toast.error('Failed to publish to Shopify');
      return false;
    } finally {
      setIsPublishing(false);
    }
  }, [draft]);

  return {
    draft,
    currentStep,
    currentStepConfig,
    stepNumber,
    totalSteps,
    shopifyProducts,
    isLoadingProducts,
    refreshProducts,
    canGoNext,
    canGoBack,
    goNext,
    goBack,
    goToStep,
    updateDraft,
    selectShopifyProduct,
    setBrandBook,
    setMascot,
    setColorLine,
    setAICopy,
    addMockupUrl,
    saveDraft,
    loadDraft,
    resetStudio,
    publishToShopify,
    isPublishing,
    isStepComplete,
    completedSteps,
  };
}

export default useShopifyStudio;
