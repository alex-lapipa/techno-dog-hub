import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

interface NewsArticle {
  id: string;
  title: string;
  subtitle: string | null;
  body_markdown: string;
  author_pseudonym: string;
  city_tags: string[];
  genre_tags: string[];
  entity_tags: string[];
  confidence_score: number;
  published_at: string;
  created_at: string;
}

const PublishedNewsArticles = () => {
  const { language } = useLanguage();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data } = await supabase
        .from('td_news_articles' as any)
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(10);

      setArticles((data as unknown as NewsArticle[]) || []);
    } catch (err) {
      console.error('Error fetching articles:', err);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="py-8 text-center text-muted-foreground font-mono text-sm">
        {language === 'en' ? 'Loading articles...' : 'Cargando artículos...'}
      </div>
    );
  }

  if (articles.length === 0) {
    return null; // Don't render if no published articles
  }

  const featured = articles.slice(0, 2);
  const regular = articles.slice(2);

  const getCategoryFromTags = (article: NewsArticle): string => {
    if (article.genre_tags?.includes('interview')) return language === 'en' ? 'INTERVIEW' : 'ENTREVISTA';
    if (article.city_tags?.length > 0) return language === 'en' ? 'SCENE' : 'ESCENA';
    return language === 'en' ? 'NEWS' : 'NOTICIAS';
  };

  const getExcerpt = (markdown: string, maxLength = 200): string => {
    const plainText = markdown.replace(/[#*_`\[\]]/g, '').trim();
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength).trim() + '...';
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em]">
          // {language === 'en' ? 'Community-Agent generated stories' : 'Historias generadas por comunidad-agente'}
        </div>
      </div>

      {/* Featured Articles */}
      {featured.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {featured.map((article) => (
            <Link
              key={article.id}
              to={`/news/${article.id}`}
              className="group block border border-border p-6 md:p-8 hover:bg-card transition-colors"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-foreground border border-foreground px-2 py-1 group-hover:animate-glitch">
                  {getCategoryFromTags(article)}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {article.author_pseudonym}
                </span>
              </div>
              <h2 className="font-mono text-2xl md:text-3xl uppercase tracking-tight mb-4 group-hover:animate-glitch">
                {article.title}
              </h2>
              {article.subtitle && (
                <p className="font-mono text-sm text-muted-foreground leading-relaxed mb-4">
                  {article.subtitle}
                </p>
              )}
              <p className="font-mono text-sm text-muted-foreground leading-relaxed mb-6">
                {getExcerpt(article.body_markdown)}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground group-hover:text-foreground">
                  <span>{language === 'en' ? 'Read' : 'Leer'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {formatDate(article.published_at)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Regular Articles List */}
      {regular.length > 0 && (
        <div className="border-t border-border">
          {regular.map((article) => (
            <Link
              key={article.id}
              to={`/news/${article.id}`}
              className="group flex items-start justify-between gap-4 border-b border-border py-6 hover:bg-card transition-colors px-4 -mx-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                    {getCategoryFromTags(article)}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatDate(article.published_at)}
                  </span>
                </div>
                <h3 className="font-mono text-lg md:text-xl uppercase tracking-tight group-hover:animate-glitch">
                  {article.title}
                </h3>
                {article.city_tags?.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {article.city_tags.slice(0, 3).map(tag => (
                      <span key={tag} className="font-mono text-xs text-muted-foreground">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 group-hover:-translate-y-1 transition-all mt-2" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublishedNewsArticles;
