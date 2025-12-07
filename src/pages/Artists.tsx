import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useLanguage } from "@/contexts/LanguageContext";
import { loadArtistsSummary, loadArtistById } from "@/data/artists-loader";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { useCallback, useRef } from "react";

const ArtistsPage = () => {
  const queryClient = useQueryClient();
  const parentRef = useRef<HTMLDivElement>(null);
  
  const prefetchArtist = useCallback((id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['artist', id],
      queryFn: () => loadArtistById(id),
      staleTime: 1000 * 60 * 10,
    });
  }, [queryClient]);
  
  const { language } = useLanguage();

  const { data: artists = [], isLoading } = useQuery({
    queryKey: ['artists-summary'],
    queryFn: loadArtistsSummary,
    staleTime: 1000 * 60 * 10,
  });

  const rowVirtualizer = useVirtualizer({
    count: artists.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-12 space-y-3 sm:space-y-4">
            <div className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.3em]">
              // {language === 'en' ? 'Archive' : 'Archivo'}
            </div>
            <h1 className="font-mono text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight">
              {language === 'en' ? 'Artists' : 'Artistas'}
            </h1>
            <p className="font-mono text-xs sm:text-sm text-muted-foreground max-w-2xl">
              {language === 'en' 
                ? 'The producers, DJs, and live performers shaping techno culture.' 
                : 'Los productores, DJs e intérpretes que dan forma a la cultura techno.'}
            </p>
          </div>

          <div className="border-t border-border">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="border-b border-border py-4 sm:py-6 px-2 sm:px-4">
                  <div className="flex items-start gap-2 sm:gap-4">
                    <Skeleton className="h-4 w-6 sm:w-8" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div
                ref={parentRef}
                className="h-[70vh] overflow-auto"
              >
                <div
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const artist = artists[virtualRow.index];
                    return (
                      <Link
                        key={artist.id}
                        to={`/artists/${artist.id}`}
                        onMouseEnter={() => prefetchArtist(artist.id)}
                        data-index={virtualRow.index}
                        ref={rowVirtualizer.measureElement}
                        className="group absolute left-0 right-0 border-b border-border py-4 sm:py-6 hover:bg-card transition-colors px-2 sm:px-4"
                        style={{
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        <div className="flex items-start justify-between gap-3 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 sm:gap-4 mb-1 sm:mb-2">
                              <span className="font-mono text-[10px] sm:text-xs text-muted-foreground w-6 sm:w-8 flex-shrink-0">
                                {String(virtualRow.index + 1).padStart(2, "0")}
                              </span>
                              <h2 className="font-mono text-base sm:text-xl md:text-2xl uppercase tracking-wide group-hover:animate-glitch truncate">
                                {artist.name}
                              </h2>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 pl-8 sm:pl-12">
                              <span className="font-mono text-[10px] sm:text-xs text-muted-foreground">
                                {artist.city}, {artist.country}
                              </span>
                              <div className="hidden sm:flex gap-2">
                                {artist.tags.slice(0, 3).map(tag => (
                                  <span key={tag} className="font-mono text-xs text-muted-foreground border border-border px-2 py-0.5">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all mt-1 sm:mt-2 flex-shrink-0" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 sm:mt-8 font-mono text-[10px] sm:text-xs text-muted-foreground">
            {artists.length} {language === 'en' ? 'artists in archive' : 'artistas en archivo'}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ArtistsPage;
