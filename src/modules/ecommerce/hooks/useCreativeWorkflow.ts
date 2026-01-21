/**
 * Creative Studio Workflow State Management
 * 
 * Manages the step-by-step product design flow from initial idea to draft.
 * Integrates with brand book guidelines and AI for editorial generation.
 */

import { useState, useCallback, useMemo } from 'react';
import { useBrandBookGuidelines, type BrandBookType, type ApprovedMascot, type ApprovedProduct } from './useBrandBookGuidelines';

// Workflow step definitions
export type WorkflowStep = 
  | 'brand-selection'
  | 'visual-selection'
  | 'product-type'
  | 'editorial-brief'
  | 'design-preview'
  | 'save-draft';

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
    title: 'Brand Selection',
    description: 'Choose your brand identity',
    required: true,
  },
  {
    id: 'visual-selection',
    number: 2,
    title: 'Visual Assets',
    description: 'Select mascot or icon (optional)',
    required: false,
  },
  {
    id: 'product-type',
    number: 3,
    title: 'Product Type',
    description: 'Choose the merchandise type',
    required: true,
  },
  {
    id: 'editorial-brief',
    number: 4,
    title: 'Editorial Brief',
    description: 'AI-generated product story',
    required: true,
  },
  {
    id: 'design-preview',
    number: 5,
    title: 'Design Preview',
    description: 'Review and refine your design',
    required: true,
  },
  {
    id: 'save-draft',
    number: 6,
    title: 'Save Draft',
    description: 'Save to drafts collection',
    required: true,
  },
];

// Product draft structure
export interface ProductDraft {
  id?: string;
  brandBook: BrandBookType;
  selectedMascot?: ApprovedMascot | null;
  selectedProduct?: ApprovedProduct | null;
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
  selectMascot: (mascot: ApprovedMascot | null) => void;
  selectProductType: (product: ApprovedProduct | null) => void;
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
        return !!draft.brandBook;
      case 'visual-selection':
        // Optional step - always considered complete
        return true;
      case 'product-type':
        return !!draft.selectedProduct;
      case 'editorial-brief':
        return !!draft.editorialBrief?.productName;
      case 'design-preview':
        return !!draft.generatedImageUrl || !!draft.editorialBrief;
      case 'save-draft':
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

  const selectMascot = useCallback((mascot: ApprovedMascot | null) => {
    updateDraft({ selectedMascot: mascot });
  }, [updateDraft]);

  const selectProductType = useCallback((product: ApprovedProduct | null) => {
    updateDraft({ selectedProduct: product });
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
    selectMascot,
    selectProductType,
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
