/**
 * Step 3: Product Type Selection
 * 
 * Select merchandise type from approved products in the brand book.
 */

import { Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { type ApprovedProduct, type BrandBookType } from '../../hooks/useBrandBookGuidelines';

interface StepProductTypeProps {
  brandBook: BrandBookType;
  products: ApprovedProduct[];
  selectedProduct: ApprovedProduct | null;
  onSelectProduct: (product: ApprovedProduct | null) => void;
}

// Fallback products for techno.dog (which doesn't have explicit product list)
const TECHNO_DOG_PRODUCTS: ApprovedProduct[] = [
  {
    type: 'Hoodie',
    placement: 'Center chest or back print',
    printSize: 'Medium to large',
    fabricColors: ['black', 'charcoal'],
    strokeColors: ['white', 'crimson'],
  },
  {
    type: 'T-Shirt',
    placement: 'Center chest',
    printSize: 'Medium',
    fabricColors: ['black', 'white'],
    strokeColors: ['white', 'black', 'crimson'],
  },
  {
    type: 'Cap',
    placement: 'Front panel',
    printSize: 'Small embroidery',
    fabricColors: ['black'],
    strokeColors: ['white'],
  },
  {
    type: 'Tote Bag',
    placement: 'Center',
    printSize: 'Large',
    fabricColors: ['black', 'natural'],
    strokeColors: ['white', 'black'],
  },
];

// Icons for product types
const PRODUCT_ICONS: Record<string, string> = {
  'Hoodie': '🧥',
  'T-Shirt': '👕',
  'Cap': '🧢',
  'Tote Bag': '👜',
  'Bandana': '🎀',
};

export function StepProductType({
  brandBook,
  products,
  selectedProduct,
  onSelectProduct,
}: StepProductTypeProps) {
  // Use brand book products or fallback for techno.dog
  const availableProducts = products.length > 0 ? products : TECHNO_DOG_PRODUCTS;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-mono font-bold text-foreground mb-2">
          Select Product Type
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose the merchandise type for your design. Each product has specific placement and 
          print requirements based on brand guidelines.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {availableProducts.map((product, index) => {
          const isSelected = selectedProduct?.type === product.type;
          const icon = PRODUCT_ICONS[product.type] || '📦';
          
          return (
            <Card
              key={`${product.type}-${index}`}
              onClick={() => onSelectProduct(product)}
              className={cn(
                "p-5 cursor-pointer transition-all relative",
                "hover:border-primary/50 hover:bg-primary/5",
                isSelected && "border-primary bg-primary/10 ring-2 ring-primary/30"
              )}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={cn(
                  "w-14 h-14 rounded-lg flex items-center justify-center text-2xl",
                  isSelected ? "bg-primary/20" : "bg-muted"
                )}>
                  {icon}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-mono text-lg font-medium mb-1">
                    {product.type}
                  </h3>
                  
                  <p className="text-xs text-muted-foreground mb-3">
                    {product.placement}
                  </p>
                  
                  {/* Details */}
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground tracking-wide">
                        Fabric Colors
                      </span>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {product.fabricColors.map(color => (
                          <Badge 
                            key={color}
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {color}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground tracking-wide">
                        Stroke Colors
                      </span>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {product.strokeColors.map(color => (
                          <Badge 
                            key={color}
                            variant="outline"
                            className={cn(
                              "text-[10px] px-1.5 py-0",
                              color === '#00FF00' && "border-logo-green text-logo-green",
                              color === 'white' && "border-foreground text-foreground"
                            )}
                          >
                            {color}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-[10px] text-muted-foreground">
                      Print size: {product.printSize}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      {selectedProduct && (
        <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Selected:</strong> {selectedProduct.type} 
            — {selectedProduct.placement}. Print size: {selectedProduct.printSize}.
          </p>
        </div>
      )}
    </div>
  );
}

export default StepProductType;
