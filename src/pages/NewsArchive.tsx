import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Filter, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NewsArticle {
  id: string;
  title: string;
  subtitle: string | null;
  body_markdown: string;
  author_pseudonym: string;
  city_tags: string[] | null;
  genre_tags: string[] | null;
  entity_tags: string[] | null;
  confidence_score: number | null;
  published_at: string | null;
  created_at: string;
}

const NewsArchive = () => {
  const { language } = useLanguage();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [allCityTags, setAllCityTags] = useState<string[]>([]);
  const [allGenreTags, setAllGenreTags] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data } = await supabase
        .from('td_news_articles' as any)
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      const articlesData = (data as unknown as NewsArticle[]) || [];
      setArticles(articlesData);

      // Extract unique tags
      const cities = new Set<string>();
      const genres = new Set<string>();
      
      articlesData.forEach(article => {
        article.city_tags?.forEach(tag => cities.add(tag));
        article.genre_tags?.forEach(tag => genres.add(tag));
      });

      setAllCityTags(Array.from(cities).sort());
      setAllGenreTags(Array.from(genres).sort());
    } catch (err) {
      console.error('Error fetching articles:', err);
    }
    setLoading(false);
  };

  const filteredArticles = articles.filter(article => {
    const cityMatch = selectedCities.length === 0 || 
      selectedCities.some(city => article.city_tags?.includes(city));
    const genreMatch = selectedGenres.length === 0 || 
      selectedGenres.some(genre => article.genre_tags?.includes(genre));
    return cityMatch && genreMatch;
  });

  const toggleCity = (city: string) => {
    setSelectedCities(prev => 
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    );
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const clearFilters = () => {
    setSelectedCities([]);
    setSelectedGenres([]);
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getExcerpt = (markdown: string, maxLength = 150): string => {
    const plainText = markdown.replace(/[#*_`\[\]]/g, '').trim();
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...' 
      : plainText;
  };

  const activeFilterCount = selectedCities.length + selectedGenres.length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO 
        title={language === 'en' ? "News Archive | TechnoDog" : "Archivo de Noticias | TechnoDog"}
        description={language === 'en' 
          ? "Browse all techno news articles filtered by city and genre. Underground techno coverage from around the world."
          : "Explora todos los artículos de noticias techno filtrados por ciudad y género. Cobertura techno underground de todo el mundo."}
        path="/news/archive"
        locale={language}
      />
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <div className="border-b border-border pb-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              to="/news" 
              className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ← {language === 'en' ? 'Back to News' : 'Volver a Noticias'}
            </Link>
          </div>
          <h1 className="font-mono text-4xl md:text-6xl uppercase tracking-tighter mb-4">
            {language === 'en' ? 'Archive' : 'Archivo'}
          </h1>
          <p className="font-mono text-muted-foreground max-w-xl">
            {language === 'en' 
              ? 'All published articles. Filter by city or genre to find what you\'re looking for.'
              : 'Todos los artículos publicados. Filtra por ciudad o género para encontrar lo que buscas.'}
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="font-mono text-xs uppercase tracking-wider"
          >
            <Filter className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Filters' : 'Filtros'}
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="font-mono text-xs uppercase tracking-wider ml-2"
            >
              <X className="w-4 h-4 mr-1" />
              {language === 'en' ? 'Clear' : 'Limpiar'}
            </Button>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border border-border p-6 mb-8 bg-card/50">
            {/* City Tags */}
            {allCityTags.length > 0 && (
              <div className="mb-6">
                <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
                  {language === 'en' ? 'Cities' : 'Ciudades'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allCityTags.map(city => (
                    <button
                      key={city}
                      onClick={() => toggleCity(city)}
                      className={`font-mono text-xs uppercase px-3 py-1.5 border transition-colors ${
                        selectedCities.includes(city)
                          ? 'bg-foreground text-background border-foreground'
                          : 'border-border hover:border-foreground text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Genre Tags */}
            {allGenreTags.length > 0 && (
              <div>
                <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
                  {language === 'en' ? 'Genres' : 'Géneros'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allGenreTags.map(genre => (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={`font-mono text-xs uppercase px-3 py-1.5 border transition-colors ${
                        selectedGenres.includes(genre)
                          ? 'bg-foreground text-background border-foreground'
                          : 'border-border hover:border-foreground text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="font-mono text-xs text-muted-foreground mb-6">
          {loading ? (
            language === 'en' ? 'Loading...' : 'Cargando...'
          ) : (
            <>
              {filteredArticles.length} {language === 'en' ? 'articles' : 'artículos'}
              {activeFilterCount > 0 && (
                <span className="ml-1">
                  ({language === 'en' ? 'filtered' : 'filtrados'})
                </span>
              )}
            </>
          )}
        </div>

        {/* Articles Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Link
                key={article.id}
                to={`/news/${article.id}`}
                className="group block border border-border p-6 hover:bg-card transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatDate(article.published_at)}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                
                <h2 className="font-mono text-lg uppercase tracking-tight mb-3 group-hover:animate-glitch line-clamp-2">
                  {article.title}
                </h2>
                
                <p className="font-mono text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                  {getExcerpt(article.body_markdown)}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {article.city_tags?.slice(0, 2).map(tag => (
                    <span 
                      key={tag} 
                      className="font-mono text-[10px] uppercase px-2 py-0.5 bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                  {article.genre_tags?.slice(0, 2).map(tag => (
                    <span 
                      key={tag} 
                      className="font-mono text-[10px] uppercase px-2 py-0.5 border border-border text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredArticles.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border">
            <p className="font-mono text-muted-foreground mb-4">
              {language === 'en' 
                ? 'No articles match your filters.'
                : 'Ningún artículo coincide con tus filtros.'}
            </p>
            <Button
              variant="outline"
              onClick={clearFilters}
              className="font-mono text-xs uppercase"
            >
              {language === 'en' ? 'Clear Filters' : 'Limpiar Filtros'}
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default NewsArchive;
