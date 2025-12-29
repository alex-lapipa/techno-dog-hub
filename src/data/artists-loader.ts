// Lightweight artist summaries for listing pages
// Full data loaded on-demand via async loader
// Merges legacy data with RAG database

import { supabase } from "@/integrations/supabase/client";

export interface ArtistSummary {
  id: string;
  name: string;
  city: string;
  country: string;
  region: string;
  tags: string[];
  knownFor?: string;
  topTracks?: string[];
  subgenres?: string[];
  rank?: number;
  realName?: string;
  labels?: string[];
  photoUrl?: string;
  photoSource?: string;
}

interface DJArtist {
  id: number;
  artist_name: string;
  real_name: string | null;
  nationality: string | null;
  years_active: string | null;
  subgenres: string[] | null;
  labels: string[] | null;
  known_for: string | null;
  top_tracks: string[] | null;
  rank: number;
}

// Normalize artist name for matching
const normalizeForMatch = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/\s+/g, '');
};

// Create a slug from artist name
const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

// Parse nationality to extract country/city
const parseNationality = (nationality: string | null): { city: string; country: string; region: string } => {
  if (!nationality) return { city: 'Unknown', country: 'Unknown', region: 'Unknown' };
  
  const nat = nationality.toLowerCase();
  
  if (nat.includes('detroit') || nat.includes('american')) {
    return { city: nat.includes('detroit') ? 'Detroit' : 'USA', country: 'USA', region: 'North America' };
  }
  if (nat.includes('german') || nat.includes('berlin')) {
    return { city: nat.includes('berlin') ? 'Berlin' : 'Germany', country: 'Germany', region: 'Europe' };
  }
  if (nat.includes('british') || nat.includes('uk') || nat.includes('birmingham') || nat.includes('london')) {
    let city = 'UK';
    if (nat.includes('birmingham')) city = 'Birmingham';
    if (nat.includes('london')) city = 'London';
    return { city, country: 'UK', region: 'Europe' };
  }
  if (nat.includes('spanish') || nat.includes('spain')) {
    return { city: 'Spain', country: 'Spain', region: 'Europe' };
  }
  if (nat.includes('dutch') || nat.includes('netherlands')) {
    return { city: 'Netherlands', country: 'Netherlands', region: 'Europe' };
  }
  if (nat.includes('italian') || nat.includes('italy')) {
    return { city: 'Italy', country: 'Italy', region: 'Europe' };
  }
  if (nat.includes('french') || nat.includes('france')) {
    return { city: 'France', country: 'France', region: 'Europe' };
  }
  if (nat.includes('georgian') || nat.includes('georgia') || nat.includes('tbilisi')) {
    return { city: 'Tbilisi', country: 'Georgia', region: 'Europe' };
  }
  if (nat.includes('japanese') || nat.includes('japan') || nat.includes('tokyo')) {
    return { city: 'Tokyo', country: 'Japan', region: 'Asia' };
  }
  
  return { city: nationality, country: nationality, region: 'Unknown' };
};

// Dynamically load full artist data (legacy + RAG enrichment)
export const loadArtistById = async (id: string) => {
  const { getArtistById } = await import('./artists-legacy');
  
  // First check legacy data
  const legacyArtist = getArtistById(id);
  
  // Create search patterns for efficient DB lookup
  const searchPatterns = [
    id,
    id.replace(/-/g, ' '),
    id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  ];
  
  // Use a targeted query instead of fetching all artists
  const { data: ragArtists } = await supabase
    .from('dj_artists')
    .select('*')
    .or(searchPatterns.map(p => `artist_name.ilike.%${p}%`).join(','))
    .limit(5);
  
  if (ragArtists && ragArtists.length > 0) {
    // Find best matching artist in results
    const normalizedId = normalizeForMatch(id);
    const ragMatch = ragArtists.find(ra => {
      const normalizedRagName = normalizeForMatch(ra.artist_name);
      const ragSlug = createSlug(ra.artist_name);
      return normalizedRagName.includes(normalizedId) || 
             normalizedId.includes(normalizedRagName) ||
             ragSlug === id ||
             id.includes(ragSlug);
    }) || ragArtists[0]; // Fallback to first result if pattern match fails
    
    if (legacyArtist && ragMatch) {
      // Merge legacy with RAG data
      return {
        ...legacyArtist,
        knownFor: ragMatch.known_for || undefined,
        topTracks: ragMatch.top_tracks || undefined,
        subgenres: ragMatch.subgenres || legacyArtist.tags,
        rank: ragMatch.rank,
        labels: ragMatch.labels || legacyArtist.labels,
        realName: ragMatch.real_name || legacyArtist.realName,
        active: ragMatch.years_active || legacyArtist.active,
      };
    }
    
    if (!legacyArtist && ragMatch) {
      // Create artist from RAG data only
      const location = parseNationality(ragMatch.nationality);
      return {
        id: createSlug(ragMatch.artist_name),
        name: ragMatch.artist_name,
        realName: ragMatch.real_name || undefined,
        ...location,
        active: ragMatch.years_active || 'Unknown',
        tags: ragMatch.subgenres || [],
        bio: ragMatch.known_for || 'Techno artist.',
        labels: ragMatch.labels || undefined,
        knownFor: ragMatch.known_for || undefined,
        topTracks: ragMatch.top_tracks || undefined,
        subgenres: ragMatch.subgenres || undefined,
        rank: ragMatch.rank,
      };
    }
  }
  
  return legacyArtist;
};

// Load all summaries (merges legacy + RAG data + photos from content_sync)
export const loadArtistsSummary = async (): Promise<ArtistSummary[]> => {
  const { artists: legacyArtists } = await import('./artists-legacy');
  
  // Fetch all RAG artists and photos in parallel
  const [ragResult, photosResult] = await Promise.all([
    supabase
      .from('dj_artists')
      .select('id, artist_name, real_name, nationality, years_active, subgenres, labels, known_for, top_tracks, rank')
      .order('rank', { ascending: true })
      .limit(200),
    supabase
      .from('content_sync')
      .select('entity_id, photo_url, photo_source')
      .eq('entity_type', 'artist')
      .not('photo_url', 'is', null)
  ]);
  
  const ragArtists = ragResult.data;
  const photoData = photosResult.data;
  
  // Create photo lookup map
  const photoMap = new Map<string, { url: string; source: string }>();
  if (photoData) {
    for (const p of photoData) {
      if (p.photo_url) {
        photoMap.set(p.entity_id, { url: p.photo_url, source: p.photo_source || 'Unknown' });
      }
    }
  }
  
  // Create a map of legacy artists for quick lookup
  const legacyMap = new Map(legacyArtists.map(a => [normalizeForMatch(a.name), a]));
  const usedLegacyIds = new Set<string>();
  
  const mergedArtists: ArtistSummary[] = [];
  
  // Process RAG artists first (they have rank)
  if (ragArtists) {
    for (const ra of ragArtists as DJArtist[]) {
      const normalizedName = normalizeForMatch(ra.artist_name);
      const legacyMatch = legacyMap.get(normalizedName);
      
      // Try alternative matching
      let foundLegacy = legacyMatch;
      if (!foundLegacy) {
        for (const [key, legacy] of legacyMap.entries()) {
          if (normalizedName.includes(key) || key.includes(normalizedName)) {
            foundLegacy = legacy;
            break;
          }
        }
      }
      
      const location = parseNationality(ra.nationality);
      
      if (foundLegacy) {
        usedLegacyIds.add(foundLegacy.id);
        const photo = photoMap.get(foundLegacy.id);
        const legacyPhoto = foundLegacy.image?.url;
        mergedArtists.push({
          id: foundLegacy.id,
          name: foundLegacy.name,
          city: foundLegacy.city,
          country: foundLegacy.country,
          region: foundLegacy.region,
          tags: ra.subgenres || foundLegacy.tags,
          knownFor: ra.known_for || undefined,
          topTracks: ra.top_tracks || undefined,
          subgenres: ra.subgenres || undefined,
          rank: ra.rank,
          realName: ra.real_name || foundLegacy.realName,
          labels: ra.labels || foundLegacy.labels,
          photoUrl: photo?.url || legacyPhoto,
          photoSource: photo?.source || foundLegacy.image?.sourceName,
        });
      } else {
        // New artist from RAG only
        const artistSlug = createSlug(ra.artist_name);
        const photo = photoMap.get(artistSlug);
        mergedArtists.push({
          id: artistSlug,
          name: ra.artist_name,
          ...location,
          tags: ra.subgenres || [],
          knownFor: ra.known_for || undefined,
          topTracks: ra.top_tracks || undefined,
          subgenres: ra.subgenres || undefined,
          rank: ra.rank,
          realName: ra.real_name || undefined,
          labels: ra.labels || undefined,
          photoUrl: photo?.url,
          photoSource: photo?.source,
        });
      }
    }
  }
  
  // Add remaining legacy artists that weren't matched
  for (const legacy of legacyArtists) {
    if (!usedLegacyIds.has(legacy.id)) {
      const photo = photoMap.get(legacy.id);
      mergedArtists.push({
        id: legacy.id,
        name: legacy.name,
        city: legacy.city,
        country: legacy.country,
        region: legacy.region,
        tags: legacy.tags,
        realName: legacy.realName,
        labels: legacy.labels,
        photoUrl: photo?.url || legacy.image?.url,
        photoSource: photo?.source || legacy.image?.sourceName,
      });
    }
  }
  
  // Sort by rank (ranked artists first), then alphabetically
  mergedArtists.sort((a, b) => {
    if (a.rank !== undefined && b.rank !== undefined) {
      return a.rank - b.rank;
    }
    if (a.rank !== undefined) return -1;
    if (b.rank !== undefined) return 1;
    return a.name.localeCompare(b.name);
  });
  
  return mergedArtists;
};
