/**
 * Shopify Product Sync Component
 * 
 * Displays Shopify alignment status and provides sync actions
 * for the Creative Studio Review & Export step.
 */

import { useState } from 'react';
import { 
  Store, Check, AlertCircle, Loader2, ExternalLink,
  Package, Tag, Info
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { type ProductDraft } from '../../hooks/useCreativeWorkflow';
import {
  validateForShopify,
  getShopifyTemplate,
  getFulfillmentInfo,
  createShopifyProduct,
  type ShopifyValidationResult,
} from '../../services/shopify-product.service';

interface ShopifyProductSyncProps {
  draft: ProductDraft;
  onProductCreated?: (productId: string) => void;
}

export function ShopifyProductSync({
  draft,
  onProductCreated,
}: ShopifyProductSyncProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [validation, setValidation] = useState<ShopifyValidationResult | null>(null);
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);

  // Get template and fulfillment info
  const template = draft.selectedProduct 
    ? getShopifyTemplate(draft.selectedProduct.type)
    : null;
  const fulfillmentInfo = draft.selectedProduct
    ? getFulfillmentInfo(draft.selectedProduct.type)
    : null;

  // Validate on demand
  const handleValidate = () => {
    const result = validateForShopify(draft);
    setValidation(result);
    
    if (result.isValid) {
      toast.success('Product is ready for Shopify');
    } else {
      toast.error('Validation issues found');
    }
  };

  // Create product in Shopify
  const handleCreateProduct = async () => {
    setIsCreating(true);
    
    try {
      const result = await createShopifyProduct(draft);
      
      if (result.success && result.productId) {
        setCreatedProductId(result.productId);
        toast.success('Product created in Shopify as draft');
        onProductCreated?.(result.productId);
      } else {
        toast.error(result.error || 'Failed to create product');
      }
    } catch (err) {
      toast.error('Error creating Shopify product');
    } finally {
      setIsCreating(false);
    }
  };

  const isShopifyReady = !!template;

  return (
    <Card className="p-5 border-border/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-mono text-sm uppercase tracking-wide text-muted-foreground">
            Shopify Integration
          </h3>
        </div>
        <Badge 
          variant={isShopifyReady ? 'default' : 'secondary'}
          className="font-mono text-[10px]"
        >
          {isShopifyReady ? 'Ready' : 'Not Configured'}
        </Badge>
      </div>

      {isShopifyReady && template ? (
        <div className="space-y-4">
          {/* Product Type Mapping */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground text-xs">Shopify Type</span>
              <p className="font-mono">{template.shopifyProductType}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Vendor</span>
              <p className="font-mono">{template.vendor}</p>
            </div>
          </div>

          {/* Fulfillment Info */}
          {fulfillmentInfo && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-mono uppercase text-muted-foreground">
                  Fulfillment
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Provider:</span>
                  <span className="ml-1 capitalize">{fulfillmentInfo.provider}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Production:</span>
                  <span className="ml-1">{fulfillmentInfo.productionTime}</span>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-muted-foreground text-xs">Print Areas:</span>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {fulfillmentInfo.printAreas.map(area => (
                    <Badge key={area} variant="outline" className="text-[9px]">
                      {area.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tags Preview */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-mono uppercase text-muted-foreground">
                Tags
              </span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {template.tags.slice(0, 5).map(tag => (
                <Badge key={tag} variant="secondary" className="text-[9px]">
                  {tag}
                </Badge>
              ))}
              {template.tags.length > 5 && (
                <Badge variant="secondary" className="text-[9px]">
                  +{template.tags.length - 5} more
                </Badge>
              )}
            </div>
          </div>

          {/* Variants Info */}
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {template.variants.length} size variants
            </span>
            {' '}will be created: {template.variants.map(v => v.option1).join(', ')}
          </div>

          <Separator />

          {/* Validation Results */}
          {validation && (
            <div className="space-y-2">
              {validation.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside text-xs">
                      {validation.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              {validation.warnings.length > 0 && (
                <Alert className="border-yellow-500/50 bg-yellow-500/10">
                  <Info className="w-4 h-4 text-yellow-500" />
                  <AlertDescription>
                    <ul className="list-disc list-inside text-xs text-yellow-600">
                      {validation.warnings.map((warn, i) => (
                        <li key={i}>{warn}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              {validation.isValid && validation.warnings.length === 0 && (
                <div className="flex items-center gap-2 text-sm text-logo-green">
                  <Check className="w-4 h-4" />
                  <span>Ready for Shopify</span>
                </div>
              )}
            </div>
          )}

          {/* Created Product Link */}
          {createdProductId && (
            <Alert className="border-primary/50 bg-primary/10">
              <Check className="w-4 h-4 text-primary" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-sm">Product created as draft</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View in Shopify
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Opens Shopify Admin</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleValidate}
              disabled={isCreating}
            >
              Validate
            </Button>
            <Button
              size="sm"
              onClick={handleCreateProduct}
              disabled={isCreating || !!createdProductId}
              className="flex-1"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : createdProductId ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Created
                </>
              ) : (
                <>
                  <Store className="w-4 h-4 mr-2" />
                  Create Shopify Draft
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-2">
            Select a product type to see Shopify integration options.
          </p>
          <p className="text-xs text-muted-foreground">
            Supported: Hoodie, T-Shirt, Cap, Tote Bag, Bandana
          </p>
        </div>
      )}
    </Card>
  );
}

export default ShopifyProductSync;
