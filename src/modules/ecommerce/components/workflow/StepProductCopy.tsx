/**
 * Step 5: Product Copy
 * 
 * Add text/tagline to the product and choose placement.
 * Optional step - user can skip if no text is needed.
 * 
 * BRAND COMPLIANCE:
 * - Text should complement the design, not overpower
 * - Keep it minimal per brand guidelines
 */

import { useState } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type ProductCopyConfig, type TextPlacement } from '../../hooks/useCreativeWorkflow';

interface StepProductCopyProps {
  productType?: string;
  currentCopy: ProductCopyConfig[];
  onUpdateCopy: (copy: ProductCopyConfig[]) => void;
  onSkip?: () => void;
}

// Available placements based on product type
const PLACEMENT_OPTIONS: Record<string, { value: TextPlacement; label: string }[]> = {
  cap: [
    { value: 'front', label: 'Front Panel' },
    { value: 'back', label: 'Back Strap Area' },
    { value: 'left-side', label: 'Left Side' },
    { value: 'right-side', label: 'Right Side' },
  ],
  hoodie: [
    { value: 'front', label: 'Front Chest' },
    { value: 'back', label: 'Back' },
    { value: 'sleeve', label: 'Sleeve' },
    { value: 'hood', label: 'Hood' },
  ],
  tee: [
    { value: 'front', label: 'Front Chest' },
    { value: 'back', label: 'Back' },
    { value: 'sleeve', label: 'Sleeve' },
    { value: 'collar', label: 'Collar Area' },
  ],
  tote: [
    { value: 'front', label: 'Front' },
    { value: 'back', label: 'Back' },
  ],
  default: [
    { value: 'front', label: 'Front' },
    { value: 'back', label: 'Back' },
    { value: 'left-side', label: 'Left Side' },
    { value: 'right-side', label: 'Right Side' },
  ],
};

const SIZE_OPTIONS = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

function getPlacementOptions(productType?: string) {
  const pt = (productType || '').toLowerCase();
  if (pt.includes('cap')) return PLACEMENT_OPTIONS.cap;
  if (pt.includes('hoodie')) return PLACEMENT_OPTIONS.hoodie;
  if (pt.includes('tee') || pt.includes('shirt')) return PLACEMENT_OPTIONS.tee;
  if (pt.includes('tote')) return PLACEMENT_OPTIONS.tote;
  return PLACEMENT_OPTIONS.default;
}

export function StepProductCopy({
  productType,
  currentCopy,
  onUpdateCopy,
  onSkip,
}: StepProductCopyProps) {
  const [entries, setEntries] = useState<ProductCopyConfig[]>(
    currentCopy.length > 0 ? currentCopy : []
  );

  const placementOptions = getPlacementOptions(productType);

  const addEntry = () => {
    const newEntry: ProductCopyConfig = {
      text: '',
      placement: 'back', // Default to back since mascot is usually front
      fontSize: 'small',
    };
    const updated = [...entries, newEntry];
    setEntries(updated);
    onUpdateCopy(updated);
  };

  const removeEntry = (index: number) => {
    const updated = entries.filter((_, i) => i !== index);
    setEntries(updated);
    onUpdateCopy(updated);
  };

  const updateEntry = (index: number, field: keyof ProductCopyConfig, value: string) => {
    const updated = entries.map((entry, i) => {
      if (i === index) {
        return { ...entry, [field]: value };
      }
      return entry;
    });
    setEntries(updated);
    onUpdateCopy(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-mono font-bold text-foreground mb-2">
            Product Copy
          </h2>
          <p className="text-sm text-muted-foreground">
            Add text, taglines, or phrases to your product. Choose placement for each text element.
            This step is optional—skip if you want a design-only product.
          </p>
        </div>
        
        {onSkip && (
          <Button
            variant="outline"
            onClick={onSkip}
            className="flex-shrink-0 border-dashed"
          >
            <ChevronRight className="w-4 h-4 mr-2" />
            Skip
          </Button>
        )}
      </div>

      {/* Product context */}
      {productType && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline" className="font-mono text-xs">
            {productType}
          </Badge>
          <span>— Available placements shown below</span>
        </div>
      )}

      {/* Text entries */}
      <div className="space-y-4">
        {entries.map((entry, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-1 space-y-4">
                {/* Text input */}
                <div>
                  <Label className="text-xs uppercase text-muted-foreground">
                    Text / Tagline
                  </Label>
                  <Input
                    placeholder="e.g., NO MERCY, 4AM RITUAL, DARK ROOM DWELLER"
                    value={entry.text}
                    onChange={(e) => updateEntry(index, 'text', e.target.value)}
                    className="mt-1 font-mono"
                    maxLength={50}
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {entry.text.length}/50 characters
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Placement */}
                  <div>
                    <Label className="text-xs uppercase text-muted-foreground">
                      Placement
                    </Label>
                    <Select
                      value={entry.placement}
                      onValueChange={(value) => updateEntry(index, 'placement', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {placementOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Size */}
                  <div>
                    <Label className="text-xs uppercase text-muted-foreground">
                      Size
                    </Label>
                    <Select
                      value={entry.fontSize || 'small'}
                      onValueChange={(value) => updateEntry(index, 'fontSize', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SIZE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Remove button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeEntry(index)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}

        {/* Add button */}
        <Button
          variant="outline"
          onClick={addEntry}
          className="w-full border-dashed"
        >
          Add Text Element
        </Button>
      </div>

      {/* Summary */}
      {entries.length > 0 && (
        <Card className="p-4 bg-muted/30">
          <h4 className="font-mono text-xs uppercase text-muted-foreground mb-2">
            Copy Summary
          </h4>
          <div className="space-y-1">
            {entries.map((entry, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="text-[10px]">
                  {placementOptions.find(o => o.value === entry.placement)?.label || entry.placement}
                </Badge>
                <span className="font-mono text-foreground truncate">
                  "{entry.text || '(empty)'}"
                </span>
                <span className="text-muted-foreground text-xs">
                  ({entry.fontSize || 'small'})
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Guidelines note */}
      <div className="p-3 bg-muted/20 rounded-lg border border-border/50 text-xs text-muted-foreground">
        <strong className="text-foreground">Brand guidelines:</strong> Keep text minimal and impactful. 
        Text will be rendered in the same stroke style as the mascot (Green Line or White Line). 
        Large text blocks are discouraged.
      </div>
    </div>
  );
}

export default StepProductCopy;
