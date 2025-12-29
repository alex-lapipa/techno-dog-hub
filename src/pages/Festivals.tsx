import { Link } from "react-router-dom";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useFestivals, usePrefetchFestival } from "@/hooks/useData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRef, useMemo, useState } from "react";

const FestivalsPage = () => {
  const directoryRef = useRef<HTMLDivElement>(null);
  
  const prefetchFestival = usePrefetchFestival();
  const [selectedCountry, setSelectedCountry] = useState<string>('all');

  const { data: festivals = [], isLoading } = useFestivals();

  // Get unique countries sorted alphabetically
  const countries = useMemo(() => {
    const uniqueCountries = [...new Set(festivals.map(f => f.country))].sort();
    return uniqueCountries;
  }, [festivals]);

  // Filter festivals by selected country
  const filteredFestivals = useMemo(() => {
    if (selectedCountry === 'all') return festivals;
    return festivals.filter(f => f.country === selectedCountry);
  }, [festivals, selectedCountry]);

  // Featured festivals - derived from data with fallback strategy
  const featured = useMemo(() => {
    // Sort by founded date (oldest first) as a proxy for importance, limit to 5
    const sorted = [...filteredFestivals].sort((a, b) => {
      const aYear = parseInt(String(a.founded)) || 9999;
      const bYear = parseInt(String(b.founded)) || 9999;
      return aYear - bYear;
    });
    return sorted.slice(0, 5);
  }, [filteredFestivals]);
  
  const featuredIds = useMemo(() => new Set(featured.map(f => f.id)), [featured]);
  const others = useMemo(() => filteredFestivals.filter(f => !featuredIds.has(f.id)), [filteredFestivals, featuredIds]);

  const rowVirtualizer = useVirtualizer({
    count: others.length,
    getScrollElement: () => directoryRef.current,
    estimateSize: () => 72,
    overscan: 5,
  });

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Techno Festivals",
    "description": "Directory of techno music festivals worldwide",
    "numberOfItems": festivals.length,
    "itemListElement": festivals.slice(0, 20).map((festival, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "MusicEvent",
        "name": festival.name,
        "location": {
          "@type": "Place",
          "name": festival.city,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": festival.city,
            "addressCountry": festival.country
          }
        },
        "url": `https://techno.dog/festivals/${festival.id}`
      }
    }))
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO
        title="Techno Festivals Worldwide"
        description="Discover techno festivals from Detroit to Tbilisi, Tokyo to Bogotá. Comprehensive guide to the global gatherings that matter."
        path="/festivals"
        structuredData={itemListSchema}
      />
      <Header />
      <main className="pt-16 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-8 space-y-4">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em]">
              // Global gatherings
            </div>
            <h1 className="font-mono text-4xl md:text-6xl uppercase tracking-tight">
              Festivals
            </h1>
            <p className="font-mono text-sm text-muted-foreground max-w-2xl">
              From Detroit to Tbilisi, Tokyo to Bogotá. The gatherings that matter.
            </p>
          </div>

          {/* Country Tabs */}
          <Tabs value={selectedCountry} onValueChange={setSelectedCountry} className="mb-10">
            <TabsList className="h-auto flex flex-wrap gap-2 bg-transparent p-0 justify-start">
              <TabsTrigger 
                value="all" 
                className="font-mono text-xs uppercase tracking-wider border border-border px-4 py-2 data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:border-foreground hover:bg-card transition-colors"
              >
                All
                <span className="ml-2 text-muted-foreground data-[state=active]:text-background/70">
                  ({festivals.length})
                </span>
              </TabsTrigger>
              {countries.map(country => {
                const count = festivals.filter(f => f.country === country).length;
                return (
                  <TabsTrigger 
                    key={country}
                    value={country}
                    className="font-mono text-xs uppercase tracking-wider border border-border px-4 py-2 data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:border-foreground hover:bg-card transition-colors"
                  >
                    {country}
                    <span className="ml-2 text-muted-foreground data-[state=active]:text-background/70">
                      ({count})
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          {/* Featured festivals - not virtualized as it's a small fixed set */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="border border-border p-6 space-y-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-7 w-40" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ))
            ) : (
              featured.map((festival, index) => (
                <Link
                  key={festival.id}
                  to={`/festivals/${festival.id}`}
                  onMouseEnter={() => prefetchFestival(festival.id)}
                  className="group block border border-border p-6 hover:bg-card transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground border border-border px-2 py-1">
                      {festival.type}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {festival.founded}
                    </span>
                  </div>
                  
                  <h2 className="font-mono text-2xl uppercase tracking-tight mb-2 group-hover:animate-glitch">
                    {festival.name}
                  </h2>
                  
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4" />
                    <span className="font-mono text-sm">{festival.city}, {festival.country}</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <Calendar className="w-4 h-4" />
                    <span className="font-mono text-xs">{festival.months.join(' / ')}</span>
                  </div>

                  {festival.description && (
                    <p className="font-mono text-xs text-muted-foreground line-clamp-2 mb-4">
                      {festival.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {festival.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="font-mono text-xs text-muted-foreground border border-border px-2 py-0.5">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground group-hover:text-foreground">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Directory with virtual scrolling */}
          <div className="mb-12">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-6">
              // Full directory
            </div>
            <div className="border-t border-border">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="border-b border-border py-4 px-4">
                    <div className="flex items-center gap-6">
                      <Skeleton className="h-4 w-8" />
                      <div className="space-y-1">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  ref={directoryRef}
                  className="h-[50vh] overflow-auto"
                >
                  <div
                    style={{
                      height: `${rowVirtualizer.getTotalSize()}px`,
                      width: '100%',
                      position: 'relative',
                    }}
                  >
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                      const festival = others[virtualRow.index];
                      return (
                        <Link
                          key={festival.id}
                          to={`/festivals/${festival.id}`}
                          onMouseEnter={() => prefetchFestival(festival.id)}
                          data-index={virtualRow.index}
                          ref={rowVirtualizer.measureElement}
                          className="group absolute left-0 right-0 flex items-center justify-between gap-4 border-b border-border py-4 hover:bg-card transition-colors px-4"
                          style={{
                            transform: `translateY(${virtualRow.start}px)`,
                          }}
                        >
                          <div className="flex items-center gap-6">
                            <span className="font-mono text-xs text-muted-foreground w-8">
                              {String(virtualRow.index + 1).padStart(2, "0")}
                            </span>
                            <div>
                              <h3 className="font-mono text-lg uppercase tracking-tight group-hover:animate-glitch">
                                {festival.name}
                              </h3>
                              <span className="font-mono text-xs text-muted-foreground">
                                {festival.city}, {festival.country}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-mono text-xs text-muted-foreground hidden md:block">
                              {festival.months[0]}
                            </span>
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border border-border p-6">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-4">
              // Go deeper
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/venues" className="font-mono text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground hover:animate-glitch">
                → Venues
              </Link>
              <Link to="/mad/calendar" className="font-mono text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground hover:animate-glitch">
                → Calendar
              </Link>
              <Link to="/mad/map" className="font-mono text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground hover:animate-glitch">
                → Map
              </Link>
              <Link to="/artists" className="font-mono text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground hover:animate-glitch">
                → Artists
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FestivalsPage;
