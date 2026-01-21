/**
 * Publish Step - Review and publish to Shopify
 * 
 * SHOPIFY-FIRST: Direct integration with Shopify Admin API.
 * Final validation before pushing to live store.
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
  Eye
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { StudioDraft } from '../../hooks/useShopifyStudio';
import { SHOPIFY_STORE_PERMANENT_DOMAIN } from '@/lib/shopify';

interface PublishStepProps {
  draft: StudioDraft;
  isPublishing: boolean;
  onPublish: () => Promise<boolean>;
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
}: PublishStepProps) {
  const [hasPublished, setHasPublished] = useState(draft.status === 'published');

  // Run validation checks
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
  ];

  const hasErrors = validationItems.some(v => v.status === 'fail');
  const warnings = validationItems.filter(v => v.status === 'warn').length;

  // Handle publish
  const handlePublish = async () => {
    const success = await onPublish();
    if (success) {
      setHasPublished(true);
    }
  };

  // Get product preview URL
  const getProductUrl = () => {
    if (draft.shopifyProductHandle) {
      return `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/products/${draft.shopifyProductHandle}`;
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
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
          {hasPublished ? 'Published' : hasErrors ? 'Has Errors' : `${warnings} Warnings`}
        </Badge>
      </div>

      {/* Product Summary Card */}
      <Card className="p-6 bg-card">
        <div className="flex gap-6">
          {/* Preview Image */}
          <div className="w-32 h-32 bg-black rounded-lg flex items-center justify-center overflow-hidden">
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
          <div className="flex-1">
            <h3 className="font-mono font-bold text-lg">
              {draft.aiCopy?.title || draft.title || 'Untitled Product'}
            </h3>
            {draft.aiCopy?.tagline && (
              <p className="text-sm text-muted-foreground italic mt-1">
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
        <ScrollArea className="h-[240px]">
              <div className="space-y-2 pr-4">
            {validationItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  item.status === 'pass' && "border-primary/30 bg-primary/5",
                  item.status === 'warn' && "border-accent/30 bg-accent/5",
                  item.status === 'fail' && "border-destructive/30 bg-destructive/5"
                )}
              >
                <div className="flex items-center gap-3">
                  {item.status === 'pass' && <Check className="w-4 h-4 text-primary" />}
                  {item.status === 'warn' && <AlertTriangle className="w-4 h-4 text-muted-foreground" />}
                  {item.status === 'fail' && <AlertTriangle className="w-4 h-4 text-destructive" />}
                  <span className="font-mono text-sm">{item.label}</span>
                </div>
                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {item.message}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

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
