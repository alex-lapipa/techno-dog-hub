import { Sparkles, Zap, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DJDog, RavingDog, NinjaDog, SpaceDog, GrumpyDog } from "@/components/DogPack";
import eulogioIcon from "@/assets/eulogio-e-icon.jpg";

// Hero images for each filter
import heroAllProducts from "@/assets/products/hero-all-products.jpg";
import heroCaps from "@/assets/products/hero-caps.jpg";
import heroTshirts from "@/assets/products/hero-tshirts.jpg";
import heroHoodies from "@/assets/products/hero-hoodies.jpg";
import heroTechnoDoggies from "@/assets/products/hero-techno-doggies.jpg";
import heroCollaborations from "@/assets/products/hero-collaborations.jpg";
import eulogioHeroImage from "@/assets/products/lifestyle-eulogio-crew-festival.jpg";

interface FilterHeroConfig {
  image: string;
  title: string;
  subtitle: string;
  description: string;
  badge?: string;
  badgeIcon?: "sparkles" | "zap" | "package";
  accentColor: string;
  buttonText?: string;
  showDoggies?: boolean;
  showEulogioLogo?: boolean;
}

const filterHeroConfigs: Record<string, FilterHeroConfig> = {
  all: {
    image: heroAllProducts,
    title: "All Products",
    subtitle: "The Complete Collection",
    description: "Every piece we make. From collabs to limited runs. Quality over quantity.",
    badge: "Full Catalog",
    badgeIcon: "package",
    accentColor: "logo-green",
    buttonText: "Browse All",
  },
  collaborations: {
    image: heroCollaborations,
    title: "Artist Collaborations",
    subtitle: "Limited Edition",
    description: "Exclusive pieces created with underground techno artists. When they're gone, they're gone.",
    badge: "Limited Drops",
    badgeIcon: "sparkles",
    accentColor: "amber-500",
    buttonText: "Shop Collabs",
  },
  "techno-doggies": {
    image: heroTechnoDoggies,
    title: "Techno Doggies",
    subtitle: "The Pack Collection",
    description: "5 unique characters. 15 pieces. Fun meets underground attitude.",
    badge: "New Collection",
    badgeIcon: "zap",
    accentColor: "logo-green",
    buttonText: "Meet the Pack",
    showDoggies: true,
  },
  "Caps": {
    image: heroCaps,
    title: "Caps",
    subtitle: "Headwear",
    description: "Low profile fits for long nights. Built for the booth and the floor.",
    badge: "Headwear",
    accentColor: "logo-green",
    buttonText: "Shop Caps",
  },
  "T-Shirts": {
    image: heroTshirts,
    title: "T-Shirts",
    subtitle: "Essentials",
    description: "Premium cotton. Bold graphics. Designed for movement.",
    badge: "Essentials",
    accentColor: "logo-green",
    buttonText: "Shop Tees",
  },
  "Hoodies": {
    image: heroHoodies,
    title: "Hoodies",
    subtitle: "Layers",
    description: "Heavyweight comfort for cold warehouses and early morning walks home.",
    badge: "Layers",
    accentColor: "logo-green",
    buttonText: "Shop Hoodies",
  },
  // Eulogio special config
  "eulogio": {
    image: eulogioHeroImage,
    title: "Eulogio × techno.dog",
    subtitle: "Berlin Heritage",
    description: "Berlin techno heritage meets underground culture. Two exclusive pieces celebrating the raw energy of warehouse nights.",
    badge: "Limited Collaboration",
    badgeIcon: "sparkles",
    accentColor: "amber-500",
    buttonText: "Shop Collection",
    showEulogioLogo: true,
  },
};

// Generic config for unknown product types
const getGenericConfig = (productType: string): FilterHeroConfig => ({
  image: heroAllProducts,
  title: productType,
  subtitle: "Collection",
  description: `Browse our ${productType.toLowerCase()} selection. Limited editions, quality materials.`,
  badge: productType,
  accentColor: "logo-green",
  buttonText: `Shop ${productType}`,
});

interface FilterHeroHeaderProps {
  filterType: string | null;
  productCount?: number;
}

export function FilterHeroHeader({ filterType, productCount }: FilterHeroHeaderProps) {
  const configKey = filterType || "all";
  const config = filterHeroConfigs[configKey] || getGenericConfig(configKey);
  
  const BadgeIcon = config.badgeIcon === "sparkles" ? Sparkles 
    : config.badgeIcon === "zap" ? Zap 
    : Package;
  
  const accentColorClass = config.accentColor === "amber-500" 
    ? "text-amber-500 border-amber-500/30 bg-amber-500/10" 
    : "text-logo-green border-logo-green/30 bg-logo-green/10";
  
  const buttonColorClass = config.accentColor === "amber-500"
    ? "bg-amber-500 text-background hover:bg-amber-400"
    : "bg-logo-green text-background hover:bg-logo-green/80";

  const borderColorClass = config.accentColor === "amber-500"
    ? "border-amber-500/50"
    : "border-logo-green/30";

  return (
    <section className="border-b border-border overflow-hidden">
      <div className="relative h-[250px] md:h-[320px] lg:h-[380px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={config.image}
            alt={config.title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/90" />
        </div>
        
        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 md:px-8 pb-8 md:pb-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div className="max-w-xl">
                {/* Badge */}
                <div className="flex items-center gap-3 mb-4">
                  {config.showEulogioLogo && (
                    <div className="bg-[#1a1a1a] p-2">
                      <img 
                        src={eulogioIcon}
                        alt="Eulogio" 
                        className="h-6 md:h-8 w-auto object-contain"
                      />
                    </div>
                  )}
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 border ${accentColorClass}`}>
                    <BadgeIcon className="w-3 h-3" />
                    <span className="font-mono text-[9px] uppercase tracking-widest">
                      {config.badge}
                    </span>
                  </div>
                </div>
                
                {/* Title with optional doggies */}
                <div className="flex items-center gap-3 mb-3">
                  {config.showDoggies && (
                    <DJDog className="w-8 h-8 md:w-10 md:h-10 shrink-0 hidden sm:block" animated />
                  )}
                  <h2 className="font-mono text-2xl md:text-3xl lg:text-4xl uppercase tracking-tight text-foreground drop-shadow-lg">
                    {config.title}
                  </h2>
                  {config.showDoggies && (
                    <RavingDog className="w-8 h-8 md:w-10 md:h-10 shrink-0 hidden sm:block" animated />
                  )}
                </div>
                
                <p className="font-mono text-xs text-foreground/80 max-w-md leading-relaxed drop-shadow-md">
                  {config.description}
                </p>
                
                {productCount !== undefined && (
                  <p className="font-mono text-[10px] text-muted-foreground mt-2">
                    {productCount} {productCount === 1 ? 'product' : 'products'} available
                  </p>
                )}
              </div>
              
              {/* Techno Doggies character icons */}
              {config.showDoggies && (
                <div className="hidden lg:flex items-center gap-2 shrink-0">
                  <div className={`p-2 border ${borderColorClass} bg-background/50`}>
                    <NinjaDog className="w-6 h-6" />
                  </div>
                  <div className={`p-2 border ${borderColorClass} bg-background/50`}>
                    <SpaceDog className="w-6 h-6" />
                  </div>
                  <div className={`p-2 border ${borderColorClass} bg-background/50`}>
                    <GrumpyDog className="w-6 h-6" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Decorative Corners */}
        <div className={`absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 ${borderColorClass}`} />
        <div className={`absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 ${borderColorClass}`} />
      </div>
    </section>
  );
}
