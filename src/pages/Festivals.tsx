import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Search, Calendar, MapPin, Music, Loader2 } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useFestivals, usePrefetchFestival } from "@/hooks/useData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { Input } from "@/components/ui/input";
import { GlitchImage, GlitchSVGFilter } from "@/components/store/GlitchImage";

const FestivalsPage = () => {
  const { trackClick, trackSearch } = useAnalytics();
  const { data: festivals = [], isLoading } = useFestivals();
  const prefetchFestival = usePrefetchFestival();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Sync country from URL
  const countryFromUrl = searchParams.get("country");
  const [selectedCountry, setSelectedCountry] = useState<string>(countryFromUrl || "all");

  // Get unique countries sorted alphabetically
  const countries = useMemo(() => {
    const uniqueCountries = [...new Set(festivals.map(f => f.country))].sort();
    return uniqueCountries;
  }, [festivals]);

  // Update URL when country changes
  useEffect(() => {
    if (selectedCountry === "all") {
      searchParams.delete("country");
    } else {
      searchParams.set("country", selectedCountry);
    }
    setSearchParams(searchParams, { replace: true });
  }, [selectedCountry, searchParams, setSearchParams]);

  const filteredFestivals = useMemo(() => {
    return festivals.filter(festival => {
      const matchesSearch = searchQuery === "" || 
        festival.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        festival.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        festival.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        festival.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCountry = selectedCountry === "all" || festival.country === selectedCountry;
      
      return matchesSearch && matchesCountry;
    });
  }, [festivals, searchQuery, selectedCountry]);

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

  // Get festival image - check for dedicated festival images
  const getFestivalImage = (festival: typeof festivals[0]) => {
    // Check for festival-specific images in public/festivals folder
    const festivalSlug = festival.id.toLowerCase().replace(/\s+/g, '-');
    // Return null to show placeholder - actual images would be in public/festivals/
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <GlitchSVGFilter />
      <PageSEO
        title="Techno Festivals"
        description="Underground techno festivals worldwide. Detroit to Tbilisi, Tokyo to Bogotá. Community-curated."
        path="/festivals"
        structuredData={itemListSchema}
      />
      <Header />
      <main className="pt-16 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="mb-8 sm:mb-12 space-y-3 sm:space-y-4">
            <div className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.3em]">
              // Global gatherings
            </div>
            <h1 className="font-mono text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight">
              Festivals
            </h1>
            <p className="font-mono text-xs sm:text-sm text-muted-foreground max-w-2xl">
              From Detroit to Tbilisi, Tokyo to Bogotá. The gatherings that matter.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search festivals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => {
                  if (searchQuery.trim()) {
                    trackSearch(searchQuery, filteredFestivals.length);
                  }
                }}
                className="pl-10 font-mono text-xs sm:text-sm bg-transparent border-border"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <button
                onClick={() => {
                  setSelectedCountry("all");
                  trackClick("festivals_filter_all");
                }}
                className={`font-mono text-[10px] sm:text-xs uppercase tracking-wider px-2 sm:px-3 py-1 sm:py-1.5 border transition-colors ${
                  selectedCountry === "all"
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground'
                }`}
              >
                All ({festivals.length})
              </button>
              {countries.map((country) => {
                const count = festivals.filter(f => f.country === country).length;
                return (
                  <button
                    key={country}
                    onClick={() => {
                      setSelectedCountry(country);
                      trackClick(`festivals_filter_${country}`);
                    }}
                    className={`font-mono text-[10px] sm:text-xs uppercase tracking-wider px-2 sm:px-3 py-1 sm:py-1.5 border transition-colors ${
                      selectedCountry === country
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground'
                    }`}
                  >
                    {country} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Festivals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredFestivals.map((festival, index) => {
              const festivalImage = getFestivalImage(festival);
              
              return (
                <Link
                  key={festival.id}
                  to={`/festivals/${festival.id}`}
                  onMouseEnter={() => prefetchFestival(festival.id)}
                  className="group border border-border hover:bg-card transition-all duration-200 overflow-hidden"
                >
                  {/* Festival Image */}
                  <div className="aspect-[4/3] relative overflow-hidden bg-card/30">
                    {festivalImage ? (
                      <GlitchImage 
                        src={festivalImage} 
                        alt={festival.name}
                        className="w-full h-full"
                        frameNumber={String(index + 1).padStart(2, '0')}
                        size="thumbnail"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center relative">
                        {/* VHS Frame for placeholder */}
                        <div className="absolute inset-0 border-2 border-muted-foreground/10" />
                        <div className="absolute top-2 left-2 font-mono text-[8px] text-muted-foreground/30">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                        <div className="absolute top-2 right-2 font-mono text-[8px] text-red-500/50">
                          ● REC
                        </div>
                        <Music className="w-12 h-12 text-muted-foreground/20" />
                        <div className="absolute bottom-2 left-2 right-2 flex justify-between font-mono text-[8px] text-muted-foreground/30">
                          <span>{festival.founded || '—'}</span>
                          <span>{festival.type?.toUpperCase() || 'FESTIVAL'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 sm:p-4">
                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                      <div className="flex-1 min-w-0">
                        <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">
                          {festival.type || 'Festival'}
                        </span>
                        <h2 className="font-mono text-sm sm:text-lg uppercase tracking-wide group-hover:animate-glitch truncate">
                          {festival.name}
                        </h2>
                      </div>
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all mt-1 flex-shrink-0" />
                    </div>
                      
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 font-mono text-[10px] sm:text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {festival.city}, {festival.country}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2 sm:mb-3 font-mono text-[10px] sm:text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{festival.months?.join(' / ') || '—'}</span>
                      {festival.founded && (
                        <>
                          <span className="text-border">|</span>
                          <span>Est. {festival.founded}</span>
                        </>
                      )}
                    </div>

                    {festival.description && (
                      <p className="font-mono text-[10px] sm:text-xs text-muted-foreground line-clamp-2 mb-2 sm:mb-3">
                        {festival.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {(festival.tags || []).slice(0, 3).map(tag => (
                        <span 
                          key={tag} 
                          className="font-mono text-[9px] sm:text-[10px] text-muted-foreground border border-border/50 px-1 sm:px-1.5 py-0.5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Count */}
          <div className="mt-6 sm:mt-8 font-mono text-[10px] sm:text-xs text-muted-foreground">
            {filteredFestivals.length} festivals in archive
          </div>

          {/* Go Deeper */}
          <div className="mt-12 border border-border p-6">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-4">
              // Go deeper
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/venues" className="font-mono text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground hover:animate-glitch">
                → Venues
              </Link>
              <Link to="/artists" className="font-mono text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground hover:animate-glitch">
                → Artists
              </Link>
              <Link to="/labels" className="font-mono text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground hover:animate-glitch">
                → Labels
              </Link>
              <Link to="/crews" className="font-mono text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground hover:animate-glitch">
                → Crews
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
