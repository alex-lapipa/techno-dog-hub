import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Search, Users, Loader2 } from "lucide-react";
import { crews } from "@/data/crews";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { Input } from "@/components/ui/input";
import { GlitchImage, GlitchSVGFilter } from "@/components/store/GlitchImage";
import { TopicalClusterLinks } from "@/components/shared/TopicalClusterLinks";
import crewHeroDefault from "@/assets/crews/crew-hero-default.jpg";

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
  "Germany": "europe", "United Kingdom": "europe", "UK": "europe", "France": "europe", "Netherlands": "europe",
  "Belgium": "europe", "Spain": "europe", "Italy": "europe", "Poland": "europe", "Sweden": "europe",
  "Denmark": "europe", "Norway": "europe", "Finland": "europe", "Austria": "europe", "Switzerland": "europe",
  "Portugal": "europe", "Ireland": "europe", "Czech Republic": "europe", "Hungary": "europe",
  "Romania": "europe", "Greece": "europe", "Ukraine": "europe", "Russia": "europe", "Georgia": "europe",
  // North America
  "United States": "north-america", "USA": "north-america", "Canada": "north-america", "Mexico": "north-america",
  // South America
  "Brazil": "south-america", "Argentina": "south-america", "Colombia": "south-america", "Chile": "south-america",
  // Asia
  "Japan": "asia", "China": "asia", "South Korea": "asia", "India": "asia", "Indonesia": "asia",
  // Oceania
  "Australia": "oceania", "New Zealand": "oceania",
  // Africa
  "South Africa": "africa", "Egypt": "africa", "Morocco": "africa", "Nigeria": "africa",
};

const typeLabels: Record<string, string> = {
  'sound system': 'Sound System',
  'collective': 'Collective',
  'party series': 'Party Series',
  'rave crew': 'Rave Crew'
};

const CrewsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  
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

  const filteredCrews = useMemo(() => {
    return crews.filter(crew => {
      const matchesSearch = searchQuery === "" || 
        crew.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crew.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crew.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crew.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crew.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const crewRegion = countryToRegion[crew.country || ""] || "europe";
      const matchesRegion = selectedRegion === "all" || crewRegion === selectedRegion;
      
      return matchesSearch && matchesRegion;
    });
  }, [searchQuery, selectedRegion]);

  const regions: RegionFilter[] = ["all", "europe", "north-america", "south-america", "asia", "oceania", "africa"];

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Techno Crews & Collectives",
    "description": "Sound systems, collectives and movements building the techno scene",
    "numberOfItems": crews.length,
    "itemListElement": crews.map((crew, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Organization",
        "name": crew.name,
        "url": `https://techno.dog/crews/${crew.id}`
      }
    }))
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <GlitchSVGFilter />
      <PageSEO
        title="Techno Crews & Collectives"
        description="The sound systems, collectives, and movements that build the techno scene worldwide."
        path="/crews"
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
              Crews & Collectives
            </h1>
            <p className="font-mono text-xs sm:text-sm text-muted-foreground max-w-2xl">
              The sound systems, collectives, and movements that build the scene.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search crews..."
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

          {/* Crews Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredCrews.map((crew, index) => (
              <Link
                key={crew.id}
                to={`/crews/${crew.id}`}
                className="group border border-border hover:bg-card transition-all duration-200 overflow-hidden"
              >
                {/* Crew Image with VHS Film Effect */}
                <div className="aspect-[4/3] relative overflow-hidden bg-card/30">
                  <GlitchImage 
                    src={crewHeroDefault} 
                    alt={crew.name}
                    className="w-full h-full"
                    frameNumber={String(index + 1).padStart(2, '0')}
                    size="thumbnail"
                  />
                </div>
                
                <div className="p-3 sm:p-4">
                  <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider border border-border px-1 py-0.5">
                        {typeLabels[crew.type] || crew.type}
                      </span>
                      <h2 className="font-mono text-sm sm:text-lg uppercase tracking-wide group-hover:animate-glitch truncate mt-1">
                        {crew.name}
                      </h2>
                    </div>
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all mt-1 flex-shrink-0" />
                  </div>
                    
                  <div className="flex items-center gap-2 mb-2 sm:mb-3 font-mono text-[10px] sm:text-xs text-muted-foreground">
                    <span>{crew.city}, {crew.country}</span>
                    {crew.founded && (
                      <>
                        <span className="text-border">|</span>
                        <span>Est. {crew.founded}</span>
                      </>
                    )}
                    {crew.active !== undefined && (
                      <>
                        <span className="text-border">|</span>
                        <span className={crew.active ? 'text-logo-green' : 'text-muted-foreground'}>
                          {crew.active ? 'Active' : 'Inactive'}
                        </span>
                      </>
                    )}
                  </div>

                  {crew.description && (
                    <p className="font-mono text-[10px] sm:text-xs text-muted-foreground line-clamp-2 mb-2 sm:mb-3">
                      {crew.description}
                    </p>
                  )}

                  {crew.tags && crew.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {crew.tags.slice(0, 3).map(tag => (
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
            ))}
          </div>

          {/* Count */}
          <div className="mt-6 sm:mt-8 font-mono text-[10px] sm:text-xs text-muted-foreground">
            {filteredCrews.length} crews in archive
          </div>

          {/* Internal Linking - Hub/Spoke SEO Structure */}
          <div className="mt-8 sm:mt-12 space-y-4">
            <TopicalClusterLinks
              title="Explore the Scene"
              description="Discover more of the techno ecosystem"
              links={[
                { label: "Venues", path: "/venues" },
                { label: "Festivals", path: "/festivals" },
                { label: "Labels", path: "/labels", count: 12 },
                { label: "Artists", path: "/artists", count: 182 },
              ]}
            />
            
            <TopicalClusterLinks
              title="Deep Dives"
              description="Learn more about techno culture"
              links={[
                { label: "Books", path: "/books", count: 49 },
                { label: "Documentaries", path: "/documentaries", count: 31 },
                { label: "Gear", path: "/gear", count: 99 },
                { label: "News", path: "/news" },
              ]}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CrewsPage;
