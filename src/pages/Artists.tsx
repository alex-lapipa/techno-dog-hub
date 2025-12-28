import { Link } from "react-router-dom";
import { ArrowRight, Film } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useScrollDepth } from "@/hooks/useScrollDepth";
import { useArtists, usePrefetchArtist, type ArtistSummary } from "@/hooks/useData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

const ArtistsPage = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  useScrollDepth({ pageName: 'artists' });
  
  const prefetchArtist = usePrefetchArtist();
  const { data: artists = [], isLoading } = useArtists();

  const rowVirtualizer = useVirtualizer({
    count: artists.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Techno Artists",
    "description": "Directory of techno DJs, producers and live performers",
    "numberOfItems": artists.length,
    "itemListElement": artists.slice(0, 30).map((artist, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "MusicGroup",
        "name": artist.name,
        "url": `https://techno.dog/artists/${artist.id}`
      }
    }))
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO
        title="Techno Artists Directory"
        description="The producers, DJs, and live performers shaping techno culture. From Detroit pioneers to Berlin residents."
        path="/artists"
        structuredData={itemListSchema}
      />
      <Header />
      <main className="pt-16 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-12 space-y-3 sm:space-y-4">
            <div className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.3em]">
              // Archive
            </div>
            <h1 className="font-mono text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight">
              Artists
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="font-mono text-xs sm:text-sm text-muted-foreground max-w-2xl">
                The producers, DJs, and live performers shaping techno culture.
              </p>
              <Link to="/artists/gallery">
                <Button variant="outline" size="sm" className="gap-2 border-crimson/30 hover:bg-crimson/10 hover:border-crimson">
                  <Film className="w-4 h-4" />
                  <span className="font-mono text-xs uppercase tracking-wider">Film Gallery</span>
                </Button>
              </Link>
            </div>
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
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          {/* Artist Photo */}
                          <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 bg-muted border border-border overflow-hidden">
                            {artist.photoUrl ? (
                              <img 
                                src={artist.photoUrl} 
                                alt={artist.name}
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-mono text-lg text-muted-foreground/50">
                                {artist.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 sm:gap-4 mb-1">
                              <span className="font-mono text-[10px] sm:text-xs text-muted-foreground w-6 sm:w-8 flex-shrink-0">
                                {artist.rank ? `#${artist.rank}` : String(virtualRow.index + 1).padStart(2, "0")}
                              </span>
                              <h2 className="font-mono text-base sm:text-xl md:text-2xl uppercase tracking-wide group-hover:text-logo-green transition-colors truncate">
                                {artist.name}
                              </h2>
                              {artist.realName && (
                                <span className="hidden md:inline font-mono text-xs text-muted-foreground">
                                  ({artist.realName})
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 pl-8 sm:pl-12">
                              <span className="font-mono text-[10px] sm:text-xs text-muted-foreground">
                                {artist.city}, {artist.country}
                              </span>
                              {artist.labels && artist.labels.length > 0 && (
                                <span className="hidden lg:inline font-mono text-[10px] text-muted-foreground">
                                  {artist.labels.slice(0, 2).join(' / ')}
                                </span>
                              )}
                              <div className="hidden sm:flex gap-2">
                                {(artist.subgenres || artist.tags).slice(0, 3).map(tag => (
                                  <span key={tag} className="font-mono text-xs text-muted-foreground border border-border px-2 py-0.5">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {artist.knownFor && (
                              <p className="hidden md:block font-mono text-[10px] text-muted-foreground/70 mt-1 pl-8 sm:pl-12 line-clamp-1 max-w-3xl">
                                {artist.knownFor}
                              </p>
                            )}
                          </div>
                          
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-logo-green group-hover:translate-x-1 transition-all flex-shrink-0" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 sm:mt-8 font-mono text-[10px] sm:text-xs text-muted-foreground">
            {artists.length} artists in archive
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ArtistsPage;
