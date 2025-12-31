import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
import { ArrowLeft, BookOpen, ExternalLink, Calendar, User, Tag, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookCover } from "@/components/books/BookCover";

interface Book {
  id: string;
  title: string;
  author: string;
  category_id: string | null;
  cover_url: string | null;
  description: string | null;
  why_read: string | null;
  purchase_url: string | null;
  year_published: number | null;
  publisher: string | null;
  pages: number | null;
  isbn: string | null;
  curator_notes: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface RelatedBook {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
}

const BookDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: book, isLoading } = useQuery({
    queryKey: ["book", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select(`
          *,
          category:book_categories(id, name, slug)
        `)
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Book;
    },
    enabled: !!id,
  });

  // Fetch related books from same category
  const { data: relatedBooks = [] } = useQuery({
    queryKey: ["related-books", book?.category_id],
    queryFn: async () => {
      if (!book?.category_id) return [];
      const { data, error } = await supabase
        .from("books")
        .select("id, title, author, cover_url")
        .eq("category_id", book.category_id)
        .eq("status", "published")
        .neq("id", book.id)
        .limit(4);
      if (error) throw error;
      return data as RelatedBook[];
    },
    enabled: !!book?.category_id,
  });

  // Fetch knowledge chunks for this book
  const { data: knowledgeChunks = [] } = useQuery({
    queryKey: ["book-knowledge", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("id, title, content, metadata")
        .eq("source", `book:${id}`)
        .order("created_at");
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <PageLayout title="Loading..." path="/books">
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-logo-green" />
        </div>
      </PageLayout>
    );
  }

  if (!book) {
    return (
      <PageLayout title="Book Not Found" path="/books">
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <BookOpen className="w-12 h-12 text-muted-foreground/30" />
          <p className="font-mono text-sm text-muted-foreground">Book not found</p>
          <Link 
            to="/books" 
            className="font-mono text-xs text-logo-green hover:underline"
          >
            ← Back to Library
          </Link>
        </div>
      </PageLayout>
    );
  }

  // Parse knowledge sections
  const coreThesis = knowledgeChunks.find(c => (c.metadata as any)?.section === 'core_thesis');
  const keyThemes = knowledgeChunks.find(c => (c.metadata as any)?.section === 'key_themes');
  const historicalFacts = knowledgeChunks.find(c => (c.metadata as any)?.section === 'historical_facts');
  const philosophicalFrameworks = knowledgeChunks.find(c => (c.metadata as any)?.section === 'philosophical_frameworks');
  const quotablePassages = knowledgeChunks.find(c => (c.metadata as any)?.section === 'quotable_passages');
  const technoConnections = knowledgeChunks.find(c => (c.metadata as any)?.section === 'techno_connections');

  return (
    <PageLayout title={book.title} path={`/books/${id}`}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link 
          to="/books" 
          className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-logo-green transition-colors mb-8"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Library
        </Link>

        {/* Main Content */}
        <div className="grid md:grid-cols-[280px_1fr] gap-8 lg:gap-12">
          {/* Cover & Meta */}
          <div className="space-y-6">
            {/* Cover Image */}
            <BookCover
              coverUrl={book.cover_url}
              title={book.title}
              yearPublished={book.year_published}
              showYearBadge
            />

            {/* Quick Info */}
            <div className="space-y-3 font-mono text-xs">
              {book.publisher && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-logo-green uppercase tracking-wider min-w-[70px]">Publisher</span>
                  <span>{book.publisher}</span>
                </div>
              )}
              {book.pages && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-logo-green uppercase tracking-wider min-w-[70px]">Pages</span>
                  <span>{book.pages}</span>
                </div>
              )}
              {book.isbn && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-logo-green uppercase tracking-wider min-w-[70px]">ISBN</span>
                  <span>{book.isbn}</span>
                </div>
              )}
              {book.category && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-logo-green uppercase tracking-wider min-w-[70px]">Category</span>
                  <span>{book.category.name}</span>
                </div>
              )}
            </div>

            {/* Purchase Button */}
            {book.purchase_url && (
              <a
                href={book.purchase_url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center justify-center gap-2 w-full",
                  "px-4 py-3 border border-crimson/50 bg-crimson/10",
                  "font-mono text-[10px] uppercase tracking-widest text-crimson",
                  "hover:bg-crimson/20 hover:border-crimson hover:shadow-[0_0_12px_hsl(var(--crimson)/0.4)]",
                  "transition-all duration-300"
                )}
              >
                <ExternalLink className="w-3 h-3" />
                Find This Book
              </a>
            )}
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Title & Author */}
            <div>
              <h1 className="text-2xl md:text-3xl font-mono text-foreground leading-tight mb-2">
                {book.title}
              </h1>
              <p className="font-mono text-sm text-muted-foreground">
                by {book.author}
              </p>
            </div>

            {/* Description */}
            {book.description && (
              <div className="prose prose-invert prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {book.description}
                </p>
              </div>
            )}

            {/* Why Read */}
            {book.why_read && (
              <div className="p-4 border-l-2 border-logo-green bg-logo-green/5">
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-logo-green mb-2">
                  Why Read This
                </h3>
                <p className="font-mono text-sm text-foreground leading-relaxed">
                  {book.why_read}
                </p>
              </div>
            )}

            {/* Curator Notes */}
            {book.curator_notes && (
              <div className="p-4 border border-border/50 bg-card/50">
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-crimson mb-2">
                  Curator's Notes
                </h3>
                <p className="font-mono text-sm text-muted-foreground leading-relaxed">
                  {book.curator_notes}
                </p>
              </div>
            )}

            {/* Knowledge Sections */}
            {knowledgeChunks.length > 0 && (
              <div className="space-y-6 pt-4 border-t border-border/30">
                <h2 className="font-mono text-xs uppercase tracking-widest text-logo-green">
                  In-Depth Analysis
                </h2>

                {coreThesis && (
                  <div className="space-y-2">
                    <h3 className="font-mono text-sm text-foreground">Core Thesis</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {coreThesis.content}
                    </p>
                  </div>
                )}

                {keyThemes && (
                  <div className="space-y-2">
                    <h3 className="font-mono text-sm text-foreground">Key Themes</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {keyThemes.content}
                    </p>
                  </div>
                )}

                {historicalFacts && (
                  <div className="space-y-2">
                    <h3 className="font-mono text-sm text-foreground">Historical Context</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {historicalFacts.content}
                    </p>
                  </div>
                )}

                {philosophicalFrameworks && (
                  <div className="space-y-2">
                    <h3 className="font-mono text-sm text-foreground">Philosophical Frameworks</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {philosophicalFrameworks.content}
                    </p>
                  </div>
                )}

                {quotablePassages && (
                  <div className="space-y-2">
                    <h3 className="font-mono text-sm text-foreground">Notable Passages</h3>
                    <div className="p-4 border-l-2 border-crimson/50 bg-crimson/5 italic">
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {quotablePassages.content}
                      </p>
                    </div>
                  </div>
                )}

                {technoConnections && (
                  <div className="space-y-2">
                    <h3 className="font-mono text-sm text-foreground">Connections to Techno Culture</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {technoConnections.content}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Related Books */}
            {relatedBooks.length > 0 && (
              <div className="space-y-4 pt-6 border-t border-border/30">
                <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Related Reading
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {relatedBooks.map((related) => (
                    <Link
                      key={related.id}
                      to={`/books/${related.id}`}
                      className="group"
                    >
                      <div className="relative aspect-[2/3] overflow-hidden border border-border bg-card mb-2 group-hover:border-logo-green/50 transition-colors">
                        {related.cover_url ? (
                          <img
                            src={related.cover_url}
                            alt={related.title}
                            className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-muted-foreground/20" />
                          </div>
                        )}
                      </div>
                      <p className="font-mono text-[10px] text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2">
                        {related.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default BookDetail;
