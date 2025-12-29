import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GearItem, GearCategory, ImageAttribution } from "@/data/gear";
import { Json } from "@/integrations/supabase/types";

// Convert database row to frontend GearItem
function mapDbToGearItem(row: any): GearItem {
  // Parse notable_artists safely
  let notableArtists: { name: string; usage: string }[] = [];
  if (row.notable_artists && Array.isArray(row.notable_artists)) {
    notableArtists = (row.notable_artists as Json[]).map((a: any) => ({
      name: a?.name || "Unknown",
      usage: a?.usage || ""
    }));
  }

  // Parse famous_tracks safely
  let famousTracks: { artist: string; title: string; year: number; role: string }[] = [];
  if (row.famous_tracks && Array.isArray(row.famous_tracks)) {
    famousTracks = (row.famous_tracks as Json[]).map((t: any) => ({
      artist: t?.artist || "Unknown",
      title: t?.title || "Unknown",
      year: t?.year || 0,
      role: t?.role || ""
    }));
  }

  // Parse youtube_videos safely
  let youtubeVideos: { title: string; url: string; channel: string }[] | undefined;
  if (row.youtube_videos && Array.isArray(row.youtube_videos)) {
    youtubeVideos = (row.youtube_videos as Json[]).map((v: any) => ({
      title: v?.title || "",
      url: v?.url || "",
      channel: v?.channel || ""
    }));
  }

  // Parse image attribution
  let image: ImageAttribution | undefined;
  if (row.image_url) {
    const attribution = row.image_attribution as any;
    image = {
      url: row.image_url,
      author: attribution?.author || "Unknown",
      license: attribution?.license || "Unknown",
      licenseUrl: attribution?.licenseUrl || "",
      sourceUrl: attribution?.sourceUrl || row.image_url,
      sourceName: attribution?.sourceName || "Unknown"
    };
  }

  // Map category from DB format to frontend format
  const categoryMap: Record<string, GearCategory> = {
    'Synthesizer': 'synth',
    'synth': 'synth',
    'Drum Machine': 'drum-machine',
    'drum-machine': 'drum-machine',
    'Sampler/Sequencer': 'sampler',
    'sampler': 'sampler',
    'Turntable/CDJ': 'sequencer',
    'sequencer': 'sequencer',
    'Effects': 'effect',
    'effect': 'effect',
    'Mixer': 'effect',
    'DAW/Software': 'daw',
    'daw': 'daw',
    'Modular': 'synth',
    'midi-tool': 'midi-tool',
    'Studio Outboard': 'effect'
  };

  return {
    id: row.id,
    name: row.name,
    manufacturer: row.brand || "Unknown",
    releaseYear: row.release_year || 0,
    category: categoryMap[row.category] || 'synth',
    shortDescription: {
      en: row.short_description || row.notable_features || `${row.instrument_type || row.category} by ${row.brand}`
    },
    technicalOverview: {
      synthesisType: row.synthesis_type || undefined,
      polyphony: row.polyphony || undefined,
      architecture: row.oscillator_types || undefined,
      midiSync: row.midi_sync || undefined,
      sequencer: row.sequencer_arp || undefined,
      inputsOutputs: row.io_connectivity || undefined,
      modifications: row.modifications || undefined,
      strengths: row.strengths || undefined,
      limitations: row.limitations || undefined
    },
    notableArtists,
    famousTracks,
    technoApplications: {
      en: row.techno_applications || ""
    },
    relatedGear: row.related_gear || [],
    tags: row.tags || [row.category, row.brand].filter(Boolean),
    officialUrl: row.official_url || undefined,
    imageUrl: row.image_url || undefined,
    image,
    youtubeVideos
  };
}

export function useGearData() {
  return useQuery({
    queryKey: ["gear-catalog"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gear_catalog")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching gear:", error);
        throw error;
      }

      return (data || []).map(mapDbToGearItem);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useGearItem(id: string) {
  return useQuery({
    queryKey: ["gear-item", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gear_catalog")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching gear item:", error);
        throw error;
      }

      return mapDbToGearItem(data);
    },
    enabled: !!id,
  });
}
