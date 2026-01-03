import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Search, MapPin, Loader2 } from "lucide-react";
import { useVenues, usePrefetchVenue } from "@/hooks/useData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { Input } from "@/components/ui/input";
import { GlitchImage, GlitchSVGFilter } from "@/components/store/GlitchImage";
import { cn } from "@/lib/utils";
import { TopicalClusterLinks } from "@/components/shared/TopicalClusterLinks";

type RegionFilter = "all" | "europe" | "north-america" | "south-america" | "asia" | "oceania" | "africa";
type StatusFilter = "all" | "open" | "closed";

const regionLabels: Record<RegionFilter, string> = {
  "all": "All Regions",
  "europe": "Europe",
  "north-america": "North America",
  "south-america": "South America",
  "asia": "Asia",
  "oceania": "Oceania",
  "africa": "Africa"
};

const statusLabels: Record<StatusFilter, string> = {
  "all": "All Venues",
  "open": "Still Open",
  "closed": "Closed / Historic"
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

// Helper to check if venue is currently open based on "active" field
const isVenueOpen = (active: string | undefined): boolean => {
  if (!active) return false;
  return active.toLowerCase().includes('present');
};

const VenuesPage = () => {
  const prefetchVenue = usePrefetchVenue();
  const { data: venues = [], isLoading } = useVenues();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Sync filters from URL
  const regionFromUrl = searchParams.get("region") as RegionFilter | null;
  const statusFromUrl = searchParams.get("status") as StatusFilter | null;
  
  const [selectedRegion, setSelectedRegion] = useState<RegionFilter>(
    regionFromUrl && Object.keys(regionLabels).includes(regionFromUrl)
      ? regionFromUrl
      : "all"
  );
  
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>(
    statusFromUrl && Object.keys(statusLabels).includes(statusFromUrl)
      ? statusFromUrl
      : "all"
  );

  // Update URL when filters change
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    
    if (selectedRegion === "all") {
      newParams.delete("region");
    } else {
      newParams.set("region", selectedRegion);
    }
    
    if (selectedStatus === "all") {
      newParams.delete("status");
    } else {
      newParams.set("status", selectedStatus);
    }
    
    setSearchParams(newParams, { replace: true });
  }, [selectedRegion, selectedStatus, searchParams, setSearchParams]);

  const filteredVenues = useMemo(() => {
    return venues.filter(venue => {
      const matchesSearch = searchQuery === "" || 
        venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.type?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const venueRegion = countryToRegion[venue.country || ""] || "europe";
      const matchesRegion = selectedRegion === "all" || venueRegion === selectedRegion;
      
      const venueIsOpen = isVenueOpen(venue.active);
      const matchesStatus = selectedStatus === "all" || 
        (selectedStatus === "open" && venueIsOpen) ||
        (selectedStatus === "closed" && !venueIsOpen);
      
      return matchesSearch && matchesRegion && matchesStatus;
    });
  }, [venues, searchQuery, selectedRegion, selectedStatus]);

  // Counts for status tabs
  const openCount = useMemo(() => venues.filter(v => isVenueOpen(v.active)).length, [venues]);
  const closedCount = useMemo(() => venues.filter(v => !isVenueOpen(v.active)).length, [venues]);

  const regions: RegionFilter[] = ["all", "europe", "north-america", "south-america", "asia", "oceania", "africa"];
  const statuses: StatusFilter[] = ["all", "open", "closed"];

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Techno Venues & Clubs",
    "description": "Directory of techno clubs, warehouses and spaces worldwide",
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
        title="Techno Venues & Clubs"
        description="Techno clubs and warehouses worldwide. Berghain, Bassiani, Tresor, Khidi. Active and historic venues."
        path="/venues"
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
              Venues
            </h1>
            <p className="font-mono text-xs sm:text-sm text-muted-foreground max-w-2xl">
              The clubs, warehouses, and spaces where techno lives. Active and historic.
            </p>
            <div className="flex items-center gap-4 font-mono text-[10px] sm:text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-logo-green animate-pulse" />
                {openCount} open
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                {closedCount} historic
              </span>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="mb-6 sm:mb-8 border-b border-border/50">
            <div className="flex gap-0">
              {statuses.map((status) => {
                const count = status === "all" ? venues.length : 
                              status === "open" ? openCount : closedCount;
                return (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={cn(
                      "font-mono text-xs sm:text-sm uppercase tracking-wider px-4 sm:px-6 py-3 border-b-2 transition-colors relative",
                      selectedStatus === status
                        ? "text-foreground border-logo-green"
                        : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {status === "open" && <span className="w-1.5 h-1.5 rounded-full bg-logo-green" />}
                      {status === "closed" && <span className="w-1.5 h-1.5 rounded-full bg-crimson/60" />}
                      {statusLabels[status]}
                      <span className="text-[10px] text-muted-foreground">({count})</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search & Region Filter */}
          <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 font-mono text-xs sm:text-sm bg-transparent border-border"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={cn(
                    "font-mono text-[10px] sm:text-xs uppercase tracking-wider px-2 sm:px-3 py-1 sm:py-1.5 border transition-colors",
                    selectedRegion === region
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                  )}
                >
                  {regionLabels[region]}
                </button>
              ))}
            </div>
          </div>

          {/* Venues Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredVenues.map((venue, index) => {
              const venueIsOpen = isVenueOpen(venue.active);
              
              return (
                <Link
                  key={venue.id}
                  to={`/venues/${venue.id}`}
                  onMouseEnter={() => prefetchVenue(venue.id)}
                  className="group border border-border hover:bg-card transition-all duration-200 overflow-hidden"
                >
                  {/* Venue Image */}
                  <div className="aspect-[4/3] relative overflow-hidden bg-card/30">
                    {venue.imageUrl ? (
                      <GlitchImage 
                        src={venue.imageUrl} 
                        alt={venue.name}
                        className="w-full h-full"
                        frameNumber={String(index + 1).padStart(2, '0')}
                        size="thumbnail"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="w-12 h-12 text-muted-foreground/20" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className={cn(
                      "absolute top-2 right-2 z-20 font-mono text-[8px] sm:text-[9px] uppercase tracking-wider px-1.5 py-0.5 border",
                      venueIsOpen 
                        ? "bg-logo-green/90 text-background border-logo-green" 
                        : "bg-crimson/80 text-white border-crimson"
                    )}>
                      {venueIsOpen ? "OPEN" : "CLOSED"}
                    </div>
                  </div>
                  
                  <div className="p-3 sm:p-4">
                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                      <div className="flex-1 min-w-0">
                        <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider border border-border px-1 py-0.5">
                          {venue.type}
                        </span>
                        <h2 className="font-mono text-sm sm:text-lg uppercase tracking-wide group-hover:animate-glitch truncate mt-1">
                          {venue.name}
                        </h2>
                      </div>
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all mt-1 flex-shrink-0" />
                    </div>
                      
                    <div className="flex items-center gap-2 mb-2 sm:mb-3 font-mono text-[10px] sm:text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{venue.city}, {venue.country}</span>
                      {venue.active && (
                        <>
                          <span className="text-border">|</span>
                          <span className={venueIsOpen ? 'text-logo-green' : 'text-crimson/70'}>
                            {venue.active}
                          </span>
                        </>
                      )}
                    </div>

                    {venue.atmosphere && (
                      <p className="font-mono text-[10px] sm:text-xs text-muted-foreground line-clamp-2 mb-2 sm:mb-3">
                        {venue.atmosphere}
                      </p>
                    )}

                    {venue.tags && venue.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {venue.tags.slice(0, 3).map(tag => (
                          <span 
                            key={tag} 
                            className="font-mono text-[9px] sm:text-[10px] text-muted-foreground border border-border/50 px-1 sm:px-1.5 py-0.5"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* No results */}
          {filteredVenues.length === 0 && (
            <div className="text-center py-16">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="font-mono text-sm text-muted-foreground">
                No venues found matching your filters.
              </p>
            </div>
          )}

          {/* Count */}
          <div className="mt-6 sm:mt-8 font-mono text-[10px] sm:text-xs text-muted-foreground">
            {filteredVenues.length} venues in archive
          </div>

          {/* Internal Linking - Hub/Spoke SEO Structure */}
          <div className="mt-8 sm:mt-12 space-y-4">
            <TopicalClusterLinks
              title="Explore by Scene"
              description="Discover the artists, festivals, and labels connected to these venues"
              links={[
                { label: "Artists", path: "/artists", count: 182 },
                { label: "Festivals", path: "/festivals" },
                { label: "Labels", path: "/labels", count: 12 },
                { label: "Collectives", path: "/collectives" },
              ]}
            />
            
            <TopicalClusterLinks
              title="Deep Dives"
              description="Learn more about techno culture"
              links={[
                { label: "Books", path: "/books", count: 49 },
                { label: "Documentaries", path: "/documentaries", count: 31 },
                { label: "Gear", path: "/gear", count: 99 },
                { label: "Timeline", path: "/timeline" },
              ]}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VenuesPage;
