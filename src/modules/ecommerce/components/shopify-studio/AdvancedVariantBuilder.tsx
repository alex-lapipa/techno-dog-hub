/**
 * Shopify Creative Studio v2 - Advanced Variant Builder
 * 
 * Full variant configuration with gender, material quality, sizing, and pricing.
 * Shopify-first: Generates variants aligned with Shopify Admin API schema.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Plus, Trash2, DollarSign, Package, Users, Ruler, 
  Palette, Sparkles, Calculator, AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { 
  getProductById,
  getSizesForProduct,
  calculatePrice,
  APPAREL_SIZES,
  type ProductTypeConfig,
  type GenderOption,
  type MaterialOption,
} from '../../config/shopify-product-catalog';
import type { StudioDraft, ShopifyVariant, ShopifyOption } from '../../hooks/useShopifyStudio';

// Standard colors for apparel
const STANDARD_COLORS = [
  { id: 'black', name: 'Black', hex: '#000000' },
  { id: 'white', name: 'White', hex: '#FFFFFF' },
  { id: 'navy', name: 'Navy', hex: '#1a2744' },
  { id: 'charcoal', name: 'Charcoal', hex: '#36454F' },
  { id: 'heather-grey', name: 'Heather Grey', hex: '#9CA3AF' },
  { id: 'forest', name: 'Forest Green', hex: '#228B22' },
  { id: 'burgundy', name: 'Burgundy', hex: '#800020' },
  { id: 'royal', name: 'Royal Blue', hex: '#4169E1' },
];

interface AdvancedVariantBuilderProps {
  draft: StudioDraft;
  onUpdateDraft: (updates: Partial<StudioDraft>) => void;
}

export function AdvancedVariantBuilder({
  draft,
  onUpdateDraft,
}: AdvancedVariantBuilderProps) {
  // Configuration state
  const [selectedGender, setSelectedGender] = useState<GenderOption>('unisex');
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialOption | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>(['black']);
  const [baseMargin, setBaseMargin] = useState(40);
  const [autoGenerateVariants, setAutoGenerateVariants] = useState(true);

  // Get product config
  const productConfig = useMemo(() => {
    return getProductById(draft.productType.toLowerCase().replace(/\s+/g, '-'));
  }, [draft.productType]);

  // Available sizes based on product and gender
  const availableSizes = useMemo(() => {
    if (!productConfig) return ['One Size'];
    return getSizesForProduct(productConfig, selectedGender);
  }, [productConfig, selectedGender]);

  // Set default material when product changes
  useEffect(() => {
    if (productConfig?.materials && productConfig.materials.length > 0) {
      setSelectedMaterial(productConfig.materials[0]);
    }
  }, [productConfig]);

  // Generate variants from configuration
  const generateVariants = useCallback(() => {
    if (!productConfig || !selectedMaterial) return;

    const sizes = selectedSizes.length > 0 ? selectedSizes : ['One Size'];
    const colors = selectedColors.length > 0 ? selectedColors : ['Default'];
    
    const newVariants: ShopifyVariant[] = [];
    const { cost, price, profit } = calculatePrice(
      productConfig.basePrice, 
      selectedMaterial.priceMultiplier,
      baseMargin
    );

    // Generate variant matrix
    for (const size of sizes) {
      for (const colorId of colors) {
        const color = STANDARD_COLORS.find(c => c.id === colorId);
        const colorName = color?.name || colorId;
        
        const variantTitle = sizes.length === 1 && sizes[0] === 'One Size'
          ? colorName
          : `${size} / ${colorName}`;

        const sku = `TD-${productConfig.id.toUpperCase()}-${size}-${colorId}`.substring(0, 40);

        newVariants.push({
          title: variantTitle,
          price: price.toFixed(2),
          compare_at_price: undefined,
          sku,
          option1: productConfig.hasSizes ? size : colorName,
          option2: productConfig.hasSizes && colors.length > 1 ? colorName : null,
          option3: null,
          requires_shipping: true,
          weight: productConfig.category === 'apparel' ? 200 : 100,
          weight_unit: 'g',
        });
      }
    }

    // Build options
    const newOptions: ShopifyOption[] = [];
    if (productConfig.hasSizes && sizes.length > 1) {
      newOptions.push({ name: 'Size', values: sizes });
    }
    if (colors.length > 1 || (colors.length === 1 && colors[0] !== 'Default')) {
      const colorNames = colors.map(id => STANDARD_COLORS.find(c => c.id === id)?.name || id);
      newOptions.push({ name: 'Color', values: colorNames });
    }

    onUpdateDraft({
      variants: newVariants,
      options: newOptions,
    });
  }, [productConfig, selectedMaterial, selectedSizes, selectedColors, baseMargin, onUpdateDraft]);

  // Auto-generate on config change
  useEffect(() => {
    if (autoGenerateVariants && productConfig && selectedMaterial) {
      generateVariants();
    }
  }, [autoGenerateVariants, selectedGender, selectedMaterial, selectedSizes, selectedColors, baseMargin, generateVariants, productConfig]);

  // Toggle size selection
  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  // Toggle color selection
  const toggleColor = (colorId: string) => {
    setSelectedColors(prev => 
      prev.includes(colorId)
        ? prev.filter(c => c !== colorId)
        : [...prev, colorId]
    );
  };

  // Select all sizes
  const selectAllSizes = () => {
    setSelectedSizes([...availableSizes]);
  };

  // Pricing preview
  const pricingPreview = useMemo(() => {
    if (!productConfig || !selectedMaterial) return null;
    return calculatePrice(productConfig.basePrice, selectedMaterial.priceMultiplier, baseMargin);
  }, [productConfig, selectedMaterial, baseMargin]);

  if (!productConfig) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <AlertCircle className="w-5 h-5" />
          <p>Select a product type first to configure variants</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Product Summary */}
      <Card className="p-4 bg-muted/30">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{productConfig.icon}</span>
          <div className="flex-1">
            <h3 className="font-bold">{productConfig.name}</h3>
            <p className="text-sm text-muted-foreground">{productConfig.description}</p>
          </div>
          <Badge variant="outline">Base: ${productConfig.basePrice}</Badge>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Configuration */}
        <div className="space-y-5">
          {/* Gender Selection */}
          {productConfig.hasGender && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Gender Fit
              </Label>
              <div className="flex flex-wrap gap-2">
                {(['unisex', 'male', 'female', 'youth'] as GenderOption[]).map(gender => (
                  <Button
                    key={gender}
                    variant={selectedGender === gender ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedGender(gender)}
                    className="capitalize"
                  >
                    {gender}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Material Quality */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Material Quality
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {productConfig.materials.map(material => (
                <Card
                  key={material.id}
                  onClick={() => setSelectedMaterial(material)}
                  className={cn(
                    "p-3 cursor-pointer transition-all",
                    selectedMaterial?.id === material.id && "border-primary bg-primary/10"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{material.name}</span>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px] capitalize",
                            material.tier === 'luxury' && "border-yellow-500 text-yellow-600",
                            material.tier === 'premium' && "border-blue-500 text-blue-600"
                          )}
                        >
                          {material.tier}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {material.description}
                        {material.composition && ` • ${material.composition}`}
                      </p>
                    </div>
                    <span className="text-sm font-mono">
                      {material.priceMultiplier > 1 
                        ? `+${((material.priceMultiplier - 1) * 100).toFixed(0)}%` 
                        : 'Base'}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          {productConfig.hasSizes && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  Sizes
                </Label>
                <Button variant="ghost" size="sm" onClick={selectAllSizes} className="h-6 text-xs">
                  Select All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map(size => (
                  <Button
                    key={size}
                    variant={selectedSizes.includes(size) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleSize(size)}
                    className="min-w-[48px]"
                  >
                    {size}
                  </Button>
                ))}
              </div>
              {selectedSizes.length === 0 && (
                <p className="text-xs text-amber-600">Select at least one size</p>
              )}
            </div>
          )}

          {/* Color Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Colors
            </Label>
            <div className="flex flex-wrap gap-2">
              {STANDARD_COLORS.map(color => (
                <TooltipProvider key={color.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => toggleColor(color.id)}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all",
                          selectedColors.includes(color.id) 
                            ? "ring-2 ring-primary ring-offset-2" 
                            : "border-border hover:border-primary/50"
                        )}
                        style={{ backgroundColor: color.hex }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{color.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Preview */}
        <div className="space-y-5">
          {/* Margin Calculator */}
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              <Label>Profit Margin</Label>
            </div>
            
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="20"
                max="70"
                value={baseMargin}
                onChange={(e) => setBaseMargin(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="font-mono font-bold w-12 text-right">{baseMargin}%</span>
            </div>

            {pricingPreview && (
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="text-center p-2 bg-muted/50 rounded">
                  <p className="text-xs text-muted-foreground">Cost</p>
                  <p className="font-mono font-bold">${pricingPreview.cost.toFixed(2)}</p>
                </div>
                <div className="text-center p-2 bg-primary/10 rounded border border-primary/30">
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="font-mono font-bold text-primary">${pricingPreview.price.toFixed(2)}</p>
                </div>
                <div className="text-center p-2 bg-green-500/10 rounded border border-green-500/30">
                  <p className="text-xs text-muted-foreground">Profit</p>
                  <p className="font-mono font-bold text-green-600">${pricingPreview.profit.toFixed(2)}</p>
                </div>
              </div>
            )}
          </Card>

          {/* Auto-Generate Toggle */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <Label htmlFor="auto-gen" className="text-sm">Auto-generate variants</Label>
            <Switch
              id="auto-gen"
              checked={autoGenerateVariants}
              onCheckedChange={setAutoGenerateVariants}
            />
          </div>

          {/* Variant Preview */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Generated Variants
              </Label>
              <Badge variant="secondary" className="font-mono">
                {draft.variants.length} variant{draft.variants.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            <ScrollArea className="h-[200px]">
              <div className="space-y-2 pr-4">
                {draft.variants.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Configure options above to generate variants
                  </p>
                ) : (
                  draft.variants.map((variant, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm"
                    >
                      <div>
                        <span className="font-medium">{variant.title}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          SKU: {variant.sku}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-primary">
                        ${variant.price}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>

          {/* Manual Regenerate */}
          {!autoGenerateVariants && (
            <Button onClick={generateVariants} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Generate Variants
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdvancedVariantBuilder;
