import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import LazyImage from "./LazyImage";
import { useDoggyPlaceholder } from "@/hooks/useDoggyPlaceholder";

interface EntityImageProps {
  entityType: string;
  entityId: string;
  entityName: string;
  fallbackImage?: string;
  className?: string;
  showFallbackInitials?: boolean;
}

const EntityImage = ({
  entityType,
  entityId,
  entityName,
  fallbackImage,
  className = "",
  showFallbackInitials = true,
}: EntityImageProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobEnqueued, setJobEnqueued] = useState(false);
  
  // Check for doggy placeholder
  const { data: doggyPlaceholder } = useDoggyPlaceholder(entityType, entityId);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        // Check for existing curated image
        const { data } = await supabase
          .from('media_assets')
          .select('storage_url, source_url')
          .eq('entity_type', entityType)
          .eq('entity_id', entityId)
          .eq('final_selected', true)
          .single();

        if (data) {
          setImageUrl(data.storage_url || data.source_url);
        } else if (!jobEnqueued) {
          // Enqueue job for missing image (fire and forget)
          enqueueJob();
        }
      } catch (error) {
        // No image found, try to enqueue
        if (!jobEnqueued) enqueueJob();
      } finally {
        setLoading(false);
      }
    };

    const enqueueJob = async () => {
      setJobEnqueued(true);
      try {
        await supabase.functions.invoke('media-curator', {
          body: { action: 'enqueue', entityType, entityId, entityName }
        });
      } catch {
        // Silently fail - media job enqueueing is non-critical
      }
    };

    fetchImage();
  }, [entityType, entityId, entityName, jobEnqueued]);

  // If we have an image, show it
  if (imageUrl) {
    return <LazyImage src={imageUrl} alt={entityName} className={className} />;
  }

  // If provided fallback image, use it
  if (fallbackImage) {
    return <LazyImage src={fallbackImage} alt={entityName} className={className} />;
  }

  // Check for doggy placeholder
  if (doggyPlaceholder?.DogComponent) {
    const DogComponent = doggyPlaceholder.DogComponent;
    return (
      <div 
        className={`relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-logo-green/10 to-background ${className}`}
        title={`Placeholder: ${doggyPlaceholder.placeholder.doggy_variant} - ${doggyPlaceholder.personality}`}
      >
        <DogComponent className="w-3/4 h-3/4 opacity-70" />
        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-background/80 font-mono text-[8px] text-logo-green uppercase">
          Placeholder
        </div>
      </div>
    );
  }

  // Show gradient with initials
  const initials = entityName
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const typeColors: Record<string, string> = {
    artist: 'from-primary/20 to-primary/5',
    venue: 'from-accent/20 to-accent/5',
    festival: 'from-secondary/20 to-secondary/5',
    label: 'from-muted/30 to-muted/10',
    synth: 'from-primary/10 to-secondary/10',
    release: 'from-accent/15 to-primary/10',
  };

  return (
    <div 
      className={`relative overflow-hidden flex items-center justify-center bg-gradient-to-br ${typeColors[entityType] || 'from-muted to-background'} ${className}`}
    >
      {showFallbackInitials && (
        <span className="font-mono text-2xl text-muted-foreground/50">
          {initials}
        </span>
      )}
      {loading && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-foreground/5 to-transparent" />
      )}
    </div>
  );
};

export default EntityImage;
