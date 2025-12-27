import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Camera, Filter } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { Button } from "@/components/ui/button";
import FilmFrame from "@/components/FilmFrame";
import FilmGrainOverlay from "@/components/FilmGrainOverlay";

// Lifestyle images with product references
const lookbookImages = [
  {
    src: "/src/assets/products/lifestyle-warehouse-tshirt-club.jpg",
    alt: "Warehouse Tee in underground club",
    product: "Warehouse Tee",
    handle: "warehouse",
    setting: "Underground Club",
  },
  {
    src: "/src/assets/products/lifestyle-night-shift-festival.jpg",
    alt: "Night Shift Hoodie at festival",
    product: "Night Shift Hoodie",
    handle: "night-shift",
    setting: "Festival",
  },
  {
    src: "/src/assets/products/lifestyle-closing-set-studio.jpg",
    alt: "Closing Set Longsleeve in DJ studio",
    product: "Closing Set Longsleeve",
    handle: "closing-set",
    setting: "DJ Studio",
  },
  {
    src: "/src/assets/products/lifestyle-crop-top-club.jpg",
    alt: "Rave Crop Top in warehouse",
    product: "Rave Crop Top",
    handle: "rave-crop-top",
    setting: "Warehouse Rave",
  },
  {
    src: "/src/assets/products/lifestyle-bike-shorts-club.jpg",
    alt: "Afterhours Bike Shorts in club",
    product: "Afterhours Bike Shorts",
    handle: "afterhours-bike-shorts",
    setting: "Club",
  },
  {
    src: "/src/assets/products/lifestyle-leggings-club.jpg",
    alt: "Mainroom Leggings with laser lights",
    product: "Mainroom Leggings",
    handle: "mainroom-leggings",
    setting: "Laser Room",
  },
  {
    src: "/src/assets/products/lifestyle-low-profile-rave.jpg",
    alt: "Low Profile Cap at rave",
    product: "Low Profile Cap",
    handle: "low-profile",
    setting: "Rave",
  },
  {
    src: "/src/assets/products/lifestyle-tote-street.jpg",
    alt: "Record Bag on night street",
    product: "Record Bag",
    handle: "record-bag",
    setting: "Night Street",
  },
  {
    src: "/src/assets/products/lifestyle-sports-bra-club.jpg",
    alt: "Peak Hour Sports Bra backstage",
    product: "Peak Hour Sports Bra",
    handle: "peak-hour-sports-bra",
    setting: "Backstage",
  },
  {
    src: "/src/assets/products/lifestyle-womens-tee-rave.jpg",
    alt: "Fitted Tee in warehouse",
    product: "Fitted V-Neck",
    handle: "womens-fitted-v-neck",
    setting: "Warehouse",
  },
  {
    src: "/src/assets/products/lifestyle-warehouse-sessions-club.jpg",
    alt: "Warehouse Sessions Tee with turntables",
    product: "Warehouse Sessions Tee",
    handle: "eulogio-x-techno-dog",
    setting: "DJ Booth",
  },
  // NEW: Festival & Rave Lifestyle Photos
  {
    src: "/src/assets/products/lifestyle-hoodie-festival.jpg",
    alt: "Hoodie at outdoor festival sunset",
    product: "Night Shift Hoodie",
    handle: "night-shift",
    setting: "Outdoor Festival",
  },
  {
    src: "/src/assets/products/lifestyle-crop-top-diverse1.jpg",
    alt: "Crop Top dancing at sunset festival",
    product: "Rave Crop Top",
    handle: "rave-crop-top",
    setting: "Festival Stage",
  },
  {
    src: "/src/assets/products/lifestyle-leggings-diverse1.jpg",
    alt: "Leggings on packed dancefloor with lasers",
    product: "Mainroom Leggings",
    handle: "mainroom-leggings",
    setting: "Dancefloor",
  },
  {
    src: "/src/assets/products/lifestyle-warehouse-tshirt-diverse1.jpg",
    alt: "Tee at forest rave with laser beams",
    product: "Warehouse Tee",
    handle: "warehouse",
    setting: "Forest Rave",
  },
  {
    src: "/src/assets/products/lifestyle-sports-bra-diverse1.jpg",
    alt: "Sports Bra dancing at sunrise festival",
    product: "Peak Hour Sports Bra",
    handle: "peak-hour-sports-bra",
    setting: "Sunrise Set",
  },
  {
    src: "/src/assets/products/lifestyle-shorts-diverse1.jpg",
    alt: "Shorts on crowded dancefloor with lasers",
    product: "Afterhours Bike Shorts",
    handle: "afterhours-bike-shorts",
    setting: "Peak Time",
  },
  {
    src: "/src/assets/products/lifestyle-longsleeve-diverse1.jpg",
    alt: "Longsleeve at main stage festival",
    product: "Closing Set Longsleeve",
    handle: "closing-set",
    setting: "Main Stage",
  },
  {
    src: "/src/assets/products/lifestyle-tote-diverse1.jpg",
    alt: "Record Bag at industrial outdoor rave",
    product: "Record Bag",
    handle: "record-bag",
    setting: "Industrial Rave",
  },
  {
    src: "/src/assets/products/lifestyle-cap-diverse1.jpg",
    alt: "Cap on dancefloor hands in air",
    product: "Low Profile Cap",
    handle: "low-profile",
    setting: "Hands Up",
  },
  {
    src: "/src/assets/products/lifestyle-vneck-diverse1.jpg",
    alt: "V-Neck at dusty outdoor festival",
    product: "Fitted V-Neck",
    handle: "womens-fitted-v-neck",
    setting: "Festival Dust",
  },
  // NEW: Diverse Model Lifestyle Photos
  {
    src: "/src/assets/products/lifestyle-hoodie-diverse1.jpg",
    alt: "Black woman in hoodie at outdoor festival",
    product: "Night Shift Hoodie",
    handle: "night-shift",
    setting: "Golden Hour",
  },
  {
    src: "/src/assets/products/lifestyle-warehouse-v2.jpg",
    alt: "Asian man in tee on dancefloor",
    product: "Warehouse Tee",
    handle: "warehouse",
    setting: "Warehouse Floor",
  },
  {
    src: "/src/assets/products/lifestyle-crop-top-diverse2.jpg",
    alt: "Latina woman dancing at sunset festival",
    product: "Rave Crop Top",
    handle: "rave-crop-top",
    setting: "Sunset Rave",
  },
  {
    src: "/src/assets/products/lifestyle-night-shift-v2.jpg",
    alt: "Man in longsleeve at night rave with lasers",
    product: "Closing Set Longsleeve",
    handle: "closing-set",
    setting: "Laser Night",
  },
  {
    src: "/src/assets/products/lifestyle-leggings-diverse2.jpg",
    alt: "Woman in leggings on dancefloor with lights",
    product: "Mainroom Leggings",
    handle: "mainroom-leggings",
    setting: "Club Lights",
  },
  {
    src: "/src/assets/products/lifestyle-sports-bra-diverse2.jpg",
    alt: "Asian woman at sunrise outdoor festival",
    product: "Peak Hour Sports Bra",
    handle: "peak-hour-sports-bra",
    setting: "Festival Dawn",
  },
  {
    src: "/src/assets/products/lifestyle-shorts-diverse2.jpg",
    alt: "Man in shorts with green lasers",
    product: "Afterhours Bike Shorts",
    handle: "afterhours-bike-shorts",
    setting: "Laser Storm",
  },
  {
    src: "/src/assets/products/lifestyle-vneck-diverse2.jpg",
    alt: "South Asian woman at festival sunset",
    product: "Fitted V-Neck",
    handle: "womens-fitted-v-neck",
    setting: "Festival Glow",
  },
  {
    src: "/src/assets/products/lifestyle-cap-dj-booth.jpg",
    alt: "Black man DJ in cap at booth",
    product: "Low Profile Cap",
    handle: "low-profile",
    setting: "DJ Booth",
  },
  {
    src: "/src/assets/products/lifestyle-bundle-diverse1.jpg",
    alt: "Diverse group at festival sunset",
    product: "Collection",
    handle: "warehouse",
    setting: "Festival Crew",
  },
  // Eulogio × techno.dog Collaboration Lifestyle
  {
    src: "/src/assets/products/lifestyle-eulogio-cap-festival.jpg",
    alt: "Black woman in Eulogio cap at outdoor festival",
    product: "Eulogio × techno.dog Cap",
    handle: "eulogio-techno-dog-cap",
    setting: "Festival Golden Hour",
  },
  {
    src: "/src/assets/products/lifestyle-eulogio-hoodie-club.jpg",
    alt: "Man in Eulogio hoodie in warehouse club with lasers",
    product: "Eulogio × techno.dog Hoodie",
    handle: "eulogio-techno-dog-hoodie",
    setting: "Warehouse Lasers",
  },
  {
    src: "/src/assets/products/lifestyle-eulogio-hoodie-sunrise.jpg",
    alt: "Asian woman in Eulogio hoodie at festival sunrise",
    product: "Eulogio × techno.dog Hoodie",
    handle: "eulogio-techno-dog-hoodie",
    setting: "Festival Sunrise",
  },
  {
    src: "/src/assets/products/lifestyle-eulogio-cap-dj.jpg",
    alt: "Latino DJ in Eulogio cap behind decks",
    product: "Eulogio × techno.dog Cap",
    handle: "eulogio-techno-dog-cap",
    setting: "DJ Booth",
  },
  {
    src: "/src/assets/products/lifestyle-eulogio-crew-festival.jpg",
    alt: "Festival crew wearing Eulogio hoodie and cap",
    product: "Eulogio × techno.dog",
    handle: "eulogio-techno-dog-hoodie",
    setting: "Festival Crew",
  },
  {
    src: "/src/assets/products/lifestyle-eulogio-hoodie-dance.jpg",
    alt: "Woman dancing in Eulogio hoodie at club",
    product: "Eulogio × techno.dog Hoodie",
    handle: "eulogio-techno-dog-hoodie",
    setting: "Dancefloor",
  },
  {
    src: "/src/assets/products/lifestyle-eulogio-tshirt-rave.jpg",
    alt: "Man dancing in Eulogio T-shirt at warehouse rave",
    product: "Eulogio × techno.dog Tee",
    handle: "eulogio-techno-dog-tee",
    setting: "Warehouse Rave",
  },
];

// Import lifestyle images for bundling
import lifestyleWarehouse from "@/assets/products/lifestyle-warehouse-tshirt-club.jpg";
import lifestyleNightShift from "@/assets/products/lifestyle-night-shift-festival.jpg";
import lifestyleClosingSet from "@/assets/products/lifestyle-closing-set-studio.jpg";
import lifestyleCropTop from "@/assets/products/lifestyle-crop-top-club.jpg";
import lifestyleBikeShorts from "@/assets/products/lifestyle-bike-shorts-club.jpg";
import lifestyleLeggings from "@/assets/products/lifestyle-leggings-club.jpg";
import lifestyleLowProfile from "@/assets/products/lifestyle-low-profile-rave.jpg";
import lifestyleTote from "@/assets/products/lifestyle-tote-street.jpg";
import lifestyleSportsBra from "@/assets/products/lifestyle-sports-bra-club.jpg";
import lifestyleWomensTee from "@/assets/products/lifestyle-womens-tee-rave.jpg";
import lifestyleWarehouseSessions from "@/assets/products/lifestyle-warehouse-sessions-club.jpg";
// NEW: Festival & Rave imports
import lifestyleHoodieFestival from "@/assets/products/lifestyle-hoodie-festival.jpg";
import lifestyleCropTopDiverse1 from "@/assets/products/lifestyle-crop-top-diverse1.jpg";
import lifestyleLeggingsDiverse1 from "@/assets/products/lifestyle-leggings-diverse1.jpg";
import lifestyleWarehouseTshirtDiverse1 from "@/assets/products/lifestyle-warehouse-tshirt-diverse1.jpg";
import lifestyleSportsBraDiverse1 from "@/assets/products/lifestyle-sports-bra-diverse1.jpg";
import lifestyleShortsDiverse1 from "@/assets/products/lifestyle-shorts-diverse1.jpg";
import lifestyleLongsleeveDiverse1 from "@/assets/products/lifestyle-longsleeve-diverse1.jpg";
import lifestyleToteDiverse1 from "@/assets/products/lifestyle-tote-diverse1.jpg";
import lifestyleCapDiverse1 from "@/assets/products/lifestyle-cap-diverse1.jpg";
import lifestyleVneckDiverse1 from "@/assets/products/lifestyle-vneck-diverse1.jpg";
// NEW: Diverse Model imports
import lifestyleHoodieDiverse1 from "@/assets/products/lifestyle-hoodie-diverse1.jpg";
import lifestyleWarehouseV2 from "@/assets/products/lifestyle-warehouse-v2.jpg";
import lifestyleCropTopDiverse2 from "@/assets/products/lifestyle-crop-top-diverse2.jpg";
import lifestyleNightShiftV2 from "@/assets/products/lifestyle-night-shift-v2.jpg";
import lifestyleLeggingsDiverse2 from "@/assets/products/lifestyle-leggings-diverse2.jpg";
import lifestyleSportsBraDiverse2 from "@/assets/products/lifestyle-sports-bra-diverse2.jpg";
import lifestyleShortsDiverse2 from "@/assets/products/lifestyle-shorts-diverse2.jpg";
import lifestyleVneckDiverse2 from "@/assets/products/lifestyle-vneck-diverse2.jpg";
import lifestyleCapDjBooth from "@/assets/products/lifestyle-cap-dj-booth.jpg";
import lifestyleBundleDiverse1 from "@/assets/products/lifestyle-bundle-diverse1.jpg";
// Eulogio × techno.dog Collaboration imports
import lifestyleEulogioCapFestival from "@/assets/products/lifestyle-eulogio-cap-festival.jpg";
import lifestyleEulogioHoodieClub from "@/assets/products/lifestyle-eulogio-hoodie-club.jpg";
import lifestyleEulogioHoodieSunrise from "@/assets/products/lifestyle-eulogio-hoodie-sunrise.jpg";
import lifestyleEulogioCapDj from "@/assets/products/lifestyle-eulogio-cap-dj.jpg";
import lifestyleEulogioCrewFestival from "@/assets/products/lifestyle-eulogio-crew-festival.jpg";
import lifestyleEulogioHoodieDance from "@/assets/products/lifestyle-eulogio-hoodie-dance.jpg";
import lifestyleEulogioTshirtRave from "@/assets/products/lifestyle-eulogio-tshirt-rave.jpg";

const imageImports = [
  lifestyleWarehouse,
  lifestyleNightShift,
  lifestyleClosingSet,
  lifestyleCropTop,
  lifestyleBikeShorts,
  lifestyleLeggings,
  lifestyleLowProfile,
  lifestyleTote,
  lifestyleSportsBra,
  lifestyleWomensTee,
  lifestyleWarehouseSessions,
  // NEW images
  lifestyleHoodieFestival,
  lifestyleCropTopDiverse1,
  lifestyleLeggingsDiverse1,
  lifestyleWarehouseTshirtDiverse1,
  lifestyleSportsBraDiverse1,
  lifestyleShortsDiverse1,
  lifestyleLongsleeveDiverse1,
  lifestyleToteDiverse1,
  lifestyleCapDiverse1,
  lifestyleVneckDiverse1,
  // NEW: Diverse Model images
  lifestyleHoodieDiverse1,
  lifestyleWarehouseV2,
  lifestyleCropTopDiverse2,
  lifestyleNightShiftV2,
  lifestyleLeggingsDiverse2,
  lifestyleSportsBraDiverse2,
  lifestyleShortsDiverse2,
  lifestyleVneckDiverse2,
  lifestyleCapDjBooth,
  lifestyleBundleDiverse1,
  // Eulogio × techno.dog Collaboration images
  lifestyleEulogioCapFestival,
  lifestyleEulogioHoodieClub,
  lifestyleEulogioHoodieSunrise,
  lifestyleEulogioCapDj,
  lifestyleEulogioCrewFestival,
  lifestyleEulogioHoodieDance,
  lifestyleEulogioTshirtRave,
];

// Setting categories for grouping filters
const settingCategories: Record<string, string[]> = {
  "All": [],
  "Festival": ["Festival", "Outdoor Festival", "Festival Stage", "Main Stage", "Festival Dust", "Festival Golden Hour", "Festival Sunrise", "Festival Dawn", "Festival Glow", "Festival Crew", "Sunset Rave", "Golden Hour"],
  "Club": ["Club", "Underground Club", "Warehouse", "Warehouse Rave", "Warehouse Floor", "Warehouse Lasers", "Club Lights", "Laser Room", "Laser Night", "Laser Storm"],
  "DJ Booth": ["DJ Booth", "DJ Studio", "Backstage"],
  "Dancefloor": ["Dancefloor", "Peak Time", "Hands Up"],
  "Rave": ["Rave", "Forest Rave", "Industrial Rave"],
  "Street": ["Night Street"],
  "Sunrise": ["Sunrise Set", "Festival Sunrise", "Festival Dawn"],
  "Eulogio": ["Festival Golden Hour", "Warehouse Lasers", "Festival Sunrise", "DJ Booth", "Festival Crew", "Dancefloor", "Warehouse Rave"].filter((_, i) => i < 10),
};

const Lookbook = () => {
  const [activeFilter, setActiveFilter] = useState<string>("All");

  // Get all unique settings
  const allSettings = useMemo(() => {
    const settings = new Set(lookbookImages.map(img => img.setting));
    return Array.from(settings).sort();
  }, []);

  // Filter images based on active filter
  const filteredImages = useMemo(() => {
    if (activeFilter === "All") return lookbookImages;
    if (activeFilter === "Eulogio") {
      return lookbookImages.filter(img => img.product.includes("Eulogio"));
    }
    const categorySettings = settingCategories[activeFilter];
    if (categorySettings && categorySettings.length > 0) {
      return lookbookImages.filter(img => 
        categorySettings.some(setting => img.setting.includes(setting) || setting.includes(img.setting))
      );
    }
    return lookbookImages.filter(img => img.setting === activeFilter);
  }, [activeFilter]);

  // Get image index in original array for proper import mapping
  const getOriginalIndex = (image: typeof lookbookImages[0]) => {
    return lookbookImages.findIndex(img => img.src === image.src);
  };

  return (
    <>
      <FilmGrainOverlay />
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO
        title="Lookbook | techno.dog"
        description="Visual stories from the warehouse. See techno.dog apparel in its natural habitat - clubs, festivals, and studios."
        path="/store/lookbook"
      />
      <Header />

      <main className="pt-24 lg:pt-16">
        {/* Hero */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-16 md:py-24">
            <Link to="/store" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-8">
              <ArrowLeft className="w-3 h-3" />
              Back to Store
            </Link>
            
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Camera className="w-5 h-5 text-logo-green" />
                <span className="font-mono text-[10px] text-logo-green uppercase tracking-widest">
                  // Lookbook
                </span>
              </div>
              <h1 className="font-mono text-3xl md:text-5xl uppercase tracking-tight">
                From the warehouse floor.
              </h1>
              <p className="font-mono text-sm text-muted-foreground mt-6 max-w-lg leading-relaxed">
                Visual stories captured in clubs, festivals, and studios. Our pieces in their natural habitat.
              </p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="border-b border-border sticky top-0 z-40 bg-background/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 md:px-8 py-4">
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
              <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              {Object.keys(settingCategories).map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveFilter(category)}
                  className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border transition-all flex-shrink-0 ${
                    activeFilter === category
                      ? "bg-logo-green text-background border-logo-green"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                  }`}
                >
                  {category}
                  {category !== "All" && (
                    <span className="ml-1.5 opacity-60">
                      ({category === "Eulogio" 
                        ? lookbookImages.filter(img => img.product.includes("Eulogio")).length
                        : settingCategories[category]?.length > 0
                          ? lookbookImages.filter(img => 
                              settingCategories[category].some(s => img.setting.includes(s) || s.includes(img.setting))
                            ).length
                          : 0
                      })
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Magazine Grid */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-12">
            {/* Results count */}
            <p className="font-mono text-[10px] text-muted-foreground mb-6">
              Showing {filteredImages.length} of {lookbookImages.length} images
            </p>
            
            {/* Masonry-style grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredImages.map((image, index) => {
                const originalIndex = getOriginalIndex(image);
                return (
                  <Link
                    key={originalIndex}
                    to={`/store/product/${image.handle}`}
                    className={`block ${
                      // Create visual interest with varied heights
                      index % 5 === 0 ? "md:row-span-2" : ""
                    } ${
                      index % 7 === 3 ? "lg:col-span-2" : ""
                    }`}
                  >
                    <div className="relative group">
                      <FilmFrame
                        src={imageImports[originalIndex]}
                        alt={image.alt}
                        frameNumber={String(originalIndex + 1).padStart(2, '0')}
                        aspectRatio={index % 5 === 0 ? "portrait" : "square"}
                        showSprockets={true}
                        size={index % 7 === 3 ? "lg" : "md"}
                      />
                      
                      {/* Info overlay */}
                      <div className="absolute bottom-3 left-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-background/90 backdrop-blur-sm border border-border p-3">
                          <span className="font-mono text-[10px] text-logo-green uppercase tracking-widest block">
                            {image.setting}
                          </span>
                          <h3 className="font-mono text-sm uppercase tracking-tight text-foreground mt-1">
                            {image.product}
                          </h3>
                          <span className="font-mono text-[10px] text-muted-foreground mt-2 inline-block">
                            View Product →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-16 text-center">
            <p className="font-mono text-xs text-muted-foreground mb-6">
              Ready to join the movement?
            </p>
            <Link to="/store">
              <Button 
                variant="outline" 
                className="font-mono text-xs uppercase tracking-wider"
              >
                Shop the Collection
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
    </>
  );
};

export default Lookbook;
