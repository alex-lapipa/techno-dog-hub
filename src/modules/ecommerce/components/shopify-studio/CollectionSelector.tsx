/**
 * Collection Selector - Shopify collection assignment
 * 
 * SHOPIFY-FIRST: Fetches real collections from Shopify Storefront API.
 * Products can be added to multiple collections.
 */

import { useState, useEffect } from 'react';
import { Folder, RefreshCw, Check, Plus, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { fetchCollections, type ShopifyCollection } from '@/lib/shopify';

interface CollectionSelectorProps {
  selectedCollectionIds: string[];
  onChange: (ids: string[]) => void;
  productType?: string;
}

export function CollectionSelector({
  selectedCollectionIds,
  onChange,
  productType,
}: CollectionSelectorProps) {
  const [collections, setCollections] = useState<ShopifyCollection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch collections on mount
  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setIsLoading(true);
    try {
      const edges = await fetchCollections(50);
      setCollections(edges.map(e => e.node));
    } catch (error) {
      console.error('[CollectionSelector] Failed to fetch collections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCollection = (id: string) => {
    if (selectedCollectionIds.includes(id)) {
      onChange(selectedCollectionIds.filter(cid => cid !== id));
    } else {
      onChange([...selectedCollectionIds, id]);
    }
  };

  // Filter collections by search
  const filteredCollections = collections.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Suggest collections based on product type
  const suggestedCollections = productType
    ? collections.filter(c => {
        const typeMatch = c.title.toLowerCase().includes(productType.toLowerCase());
        const tagMatch = c.handle.includes(productType.toLowerCase().replace(' ', '-'));
        return typeMatch || tagMatch;
      })
    : [];

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-mono font-bold text-sm flex items-center gap-2">
          <Folder className="w-4 h-4 text-primary" />
          Collections
        </h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs">
            {selectedCollectionIds.length} selected
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadCollections}
            disabled={isLoading}
            className="h-7 w-7 p-0"
          >
            <RefreshCw className={cn("w-3 h-3", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search collections..."
          className="pl-8 h-8 text-sm"
        />
      </div>

      {/* Suggested Collections */}
      {suggestedCollections.length > 0 && !searchQuery && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Suggested for {productType}</p>
          <div className="flex flex-wrap gap-2">
            {suggestedCollections.slice(0, 3).map(collection => {
              const isSelected = selectedCollectionIds.includes(collection.id);
              return (
                <Button
                  key={collection.id}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleCollection(collection.id)}
                  className="gap-1 text-xs"
                >
                  {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                  {collection.title}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Collection List */}
      <ScrollArea className="h-[160px]">
        {isLoading ? (
          <div className="space-y-2 pr-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : filteredCollections.length === 0 ? (
          <div className="text-center py-4 text-sm text-muted-foreground">
            {searchQuery ? 'No collections match your search' : 'No collections found'}
          </div>
        ) : (
          <div className="space-y-1 pr-4">
            {filteredCollections.map(collection => {
              const isSelected = selectedCollectionIds.includes(collection.id);
              return (
                <div
                  key={collection.id}
                  onClick={() => toggleCollection(collection.id)}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all",
                    isSelected 
                      ? "bg-primary/10 border border-primary/30" 
                      : "hover:bg-muted/50 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Folder className={cn(
                      "w-4 h-4 flex-shrink-0",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )} />
                    <div className="min-w-0">
                      <p className="font-mono text-sm truncate">{collection.title}</p>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">
                        /{collection.handle}
                      </p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Help Text */}
      <p className="text-[10px] text-muted-foreground">
        Products can belong to multiple collections for better discoverability.
      </p>
    </Card>
  );
}

export default CollectionSelector;
