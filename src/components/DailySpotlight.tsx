import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface DjArtist {
  id: number;
  artist_name: string;
  rank: number;
  known_for: string | null;
  nationality: string | null;
  labels: string[] | null;
  subgenres: string[] | null;
}

interface NewsArticle {
  id: string;
  title: string;
  subtitle: string | null;
  author_pseudonym: string;
  published_at: string | null;
  genre_tags: string[] | null;
  city_tags: string[] | null;
}

const DailySpotlight = () => {
  const { language } = useLanguage();
  const [artist, setArtist] = useState<DjArtist | null>(null);
  const [news, setNews] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpotlight = async () => {
      try {
        // Use date seed for daily rotation
        const today = new Date();
        const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        
        // Fetch total artist count
        const { count } = await supabase
          .from('dj_artists')
          .select('*', { count: 'exact', head: true });
        
        if (count && count > 0) {
          // Select artist based on date seed
          const artistIndex = dateSeed % count;
          const { data: artistData } = await supabase
            .from('dj_artists')
            .select('id, artist_name, rank, known_for, nationality, labels, subgenres')
            .range(artistIndex, artistIndex)
            .single();
          
          if (artistData) {
            setArtist(artistData);
          }
        }

        // Fetch latest published news
        const { data: newsData } = await supabase
          .from('td_news_articles')
          .select('id, title, subtitle, author_pseudonym, published_at, genre_tags, city_tags')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(1)
          .single();
        
        if (newsData) {
          setNews(newsData);
        }
      } catch (error) {
        console.error('Error fetching spotlight:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpotlight();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const createArtistSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[()]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  };

  if (loading) {
    return (
      <section className="border-b border-border">
        <div className="container mx-auto px-4 md:px-8 py-16">
          <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-6">
            // {language === 'en' ? 'Daily spotlight' : 'Destacado del día'}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-64 border border-border" />
            <Skeleton className="h-64 border border-border" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-border">
      <div className="container mx-auto px-4 md:px-8 py-16">
        <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-6">
          // {language === 'en' ? 'Daily spotlight' : 'Destacado del día'}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Featured Artist */}
          {artist && (
            <Link 
              to={`/artists/${createArtistSlug(artist.artist_name)}`}
              className="group block border border-foreground bg-card p-6 hover:bg-foreground hover:text-background transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground group-hover:text-background/70">
                  {language === 'en' ? 'Artist of the day' : 'Artista del día'}
                </span>
                <Badge variant="outline" className="font-mono text-[10px] group-hover:border-background/50 group-hover:text-background/70">
                  #{artist.rank}
                </Badge>
              </div>
              
              <h3 className="font-mono text-2xl md:text-3xl uppercase tracking-tight mb-3 group-hover:animate-glitch">
                {artist.artist_name}
              </h3>
              
              {artist.nationality && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-background/70 mb-4">
                  <MapPin className="w-3 h-3" />
                  <span className="font-mono text-xs">{artist.nationality}</span>
                </div>
              )}
              
              {artist.known_for && (
                <p className="font-mono text-xs text-muted-foreground group-hover:text-background/70 mb-4 line-clamp-3 leading-relaxed">
                  {artist.known_for}
                </p>
              )}
              
              {artist.subgenres && artist.subgenres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {artist.subgenres.slice(0, 3).map((genre) => (
                    <Badge 
                      key={genre} 
                      variant="secondary" 
                      className="font-mono text-[10px] uppercase group-hover:bg-background/20 group-hover:text-background"
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider mt-auto pt-4 border-t border-border group-hover:border-background/30">
                <span>{language === 'en' ? 'View profile' : 'Ver perfil'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          )}

          {/* Latest News */}
          {news ? (
            <Link 
              to={`/news/${news.id}`}
              className="group block border border-border p-6 hover:bg-card transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  {language === 'en' ? 'Latest transmission' : 'Última transmisión'}
                </span>
              </div>
              
              <h3 className="font-mono text-xl md:text-2xl uppercase tracking-tight mb-2 group-hover:animate-glitch">
                {news.title}
              </h3>
              
              {news.subtitle && (
                <p className="font-mono text-sm text-muted-foreground mb-4 line-clamp-2">
                  {news.subtitle}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-4">
                {news.published_at && (
                  <div className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(news.published_at)}</span>
                  </div>
                )}
                <span className="font-mono">by {news.author_pseudonym}</span>
              </div>
              
              {(news.city_tags || news.genre_tags) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {news.city_tags?.slice(0, 2).map((city) => (
                    <Badge key={city} variant="outline" className="font-mono text-[10px] uppercase">
                      {city}
                    </Badge>
                  ))}
                  {news.genre_tags?.slice(0, 2).map((genre) => (
                    <Badge key={genre} variant="secondary" className="font-mono text-[10px] uppercase">
                      {genre}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider mt-auto pt-4 border-t border-border">
                <span>{language === 'en' ? 'Read article' : 'Leer artículo'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ) : (
            <Link 
              to="/news"
              className="group block border border-border p-6 hover:bg-card transition-colors flex flex-col justify-center"
            >
              <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
                // {language === 'en' ? 'Latest transmission' : 'Última transmisión'}
              </div>
              <h3 className="font-mono text-2xl uppercase tracking-tight mb-3 group-hover:animate-glitch">
                {language === 'en' ? 'News & Features' : 'Noticias y Reportajes'}
              </h3>
              <p className="font-mono text-sm text-muted-foreground mb-4">
                {language === 'en' 
                  ? 'The latest transmissions from the underground.' 
                  : 'Las últimas transmisiones del underground.'}
              </p>
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider">
                <span>{language === 'en' ? 'Browse all' : 'Ver todo'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default DailySpotlight;
