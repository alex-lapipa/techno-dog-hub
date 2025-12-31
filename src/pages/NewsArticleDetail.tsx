import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageSEO from '@/components/PageSEO';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import DogChat from '@/components/admin/DogChat';
import DogSilhouette from '@/components/DogSilhouette';

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

  // Parse inline markdown for bold, italic, inline code
  const parseInlineMarkdown = (text: string): JSX.Element => {
    const parts: (string | JSX.Element)[] = [];
    let remaining = text;
    let keyIndex = 0;

    while (remaining.length > 0) {
      // Bold **text**
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      // Italic *text* (not preceded by *)
      const italicMatch = remaining.match(/(?<!\*)\*([^*]+?)\*(?!\*)/);
      // Inline code `text`
      const codeMatch = remaining.match(/`(.+?)`/);

      const matches = [
        boldMatch ? { type: 'bold', match: boldMatch, index: boldMatch.index! } : null,
        italicMatch ? { type: 'italic', match: italicMatch, index: italicMatch.index! } : null,
        codeMatch ? { type: 'code', match: codeMatch, index: codeMatch.index! } : null,
      ].filter(Boolean).sort((a, b) => a!.index - b!.index);

      if (matches.length === 0) {
        parts.push(remaining);
        break;
      }

      const first = matches[0]!;
      if (first.index > 0) {
        parts.push(remaining.substring(0, first.index));
      }

      if (first.type === 'bold') {
        parts.push(
          <strong key={keyIndex++} className="font-semibold text-foreground">
            {first.match![1]}
          </strong>
        );
      } else if (first.type === 'italic') {
        parts.push(
          <em key={keyIndex++} className="italic text-muted-foreground/90">
            {first.match![1]}
          </em>
        );
      } else if (first.type === 'code') {
        parts.push(
          <code key={keyIndex++} className="bg-muted px-1.5 py-0.5 text-sm text-primary">
            {first.match![1]}
          </code>
        );
      }

      remaining = remaining.substring(first.index + first.match![0].length);
    }

    return <>{parts}</>;
  };

  const renderMarkdown = (markdown: string) => {
    const lines = markdown.split('\n');
    const elements: JSX.Element[] = [];
    let currentParagraph: string[] = [];
    let inList = false;
    let listItems: string[] = [];
    let listType: 'ul' | 'ol' = 'ul';

    const flushList = () => {
      if (listItems.length > 0) {
        const ListTag = listType;
        elements.push(
          <ListTag key={elements.length} className={`${listType === 'ol' ? 'list-decimal' : 'list-none'} ml-4 my-4 space-y-2`}>
            {listItems.map((item, i) => (
              <li key={i} className="font-mono text-[15px] leading-relaxed text-foreground/90 pl-2 border-l border-muted-foreground/30">
                {parseInlineMarkdown(item)}
              </li>
            ))}
          </ListTag>
        );
        listItems = [];
        inList = false;
      }
    };

    const flushParagraph = () => {
      flushList();
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={elements.length} className="font-mono text-[15px] leading-[1.8] text-foreground/85 mb-5">
            {parseInlineMarkdown(currentParagraph.join(' '))}
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

      // Main section headers (# )
      if (trimmedLine.startsWith('# ')) {
        flushParagraph();
        elements.push(
          <h2 key={elements.length} className="font-mono text-xl md:text-2xl font-semibold uppercase tracking-wide text-foreground mt-10 mb-4 border-b border-border pb-2">
            {trimmedLine.substring(2)}
          </h2>
        );
      } 
      // Subsection headers (## )
      else if (trimmedLine.startsWith('## ')) {
        flushParagraph();
        elements.push(
          <h3 key={elements.length} className="font-mono text-lg font-medium uppercase tracking-wider text-logo-green mt-8 mb-3">
            {trimmedLine.substring(3)}
          </h3>
        );
      } 
      // Minor headers (### )
      else if (trimmedLine.startsWith('### ')) {
        flushParagraph();
        elements.push(
          <h4 key={elements.length} className="font-mono text-base font-medium text-foreground/90 mt-6 mb-2">
            {trimmedLine.substring(4)}
          </h4>
        );
      } 
      // Blockquotes
      else if (trimmedLine.startsWith('> ')) {
        flushParagraph();
        elements.push(
          <blockquote key={elements.length} className="border-l-2 border-logo-green/60 pl-5 py-2 my-6 italic text-muted-foreground text-[15px] leading-relaxed bg-muted/20">
            {parseInlineMarkdown(trimmedLine.substring(2))}
          </blockquote>
        );
      } 
      // Numbered lists
      else if (/^\d+\.\s/.test(trimmedLine)) {
        flushParagraph();
        if (!inList || listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        inList = true;
        listItems.push(trimmedLine.replace(/^\d+\.\s/, ''));
      }
      // Bullet lists
      else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        flushParagraph();
        if (!inList || listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        inList = true;
        listItems.push(trimmedLine.substring(2));
      } 
      // Signature line (starts with —)
      else if (trimmedLine.startsWith('—') || trimmedLine.startsWith('--')) {
        flushParagraph();
        elements.push(
          <p key={elements.length} className="font-mono text-sm text-muted-foreground mt-8 pt-4 border-t border-border/50">
            {trimmedLine}
          </p>
        );
      }
      // Regular paragraph
      else {
        if (inList) flushList();
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

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.subtitle || article.title,
    "url": `https://techno.dog/news/${article.id}`,
    "datePublished": article.published_at || article.created_at,
    "author": {
      "@type": "Person",
      "name": article.author_pseudonym || "techno.dog"
    },
    "publisher": {
      "@type": "Organization",
      "name": "techno.dog",
      "url": "https://techno.dog"
    },
    "keywords": [...article.genre_tags, ...article.city_tags, ...article.entity_tags].join(", ")
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO
        title={article.title}
        description={article.subtitle || `Techno news: ${article.title}`}
        path={`/news/${article.id}`}
        type="article"
        articlePublishedTime={article.published_at || article.created_at}
        articleAuthor={article.author_pseudonym || "techno.dog"}
        articleSection="Techno News"
        articleTags={[...article.genre_tags, ...article.city_tags]}
        structuredData={articleSchema}
      />
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

          <article className="max-w-2xl lg:max-w-3xl">
            <header className="mb-10">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                {article.city_tags?.map(tag => (
                  <Badge key={tag} variant="outline" className="font-mono text-[10px] uppercase tracking-widest">
                    {tag}
                  </Badge>
                ))}
                {article.genre_tags?.map(tag => (
                  <Badge key={tag} variant="secondary" className="font-mono text-[10px] uppercase tracking-widest">
                    {tag}
                  </Badge>
                ))}
              </div>

              <h1 className="font-mono text-2xl md:text-4xl lg:text-5xl font-semibold uppercase tracking-tight mb-4 leading-tight">
                {article.title}
              </h1>

              {article.subtitle && (
                <p className="font-mono text-base md:text-lg font-light text-muted-foreground mb-6 leading-relaxed">
                  {article.subtitle}
                </p>
              )}

              <div className="flex items-center gap-4 font-mono text-xs text-muted-foreground border-t border-border pt-4">
                <span className="font-medium text-foreground/80">By {article.author_pseudonym}</span>
                <span className="text-border">•</span>
                <span className="font-light">{formatDate(article.published_at || article.created_at)}</span>
              </div>
            </header>

            <div className="space-y-1">
              {renderMarkdown(article.body_markdown)}
            </div>

            {/* Embedded Dog Chat Box */}
            <div className="mt-12 mb-8 border-2 border-logo-green/50 bg-gradient-to-br from-logo-green/5 to-background rounded-lg overflow-hidden shadow-[0_0_30px_hsl(100_100%_60%/0.1)]">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-logo-green/30 bg-logo-green/10">
                <DogSilhouette className="w-8 h-8 text-logo-green drop-shadow-[0_0_8px_hsl(100_100%_60%/0.6)]" />
                <div>
                  <h3 className="font-mono text-sm uppercase tracking-wider text-foreground font-semibold">
                    Want to know more?
                  </h3>
                  <p className="font-mono text-xs text-muted-foreground">
                    Ask our Techno Dog anything about techno.dog
                  </p>
                </div>
              </div>
              <div className="h-[400px]">
                <DogChat />
              </div>
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