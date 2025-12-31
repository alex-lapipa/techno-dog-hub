// Lightweight venue summaries for listing pages
// Full data loaded on-demand via async loader

export interface VenueSummary {
  id: string;
  name: string;
  city: string;
  country: string;
  type: 'club' | 'warehouse' | 'outdoor' | 'multi-space';
  active: string;
  tags: string[];
  atmosphere?: string;
  imageUrl?: string;
}

// Dynamically load full venue data
export const loadVenueById = async (id: string) => {
  const { getVenueById } = await import('./venues-legacy');
  return getVenueById(id);
};

// Load all summaries (lightweight)
export const loadVenuesSummary = async (): Promise<VenueSummary[]> => {
  const { venues } = await import('./venues-legacy');
  return venues.map(({ id, name, city, country, type, active, tags, atmosphere, image }) => ({
    id, name, city, country, type, active, tags, atmosphere, imageUrl: image?.url
  }));
};
