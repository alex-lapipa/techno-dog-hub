/**
 * Canonical Artists Data Loader
 * 
 * Unified data loader that supports both legacy and canonical artist sources.
 * Provides backwards-compatible API while enabling gradual migration.
 */

import { supabase } from '@/integrations/supabase/client';
import { useCanonicalArtistsRead } from '@/lib/featureFlags';
import type { Artist, ImageAttribution } from './artists-legacy';

// Canonical artist types matching the new schema
export interface CanonicalArtist {
  artist_id: string;
  canonical_name: string;
  sort_name: string;
  slug: string;
  real_name: string | null;
  primary_genre: string;
  country: string | null;
  city: string | null;
  region: string | null;
  active_years: string | null;
  rank: number | null;
  is_active: boolean;
  needs_review: boolean;
  created_at: string;
  updated_at: string;
}

export interface CanonicalArtistProfile {
  profile_id: string;
  artist_id: string;
  bio_long: string | null;
  bio_short: string | null;
  press_notes: string | null;
  labels: string[] | null;
  collaborators: string[] | null;
  influences: string[] | null;
  crews: string[] | null;
  subgenres: string[] | null;
  tags: string[] | null;
  known_for: string | null;
  top_tracks: string[] | null;
  career_highlights: string[] | null;
  social_links: unknown;
  key_releases: unknown;
  source_system: string;
  source_priority: number;
  confidence_score: number;
}

export interface CanonicalArtistAsset {
  asset_id: string;
  artist_id: string;
  asset_type: string;
  url: string;
  alt_text: string | null;
  author: string | null;
  license: string | null;
  license_url: string | null;
  source_url: string | null;
  source_name: string | null;
  is_primary: boolean;
}

export interface CanonicalArtistGear {
  gear_id: string;
  artist_id: string;
  gear_category: string;
  gear_items: string[] | null;
  rider_notes: string | null;
}

// Full canonical artist with all related data
export interface FullCanonicalArtist extends CanonicalArtist {
  profiles: CanonicalArtistProfile[];
  assets: CanonicalArtistAsset[];
  gear: CanonicalArtistGear[];
  aliases: Array<{ alias_id: string; alias_name: string; alias_type: string }>;
}

// Summary type for list views (lightweight)
export interface CanonicalArtistSummary {
  artist_id: string;
  slug: string;
  name: string;
  city: string | null;
  country: string | null;
  region: string | null;
  rank: number | null;
  tags: string[];
  photoUrl: string | null;
  photoSource: string | null;
  subgenres: string[];
  labels: string[];
  knownFor: string | null;
  realName: string | null;
}

// Parse location from country field (handles "Detroit, Michigan, United States" format)
function parseLocation(country: string | null): { city: string; country: string; region: string } {
  if (!country) return { city: 'Unknown', country: 'Unknown', region: 'Unknown' };
  
  const location = country.toLowerCase();
  
  // Extract city from parentheses if present: "British (Birmingham)" -> Birmingham
  const parenMatch = country.match(/\(([^)]+)\)/);
  const parenCity = parenMatch ? parenMatch[1] : null;
  
  // Handle specific patterns with region mapping
  
  // Detroit patterns
  if (location.includes('detroit')) {
    return { city: 'Detroit', country: 'USA', region: 'North America' };
  }
  
  // American patterns
  if (location.includes('american') || location.includes('united states') || location.includes('usa')) {
    if (parenCity) {
      const cityMap: Record<string, string> = {
        'detroit': 'Detroit',
        'nyc': 'New York',
        'new york': 'New York',
        'chicago': 'Chicago',
        'los angeles': 'Los Angeles',
        'la': 'Los Angeles',
      };
      const mappedCity = cityMap[parenCity.toLowerCase()] || parenCity;
      return { city: mappedCity, country: 'USA', region: 'North America' };
    }
    return { city: 'USA', country: 'USA', region: 'North America' };
  }
  
  // German patterns
  if (location.includes('german') || location.includes('germany')) {
    if (location.includes('berlin')) return { city: 'Berlin', country: 'Germany', region: 'Europe' };
    if (parenCity) {
      const cityMap: Record<string, string> = {
        'cologne': 'Cologne',
        'köln': 'Cologne',
        'berlin': 'Berlin',
        'frankfurt': 'Frankfurt',
        'munich': 'Munich',
        'münchen': 'Munich',
        'hamburg': 'Hamburg',
      };
      const mappedCity = cityMap[parenCity.toLowerCase()] || parenCity;
      return { city: mappedCity, country: 'Germany', region: 'Europe' };
    }
    return { city: 'Berlin', country: 'Germany', region: 'Europe' }; // Default German artists to Berlin
  }
  
  // British/UK patterns
  if (location.includes('british') || location.includes('uk') || location.includes('united kingdom')) {
    if (location.includes('birmingham') || parenCity?.toLowerCase() === 'birmingham') {
      return { city: 'Birmingham', country: 'UK', region: 'Europe' };
    }
    if (location.includes('london') || parenCity?.toLowerCase() === 'london') {
      return { city: 'London', country: 'UK', region: 'Europe' };
    }
    if (location.includes('manchester') || parenCity?.toLowerCase() === 'manchester') {
      return { city: 'Manchester', country: 'UK', region: 'Europe' };
    }
    if (location.includes('cornwall') || parenCity?.toLowerCase() === 'cornwall') {
      return { city: 'Cornwall', country: 'UK', region: 'Europe' };
    }
    if (location.includes('glasgow') || parenCity?.toLowerCase() === 'glasgow') {
      return { city: 'Glasgow', country: 'UK', region: 'Europe' };
    }
    if (location.includes('sheffield') || parenCity?.toLowerCase() === 'sheffield') {
      return { city: 'Sheffield', country: 'UK', region: 'Europe' };
    }
    if (parenCity) return { city: parenCity, country: 'UK', region: 'Europe' };
    return { city: 'UK', country: 'UK', region: 'Europe' };
  }
  
  // Spanish patterns  
  if (location.includes('spanish') || location.includes('spain')) {
    if (location.includes('madrid') || parenCity?.toLowerCase() === 'madrid') {
      return { city: 'Madrid', country: 'Spain', region: 'Europe' };
    }
    if (location.includes('barcelona') || parenCity?.toLowerCase() === 'barcelona') {
      return { city: 'Barcelona', country: 'Spain', region: 'Europe' };
    }
    if (parenCity) return { city: parenCity, country: 'Spain', region: 'Europe' };
    return { city: 'Spain', country: 'Spain', region: 'Europe' };
  }
  
  // Dutch/Netherlands patterns
  if (location.includes('dutch') || location.includes('netherlands') || location.includes('holland')) {
    if (location.includes('amsterdam') || parenCity?.toLowerCase() === 'amsterdam') {
      return { city: 'Amsterdam', country: 'Netherlands', region: 'Europe' };
    }
    if (location.includes('rotterdam') || parenCity?.toLowerCase() === 'rotterdam') {
      return { city: 'Rotterdam', country: 'Netherlands', region: 'Europe' };
    }
    if (parenCity) return { city: parenCity, country: 'Netherlands', region: 'Europe' };
    return { city: 'Amsterdam', country: 'Netherlands', region: 'Europe' };
  }
  
  // Italian patterns
  if (location.includes('italian') || location.includes('italy')) {
    if (parenCity) return { city: parenCity, country: 'Italy', region: 'Europe' };
    return { city: 'Italy', country: 'Italy', region: 'Europe' };
  }
  
  // French patterns
  if (location.includes('french') || location.includes('france')) {
    if (location.includes('paris') || parenCity?.toLowerCase() === 'paris') {
      return { city: 'Paris', country: 'France', region: 'Europe' };
    }
    if (parenCity) return { city: parenCity, country: 'France', region: 'Europe' };
    return { city: 'Paris', country: 'France', region: 'Europe' };
  }
  
  // Georgian patterns
  if (location.includes('georgian') || location.includes('georgia') || location.includes('tbilisi')) {
    return { city: 'Tbilisi', country: 'Georgia', region: 'Europe' };
  }
  
  // Japanese patterns
  if (location.includes('japanese') || location.includes('japan') || location.includes('tokyo')) {
    if (parenCity) return { city: parenCity, country: 'Japan', region: 'Asia' };
    return { city: 'Tokyo', country: 'Japan', region: 'Asia' };
  }
  
  // Canadian patterns
  if (location.includes('canadian') || location.includes('canada')) {
    if (location.includes('montreal') || parenCity?.toLowerCase() === 'montreal') {
      return { city: 'Montreal', country: 'Canada', region: 'North America' };
    }
    if (location.includes('toronto') || parenCity?.toLowerCase() === 'toronto') {
      return { city: 'Toronto', country: 'Canada', region: 'North America' };
    }
    if (parenCity) return { city: parenCity, country: 'Canada', region: 'North America' };
    return { city: 'Canada', country: 'Canada', region: 'North America' };
  }
  
  // Australian patterns
  if (location.includes('australian') || location.includes('australia')) {
    if (location.includes('melbourne') || parenCity?.toLowerCase() === 'melbourne') {
      return { city: 'Melbourne', country: 'Australia', region: 'Oceania' };
    }
    if (location.includes('sydney') || parenCity?.toLowerCase() === 'sydney') {
      return { city: 'Sydney', country: 'Australia', region: 'Oceania' };
    }
    if (parenCity) return { city: parenCity, country: 'Australia', region: 'Oceania' };
    return { city: 'Australia', country: 'Australia', region: 'Oceania' };
  }
  
  // Belgian patterns
  if (location.includes('belgian') || location.includes('belgium')) {
    if (location.includes('brussels') || parenCity?.toLowerCase() === 'brussels') {
      return { city: 'Brussels', country: 'Belgium', region: 'Europe' };
    }
    if (parenCity) return { city: parenCity, country: 'Belgium', region: 'Europe' };
    return { city: 'Brussels', country: 'Belgium', region: 'Europe' };
  }
  
  // Portuguese patterns
  if (location.includes('portuguese') || location.includes('portugal')) {
    if (location.includes('lisbon') || parenCity?.toLowerCase() === 'lisbon') {
      return { city: 'Lisbon', country: 'Portugal', region: 'Europe' };
    }
    if (parenCity) return { city: parenCity, country: 'Portugal', region: 'Europe' };
    return { city: 'Lisbon', country: 'Portugal', region: 'Europe' };
  }
  
  // Handle slash for dual nationality: "British/German"
  if (location.includes('/')) {
    const parts = country.split('/');
    const firstNationality = parts[0].trim().toLowerCase();
    if (firstNationality.includes('british')) return { city: 'UK', country: 'UK', region: 'Europe' };
    if (firstNationality.includes('german')) return { city: 'Berlin', country: 'Germany', region: 'Europe' };
  }
  
  // Default: use the country field as-is
  return { city: country, country: country, region: 'Unknown' };
}

/**
 * Load artist summaries from canonical database
 */
export async function loadCanonicalArtistsSummary(): Promise<CanonicalArtistSummary[]> {
  const { data: artists, error } = await supabase
    .from('canonical_artists')
    .select(`
      artist_id,
      canonical_name,
      slug,
      city,
      country,
      region,
      rank,
      real_name,
      artist_profiles (
        tags,
        subgenres,
        labels,
        known_for,
        source_priority
      ),
      artist_assets (
        url,
        source_name,
        is_primary
      )
    `)
    .order('rank', { ascending: true, nullsFirst: false });

  if (error) {
    console.error('Failed to load canonical artists:', error);
    return [];
  }

  return (artists || []).map((artist: any) => {
    // Get highest priority profile
    const profiles = artist.artist_profiles || [];
    const primaryProfile = profiles.sort((a: any, b: any) => 
      (b.source_priority || 0) - (a.source_priority || 0)
    )[0] || {};

    // Get primary photo
    const assets = artist.artist_assets || [];
    const primaryAsset = assets.find((a: any) => a.is_primary) || assets[0];

    // Parse location - use city if present, otherwise parse from country
    const location = artist.city 
      ? { city: artist.city, country: artist.country || 'Unknown', region: artist.region || 'Unknown' }
      : parseLocation(artist.country);

    return {
      artist_id: artist.artist_id,
      slug: artist.slug,
      name: artist.canonical_name,
      city: location.city,
      country: location.country,
      region: location.region,
      rank: artist.rank,
      realName: artist.real_name,
      tags: primaryProfile.tags || [],
      photoUrl: primaryAsset?.url || null,
      photoSource: primaryAsset?.source_name || null,
      subgenres: primaryProfile.subgenres || [],
      labels: primaryProfile.labels || [],
      knownFor: primaryProfile.known_for || null,
    };
  });
}

/**
 * Load full artist details from canonical database
 */
export async function loadCanonicalArtistById(slug: string): Promise<FullCanonicalArtist | null> {
  const { data: artist, error } = await supabase
    .from('canonical_artists')
    .select(`
      *,
      artist_profiles (*),
      artist_assets (*),
      artist_gear (*),
      artist_aliases (*)
    `)
    .eq('slug', slug)
    .single();

  if (error || !artist) {
    console.error('Failed to load canonical artist:', error);
    return null;
  }

  return {
    ...artist,
    profiles: (artist.artist_profiles || []) as unknown as CanonicalArtistProfile[],
    assets: (artist.artist_assets || []) as unknown as CanonicalArtistAsset[],
    gear: (artist.artist_gear || []) as unknown as CanonicalArtistGear[],
    aliases: (artist.artist_aliases || []) as unknown as Array<{ alias_id: string; alias_name: string; alias_type: string }>,
  };
}

/**
 * Convert canonical artist to legacy Artist format for backwards compatibility
 */
export function canonicalToLegacyArtist(canonical: FullCanonicalArtist): Artist {
  // Get highest priority profile
  const profiles = canonical.profiles || [];
  const primaryProfile = profiles.sort((a, b) => 
    (b.source_priority || 0) - (a.source_priority || 0)
  )[0] || {} as CanonicalArtistProfile;

  // Get primary photo asset
  const assets = canonical.assets || [];
  const primaryAsset = assets.find(a => a.is_primary) || assets[0];

  // Build image attribution if we have asset data
  let image: ImageAttribution | undefined;
  if (primaryAsset) {
    image = {
      url: primaryAsset.url,
      author: primaryAsset.author || 'Unknown',
      license: primaryAsset.license || 'Unknown',
      licenseUrl: primaryAsset.license_url || '',
      sourceUrl: primaryAsset.source_url || primaryAsset.url,
      sourceName: primaryAsset.source_name || 'Unknown',
    };
  }

  // Get gear by category and consolidate rider notes
  const gearByCategory: Record<string, string[]> = { studio: [], live: [], dj: [] };
  const riderNotesArray: string[] = [];
  
  for (const g of canonical.gear || []) {
    const category = g.gear_category?.toLowerCase() || 'studio';
    if (category in gearByCategory && g.gear_items?.length) {
      gearByCategory[category] = [...gearByCategory[category], ...g.gear_items];
    }
    if (g.rider_notes) {
      riderNotesArray.push(g.rider_notes);
    }
  }
  
  // Combine all rider notes into one
  const combinedRiderNotes = riderNotesArray.length > 0 
    ? riderNotesArray.join(' ') 
    : undefined;

  // Parse location - use city if present, otherwise parse from country
  const location = canonical.city 
    ? { city: canonical.city, country: canonical.country || 'Unknown', region: canonical.region || 'Unknown' }
    : parseLocation(canonical.country);

  // Determine bio - avoid duplication with knownFor
  const knownFor = primaryProfile.known_for || undefined;
  let bio = primaryProfile.bio_long || '';
  
  // If bio_short is the same as known_for, don't use it as bio (prevents duplication)
  // Only use bio_short as fallback if it's different from known_for
  if (!bio && primaryProfile.bio_short) {
    const bioShort = primaryProfile.bio_short.trim();
    const knownForTrimmed = (knownFor || '').trim();
    if (bioShort !== knownForTrimmed) {
      bio = bioShort;
    }
  }

  // Clean up any AI jargon/symbols from bio and known_for
  const cleanText = (text: string | undefined): string | undefined => {
    if (!text) return undefined;
    return text
      .replace(/\*\*/g, '') // Remove markdown bold
      .replace(/\*/g, '')   // Remove asterisks
      .replace(/##/g, '')   // Remove markdown headers
      .replace(/`/g, '')    // Remove code blocks
      .replace(/\[|\]/g, '') // Remove brackets
      .replace(/—/g, ' – ') // Normalize em-dashes
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  };

  return {
    id: canonical.slug,
    name: canonical.canonical_name,
    realName: canonical.real_name || undefined,
    city: location.city,
    country: location.country,
    region: location.region,
    active: canonical.active_years || 'Unknown',
    tags: primaryProfile.tags || primaryProfile.subgenres || [],
    bio: cleanText(bio) || '',
    photoUrl: primaryAsset?.url,
    image,
    labels: primaryProfile.labels || [],
    collaborators: primaryProfile.collaborators || [],
    influences: primaryProfile.influences || [],
    crews: primaryProfile.crews || [],
    careerHighlights: (primaryProfile.career_highlights || []).map(h => cleanText(h) || h),
    keyReleases: (primaryProfile.key_releases as Array<{ title: string; label: string; year: number; format: string }>) || [],
    studioGear: gearByCategory.studio || [],
    liveSetup: gearByCategory.live || [],
    djSetup: gearByCategory.dj || [],
    riderNotes: cleanText(combinedRiderNotes),
    knownFor: cleanText(knownFor),
    topTracks: primaryProfile.top_tracks || [],
    subgenres: primaryProfile.subgenres || [],
    rank: canonical.rank || undefined,
  };
}

/**
 * Convert canonical summary to ArtistSummary format for backwards compatibility
 */
export function canonicalSummaryToLegacy(summary: CanonicalArtistSummary): {
  id: string;
  name: string;
  city: string;
  country: string;
  region: string;
  tags: string[];
  photoUrl?: string;
  photoSource?: string;
  rank?: number;
  labels?: string[];
  subgenres?: string[];
  knownFor?: string;
  realName?: string;
} {
  return {
    id: summary.slug,
    name: summary.name,
    city: summary.city || 'Unknown',
    country: summary.country || 'Unknown',
    region: summary.region || 'Unknown',
    tags: summary.tags,
    photoUrl: summary.photoUrl || undefined,
    photoSource: summary.photoSource || undefined,
    rank: summary.rank || undefined,
    labels: summary.labels,
    subgenres: summary.subgenres,
    knownFor: summary.knownFor || undefined,
    realName: summary.realName || undefined,
  };
}

/**
 * Unified artist loader - uses feature flags to determine data source
 */
export async function loadArtistsSummaryUnified() {
  const useCanonical = useCanonicalArtistsRead();
  
  if (useCanonical) {
    const canonicalSummaries = await loadCanonicalArtistsSummary();
    return canonicalSummaries.map(canonicalSummaryToLegacy);
  }
  
  // Fall back to legacy loader
  const { loadArtistsSummary } = await import('./artists-loader');
  return loadArtistsSummary();
}

/**
 * Unified single artist loader
 */
export async function loadArtistByIdUnified(id: string): Promise<Artist | null> {
  const useCanonical = useCanonicalArtistsRead();
  
  if (useCanonical) {
    const canonical = await loadCanonicalArtistById(id);
    if (canonical) {
      return canonicalToLegacyArtist(canonical);
    }
    return null;
  }
  
  // Fall back to legacy loader
  const { loadArtistById } = await import('./artists-loader');
  return loadArtistById(id);
}
