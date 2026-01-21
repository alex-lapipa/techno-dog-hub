/**
 * Knowledge Base Panel - Phase 2: Technopedia Integration
 * 
 * Provides RAG-powered inspiration from the techno.dog knowledge base.
 * Pulls context from artists, gear, venues, and labels.
 * 
 * BRAND COMPLIANCE: Read-only access to knowledge base.
 * Never modifies brand book data.
 */

import { useState, useCallback } from 'react';
import { Search, Loader2, Zap, Music, Radio, MapPin, Tag } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';

// Scene/Mood presets inspired by underground techno culture
export const SCENE_PRESETS = [
  { 
    id: 'berlin-warehouse', 
    label: 'Berlin Warehouse',
    keywords: ['industrial', 'minimal', 'dark', 'concrete'],
    icon: MapPin,
  },
  { 
    id: 'detroit-origins', 
    label: 'Detroit Origins',
    keywords: ['futurism', 'electro', 'afrofuturism', 'machine soul'],
    icon: Radio,
  },
  { 
    id: 'london-underground', 
    label: 'London Underground',
    keywords: ['acid', 'rave', 'squat party', 'pirate radio'],
    icon: Music,
  },
  { 
    id: 'late-night-ritual', 
    label: 'Late Night Ritual',
    keywords: ['hypnotic', 'driving', 'peak-time', '4am'],
    icon: Zap,
  },
] as const;

export type ScenePresetId = typeof SCENE_PRESETS[number]['id'];

export interface KnowledgeContext {
  artists: Array<{ name: string; knownFor?: string; labels?: string[] }>;
  gear: Array<{ name: string; type: string; manufacturer?: string }>;
  venues: Array<{ name: string; city: string; aesthetic?: string }>;
  labels: Array<{ name: string; style?: string }>;
  selectedScene?: ScenePresetId;
  customKeywords: string[];
}

interface KnowledgeBasePanelProps {
  onContextChange: (context: KnowledgeContext) => void;
  context: KnowledgeContext;
  brandBook: string;
}

export function KnowledgeBasePanel({
  onContextChange,
  context,
  brandBook,
}: KnowledgeBasePanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    artists: any[];
    gear: any[];
  }>({ artists: [], gear: [] });

  // Search the knowledge base
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Search artists
      const { data: artists } = await supabase
        .from('canonical_artists')
        .select('artist_id, canonical_name, primary_genre, city')
        .ilike('canonical_name', `%${searchQuery}%`)
        .limit(5);

      // Search gear
      const { data: gear } = await supabase
        .from('gear_catalog')
        .select('id, name, category, manufacturer')
        .ilike('name', `%${searchQuery}%`)
        .limit(5);

      setSearchResults({
        artists: artists || [],
        gear: gear || [],
      });
    } catch (err) {
      console.error('Knowledge base search error:', err);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  // Select a scene preset
  const selectScene = useCallback((sceneId: ScenePresetId) => {
    onContextChange({
      ...context,
      selectedScene: context.selectedScene === sceneId ? undefined : sceneId,
    });
  }, [context, onContextChange]);

  // Add artist to context
  const addArtist = useCallback((artist: any) => {
    if (context.artists.find(a => a.name === artist.canonical_name)) return;
    
    onContextChange({
      ...context,
      artists: [...context.artists, {
        name: artist.canonical_name,
        knownFor: artist.primary_genre,
        labels: [],
      }],
    });
  }, [context, onContextChange]);

  // Add gear to context
  const addGear = useCallback((gear: any) => {
    if (context.gear.find(g => g.name === gear.name)) return;
    
    onContextChange({
      ...context,
      gear: [...context.gear, {
        name: gear.name,
        type: gear.category,
        manufacturer: gear.manufacturer,
      }],
    });
  }, [context, onContextChange]);

  // Remove item from context
  const removeFromContext = useCallback((type: 'artists' | 'gear', name: string) => {
    onContextChange({
      ...context,
      [type]: context[type].filter((item: any) => item.name !== name),
    });
  }, [context, onContextChange]);

  const selectedSceneData = SCENE_PRESETS.find(s => s.id === context.selectedScene);

  return (
    <Card className="p-4 border-dashed border-muted-foreground/30 bg-background/50">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="w-4 h-4 text-primary" />
        <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
          Knowledge Base
        </span>
        <Badge variant="outline" className="text-[9px] ml-auto">
          Phase 2
        </Badge>
      </div>

      {/* Scene/Mood Presets */}
      <div className="mb-4">
        <div className="text-[10px] uppercase text-muted-foreground mb-2 font-mono">
          Scene / Mood
        </div>
        <div className="grid grid-cols-2 gap-2">
          {SCENE_PRESETS.map((scene) => {
            const Icon = scene.icon;
            const isSelected = context.selectedScene === scene.id;
            return (
              <button
                key={scene.id}
                onClick={() => selectScene(scene.id)}
                className={`
                  flex items-center gap-2 p-2 rounded border text-left text-xs
                  transition-all duration-200
                  ${isSelected 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-border hover:border-muted-foreground/50 text-muted-foreground'
                  }
                `}
              >
                <Icon className="w-3 h-3 flex-shrink-0" />
                <span className="font-mono truncate">{scene.label}</span>
              </button>
            );
          })}
        </div>
        {selectedSceneData && (
          <div className="mt-2 flex flex-wrap gap-1">
            {selectedSceneData.keywords.map((kw) => (
              <Badge key={kw} variant="secondary" className="text-[9px]">
                {kw}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="text-[10px] uppercase text-muted-foreground mb-2 font-mono">
          Search Technopedia
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Artist, gear, label..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="text-xs h-8"
          />
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleSearch}
            disabled={isSearching}
            className="h-8 px-3"
          >
            {isSearching ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Search className="w-3 h-3" />
            )}
          </Button>
        </div>

        {/* Search Results */}
        {(searchResults.artists.length > 0 || searchResults.gear.length > 0) && (
          <ScrollArea className="h-32 mt-2 border rounded p-2">
            {searchResults.artists.length > 0 && (
              <div className="mb-2">
                <div className="text-[9px] uppercase text-muted-foreground mb-1">Artists</div>
                {searchResults.artists.map((artist) => (
                  <button
                    key={artist.artist_id}
                    onClick={() => addArtist(artist)}
                    className="w-full text-left px-2 py-1 text-xs hover:bg-muted rounded flex justify-between items-center"
                  >
                    <span className="font-mono">{artist.canonical_name}</span>
                    <span className="text-muted-foreground text-[9px]">{artist.city}</span>
                  </button>
                ))}
              </div>
            )}
            {searchResults.gear.length > 0 && (
              <div>
                <div className="text-[9px] uppercase text-muted-foreground mb-1">Gear</div>
                {searchResults.gear.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addGear(item)}
                    className="w-full text-left px-2 py-1 text-xs hover:bg-muted rounded flex justify-between items-center"
                  >
                    <span className="font-mono">{item.name}</span>
                    <span className="text-muted-foreground text-[9px]">{item.manufacturer}</span>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        )}
      </div>

      {/* Selected Context */}
      {(context.artists.length > 0 || context.gear.length > 0) && (
        <div>
          <div className="text-[10px] uppercase text-muted-foreground mb-2 font-mono">
            Inspiration Context
          </div>
          <div className="flex flex-wrap gap-1">
            {context.artists.map((artist) => (
              <Badge
                key={artist.name}
                variant="outline"
                className="text-[9px] cursor-pointer hover:bg-destructive/20"
                onClick={() => removeFromContext('artists', artist.name)}
              >
                {artist.name} ×
              </Badge>
            ))}
            {context.gear.map((gear) => (
              <Badge
                key={gear.name}
                variant="secondary"
                className="text-[9px] cursor-pointer hover:bg-destructive/20"
                onClick={() => removeFromContext('gear', gear.name)}
              >
                {gear.name} ×
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

export default KnowledgeBasePanel;
