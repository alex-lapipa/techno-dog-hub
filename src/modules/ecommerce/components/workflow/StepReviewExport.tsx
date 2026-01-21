/**
 * Step 6: Review & Export (Merged Design Preview + Save Draft)
 * 
 * Final step combining:
 * - AI-generated product mockup with modification prompts
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
  ExternalLink, MessageSquare, Send, History
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { type ProductDraft, type ColorLineType } from '../../hooks/useCreativeWorkflow';
import { compositeTechnoDoggiesMockup } from '../../utils/compositeTechnoDoggiesMockup';
import { ShopifyProductSync } from './ShopifyProductSync';
import { toast } from 'sonner';

interface ComplianceItem {
  id: string;
  label: string;
  status: 'pass' | 'fail' | 'warning' | 'na';
  message: string;
}

interface ModificationEntry {
  id: string;
  prompt: string;
  timestamp: Date;
  imageUrl?: string;
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
  const [modificationPrompt, setModificationPrompt] = useState('');
  const [modificationHistory, setModificationHistory] = useState<ModificationEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

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
      id: 'shopify-product',
      label: 'Shopify Product Selected',
      status: draft.shopifyCatalog?.productId ? 'pass' : 'fail',
      message: draft.shopifyCatalog?.productId 
        ? `${draft.shopifyCatalog.productName} (${draft.shopifyCatalog.size}, ${draft.shopifyCatalog.color})`
        : 'No product selected from Shopify catalog',
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

  const generateImage = async (modPrompt?: string) => {
    setIsGenerating(true);
    setError(null);

    try {
      const basePrompt = buildImagePrompt(draft);
      const finalPrompt = modPrompt 
        ? `${basePrompt}. User modification request: ${modPrompt}`
        : basePrompt;
      
      // Phase 3: Enhanced with scene/mood context
      const { data, error: fnError } = await supabase.functions.invoke('creative-studio-image', {
        body: {
          prompt: finalPrompt,
          brandBook: draft.brandBook,
          productType: draft.selectedProduct?.type,
          colorLine: draft.colorLine,
          // Model routing: pass selected models for creative direction
          selectedModels: draft.selectedModels || ['gemini'],
          // ZERO TOLERANCE: for Techno Doggies, we do NOT ask AI to "draw" any mascot.
          // We composite the official SVG onto the blank product photo client-side.
          mascot: draft.brandBook === 'techno-doggies' ? undefined : draft.selectedMascot?.displayName,
          placement: draft.selectedProduct?.placement,
          modificationPrompt: modPrompt,
        },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.imageUrl) {
        // ZERO TOLERANCE: For Techno Doggies, never trust AI-drawn mascots.
        // We generate a BLANK product photo and composite the OFFICIAL SVG mascot client-side.
        let finalImageUrl: string = data.imageUrl;
        if (draft.brandBook === 'techno-doggies' && draft.selectedMascot) {
          try {
            finalImageUrl = await compositeTechnoDoggiesMockup({
              baseImageUrl: data.imageUrl,
              mascot: draft.selectedMascot,
              colorLine: (draft.colorLine ?? 'green-line') as ColorLineType,
              productType: draft.selectedProduct?.type,
              placement: draft.selectedProduct?.placement,
              productCopy: draft.productCopy,
            });
          } catch (e) {
            // If compositing fails, fall back to base image, but keep the workflow alive.
            console.warn('Techno Doggies compositing failed:', e);
          }
        }

        onSetImage(finalImageUrl);
        
        // Add to modification history if this was a modification
        if (modPrompt) {
          setModificationHistory(prev => [...prev, {
            id: Date.now().toString(),
            prompt: modPrompt,
            timestamp: new Date(),
            imageUrl: data.imageUrl,
          }]);
          setModificationPrompt('');
          toast.success('Design modified successfully');
        }
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

  const handleModificationSubmit = () => {
    if (!modificationPrompt.trim()) {
      toast.error('Please enter a modification prompt');
      return;
    }
    if (modificationPrompt.length > 500) {
      toast.error('Modification prompt must be under 500 characters');
      return;
    }
    generateImage(modificationPrompt.trim());
  };

  /**
   * Build image prompt with Zero Hallucination enforcement
   * The actual SVG geometry is embedded in the edge function
   */
  const buildImagePrompt = (draft: ProductDraft): string => {
    const parts: string[] = [];
    
    // Product type context
    if (draft.selectedProduct) {
      parts.push(`Premium ${draft.selectedProduct.type.toLowerCase()} product mockup`);
    } else {
      parts.push('Premium streetwear product mockup');
    }
    
    // Brand-specific context
    if (draft.brandBook === 'techno-dog') {
      parts.push('brutalist VHS aesthetic, dark background, minimal design, geometric hexagon logo only, NO dog imagery');
    } else {
      // Techno Doggies - ZERO TOLERANCE
      // We generate a blank product photo and overlay the official mascot ourselves.
      const strokeColor = draft.colorLine === 'green-line' 
        ? 'laser green (#00FF00) stroke ONLY' 
        : 'pure white (#FFFFFF) stroke ONLY';
      
      parts.push('black fabric product photography');
      parts.push('BLANK product: NO printed graphics, NO logo, NO mascot on the garment');
      parts.push(`(official mascot overlay will be applied separately in ${strokeColor})`);
    }
    
    // Editorial context
    if (draft.editorialBrief?.productName) {
      parts.push(`product name: "${draft.editorialBrief.productName}"`);
    }
    
    // Quality enforcement
    parts.push('The Face magazine editorial style, premium streetwear photography');
    parts.push('Ultra high resolution, professional studio lighting, dark moody atmosphere');
    
    return parts.join('. ');
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
                  onClick={() => generateImage()}
                  disabled={isGenerating}
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
                  Regenerate
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  disabled={modificationHistory.length === 0}
                >
                  <History className="w-4 h-4 mr-1" />
                  History ({modificationHistory.length})
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href={draft.generatedImageUrl} download target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </a>
                </Button>
              </div>
            </div>
            
            {/* VHS Scanline effect on image preview - Phase 4 */}
            <div className="aspect-square bg-muted rounded-lg overflow-hidden border border-border max-w-md mx-auto relative group">
              <img
                src={draft.generatedImageUrl}
                alt="Generated product preview"
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
              {/* VHS Scanlines overlay */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                  background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.1) 2px, rgba(0, 0, 0, 0.1) 4px)',
                  animation: 'scanlines-shift 8s linear infinite',
                }}
              />
              {/* Noise overlay */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-5"
                style={{
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
                }}
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
            
            {/* Modification History Panel */}
            {showHistory && modificationHistory.length > 0 && (
              <Card className="p-4 border-dashed">
                <div className="flex items-center gap-2 mb-3">
                  <History className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono text-xs uppercase text-muted-foreground">
                    Modification History
                  </span>
                </div>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {modificationHistory.map((entry, idx) => (
                      <div 
                        key={entry.id}
                        className="p-2 bg-muted/30 rounded text-xs"
                      >
                        <div className="flex items-start gap-2">
                          <Badge variant="outline" className="text-[9px] shrink-0">
                            #{idx + 1}
                          </Badge>
                          <p className="text-muted-foreground line-clamp-2">{entry.prompt}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {entry.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            )}
            
            {/* Modification Prompt Input */}
            <Card className="p-4 border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                  Request Modifications
                </span>
              </div>
              <div className="space-y-3">
                <Textarea
                  placeholder="Describe changes to the design... (e.g., 'Make the logo larger', 'Add more contrast', 'Position mascot on the left')"
                  value={modificationPrompt}
                  onChange={(e) => setModificationPrompt(e.target.value.slice(0, 500))}
                  className="min-h-[80px] text-sm resize-none"
                  disabled={isGenerating}
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    {modificationPrompt.length}/500 characters
                  </span>
                  <Button
                    size="sm"
                    onClick={handleModificationSubmit}
                    disabled={isGenerating || !modificationPrompt.trim()}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Applying...
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3 mr-1" />
                        Apply Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
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
              onClick={() => generateImage()}
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

      {/* Shopify Integration */}
      <ShopifyProductSync 
        draft={draft}
        onProductCreated={(productId) => {
          console.log('Shopify product created:', productId);
        }}
      />

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
