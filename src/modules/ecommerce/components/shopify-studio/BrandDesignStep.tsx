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
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* Brand Book Selection */}
      <section className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-mono font-bold text-foreground uppercase tracking-wide flex items-center gap-3">
              <Palette className="w-6 h-6 text-crimson" />
              Brand Book
            </h2>
            <p className="text-muted-foreground mt-2">
              Choose your brand identity for this product
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowZeroTolerance(!showZeroTolerance)}
            className="gap-2 font-mono text-xs uppercase border-crimson/30 text-crimson hover:bg-crimson/10"
          >
            <AlertTriangle className="w-4 h-4" />
            Guidelines
          </Button>
        </div>

        {showZeroTolerance && (
          <Card className="p-5 bg-crimson/5 border-2 border-crimson/30">
            <h3 className="font-mono font-bold text-sm mb-3 text-crimson flex items-center gap-2 uppercase">
              <AlertTriangle className="w-4 h-4" />
              Zero Tolerance Policy
            </h3>
            <ul className="text-sm space-y-2 text-muted-foreground font-mono">
              <li className="flex items-start gap-2">
                <span className="text-crimson">—</span>
                Only use the 8 core Techno Doggy variants
              </li>
              <li className="flex items-start gap-2">
                <span className="text-crimson">—</span>
                Only use Logo Green or White for mascot strokes
              </li>
              <li className="flex items-start gap-2">
                <span className="text-crimson">—</span>
                Never use AI-generated or modified mascot versions
              </li>
              <li className="flex items-start gap-2">
                <span className="text-crimson">—</span>
                Always use dark fabric (black preferred)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-crimson">—</span>
                Always use official SVG exports from DogPack.tsx
              </li>
            </ul>
          </Card>
        )}

        <RadioGroup
          value={draft.brandBook}
          onValueChange={(v) => onSetBrandBook(v as BrandBookType)}
          className="grid grid-cols-2 gap-6"
        >
          <Label
            htmlFor="techno-dog"
            className={cn(
              "relative flex flex-col items-center p-8 rounded-2xl border-2 cursor-pointer transition-all group",
              draft.brandBook === 'techno-dog' 
                ? "border-crimson bg-crimson/10 shadow-xl shadow-crimson/10" 
                : "border-border hover:border-crimson/50 hover:bg-muted/20"
            )}
          >
            <RadioGroupItem value="techno-dog" id="techno-dog" className="sr-only" />
            {draft.brandBook === 'techno-dog' && (
              <div className="absolute top-4 right-4">
                <Check className="w-6 h-6 text-crimson" />
              </div>
            )}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-crimson/30 to-crimson/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform ring-2 ring-crimson/20">
              <Dog className="w-10 h-10 text-crimson" />
            </div>
            <span className="font-mono font-bold text-foreground uppercase tracking-wide">techno.dog</span>
            <span className="text-xs text-muted-foreground mt-1 font-mono">Platform brand</span>
          </Label>

          <Label
            htmlFor="techno-doggies"
            className={cn(
              "relative flex flex-col items-center p-8 rounded-2xl border-2 cursor-pointer transition-all group",
              draft.brandBook === 'techno-doggies' 
                ? "border-logo-green bg-logo-green/10 shadow-xl shadow-logo-green/10" 
                : "border-border hover:border-logo-green/50 hover:bg-muted/20"
            )}
          >
            <RadioGroupItem value="techno-doggies" id="techno-doggies" className="sr-only" />
            {draft.brandBook === 'techno-doggies' && (
              <div className="absolute top-4 right-4">
                <Check className="w-6 h-6 text-logo-green" />
              </div>
            )}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-logo-green/30 to-logo-green/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform ring-2 ring-logo-green/20">
              <div className="flex -space-x-1">
                <Dog className="w-8 h-8 text-logo-green" />
                <Dog className="w-8 h-8 text-logo-green" />
              </div>
            </div>
            <span className="font-mono font-bold text-foreground uppercase tracking-wide">Techno Doggies</span>
            <span className="text-xs text-muted-foreground mt-1 font-mono">Mascot merchandise</span>
          </Label>
        </RadioGroup>
      </section>

      {/* Mascot Selection (only for Techno Doggies) */}
      {draft.brandBook === 'techno-doggies' && (
        <section className="space-y-5">
          <h2 className="text-lg font-mono font-bold uppercase tracking-wide flex items-center gap-3">
            <Dog className="w-5 h-5 text-logo-green" />
            Select Mascot
            {selectedMascot && (
              <Badge variant="outline" className="ml-2 font-mono text-xs border-logo-green/40 text-logo-green">
                {selectedMascot.name}
              </Badge>
            )}
          </h2>

          <ScrollArea className="h-[280px]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pr-4">
              {CORE_MASCOTS.map((mascot) => (
                <Card
                  key={mascot.id}
                  onClick={() => onSetMascot(mascot.id, mascot.name)}
                  className={cn(
                    "p-4 cursor-pointer transition-all hover:scale-105 relative border-2",
                    draft.mascotId === mascot.id
                      ? "border-logo-green bg-logo-green/10 shadow-lg shadow-logo-green/10"
                      : "border-border hover:border-logo-green/50 hover:bg-muted/20"
                  )}
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-background flex items-center justify-center ring-2 ring-logo-green/30">
                      <Dog className="w-9 h-9 text-logo-green" />
                    </div>
                    <div>
                      <p className="font-mono font-bold text-sm uppercase">{mascot.name}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1 mt-1">
                        {mascot.personality}
                      </p>
                    </div>
                    {draft.mascotId === mascot.id && (
                      <Check className="w-5 h-5 text-logo-green absolute top-3 right-3" />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </section>
      )}

      {/* Color Line Selection */}
      <section className="space-y-5">
        <h2 className="text-lg font-mono font-bold uppercase tracking-wide flex items-center gap-3">
          <Palette className="w-5 h-5 text-crimson" />
          Color Line
          {selectedColorLine && (
            <Badge 
              variant="outline" 
              className="ml-2 font-mono text-xs"
              style={{ borderColor: selectedColorLine.hex, color: selectedColorLine.hex }}
            >
              {selectedColorLine.name}
            </Badge>
          )}
        </h2>

        <div className="grid grid-cols-2 gap-6">
          {COLOR_LINES.map((line) => (
            <Card
              key={line.id}
              onClick={() => onSetColorLine(line.id as 'green-line' | 'white-line')}
              className={cn(
                "p-5 cursor-pointer transition-all border-2",
                draft.colorLine === line.id
                  ? "shadow-lg"
                  : "border-border hover:border-primary/50 hover:bg-muted/20"
              )}
              style={{ 
                borderColor: draft.colorLine === line.id ? line.hex : undefined,
                boxShadow: draft.colorLine === line.id ? `0 10px 30px -10px ${line.hex}40` : undefined
              }}
            >
              <div className="flex items-center gap-5">
                <div 
                  className={cn(
                    "w-20 h-20 rounded-xl flex items-center justify-center",
                    line.bgClass
                  )} 
                  style={{ 
                    boxShadow: `inset 0 0 0 2px ${line.hex}40`
                  }}
                >
                  <Dog className={cn("w-12 h-12", line.strokeClass)} />
                </div>
                <div>
                  <p className="font-mono font-bold uppercase tracking-wide">{line.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{line.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Preview */}
      <section className="space-y-5">
        <h2 className="text-lg font-mono font-bold uppercase tracking-wide">Product Preview</h2>
        <Card className="p-8 bg-background border-2 border-border">
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="w-40 h-48 bg-muted/10 rounded-xl flex items-center justify-center ring-2 ring-border">
                {selectedMascot && selectedColorLine ? (
                  <Dog 
                    className="w-20 h-20" 
                    style={{ color: selectedColorLine.hex }}
                  />
                ) : (
                  <span className="text-xs text-muted-foreground text-center px-4 font-mono">
                    Select mascot & color line
                  </span>
                )}
              </div>
              {selectedMascot && (
                <p className="text-center mt-4 font-mono text-sm text-muted-foreground">
                  <span style={{ color: selectedColorLine?.hex }}>{selectedColorLine?.name}</span>
                  <span className="text-muted-foreground/50"> — </span>
                  <span className="text-foreground">{selectedMascot.name}</span>
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
