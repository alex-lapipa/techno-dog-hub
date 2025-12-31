import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GlobalStats {
  artists: number;
  gear: number;
  labels: number;
  news: number;
  books: number;
  documentaries: number;
}

async function fetchGlobalStats(): Promise<GlobalStats> {
  const [artistsRes, gearRes, labelsRes, newsRes, booksRes, docsRes] = await Promise.all([
    supabase.from('dj_artists').select('id', { count: 'exact', head: true }),
    supabase.from('gear_catalog').select('id', { count: 'exact', head: true }),
    supabase.from('labels').select('id', { count: 'exact', head: true }),
    supabase.from('td_news_articles').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('books').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('documentaries').select('id', { count: 'exact', head: true }).eq('status', 'published'),
  ]);

  return {
    artists: artistsRes.count || 0,
    gear: gearRes.count || 0,
    labels: labelsRes.count || 0,
    news: newsRes.count || 0,
    books: booksRes.count || 0,
    documentaries: docsRes.count || 0,
  };
}

export function useGlobalStats() {
  return useQuery({
    queryKey: ['global-stats'],
    queryFn: fetchGlobalStats,
    staleTime: 5 * 60 * 1000, // 5 minutes - data rarely changes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
  });
}

// Helper to calculate total and percentages
export function useGlobalStatsWithMetrics() {
  const query = useGlobalStats();
  
  const stats = query.data;
  const total = stats 
    ? stats.artists + stats.gear + stats.labels + stats.news + stats.books + stats.documentaries 
    : 0;
  
  const pct = (val: number) => total > 0 ? Math.round((val / total) * 100) : 0;
  
  return {
    ...query,
    total,
    pct,
  };
}
