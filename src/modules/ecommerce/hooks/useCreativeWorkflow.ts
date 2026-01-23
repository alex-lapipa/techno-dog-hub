/**
 * Creative Studio Workflow State Management
 * 
 * Manages the step-by-step product design flow from initial idea to draft.
 * Integrates with brand book guidelines and AI for editorial generation.
 */

import { useState, useCallback, useMemo } from 'react';
import { useBrandBookGuidelines, type BrandBookType, type ApprovedMascot, type ApprovedProduct } from './useBrandBookGuidelines';

// Workflow step definitions
// Restructured: Brand + Visual → Product Config → Story → Image → Review
export type WorkflowStep = 
  | 'brand-selection'      // Step 1: Brand identity + visual assets selection
  | 'shopify-catalog'      // Step 2: Product type, size, color selection (Shopify-first)
  | 'product-copy'         // Step 3: Optional text/tagline placement
  | 'story-generator'      // Step 4: AI-powered product story with prompt
  | 'image-generator'      // Step 5: AI-powered product image generation
  | 'review-export';       // Step 6: Final review and export

// Legacy steps kept for backward compatibility
export type LegacyWorkflowStep = 'visual-selection' | 'color-line' | 'editorial-brief';

// Color line types (from brand book - NEVER MODIFY)
export type ColorLineType = 'green-line' | 'white-line';

export interface WorkflowStepConfig {
  id: WorkflowStep;
  number: number;
  title: string;
  description: string;
  required: boolean;
}

export const WORKFLOW_STEPS: WorkflowStepConfig[] = [
  {
    id: 'brand-selection',
    number: 1,
    title: 'Brand & Visuals',
    description: 'Choose brand identity and select visual assets',
    required: true,
  },
  {
    id: 'shopify-catalog',
    number: 2,
    title: 'Product Config',
    description: 'Select product type, size, and color',
    required: true,
  },
  {
    id: 'product-copy',
    number: 3,
    title: 'Product Copy',
    description: 'Add text or tagline (optional)',
    required: false,
  },
  {
    id: 'story-generator',
    number: 4,
    title: 'Story Generator',
    description: 'AI-generated product story from your prompt',
    required: true,
  },
  {
    id: 'image-generator',
    number: 5,
    title: 'Image Generator',
    description: 'AI-generated product mockup',
    required: false,
  },
  {
    id: 'review-export',
    number: 6,
    title: 'Review & Export',
    description: 'Preview, compliance check, and save to Shopify',
    required: true,
  },
];

// Text placement options for product copy
export type TextPlacement = 'front' | 'back' | 'left-side' | 'right-side' | 'sleeve' | 'hood' | 'collar';

export interface ProductCopyConfig {
  text: string;
  placement: TextPlacement;
  fontSize?: 'small' | 'medium' | 'large';
}

// Shopify catalog selection
export interface ShopifyCatalogSelection {
  productId: string;
  productName: string;
  category: string;
  size: string | null;
  color: string | null;
  basePrice: number;
}

// Uploaded asset from Step 1
export interface UploadedAsset {
  id: string;
  name: string;
  url: string;
  type: 'upload' | 'url';
  size?: number;
}

// Product draft structure
export interface ProductDraft {
  id?: string;
  brandBook: BrandBookType;
  selectedModels?: string[]; // AI models for creative process
  selectedVisuals?: string[]; // Visual IDs from brand book
  uploadedAssets?: UploadedAsset[]; // User uploaded/pasted images
  selectedMascot?: ApprovedMascot | null;
  colorLine?: ColorLineType | null;
  shopifyCatalog?: ShopifyCatalogSelection | null; // NEW: Shopify catalog selection
  selectedProduct?: ApprovedProduct | null;
  productCopy?: ProductCopyConfig[];
  productConcept?: string;
  editorialBrief?: {
    productName: string;
    tagline: string;
    description: string;
    creativeRationale: string;
    targetAudience: string;
  };
  generatedImageUrl?: string;
  status: 'in_progress' | 'draft' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

export interface UseCreativeWorkflowReturn {
  // Current state
  currentStep: WorkflowStep;
  currentStepConfig: WorkflowStepConfig;
  stepNumber: number;
  totalSteps: number;
  
  // Draft data
  draft: ProductDraft;
  
  // Brand book integration
  brandBook: BrandBookType;
  guidelines: ReturnType<typeof useBrandBookGuidelines>['activeGuidelines'];
  isOwner: boolean;
  
  // Navigation
  canGoNext: boolean;
  canGoBack: boolean;
  goToStep: (step: WorkflowStep) => void;
  goNext: () => void;
  goBack: () => void;
  
  // Draft updates
  updateDraft: (updates: Partial<ProductDraft>) => void;
  selectBrand: (brand: BrandBookType) => void;
  selectModels: (models: string[]) => void;
  selectVisual: (visualId: string) => void;
  addUploadedAsset: (asset: UploadedAsset) => void;
  removeUploadedAsset: (assetId: string) => void;
  selectMascot: (mascot: ApprovedMascot | null) => void;
  setColorLine: (colorLine: ColorLineType | null) => void;
  selectProductType: (product: ApprovedProduct | null) => void;
  setProductCopy: (copy: ProductCopyConfig[]) => void;
  setProductConcept: (concept: string) => void;
  setEditorialBrief: (brief: ProductDraft['editorialBrief']) => void;
  setGeneratedImage: (url: string) => void;
  
  // Workflow actions
  resetWorkflow: () => void;
  saveDraft: () => Promise<void>;
  
  // Step completion status
  isStepComplete: (step: WorkflowStep) => boolean;
  completedSteps: WorkflowStep[];
}

export function useCreativeWorkflow(): UseCreativeWorkflowReturn {
  const { 
    activeBrandBook, 
    switchBrandBook, 
    activeGuidelines,
    isOwner,
    isLoading 
  } = useBrandBookGuidelines();
  
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('brand-selection');
  const [draft, setDraft] = useState<ProductDraft>({
    brandBook: activeBrandBook,
    selectedModels: ['gemini'], // Default to Gemini
    status: 'in_progress',
  });

  // Get current step configuration
  const currentStepConfig = useMemo(() => {
    return WORKFLOW_STEPS.find(s => s.id === currentStep) || WORKFLOW_STEPS[0];
  }, [currentStep]);

  const stepNumber = currentStepConfig.number;
  const totalSteps = WORKFLOW_STEPS.length;

  // Check if a step is complete
  const isStepComplete = useCallback((step: WorkflowStep): boolean => {
    switch (step) {
      case 'brand-selection':
        // Brand must be selected, visuals/mascot optional but color line required for techno-doggies
        if (!draft.brandBook) return false;
        if (draft.brandBook === 'techno-doggies' && !draft.colorLine) return false;
        return true;
      case 'shopify-catalog':
        // Shopify catalog is the single source - must have product, size, and color
        return !!(draft.shopifyCatalog?.productId && draft.shopifyCatalog?.size && draft.shopifyCatalog?.color);
      case 'product-copy':
        // Optional step - always considered complete
        return true;
      case 'story-generator':
        return !!draft.editorialBrief?.productName;
      case 'image-generator':
        // Optional step - always considered complete
        return true;
      case 'review-export':
        return draft.status === 'draft';
      default:
        return false;
    }
  }, [draft]);

  // Get list of completed steps
  const completedSteps = useMemo(() => {
    return WORKFLOW_STEPS
      .filter(s => isStepComplete(s.id))
      .map(s => s.id);
  }, [isStepComplete]);

  // Navigation validation
  const canGoNext = useMemo(() => {
    const currentIndex = WORKFLOW_STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex >= WORKFLOW_STEPS.length - 1) return false;
    
    // Check if current step is complete (if required)
    const config = WORKFLOW_STEPS[currentIndex];
    if (config.required && !isStepComplete(currentStep)) return false;
    
    return true;
  }, [currentStep, isStepComplete]);

  const canGoBack = useMemo(() => {
    const currentIndex = WORKFLOW_STEPS.findIndex(s => s.id === currentStep);
    return currentIndex > 0;
  }, [currentStep]);

  // Navigation functions
  const goToStep = useCallback((step: WorkflowStep) => {
    setCurrentStep(step);
  }, []);

  const goNext = useCallback(() => {
    const currentIndex = WORKFLOW_STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex < WORKFLOW_STEPS.length - 1) {
      setCurrentStep(WORKFLOW_STEPS[currentIndex + 1].id);
    }
  }, [currentStep]);

  const goBack = useCallback(() => {
    const currentIndex = WORKFLOW_STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(WORKFLOW_STEPS[currentIndex - 1].id);
    }
  }, [currentStep]);

  // Draft update functions
  const updateDraft = useCallback((updates: Partial<ProductDraft>) => {
    setDraft(prev => ({ ...prev, ...updates, updatedAt: new Date().toISOString() }));
  }, []);

  const selectBrand = useCallback(async (brand: BrandBookType) => {
    await switchBrandBook(brand);
    updateDraft({ 
      brandBook: brand,
      // Reset mascot when switching brands
      selectedMascot: null,
    });
  }, [switchBrandBook, updateDraft]);

  const selectModels = useCallback((models: string[]) => {
    updateDraft({ selectedModels: models });
  }, [updateDraft]);

  const selectVisual = useCallback((visualId: string) => {
    const currentVisuals = draft.selectedVisuals || [];
    const isSelected = currentVisuals.includes(visualId);
    
    if (isSelected) {
      updateDraft({ selectedVisuals: currentVisuals.filter(id => id !== visualId) });
    } else {
      updateDraft({ selectedVisuals: [...currentVisuals, visualId] });
    }
  }, [draft.selectedVisuals, updateDraft]);

  const addUploadedAsset = useCallback((asset: UploadedAsset) => {
    const currentAssets = draft.uploadedAssets || [];
    updateDraft({ uploadedAssets: [...currentAssets, asset] });
  }, [draft.uploadedAssets, updateDraft]);

  const removeUploadedAsset = useCallback((assetId: string) => {
    const currentAssets = draft.uploadedAssets || [];
    updateDraft({ uploadedAssets: currentAssets.filter(a => a.id !== assetId) });
  }, [draft.uploadedAssets, updateDraft]);

  const selectMascot = useCallback((mascot: ApprovedMascot | null) => {
    updateDraft({ selectedMascot: mascot });
  }, [updateDraft]);

  const setColorLine = useCallback((colorLine: ColorLineType | null) => {
    updateDraft({ colorLine });
  }, [updateDraft]);

  const selectProductType = useCallback((product: ApprovedProduct | null) => {
    updateDraft({ selectedProduct: product });
  }, [updateDraft]);

  const setProductCopy = useCallback((copy: ProductCopyConfig[]) => {
    updateDraft({ productCopy: copy });
  }, [updateDraft]);

  const setProductConcept = useCallback((concept: string) => {
    updateDraft({ productConcept: concept });
  }, [updateDraft]);

  const setEditorialBrief = useCallback((brief: ProductDraft['editorialBrief']) => {
    updateDraft({ editorialBrief: brief });
  }, [updateDraft]);

  const setGeneratedImage = useCallback((url: string) => {
    updateDraft({ generatedImageUrl: url });
  }, [updateDraft]);

  // Reset workflow
  const resetWorkflow = useCallback(() => {
    setCurrentStep('brand-selection');
    setDraft({
      brandBook: activeBrandBook,
      selectedModels: ['gemini'],
      status: 'in_progress',
    });
  }, [activeBrandBook]);

  // Save draft (to be connected to database)
  const saveDraft = useCallback(async () => {
    updateDraft({ status: 'draft' });
    // TODO: Save to Supabase drafts collection
    console.log('Saving draft:', draft);
  }, [draft, updateDraft]);

  return {
    // Current state
    currentStep,
    currentStepConfig,
    stepNumber,
    totalSteps,
    
    // Draft data
    draft,
    
    // Brand book integration
    brandBook: draft.brandBook,
    guidelines: activeGuidelines,
    isOwner,
    
    // Navigation
    canGoNext,
    canGoBack,
    goToStep,
    goNext,
    goBack,
    
    // Draft updates
    updateDraft,
    selectBrand,
    selectModels,
    selectVisual,
    addUploadedAsset,
    removeUploadedAsset,
    selectMascot,
    setColorLine,
    selectProductType,
    setProductCopy,
    setProductConcept,
    setEditorialBrief,
    setGeneratedImage,
    
    // Workflow actions
    resetWorkflow,
    saveDraft,
    
    // Step completion status
    isStepComplete,
    completedSteps,
  };
}

export default useCreativeWorkflow;
