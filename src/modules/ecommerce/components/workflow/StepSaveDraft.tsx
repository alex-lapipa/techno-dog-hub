/**
 * Step 6: Save Draft
 * 
 * Final review and save to drafts collection.
 */

import { useState } from 'react';
import { Save, Loader2, Check, AlertCircle, FileText, Image, Tag, Palette } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { type ProductDraft } from '../../hooks/useCreativeWorkflow';

interface StepSaveDraftProps {
  draft: ProductDraft;
  onSaveDraft: () => Promise<void>;
  isOwner: boolean;
}

export function StepSaveDraft({
  draft,
  onSaveDraft,
  isOwner,
}: StepSaveDraftProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await onSaveDraft();
      setSaved(true);
    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  // Check if draft has minimum required data
  const isComplete = draft.brandBook && 
                    draft.selectedProduct && 
                    draft.editorialBrief?.productName;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-mono font-bold text-foreground mb-2">
          Save to Drafts
        </h2>
        <p className="text-sm text-muted-foreground">
          Review your product design and save it to your drafts collection. 
          You can add pricing and final details from the Drafts page.
        </p>
      </div>

      {/* Draft Summary Card */}
      <Card className="overflow-hidden">
        {/* Header with image */}
        <div className="relative h-48 bg-muted flex items-center justify-center">
          {draft.generatedImageUrl ? (
            <img
              src={draft.generatedImageUrl}
              alt="Product preview"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-center">
              <Image className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No preview generated</p>
            </div>
          )}
          
          {/* Brand badge */}
          <Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur">
            {draft.brandBook}
          </Badge>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Product name */}
          <div>
            <h3 className="font-mono text-xl font-bold">
              {draft.editorialBrief?.productName || 'Untitled Product'}
            </h3>
            {draft.editorialBrief?.tagline && (
              <p className="text-sm text-muted-foreground mt-1">
                {draft.editorialBrief.tagline}
              </p>
            )}
          </div>

          <Separator />

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <Tag className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-muted-foreground text-xs">Product Type</p>
                <p className="font-mono">{draft.selectedProduct?.type || 'Not selected'}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Palette className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-muted-foreground text-xs">Fabric Colors</p>
                <p className="font-mono">
                  {draft.selectedProduct?.fabricColors?.join(', ') || '-'}
                </p>
              </div>
            </div>

            {draft.selectedMascot && (
              <div className="flex items-start gap-2 col-span-2">
                <span className="text-lg">🐕</span>
                <div>
                  <p className="text-muted-foreground text-xs">Mascot</p>
                  <p className="font-mono">{draft.selectedMascot.displayName}</p>
                  <p className="text-xs text-muted-foreground">{draft.selectedMascot.personality}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {draft.editorialBrief?.description && (
            <>
              <Separator />
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Description</p>
                  <p className="text-sm">{draft.editorialBrief.description}</p>
                </div>
              </div>
            </>
          )}

          {/* Creative rationale */}
          {draft.editorialBrief?.creativeRationale && (
            <div className="p-3 bg-muted/30 rounded border border-border/50">
              <p className="text-xs uppercase text-muted-foreground mb-1">Creative Rationale</p>
              <p className="text-sm italic">{draft.editorialBrief.creativeRationale}</p>
            </div>
          )}

          <Separator />

          {/* Status badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {saved ? 'Saved to Drafts' : 'Draft'}
            </Badge>
            {draft.selectedProduct && (
              <Badge variant="outline">{draft.selectedProduct.placement}</Badge>
            )}
            {isOwner && (
              <Badge className="bg-logo-green/10 text-logo-green border-logo-green/30">
                Owner Access
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Validation warnings */}
      {!isComplete && (
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            Please complete all required steps before saving. Missing: 
            {!draft.selectedProduct && ' Product Type,'}
            {!draft.editorialBrief?.productName && ' Editorial Brief'}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Save button */}
      {saved ? (
        <div className="p-6 bg-logo-green/10 rounded-lg border border-logo-green/30 text-center">
          <Check className="w-12 h-12 text-logo-green mx-auto mb-3" />
          <h3 className="font-mono text-lg font-bold text-foreground mb-1">
            Draft Saved Successfully
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your product has been saved to the drafts collection. You can now add pricing 
            and finalize details from the Drafts page.
          </p>
          <Button variant="outline" asChild>
            <a href="/admin/ecommerce/drafts">View Drafts Collection</a>
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleSave}
          disabled={isSaving || !isComplete}
          size="lg"
          className="w-full"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Saving Draft...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Save to Drafts Collection
            </>
          )}
        </Button>
      )}

      {/* Next steps hint */}
      <div className="p-4 bg-muted/30 rounded-lg border border-border/50 text-xs text-muted-foreground">
        <strong className="text-foreground">Next Steps:</strong> After saving, visit the 
        Drafts page to add pricing, select colors, and publish your product to the store.
      </div>
    </div>
  );
}

export default StepSaveDraft;
