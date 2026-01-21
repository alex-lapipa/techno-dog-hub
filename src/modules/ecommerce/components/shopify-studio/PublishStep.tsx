/**
 * Publish Step - Review and publish to Shopify
 * 
 * SHOPIFY-FIRST: Direct integration with Shopify Admin API.
 * Includes SEO, Metafields, and Collections per best practices.
 */

import { useState } from 'react';
import { 
  ShoppingBag, 
  Check, 
  AlertTriangle, 
  ExternalLink, 
  Package,
  DollarSign,
  Tag,
  Image as ImageIcon,
  FileText,
  Rocket,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { StudioDraft, ShopifyMetafield as MetafieldType } from '../../hooks/useShopifyStudio';
import { SHOPIFY_STORE_PERMANENT_DOMAIN } from '@/lib/shopify';
import { SEOPanel } from './SEOPanel';
import { MetafieldEditor, type Metafield } from './MetafieldEditor';
import { CollectionSelector } from './CollectionSelector';

interface PublishStepProps {
  draft: StudioDraft;
  isPublishing: boolean;
  onPublish: () => Promise<boolean>;
  onUpdateDraft?: (updates: Partial<StudioDraft>) => void;
}

interface ValidationItem {
  id: string;
  label: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

export function PublishStep({
  draft,
  isPublishing,
  onPublish,
  onUpdateDraft,
}: PublishStepProps) {
  const [hasPublished, setHasPublished] = useState(draft.status === 'published');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Run validation checks (Shopify best practices)
  const validationItems: ValidationItem[] = [
    {
      id: 'title',
      label: 'Product Title',
      status: (draft.aiCopy?.title || draft.title) ? 'pass' : 'fail',
      message: (draft.aiCopy?.title || draft.title) || 'Missing title',
    },
    {
      id: 'description',
      label: 'Description',
      status: (draft.aiCopy?.description || draft.description) ? 'pass' : 'warn',
      message: (draft.aiCopy?.description || draft.description) 
        ? `${(draft.aiCopy?.description || draft.description).length} characters`
        : 'No description set',
    },
    {
      id: 'variants',
      label: 'Variants',
      status: draft.variants.length > 0 ? 'pass' : 'fail',
      message: `${draft.variants.length} variant(s) configured`,
    },
    {
      id: 'pricing',
      label: 'Pricing',
      status: draft.variants.some(v => parseFloat(v.price) > 0) ? 'pass' : 'fail',
      message: draft.variants.length > 0 
        ? `€${draft.variants[0].price} - €${draft.variants[draft.variants.length - 1].price}`
        : 'No pricing set',
    },
    {
      id: 'seo',
      label: 'SEO',
      status: (draft.seoTitle || draft.aiCopy?.seoTitle) ? 'pass' : 'warn',
      message: (draft.seoTitle || draft.aiCopy?.seoTitle) ? 'Configured' : 'Not configured',
    },
    {
      id: 'brand',
      label: 'Brand Book',
      status: draft.brandBook ? 'pass' : 'warn',
      message: draft.brandBook === 'techno-doggies' ? 'Techno Doggies' : 'techno.dog',
    },
    {
      id: 'mascot',
      label: 'Mascot',
      status: draft.mascotId ? 'pass' : (draft.brandBook === 'techno-doggies' ? 'warn' : 'pass'),
      message: draft.mascotName || 'Not selected',
    },
    {
      id: 'colorLine',
      label: 'Color Line',
      status: draft.colorLine ? 'pass' : 'warn',
      message: draft.colorLine === 'green-line' ? 'Green Line' : draft.colorLine === 'white-line' ? 'White Line' : 'Not selected',
    },
    {
      id: 'images',
      label: 'Product Images',
      status: draft.aiMockupUrls.length > 0 || draft.images.length > 0 ? 'pass' : 'warn',
      message: `${draft.aiMockupUrls.length + draft.images.length} image(s)`,
    },
    {
      id: 'metafields',
      label: 'Metafields',
      status: draft.metafields.length > 0 ? 'pass' : 'warn',
      message: draft.metafields.length > 0 ? `${draft.metafields.length} configured` : 'None configured',
    },
    {
      id: 'collections',
      label: 'Collections',
      status: draft.collectionIds.length > 0 ? 'pass' : 'warn',
      message: draft.collectionIds.length > 0 ? `${draft.collectionIds.length} selected` : 'None selected',
    },
  ];

  const hasErrors = validationItems.some(v => v.status === 'fail');
  const warnings = validationItems.filter(v => v.status === 'warn').length;
  const passed = validationItems.filter(v => v.status === 'pass').length;

  // Handle publish
  const handlePublish = async () => {
    const success = await onPublish();
    if (success) {
      setHasPublished(true);
    }
  };

  // Get product preview URL
  const getProductUrl = () => {
    if (draft.shopifyProductHandle || draft.handle) {
      return `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/products/${draft.shopifyProductHandle || draft.handle}`;
    }
    return null;
  };

  // Handle SEO updates
  const handleSEOUpdate = (seoData: Partial<{ seoTitle: string; seoDescription: string; handle: string }>) => {
    if (onUpdateDraft) {
      onUpdateDraft(seoData);
    }
  };

  // Handle metafield updates
  const handleMetafieldChange = (metafields: Metafield[]) => {
    if (onUpdateDraft) {
      onUpdateDraft({ metafields: metafields as MetafieldType[] });
    }
  };

  // Handle collection updates
  const handleCollectionChange = (collectionIds: string[]) => {
    if (onUpdateDraft) {
      onUpdateDraft({ collectionIds });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Product Summary & Validation */}
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-mono font-bold flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Publish to Shopify
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Review and publish your product to the live store
              </p>
            </div>
            <Badge 
              variant={hasPublished ? 'default' : hasErrors ? 'destructive' : 'outline'}
              className="font-mono"
            >
              {hasPublished ? 'Published' : hasErrors ? 'Has Errors' : `${passed}/${validationItems.length} Ready`}
            </Badge>
          </div>

          {/* Product Summary Card */}
          <Card className="p-6 bg-card">
            <div className="flex gap-6">
              {/* Preview Image */}
              <div className="w-28 h-28 bg-black rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                {draft.aiMockupUrls.length > 0 ? (
                  <img 
                    src={draft.aiMockupUrls[0]} 
                    alt="Product preview"
                    className="w-full h-full object-cover"
                  />
                ) : draft.images.length > 0 ? (
                  <img 
                    src={draft.images[0].src} 
                    alt="Product preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-mono font-bold text-lg truncate">
                  {draft.aiCopy?.title || draft.title || 'Untitled Product'}
                </h3>
                {draft.aiCopy?.tagline && (
                  <p className="text-sm text-muted-foreground italic mt-1 truncate">
                    "{draft.aiCopy.tagline}"
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary">{draft.productType || 'Product'}</Badge>
                  {draft.mascotName && (
                    <Badge variant="outline" className="border-logo-green/50">
                      {draft.mascotName}
                    </Badge>
                  )}
                  {draft.colorLine && (
                    <Badge variant="outline">
                      {draft.colorLine === 'green-line' ? 'Green Line' : 'White Line'}
                    </Badge>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    {draft.variants.length} variant(s)
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    €{draft.variants[0]?.price || '0.00'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    {draft.vendor}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Validation Checklist */}
          <Card className="p-4">
            <h3 className="font-mono font-bold text-sm mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Pre-Publish Checklist
            </h3>
            <ScrollArea className="h-[280px]">
              <div className="space-y-2 pr-4">
                {validationItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      item.status === 'pass' && "border-primary/30 bg-primary/5",
                      item.status === 'warn' && "border-muted bg-muted/50",
                      item.status === 'fail' && "border-destructive/30 bg-destructive/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {item.status === 'pass' && <Check className="w-4 h-4 text-primary" />}
                      {item.status === 'warn' && <AlertTriangle className="w-4 h-4 text-muted-foreground" />}
                      {item.status === 'fail' && <AlertTriangle className="w-4 h-4 text-destructive" />}
                      <span className="font-mono text-sm">{item.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {item.message}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* Right Column: SEO, Metafields, Collections */}
        <div className="space-y-4">
          {/* SEO Panel */}
          <SEOPanel
            seoData={{
              seoTitle: draft.seoTitle || draft.aiCopy?.seoTitle || '',
              seoDescription: draft.seoDescription || draft.aiCopy?.seoDescription || '',
              handle: draft.handle || draft.shopifyProductHandle || '',
            }}
            productTitle={draft.aiCopy?.title || draft.title}
            onUpdate={handleSEOUpdate}
          />

          {/* Advanced Options */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                Advanced Options
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              {/* Metafields */}
              <MetafieldEditor
                metafields={draft.metafields}
                onChange={handleMetafieldChange}
                productType={draft.productType}
              />

              {/* Collections */}
              <CollectionSelector
                selectedCollectionIds={draft.collectionIds}
                onChange={handleCollectionChange}
                productType={draft.productType}
              />
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      <Separator />

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        {hasPublished && getProductUrl() && (
          <Button
            variant="outline"
            onClick={() => window.open(getProductUrl()!, '_blank')}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            View on Store
            <ExternalLink className="w-3 h-3" />
          </Button>
        )}
        
        {!hasPublished && <div />}

        <Button
          size="lg"
          onClick={handlePublish}
          disabled={isPublishing || hasErrors || hasPublished}
          className="gap-2 min-w-[200px]"
        >
          {isPublishing ? (
            <>
              <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              Publishing...
            </>
          ) : hasPublished ? (
            <>
              <Check className="w-4 h-4" />
              Published to Shopify
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4" />
              Publish to Shopify
            </>
          )}
        </Button>
      </div>

      {hasErrors && (
        <p className="text-center text-sm text-destructive">
          Please fix all errors before publishing
        </p>
      )}
    </div>
  );
}

export default PublishStep;
