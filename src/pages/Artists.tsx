import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Search, User, Loader2, Wrench } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useArtists } from "@/hooks/useData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { Input } from "@/components/ui/input";
import { GlitchImage, GlitchSVGFilter } from "@/components/store/GlitchImage";
import { supabase } from "@/integrations/supabase/client";

type RegionFilter = "all" | "europe" | "north-america" | "south-america" | "asia" | "oceania" | "africa";

const regionLabels: Record<RegionFilter, string> = {
  "all": "All",
  "europe": "Europe",
  "north-america": "North America", 
  "south-america": "South America",
  "asia": "Asia",
  "oceania": "Oceania",
  "africa": "Africa"
};

const countryToRegion: Record<string, RegionFilter> = {
  // Europe
  "Germany": "europe", "United Kingdom": "europe", "France": "europe", "Netherlands": "europe",
  "Belgium": "europe", "Spain": "europe", "Italy": "europe", "Poland": "europe", "Sweden": "europe",
  "Denmark": "europe", "Norway": "europe", "Finland": "europe", "Austria": "europe", "Switzerland": "europe",
  "Portugal": "europe", "Ireland": "europe", "Czech Republic": "europe", "Hungary": "europe",
  "Romania": "europe", "Greece": "europe", "Ukraine": "europe", "Russia": "europe", "Georgia": "europe",
  // North America
  "United States": "north-america", "Canada": "north-america", "Mexico": "north-america",
  // South America
  "Brazil": "south-america", "Argentina": "south-america", "Colombia": "south-america", "Chile": "south-america",
  // Asia
  "Japan": "asia", "China": "asia", "South Korea": "asia", "India": "asia", "Indonesia": "asia",
  // Oceania
  "Australia": "oceania", "New Zealand": "oceania",
  // Africa
  "South Africa": "africa", "Egypt": "africa", "Morocco": "africa", "Nigeria": "africa",
};

const ArtistsPage = () => {
  const { trackClick, trackSearch } = useAnalytics();
  const { data: artists = [], isLoading } = useArtists();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [artistsWithGear, setArtistsWithGear] = useState<Set<string>>(new Set());
  
  // Sync region from URL
  const regionFromUrl = searchParams.get("region") as RegionFilter | null;
  const [selectedRegion, setSelectedRegion] = useState<RegionFilter>(
    regionFromUrl && Object.keys(regionLabels).includes(regionFromUrl)
      ? regionFromUrl
      : "all"
  );

  // Update URL when region changes
  useEffect(() => {
    if (selectedRegion === "all") {
      searchParams.delete("region");
    } else {
      searchParams.set("region", selectedRegion);
    }
    setSearchParams(searchParams, { replace: true });
  }, [selectedRegion, searchParams, setSearchParams]);

  // Fetch artists with gear data
  useEffect(() => {
    const fetchGearData = async () => {
      const { data } = await supabase
        .from('artist_gear')
        .select('artist_id, canonical_artists!inner(slug)')
        .limit(200);
      
      if (data) {
        const slugs = new Set(data.map((g: any) => g.canonical_artists?.slug).filter(Boolean));
        setArtistsWithGear(slugs);
      }
    };
    fetchGearData();
  }, []);

  const filteredArtists = useMemo(() => {
    return artists.filter(artist => {
      const matchesSearch = searchQuery === "" || 
        artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (artist.subgenres || artist.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const artistRegion = countryToRegion[artist.country || ""] || "europe";
      const matchesRegion = selectedRegion === "all" || artistRegion === selectedRegion;
      
      return matchesSearch && matchesRegion;
    });
  }, [artists, searchQuery, selectedRegion]);

  const regions: RegionFilter[] = ["all", "europe", "north-america", "south-america", "asia", "oceania", "africa"];

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
        title="Techno Artists Directory"
        description="The producers, DJs, and live performers shaping techno culture. From Detroit pioneers to Berlin residents."
        path="/artists"
        structuredData={itemListSchema}
      />
      <Header />
      <main className="pt-16 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="mb-8 sm:mb-12 space-y-3 sm:space-y-4">
            <div className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.3em]">
              // Archive
            </div>
            <h1 className="font-mono text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight">
              Artists
            </h1>
            <p className="font-mono text-xs sm:text-sm text-muted-foreground max-w-2xl">
              The producers, DJs, and live performers shaping techno culture. From Detroit pioneers to Berlin residents.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => {
                  if (searchQuery.trim()) {
                    trackSearch(searchQuery, filteredArtists.length);
                  }
                }}
                className="pl-10 font-mono text-xs sm:text-sm bg-transparent border-border"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => {
                    setSelectedRegion(region);
                    trackClick(`artists_filter_${region}`);
                  }}
                  className={`font-mono text-[10px] sm:text-xs uppercase tracking-wider px-2 sm:px-3 py-1 sm:py-1.5 border transition-colors ${
                    selectedRegion === region
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground'
                  }`}
                >
                  {regionLabels[region]}
                </button>
              ))}
            </div>
          </div>

          {/* Artists Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredArtists.map((artist, index) => (
              <Link
                key={artist.id}
                to={`/artists/${artist.id}`}
                className="group border border-border hover:bg-card transition-all duration-200 overflow-hidden"
              >
                {/* Artist Image */}
                <div className="aspect-[4/3] relative overflow-hidden bg-card/30">
                  {artist.photoUrl ? (
                    <GlitchImage 
                      src={artist.photoUrl} 
                      alt={artist.name}
                      className="w-full h-full"
                      frameNumber={String(index + 1).padStart(2, '0')}
                      size="thumbnail"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12 text-muted-foreground/20" />
                    </div>
                  )}
                </div>
                
                <div className="p-3 sm:p-4">
                  <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">
                        {artist.rank ? `#${artist.rank}` : `#${index + 1}`}
                      </span>
                      <h2 className="font-mono text-sm sm:text-lg uppercase tracking-wide group-hover:animate-glitch truncate">
                        {artist.name}
                      </h2>
                    </div>
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all mt-1 flex-shrink-0" />
                  </div>
                    
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 font-mono text-[10px] sm:text-xs text-muted-foreground">
                    <span>{artist.city}, {artist.country}</span>
                    {artistsWithGear.has(artist.id) && (
                      <>
                        <span className="text-border">|</span>
                        <span className="flex items-center gap-1 text-logo-green">
                          <Wrench className="w-3 h-3" />
                          Gear
                        </span>
                      </>
                    )}
                  </div>

                  {artist.knownFor && (
                    <p className="font-mono text-[10px] sm:text-xs text-muted-foreground line-clamp-2 mb-2 sm:mb-3">
                      {artist.knownFor}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1">
                    {(artist.subgenres || artist.tags || []).slice(0, 3).map(tag => (
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
            ))}
          </div>

          {/* Count */}
          <div className="mt-6 sm:mt-8 font-mono text-[10px] sm:text-xs text-muted-foreground">
            {filteredArtists.length} artists in archive
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ArtistsPage;
