/**
 * techno.dog E-commerce Module - Creative Studio
 * 
 * AI-enabled step-by-step product design workflow.
 * Integrates brand books for validation and RAG for editorial generation.
 */

import { ArrowLeft, ArrowRight, RotateCcw, Palette } from 'lucide-react';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCreativeWorkflow } from '../hooks/useCreativeWorkflow';
import {
  WorkflowSidebar,
  StepBrandSelection,
  StepVisualSelection,
  StepColorLine,
  StepProductType,
  StepEditorialBrief,
  StepReviewExport,
} from '../components/workflow';

export function CreativeStudio() {
  const workflow = useCreativeWorkflow();

  // Render the current step content
  const renderStepContent = () => {
    switch (workflow.currentStep) {
      case 'brand-selection':
        return (
          <StepBrandSelection
            selectedBrand={workflow.brandBook}
            onSelectBrand={workflow.selectBrand}
            selectedModels={workflow.draft.selectedModels || ['gemini']}
            onSelectModels={workflow.selectModels}
          />
        );
      case 'visual-selection':
        return (
          <StepVisualSelection
            brandBook={workflow.brandBook}
            mascots={workflow.guidelines.mascots}
            selectedMascot={workflow.draft.selectedMascot || null}
            onSelectMascot={workflow.selectMascot}
            onSkip={workflow.goNext}
          />
        );
      case 'color-line':
        return (
          <StepColorLine
            brandBook={workflow.brandBook}
            selectedColorLine={workflow.draft.colorLine || null}
            onSelectColorLine={workflow.setColorLine}
            selectedMascot={workflow.draft.selectedMascot}
          />
        );
      case 'product-type':
        return (
          <StepProductType
            brandBook={workflow.brandBook}
            products={workflow.guidelines.products}
            selectedProduct={workflow.draft.selectedProduct || null}
            onSelectProduct={workflow.selectProductType}
          />
        );
      case 'editorial-brief':
        return (
          <StepEditorialBrief
            draft={workflow.draft}
            onUpdateBrief={workflow.setEditorialBrief}
            onUpdateConcept={workflow.setProductConcept}
            onSkip={workflow.goNext}
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
