/**
 * Step 5: Editorial Brief
 * 
 * Phase 2 & 3: Enhanced with Technopedia integration and scene/mood context.
 * AI-powered product description and creative rationale generation.
 * Uses RAG + brand book context for on-brand copy.
 * 
 * BRAND COMPLIANCE:
 * - Brand book data is READ-ONLY
 * - Only approved mascots from 94-variant pack
 * - Never modifies brand assets
 */

import { useState } from 'react';
import { Sparkles, Loader2, RefreshCw, Check, AlertCircle, SkipForward } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { type ProductDraft } from '../../hooks/useCreativeWorkflow';
import { KnowledgeBasePanel, type KnowledgeContext } from './KnowledgeBasePanel';

interface StepEditorialBriefProps {
  draft: ProductDraft;
  onUpdateBrief: (brief: ProductDraft['editorialBrief']) => void;
  onUpdateConcept: (concept: string) => void;
  onSkip?: () => void;
}

// Initial empty knowledge context
const EMPTY_CONTEXT: KnowledgeContext = {
  artists: [],
  gear: [],
  venues: [],
  labels: [],
  customKeywords: [],
};

export function StepEditorialBrief({
  draft,
  onUpdateBrief,
  onUpdateConcept,
  onSkip,
}: StepEditorialBriefProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [concept, setConcept] = useState(draft.productConcept || '');
  const [knowledgeContext, setKnowledgeContext] = useState<KnowledgeContext>(EMPTY_CONTEXT);

  const handleConceptChange = (value: string) => {
    setConcept(value);
    onUpdateConcept(value);
  };

  const generateEditorial = async () => {
    if (!concept.trim()) {
      setError('Please enter a product concept first');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('creative-studio-editorial', {
        body: {
          concept,
          brandBook: draft.brandBook,
          mascot: draft.selectedMascot?.displayName,
          mascotPersonality: draft.selectedMascot?.personality,
          productType: draft.selectedProduct?.type,
          placement: draft.selectedProduct?.placement,
          colorLine: draft.colorLine,
          // Phase 2: Send knowledge context to AI
          knowledgeContext: {
            selectedScene: knowledgeContext.selectedScene,
            artists: knowledgeContext.artists,
            gear: knowledgeContext.gear,
          },
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.editorial) {
        onUpdateBrief(data.editorial);
      } else {
        throw new Error('No editorial content received');
      }
    } catch (err) {
      console.error('Editorial generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate editorial');
    } finally {
      setIsGenerating(false);
    }
  };

  const hasEditorial = !!draft.editorialBrief?.productName;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-mono font-bold text-foreground mb-2">
            Editorial Brief
          </h2>
          <p className="text-sm text-muted-foreground">
            Describe your product concept and let AI generate the editorial copy using 
            your brand guidelines, Technopedia context, and scene inspiration.
          </p>
        </div>
        
        {/* Skip button for simple products */}
        {onSkip && (
          <Button
            variant="outline"
            onClick={onSkip}
            className="flex-shrink-0 border-dashed"
          >
            <SkipForward className="w-4 h-4 mr-2" />
            Skip to Preview
          </Button>
        )}
      </div>

      {/* Two-column layout for larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Product Concept Input */}
        <Card className="p-5">
          <Label htmlFor="concept" className="text-sm font-mono uppercase tracking-wide">
            Product Concept
          </Label>
          <Textarea
            id="concept"
            placeholder="Describe your product idea... (e.g., 'Berlin winter hoodie for late-night ravers, minimal design with subtle acid house reference')"
            value={concept}
            onChange={(e) => handleConceptChange(e.target.value)}
            className="mt-2 min-h-[120px] font-mono text-sm"
          />
          
          {/* Context summary */}
          <div className="mt-4 p-3 bg-muted/30 rounded text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Brand:</span>
              <span className="font-mono text-foreground">{draft.brandBook}</span>
            </div>
            {draft.colorLine && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Color:</span>
                <span className="font-mono text-foreground">
                  {draft.colorLine === 'green-line' ? 'Green Line' : 'White Line'}
                </span>
              </div>
            )}
            {draft.selectedMascot && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Mascot:</span>
                <span className="font-mono text-foreground">{draft.selectedMascot.displayName}</span>
              </div>
            )}
            {draft.selectedProduct && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Product:</span>
                <span className="font-mono text-foreground">{draft.selectedProduct.type}</span>
              </div>
            )}
            {knowledgeContext.selectedScene && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Scene:</span>
                <span className="font-mono text-primary">
                  {knowledgeContext.selectedScene.replace('-', ' ')}
                </span>
              </div>
            )}
          </div>

          <Button
            onClick={generateEditorial}
            disabled={isGenerating || !concept.trim()}
            className="mt-4 w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Editorial...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Editorial Brief
              </>
            )}
          </Button>
        </Card>

        {/* Right: Knowledge Base Panel (Phase 2) */}
        <KnowledgeBasePanel
          onContextChange={setKnowledgeContext}
          context={knowledgeContext}
          brandBook={draft.brandBook}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Generated Editorial Display */}
      {hasEditorial && draft.editorialBrief && (
        <Card className="p-5 border-primary/30 bg-primary/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span className="font-mono text-sm uppercase text-primary">Generated Editorial</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={generateEditorial}
              disabled={isGenerating}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-[10px] uppercase text-muted-foreground">Product Name</Label>
              <Input
                value={draft.editorialBrief.productName}
                onChange={(e) => onUpdateBrief({ ...draft.editorialBrief!, productName: e.target.value })}
                className="mt-1 font-mono"
              />
            </div>

            <div>
              <Label className="text-[10px] uppercase text-muted-foreground">Tagline</Label>
              <Input
                value={draft.editorialBrief.tagline}
                onChange={(e) => onUpdateBrief({ ...draft.editorialBrief!, tagline: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-[10px] uppercase text-muted-foreground">Description</Label>
              <Textarea
                value={draft.editorialBrief.description}
                onChange={(e) => onUpdateBrief({ ...draft.editorialBrief!, description: e.target.value })}
                className="mt-1 min-h-[80px]"
              />
            </div>

            <div>
              <Label className="text-[10px] uppercase text-muted-foreground">Creative Rationale</Label>
              <Textarea
                value={draft.editorialBrief.creativeRationale}
                onChange={(e) => onUpdateBrief({ ...draft.editorialBrief!, creativeRationale: e.target.value })}
                className="mt-1 min-h-[80px] text-sm italic"
              />
            </div>

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
    </div>
  );
}

export default StepEditorialBrief;
