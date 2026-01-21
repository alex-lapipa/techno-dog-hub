/**
 * Step 1: Brand Selection + AI Model Selection
 * 
 * User selects between techno.dog and techno-doggies brand identities,
 * and chooses which AI model(s) will power the creative process.
 */

import { Hexagon, Dog } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { type BrandBookType } from '../../hooks/useBrandBookGuidelines';
import { ModelSelector, type SelectedModels } from './ModelSelector';

interface StepBrandSelectionProps {
  selectedBrand: BrandBookType;
  onSelectBrand: (brand: BrandBookType) => void;
  selectedModels: SelectedModels;
  onSelectModels: (models: SelectedModels) => void;
}

const BRAND_OPTIONS = [
  {
    id: 'techno-dog' as BrandBookType,
    name: 'techno.dog',
    description: 'VHS/Brutalist aesthetic. Dark backgrounds, minimal design, geometric hexagon logo.',
    icon: Hexagon,
    style: 'Industrial / Underground',
    colorScheme: 'Crimson + Black',
    mascot: false,
  },
  {
    id: 'techno-doggies' as BrandBookType,
    name: 'Techno Doggies',
    description: '94-variant Techno Talkies mascot pack. Stroke-only graphics on black fabric.',
    icon: Dog,
    style: 'Streetwear / Editorial',
    colorScheme: 'Green Line + White Line',
    mascot: true,
  },
];

export function StepBrandSelection({
  selectedBrand,
  onSelectBrand,
  selectedModels,
  onSelectModels,
}: StepBrandSelectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-mono font-bold text-foreground mb-2">
          Select Brand Identity
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose which brand book will govern your product design. All assets and rules will be 
          enforced based on your selection.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {BRAND_OPTIONS.map((brand) => {
          const isSelected = selectedBrand === brand.id;
          const Icon = brand.icon;
          
          return (
            <Card
              key={brand.id}
              onClick={() => onSelectBrand(brand.id)}
              className={cn(
                "relative p-6 cursor-pointer transition-all",
                "hover:border-primary/50 hover:bg-primary/5",
                isSelected && "border-primary bg-primary/10 ring-2 ring-primary/30"
              )}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-primary" />
              )}
              
              {/* Icon */}
              <div className={cn(
                "w-14 h-14 rounded-lg flex items-center justify-center mb-4",
                isSelected ? "bg-primary/20" : "bg-muted"
              )}>
                <Icon className={cn(
                  "w-7 h-7",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              
              {/* Brand name */}
              <h3 className={cn(
                "font-mono text-lg font-bold mb-2",
                brand.id === 'techno-dog' && "lowercase"
              )}>
                {brand.name}
              </h3>
              
              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4">
                {brand.description}
              </p>
              
              {/* Metadata */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Style</span>
                  <span className="font-mono text-foreground">{brand.style}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Colors</span>
                  <span className="font-mono text-foreground">{brand.colorScheme}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Mascots</span>
                  <span className={cn(
                    "font-mono",
                    brand.mascot ? "text-logo-green" : "text-muted-foreground"
                  )}>
                    {brand.mascot ? '94 variants' : 'None'}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      {/* AI Model Selector */}
      <ModelSelector
        selectedModels={selectedModels}
        onModelsChange={onSelectModels}
      />

      {/* Guidelines reminder */}
      <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Note:</strong> All designs must comply with the 
          selected brand book's guidelines. Custom designs outside guidelines require owner 
          authorization (Alex Lawton only).
        </p>
      </div>
    </div>
  );
}

export default StepBrandSelection;
