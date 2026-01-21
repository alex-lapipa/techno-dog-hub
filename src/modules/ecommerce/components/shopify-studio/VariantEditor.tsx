/**
 * Shopify Creative Studio v2 - Step 2: Variant Configuration
 * 
 * Configure product variants with Shopify-aligned structure.
 * Sizes, colors, pricing all follow Shopify Admin API schema.
 */

import { useState } from 'react';
import { 
  Plus, Trash2, DollarSign, Palette, Ruler, 
  Package, AlertCircle, Sparkles, Check 
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { type ShopifyVariant, type ShopifyOption, type StudioDraft } from '../../hooks/useShopifyStudio';

// Standard POD size options
const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

// Standard POD colors (Printful aligned)
const STANDARD_COLORS = [
  { code: 'black', name: 'Black', hex: '#1a1a1a' },
  { code: 'white', name: 'White', hex: '#ffffff' },
  { code: 'navy', name: 'Navy', hex: '#1e3a5f' },
  { code: 'charcoal', name: 'Charcoal Heather', hex: '#4a4a4a' },
  { code: 'forest', name: 'Forest Green', hex: '#228b22' },
  { code: 'burgundy', name: 'Burgundy', hex: '#800020' },
  { code: 'heather-grey', name: 'Heather Grey', hex: '#9a9a9a' },
  { code: 'logo-green', name: 'Logo Green', hex: '#00ff00' }, // Brand color
  { code: 'crimson', name: 'Crimson Red', hex: '#dc143c' }, // Brand color
];

// Weight unit options
const WEIGHT_UNITS = [
  { value: 'g', label: 'Grams (g)' },
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'lb', label: 'Pounds (lb)' },
  { value: 'oz', label: 'Ounces (oz)' },
];

interface VariantEditorProps {
  draft: StudioDraft;
  onUpdateDraft: (updates: Partial<StudioDraft>) => void;
}

export function VariantEditor({ draft, onUpdateDraft }: VariantEditorProps) {
  const [newOptionName, setNewOptionName] = useState('');
  
  const hasVariants = draft.variants.length > 0;
  const hasOptions = draft.options.length > 0;

  // Add a standard Size option
  const addSizeOption = () => {
    const existingSize = draft.options.find(o => o.name.toLowerCase() === 'size');
    if (existingSize) return;

    const newOption: ShopifyOption = {
      name: 'Size',
      values: ['S', 'M', 'L', 'XL'],
    };
    
    onUpdateDraft({ 
      options: [...draft.options, newOption],
    });
    generateVariantsFromOptions([...draft.options, newOption]);
  };

  // Add a standard Color option
  const addColorOption = () => {
    const existingColor = draft.options.find(o => o.name.toLowerCase() === 'color');
    if (existingColor) return;

    const newOption: ShopifyOption = {
      name: 'Color',
      values: ['Black', 'White'],
    };
    
    onUpdateDraft({ 
      options: [...draft.options, newOption],
    });
    generateVariantsFromOptions([...draft.options, newOption]);
  };

  // Add custom option
  const addCustomOption = () => {
    if (!newOptionName.trim()) return;
    
    const newOption: ShopifyOption = {
      name: newOptionName.trim(),
      values: ['Default'],
    };
    
    onUpdateDraft({ 
      options: [...draft.options, newOption],
    });
    setNewOptionName('');
    generateVariantsFromOptions([...draft.options, newOption]);
  };

  // Update option values
  const updateOptionValues = (index: number, values: string[]) => {
    const newOptions = [...draft.options];
    newOptions[index] = { ...newOptions[index], values };
    onUpdateDraft({ options: newOptions });
    generateVariantsFromOptions(newOptions);
  };

  // Remove option
  const removeOption = (index: number) => {
    const newOptions = draft.options.filter((_, i) => i !== index);
    onUpdateDraft({ options: newOptions });
    generateVariantsFromOptions(newOptions);
  };

  // Generate variants from options (Shopify cartesian product)
  const generateVariantsFromOptions = (options: ShopifyOption[]) => {
    if (options.length === 0) {
      // Single default variant
      const defaultVariant: ShopifyVariant = {
        title: 'Default Title',
        price: draft.variants[0]?.price || '29.99',
        sku: generateSKU('default'),
        option1: null,
        option2: null,
        option3: null,
        requires_shipping: true,
      };
      onUpdateDraft({ variants: [defaultVariant] });
      return;
    }

    // Cartesian product of all option values
    const cartesian = (...arrays: string[][]): string[][] => {
      return arrays.reduce<string[][]>(
        (acc, arr) => acc.flatMap(x => arr.map(y => [...x, y])),
        [[]]
      );
    };

    const optionValues = options.map(o => o.values);
    const combinations = cartesian(...optionValues);

    const basePrice = draft.variants[0]?.price || '29.99';
    
    const newVariants: ShopifyVariant[] = combinations.map(combo => ({
      title: combo.join(' / '),
      price: basePrice,
      sku: generateSKU(combo.join('-').toLowerCase().replace(/\s+/g, '')),
      option1: combo[0] || null,
      option2: combo[1] || null,
      option3: combo[2] || null,
      requires_shipping: true,
    }));

    onUpdateDraft({ variants: newVariants });
  };

  // Generate SKU
  const generateSKU = (suffix: string): string => {
    const prefix = draft.productType?.substring(0, 3).toUpperCase() || 'PRD';
    const timestamp = Date.now().toString(36).toUpperCase();
    return `TD-${prefix}-${suffix.substring(0, 8)}-${timestamp}`.toUpperCase();
  };

  // Update variant price
  const updateVariantPrice = (index: number, price: string) => {
    const newVariants = [...draft.variants];
    newVariants[index] = { ...newVariants[index], price };
    onUpdateDraft({ variants: newVariants });
  };

  // Update variant compare at price (sale pricing)
  const updateVariantCompareAtPrice = (index: number, compare_at_price: string) => {
    const newVariants = [...draft.variants];
    newVariants[index] = { ...newVariants[index], compare_at_price: compare_at_price || undefined };
    onUpdateDraft({ variants: newVariants });
  };

  // Bulk update all prices
  const bulkUpdatePrices = (price: string) => {
    const newVariants = draft.variants.map(v => ({ ...v, price }));
    onUpdateDraft({ variants: newVariants });
  };

  // Bulk update compare at prices
  const bulkUpdateCompareAtPrices = (compare_at_price: string) => {
    const newVariants = draft.variants.map(v => ({ ...v, compare_at_price: compare_at_price || undefined }));
    onUpdateDraft({ variants: newVariants });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">
            Configure Variants
          </h2>
          <p className="text-muted-foreground">
            Set up sizes, colors, and pricing. Shopify handles the variant matrix.
          </p>
        </div>
        <Badge variant="outline" className="font-mono text-sm px-3 py-1">
          {draft.variants.length} variants
        </Badge>
      </div>

      {/* Product Summary Card */}
      <Card className="p-5 bg-gradient-to-r from-muted/50 to-muted/20 border-muted">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">{draft.title || 'New Product'}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">{draft.productType || 'No type'}</Badge>
              <span className="text-xs text-muted-foreground">by {draft.vendor}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Add Options */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Quick Add Options</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            variant={draft.options.some(o => o.name.toLowerCase() === 'size') ? "secondary" : "outline"}
            size="sm"
            onClick={addSizeOption}
            disabled={draft.options.some(o => o.name.toLowerCase() === 'size')}
            className="gap-2"
          >
            <Ruler className="w-4 h-4" />
            Sizes
            {draft.options.some(o => o.name.toLowerCase() === 'size') && (
              <Check className="w-3 h-3 text-logo-green" />
            )}
          </Button>
          <Button
            variant={draft.options.some(o => o.name.toLowerCase() === 'color') ? "secondary" : "outline"}
            size="sm"
            onClick={addColorOption}
            disabled={draft.options.some(o => o.name.toLowerCase() === 'color')}
            className="gap-2"
          >
            <Palette className="w-4 h-4" />
            Colors
            {draft.options.some(o => o.name.toLowerCase() === 'color') && (
              <Check className="w-3 h-3 text-logo-green" />
            )}
          </Button>
          <Separator orientation="vertical" className="h-8" />
          <div className="flex gap-2">
            <Input
              placeholder="Custom option name..."
              value={newOptionName}
              onChange={(e) => setNewOptionName(e.target.value)}
              className="w-44 h-8 text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={addCustomOption}
              disabled={!newOptionName.trim() || draft.options.length >= 3}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {draft.options.length >= 3 && (
        <Alert className="bg-amber-500/10 border-amber-500/30">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-700">
            Shopify supports a maximum of 3 product options.
          </AlertDescription>
        </Alert>
      )}

      {/* Options Configuration */}
      {hasOptions && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Product Options</h3>
          {draft.options.map((option, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {option.name.toLowerCase() === 'size' && <Ruler className="w-4 h-4 text-muted-foreground" />}
                  {option.name.toLowerCase() === 'color' && <Palette className="w-4 h-4 text-muted-foreground" />}
                  <span className="font-medium">{option.name}</span>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {option.values.length} values
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(index)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
              
              {/* Size quick-select */}
              {option.name.toLowerCase() === 'size' && (
                <div className="flex flex-wrap gap-2">
                  {STANDARD_SIZES.map(size => {
                    const isSelected = option.values.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => {
                          const newValues = isSelected
                            ? option.values.filter(v => v !== size)
                            : [...option.values, size];
                          updateOptionValues(index, newValues);
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-xs font-mono transition-colors",
                          isSelected 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted hover:bg-muted/80"
                        )}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Color quick-select */}
              {option.name.toLowerCase() === 'color' && (
                <div className="flex flex-wrap gap-2">
                  {STANDARD_COLORS.map(color => {
                    const isSelected = option.values.includes(color.name);
                    return (
                      <button
                        key={color.code}
                        onClick={() => {
                          const newValues = isSelected
                            ? option.values.filter(v => v !== color.name)
                            : [...option.values, color.name];
                          updateOptionValues(index, newValues);
                        }}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors",
                          isSelected 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted hover:bg-muted/80"
                        )}
                      >
                        <div 
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ backgroundColor: color.hex }}
                        />
                        {color.name}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Custom option values */}
              {option.name.toLowerCase() !== 'size' && option.name.toLowerCase() !== 'color' && (
                <Input
                  placeholder="Enter values separated by commas"
                  value={option.values.join(', ')}
                  onChange={(e) => {
                    const values = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
                    updateOptionValues(index, values.length > 0 ? values : ['Default']);
                  }}
                />
              )}
            </Card>
          ))}
        </div>
      )}

      <Separator />

      {/* Variants Pricing */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Variant Pricing</h3>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Bulk price:</Label>
            <div className="relative w-24">
              <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="pl-6 text-sm"
                onBlur={(e) => {
                  if (e.target.value) {
                    bulkUpdatePrices(e.target.value);
                  }
                }}
              />
            </div>
          </div>
        </div>

        <ScrollArea className="h-[200px]">
          <div className="space-y-2 pr-4">
            {draft.variants.map((variant, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{variant.title}</p>
                  <p className="text-xs text-muted-foreground font-mono">{variant.sku}</p>
                </div>
                <div className="relative w-24">
                  <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={variant.price}
                    onChange={(e) => updateVariantPrice(index, e.target.value)}
                    className="pl-6 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

export default VariantEditor;
