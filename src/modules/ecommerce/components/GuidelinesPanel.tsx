/**
 * Guidelines Panel Component
 * 
 * Displays active brand book guidelines for product creation.
 * Shows approved colors, mascots, products, and rules.
 */

import { AlertTriangle, Check, Info, X, Dog, Palette, ShoppingBag } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { BrandBookGuidelines, ApprovedColor, ApprovedMascot, ApprovedProduct } from '../hooks/useBrandBookGuidelines';

interface GuidelinesPanelProps {
  guidelines: BrandBookGuidelines;
  isOwner: boolean;
  className?: string;
}

export function GuidelinesPanel({ guidelines, isOwner, className }: GuidelinesPanelProps) {
  return (
    <Card className={`p-4 bg-card border-border ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-mono text-sm uppercase tracking-wide text-foreground font-medium">
            {guidelines.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            v{guidelines.version}
          </p>
        </div>
        {isOwner && (
          <Badge className="bg-logo-green/10 text-logo-green border-logo-green/20 font-mono text-[10px]">
            Owner Access
          </Badge>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        {guidelines.description}
      </p>

      <ScrollArea className="h-[400px] pr-4">
        {/* Approved Colors */}
        {guidelines.colors.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-muted-foreground" />
              <h4 className="font-mono text-xs uppercase tracking-wide text-foreground">
                Approved Colors
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {guidelines.colors.map((color) => (
                <ColorSwatch key={color.name} color={color} />
              ))}
            </div>
          </div>
        )}

        {/* Approved Mascots */}
        {guidelines.mascots.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Dog className="w-4 h-4 text-muted-foreground" />
              <h4 className="font-mono text-xs uppercase tracking-wide text-foreground">
                Approved Mascots ({guidelines.mascots.length})
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {guidelines.mascots.slice(0, 8).map((mascot) => (
                <MascotCard key={mascot.id} mascot={mascot} />
              ))}
            </div>
          </div>
        )}

        {/* Approved Products */}
        {guidelines.products.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag className="w-4 h-4 text-muted-foreground" />
              <h4 className="font-mono text-xs uppercase tracking-wide text-foreground">
                Approved Products
              </h4>
            </div>
            <div className="space-y-2">
              {guidelines.products.map((product) => (
                <ProductCard key={product.type} product={product} />
              ))}
            </div>
          </div>
        )}

        <Separator className="my-4" />

        {/* Rules */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Check className="w-4 h-4 text-logo-green" />
            <h4 className="font-mono text-xs uppercase tracking-wide text-foreground">
              Required Rules
            </h4>
          </div>
          <div className="space-y-2">
            {guidelines.rules.filter(r => r.required).map((rule) => (
              <RuleItem key={rule.id} rule={rule} />
            ))}
          </div>
        </div>

        {/* Forbidden */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <X className="w-4 h-4 text-destructive" />
            <h4 className="font-mono text-xs uppercase tracking-wide text-foreground">
              Forbidden
            </h4>
          </div>
          <div className="space-y-1">
            {guidelines.forbidden.map((item, index) => (
              <div key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
                <AlertTriangle className="w-3 h-3 text-destructive flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
}

function ColorSwatch({ color }: { color: ApprovedColor }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded border border-border/50">
            <div 
              className="w-6 h-6 rounded border border-border/30 flex-shrink-0"
              style={{ backgroundColor: color.hex }}
            />
            <div className="min-w-0">
              <p className="font-mono text-[10px] text-foreground truncate">{color.name}</p>
              <p className="font-mono text-[9px] text-muted-foreground truncate">{color.hex}</p>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{color.usage}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function MascotCard({ mascot }: { mascot: ApprovedMascot }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded border border-border/50">
            <div className="w-6 h-6 rounded-full bg-logo-green/10 flex items-center justify-center flex-shrink-0">
              <Dog className="w-3 h-3 text-logo-green" />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[10px] text-foreground truncate">{mascot.displayName}</p>
              {mascot.approvedForApparel && (
                <Badge variant="outline" className="text-[8px] px-1 py-0 h-3 border-logo-green/30 text-logo-green">
                  Apparel
                </Badge>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-xs font-medium">{mascot.personality}</p>
          <p className="text-xs text-muted-foreground italic mt-1">"{mascot.quote}"</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function ProductCard({ product }: { product: ApprovedProduct }) {
  return (
    <div className="p-2 bg-muted/30 rounded border border-border/50">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] text-foreground">{product.type}</p>
        <Badge variant="outline" className="text-[8px] px-1 py-0 h-3">
          {product.placement}
        </Badge>
      </div>
      <p className="text-[9px] text-muted-foreground mt-1">
        Print: {product.printSize} • Fabric: {product.fabricColors.join(', ')}
      </p>
    </div>
  );
}

function RuleItem({ rule }: { rule: { id: string; name: string; description: string; required: boolean } }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-start gap-2 p-2 bg-muted/30 rounded border border-border/50">
            <Info className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="font-mono text-[10px] text-foreground">{rule.name}</p>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-xs">{rule.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default GuidelinesPanel;
