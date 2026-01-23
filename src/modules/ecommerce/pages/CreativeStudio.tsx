/**
 * techno.dog E-commerce Module - Creative Studio
 * 
 * AI-enabled step-by-step product design workflow.
 * Integrates brand books for validation and RAG for editorial generation.
 * 
 * WORKFLOW:
 * 1. Brand & Visuals - Select brand identity, mascots, color line
 * 2. Product Config - Shopify-first product/size/color selection
 * 3. Product Copy - Optional text placement
 * 4. Story Generator - AI-powered product story from prompt
 * 5. Image Generator - AI-powered product mockup
 * 6. Review & Export - Final review and Shopify export
 */

import { useMemo } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, Palette } from 'lucide-react';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCreativeWorkflow } from '../hooks/useCreativeWorkflow';
import {
  WorkflowSidebar,
  StepCreateProduct,
  StepShopifyCatalog,
  StepProductCopy,
  StepReviewExport,
  SHOPIFY_CATALOG,
} from '../components/workflow';
import StepStoryGenerator from '../components/workflow/StepStoryGenerator';
import StepImageGenerator from '../components/workflow/StepImageGenerator';

export function CreativeStudio() {
  const workflow = useCreativeWorkflow();

  // Find the selected product from catalog based on draft state
  const selectedCatalogProduct = useMemo(() => {
    if (!workflow.draft.shopifyCatalog?.productId) return null;
    return SHOPIFY_CATALOG.find(p => p.id === workflow.draft.shopifyCatalog?.productId) || null;
  }, [workflow.draft.shopifyCatalog?.productId]);

  // Render the current step content
  const renderStepContent = () => {
    switch (workflow.currentStep) {
      case 'brand-selection':
        return (
          <StepCreateProduct
            selectedBrand={workflow.brandBook}
            onSelectBrand={workflow.selectBrand}
            selectedVisuals={workflow.draft.selectedVisuals || []}
            onSelectVisual={workflow.selectVisual}
            uploadedAssets={workflow.draft.uploadedAssets || []}
            onUploadAsset={workflow.addUploadedAsset}
            onRemoveAsset={workflow.removeUploadedAsset}
            // Color line selection now part of step 1 for Techno Doggies
            selectedColorLine={workflow.draft.colorLine || null}
            onSelectColorLine={workflow.setColorLine}
            // Mascot selection also part of step 1
            selectedMascot={workflow.draft.selectedMascot || null}
            onSelectMascot={workflow.selectMascot}
          />
        );
      case 'shopify-catalog':
        return (
          <StepShopifyCatalog
            selectedProduct={selectedCatalogProduct}
            selectedSize={workflow.draft.shopifyCatalog?.size || null}
            selectedColor={workflow.draft.shopifyCatalog?.color || null}
            onSelectProduct={(product) => {
              if (product) {
                // Auto-select first available size and color
                const firstSize = product.sizes[0]?.code || null;
                const firstColor = product.colors.find(c => c.inStock)?.code || null;
                workflow.updateDraft({
                  shopifyCatalog: {
                    productId: product.id,
                    productName: product.name,
                    category: product.category,
                    size: firstSize,
                    color: firstColor,
                    basePrice: product.basePrice,
                  }
                });
              } else {
                workflow.updateDraft({ shopifyCatalog: null });
              }
            }}
            onSelectSize={(size) => {
              if (workflow.draft.shopifyCatalog) {
                workflow.updateDraft({
                  shopifyCatalog: { ...workflow.draft.shopifyCatalog, size }
                });
              }
            }}
            onSelectColor={(color) => {
              if (workflow.draft.shopifyCatalog) {
                workflow.updateDraft({
                  shopifyCatalog: { ...workflow.draft.shopifyCatalog, color }
                });
              }
            }}
          />
        );
      case 'product-copy':
        return (
          <StepProductCopy
            productType={workflow.draft.shopifyCatalog?.productName}
            currentCopy={workflow.draft.productCopy || []}
            onUpdateCopy={workflow.setProductCopy}
            onSkip={workflow.goNext}
          />
        );
      case 'story-generator':
        return (
          <StepStoryGenerator
            draft={workflow.draft}
            onUpdateBrief={workflow.setEditorialBrief}
            onUpdateConcept={workflow.setProductConcept}
          />
        );
      case 'image-generator':
        return (
          <StepImageGenerator
            draft={workflow.draft}
            onSetImage={workflow.setGeneratedImage}
          />
        );
      case 'review-export':
        return (
          <StepReviewExport
            draft={workflow.draft}
            onSetImage={workflow.setGeneratedImage}
            onSaveDraft={workflow.saveDraft}
            isOwner={workflow.isOwner}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AdminPageLayout
      title="Creative Studio"
      description="AI-powered product design workflow"
      icon={Palette}
      iconColor="text-crimson"
      actions={
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-[10px]">
            Step {workflow.stepNumber}/{workflow.totalSteps}
          </Badge>
          <Button variant="ghost" size="sm" onClick={workflow.resetWorkflow}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
      }
    >
      <div className="flex h-[calc(100vh-200px)] min-h-[600px] -mx-6 -mb-6 border-t border-border">
        {/* Sidebar */}
        <WorkflowSidebar
          currentStep={workflow.currentStep}
          completedSteps={workflow.completedSteps}
          onStepClick={workflow.goToStep}
          isStepComplete={workflow.isStepComplete}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Step content */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderStepContent()}
          </div>

          {/* Navigation footer */}
          <div className="flex-shrink-0 border-t border-border bg-card/50 p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={workflow.goBack}
                disabled={!workflow.canGoBack}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <div className="text-xs text-muted-foreground font-mono">
                {workflow.currentStepConfig.title}
              </div>

              <Button
                onClick={workflow.goNext}
                disabled={!workflow.canGoNext}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminPageLayout>
  );
}

export default CreativeStudio;
