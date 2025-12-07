// Lightweight festival summaries for listing pages
// Full data loaded on-demand via async loader

export interface FestivalSummary {
  id: string;
  name: string;
  city: string;
  country: string;
  type: 'outdoor' | 'indoor' | 'hybrid';
  founded: number;
  months: string[];
  tags: string[];
  description?: string;
}

// Dynamically load full festival data
export const loadFestivalById = async (id: string) => {
  const { getFestivalById } = await import('./festivals-legacy');
  return getFestivalById(id);
};

// Load all summaries (lightweight)
export const loadFestivalsSummary = async (): Promise<FestivalSummary[]> => {
  const { festivals } = await import('./festivals-legacy');
  return festivals.map(({ id, name, city, country, type, founded, months, tags, description }) => ({
    id, name, city, country, type, founded, months, tags, description
  }));
};
