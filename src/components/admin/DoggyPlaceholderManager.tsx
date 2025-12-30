import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ImageOff, Wand2, Trash2, RefreshCw, Dog, Shuffle, Check } from "lucide-react";
import { dogVariants } from "@/components/DogPack";

interface MissingImageEntity {
  entity_type: string;
  entity_id: string;
  entity_name: string;
}

interface DoggyPlaceholder {
  id: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  doggy_variant: string;
  created_at: string;
}

const ENTITY_TYPES = [
  { value: "artist", label: "Artists", table: "canonical_artists", nameField: "canonical_name", idField: "artist_id" },
  { value: "gear", label: "Gear", table: "gear_catalog", nameField: "name", idField: "id" },
  { value: "venue", label: "Venues", table: "content_sync", filter: { entity_type: "venue" }, nameField: "entity_id", idField: "entity_id" },
  { value: "festival", label: "Festivals", table: "content_sync", filter: { entity_type: "festival" }, nameField: "entity_id", idField: "entity_id" },
];

export const DoggyPlaceholderManager = () => {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<string>("artist");
  const [isScanning, setIsScanning] = useState(false);
  const [missingImages, setMissingImages] = useState<MissingImageEntity[]>([]);

  // Fetch existing placeholders
  const { data: placeholders, isLoading } = useQuery({
    queryKey: ["doggy-placeholders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doggy_placeholders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DoggyPlaceholder[];
    },
  });

  // Add placeholder mutation
  const addPlaceholder = useMutation({
    mutationFn: async (entity: MissingImageEntity) => {
      const randomDog = dogVariants[Math.floor(Math.random() * dogVariants.length)];
      const { error } = await supabase.from("doggy_placeholders").insert({
        entity_type: entity.entity_type,
        entity_id: entity.entity_id,
        entity_name: entity.entity_name,
        doggy_variant: randomDog.name,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doggy-placeholders"] });
      toast.success("Doggy placeholder assigned!");
    },
    onError: (error) => {
      toast.error("Failed to assign placeholder", { description: error.message });
    },
  });

  // Remove placeholder mutation
  const removePlaceholder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("doggy_placeholders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doggy-placeholders"] });
      toast.success("Placeholder removed");
    },
  });

  // Batch assign placeholders
  const batchAssign = useMutation({
    mutationFn: async (entities: MissingImageEntity[]) => {
      const inserts = entities.map((entity) => ({
        entity_type: entity.entity_type,
        entity_id: entity.entity_id,
        entity_name: entity.entity_name,
        doggy_variant: dogVariants[Math.floor(Math.random() * dogVariants.length)].name,
      }));
      
      const { error } = await supabase.from("doggy_placeholders").upsert(inserts, {
        onConflict: "entity_type,entity_id",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doggy-placeholders"] });
      setMissingImages([]);
      toast.success("All placeholders assigned!");
    },
  });

  // Scan for missing images
  const scanForMissingImages = async () => {
    setIsScanning(true);
    setMissingImages([]);
    
    try {
      const typeConfig = ENTITY_TYPES.find((t) => t.value === selectedType);
      if (!typeConfig) return;

      let missing: MissingImageEntity[] = [];

      if (selectedType === "artist") {
        // Check artists without photos
        const { data: artists } = await supabase
          .from("canonical_artists")
          .select("artist_id, canonical_name, photo_url")
          .is("photo_url", null)
          .limit(50);
        
        // Filter out those already with placeholders
        const existingIds = new Set(
          placeholders?.filter((p) => p.entity_type === "artist").map((p) => p.entity_id) || []
        );
        
        missing = (artists || [])
          .filter((a) => !existingIds.has(a.artist_id))
          .map((a) => ({
            entity_type: "artist",
            entity_id: a.artist_id,
            entity_name: a.canonical_name,
          }));
      } else if (selectedType === "gear") {
        // Check gear without images
        const { data: gear } = await supabase
          .from("gear_catalog")
          .select("id, name, image_url")
          .is("image_url", null)
          .limit(50);
        
        const existingIds = new Set(
          placeholders?.filter((p) => p.entity_type === "gear").map((p) => p.entity_id) || []
        );
        
        missing = (gear || [])
          .filter((g) => !existingIds.has(g.id))
          .map((g) => ({
            entity_type: "gear",
            entity_id: g.id,
            entity_name: g.name,
          }));
      } else if (selectedType === "venue" || selectedType === "festival") {
        // Check content_sync for missing photos
        const { data: entities } = await supabase
          .from("content_sync")
          .select("entity_id, entity_type, photo_url")
          .eq("entity_type", selectedType)
          .is("photo_url", null)
          .limit(50);
        
        const existingIds = new Set(
          placeholders?.filter((p) => p.entity_type === selectedType).map((p) => p.entity_id) || []
        );
        
        missing = (entities || [])
          .filter((e) => !existingIds.has(e.entity_id))
          .map((e) => ({
            entity_type: selectedType,
            entity_id: e.entity_id,
            entity_name: e.entity_id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          }));
      }

      setMissingImages(missing);
      toast.success(`Found ${missing.length} entities without images`);
    } catch (error) {
      toast.error("Scan failed", { description: String(error) });
    } finally {
      setIsScanning(false);
    }
  };

  const groupedPlaceholders = placeholders?.reduce((acc, p) => {
    if (!acc[p.entity_type]) acc[p.entity_type] = [];
    acc[p.entity_type].push(p);
    return acc;
  }, {} as Record<string, DoggyPlaceholder[]>) || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-mono text-base flex items-center gap-2">
          <Dog className="w-4 h-4 text-logo-green" />
          Doggy Placeholder System
        </CardTitle>
        <CardDescription>
          Assign Techno Doggies as temporary placeholders for entities missing images
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scanner */}
        <div className="p-4 rounded-lg border bg-muted/30 space-y-4">
          <div className="flex items-center gap-3">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={scanForMissingImages} disabled={isScanning} variant="outline">
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <ImageOff className="w-4 h-4 mr-2" />
                  Scan for Missing
                </>
              )}
            </Button>
          </div>

          {/* Missing images list */}
          {missingImages.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted-foreground">
                  {missingImages.length} entities without images
                </span>
                <Button
                  size="sm"
                  variant="brutalist"
                  onClick={() => batchAssign.mutate(missingImages)}
                  disabled={batchAssign.isPending}
                >
                  {batchAssign.isPending ? (
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Wand2 className="w-3 h-3 mr-1" />
                  )}
                  Assign All Doggies
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {missingImages.slice(0, 20).map((entity) => (
                  <div
                    key={entity.entity_id}
                    className="p-2 rounded border bg-background flex items-center justify-between gap-2"
                  >
                    <span className="font-mono text-xs truncate flex-1">{entity.entity_name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => addPlaceholder.mutate(entity)}
                    >
                      <Shuffle className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
              {missingImages.length > 20 && (
                <p className="font-mono text-xs text-muted-foreground">
                  +{missingImages.length - 20} more...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Current placeholders */}
        <div className="space-y-4">
          <h4 className="font-mono text-sm font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-logo-green" />
            Active Placeholders ({placeholders?.length || 0})
          </h4>
          
          {Object.entries(groupedPlaceholders).map(([type, items]) => (
            <div key={type} className="space-y-2">
              <Badge variant="outline" className="font-mono text-xs uppercase">
                {type} ({items.length})
              </Badge>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {items.slice(0, 12).map((placeholder) => {
                  const dogData = dogVariants.find(
                    (d) => d.name.toLowerCase() === placeholder.doggy_variant.toLowerCase()
                  );
                  const DogComponent = dogData?.Component;
                  
                  return (
                    <div
                      key={placeholder.id}
                      className="p-2 rounded border bg-muted/20 group relative"
                    >
                      {DogComponent && (
                        <DogComponent className="w-8 h-8 mx-auto opacity-60" />
                      )}
                      <p className="font-mono text-[10px] text-center truncate mt-1">
                        {placeholder.entity_name}
                      </p>
                      <p className="font-mono text-[8px] text-muted-foreground text-center">
                        {placeholder.doggy_variant}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-1 right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removePlaceholder.mutate(placeholder.id)}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  );
                })}
              </div>
              {items.length > 12 && (
                <p className="font-mono text-xs text-muted-foreground">
                  +{items.length - 12} more {type} placeholders
                </p>
              )}
            </div>
          ))}

          {(!placeholders || placeholders.length === 0) && (
            <p className="font-mono text-sm text-muted-foreground text-center py-8">
              No doggy placeholders assigned yet. Scan for missing images above!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DoggyPlaceholderManager;
