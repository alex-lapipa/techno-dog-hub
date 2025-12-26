import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Search, Sliders } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { gear, gearCategories, GearCategory } from "@/data/gear";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";

const GearPage = () => {
  const { language } = useLanguage();
  const { trackClick, trackSearch } = useAnalytics();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Sync category from URL
  const categoryFromUrl = searchParams.get("category") as GearCategory | null;
  const [selectedCategory, setSelectedCategory] = useState<GearCategory | "all">(
    categoryFromUrl && ["synth", "drum-machine", "sampler", "sequencer", "effect", "daw", "midi-tool"].includes(categoryFromUrl)
      ? categoryFromUrl
      : "all"
  );

  // Update URL when category changes
  useEffect(() => {
    if (selectedCategory === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", selectedCategory);
    }
    setSearchParams(searchParams, { replace: true });
  }, [selectedCategory, searchParams, setSearchParams]);

  const filteredGear = useMemo(() => {
    return gear.filter(item => {
      const matchesSearch = searchQuery === "" || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const categories: (GearCategory | "all")[] = ["all", "synth", "drum-machine", "sampler", "sequencer", "effect", "daw", "midi-tool"];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="mb-8 sm:mb-12 space-y-3 sm:space-y-4">
            <div className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.3em]">
              // {language === 'en' ? 'Studio Archive' : 'Archivo de Estudio'}
            </div>
            <h1 className="font-mono text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight">
              {language === 'en' ? 'Gear' : 'Equipo'}
            </h1>
            <p className="font-mono text-xs sm:text-sm text-muted-foreground max-w-2xl">
              {language === 'en' 
                ? 'The synthesizers, drum machines, samplers, and tools that shaped techno. From Detroit basements to Berlin warehouses.' 
                : 'Los sintetizadores, cajas de ritmos, samplers y herramientas que dieron forma al techno. De los sótanos de Detroit a los almacenes de Berlín.'}
            </p>
          </div>

          {/* Search & Filter */}
          <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={language === 'en' ? 'Search gear...' : 'Buscar equipo...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => {
                  if (searchQuery.trim()) {
                    trackSearch(searchQuery, filteredGear.length);
                  }
                }}
                className="pl-10 font-mono text-xs sm:text-sm bg-transparent border-border"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    trackClick(`gear_filter_${cat}`);
                  }}
                  className={`font-mono text-[10px] sm:text-xs uppercase tracking-wider px-2 sm:px-3 py-1 sm:py-1.5 border transition-colors ${
                    selectedCategory === cat
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground'
                  }`}
                >
                  {cat === 'all' 
                    ? (language === 'en' ? 'All' : 'Todos')
                    : gearCategories[cat][language]
                  }
                </button>
              ))}
            </div>
          </div>

          {/* Gear Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredGear.map((item) => (
              <Link
                key={item.id}
                to={`/gear/${item.id}`}
                className="group border border-border hover:bg-card transition-all duration-200 overflow-hidden"
              >
                {/* Gear Image or Icon placeholder */}
                <div className="aspect-[4/3] relative overflow-hidden bg-card/30 flex items-center justify-center">
                  {item.image ? (
                    <img 
                      src={item.image.url} 
                      alt={item.name}
                      className="w-full h-full object-contain p-3 sm:p-4"
                      loading="lazy"
                    />
                  ) : (
                    <Sliders className="w-12 h-12 text-muted-foreground/20" />
                  )}
                </div>
                
                <div className="p-3 sm:p-4">
                  <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">
                        {gearCategories[item.category][language]}
                      </span>
                      <h2 className="font-mono text-sm sm:text-lg uppercase tracking-wide group-hover:animate-glitch truncate">
                        {item.name}
                      </h2>
                    </div>
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all mt-1 flex-shrink-0" />
                  </div>
                    
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 font-mono text-[10px] sm:text-xs text-muted-foreground">
                    <span>{item.manufacturer}</span>
                    <span className="text-border">|</span>
                    <span>{item.releaseYear}</span>
                  </div>

                  <p className="font-mono text-[10px] sm:text-xs text-muted-foreground line-clamp-2 mb-2 sm:mb-3">
                    {item.shortDescription[language]}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map(tag => (
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
            {filteredGear.length} {language === 'en' ? 'items in archive' : 'elementos en archivo'}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GearPage;
