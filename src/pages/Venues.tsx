import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useLanguage } from "@/contexts/LanguageContext";
import { loadVenuesSummary, loadVenueById } from "@/data/venues-loader";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { Skeleton } from "@/components/ui/skeleton";
import { useCallback, useRef } from "react";

const VenuesPage = () => {
  const queryClient = useQueryClient();
  const parentRef = useRef<HTMLDivElement>(null);
  
  const prefetchVenue = useCallback((id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['venue', id],
      queryFn: () => loadVenueById(id),
      staleTime: 1000 * 60 * 10,
    });
  }, [queryClient]);
  
  const { language } = useLanguage();

  const { data: venues = [], isLoading } = useQuery({
    queryKey: ['venues-summary'],
    queryFn: loadVenuesSummary,
    staleTime: 1000 * 60 * 10,
  });

  // For grid layout, virtualize rows (2 items per row on larger screens)
  const rowCount = Math.ceil(venues.length / 2);
  
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 220,
    overscan: 3,
  });

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": language === 'en' ? "Techno Venues & Clubs" : "Clubs y Espacios de Techno",
    "description": language === 'en' 
      ? "Directory of techno clubs, warehouses and spaces worldwide"
      : "Directorio de clubs, almacenes y espacios de techno en el mundo",
    "numberOfItems": venues.length,
    "itemListElement": venues.slice(0, 20).map((venue, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "MusicVenue",
        "name": venue.name,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": venue.city,
          "addressCountry": venue.country
        },
        "url": `https://techno.dog/venues/${venue.id}`
      }
    }))
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO
        title={language === 'en' ? 'Techno Venues & Clubs' : 'Clubs y Espacios de Techno'}
        description={language === 'en' 
          ? 'The clubs, warehouses, and spaces where techno lives. From Berghain to Bassiani, Tresor to Khidi.'
          : 'Los clubs, almacenes y espacios donde vive el techno. De Berghain a Bassiani, de Tresor a Khidi.'}
        path="/venues"
        locale={language}
        structuredData={itemListSchema}
      />
      <Header />
      <main className="pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-12 space-y-3 sm:space-y-4">
            <div className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.3em]">
              // {language === 'en' ? 'Archive' : 'Archivo'}
            </div>
            <h1 className="font-mono text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight">
              {language === 'en' ? 'Venues' : 'Clubs'}
            </h1>
            <p className="font-mono text-xs sm:text-sm text-muted-foreground max-w-2xl">
              {language === 'en' 
                ? 'The clubs, warehouses, and spaces where techno lives.' 
                : 'Los clubs, almacenes y espacios donde vive el techno.'}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border border-border p-4 sm:p-6 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-7 w-40" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
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
                  const rowIndex = virtualRow.index;
                  const venue1 = venues[rowIndex * 2];
                  const venue2 = venues[rowIndex * 2 + 1];
                  
                  return (
                    <div
                      key={rowIndex}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                      className="absolute left-0 right-0 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pb-4 sm:pb-6"
                      style={{
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      {venue1 && (
                        <Link
                          to={`/venues/${venue1.id}`}
                          onMouseEnter={() => prefetchVenue(venue1.id)}
                          className="group block border border-border p-4 sm:p-6 hover:bg-card transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3 sm:mb-4">
                            <span className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground border border-border px-1.5 sm:px-2 py-0.5 sm:py-1">
                              {venue1.type}
                            </span>
                            <span className="font-mono text-[10px] sm:text-xs text-muted-foreground">
                              {venue1.active}
                            </span>
                          </div>
                          <h2 className="font-mono text-xl sm:text-2xl uppercase tracking-tight mb-2 group-hover:animate-glitch">
                            {venue1.name}
                          </h2>
                          <div className="flex items-center gap-2 text-muted-foreground mb-3 sm:mb-4">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="font-mono text-xs sm:text-sm">{venue1.city}, {venue1.country}</span>
                          </div>
                          {venue1.atmosphere && (
                            <p className="font-mono text-[10px] sm:text-xs text-muted-foreground line-clamp-2 mb-3 sm:mb-4">
                              {venue1.atmosphere}
                            </p>
                          )}
                          <div className="flex items-center gap-2 font-mono text-[10px] sm:text-xs text-muted-foreground group-hover:text-foreground">
                            <span>{language === 'en' ? 'View details' : 'Ver detalles'}</span>
                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </Link>
                      )}
                      {venue2 && (
                        <Link
                          to={`/venues/${venue2.id}`}
                          onMouseEnter={() => prefetchVenue(venue2.id)}
                          className="group block border border-border p-4 sm:p-6 hover:bg-card transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3 sm:mb-4">
                            <span className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground border border-border px-1.5 sm:px-2 py-0.5 sm:py-1">
                              {venue2.type}
                            </span>
                            <span className="font-mono text-[10px] sm:text-xs text-muted-foreground">
                              {venue2.active}
                            </span>
                          </div>
                          <h2 className="font-mono text-xl sm:text-2xl uppercase tracking-tight mb-2 group-hover:animate-glitch">
                            {venue2.name}
                          </h2>
                          <div className="flex items-center gap-2 text-muted-foreground mb-3 sm:mb-4">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="font-mono text-xs sm:text-sm">{venue2.city}, {venue2.country}</span>
                          </div>
                          {venue2.atmosphere && (
                            <p className="font-mono text-[10px] sm:text-xs text-muted-foreground line-clamp-2 mb-3 sm:mb-4">
                              {venue2.atmosphere}
                            </p>
                          )}
                          <div className="flex items-center gap-2 font-mono text-[10px] sm:text-xs text-muted-foreground group-hover:text-foreground">
                            <span>{language === 'en' ? 'View details' : 'Ver detalles'}</span>
                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-6 sm:mt-8 font-mono text-[10px] sm:text-xs text-muted-foreground">
            {venues.length} {language === 'en' ? 'venues in archive' : 'clubs en archivo'}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VenuesPage;