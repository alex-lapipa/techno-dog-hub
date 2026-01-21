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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">
            Choose Your Product
          </h2>
          <p className="text-muted-foreground">
            Start from your Shopify inventory or create something new
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            Sync
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openShopifyAdmin('products')}
            className="gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Shopify
          </Button>
        </div>
      </div>

      {/* Create New Card - Featured */}
      <Card
        onClick={onCreateNew}
        className={cn(
          "p-6 cursor-pointer transition-all border-2 border-dashed group",
          "hover:border-primary hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/5",
          selectedProductId === null && "border-primary bg-primary/10 shadow-lg shadow-primary/10"
        )}
      >
        <div className="flex items-center gap-5">
          <div className={cn(
            "w-20 h-20 rounded-2xl flex items-center justify-center transition-all",
            "bg-gradient-to-br from-primary/20 to-primary/5",
            "group-hover:scale-105 group-hover:shadow-lg",
            selectedProductId === null && "from-primary/30 to-primary/10"
          )}>
            <Plus className="w-10 h-10 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground mb-1">Create New Product</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Access 30+ product types: apparel, accessories, bags, drinkware, home décor, tech gadgets & more
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="secondary" className="text-[10px]">👕 T-Shirts</Badge>
              <Badge variant="secondary" className="text-[10px]">🧢 Caps</Badge>
              <Badge variant="secondary" className="text-[10px]">☕ Mugs</Badge>
              <Badge variant="secondary" className="text-[10px]">📱 Cases</Badge>
              <Badge variant="secondary" className="text-[10px]">+26 more</Badge>
            </div>
          </div>
          {selectedProductId === null && (
            <Badge className="bg-primary text-primary-foreground">Selected</Badge>
          )}
        </div>
      </Card>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search your Shopify products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-11 h-11 text-sm bg-muted/30"
        />
      </div>

      {/* Existing Products */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">
            Your Shopify Inventory
          </h3>
          <Badge variant="outline" className="font-mono text-xs">
            {products.length} products
          </Badge>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card className="p-10 text-center bg-muted/20">
            <ShoppingBag className="w-14 h-14 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-bold mb-2">No Products Yet</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
              Your Shopify store is empty. Create your first product to get started!
            </p>
            <Button onClick={onCreateNew} size="lg" className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Product
            </Button>
          </Card>
        ) : (
          <ScrollArea className="h-[350px]">
            <div className="space-y-5 pr-4">
              {Object.entries(groupedProducts).map(([type, typeProducts]) => (
                <div key={type}>
                  <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span>{type}</span>
                    <span className="text-muted-foreground/50">({typeProducts.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                            "p-4 cursor-pointer transition-all group",
                            "hover:border-primary/50 hover:bg-primary/5 hover:shadow-md",
                            isSelected && "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-lg"
                          )}
                        >
                          <div className="flex gap-4">
                            {/* Image */}
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0 ring-1 ring-border group-hover:ring-primary/30 transition-all">
                              {image ? (
                                <img
                                  src={image.url}
                                  alt={image.altText || product.node.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted/50">
                                  <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
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
                              <p className="text-xs text-muted-foreground mt-1">
                                {variantCount} variant{variantCount !== 1 ? 's' : ''}
                              </p>
                              <p className="text-base font-bold text-primary mt-2 font-mono">
                                ${parseFloat(price.amount).toFixed(2)}
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
