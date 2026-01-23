/**
 * Step: Image Generator
 * 
 * AI-powered product mockup generation.
 * Generates Shopify-ready product images based on design context.
 * 
 * BRAND COMPLIANCE:
 * - techno.dog: VHS brutalist aesthetic, NO dog imagery
 * - Techno Doggies: Blank garment + client-side mascot composite
 */

import { useState } from 'react';
import { 
  ImagePlus, 
  Loader2, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  Download,
  Sparkles,
  Wand2,
  Eye
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { type ProductDraft } from '../../hooks/useCreativeWorkflow';

interface StepImageGeneratorProps {
  draft: ProductDraft;
  onSetImage: (url: string) => void;
}

export function StepImageGenerator({
  draft,
  onSetImage,
}: StepImageGeneratorProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);

  const generateImage = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Build comprehensive prompt from draft context
      const contextPrompt = buildContextPrompt(draft);
      const finalPrompt = customPrompt.trim() 
        ? `${contextPrompt}\n\nAdditional direction: ${customPrompt}`
        : contextPrompt;
      
      const { data, error: fnError } = await supabase.functions.invoke('creative-studio-image', {
        body: {
          prompt: finalPrompt,
          brandBook: draft.brandBook,
          productType: draft.shopifyCatalog?.productName,
          colorLine: draft.colorLine,
          mascot: draft.selectedMascot?.displayName,
          scenePreset: 'berlin-warehouse', // Default scene
          placement: 'front',
          selectedModels: draft.selectedModels || ['gemini'],
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.imageUrl) {
        onSetImage(data.imageUrl);
        toast({
          title: 'Image generated!',
          description: 'Your product mockup is ready for review.',
        });
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

  const buildContextPrompt = (draft: ProductDraft): string => {
    const parts: string[] = [];
    
    // Product type
    if (draft.shopifyCatalog?.productName) {
      parts.push(`A ${draft.shopifyCatalog.productName.toLowerCase()} product mockup`);
    } else {
      parts.push('A product mockup');
    }
    
    // Color context
    if (draft.shopifyCatalog?.color) {
      parts.push(`in ${draft.shopifyCatalog.color} color`);
    }
    
    // Brand style
    if (draft.brandBook === 'techno-dog') {
      parts.push('in brutalist VHS aesthetic, dark background, minimal design, geometric hexagon logo, crimson accents');
    } else {
      const strokeColor = draft.colorLine === 'green-line' ? 'laser green' : 'pure white';
      parts.push(`in streetwear editorial style, black fabric, ${strokeColor} stroke graphics`);
    }
    
    // Mascot
    if (draft.selectedMascot && draft.brandBook === 'techno-doggies') {
      parts.push(`featuring ${draft.selectedMascot.displayName} mascot design`);
    }
    
    // Editorial context
    if (draft.editorialBrief?.productName) {
      parts.push(`for "${draft.editorialBrief.productName}"`);
    }
    
    // Product copy
    if (draft.productCopy && draft.productCopy.length > 0) {
      const texts = draft.productCopy.map(c => c.text).filter(Boolean);
      if (texts.length > 0) {
        parts.push(`with text elements: ${texts.join(', ')}`);
      }
    }
    
    parts.push('Ultra high resolution, professional product photography, studio lighting');
    
    return parts.join(', ');
  };

  const hasImage = !!draft.generatedImageUrl;

  // Context badges for display
  const contextBadges = [
    draft.brandBook,
    draft.shopifyCatalog?.productName,
    draft.shopifyCatalog?.color,
    draft.selectedMascot?.displayName,
    draft.colorLine === 'green-line' ? 'Green Line' : draft.colorLine === 'white-line' ? 'White Line' : null,
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-mono font-bold text-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
          <ImagePlus className="w-5 h-5 text-primary" />
          Product Image Generator
        </h2>
        <p className="text-sm text-muted-foreground">
          Generate AI-powered product mockups based on your design selections.
        </p>
      </div>

      {/* Design Context Summary */}
      <Card className="p-4">
        <h3 className="font-mono text-xs uppercase text-muted-foreground mb-3">
          Design Context
        </h3>
        <div className="flex flex-wrap gap-2">
          {contextBadges.map((badge, i) => (
            <Badge key={i} variant="outline" className="font-mono text-xs">
              {badge}
            </Badge>
          ))}
        </div>
        
        {/* Editorial preview if available */}
        {draft.editorialBrief?.productName && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="font-mono font-bold text-sm">{draft.editorialBrief.productName}</p>
            {draft.editorialBrief.tagline && (
              <p className="text-xs text-muted-foreground italic mt-1">{draft.editorialBrief.tagline}</p>
            )}
          </div>
        )}
      </Card>

      {/* Custom Prompt Toggle */}
      <div className="space-y-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCustomPrompt(!showCustomPrompt)}
          className="font-mono text-xs"
        >
          <Wand2 className="w-4 h-4 mr-2" />
          {showCustomPrompt ? 'Hide Custom Prompt' : 'Add Custom Direction'}
        </Button>
        
        {showCustomPrompt && (
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase text-muted-foreground">
              Custom Image Direction (Optional)
            </Label>
            <Textarea
              placeholder="Add specific direction for the image... (e.g., 'dramatic lighting from the left', 'outdoor urban setting', 'model wearing the hoodie')"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="min-h-[80px] font-mono text-sm"
            />
          </div>
        )}
      </div>

      {/* Image Generation Area */}
      <Card className="p-6">
        {hasImage ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-logo-green" />
                <span className="font-mono text-sm uppercase text-logo-green">Image Generated</span>
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
            
            <div className="aspect-square max-w-md mx-auto bg-muted rounded-lg overflow-hidden border border-border relative group">
              <img
                src={draft.generatedImageUrl}
                alt="Generated product preview"
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button variant="secondary" size="sm" asChild>
                  <a href={draft.generatedImageUrl} target="_blank" rel="noopener noreferrer">
                    <Eye className="w-4 h-4 mr-2" />
                    View Full Size
                  </a>
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="outline">AI Generated</Badge>
              <Badge variant="outline">{draft.brandBook}</Badge>
              {draft.shopifyCatalog?.productName && (
                <Badge variant="outline">{draft.shopifyCatalog.productName}</Badge>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center mb-4">
              <ImagePlus className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-mono text-lg mb-2">Generate Product Mockup</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
              Create an AI-generated mockup based on your design selections and product story.
            </p>
            <Button
              onClick={generateImage}
              disabled={isGenerating}
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Image...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Product Image
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

      {/* Brand compliance note */}
      <div className="p-3 bg-muted/30 rounded-lg border border-border/50 text-xs text-muted-foreground">
        <strong className="text-foreground">Brand Compliance:</strong>{' '}
        {draft.brandBook === 'techno-doggies' 
          ? 'Techno Doggies images use blank garment mockups. Official mascot SVGs are composited separately to ensure zero hallucination.'
          : 'techno.dog images follow VHS/brutalist aesthetic with geometric hexagon logo. No dog imagery generated.'}
      </div>
    </div>
  );
}

export default StepImageGenerator;
