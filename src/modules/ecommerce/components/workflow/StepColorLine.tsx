/**
 * Step 3: Color Line Selection
 * 
 * Mandatory choice between Green Line (#00FF00) or White Line (pure white).
 * This is a core brand book requirement for Techno Doggies merchandise.
 * 
 * BRAND BOOK COMPLIANCE:
 * - Only uses approved stroke colors from brand book
 * - Does NOT modify brand book settings
 * - Enforces Zero Tolerance policy
 */

import { Check, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { type BrandBookType } from '../../hooks/useBrandBookGuidelines';

export type ColorLineType = 'green-line' | 'white-line';

interface ColorLineOption {
  id: ColorLineType;
  name: string;
  displayName: string;
  hex: string;
  description: string;
  useCases: string[];
}

// Approved color lines from brand book - NEVER MODIFY THESE VALUES
const COLOR_LINES: ColorLineOption[] = [
  {
    id: 'green-line',
    name: 'Green Line',
    displayName: 'Laser Green',
    hex: '#00FF00',
    description: 'High-visibility neon stroke. The signature Techno Doggies color.',
    useCases: [
      'Night events & festivals',
      'Club merchandise',
      'Statement pieces',
      'UV-reactive applications',
    ],
  },
  {
    id: 'white-line',
    name: 'White Line',
    displayName: 'Pure White',
    hex: '#FFFFFF',
    description: 'Clean, minimal stroke. Understated elegance for daily wear.',
    useCases: [
      'Everyday streetwear',
      'Subtle branding',
      'Professional settings',
      'Timeless aesthetic',
    ],
  },
];

interface StepColorLineProps {
  brandBook: BrandBookType;
  selectedColorLine: ColorLineType | null;
  onSelectColorLine: (colorLine: ColorLineType) => void;
  selectedMascot?: { displayName: string; Component?: React.ComponentType<{ className?: string }> } | null;
}

export function StepColorLine({
  brandBook,
  selectedColorLine,
  onSelectColorLine,
  selectedMascot,
}: StepColorLineProps) {
  // Only show for Techno Doggies brand - techno.dog doesn't use color lines
  if (brandBook === 'techno-dog') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-mono font-bold text-foreground mb-2">
            Color Line Selection
          </h2>
          <p className="text-sm text-muted-foreground">
            Not applicable for techno.dog brand. This brand uses its own color system.
          </p>
        </div>
        
        <Card className="p-6 bg-muted/30 border-dashed">
          <div className="flex items-center gap-3 text-muted-foreground">
            <AlertTriangle className="w-5 h-5" />
            <p className="text-sm">
              techno.dog brand uses geometric designs with the VHS color palette. 
              Color line selection is only available for Techno Doggies merchandise.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-mono font-bold text-foreground mb-2">
          Select Color Line
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose the stroke color for your mascot. Per brand guidelines, all Techno Doggies 
          merchandise uses <strong>stroke-only graphics</strong> in one of two approved colors.
        </p>
      </div>

      {/* Zero Tolerance Notice */}
      <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
        <p className="text-xs text-destructive font-mono uppercase tracking-wide flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Zero Tolerance Policy: Only Green Line or White Line permitted
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {COLOR_LINES.map((colorLine) => {
          const isSelected = selectedColorLine === colorLine.id;
          
          return (
            <Card
              key={colorLine.id}
              onClick={() => onSelectColorLine(colorLine.id)}
              className={cn(
                "p-6 cursor-pointer transition-all relative overflow-hidden",
                "hover:border-primary/50",
                isSelected && "ring-2 ring-primary border-primary"
              )}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              
              {/* Color Preview Bar */}
              <div 
                className="h-2 w-full rounded-full mb-4"
                style={{ backgroundColor: colorLine.hex }}
              />
              
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-12 h-12 rounded-lg border-2 flex items-center justify-center"
                  style={{ borderColor: colorLine.hex }}
                >
                  {/* Preview mascot silhouette if selected */}
                  {selectedMascot?.Component ? (
                    <selectedMascot.Component 
                      className="w-8 h-8"
                    />
                  ) : (
                    <div 
                      className="w-6 h-6 rounded-full border-2"
                      style={{ borderColor: colorLine.hex }}
                    />
                  )}
                </div>
                <div>
                  <h3 className="font-mono text-lg font-bold">
                    {colorLine.name}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    {colorLine.displayName}
                  </p>
                </div>
              </div>
              
              {/* Hex Badge */}
              <Badge 
                variant="outline" 
                className="mb-3 font-mono text-[10px]"
                style={{ 
                  borderColor: colorLine.hex,
                  color: colorLine.id === 'green-line' ? colorLine.hex : undefined
                }}
              >
                {colorLine.hex}
              </Badge>
              
              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4">
                {colorLine.description}
              </p>
              
              {/* Use Cases */}
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">
                  Best For
                </p>
                <ul className="space-y-1">
                  {colorLine.useCases.map((useCase, idx) => (
                    <li key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                      <span 
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: colorLine.hex }}
                      />
                      {useCase}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Selection Summary */}
      {selectedColorLine && (
        <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Selected:</strong>{' '}
            {COLOR_LINES.find(c => c.id === selectedColorLine)?.name} —{' '}
            All graphics will use {COLOR_LINES.find(c => c.id === selectedColorLine)?.hex} stroke color 
            on black fabric.
          </p>
        </div>
      )}
    </div>
  );
}

export default StepColorLine;
