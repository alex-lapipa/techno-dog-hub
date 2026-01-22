/**
 * Step 1: Create Product - Brand Book Selection + Visual Assets
 * 
 * Redesigned step allowing users to:
 * 1. Select brand identity (techno.dog or Techno Doggies)
 * 2. Browse and select key visuals from each brand book
 * 3. Upload custom images or paste image URLs
 */

import { useState, useCallback } from 'react';
import { 
  Hexagon, 
  Dog, 
  Upload, 
  Link2, 
  Image as ImageIcon, 
  X, 
  Check,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { type BrandBookType } from '../../hooks/useBrandBookGuidelines';

// ============================================================================
// BRAND BOOK DATA
// ============================================================================

const BRAND_OPTIONS = [
  {
    id: 'techno-dog' as BrandBookType,
    name: 'techno.dog',
    description: 'VHS/Brutalist aesthetic. Dark backgrounds, minimal design, geometric hexagon logo.',
    icon: Hexagon,
    style: 'Industrial / Underground',
    colorScheme: 'Crimson + Black',
    accentColor: 'crimson',
  },
  {
    id: 'techno-doggies' as BrandBookType,
    name: 'Techno Doggies',
    description: '8 core mascot variants. Stroke-only graphics on black fabric.',
    icon: Dog,
    style: 'Streetwear / Editorial',
    colorScheme: 'Green Line + White Line',
    accentColor: 'logo-green',
  },
];

// techno.dog brand visuals
const TECHNO_DOG_VISUALS = [
  { 
    id: 'hexagon-logo', 
    name: 'Hexagon Logo', 
    type: 'logo',
    description: 'Primary geometric logo mark',
    preview: null, // Will use icon
  },
  { 
    id: 'vhs-texture', 
    name: 'VHS Texture', 
    type: 'texture',
    description: 'Nostalgic film grain overlay',
    preview: null,
  },
  { 
    id: 'scanlines', 
    name: 'Scanlines', 
    type: 'effect',
    description: 'CRT monitor effect',
    preview: null,
  },
  { 
    id: 'glitch-effect', 
    name: 'Glitch Effect', 
    type: 'effect',
    description: 'Chromatic aberration styling',
    preview: null,
  },
];

// Techno Doggies mascots (from design-system-doggies.json)
const TECHNO_DOGGIES_MASCOTS = [
  { id: 'dj-dog', name: 'DJ Dog', personality: 'The selector, dropping beats', quote: 'The kick is the heartbeat.' },
  { id: 'ninja-dog', name: 'Ninja Dog', personality: 'Silent warrior of the night', quote: 'Move in silence.' },
  { id: 'space-dog', name: 'Space Dog', personality: 'Cosmic explorer of sound', quote: 'Beyond the stars.' },
  { id: 'grumpy-dog', name: 'Grumpy Dog', personality: 'The cynical veteran', quote: 'Back in my day...' },
  { id: 'happy-dog', name: 'Happy Dog', personality: 'Pure positive energy', quote: 'Every beat is a blessing!' },
  { id: 'techno-dog', name: 'Techno Dog', personality: 'Glitched out & digital', quote: '01001011 01001001 01000011 01001011' },
  { id: 'dancing-dog', name: 'Dancing Dog', personality: 'Always moving', quote: 'The floor is life.' },
  { id: 'acid-dog', name: 'Acid Dog', personality: 'Deep repetitive vibes', quote: 'Surrender to the squelch.' },
];

// ============================================================================
// TYPES
// ============================================================================

interface UploadedAsset {
  id: string;
  name: string;
  url: string;
  type: 'upload' | 'url';
  size?: number;
}

interface StepCreateProductProps {
  selectedBrand: BrandBookType;
  onSelectBrand: (brand: BrandBookType) => void;
  selectedVisuals: string[];
  onSelectVisual: (visualId: string) => void;
  uploadedAssets: UploadedAsset[];
  onUploadAsset: (asset: UploadedAsset) => void;
  onRemoveAsset: (assetId: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function StepCreateProduct({
  selectedBrand,
  onSelectBrand,
  selectedVisuals,
  onSelectVisual,
  uploadedAssets,
  onUploadAsset,
  onRemoveAsset,
}: StepCreateProductProps) {
  const [activeTab, setActiveTab] = useState<'brand-visuals' | 'upload'>('brand-visuals');
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Get visuals based on selected brand
  const brandVisuals = selectedBrand === 'techno-dog' 
    ? TECHNO_DOG_VISUALS 
    : TECHNO_DOGGIES_MASCOTS;

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setUploadError(null);

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setUploadError('Only image files are allowed');
          continue;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setUploadError('File size must be under 10MB');
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `creative-studio/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('media-assets')
          .upload(fileName, file);

        if (error) {
          console.error('Upload error:', error);
          setUploadError('Failed to upload image');
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('media-assets')
          .getPublicUrl(fileName);

        onUploadAsset({
          id: `upload-${Date.now()}`,
          name: file.name,
          url: urlData.publicUrl,
          type: 'upload',
          size: file.size,
        });
      }
    } catch (err) {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [onUploadAsset]);

  // Handle URL paste
  const handleAddUrl = useCallback(() => {
    if (!urlInput.trim()) return;

    // Basic URL validation
    try {
      new URL(urlInput);
    } catch {
      setUploadError('Please enter a valid URL');
      return;
    }

    onUploadAsset({
      id: `url-${Date.now()}`,
      name: urlInput.split('/').pop() || 'Image',
      url: urlInput,
      type: 'url',
    });

    setUrlInput('');
    setUploadError(null);
  }, [urlInput, onUploadAsset]);

  // Format file size
  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-mono font-bold text-foreground uppercase tracking-wide mb-2">
          Create New Product
        </h2>
        <p className="text-sm text-muted-foreground">
          Select your brand identity and choose key visuals for your product design.
        </p>
      </div>

      {/* Brand Selection */}
      <section className="space-y-4">
        <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          Brand Identity
        </Label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BRAND_OPTIONS.map((brand) => {
            const isSelected = selectedBrand === brand.id;
            const Icon = brand.icon;
            
            return (
              <Card
                key={brand.id}
                onClick={() => onSelectBrand(brand.id)}
                className={cn(
                  "relative p-5 cursor-pointer transition-all",
                  "hover:border-primary/50",
                  isSelected && brand.id === 'techno-dog' && "border-crimson bg-crimson/10 ring-2 ring-crimson/30",
                  isSelected && brand.id === 'techno-doggies' && "border-logo-green bg-logo-green/10 ring-2 ring-logo-green/30"
                )}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <Check className={cn(
                      "w-5 h-5",
                      brand.id === 'techno-dog' ? "text-crimson" : "text-logo-green"
                    )} />
                  </div>
                )}
                
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
                    isSelected 
                      ? brand.id === 'techno-dog' ? "bg-crimson/20" : "bg-logo-green/20"
                      : "bg-muted"
                  )}>
                    <Icon className={cn(
                      "w-6 h-6",
                      isSelected 
                        ? brand.id === 'techno-dog' ? "text-crimson" : "text-logo-green"
                        : "text-muted-foreground"
                    )} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={cn(
                      "font-mono font-bold text-sm uppercase tracking-wide",
                      brand.id === 'techno-dog' && "lowercase"
                    )}>
                      {brand.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {brand.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {brand.style}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Visual Assets Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Visual Assets
          </Label>
          <Badge variant="secondary" className="font-mono text-[10px]">
            {selectedVisuals.length + uploadedAssets.length} selected
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="brand-visuals" className="font-mono text-xs uppercase">
              <ImageIcon className="w-4 h-4 mr-2" />
              Brand Book
            </TabsTrigger>
            <TabsTrigger value="upload" className="font-mono text-xs uppercase">
              <Upload className="w-4 h-4 mr-2" />
              Upload / URL
            </TabsTrigger>
          </TabsList>

          {/* Brand Visuals Tab */}
          <TabsContent value="brand-visuals" className="mt-4">
            <Card className="p-4">
              <ScrollArea className="h-[320px]">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pr-4">
                  {brandVisuals.map((visual) => {
                    const isSelected = selectedVisuals.includes(visual.id);
                    const isMascot = 'personality' in visual;
                    
                    return (
                      <Card
                        key={visual.id}
                        onClick={() => onSelectVisual(visual.id)}
                        className={cn(
                          "p-3 cursor-pointer transition-all border-2 hover:scale-[1.02]",
                          isSelected 
                            ? selectedBrand === 'techno-dog'
                              ? "border-crimson bg-crimson/10"
                              : "border-logo-green bg-logo-green/10"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex flex-col items-center text-center gap-2">
                          {/* Visual preview */}
                          <div className={cn(
                            "w-14 h-14 rounded-lg flex items-center justify-center",
                            selectedBrand === 'techno-dog' ? "bg-crimson/10" : "bg-logo-green/10"
                          )}>
                            {isMascot ? (
                              <Dog className={cn(
                                "w-8 h-8",
                                isSelected ? "text-logo-green" : "text-muted-foreground"
                              )} />
                            ) : (
                              <Hexagon className={cn(
                                "w-8 h-8",
                                isSelected ? "text-crimson" : "text-muted-foreground"
                              )} />
                            )}
                          </div>
                          
                          {/* Name */}
                          <p className="font-mono font-bold text-xs uppercase line-clamp-1">
                            {visual.name}
                          </p>
                          
                          {/* Personality/Description */}
                          <p className="text-[10px] text-muted-foreground line-clamp-2">
                            {isMascot ? (visual as typeof TECHNO_DOGGIES_MASCOTS[0]).personality : (visual as typeof TECHNO_DOG_VISUALS[0]).description}
                          </p>
                          
                          {/* Selection indicator */}
                          {isSelected && (
                            <Check className={cn(
                              "w-4 h-4 absolute top-2 right-2",
                              selectedBrand === 'techno-dog' ? "text-crimson" : "text-logo-green"
                            )} />
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
              
              {/* Brand-specific reminder */}
              <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border/50">
                <p className="text-xs text-muted-foreground flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-crimson shrink-0 mt-0.5" />
                  <span>
                    {selectedBrand === 'techno-doggies' 
                      ? 'Only official mascot SVGs from DogPack.tsx are allowed. Zero tolerance for AI-generated variants.'
                      : 'Use VHS/brutalist aesthetic. Dark backgrounds, geometric shapes, no mascot imagery.'}
                  </span>
                </p>
              </div>
            </Card>
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload" className="mt-4 space-y-4">
            {/* Drag & Drop Zone */}
            <Card 
              className={cn(
                "p-8 border-2 border-dashed transition-colors cursor-pointer",
                "hover:border-primary/50 hover:bg-muted/20"
              )}
              onClick={() => document.getElementById('file-upload')?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileUpload(e.dataTransfer.files);
              }}
            >
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              
              <div className="flex flex-col items-center gap-3 text-center">
                {isUploading ? (
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                ) : (
                  <Upload className="w-10 h-10 text-muted-foreground" />
                )}
                <div>
                  <p className="font-mono font-bold text-sm uppercase">
                    {isUploading ? 'Uploading...' : 'Drop images here'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or click to browse • PNG, JPG, WebP up to 10MB
                  </p>
                </div>
              </div>
            </Card>

            {/* URL Input */}
            <div className="space-y-2">
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Or paste image URL
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
                    className="pl-10 font-mono text-sm"
                  />
                </div>
                <Button onClick={handleAddUrl} variant="outline" className="font-mono uppercase text-xs">
                  Add
                </Button>
              </div>
            </div>

            {/* Error Message */}
            {uploadError && (
              <p className="text-xs text-destructive flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {uploadError}
              </p>
            )}

            {/* Uploaded Assets List */}
            {uploadedAssets.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Uploaded Assets ({uploadedAssets.length})
                </Label>
                <div className="space-y-2">
                  {uploadedAssets.map((asset) => (
                    <Card key={asset.id} className="p-3 flex items-center gap-3">
                      {/* Thumbnail */}
                      <div className="w-12 h-12 rounded bg-muted shrink-0 overflow-hidden">
                        <img 
                          src={asset.url} 
                          alt={asset.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm truncate">{asset.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-[10px]">
                            {asset.type === 'upload' ? 'Uploaded' : 'URL'}
                          </Badge>
                          {asset.size && (
                            <span>{formatSize(asset.size)}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Remove button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => onRemoveAsset(asset.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      {/* Summary */}
      <Card className="p-4 bg-muted/20 border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono font-bold text-sm uppercase">Selection Summary</p>
            <p className="text-xs text-muted-foreground mt-1">
              Brand: <span className={cn(
                "font-bold",
                selectedBrand === 'techno-dog' ? "text-crimson" : "text-logo-green"
              )}>
                {selectedBrand === 'techno-dog' ? 'techno.dog' : 'Techno Doggies'}
              </span>
              {' '} • Visuals: {selectedVisuals.length} • Uploads: {uploadedAssets.length}
            </p>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "font-mono text-xs",
              selectedVisuals.length > 0 || uploadedAssets.length > 0 
                ? "border-logo-green text-logo-green" 
                : "border-muted-foreground"
            )}
          >
            {selectedVisuals.length + uploadedAssets.length > 0 ? 'Ready' : 'Select visuals'}
          </Badge>
        </div>
      </Card>
    </div>
  );
}

export default StepCreateProduct;
