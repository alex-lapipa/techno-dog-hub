import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';

interface NewsArticle {
  id: string;
  title: string;
  subtitle: string | null;
  body_markdown: string;
  author_pseudonym: string;
  city_tags: string[];
  genre_tags: string[];
  entity_tags: string[];
  source_urls: string[];
  confidence_score: number;
  status: string;
  published_at: string | null;
  created_at: string;
}

const NewsArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchArticle(id);
    }
  }, [id]);

  const fetchArticle = async (articleId: string) => {
    try {
      const { data, error } = await supabase
        .from('td_news_articles' as any)
        .select('*')
        .eq('id', articleId)
        .single();

      if (error) throw error;
      setArticle(data as unknown as NewsArticle);
    } catch (err) {
      console.error('Error fetching article:', err);
    }
    setLoading(false);
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderMarkdown = (markdown: string) => {
    const lines = markdown.split('\n');
    const elements: JSX.Element[] = [];
    let currentParagraph: string[] = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={elements.length} className="mb-4">
            {currentParagraph.join(' ')}
          </p>
        );
        currentParagraph = [];
      }
    };

    lines.forEach((line) => {
      const trimmedLine = line.trim();

      if (trimmedLine === '') {
        flushParagraph();
        return;
      }

      if (trimmedLine.startsWith('# ')) {
        flushParagraph();
        elements.push(
          <h2 key={elements.length} className="font-mono text-2xl uppercase tracking-tight mt-8 mb-4">
            {trimmedLine.substring(2)}
          </h2>
        );
      } else if (trimmedLine.startsWith('## ')) {
        flushParagraph();
        elements.push(
          <h3 key={elements.length} className="font-mono text-xl uppercase tracking-tight mt-6 mb-3">
            {trimmedLine.substring(3)}
          </h3>
        );
      } else if (trimmedLine.startsWith('### ')) {
        flushParagraph();
        elements.push(
          <h4 key={elements.length} className="font-mono text-lg uppercase tracking-tight mt-4 mb-2">
            {trimmedLine.substring(4)}
          </h4>
        );
      } else if (trimmedLine.startsWith('> ')) {
        flushParagraph();
        elements.push(
          <blockquote key={elements.length} className="border-l-2 border-foreground pl-4 my-4 italic text-muted-foreground">
            {trimmedLine.substring(2)}
          </blockquote>
        );
      } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        flushParagraph();
        elements.push(
          <li key={elements.length} className="ml-4 mb-1">
            {trimmedLine.substring(2)}
          </li>
        );
      } else {
        currentParagraph.push(trimmedLine);
      }
    });

    flushParagraph();
    return elements;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="pt-24 lg:pt-16 pb-16">
          <div className="container mx-auto px-4 md:px-8">
            <div className="font-mono text-sm text-muted-foreground animate-pulse">
              Loading...
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="pt-24 lg:pt-16 pb-16">
          <div className="container mx-auto px-4 md:px-8">
            <div className="font-mono text-sm text-muted-foreground">
              Article not found.
            </div>
            <Link 
              to="/news" 
              className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mt-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to News
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-24 lg:pt-16 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <Link 
            to="/news" 
            className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to News
          </Link>

          <article className="max-w-3xl">
            <header className="mb-8">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {article.city_tags?.map(tag => (
                  <Badge key={tag} variant="outline" className="font-mono text-xs uppercase">
                    {tag}
                  </Badge>
                ))}
                {article.genre_tags?.map(tag => (
                  <Badge key={tag} variant="secondary" className="font-mono text-xs uppercase">
                    {tag}
                  </Badge>
                ))}
              </div>

              <h1 className="font-mono text-3xl md:text-5xl uppercase tracking-tight mb-4">
                {article.title}
              </h1>

              {article.subtitle && (
                <p className="font-mono text-lg text-muted-foreground mb-6">
                  {article.subtitle}
                </p>
              )}

              <div className="flex items-center gap-4 font-mono text-sm text-muted-foreground border-t border-border pt-4">
                <span>By {article.author_pseudonym}</span>
                <span>•</span>
                <span>{formatDate(article.published_at || article.created_at)}</span>
              </div>
            </header>

            <div className="font-mono text-base leading-relaxed">
              {renderMarkdown(article.body_markdown)}
            </div>

            {article.entity_tags && article.entity_tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-border">
                <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
                  Mentioned
                </div>
                <div className="flex flex-wrap gap-2">
                  {article.entity_tags.map(tag => (
                    <Badge key={tag} variant="outline" className="font-mono text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {article.source_urls && article.source_urls.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
                  Sources
                </div>
                <ul className="space-y-1">
                  {article.source_urls.map((url, i) => (
                    <li key={i}>
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-mono text-sm text-primary hover:underline break-all"
                      >
                        {url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NewsArticleDetail;