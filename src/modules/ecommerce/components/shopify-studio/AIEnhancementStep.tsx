/**
 * AI Enhancement Step - RAG-powered copy and mockup generation
 * 
 * SHOPIFY-FIRST: Generated content maps to Shopify product fields.
 * Uses Technopedia knowledge base for authentic underground techno copy.
 */

import { useState, useCallback } from 'react';
import { Sparkles, Zap, BookOpen, RefreshCw, Check, Copy, Image, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { StudioDraft } from '../../hooks/useShopifyStudio';
import { KnowledgeBasePanel, SCENE_PRESETS, type KnowledgeContext } from '../workflow/KnowledgeBasePanel';

interface AIEnhancementStepProps {
  draft: StudioDraft;
  onUpdateDraft: (updates: Partial<StudioDraft>) => void;
  onSetAICopy: (copy: StudioDraft['aiCopy']) => void;
  onAddMockupUrl: (url: string) => void;
}

const INITIAL_CONTEXT: KnowledgeContext = {
  artists: [],
  gear: [],
  venues: [],
  labels: [],
  customKeywords: [],
};

export function AIEnhancementStep({
  draft,
  onUpdateDraft,
  onSetAICopy,
  onAddMockupUrl,
}: AIEnhancementStepProps) {
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [isGeneratingMockup, setIsGeneratingMockup] = useState(false);
  const [ragContext, setRagContext] = useState<KnowledgeContext>(() => {
    if (draft.ragContext) {
      return {
        artists: draft.ragContext.artists || [],
        gear: draft.ragContext.gear || [],
        venues: [],
        labels: [],
        selectedScene: draft.ragContext.scenePreset as KnowledgeContext['selectedScene'],
        customKeywords: [],
      };
    }
    return INITIAL_CONTEXT;
  });
  const [generatedCopy, setGeneratedCopy] = useState(draft.aiCopy || {
    title: '',
    description: '',
    seoTitle: '',
    seoDescription: '',
    tagline: '',
  });

  // Update RAG context and persist to draft
  const handleContextChange = useCallback((context: KnowledgeContext) => {
    setRagContext(context);
    onUpdateDraft({ ragContext: context as any });
  }, [onUpdateDraft]);

  // Generate product copy using edge function
  const generateCopy = useCallback(async () => {
    setIsGeneratingCopy(true);
    try {
      const { data, error } = await supabase.functions.invoke('creative-studio-editorial', {
        body: {
          productTitle: draft.title,
          productType: draft.productType,
          mascotName: draft.mascotName,
          colorLine: draft.colorLine,
          brandBook: draft.brandBook,
          knowledgeContext: ragContext,
          selectedModels: ['google/gemini-2.5-flash'],
        },
      });

      if (error) throw error;

      if (data?.editorial) {
        const copy = {
          title: data.editorial.productName || draft.title,
          description: data.editorial.description || '',
          seoTitle: data.editorial.seoTitle || '',
          seoDescription: data.editorial.seoDescription || '',
          tagline: data.editorial.tagline || '',
        };
        setGeneratedCopy(copy);
        onSetAICopy(copy);
        toast.success('Product copy generated!');
      }
    } catch (err) {
      console.error('[AIEnhancement] Copy generation failed:', err);
      toast.error('Failed to generate copy');
    } finally {
      setIsGeneratingCopy(false);
    }
  }, [draft, ragContext, onSetAICopy]);

  // Generate product mockup using edge function
  const generateMockup = useCallback(async () => {
    setIsGeneratingMockup(true);
    try {
      const scenePreset = ragContext.selectedScene 
        ? SCENE_PRESETS.find(s => s.id === ragContext.selectedScene)?.label 
        : null;

      const { data, error } = await supabase.functions.invoke('creative-studio-image', {
        body: {
          productType: draft.productType,
          mascotName: draft.mascotName,
          colorLine: draft.colorLine,
          brandBook: draft.brandBook,
          scenePreset: scenePreset,
          selectedModels: ['google/gemini-2.5-flash'],
        },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        onAddMockupUrl(data.imageUrl);
        toast.success('Mockup generated!');
      }
    } catch (err) {
      console.error('[AIEnhancement] Mockup generation failed:', err);
      toast.error('Failed to generate mockup');
    } finally {
      setIsGeneratingMockup(false);
    }
  }, [draft, ragContext, onAddMockupUrl]);

  // Copy to clipboard
  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  }, []);

  return (
    <div className="flex h-full">
      {/* Left: RAG Knowledge Panel */}
      <div className="w-80 border-r border-border">
        <KnowledgeBasePanel
          context={ragContext}
          onContextChange={handleContextChange}
          brandBook={draft.brandBook}
        />
      </div>

      {/* Right: Generation Controls & Output */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-mono font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI Enhancement
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Generate authentic underground copy using Technopedia
              </p>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              {draft.brandBook === 'techno-doggies' ? 'Doggies Brand' : 'techno.dog'}
            </Badge>
          </div>

          {/* Generation Tabs */}
          <Tabs defaultValue="copy" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="copy" className="gap-2">
                <FileText className="w-4 h-4" />
                Product Copy
              </TabsTrigger>
              <TabsTrigger value="mockups" className="gap-2">
                <Image className="w-4 h-4" />
                Mockups
              </TabsTrigger>
            </TabsList>

            {/* Copy Tab */}
            <TabsContent value="copy" className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-mono">
                  Context: {ragContext.artists.length} artists, {ragContext.gear.length} gear
                </span>
                <Button
                  onClick={generateCopy}
                  disabled={isGeneratingCopy}
                  className="gap-2"
                >
                  {isGeneratingCopy ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Generate Copy
                    </>
                  )}
                </Button>
              </div>

              {/* Generated Copy Fields */}
              <Card className="p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Product Title</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedCopy.title || '', 'Title')}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <Input
                    value={generatedCopy.title || ''}
                    onChange={(e) => {
                      const updated = { ...generatedCopy, title: e.target.value };
                      setGeneratedCopy(updated);
                      onSetAICopy(updated);
                    }}
                    placeholder="AI will generate..."
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Tagline</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedCopy.tagline || '', 'Tagline')}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <Input
                    value={generatedCopy.tagline || ''}
                    onChange={(e) => {
                      const updated = { ...generatedCopy, tagline: e.target.value };
                      setGeneratedCopy(updated);
                      onSetAICopy(updated);
                    }}
                    placeholder="AI will generate..."
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Description (HTML)</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedCopy.description || '', 'Description')}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <Textarea
                    value={generatedCopy.description || ''}
                    onChange={(e) => {
                      const updated = { ...generatedCopy, description: e.target.value };
                      setGeneratedCopy(updated);
                      onSetAICopy(updated);
                    }}
                    placeholder="AI will generate Shopify body_html..."
                    rows={4}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SEO Title</Label>
                    <Input
                      value={generatedCopy.seoTitle || ''}
                      onChange={(e) => {
                        const updated = { ...generatedCopy, seoTitle: e.target.value };
                        setGeneratedCopy(updated);
                        onSetAICopy(updated);
                      }}
                      placeholder="Max 60 chars"
                      maxLength={60}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SEO Description</Label>
                    <Input
                      value={generatedCopy.seoDescription || ''}
                      onChange={(e) => {
                        const updated = { ...generatedCopy, seoDescription: e.target.value };
                        setGeneratedCopy(updated);
                        onSetAICopy(updated);
                      }}
                      placeholder="Max 160 chars"
                      maxLength={160}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Mockups Tab */}
            <TabsContent value="mockups" className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-mono">
                  Generated mockups: {draft.aiMockupUrls.length}
                </span>
                <Button
                  onClick={generateMockup}
                  disabled={isGeneratingMockup || !draft.mascotId}
                  className="gap-2"
                >
                  {isGeneratingMockup ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Image className="w-4 h-4" />
                      Generate Mockup
                    </>
                  )}
                </Button>
              </div>

              {!draft.mascotId && (
                <Card className="p-4 bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground">
                    Select a mascot in Brand Design step to generate mockups
                  </p>
                </Card>
              )}

              {draft.aiMockupUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {draft.aiMockupUrls.map((url, idx) => (
                    <Card key={idx} className="overflow-hidden">
                      <img 
                        src={url} 
                        alt={`Mockup ${idx + 1}`}
                        className="w-full h-48 object-cover"
                      />
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default AIEnhancementStep;
