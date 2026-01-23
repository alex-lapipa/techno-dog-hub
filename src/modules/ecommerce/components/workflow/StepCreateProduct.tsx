/**
 * Step 1: Create Product - Brand Book Selection + Visual Assets
 * 
 * Redesigned step allowing users to:
 * 1. Select brand identity (techno.dog or Techno Doggies)
 * 2. Browse and select key visuals from each brand book
 * 3. Upload custom images or paste image URLs
 * 
 * Fully wired to:
 * - techno.dog design system (VHS/Brutalist)
 * - Techno Doggies brand book (104 official mascot variants)
 */

import { useState, useCallback, useMemo } from 'react';
import { 
  Hexagon, 
  Upload, 
  Link2, 
  Image as ImageIcon, 
  X, 
  Check,
  Loader2,
  AlertTriangle,
  Search,
  Filter
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
import { dogVariants } from '@/components/DogPack';
import DogSilhouette from '@/components/DogSilhouette';

// ============================================================================
// BRAND BOOK DATA FROM DESIGN SYSTEMS
// ============================================================================

const BRAND_OPTIONS = [
  {
    id: 'techno-dog' as BrandBookType,
    name: 'techno.dog',
    description: 'VHS/Brutalist aesthetic. Dark backgrounds, minimal design, geometric hexagon logo. No mascots.',
    style: 'Industrial / Underground',
    colorScheme: 'Crimson + Black',
    accentColor: 'crimson',
    mascotCount: 0,
  },
  {
    id: 'techno-doggies' as BrandBookType,
    name: 'Techno Doggies',
    description: `${dogVariants.length} official mascot variants. Stroke-only graphics on black fabric. Green Line or White Line.`,
    style: 'Streetwear / Editorial',
    colorScheme: 'Green Line + White Line',
    accentColor: 'logo-green',
    mascotCount: dogVariants.length,
  },
];

// techno.dog brand visuals (VHS aesthetic elements)
const TECHNO_DOG_VISUALS = [
  { 
    id: 'hexagon-logo', 
    name: 'Hexagon Logo', 
    type: 'logo',
    description: 'Primary geometric logo mark',
  },
  { 
    id: 'vhs-texture', 
    name: 'VHS Texture', 
    type: 'texture',
    description: 'Nostalgic film grain overlay',
  },
  { 
    id: 'scanlines', 
    name: 'Scanlines', 
    type: 'effect',
    description: 'CRT monitor effect',
  },
  { 
    id: 'glitch-effect', 
    name: 'Glitch Effect', 
    type: 'effect',
    description: 'Chromatic aberration styling',
  },
  { 
    id: 'film-border', 
    name: 'Film Border', 
    type: 'effect',
    description: 'Film strip edge styling',
  },
  { 
    id: 'noise-grain', 
    name: 'Film Grain', 
    type: 'texture',
    description: 'Subtle noise texture',
  },
];

// Mascot categories for filtering
const MASCOT_CATEGORIES = [
  { id: 'all', name: 'All', count: dogVariants.length },
  { id: 'core', name: 'Core', filter: ['Happy', 'DJ', 'Ninja', 'Space', 'Grumpy', 'Techno', 'Dancing', 'Acid'] },
  { id: 'venues', name: 'Venues', filter: ['Tresor', 'Berghain', 'Bassiani', 'Khidi', 'Concrete', 'De School', 'Fold', 'Fuse', 'Instytut', 'Marble Bar', 'Vent', 'Video Club', 'D-Edge', 'MUTEK', 'Sub Club'] },
  { id: 'seasonal', name: 'Seasonal', filter: ['Christmas', 'Halloween', 'Valentine', 'Spring', 'Summer', 'Autumn', 'Winter', 'New Year', 'Easter', 'Birthday'] },
  { id: 'founders', name: 'Founders', filter: ['Alex', 'Paloma', 'Charlie', 'Dolly', 'Antain', 'La Pipa', 'Ron', 'Julieta', 'Pire', 'Alberto', 'Richard', 'Fran', 'Yayo', 'Helios', 'Jeremias', 'Josin'] },
  { id: 'genre', name: 'Genres', filter: ['Acid', 'Industrial', 'Minimal', 'Dub', 'Gabber', 'Disco', 'Hypnotic', 'Vinyl', 'Synth', 'Modular', 'Analog'] },
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Filter mascots based on search and category
  const filteredMascots = useMemo(() => {
    let filtered = dogVariants;

    // Apply category filter
    if (activeCategory !== 'all') {
      const category = MASCOT_CATEGORIES.find(c => c.id === activeCategory);
      if (category?.filter) {
        filtered = filtered.filter(m => category.filter.includes(m.name));
      }
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(query) || 
        m.personality.toLowerCase().includes(query) ||
        m.status.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [searchQuery, activeCategory]);

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setUploadError(null);

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          setUploadError('Only image files are allowed');
          continue;
        }

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
                    {brand.id === 'techno-dog' ? (
                      <Hexagon className={cn(
                        "w-6 h-6",
                        isSelected ? "text-crimson" : "text-muted-foreground"
                      )} />
                    ) : (
                      <DogSilhouette className={cn(
                        "w-8 h-8",
                        isSelected ? "text-logo-green" : "text-muted-foreground"
                      )} />
                    )}
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
                      {brand.mascotCount > 0 && (
                        <Badge variant="secondary" className="text-[10px] font-mono bg-logo-green/10 text-logo-green">
                          {brand.mascotCount} Doggies
                        </Badge>
                      )}
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
              {selectedBrand === 'techno-doggies' ? (
                <>
                  {/* Search & Filter for Techno Doggies */}
                  <div className="space-y-3 mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search mascots..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 font-mono text-sm"
                      />
                    </div>
                    
                    {/* Category filters */}
                    <div className="flex flex-wrap gap-2">
                      {MASCOT_CATEGORIES.map((cat) => {
                        const count = cat.id === 'all' ? dogVariants.length : cat.filter?.length || 0;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={cn(
                              "px-2 py-1 rounded font-mono text-[10px] uppercase tracking-wider transition-colors",
                              activeCategory === cat.id
                                ? "bg-logo-green/20 text-logo-green"
                                : "bg-muted text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {cat.name} ({count})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mascot Grid */}
                  <ScrollArea className="h-[400px]">
                    <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 pr-4">
                      {filteredMascots.map((mascot) => {
                        const mascotId = mascot.name.toLowerCase().replace(/\s+/g, '-');
                        const isSelected = selectedVisuals.includes(mascotId);
                        const MascotComponent = mascot.Component;
                        
                        return (
                          <Card
                            key={mascotId}
                            onClick={() => onSelectVisual(mascotId)}
                            className={cn(
                              "relative p-2 cursor-pointer transition-all border-2 hover:scale-[1.02]",
                              isSelected 
                                ? "border-logo-green bg-logo-green/10 ring-1 ring-logo-green/30"
                                : "border-border hover:border-logo-green/50"
                            )}
                          >
                            {isSelected && (
                              <div className="absolute top-1 right-1 z-10">
                                <Check className="w-3 h-3 text-logo-green" />
                              </div>
                            )}
                            
                            <div className="flex flex-col items-center text-center gap-1">
                              {/* Official Mascot SVG */}
                              <div className="w-12 h-12 flex items-center justify-center">
                                <MascotComponent className="w-full h-full" />
                              </div>
                              
                              <p className="font-mono font-bold text-[10px] uppercase line-clamp-1">
                                {mascot.name}
                              </p>
                              
                              <p className="text-[8px] text-muted-foreground line-clamp-1">
                                {mascot.status}
                              </p>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                    
                    {filteredMascots.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Filter className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="font-mono text-sm text-muted-foreground">No mascots match your search</p>
                      </div>
                    )}
                  </ScrollArea>
                </>
              ) : (
                /* techno.dog Visuals Grid */
                <ScrollArea className="h-[320px]">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pr-4">
                    {TECHNO_DOG_VISUALS.map((visual) => {
                      const isSelected = selectedVisuals.includes(visual.id);
                      
                      return (
                        <Card
                          key={visual.id}
                          onClick={() => onSelectVisual(visual.id)}
                          className={cn(
                            "p-4 cursor-pointer transition-all border-2 hover:scale-[1.02]",
                            isSelected 
                              ? "border-crimson bg-crimson/10"
                              : "border-border hover:border-crimson/50"
                          )}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2">
                              <Check className="w-4 h-4 text-crimson" />
                            </div>
                          )}
                          
                          <div className="flex flex-col items-center text-center gap-2">
                            <div className="w-14 h-14 rounded-lg bg-crimson/10 flex items-center justify-center">
                              <Hexagon className={cn(
                                "w-8 h-8",
                                isSelected ? "text-crimson" : "text-muted-foreground"
                              )} />
                            </div>
                            
                            <p className="font-mono font-bold text-xs uppercase">
                              {visual.name}
                            </p>
                            
                            <Badge variant="outline" className="text-[8px] font-mono">
                              {visual.type}
                            </Badge>
                            
                            <p className="text-[10px] text-muted-foreground line-clamp-2">
                              {visual.description}
                            </p>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
              
              {/* Brand-specific reminder */}
              <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border/50">
                <p className="text-xs text-muted-foreground flex items-start gap-2">
                  <AlertTriangle className={cn(
                    "w-4 h-4 shrink-0 mt-0.5",
                    selectedBrand === 'techno-doggies' ? "text-logo-green" : "text-crimson"
                  )} />
                  <span>
                    {selectedBrand === 'techno-doggies' 
                      ? `Zero Tolerance Policy: Only official SVGs from DogPack.tsx are allowed. ${dogVariants.length} approved variants available.`
                      : 'VHS/Brutalist aesthetic only. Dark backgrounds, geometric shapes, NO dog imagery.'}
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
                <Button 
                  variant="outline" 
                  onClick={handleAddUrl}
                  disabled={!urlInput.trim()}
                  className="font-mono text-xs uppercase"
                >
                  Add
                </Button>
              </div>
              {uploadError && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {uploadError}
                </p>
              )}
            </div>

            {/* Uploaded Assets Grid */}
            {uploadedAssets.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Uploaded Assets ({uploadedAssets.length})
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {uploadedAssets.map((asset) => (
                    <Card key={asset.id} className="relative p-2 group">
                      <button
                        onClick={() => onRemoveAsset(asset.id)}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      
                      <div className="aspect-square bg-muted rounded overflow-hidden mb-2">
                        <img 
                          src={asset.url} 
                          alt={asset.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '';
                            e.currentTarget.className = 'hidden';
                          }}
                        />
                      </div>
                      
                      <p className="font-mono text-[10px] truncate">{asset.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge variant="outline" className="text-[8px] font-mono">
                          {asset.type}
                        </Badge>
                        {asset.size && (
                          <span className="text-[8px] text-muted-foreground">
                            {formatSize(asset.size)}
                          </span>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      {/* Selection Summary */}
      {(selectedVisuals.length > 0 || uploadedAssets.length > 0) && (
        <section className="p-4 bg-muted/30 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Selection Summary
            </Label>
            <Badge 
              variant="secondary" 
              className={cn(
                "font-mono text-[10px]",
                selectedBrand === 'techno-doggies' ? "bg-logo-green/10 text-logo-green" : "bg-crimson/10 text-crimson"
              )}
            >
              {selectedBrand === 'techno-dog' ? 'techno.dog' : 'Techno Doggies'}
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {selectedVisuals.map((id) => {
              const mascot = dogVariants.find(m => m.name.toLowerCase().replace(/\s+/g, '-') === id);
              const visual = TECHNO_DOG_VISUALS.find(v => v.id === id);
              
              return (
                <Badge 
                  key={id} 
                  variant="outline" 
                  className="font-mono text-[10px] flex items-center gap-1"
                >
                  {mascot?.name || visual?.name || id}
                  <button 
                    onClick={() => onSelectVisual(id)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
            
            {uploadedAssets.map((asset) => (
              <Badge 
                key={asset.id} 
                variant="outline" 
                className="font-mono text-[10px] flex items-center gap-1 bg-muted"
              >
                📎 {asset.name.slice(0, 15)}...
                <button 
                  onClick={() => onRemoveAsset(asset.id)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default StepCreateProduct;
