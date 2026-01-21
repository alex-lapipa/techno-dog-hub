/**
 * Shopify Creative Studio v2 - Extended Product Type Catalog
 * 
 * Browse and select from 30+ product types across all categories.
 * Shopify-first: Uses real product taxonomy with POD specifications.
 */

import { useState, useMemo } from 'react';
import { 
  Search, Package, Shirt, ShoppingBag, Coffee, 
  Home, Smartphone, BookOpen, Sparkles, Check,
  ChevronDown, ChevronRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { 
  PRODUCT_CATALOG, 
  getCategoryLabel,
  getProductsByCategory,
  type ProductTypeConfig,
  type ProductCategory 
} from '../../config/shopify-product-catalog';

interface ProductTypeCatalogProps {
  selectedProductType: string | null;
  onSelectProductType: (productType: ProductTypeConfig) => void;
}

const CATEGORY_ICONS: Record<ProductCategory, React.ReactNode> = {
  'apparel': <Shirt className="w-4 h-4" />,
  'accessories': <Package className="w-4 h-4" />,
  'bags': <ShoppingBag className="w-4 h-4" />,
  'drinkware': <Coffee className="w-4 h-4" />,
  'home-decor': <Home className="w-4 h-4" />,
  'tech': <Smartphone className="w-4 h-4" />,
  'stationery': <BookOpen className="w-4 h-4" />,
  'lifestyle': <Sparkles className="w-4 h-4" />,
};

const CATEGORIES: ProductCategory[] = [
  'apparel',
  'accessories',
  'bags',
  'drinkware',
  'home-decor',
  'tech',
  'stationery',
];

export function ProductTypeCatalog({
  selectedProductType,
  onSelectProductType,
}: ProductTypeCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<ProductCategory[]>(['apparel']);

  // Filter products by search
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return PRODUCT_CATALOG;
    const query = searchQuery.toLowerCase();
    return PRODUCT_CATALOG.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Group by category
  const groupedProducts = useMemo(() => {
    const grouped: Partial<Record<ProductCategory, ProductTypeConfig[]>> = {};
    for (const cat of CATEGORIES) {
      const products = filteredProducts.filter(p => p.category === cat);
      if (products.length > 0) {
        grouped[cat] = products;
      }
    }
    return grouped;
  }, [filteredProducts]);

  const toggleCategory = (category: ProductCategory) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-sm font-mono font-bold text-foreground mb-1">
          Product Catalog
        </h3>
        <p className="text-xs text-muted-foreground">
          Choose from {PRODUCT_CATALOG.length} product types across {CATEGORIES.length} categories
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Category List */}
      <ScrollArea className="h-[350px]">
        <div className="space-y-2 pr-4">
          {CATEGORIES.map(category => {
            const products = groupedProducts[category];
            if (!products || products.length === 0) return null;
            
            const isExpanded = expandedCategories.includes(category);
            const hasSelection = products.some(p => p.id === selectedProductType);

            return (
              <Collapsible
                key={category}
                open={isExpanded}
                onOpenChange={() => toggleCategory(category)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-between h-9 px-3",
                      hasSelection && "bg-primary/10 text-primary"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {CATEGORY_ICONS[category]}
                      <span className="font-medium text-sm">
                        {getCategoryLabel(category)}
                      </span>
                      <Badge variant="secondary" className="text-[10px] h-5">
                        {products.length}
                      </Badge>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="grid grid-cols-2 gap-2 p-2 pl-6">
                    {products.map(product => {
                      const isSelected = selectedProductType === product.id;
                      
                      return (
                        <Card
                          key={product.id}
                          onClick={() => onSelectProductType(product)}
                          className={cn(
                            "p-3 cursor-pointer transition-all",
                            "hover:border-primary/50 hover:bg-primary/5",
                            isSelected && "border-primary bg-primary/10 ring-1 ring-primary/30"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{product.icon}</span>
                                <span className="text-sm font-medium truncate">
                                  {product.name}
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                                {product.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-[9px] h-4">
                                  ${product.basePrice.toFixed(0)}+
                                </Badge>
                                {product.hasGender && (
                                  <Badge variant="outline" className="text-[9px] h-4">
                                    Gender
                                  </Badge>
                                )}
                                {product.hasSizes && (
                                  <Badge variant="outline" className="text-[9px] h-4">
                                    Sizes
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="w-4 h-4 text-primary flex-shrink-0" />
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>

      {/* Selected Summary */}
      {selectedProductType && (
        <div className="border-t border-border pt-3">
          {(() => {
            const product = PRODUCT_CATALOG.find(p => p.id === selectedProductType);
            if (!product) return null;
            
            return (
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <span className="text-2xl">{product.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.materials.length} material{product.materials.length !== 1 ? 's' : ''} • 
                    {product.printAreas.length} print area{product.printAreas.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Badge className="bg-primary">${product.basePrice.toFixed(0)}+</Badge>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default ProductTypeCatalog;
