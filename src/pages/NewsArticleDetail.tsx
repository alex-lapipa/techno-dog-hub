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
import alexLaunchHero from '@/assets/alex-launch-hero.png';

// Split content into two columns for magazine layout
const splitIntoColumns = (elements: JSX.Element[]): [JSX.Element[], JSX.Element[]] => {
  const midpoint = Math.ceil(elements.length / 2);
  return [elements.slice(0, midpoint), elements.slice(midpoint)];
};

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

  const renderedContent = renderMarkdown(article.body_markdown);
  const [leftColumn, rightColumn] = splitIntoColumns(renderedContent);

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
        {/* Back link */}
        <div className="container mx-auto px-4 md:px-8 mb-6">
          <Link 
            to="/news" 
            className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to News
          </Link>
        </div>

        {/* Full-width hero with background image */}
        <div className="relative w-full mb-10 overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0 flex items-center justify-end pr-8">
            <img 
              src={alexLaunchHero} 
              alt="" 
              className="h-[120%] w-auto max-w-none object-contain opacity-80"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          
          {/* Content overlay */}
          <div className="relative z-10 container mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-12 md:py-16">
            <div className="max-w-3xl">
              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {article.city_tags?.map(tag => (
                  <Badge key={tag} variant="outline" className="font-mono text-[10px] uppercase tracking-widest border-destructive/70 text-destructive bg-background/80">
                    {tag}
                  </Badge>
                ))}
                {article.genre_tags?.map(tag => (
                  <Badge key={tag} variant="secondary" className="font-mono text-[10px] uppercase tracking-widest bg-background/80">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Title */}
              <h1 className="font-mono text-2xl md:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[1.1] text-foreground mb-4">
                {article.title}
              </h1>

              {/* Subtitle */}
              {article.subtitle && (
                <p className="font-mono text-base md:text-lg text-muted-foreground leading-relaxed mb-6">
                  {article.subtitle}
                </p>
              )}

              {/* Byline */}
              <div className="flex items-center gap-3 font-mono text-xs pt-4 border-t border-destructive/40">
                <span className="font-semibold text-destructive">By {article.author_pseudonym}</span>
                <span className="text-muted-foreground/50">|</span>
                <span className="text-muted-foreground">{formatDate(article.published_at || article.created_at)}</span>
              </div>
            </div>
          </div>
          
          {/* Bottom border accent */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-destructive via-destructive/50 to-transparent" />
        </div>

        {/* Two-column magazine layout */}
        <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
          <article className="max-w-6xl mx-auto">
            {/* Two-column content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 xl:gap-x-16 gap-y-8">
              {/* Left Column */}
              <div className="space-y-1">
                {leftColumn}
              </div>

              {/* Right Column - content + chat box */}
              <div className="space-y-1">
                {rightColumn}
                
                {/* Embedded Dog Chat Box - fills right column width */}
                <div className="mt-16 border-2 border-logo-green/50 bg-gradient-to-br from-logo-green/5 to-background overflow-hidden shadow-[0_0_20px_hsl(100_100%_60%/0.1)]">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-logo-green/30 bg-logo-green/10">
                    <DogSilhouette className="w-6 h-6 text-logo-green drop-shadow-[0_0_6px_hsl(100_100%_60%/0.6)]" />
                    <span className="font-mono text-sm uppercase tracking-wider text-foreground font-semibold">
                      Ask Techno Dog
                    </span>
                  </div>
                  <div className="h-[400px]">
                    <DogChat />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer metadata - Two column layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-8 border-t border-border">
              {article.entity_tags && article.entity_tags.length > 0 && (
                <div>
                  <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
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
                <div>
                  <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
                    Sources
                  </div>
                  <ul className="space-y-2">
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
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NewsArticleDetail;