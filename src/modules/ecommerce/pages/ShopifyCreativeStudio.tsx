/**
 * Shopify Creative Studio v2 - Main Page (Vertical Flow)
 * 
 * Redesigned with a vertical scrolling layout for better UX.
 * Features: horizontal progress bar, full-width step content,
 * generous whitespace, and sticky bottom navigation.
 * 
 * BRAND COMPLIANCE: Hardcoded to techno.dog and techno-doggies brand books only.
 */

import { useEffect, useCallback } from 'react';
import { Sparkles, Package, Palette, Wand2, Rocket } from 'lucide-react';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { useShopifyStudio } from '../hooks/useShopifyStudio';
import { 
  VerticalProgressIndicator,
  StepContainer,
  BottomNavigation,
  ProductSelector, 
  VariantEditor,
  BrandDesignStep,
  AIEnhancementStep,
  PublishStep,
} from '../components/shopify-studio';
import { type ProductTypeConfig } from '../config/shopify-product-catalog';
import { isPrintfulSupported } from '../config/printful-integration';

// Step metadata for the container
const STEP_META = {
  'product-select': {
    title: 'Choose Your Product',
    description: 'Start from your existing Shopify inventory or create something entirely new from our product catalog.',
    icon: Package,
  },
  'variant-config': {
    title: 'Configure Variants',
    description: 'Set up sizes, colors, and pricing. Shopify handles the variant matrix automatically.',
    icon: Sparkles,
  },
  'brand-design': {
    title: 'Apply Brand Identity',
    description: 'Choose your brand book and apply mascots, colors, and design elements that define your product.',
    icon: Palette,
  },
  'ai-enhance': {
    title: 'AI Enhancement',
    description: 'Generate authentic underground techno copy and product mockups using our Technopedia knowledge base.',
    icon: Wand2,
  },
  'publish': {
    title: 'Review & Publish',
    description: 'Final review of all product details. Configure SEO, metafields, and publish directly to your Shopify store.',
    icon: Rocket,
  },
};

export function ShopifyCreativeStudio() {
  const studio = useShopifyStudio();

  // Load products on mount
  useEffect(() => {
    studio.refreshProducts();
  }, []);

  // Get current step metadata
  const currentMeta = STEP_META[studio.currentStep];

  // Handle product type selection from catalog
  const handleProductTypeSelected = useCallback((productType: ProductTypeConfig) => {
    const isPOD = isPrintfulSupported(productType.id);
    const defaultPrice = productType.basePrice.toFixed(2);
    const defaultSku = `TD-${productType.id.toUpperCase().slice(0, 4)}-${Date.now().toString(36).toUpperCase()}`;
    
    studio.updateDraft({ 
      shopifyProductId: null,
      title: `New ${productType.name}`,
      productType: productType.name,
      description: productType.description,
      variants: [{
        title: 'Default Title',
        price: defaultPrice,
        sku: defaultSku,
        option1: null,
        option2: null,
        option3: null,
        requires_shipping: true,
        inventory_policy: isPOD ? 'continue' : 'deny',
        fulfillment_service: isPOD ? 'printful' : 'manual',
      }],
      tags: [
        productType.category,
        isPOD ? 'print-on-demand' : 'inventory',
        isPOD ? 'printful' : null,
      ].filter(Boolean) as string[],
    });
  }, [studio]);

  // Render current step content (without duplicate headers - StepContainer provides them)
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
            onProductTypeSelected={handleProductTypeSelected}
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
      iconColor="text-logo-green"
    >
      {/* Main Container - Full height with scroll */}
      <div className="flex flex-col -mx-6 -mb-6 min-h-[calc(100vh-120px)] bg-gradient-to-b from-background via-background to-muted/10">
        {/* Horizontal Progress Indicator (Sticky) */}
        <VerticalProgressIndicator
          currentStep={studio.currentStep}
          completedSteps={studio.completedSteps}
          isStepComplete={studio.isStepComplete}
          onStepClick={studio.goToStep}
        />

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto pb-24">
          <StepContainer
            stepNumber={studio.stepNumber}
            totalSteps={studio.totalSteps}
            title={currentMeta.title}
            description={currentMeta.description}
            icon={currentMeta.icon}
            isComplete={studio.isStepComplete(studio.currentStep)}
          >
            {renderStepContent()}
          </StepContainer>
        </div>

        {/* Fixed Bottom Navigation */}
        <BottomNavigation
          currentStepConfig={studio.currentStepConfig}
          stepNumber={studio.stepNumber}
          totalSteps={studio.totalSteps}
          canGoBack={studio.canGoBack}
          canGoNext={studio.canGoNext}
          isPublishStep={studio.currentStep === 'publish'}
          isPublishing={studio.isPublishing}
          onBack={studio.goBack}
          onNext={studio.currentStep === 'publish' ? studio.publishToShopify : studio.goNext}
          onSave={studio.saveDraft}
          onReset={studio.resetStudio}
        />
      </div>
    </AdminPageLayout>
  );
}

export default ShopifyCreativeStudio;
