/**
 * Brand Design Step - Apply Techno Dog/Doggies mascots and color lines
 * 
 * SHOPIFY-FIRST: Design choices map directly to Shopify metafields.
 * BRAND COMPLIANT: Enforces Zero Tolerance policy from design system.
 */

import { useState } from 'react';
import { Dog, Palette, Check, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { StudioDraft } from '../../hooks/useShopifyStudio';
import type { BrandBookType } from '../../hooks/useBrandBookGuidelines';

// Core mascot variants from design-system-doggies.json
const CORE_MASCOTS = [
  { id: 'dj-dog', name: 'DJ Dog', personality: 'The selector, dropping beats', quote: 'The kick is the heartbeat.' },
  { id: 'ninja-dog', name: 'Ninja Dog', personality: 'Silent warrior of the night', quote: 'Move in silence.' },
  { id: 'space-dog', name: 'Space Dog', personality: 'Cosmic explorer of sound', quote: 'Beyond the stars.' },
  { id: 'grumpy-dog', name: 'Grumpy Dog', personality: 'The cynical veteran', quote: 'Back in my day...' },
  { id: 'happy-dog', name: 'Happy Dog', personality: 'Pure positive energy', quote: 'Every beat is a blessing!' },
  { id: 'techno-dog', name: 'Techno Dog', personality: 'Glitched out & digital', quote: '01001011 01001001 01000011 01001011' },
  { id: 'dancing-dog', name: 'Dancing Dog', personality: 'Always moving', quote: 'The floor is life.' },
  { id: 'acid-dog', name: 'Acid Dog', personality: 'Deep repetitive vibes', quote: 'Surrender to the squelch.' },
] as const;

const COLOR_LINES = [
  {
    id: 'green-line',
    name: 'Green Line',
    description: 'Black fabric with Logo Green (#66ff66) stroke',
    bgClass: 'bg-black',
    strokeClass: 'text-logo-green',
    hex: '#66ff66',
  },
  {
    id: 'white-line',
    name: 'White Line',
    description: 'Black fabric with White (#ffffff) stroke',
    bgClass: 'bg-black',
    strokeClass: 'text-white',
    hex: '#ffffff',
  },
] as const;

interface BrandDesignStepProps {
  draft: StudioDraft;
  onUpdateDraft: (updates: Partial<StudioDraft>) => void;
  onSetBrandBook: (brand: BrandBookType) => void;
  onSetMascot: (id: string | null, name: string | null) => void;
  onSetColorLine: (line: 'green-line' | 'white-line' | null) => void;
}

export function BrandDesignStep({
  draft,
  onUpdateDraft,
  onSetBrandBook,
  onSetMascot,
  onSetColorLine,
}: BrandDesignStepProps) {
  const [showZeroTolerance, setShowZeroTolerance] = useState(false);

  const selectedMascot = CORE_MASCOTS.find(m => m.id === draft.mascotId);
  const selectedColorLine = COLOR_LINES.find(c => c.id === draft.colorLine);

  return (
    <div className="space-y-6 p-6">
      {/* Brand Book Selection */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-mono font-bold flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Brand Book
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowZeroTolerance(!showZeroTolerance)}
            className="text-xs"
          >
            <AlertTriangle className="w-3 h-3 mr-1" />
            Zero Tolerance Policy
          </Button>
        </div>

        {showZeroTolerance && (
          <Card className="p-4 bg-destructive/10 border-destructive/30">
            <h3 className="font-mono font-bold text-sm mb-2 text-destructive">
              Zero Tolerance Policy
            </h3>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• ONLY use the 8 core Techno Doggy variants</li>
              <li>• ONLY use Logo Green or White for mascot strokes</li>
              <li>• NEVER use AI-generated or modified versions</li>
              <li>• ALWAYS use dark fabric (black preferred)</li>
              <li>• ALWAYS use official SVG exports from DogPack.tsx</li>
            </ul>
          </Card>
        )}

        <RadioGroup
          value={draft.brandBook}
          onValueChange={(v) => onSetBrandBook(v as BrandBookType)}
          className="grid grid-cols-2 gap-4"
        >
          <Label
            htmlFor="techno-dog"
            className={cn(
              "flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all",
              draft.brandBook === 'techno-dog' 
                ? "border-primary bg-primary/10" 
                : "border-border hover:border-primary/50"
            )}
          >
            <RadioGroupItem value="techno-dog" id="techno-dog" className="sr-only" />
            <Dog className="w-8 h-8 mb-2 text-primary" />
            <span className="font-mono font-bold">techno.dog</span>
            <span className="text-xs text-muted-foreground">Platform brand</span>
          </Label>

          <Label
            htmlFor="techno-doggies"
            className={cn(
              "flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all",
              draft.brandBook === 'techno-doggies' 
                ? "border-primary bg-primary/10" 
                : "border-border hover:border-primary/50"
            )}
          >
            <RadioGroupItem value="techno-doggies" id="techno-doggies" className="sr-only" />
            <div className="flex -space-x-2 mb-2">
              <Dog className="w-6 h-6 text-logo-green" />
              <Dog className="w-6 h-6 text-logo-green" />
            </div>
            <span className="font-mono font-bold">Techno Doggies</span>
            <span className="text-xs text-muted-foreground">Mascot merchandise</span>
          </Label>
        </RadioGroup>
      </section>

      {/* Mascot Selection (only for Techno Doggies) */}
      {draft.brandBook === 'techno-doggies' && (
        <section className="space-y-4">
          <h2 className="text-lg font-mono font-bold flex items-center gap-2">
            <Dog className="w-5 h-5 text-logo-green" />
            Select Mascot
            {selectedMascot && (
              <Badge variant="outline" className="ml-2 font-normal">
                {selectedMascot.name}
              </Badge>
            )}
          </h2>

          <ScrollArea className="h-[240px]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pr-4">
              {CORE_MASCOTS.map((mascot) => (
                <Card
                  key={mascot.id}
                  onClick={() => onSetMascot(mascot.id, mascot.name)}
                  className={cn(
                    "p-3 cursor-pointer transition-all hover:scale-105",
                    draft.mascotId === mascot.id
                      ? "border-logo-green bg-logo-green/10"
                      : "hover:border-primary/50"
                  )}
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                      <Dog className="w-8 h-8 text-logo-green" />
                    </div>
                    <div>
                      <p className="font-mono font-bold text-sm">{mascot.name}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">
                        {mascot.personality}
                      </p>
                    </div>
                    {draft.mascotId === mascot.id && (
                      <Check className="w-4 h-4 text-logo-green absolute top-2 right-2" />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </section>
      )}

      {/* Color Line Selection */}
      <section className="space-y-4">
        <h2 className="text-lg font-mono font-bold flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Color Line
          {selectedColorLine && (
            <Badge 
              variant="outline" 
              className="ml-2"
              style={{ borderColor: selectedColorLine.hex }}
            >
              {selectedColorLine.name}
            </Badge>
          )}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {COLOR_LINES.map((line) => (
            <Card
              key={line.id}
              onClick={() => onSetColorLine(line.id as 'green-line' | 'white-line')}
              className={cn(
                "p-4 cursor-pointer transition-all",
                draft.colorLine === line.id
                  ? "border-2"
                  : "border hover:border-primary/50"
              )}
              style={{ 
                borderColor: draft.colorLine === line.id ? line.hex : undefined 
              }}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-16 h-16 rounded flex items-center justify-center",
                  line.bgClass
                )}>
                  <Dog className={cn("w-10 h-10", line.strokeClass)} />
                </div>
                <div>
                  <p className="font-mono font-bold">{line.name}</p>
                  <p className="text-xs text-muted-foreground">{line.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Preview */}
      <section className="space-y-4">
        <h2 className="text-lg font-mono font-bold">Product Preview</h2>
        <Card className="p-6 bg-black">
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="w-32 h-40 bg-muted/20 rounded-lg flex items-center justify-center">
                {selectedMascot && selectedColorLine ? (
                  <Dog 
                    className="w-16 h-16" 
                    style={{ color: selectedColorLine.hex }}
                  />
                ) : (
                  <span className="text-xs text-muted-foreground text-center px-2">
                    Select mascot & color line
                  </span>
                )}
              </div>
              {selectedMascot && (
                <p className="text-center mt-2 font-mono text-sm text-muted-foreground">
                  {selectedColorLine?.name} – {selectedMascot.name}
                </p>
              )}
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

export default BrandDesignStep;
