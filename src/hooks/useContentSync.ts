import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { artists } from '@/data/artists-legacy';
import { venues } from '@/data/venues-legacy';
import { festivals } from '@/data/festivals-legacy';
import { gear } from '@/data/gear';
import { labels } from '@/data/labels';
import { releases } from '@/data/releases';
import { crews } from '@/data/crews';
import { useToast } from '@/hooks/use-toast';

interface SyncResult {
  total: number;
  successful: number;
  verified: number;
  needsReview: number;
  withPhotos: number;
  failed: number;
}

interface ContentEntity {
  type: 'artist' | 'venue' | 'festival' | 'gear' | 'label' | 'release' | 'crew';
  id: string;
  data: Record<string, unknown>;
}

export function useContentSync() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [result, setResult] = useState<SyncResult | null>(null);
  const { toast } = useToast();

  const getAllEntities = useCallback((): ContentEntity[] => {
    const entities: ContentEntity[] = [];
    
    // Add all artists
    artists.forEach(artist => {
      entities.push({ type: 'artist', id: artist.id, data: artist as unknown as Record<string, unknown> });
    });
    
    // Add all venues
    venues.forEach(venue => {
      entities.push({ type: 'venue', id: venue.id, data: venue as unknown as Record<string, unknown> });
    });
    
    // Add all festivals
    festivals.forEach(festival => {
      entities.push({ type: 'festival', id: festival.id, data: festival as unknown as Record<string, unknown> });
    });
    
    // Add all gear
    gear.forEach(item => {
      entities.push({ type: 'gear', id: item.id, data: item as unknown as Record<string, unknown> });
    });
    
    // Add all labels
    labels.forEach(label => {
      entities.push({ type: 'label', id: label.id, data: label as unknown as Record<string, unknown> });
    });
    
    // Add all releases
    releases.forEach(release => {
      entities.push({ type: 'release', id: release.id, data: release as unknown as Record<string, unknown> });
    });
    
    // Add all crews
    crews.forEach(crew => {
      entities.push({ type: 'crew', id: crew.id, data: crew as unknown as Record<string, unknown> });
    });
    
    return entities;
  }, []);

  const syncContent = useCallback(async (entityType?: string) => {
    setIsLoading(true);
    setProgress({ current: 0, total: 0 });
    
    try {
      let entities = getAllEntities();
      
      // Filter by type if specified
      if (entityType) {
        entities = entities.filter(e => e.type === entityType);
      }
      
      setProgress({ current: 0, total: entities.length });
      
      // Process in chunks of 10
      const chunkSize = 10;
      const allResults = [];
      
      for (let i = 0; i < entities.length; i += chunkSize) {
        const chunk = entities.slice(i, i + chunkSize);
        
        const { data, error } = await supabase.functions.invoke('content-sync', {
          body: { entities: chunk, batchSize: 5 }
        });
        
        if (error) {
          console.error('Sync error:', error);
          toast({
            title: 'Sync Error',
            description: error.message,
            variant: 'destructive'
          });
          continue;
        }
        
        if (data?.results) {
          allResults.push(...data.results);
        }
        
        setProgress({ current: i + chunk.length, total: entities.length });
      }
      
      const summary: SyncResult = {
        total: allResults.length,
        successful: allResults.filter((r: { success: boolean }) => r.success).length,
        verified: allResults.filter((r: { verified: boolean }) => r.verified).length,
        needsReview: allResults.filter((r: { success: boolean; verified: boolean }) => r.success && !r.verified).length,
        withPhotos: allResults.filter((r: { hasPhoto: boolean }) => r.hasPhoto).length,
        failed: allResults.filter((r: { success: boolean }) => !r.success).length
      };
      
      setResult(summary);
      
      toast({
        title: 'Content Sync Complete',
        description: `Verified: ${summary.verified}, Needs Review: ${summary.needsReview}, Failed: ${summary.failed}`,
      });
      
      return summary;
    } catch (error) {
      console.error('Sync failed:', error);
      toast({
        title: 'Sync Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [getAllEntities, toast]);

  const getSyncStatus = useCallback(async () => {
    const { data, error } = await supabase
      .from('content_sync')
      .select('entity_type, status')
      .order('last_synced_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching sync status:', error);
      return null;
    }
    
    const statusByType: Record<string, { total: number; verified: number; needsReview: number }> = {};
    
    data?.forEach((item: { entity_type: string; status: string }) => {
      if (!statusByType[item.entity_type]) {
        statusByType[item.entity_type] = { total: 0, verified: 0, needsReview: 0 };
      }
      statusByType[item.entity_type].total++;
      if (item.status === 'verified') {
        statusByType[item.entity_type].verified++;
      } else if (item.status === 'needs_review') {
        statusByType[item.entity_type].needsReview++;
      }
    });
    
    return statusByType;
  }, []);

  const getCorrections = useCallback(async (entityType?: string) => {
    let query = supabase
      .from('content_sync')
      .select('*')
      .eq('status', 'needs_review');
    
    if (entityType) {
      query = query.eq('entity_type', entityType);
    }
    
    const { data, error } = await query.order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching corrections:', error);
      return [];
    }
    
    return data || [];
  }, []);

  return {
    isLoading,
    progress,
    result,
    syncContent,
    getSyncStatus,
    getCorrections
  };
}
