/**
 * Shopify Creative Studio v2 - Step 1: Product Selector
 * 
 * Start from LIVE Shopify inventory or create a new product.
 * Shopify-first: All products come from real Shopify data.
 * 
 * NEW PRODUCT FLOW: When creating new, shows ProductTypeCatalog to select
 * from 30+ product types with full POD specifications.
 */

import { useEffect, useState } from 'react';
import { 
  Package, Plus, RefreshCw, Search, ShoppingBag, 
  Check, ExternalLink, Image as ImageIcon, ArrowLeft
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
import { 
  PRODUCT_CATALOG,
  type ProductTypeConfig 
} from '../../config/shopify-product-catalog';
import { generatePrintfulMetafields, isPrintfulSupported } from '../../config/printful-integration';

interface ProductSelectorProps {
  products: ShopifyProductEdge[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  selectedProductId: string | null;
  onSelectProduct: (product: ShopifyProductEdge | null) => void;
  onCreateNew: () => void;
  onProductTypeSelected?: (productType: ProductTypeConfig) => void;
}

export function ProductSelector({
  products,
  isLoading,
  onRefresh,
  selectedProductId,
  onSelectProduct,
  onCreateNew,
  onProductTypeSelected,
}: ProductSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedProductTypeId, setSelectedProductTypeId] = useState<string | null>(null);

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

  // Handle "Create New" click - show product type catalog
  const handleCreateNewClick = () => {
    setIsCreatingNew(true);
    onSelectProduct(null); // Clear any selected product
  };

  // Handle product type selection from catalog
  const handleProductTypeSelect = (productType: ProductTypeConfig) => {
    setSelectedProductTypeId(productType.id);
    
    // Generate default variants based on product type
    const defaultPrice = productType.basePrice.toFixed(2);
    const defaultSku = `TD-${productType.id.toUpperCase().slice(0, 4)}-001`;
    
    // Check if it's a POD product
    const isPOD = isPrintfulSupported(productType.id);
    
    // Notify parent of product type selection if callback provided
    if (onProductTypeSelected) {
      onProductTypeSelected(productType);
    }
    
    // Call onCreateNew to trigger draft update
    onCreateNew();
    
    // Keep the catalog open but mark selection
    setIsCreatingNew(true);
  };

  // Go back to main selection
  const handleBackToMain = () => {
    setIsCreatingNew(false);
    setSelectedProductTypeId(null);
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

  // If creating new, show product type catalog
  if (isCreatingNew) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={handleBackToMain}
          className="gap-2 font-mono text-xs uppercase text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Selection
        </Button>

        {/* Selected Product Type Summary */}
        {selectedProductTypeId && (
          <Card className="p-5 bg-logo-green/10 border-2 border-logo-green/40">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-logo-green/20 flex items-center justify-center ring-2 ring-logo-green/30">
                <Check className="w-6 h-6 text-logo-green" />
              </div>
              <div className="flex-1">
                <p className="font-mono font-bold uppercase text-foreground">
                  Product Type Selected
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {PRODUCT_CATALOG.find(p => p.id === selectedProductTypeId)?.name} — 
                  Configure variants in the next step
                </p>
              </div>
              <Badge className="bg-logo-green text-background font-mono uppercase">
                Ready
              </Badge>
            </div>
          </Card>
        )}

        {/* Product Type Catalog */}
        <ProductTypeCatalog
          selectedProductType={selectedProductTypeId}
          onSelectProductType={handleProductTypeSelect}
        />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Create New Card - Featured */}
      <Card
        onClick={handleCreateNewClick}
        className={cn(
          "p-8 cursor-pointer transition-all border-2 border-dashed group",
          "hover:border-logo-green hover:bg-logo-green/5 hover:shadow-xl hover:shadow-logo-green/10",
          selectedProductId === null && "border-logo-green bg-logo-green/10 shadow-xl shadow-logo-green/10"
        )}
      >
        <div className="flex items-center gap-6">
          <div className={cn(
            "w-24 h-24 rounded-2xl flex items-center justify-center transition-all",
            "bg-gradient-to-br from-logo-green/30 to-logo-green/10 ring-2 ring-logo-green/20",
            "group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-logo-green/20",
            selectedProductId === null && "from-logo-green/40 to-logo-green/20 ring-logo-green/40"
          )}>
            <Plus className="w-12 h-12 text-logo-green" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-mono font-bold text-foreground uppercase tracking-wide mb-2">Create New Product</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Access {PRODUCT_CATALOG.length}+ product types: apparel, accessories, bags, drinkware, home décor, tech gadgets & more
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="outline" className="text-xs font-mono border-logo-green/30 text-logo-green">Hoodies</Badge>
              <Badge variant="outline" className="text-xs font-mono border-logo-green/30 text-logo-green">T-Shirts</Badge>
              <Badge variant="outline" className="text-xs font-mono border-logo-green/30 text-logo-green">Caps</Badge>
              <Badge variant="outline" className="text-xs font-mono border-logo-green/30 text-logo-green">Totes</Badge>
              <Badge variant="outline" className="text-xs font-mono border-logo-green/30 text-logo-green">Mugs</Badge>
              <Badge variant="outline" className="text-xs font-mono border-muted-foreground/30 text-muted-foreground">+{PRODUCT_CATALOG.length - 5} more</Badge>
            </div>
          </div>
          {selectedProductId === null && (
            <Badge className="bg-logo-green text-background font-mono uppercase">Selected</Badge>
          )}
        </div>
      </Card>

      {/* Inventory Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-mono font-bold uppercase tracking-wide text-foreground">
              Shopify Inventory
            </h3>
            <Badge variant="outline" className="font-mono text-xs border-crimson/30 text-crimson">
              {products.length} products
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2 font-mono text-xs uppercase border-border hover:border-logo-green hover:text-logo-green"
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
              Sync
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openShopifyAdmin('products')}
              className="gap-2 font-mono text-xs uppercase border-border hover:border-crimson hover:text-crimson"
            >
              <ExternalLink className="w-4 h-4" />
              Shopify
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search your Shopify products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 text-sm bg-muted/20 border-2 border-border focus:border-logo-green font-mono"
          />
        </div>
      </div>

      {/* Existing Products */}
      <div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card className="p-12 text-center bg-muted/10 border-2 border-dashed border-border">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/40 mb-5" />
            <h3 className="text-xl font-mono font-bold uppercase mb-3">No Products Yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Your Shopify store is empty. Create your first product to get started!
            </p>
            <Button onClick={handleCreateNewClick} size="lg" className="gap-2 bg-logo-green hover:bg-logo-green/90 text-background font-mono uppercase">
              <Plus className="w-4 h-4" />
              Create Your First Product
            </Button>
          </Card>
        ) : (
          <ScrollArea className="h-[380px]">
            <div className="space-y-6 pr-4">
              {Object.entries(groupedProducts).map(([type, typeProducts]) => (
                <div key={type}>
                  <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-border pb-2">
                    <span>{type}</span>
                    <span className="text-muted-foreground/50">({typeProducts.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                            "p-4 cursor-pointer transition-all group border-2",
                            "hover:border-crimson/50 hover:bg-crimson/5 hover:shadow-lg",
                            isSelected && "border-crimson bg-crimson/10 ring-2 ring-crimson/20 shadow-lg shadow-crimson/10"
                          )}
                        >
                          <div className="flex gap-4">
                            {/* Image */}
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0 ring-2 ring-border group-hover:ring-crimson/30 transition-all">
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
                                <h4 className="font-mono font-bold text-sm truncate uppercase">
                                  {product.node.title}
                                </h4>
                                {isSelected && (
                                  <Check className="w-5 h-5 text-crimson flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 font-mono">
                                {variantCount} variant{variantCount !== 1 ? 's' : ''}
                              </p>
                              <p className="text-lg font-bold text-logo-green mt-2 font-mono">
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
