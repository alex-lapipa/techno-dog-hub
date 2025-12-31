import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
import { ExternalLink, BookOpen, ChevronDown, ChevronUp, Loader2, Search, X, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { BookSuggestionForm } from "@/components/books/BookSuggestionForm";
import { BookCover } from "@/components/books/BookCover";

interface Category {
  id: string;
  name: string;
  slug: string;
  display_order: number | null;
}

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
  category?: Category | null;
}

const Books = () => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "gallery">("list");

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["book-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("book_categories")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
  });

  // Fetch books with category
  const { data: books = [], isLoading } = useQuery({
    queryKey: ["books"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select(`
          *,
          category:book_categories(id, name, slug, display_order)
        `)
        .eq("status", "published")
        .order("title");
      if (error) throw error;
      return data as Book[];
    },
  });

  // Expand all categories by default
  if (categories.length > 0 && expandedCategories.size === 0) {
    setExpandedCategories(new Set(categories.map(c => c.name)));
  }

  // Filter books based on search and active category
  const filteredBooks = useMemo(() => {
    let result = books;
    
    // Filter by category
    if (activeCategory) {
      result = result.filter(b => b.category?.name === activeCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(b => 
        b.title.toLowerCase().includes(query) ||
        b.author.toLowerCase().includes(query) ||
        b.description?.toLowerCase().includes(query) ||
        b.why_read?.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [books, activeCategory, searchQuery]);

  // Get categories with book counts
  const categoriesWithCounts = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      count: books.filter(b => b.category?.name === cat.name).length
    }));
  }, [categories, books]);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
      } else {
        next.add(categoryName);
      }
      return next;
    });
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Essential Techno Culture Books",
    "description": "Curated reading list covering Detroit techno, UK rave culture, synthesizers, live coding, and sound art philosophy.",
    "url": "https://techno.dog/books"
  };

  // Group filtered books by category for display
  const displayCategories = activeCategory 
    ? categories.filter(c => c.name === activeCategory)
    : categories;

  return (
    <PageLayout
      title="Books – Essential Reading"
      description="Curated underground techno culture reading list. Detroit origins, UK free party movement, synthesizer history, live coding, and sound art philosophy."
      path="/books"
      structuredData={structuredData}
    >
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* VHS Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-8 bg-crimson animate-pulse" />
            <h1 className="text-3xl md:text-4xl font-mono uppercase tracking-wider text-foreground">
              Books
            </h1>
          </div>
          <p className="font-mono text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Essential reading for the underground. No commercial EDM guides, no mainstream histories. 
            These are the texts that document the culture, the movements, the machines, and the philosophy.
          </p>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-crimson">
            <BookOpen className="w-3 h-3" />
            <span>{books.length} titles curated</span>
          </div>
        </div>

        {/* Search Box & View Toggle */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search books by title, author, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 bg-card/50 border-border font-mono text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 border border-border/50">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 font-mono text-xs transition-colors",
                viewMode === "list"
                  ? "bg-logo-green/20 text-logo-green"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("gallery")}
              className={cn(
                "p-2 font-mono text-xs transition-colors",
                viewMode === "gallery"
                  ? "bg-logo-green/20 text-logo-green"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Cover Gallery"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Tabs - Auto-scrolling */}
        <div className="mb-8 border-b border-logo-green/30 overflow-hidden relative group">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          <div className="flex animate-scroll-x group-hover:[animation-play-state:paused]">
            {/* First set */}
            <div className="flex gap-6 shrink-0 pr-6">
              <button
                onClick={() => setActiveCategory(null)}
                className={cn(
                  "px-1 py-3 font-mono text-xs uppercase tracking-wider transition-all relative whitespace-nowrap",
                  !activeCategory
                    ? "text-logo-green after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-logo-green"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                All ({books.length})
              </button>
              {categoriesWithCounts.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(activeCategory === category.name ? null : category.name)}
                  className={cn(
                    "px-1 py-3 font-mono text-xs uppercase tracking-wider transition-all whitespace-nowrap relative",
                    activeCategory === category.name
                      ? "text-logo-green after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-logo-green"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
            {/* Duplicate set for seamless loop */}
            <div className="flex gap-6 shrink-0 pr-6">
              <button
                onClick={() => setActiveCategory(null)}
                className={cn(
                  "px-1 py-3 font-mono text-xs uppercase tracking-wider transition-all relative whitespace-nowrap",
                  !activeCategory
                    ? "text-logo-green after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-logo-green"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                All ({books.length})
              </button>
              {categoriesWithCounts.map((category) => (
                <button
                  key={`dup-${category.id}`}
                  onClick={() => setActiveCategory(activeCategory === category.name ? null : category.name)}
                  className={cn(
                    "px-1 py-3 font-mono text-xs uppercase tracking-wider transition-all whitespace-nowrap relative",
                    activeCategory === category.name
                      ? "text-logo-green after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-logo-green"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search Results Info */}
        {(searchQuery || activeCategory) && (
          <div className="mb-6 flex items-center gap-4">
            <p className="font-mono text-xs text-muted-foreground">
              Showing {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'}
              {searchQuery && <span> matching "{searchQuery}"</span>}
              {activeCategory && <span> in {activeCategory}</span>}
            </p>
            {(searchQuery || activeCategory) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory(null);
                }}
                className="font-mono text-xs text-crimson hover:text-crimson/80 underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-crimson" />
          </div>
        )}

        {/* Gallery View */}
        {!isLoading && viewMode === "gallery" && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {filteredBooks.map((book) => (
              <Link
                key={book.id}
                to={`/books/${book.id}`}
                className="group relative hover:scale-[1.02] transition-transform"
              >
                <BookCover
                  coverUrl={book.cover_url}
                  title={book.title}
                  yearPublished={book.year_published}
                  showYearBadge
                  className="group-hover:border-logo-green/50 [&_img]:grayscale-[30%] [&_img]:group-hover:grayscale-0 [&_img]:transition-all [&_img]:duration-500"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 z-20">
                  <p className="font-mono text-[9px] text-foreground line-clamp-2 leading-tight">
                    {book.title}
                  </p>
                  <p className="font-mono text-[8px] text-muted-foreground truncate">
                    {book.author}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* List View - Categories */}
        {!isLoading && viewMode === "list" && (
          <div className="space-y-8">
            {displayCategories.map((category) => {
              const categoryBooks = filteredBooks.filter(b => b.category?.name === category.name);
              const isExpanded = expandedCategories.has(category.name);

              if (categoryBooks.length === 0) return null;

              return (
                <section key={category.id} className="border border-border bg-card/30">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.name)}
                    className="w-full flex items-center justify-between p-4 hover:bg-card/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-6 bg-logo-green" />
                      <h2 className="text-lg font-mono uppercase tracking-wider text-foreground">
                        {category.name}
                      </h2>
                      <span className="text-xs font-mono text-muted-foreground">
                        ({categoryBooks.length})
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>

                  {/* Books Grid */}
                  {isExpanded && (
                    <div className="p-4 pt-0 grid gap-6">
                      {categoryBooks.map((book) => (
                        <BookCard key={book.id} book={book} />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredBooks.length === 0 && (
          <div className="py-16 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="font-mono text-sm text-muted-foreground">
              No books found matching your search.
            </p>
          </div>
        )}

        {/* Suggestion Form */}
        <div className="mt-16 border-t border-border pt-12">
          <BookSuggestionForm />
        </div>

        {/* Footer Note */}
        <div className="mt-12 border-t border-border pt-8">
          <p className="font-mono text-xs text-muted-foreground text-center max-w-xl mx-auto">
            This list is curated to align with techno.dog's mission: culture, movements, gear, and art. 
            No affiliate links. Support your local bookshop when possible.
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

interface BookCardProps {
  book: Book;
}

const BookCard = ({ book }: BookCardProps) => {
  return (
    <article className="group flex flex-col md:flex-row gap-6 p-4 border border-border/50 bg-background/50 hover:border-logo-green/30 transition-colors">
      {/* Cover Image */}
      <Link to={`/books/${book.id}`} className="relative shrink-0 w-full md:w-32 lg:w-40">
        <BookCover
          coverUrl={book.cover_url}
          title={book.title}
          yearPublished={book.year_published}
          showYearBadge
          className="group-hover:border-logo-green/50 [&_img]:grayscale-[30%] [&_img]:contrast-110 [&_img]:group-hover:grayscale-0 [&_img]:transition-all [&_img]:duration-500"
        />
      </Link>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Title & Author */}
        <div className="mb-3">
          <Link to={`/books/${book.id}`}>
            <h3 className="text-base font-mono text-foreground group-hover:text-logo-green transition-colors leading-tight hover:underline">
              {book.title}
            </h3>
          </Link>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            by {book.author}
          </p>
        </div>

        {/* Description */}
        {book.description && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">
            {book.description}
          </p>
        )}

        {/* Why Read - Highlighted */}
        {book.why_read && (
          <div className="mb-4 p-3 border-l-2 border-logo-green bg-logo-green/5">
            <p className="text-xs font-mono text-foreground leading-relaxed">
              <span className="text-logo-green uppercase tracking-wider">Why read:</span>{" "}
              {book.why_read}
            </p>
          </div>
        )}

        {/* Purchase Link - VHS Button */}
        {book.purchase_url && (
          <a
            href={book.purchase_url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-2 self-start",
              "px-4 py-2 border border-crimson/50 bg-crimson/10",
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
    </article>
  );
};

export default Books;
