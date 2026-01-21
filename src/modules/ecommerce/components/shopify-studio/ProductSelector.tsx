/**
 * Shopify Creative Studio v2 - Step 1: Product Selector
 * 
 * Start from LIVE Shopify inventory or create a new product.
 * Shopify-first: All products come from real Shopify data.
 */

import { useEffect, useState } from 'react';
import { 
  Package, Plus, RefreshCw, Search, ShoppingBag, 
  Check, ExternalLink, Image as ImageIcon 
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { type ShopifyProductEdge } from '@/lib/shopify';
import { openShopifyAdmin } from '../../config/shopify-config';
import { ProductTypeCatalog } from './ProductTypeCatalog';
import { getProductById, type ProductTypeConfig } from '../../config/shopify-product-catalog';

interface ProductSelectorProps {
  products: ShopifyProductEdge[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  selectedProductId: string | null;
  onSelectProduct: (product: ShopifyProductEdge | null) => void;
  onCreateNew: () => void;
}

export function ProductSelector({
  products,
  isLoading,
  onRefresh,
  selectedProductId,
  onSelectProduct,
  onCreateNew,
}: ProductSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load products on mount
  useEffect(() => {
    if (products.length === 0 && !isLoading) {
      onRefresh();
    }
  }, [products.length, isLoading, onRefresh]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  // Filter products by search
  const filteredProducts = products.filter(p => {
    const query = searchQuery.toLowerCase();
    return (
      p.node.title.toLowerCase().includes(query) ||
      p.node.description?.toLowerCase().includes(query) ||
      (p.node as any).productType?.toLowerCase().includes(query)
    );
  });

  // Group by product type
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const type = (product.node as any).productType || 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(product);
    return acc;
  }, {} as Record<string, ShopifyProductEdge[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-mono font-bold text-foreground mb-2">
          Select Product
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose an existing product from your Shopify inventory to enhance, or create a new one.
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => openShopifyAdmin('products')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Shopify
        </Button>
      </div>

      {/* Create New Card */}
      <Card
        onClick={onCreateNew}
        className={cn(
          "p-4 cursor-pointer transition-all border-dashed border-2",
          "hover:border-primary hover:bg-primary/5",
          selectedProductId === null && "border-primary bg-primary/10"
        )}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center">
            <Plus className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground">Create New Product</h3>
            <p className="text-sm text-muted-foreground">
              Start fresh with 30+ product types including apparel, accessories, bags, drinkware, home décor, tech & more
            </p>
          </div>
          {selectedProductId === null && (
            <Badge className="bg-primary">Selected</Badge>
          )}
        </div>
      </Card>

      {/* Products Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Your Shopify Products
          </h3>
          <Badge variant="outline" className="font-mono">
            {products.length} products
          </Badge>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card className="p-8 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-bold mb-2">No Products Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your Shopify store is empty. Create your first product!
            </p>
            <Button onClick={onCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              Create Product
            </Button>
          </Card>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-6 pr-4">
              {Object.entries(groupedProducts).map(([type, typeProducts]) => (
                <div key={type}>
                  <h4 className="text-xs font-mono text-muted-foreground uppercase mb-2">
                    {type}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {typeProducts.map((product) => {
                      const isSelected = selectedProductId === product.node.id;
                      const image = product.node.images.edges[0]?.node;
                      const price = product.node.priceRange.minVariantPrice;
                      const variantCount = product.node.variants.edges.length;

                      return (
                        <Card
                          key={product.node.id}
                          onClick={() => onSelectProduct(product)}
                          className={cn(
                            "p-3 cursor-pointer transition-all",
                            "hover:border-primary/50 hover:bg-primary/5",
                            isSelected && "border-primary bg-primary/10 ring-2 ring-primary/30"
                          )}
                        >
                          <div className="flex gap-3">
                            {/* Image */}
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              {image ? (
                                <img
                                  src={image.url}
                                  alt={image.altText || product.node.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-medium text-sm truncate">
                                  {product.node.title}
                                </h4>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {variantCount} variant{variantCount !== 1 ? 's' : ''}
                              </p>
                              <p className="text-sm font-mono font-bold text-primary mt-1">
                                ${parseFloat(price.amount).toFixed(2)} {price.currencyCode}
                              </p>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}

export default ProductSelector;
