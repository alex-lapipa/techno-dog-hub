/**
 * SEO Panel - Shopify SEO optimization with character counters
 * 
 * SHOPIFY-FIRST: Maps directly to Shopify's SEO fields.
 * Includes character limits per Shopify best practices.
 */

import { useState, useEffect } from 'react';
import { Search, AlertCircle, Check, Globe } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Shopify SEO limits
const SEO_LIMITS = {
  title: 60,
  description: 160,
  handle: 80,
};

interface SEOData {
  seoTitle: string;
  seoDescription: string;
  handle: string;
}

interface SEOPanelProps {
  seoData: SEOData;
  productTitle: string;
  onUpdate: (data: Partial<SEOData>) => void;
}

function CharacterCounter({ 
  current, 
  max,
  label 
}: { 
  current: number; 
  max: number;
  label: string;
}) {
  const percentage = (current / max) * 100;
  const isOverLimit = current > max;
  const isNearLimit = current > max * 0.85;

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={cn(
        "font-mono",
        isOverLimit && "text-destructive font-bold",
        isNearLimit && !isOverLimit && "text-accent"
      )}>
        {current}/{max}
      </span>
      {isOverLimit && <AlertCircle className="w-3 h-3 text-destructive" />}
      {!isOverLimit && current > 0 && <Check className="w-3 h-3 text-primary" />}
    </div>
  );
}

function generateHandle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, SEO_LIMITS.handle);
}

export function SEOPanel({
  seoData,
  productTitle,
  onUpdate,
}: SEOPanelProps) {
  const [localSEO, setLocalSEO] = useState<SEOData>({
    seoTitle: seoData.seoTitle || '',
    seoDescription: seoData.seoDescription || '',
    handle: seoData.handle || generateHandle(productTitle),
  });

  // Auto-generate handle from title if empty
  useEffect(() => {
    if (!localSEO.handle && productTitle) {
      const handle = generateHandle(productTitle);
      setLocalSEO(prev => ({ ...prev, handle }));
      onUpdate({ handle });
    }
  }, [productTitle]);

  const handleChange = (field: keyof SEOData, value: string) => {
    setLocalSEO(prev => ({ ...prev, [field]: value }));
    onUpdate({ [field]: value });
  };

  // SEO score calculation
  const calculateSEOScore = (): number => {
    let score = 0;
    const { seoTitle, seoDescription, handle } = localSEO;

    // Title scoring (0-35 points)
    if (seoTitle.length > 0) score += 10;
    if (seoTitle.length >= 30 && seoTitle.length <= SEO_LIMITS.title) score += 15;
    if (seoTitle.toLowerCase().includes('techno')) score += 10;

    // Description scoring (0-35 points)
    if (seoDescription.length > 0) score += 10;
    if (seoDescription.length >= 100 && seoDescription.length <= SEO_LIMITS.description) score += 15;
    if (seoDescription.includes('underground') || seoDescription.includes('rave')) score += 10;

    // Handle scoring (0-30 points)
    if (handle.length > 0) score += 15;
    if (!handle.includes('--')) score += 10;
    if (handle.length <= 50) score += 5;

    return Math.min(score, 100);
  };

  const seoScore = calculateSEOScore();

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-mono font-bold text-sm flex items-center gap-2">
          <Search className="w-4 h-4 text-primary" />
          SEO Optimization
        </h3>
        <Badge 
          variant={seoScore >= 70 ? 'default' : seoScore >= 40 ? 'secondary' : 'destructive'}
          className="font-mono"
        >
          {seoScore}/100
        </Badge>
      </div>

      {/* SEO Score Bar */}
      <div className="space-y-1">
        <Progress value={seoScore} className="h-2" />
        <p className="text-xs text-muted-foreground">
          {seoScore >= 70 ? '✓ Great SEO!' : seoScore >= 40 ? 'Needs improvement' : 'Add more SEO content'}
        </p>
      </div>

      {/* SEO Title */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">SEO Title (meta title)</Label>
          <CharacterCounter 
            current={localSEO.seoTitle.length} 
            max={SEO_LIMITS.title}
            label="SEO Title"
          />
        </div>
        <Input
          value={localSEO.seoTitle}
          onChange={(e) => handleChange('seoTitle', e.target.value)}
          placeholder={`${productTitle} | techno.dog`}
          className="font-mono text-sm"
          maxLength={SEO_LIMITS.title + 10} // Allow some overflow for editing
        />
        <p className="text-[10px] text-muted-foreground">
          Include product name and brand. Appears in search results and browser tabs.
        </p>
      </div>

      {/* SEO Description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">SEO Description (meta description)</Label>
          <CharacterCounter 
            current={localSEO.seoDescription.length} 
            max={SEO_LIMITS.description}
            label="SEO Description"
          />
        </div>
        <Textarea
          value={localSEO.seoDescription}
          onChange={(e) => handleChange('seoDescription', e.target.value)}
          placeholder="Premium underground techno merchandise. Official Techno Doggies collection..."
          className="font-mono text-sm resize-none"
          rows={3}
          maxLength={SEO_LIMITS.description + 20}
        />
        <p className="text-[10px] text-muted-foreground">
          Compelling description for search results. Include keywords naturally.
        </p>
      </div>

      {/* URL Handle */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs flex items-center gap-1">
            <Globe className="w-3 h-3" />
            URL Handle
          </Label>
          <CharacterCounter 
            current={localSEO.handle.length} 
            max={SEO_LIMITS.handle}
            label="Handle"
          />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground font-mono">/products/</span>
          <Input
            value={localSEO.handle}
            onChange={(e) => handleChange('handle', generateHandle(e.target.value))}
            placeholder="product-handle"
            className="font-mono text-sm"
            maxLength={SEO_LIMITS.handle}
          />
        </div>
        <p className="text-[10px] text-muted-foreground">
          URL-friendly slug. Auto-generated from title, editable.
        </p>
      </div>

      {/* Preview */}
      <div className="border-t border-border pt-4">
        <Label className="text-xs mb-2 block text-muted-foreground">Search Preview</Label>
        <div className="bg-background p-3 rounded border border-border">
          <p className="text-primary text-sm font-medium hover:underline cursor-pointer truncate">
            {localSEO.seoTitle || productTitle || 'Product Title'} | techno.dog
          </p>
          <p className="text-logo-green text-xs font-mono">
            technodog-d3wkq.myshopify.com/products/{localSEO.handle || 'product-handle'}
          </p>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {localSEO.seoDescription || 'Add a meta description to improve click-through rates from search results.'}
          </p>
        </div>
      </div>
    </Card>
  );
}

export default SEOPanel;
