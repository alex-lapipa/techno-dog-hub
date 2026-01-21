/**
 * Shopify Creative Studio v2 - Main Page
 * 
 * Shopify-first creative workflow for product design and publishing.
 * All 5 steps fully implemented with brand book and RAG integration.
 */

import { useEffect } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, ShoppingBag, Save } from 'lucide-react';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useShopifyStudio } from '../hooks/useShopifyStudio';
import { 
  StudioSidebar, 
  ProductSelector, 
  VariantEditor,
  BrandDesignStep,
  AIEnhancementStep,
  PublishStep,
} from '../components/shopify-studio';

export function ShopifyCreativeStudio() {
  const studio = useShopifyStudio();

  // Load products on mount
  useEffect(() => {
    studio.refreshProducts();
  }, []);

  // Render current step content
  const renderStepContent = () => {
    switch (studio.currentStep) {
      case 'product-select':
        return (
          <ProductSelector
            products={studio.shopifyProducts}
            isLoading={studio.isLoadingProducts}
            onRefresh={studio.refreshProducts}
            selectedProductId={studio.draft.shopifyProductId}
            onSelectProduct={studio.selectShopifyProduct}
            onCreateNew={() => {
              studio.updateDraft({ 
                shopifyProductId: null,
                title: 'New Product',
                productType: 'Apparel',
                variants: [{
                  title: 'Default Title',
                  price: '29.99',
                  sku: 'TD-NEW-001',
                  option1: null,
                  option2: null,
                  option3: null,
                  requires_shipping: true,
                }],
              });
            }}
          />
        );
      case 'variant-config':
        return (
          <VariantEditor
            draft={studio.draft}
            onUpdateDraft={studio.updateDraft}
          />
        );
      case 'brand-design':
        return (
          <BrandDesignStep
            draft={studio.draft}
            onUpdateDraft={studio.updateDraft}
            onSetBrandBook={studio.setBrandBook}
            onSetMascot={studio.setMascot}
            onSetColorLine={studio.setColorLine}
          />
        );
      case 'ai-enhance':
        return (
          <AIEnhancementStep
            draft={studio.draft}
            onUpdateDraft={studio.updateDraft}
            onSetAICopy={studio.setAICopy}
            onAddMockupUrl={studio.addMockupUrl}
          />
        );
      case 'publish':
        return (
          <PublishStep
            draft={studio.draft}
            isPublishing={studio.isPublishing}
            onPublish={studio.publishToShopify}
            onUpdateDraft={studio.updateDraft}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AdminPageLayout
      title="Shopify Creative Studio"
      description="Shopify-first product design workflow"
      icon={ShoppingBag}
      iconColor="text-primary"
      actions={
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-[10px]">
            Step {studio.stepNumber}/{studio.totalSteps}
          </Badge>
          <Button variant="ghost" size="sm" onClick={studio.saveDraft}>
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button variant="ghost" size="sm" onClick={studio.resetStudio}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
      }
    >
      <div className="flex h-[calc(100vh-200px)] min-h-[600px] -mx-6 -mb-6 border-t border-border">
        <StudioSidebar
          currentStep={studio.currentStep}
          completedSteps={studio.completedSteps}
          onStepClick={studio.goToStep}
          isStepComplete={studio.isStepComplete}
          productTitle={studio.draft.title}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {renderStepContent()}
          </div>

          <div className="flex-shrink-0 border-t border-border bg-card/50 p-4">
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={studio.goBack} disabled={!studio.canGoBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="text-xs text-muted-foreground font-mono">
                {studio.currentStepConfig.title}
              </div>
              <Button onClick={studio.goNext} disabled={!studio.canGoNext}>
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

export default ShopifyCreativeStudio;
