/**
 * Step 5: Design Preview
 * 
 * AI-generated product mockup and design review.
 */

import { useState } from 'react';
import { ImagePlus, Loader2, RefreshCw, Check, AlertCircle, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { type ProductDraft } from '../../hooks/useCreativeWorkflow';

interface StepDesignPreviewProps {
  draft: ProductDraft;
  onSetImage: (url: string) => void;
}

export function StepDesignPreview({
  draft,
  onSetImage,
}: StepDesignPreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Build prompt from draft data
      const prompt = buildImagePrompt(draft);
      
      const { data, error: fnError } = await supabase.functions.invoke('creative-studio-image', {
        body: {
          prompt,
          brandBook: draft.brandBook,
          productType: draft.selectedProduct?.type,
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.imageUrl) {
        onSetImage(data.imageUrl);
      } else {
        throw new Error('No image received');
      }
    } catch (err) {
      console.error('Image generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const buildImagePrompt = (draft: ProductDraft): string => {
    const parts: string[] = [];
    
    // Product type
    if (draft.selectedProduct) {
      parts.push(`A ${draft.selectedProduct.type.toLowerCase()} mockup`);
    } else {
      parts.push('A product mockup');
    }
    
    // Brand style
    if (draft.brandBook === 'techno-dog') {
      parts.push('in brutalist VHS aesthetic, dark background, minimal design, geometric hexagon logo');
    } else {
      parts.push('in streetwear editorial style, black fabric, stroke-only graphic in neon green');
    }
    
    // Mascot
    if (draft.selectedMascot) {
      parts.push(`featuring ${draft.selectedMascot.displayName} mascot`);
    }
    
    // Editorial context
    if (draft.editorialBrief?.productName) {
      parts.push(`for "${draft.editorialBrief.productName}"`);
    }
    
    parts.push('Ultra high resolution, professional product photography');
    
    return parts.join(', ');
  };

  const hasImage = !!draft.generatedImageUrl;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-mono font-bold text-foreground mb-2">
          Design Preview
        </h2>
        <p className="text-sm text-muted-foreground">
          Generate an AI mockup of your product design for review before saving to drafts.
        </p>
      </div>

      {/* Summary of selections */}
      <Card className="p-4">
        <h3 className="font-mono text-xs uppercase text-muted-foreground mb-3">
          Design Summary
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Brand:</span>
            <span className="ml-2 font-mono">{draft.brandBook}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Product:</span>
            <span className="ml-2 font-mono">{draft.selectedProduct?.type || 'Not selected'}</span>
          </div>
          {draft.selectedMascot && (
            <div>
              <span className="text-muted-foreground">Mascot:</span>
              <span className="ml-2 font-mono">{draft.selectedMascot.displayName}</span>
            </div>
          )}
          {draft.editorialBrief?.productName && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Name:</span>
              <span className="ml-2 font-mono">{draft.editorialBrief.productName}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Image generation */}
      <Card className="p-6">
        {hasImage ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-logo-green" />
                <span className="font-mono text-sm uppercase text-logo-green">Preview Generated</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateImage}
                  disabled={isGenerating}
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
                  Regenerate
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href={draft.generatedImageUrl} download target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </a>
                </Button>
              </div>
            </div>
            
            <div className="aspect-square bg-muted rounded-lg overflow-hidden border border-border">
              <img
                src={draft.generatedImageUrl}
                alt="Generated product preview"
                className="w-full h-full object-contain"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">AI Generated</Badge>
              <Badge variant="outline">{draft.brandBook}</Badge>
              {draft.selectedProduct && (
                <Badge variant="outline">{draft.selectedProduct.type}</Badge>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center mb-4">
              <ImagePlus className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-mono text-lg mb-2">Generate Preview</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
              Create an AI-generated mockup of your product design based on your 
              selections and editorial brief.
            </p>
            <Button
              onClick={generateImage}
              disabled={isGenerating}
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Preview...
                </>
              ) : (
                <>
                  <ImagePlus className="w-5 h-5 mr-2" />
                  Generate Product Preview
                </>
              )}
            </Button>
          </div>
        )}
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Guidelines reminder */}
      <div className="p-4 bg-muted/30 rounded-lg border border-border/50 text-xs text-muted-foreground">
        <strong className="text-foreground">Note:</strong> The generated preview is for 
        visualization only. Final production will use official brand assets from the brand book.
      </div>
    </div>
  );
}

export default StepDesignPreview;
