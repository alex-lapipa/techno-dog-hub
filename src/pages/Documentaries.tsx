import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
import { Film, Play, Search, X, Loader2, LayoutGrid, List, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { VHSDocumentaryCard } from "@/components/documentaries/VHSDocumentaryCard";

interface Category {
  id: string;
  name: string;
  slug: string;
  display_order: number | null;
}

interface Documentary {
  id: string;
  youtube_video_id: string;
  title: string;
  description: string | null;
  channel_name: string | null;
  thumbnail_url: string | null;
  duration: string | null;
  published_at: string | null;
  view_count: number | null;
  why_watch: string | null;
  category_id: string | null;
  category?: Category | null;
}

const Documentaries = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["documentary-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documentary_categories")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
  });

  // Fetch documentaries
  const { data: documentaries = [], isLoading } = useQuery({
    queryKey: ["documentaries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documentaries")
        .select(`
          *,
          category:documentary_categories(id, name, slug, display_order)
        `)
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Documentary[];
    },
  });

  // Filter documentaries
  const filteredDocs = useMemo(() => {
    let result = documentaries;
    
    if (activeCategory) {
      result = result.filter(d => d.category?.name === activeCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.title.toLowerCase().includes(query) ||
        d.description?.toLowerCase().includes(query) ||
        d.channel_name?.toLowerCase().includes(query) ||
        d.why_watch?.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [documentaries, activeCategory, searchQuery]);

  // Categories with counts
  const categoriesWithCounts = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      count: documentaries.filter(d => d.category?.name === cat.name).length
    }));
  }, [categories, documentaries]);

  // Format duration from ISO 8601
  const formatDuration = (iso: string | null) => {
    if (!iso) return null;
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return iso;
    const hours = match[1] ? `${match[1]}:` : "";
    const mins = match[2] || "0";
    const secs = match[3]?.padStart(2, "0") || "00";
    return `${hours}${mins}:${secs}`;
  };

  // Format view count
  const formatViews = (count: number | null) => {
    if (!count) return null;
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K views`;
    return `${count} views`;
  };

  return (
    <PageLayout 
      title="Techno Documentaries" 
      description="Essential viewing for the underground. Documentaries covering Detroit origins, Berlin's golden era, warehouse raves, and the machines that shaped the sound."
      path="/documentaries"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Film className="w-6 h-6 text-crimson" />
            <h1 className="text-2xl md:text-3xl font-mono uppercase tracking-wider text-foreground">
              Documentaries
            </h1>
          </div>
          <p className="font-mono text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Essential viewing for the underground. From Detroit's origins to Berlin's golden era, 
            from warehouse raves to the machines that shaped the sound.
          </p>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-crimson">
            <Film className="w-3 h-3" />
            <span>{documentaries.length} documentaries curated</span>
          </div>
        </div>

        {/* Search & View Toggle */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search documentaries..."
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
          
          <div className="flex items-center gap-1 border border-border/50">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 font-mono text-xs transition-colors",
                viewMode === "grid"
                  ? "bg-logo-green/20 text-logo-green"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
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
          </div>
        </div>

        {/* Category Tabs - Auto-scrolling */}
        <div className="mb-8 border-b border-logo-green/30 overflow-hidden relative group">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          <div className="flex animate-scroll-x group-hover:[animation-play-state:paused]">
            {[...Array(2)].map((_, setIdx) => (
              <div key={setIdx} className="flex gap-6 shrink-0 pr-6">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={cn(
                    "px-1 py-3 font-mono text-xs uppercase tracking-wider transition-all relative whitespace-nowrap",
                    !activeCategory
                      ? "text-logo-green after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-logo-green"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  All ({documentaries.length})
                </button>
                {categoriesWithCounts.map((category) => (
                  <button
                    key={`${setIdx}-${category.id}`}
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
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-crimson" />
          </div>
        )}

        {/* Grid View - VHS Style */}
        {!isLoading && viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc, index) => (
              <VHSDocumentaryCard
                key={doc.id}
                videoId={doc.youtube_video_id}
                title={doc.title}
                thumbnailUrl={doc.thumbnail_url}
                channelName={doc.channel_name}
                duration={doc.duration}
                viewCount={doc.view_count}
                whyWatch={doc.why_watch}
                category={doc.category || null}
                isPlaying={playingVideo === doc.youtube_video_id}
                frameNumber={String(index + 1).padStart(2, "0")}
                onPlay={() => setPlayingVideo(doc.youtube_video_id)}
                formatDuration={formatDuration}
                formatViews={formatViews}
              />
            ))}
          </div>
        )}

        {/* List View */}
        {!isLoading && viewMode === "list" && (
          <div className="space-y-4">
            {filteredDocs.map((doc) => (
              <article 
                key={doc.id}
                className="group flex flex-col md:flex-row gap-4 p-4 border border-border/50 bg-card/30 hover:border-logo-green/30 transition-colors"
              >
                {/* Thumbnail - VHS Style */}
                <div className="relative w-full md:w-64 aspect-video overflow-hidden bg-zinc-900 shrink-0 border border-[rgba(220,38,38,0.2)]">
                  {/* VHS Frame Number */}
                  <div className="absolute top-1 left-1 z-20 px-1.5 py-1 bg-black/70 border border-[rgba(220,38,38,0.4)]">
                    <span className="text-[10px] text-crimson tracking-wider font-bold font-mono">
                      {String(filteredDocs.indexOf(doc) + 1).padStart(2, "0")}
                    </span>
                  </div>
                  
                  {/* VHS REC indicator */}
                  <div className="absolute top-1 right-1 z-20 flex items-center gap-1 px-1.5 py-0.5 bg-black/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-crimson animate-pulse" />
                    <span className="text-[8px] font-mono text-crimson uppercase tracking-widest">VHS</span>
                  </div>
                  
                  {playingVideo === doc.youtube_video_id ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${doc.youtube_video_id}?autoplay=1`}
                      title={doc.title}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <img
                        src={`https://img.youtube.com/vi/${doc.youtube_video_id}/hqdefault.jpg`}
                        alt={doc.title}
                        className="w-full h-full object-cover grayscale contrast-110 brightness-105 saturate-0 
                                   group-hover:grayscale-[0.7] group-hover:saturate-[0.3] 
                                   group-hover:brightness-110 group-hover:scale-110
                                   transition-all duration-700"
                        loading="lazy"
                      />
                      
                      {/* VHS Scan Lines Overlay */}
                      <div 
                        className="absolute inset-0 pointer-events-none opacity-100 group-hover:opacity-70 transition-opacity duration-500"
                        style={{
                          background: `
                            repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.2) 1px, rgba(0,0,0,0.2) 2px),
                            radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%),
                            linear-gradient(to top, rgba(220,38,38,0.05), rgba(220,38,38,0.05))
                          `,
                        }}
                      />
                      
                      {/* Hover glow */}
                      <div className="absolute inset-0 z-[11] pointer-events-none bg-gradient-to-t from-[rgba(220,38,38,0.4)] via-[rgba(220,38,38,0.15)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Play Button */}
                      <button
                        onClick={() => setPlayingVideo(doc.youtube_video_id)}
                        className="absolute inset-0 z-[12] flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <div className="w-14 h-14 rounded-full bg-crimson/90 flex items-center justify-center border-2 border-crimson shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                          <Play className="w-7 h-7 text-white ml-1" fill="white" />
                        </div>
                      </button>
                      
                      {/* Duration Badge */}
                      {doc.duration && (
                        <div className="absolute bottom-2 right-2 z-20 bg-black/90 text-crimson text-[10px] font-mono px-2 py-0.5 border border-crimson/30">
                          {formatDuration(doc.duration)}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="font-mono text-sm text-foreground leading-tight mb-2 group-hover:text-logo-green transition-colors">
                    {doc.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground mb-2">
                    {doc.channel_name && <span>{doc.channel_name}</span>}
                    {doc.view_count && (
                      <>
                        <span>•</span>
                        <span>{formatViews(doc.view_count)}</span>
                      </>
                    )}
                  </div>

                  {doc.why_watch && (
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      {doc.why_watch}
                    </p>
                  )}

                  <div className="flex items-center gap-3">
                    {doc.category && (
                      <span className="inline-block text-[9px] font-mono uppercase tracking-widest text-logo-green border border-logo-green/30 px-2 py-0.5">
                        {doc.category.name}
                      </span>
                    )}
                    <a
                      href={`https://www.youtube.com/watch?v=${doc.youtube_video_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-mono text-crimson hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Watch on YouTube
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredDocs.length === 0 && (
          <div className="py-16 text-center">
            <Film className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="font-mono text-sm text-muted-foreground">
              {documentaries.length === 0 
                ? "Documentaries are being curated. Check back soon."
                : "No documentaries found matching your search."}
            </p>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-16 pt-8 border-t border-border/30">
          <p className="font-mono text-[10px] text-muted-foreground/60 text-center">
            All documentaries are sourced from YouTube. Content rights belong to their respective creators.
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Documentaries;
