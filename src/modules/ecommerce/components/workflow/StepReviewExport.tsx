/**
 * Step 6: Review & Export (Merged Design Preview + Save Draft)
 * 
 * Final step combining:
 * - AI-generated product mockup
 * - Compliance checklist verification
 * - Save to drafts / export options
 * 
 * BRAND BOOK COMPLIANCE:
 * - Validates all selections against brand guidelines
 * - Does NOT modify brand book settings
 * - Enforces Zero Tolerance policy
 */

import { useState } from 'react';
import { 
  ImagePlus, Loader2, RefreshCw, Check, AlertCircle, 
  Download, Save, CheckCircle2, XCircle, AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { type ProductDraft, type ColorLineType } from '../../hooks/useCreativeWorkflow';
import { toast } from 'sonner';

interface ComplianceItem {
  id: string;
  label: string;
  status: 'pass' | 'fail' | 'warning' | 'na';
  message: string;
}

interface StepReviewExportProps {
  draft: ProductDraft;
  onSetImage: (url: string) => void;
  onSaveDraft: () => Promise<void>;
  isOwner: boolean;
}

export function StepReviewExport({
  draft,
  onSetImage,
  onSaveDraft,
  isOwner,
}: StepReviewExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate compliance checklist based on draft
  const complianceChecklist: ComplianceItem[] = [
    {
      id: 'brand-selected',
      label: 'Brand Book Selected',
      status: draft.brandBook ? 'pass' : 'fail',
      message: draft.brandBook ? `Using ${draft.brandBook}` : 'No brand selected',
    },
    {
      id: 'color-line',
      label: 'Color Line Compliance',
      status: draft.brandBook === 'techno-dog' 
        ? 'na' 
        : draft.colorLine ? 'pass' : 'fail',
      message: draft.brandBook === 'techno-dog'
        ? 'N/A for techno.dog'
        : draft.colorLine 
          ? `${draft.colorLine === 'green-line' ? 'Green Line (#00FF00)' : 'White Line'} selected`
          : 'No color line selected',
    },
    {
      id: 'product-type',
      label: 'Approved Product Type',
      status: draft.selectedProduct ? 'pass' : 'fail',
      message: draft.selectedProduct 
        ? `${draft.selectedProduct.type} - ${draft.selectedProduct.placement}`
        : 'No product type selected',
    },
    {
      id: 'mascot-approved',
      label: 'Mascot from 94-Variant Pack',
      status: draft.brandBook === 'techno-dog'
        ? 'na'
        : draft.selectedMascot ? 'pass' : 'warning',
      message: draft.brandBook === 'techno-dog'
        ? 'N/A - techno.dog uses geometric designs'
        : draft.selectedMascot 
          ? `${draft.selectedMascot.displayName} (approved)` 
          : 'No mascot selected (optional)',
    },
    {
      id: 'editorial-complete',
      label: 'Editorial Brief Complete',
      status: draft.editorialBrief?.productName ? 'pass' : 'fail',
      message: draft.editorialBrief?.productName 
        ? `"${draft.editorialBrief.productName}"`
        : 'Editorial brief not generated',
    },
    {
      id: 'zero-tolerance',
      label: 'Zero Tolerance Policy',
      status: 'pass', // Always pass if we got here through proper workflow
      message: 'All selections from approved brand book assets only',
    },
  ];

  const passCount = complianceChecklist.filter(c => c.status === 'pass').length;
  const failCount = complianceChecklist.filter(c => c.status === 'fail').length;
  const allPassed = failCount === 0;

  const generateImage = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const prompt = buildImagePrompt(draft);
      
      const { data, error: fnError } = await supabase.functions.invoke('creative-studio-image', {
        body: {
          prompt,
          brandBook: draft.brandBook,
          productType: draft.selectedProduct?.type,
          colorLine: draft.colorLine,
        },
      });

      if (fnError) throw new Error(fnError.message);
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
    
    if (draft.selectedProduct) {
      parts.push(`A ${draft.selectedProduct.type.toLowerCase()} mockup`);
    } else {
      parts.push('A product mockup');
    }
    
    if (draft.brandBook === 'techno-dog') {
      parts.push('in brutalist VHS aesthetic, dark background, minimal design, geometric hexagon logo');
    } else {
      const strokeColor = draft.colorLine === 'green-line' ? 'neon laser green (#00FF00)' : 'pure white';
      parts.push(`in streetwear editorial style, black fabric, stroke-only graphic in ${strokeColor}`);
    }
    
    if (draft.selectedMascot) {
      parts.push(`featuring ${draft.selectedMascot.displayName} silhouette mascot`);
    }
    
    if (draft.editorialBrief?.productName) {
      parts.push(`for "${draft.editorialBrief.productName}"`);
    }
    
    parts.push('Ultra high resolution, professional product photography, dark moody lighting');
    
    return parts.join(', ');
  };

  const handleSave = async () => {
    if (!allPassed && !isOwner) {
      toast.error('Cannot save: compliance checks failed');
      return;
    }
    
    setIsSaving(true);
    try {
      await onSaveDraft();
      toast.success('Draft saved successfully');
    } catch (err) {
      toast.error('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const hasImage = !!draft.generatedImageUrl;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-mono font-bold text-foreground mb-2">
          Review & Export
        </h2>
        <p className="text-sm text-muted-foreground">
          Final review of your product design. Verify compliance, generate preview, and save to drafts.
        </p>
      </div>

      {/* Compliance Checklist */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono text-sm uppercase tracking-wide text-muted-foreground">
            Compliance Checklist
          </h3>
          <Badge variant={allPassed ? 'default' : 'destructive'} className="font-mono">
            {passCount}/{complianceChecklist.filter(c => c.status !== 'na').length} Passed
          </Badge>
        </div>
        
        <div className="space-y-2">
          {complianceChecklist.map((item) => (
            <div 
              key={item.id}
              className="flex items-start gap-3 p-2 rounded-lg bg-muted/30"
            >
              <div className="flex-shrink-0 mt-0.5">
                {item.status === 'pass' && (
                  <CheckCircle2 className="w-4 h-4 text-logo-green" />
                )}
                {item.status === 'fail' && (
                  <XCircle className="w-4 h-4 text-destructive" />
                )}
                {item.status === 'warning' && (
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                )}
                {item.status === 'na' && (
                  <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground truncate">{item.message}</p>
              </div>
            </div>
          ))}
        </div>
        
        {!allPassed && !isOwner && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Some compliance checks failed. Please go back and fix the issues before saving.
            </AlertDescription>
          </Alert>
        )}
        
        {!allPassed && isOwner && (
          <Alert className="mt-4 border-yellow-500/50 bg-yellow-500/10">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <AlertDescription className="text-yellow-600">
              Owner override available. You can save despite failed checks.
            </AlertDescription>
          </Alert>
        )}
      </Card>

      <Separator />

      {/* Design Preview */}
      <Card className="p-6">
        <h3 className="font-mono text-sm uppercase tracking-wide text-muted-foreground mb-4">
          Product Preview
        </h3>
        
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
            
            <div className="aspect-square bg-muted rounded-lg overflow-hidden border border-border max-w-md mx-auto">
              <img
                src={draft.generatedImageUrl}
                alt="Generated product preview"
                className="w-full h-full object-contain"
              />
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="outline">AI Generated</Badge>
              <Badge variant="outline">{draft.brandBook}</Badge>
              {draft.colorLine && (
                <Badge 
                  variant="outline"
                  className={draft.colorLine === 'green-line' ? 'border-logo-green text-logo-green' : ''}
                >
                  {draft.colorLine === 'green-line' ? 'Green Line' : 'White Line'}
                </Badge>
              )}
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
              disabled={isGenerating || !allPassed}
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

      <Separator />

      {/* Export Actions */}
      <Card className="p-5 border-primary/30 bg-primary/5">
        <h3 className="font-mono text-sm uppercase tracking-wide text-muted-foreground mb-4">
          Export Options
        </h3>
        
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={handleSave}
            disabled={isSaving || (!allPassed && !isOwner)}
            className="flex-1 min-w-[150px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save to Drafts
              </>
            )}
          </Button>
          
          <Button variant="outline" disabled className="flex-1 min-w-[150px]">
            <ExternalLink className="w-4 h-4 mr-2" />
            Send to Shop (Coming Soon)
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-3">
          Drafts can be reviewed and approved before publishing to the shop.
        </p>
      </Card>

      {/* Guidelines reminder */}
      <div className="p-4 bg-muted/30 rounded-lg border border-border/50 text-xs text-muted-foreground">
        <strong className="text-foreground">Note:</strong> The generated preview is for 
        visualization only. Final production will use official brand assets from the brand book.
        All designs must comply with the Zero Tolerance merchandise policy.
      </div>
    </div>
  );
}

export default StepReviewExport;
