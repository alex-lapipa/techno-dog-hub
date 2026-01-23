/**
 * Step: Story Generator
 * 
 * AI-powered product story generation with prompt capability.
 * Generates product name, tagline, description, and creative rationale
 * based on user prompt + design context.
 * 
 * SHOPIFY-FIRST: Generates Shopify-compliant product descriptions
 */

import { useState } from 'react';
import { 
  Sparkles, 
  Loader2, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  Wand2,
  FileText,
  Copy,
  CheckCheck
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { type ProductDraft } from '../../hooks/useCreativeWorkflow';

interface StepStoryGeneratorProps {
  draft: ProductDraft;
  onUpdateBrief: (brief: ProductDraft['editorialBrief']) => void;
  onUpdateConcept: (concept: string) => void;
}

export function StepStoryGenerator({
  draft,
  onUpdateBrief,
  onUpdateConcept,
}: StepStoryGeneratorProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(draft.productConcept || '');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handlePromptChange = (value: string) => {
    setPrompt(value);
    onUpdateConcept(value);
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({ title: 'Copied to clipboard' });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const generateStory = async () => {
    if (!prompt.trim()) {
      setError('Please enter a product concept or story prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('creative-studio-editorial', {
        body: {
          concept: prompt,
          brandBook: draft.brandBook,
          mascot: draft.selectedMascot?.displayName,
          mascotPersonality: draft.selectedMascot?.personality,
          productType: draft.shopifyCatalog?.productName,
          productCategory: draft.shopifyCatalog?.category,
          colorLine: draft.colorLine,
          productCopy: draft.productCopy,
          selectedModels: draft.selectedModels || ['gemini'],
          // Context for richer generation
          shopifyContext: {
            size: draft.shopifyCatalog?.size,
            color: draft.shopifyCatalog?.color,
            basePrice: draft.shopifyCatalog?.basePrice,
          },
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.editorial) {
        onUpdateBrief(data.editorial);
        toast({
          title: 'Story generated!',
          description: 'Your product story is ready for review.',
        });
      } else {
        throw new Error('No story content received');
      }
    } catch (err) {
      console.error('Story generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate story');
    } finally {
      setIsGenerating(false);
    }
  };

  const hasStory = !!draft.editorialBrief?.productName;

  // Build context summary for display
  const contextItems = [
    { label: 'Brand', value: draft.brandBook },
    draft.colorLine && { label: 'Color', value: draft.colorLine === 'green-line' ? 'Green Line' : 'White Line' },
    draft.selectedMascot && { label: 'Mascot', value: draft.selectedMascot.displayName },
    draft.shopifyCatalog?.productName && { label: 'Product', value: draft.shopifyCatalog.productName },
    draft.shopifyCatalog?.size && { label: 'Size', value: draft.shopifyCatalog.size },
    draft.shopifyCatalog?.color && { label: 'Color', value: draft.shopifyCatalog.color },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-mono font-bold text-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-primary" />
          Product Story Generator
        </h2>
        <p className="text-sm text-muted-foreground">
          Describe your product vision and let AI craft the perfect Shopify-ready story.
        </p>
      </div>

      {/* Context Summary */}
      {contextItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {contextItems.map((item, i) => (
            <Badge key={i} variant="outline" className="font-mono text-xs">
              {item.label}: <span className="text-foreground ml-1">{item.value}</span>
            </Badge>
          ))}
        </div>
      )}

      {/* Prompt Input */}
      <Card className="p-5">
        <Label htmlFor="story-prompt" className="text-sm font-mono uppercase tracking-wide flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Your Product Story Prompt
        </Label>
        <Textarea
          id="story-prompt"
          placeholder="Describe your product vision... (e.g., 'A limited edition hoodie for Berlin's 4AM warriors. Inspired by the hypnotic loops of early industrial techno, featuring our Berghain Dog mascot in laser green stroke.')"
          value={prompt}
          onChange={(e) => handlePromptChange(e.target.value)}
          className="mt-3 min-h-[140px] font-mono text-sm resize-none"
        />
        
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-muted-foreground">
            {prompt.length} characters • Be descriptive for better results
          </p>
          <Button
            onClick={generateStory}
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Story...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Product Story
              </>
            )}
          </Button>
        </div>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Generated Story Display */}
      {hasStory && draft.editorialBrief && (
        <Card className="p-5 border-primary/30 bg-primary/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span className="font-mono text-sm uppercase text-primary">Story Generated</span>
              <Badge variant="secondary" className="text-[10px]">Shopify Ready</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={generateStory}
              disabled={isGenerating}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
          </div>

          <div className="space-y-5">
            {/* Product Name */}
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase text-muted-foreground">Product Name</Label>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(draft.editorialBrief!.productName, 'name')}
                >
                  {copiedField === 'name' ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
              <Input
                value={draft.editorialBrief.productName}
                onChange={(e) => onUpdateBrief({ ...draft.editorialBrief!, productName: e.target.value })}
                className="mt-1 font-mono font-bold"
              />
            </div>

            {/* Tagline */}
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase text-muted-foreground">Tagline</Label>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(draft.editorialBrief!.tagline, 'tagline')}
                >
                  {copiedField === 'tagline' ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
              <Input
                value={draft.editorialBrief.tagline}
                onChange={(e) => onUpdateBrief({ ...draft.editorialBrief!, tagline: e.target.value })}
                className="mt-1 italic"
              />
            </div>

            <Separator />

            {/* Description */}
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase text-muted-foreground">Product Description</Label>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(draft.editorialBrief!.description, 'description')}
                >
                  {copiedField === 'description' ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
              <Textarea
                value={draft.editorialBrief.description}
                onChange={(e) => onUpdateBrief({ ...draft.editorialBrief!, description: e.target.value })}
                className="mt-1 min-h-[100px]"
              />
            </div>

            {/* Creative Rationale */}
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase text-muted-foreground">Creative Rationale</Label>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(draft.editorialBrief!.creativeRationale, 'rationale')}
                >
                  {copiedField === 'rationale' ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
              <Textarea
                value={draft.editorialBrief.creativeRationale}
                onChange={(e) => onUpdateBrief({ ...draft.editorialBrief!, creativeRationale: e.target.value })}
                className="mt-1 min-h-[80px] text-sm italic text-muted-foreground"
              />
            </div>

            {/* Target Audience */}
            <div>
              <Label className="text-[10px] uppercase text-muted-foreground">Target Audience</Label>
              <Input
                value={draft.editorialBrief.targetAudience}
                onChange={(e) => onUpdateBrief({ ...draft.editorialBrief!, targetAudience: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Shopify-first reminder */}
      <div className="p-3 bg-muted/30 rounded-lg border border-border/50 text-xs text-muted-foreground">
        <strong className="text-foreground">Shopify-First:</strong> Generated content is optimized for 
        Shopify product listings with SEO-friendly descriptions and proper formatting.
      </div>
    </div>
  );
}

export default StepStoryGenerator;
