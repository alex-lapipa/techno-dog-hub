/**
 * Shopify Creative Studio v2 - Main Page
 * 
 * Shopify-first creative workflow for product design and publishing.
 * Enhanced UX with cleaner layout and better visual hierarchy.
 */

import { useEffect } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, ShoppingBag, Save, Sparkles } from 'lucide-react';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
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
      title="Creative Studio"
      description="Design and publish products with Shopify-first workflow"
      icon={Sparkles}
      iconColor="text-primary"
      actions={
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-[10px] bg-muted/50">
            Step {studio.stepNumber} of {studio.totalSteps}
          </Badge>
          <Separator orientation="vertical" className="h-5" />
          <Button variant="ghost" size="sm" onClick={studio.saveDraft} className="gap-1.5">
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={studio.resetStudio} className="gap-1.5 text-muted-foreground hover:text-destructive">
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        </div>
      }
    >
      <div className="flex h-[calc(100vh-180px)] min-h-[600px] -mx-6 -mb-6 border-t border-border bg-background/50">
        {/* Sidebar */}
        <StudioSidebar
          currentStep={studio.currentStep}
          completedSteps={studio.completedSteps}
          onStepClick={studio.goToStep}
          isStepComplete={studio.isStepComplete}
          productTitle={studio.draft.title}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Step Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {renderStepContent()}
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="flex-shrink-0 border-t border-border bg-card/80 backdrop-blur-sm">
            <div className="flex items-center justify-between px-6 py-4">
              <Button 
                variant="outline" 
                onClick={studio.goBack} 
                disabled={!studio.canGoBack}
                className="gap-2 min-w-[120px]"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Current:</span>
                  <Badge variant="secondary" className="font-medium">
                    {studio.currentStepConfig.title}
                  </Badge>
                </div>
              </div>
              
              <Button 
                onClick={studio.goNext} 
                disabled={!studio.canGoNext}
                className={cn(
                  "gap-2 min-w-[120px]",
                  studio.currentStep === 'publish' && "bg-logo-green hover:bg-logo-green/90 text-black"
                )}
              >
                {studio.currentStep === 'publish' ? 'Publish' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminPageLayout>
  );
}

export default ShopifyCreativeStudio;
