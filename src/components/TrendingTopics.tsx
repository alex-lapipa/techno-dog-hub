import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface TagCount {
  tag: string;
  count: number;
}

const TrendingTopics = () => {
  const { language } = useLanguage();
  const [cityTags, setCityTags] = useState<TagCount[]>([]);
  const [genreTags, setGenreTags] = useState<TagCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingTags();
  }, []);

  const fetchTrendingTags = async () => {
    try {
      const { data } = await supabase
        .from('td_news_articles' as any)
        .select('city_tags, genre_tags')
        .eq('status', 'published');

      if (data) {
        // Count city tags
        const cityCount: Record<string, number> = {};
        const genreCount: Record<string, number> = {};

        data.forEach((article: any) => {
          article.city_tags?.forEach((tag: string) => {
            cityCount[tag] = (cityCount[tag] || 0) + 1;
          });
          article.genre_tags?.forEach((tag: string) => {
            genreCount[tag] = (genreCount[tag] || 0) + 1;
          });
        });

        // Sort and take top 8
        const sortedCities = Object.entries(cityCount)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8);

        const sortedGenres = Object.entries(genreCount)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);

        setCityTags(sortedCities);
        setGenreTags(sortedGenres);
      }
    } catch (err) {
      console.error('Error fetching trending tags:', err);
    }
    setLoading(false);
  };

  if (loading || (cityTags.length === 0 && genreTags.length === 0)) {
    return null;
  }

  return (
    <div className="border border-border p-6 mb-12">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-4 h-4 text-muted-foreground" />
        <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          // {language === 'en' ? 'Trending Topics' : 'Temas Tendencia'}
        </h2>
      </div>

      <div className="space-y-6">
        {/* City Tags */}
        {cityTags.length > 0 && (
          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
              {language === 'en' ? 'Cities' : 'Ciudades'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {cityTags.map(({ tag, count }) => (
                <Link
                  key={tag}
                  to={`/news/archive?city=${encodeURIComponent(tag)}`}
                  className="group flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 border border-border hover:border-foreground hover:bg-card transition-colors"
                >
                  <span className="group-hover:animate-glitch">{tag}</span>
                  <span className="text-muted-foreground text-[10px]">({count})</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Genre Tags */}
        {genreTags.length > 0 && (
          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
              {language === 'en' ? 'Genres' : 'Géneros'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {genreTags.map(({ tag, count }) => (
                <Link
                  key={tag}
                  to={`/news/archive?genre=${encodeURIComponent(tag)}`}
                  className="group flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 bg-muted/50 hover:bg-muted transition-colors"
                >
                  <span className="group-hover:animate-glitch">{tag}</span>
                  <span className="text-muted-foreground text-[10px]">({count})</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingTopics;
