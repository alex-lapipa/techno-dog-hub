// Lightweight artist summaries for listing pages
// Full data loaded on-demand via async loader

export interface ArtistSummary {
  id: string;
  name: string;
  city: string;
  country: string;
  region: string;
  tags: string[];
}

// Dynamically load full artist data
export const loadArtistById = async (id: string) => {
  const { getArtistById } = await import('./artists-legacy');
  return getArtistById(id);
};

// Load all summaries (lightweight)
export const loadArtistsSummary = async (): Promise<ArtistSummary[]> => {
  const { artists } = await import('./artists-legacy');
  return artists.map(({ id, name, city, country, region, tags }) => ({
    id, name, city, country, region, tags
  }));
};
