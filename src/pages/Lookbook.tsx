/**
 * techno.dog Lookbook
 * 
 * Editorial-style product showcase following the '90s London Underground aesthetic.
 * Integrates with Shopify for live product data and showcases the Techno Doggies
 * brand book when products are loading or unavailable.
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Camera, Filter, Loader2, ShoppingBag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import FilmFrame from "@/components/FilmFrame";
import FilmGrainOverlay from "@/components/FilmGrainOverlay";
import { fetchProducts } from "@/lib/shopify";
import { Button } from "@/components/ui/button";
import {
  DJDog,
  NinjaDog,
  SpaceDog,
  GrumpyDog,
  HappyDog,
  TechnoDog,
  DancingDog,
  AcidDog,
} from "@/components/DogPack";

// Brand book core variants for showcase
const CORE_VARIANTS = [
  { 
    id: 'dj-dog', 
    name: 'DJ Dog', 
    Component: DJDog, 
    personality: 'The selector, dropping beats',
    quote: 'The kick is the heartbeat. Everything else is just atmosphere.',
    product: 'Green Line Hoodie'
  },
  { 
    id: 'ninja-dog', 
    name: 'Ninja Dog', 
    Component: NinjaDog, 
    personality: 'Silent warrior of the night',
    quote: 'Move in silence. Let the bass speak.',
    product: 'White Line Tee'
  },
  { 
    id: 'space-dog', 
    name: 'Space Dog', 
    Component: SpaceDog, 
    personality: 'Cosmic explorer of sound',
    quote: 'Beyond the stars, there\'s only rhythm.',
    product: 'Green Line Cap'
  },
  { 
    id: 'grumpy-dog', 
    name: 'Grumpy Dog', 
    Component: GrumpyDog, 
    personality: 'The cynical veteran',
    quote: 'Back in my day, we had REAL 303s.',
    product: 'White Line Hoodie'
  },
  { 
    id: 'happy-dog', 
    name: 'Happy Dog', 
    Component: HappyDog, 
    personality: 'Pure positive energy',
    quote: 'Every beat is a blessing!',
    product: 'Green Line Tee'
  },
  { 
    id: 'techno-dog', 
    name: 'Techno Dog', 
    Component: TechnoDog, 
    personality: 'Glitched out & digital',
    quote: '01001011 01001001 01000011 01001011',
    product: 'White Line Cap'
  },
  { 
    id: 'dancing-dog', 
    name: 'Dancing Dog', 
    Component: DancingDog, 
    personality: 'Always moving',
    quote: 'Can\'t stop, won\'t stop. The floor is life.',
    product: 'Green Line Tote'
  },
  { 
    id: 'acid-dog', 
    name: 'Acid Dog', 
    Component: AcidDog, 
    personality: 'Deep repetitive vibes',
    quote: 'The 303 knows all. Surrender to the squelch.',
    product: 'Green Line Bandana'
  },
];

const Lookbook = () => {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [activeCollection, setActiveCollection] = useState<"products" | "mascots">("products");

  // Fetch products from Shopify
  const { data: products, isLoading } = useQuery({
    queryKey: ["shopify-products"],
    queryFn: () => fetchProducts(50),
    staleTime: 1000 * 60 * 5,
  });

  // Get unique product types for filters
  const productTypes = useMemo(() => {
    if (!products) return [];
    return [...new Set(products.map((p) => p.node.productType).filter(Boolean))];
  }, [products]);

  // Get all product images with metadata
  const allImages = useMemo(() => {
    if (!products) return [];
    return products.flatMap((product) =>
      product.node.images.edges.map((img, idx) => ({
        src: img.node.url,
        alt: img.node.altText || product.node.title,
        product: product.node.title,
        handle: product.node.handle,
        type: product.node.productType || "Collection",
        isMain: idx === 0,
      }))
    );
  }, [products]);

  // Filter images by type
  const filteredImages = useMemo(() => {
    if (activeFilter === "All") return allImages;
    return allImages.filter((img) => img.type === activeFilter);
  }, [activeFilter, allImages]);

  const hasProducts = allImages.length > 0;

  return (
    <>
      <FilmGrainOverlay />
      <div className="min-h-screen bg-background text-foreground">
        <PageSEO
          title="Lookbook | Techno Doggies Black Line Collection"
          description="Visual stories from the warehouse. The Green Line. The White Line. Raw shots from Berlin basements, London warehouses, Tokyo late nights."
          path="/store/lookbook"
        />
        <Header />

        <main className="pt-24 lg:pt-16">
          {/* Hero */}
          <section className="border-b border-border">
            <div className="container mx-auto px-4 md:px-8 py-16 md:py-24">
              <Link
                to="/store"
                className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to Store
              </Link>

              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Camera className="w-5 h-5 text-logo-green" />
                  <span className="font-mono text-[10px] text-logo-green uppercase tracking-widest">
                    // Black Line Collection
                  </span>
                </div>
                <h1 className="font-mono text-3xl md:text-5xl uppercase tracking-tight">
                  The Green Line.
                  <br />
                  <span className="text-logo-green">The White Line.</span>
                </h1>
                <p className="font-mono text-sm text-muted-foreground mt-6 max-w-lg leading-relaxed">
                  Raw shots from Berlin basements, London warehouses, Tokyo late nights. 
                  Our pieces in their natural habitat. Zero tolerance. Stroke only.
                </p>

                {/* Collection Toggle */}
                <div className="flex items-center gap-3 mt-8">
                  <button
                    onClick={() => setActiveCollection("products")}
                    className={`font-mono text-[10px] uppercase tracking-widest px-4 py-2 border transition-all ${
                      activeCollection === "products"
                        ? "bg-logo-green text-background border-logo-green"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                    }`}
                  >
                    Products {hasProducts && `(${allImages.length})`}
                  </button>
                  <button
                    onClick={() => setActiveCollection("mascots")}
                    className={`font-mono text-[10px] uppercase tracking-widest px-4 py-2 border transition-all ${
                      activeCollection === "mascots"
                        ? "bg-logo-green text-background border-logo-green"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                    }`}
                  >
                    Mascots (8)
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Filters - Only show for products */}
          {activeCollection === "products" && hasProducts && (
            <section className="border-b border-border sticky top-16 z-40 bg-background/95 backdrop-blur-sm">
              <div className="container mx-auto px-4 md:px-8 py-4">
                <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
                  <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <button
                    onClick={() => setActiveFilter("All")}
                    className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border transition-all flex-shrink-0 ${
                      activeFilter === "All"
                        ? "bg-logo-green text-background border-logo-green"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                    }`}
                  >
                    All ({allImages.length})
                  </button>
                  {productTypes.map((type) => {
                    const count = allImages.filter((img) => img.type === type).length;
                    return (
                      <button
                        key={type}
                        onClick={() => setActiveFilter(type)}
                        className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border transition-all flex-shrink-0 ${
                          activeFilter === type
                            ? "bg-logo-green text-background border-logo-green"
                            : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                        }`}
                      >
                        {type} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Content Grid */}
          <section className="border-b border-border">
            <div className="container mx-auto px-4 md:px-8 py-12">
              {activeCollection === "products" ? (
                // Products View
                isLoading ? (
                  <div className="flex items-center justify-center py-32">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredImages.length === 0 ? (
                  // Show mascots showcase when no products
                  <div className="space-y-12">
                    <div className="text-center max-w-xl mx-auto">
                      <h2 className="font-mono text-lg uppercase tracking-widest mb-4">
                        Black Line Collection
                      </h2>
                      <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                        The official Techno Doggies merchandise line. Black fabric only. 
                        Stroke graphics only. Logo Green (#66ff66) or White (#ffffff).
                        Zero tolerance for deviation.
                      </p>
                      <Link to="/store">
                        <Button className="mt-6 font-mono text-xs uppercase tracking-widest">
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          Browse Store
                        </Button>
                      </Link>
                    </div>
                    
                    {/* Mascot Grid as Placeholder */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {CORE_VARIANTS.map((variant, index) => (
                        <div 
                          key={variant.id}
                          className="group border border-border bg-card p-6 hover:border-logo-green/50 transition-all duration-300"
                        >
                          <div className="aspect-square bg-background border border-border flex items-center justify-center mb-4 group-hover:border-logo-green/30 transition-colors">
                            <variant.Component className="w-24 h-24 text-logo-green" />
                          </div>
                          <div className="space-y-1">
                            <span className="font-mono text-[9px] text-logo-green uppercase tracking-widest block">
                              Frame {String(index + 1).padStart(2, '0')}
                            </span>
                            <h3 className="font-mono text-xs uppercase tracking-wider">
                              {variant.name}
                            </h3>
                            <p className="font-mono text-[9px] text-muted-foreground">
                              {variant.product}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
                    {filteredImages.map((image, index) => (
                      <Link
                        key={`${image.handle}-${index}`}
                        to={`/store/product/${image.handle}`}
                        className="block mb-4 break-inside-avoid group"
                      >
                        <FilmFrame
                          src={image.src}
                          alt={image.alt}
                          frameNumber={String(index + 1).padStart(2, "0")}
                          className="w-full"
                        />
                        <div className="mt-2 px-1">
                          <span className="font-mono text-[9px] text-logo-green uppercase tracking-widest block">
                            {image.type}
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                            {image.product}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )
              ) : (
                // Mascots View - Brand Book Showcase
                <div className="space-y-16">
                  {/* Intro */}
                  <div className="text-center max-w-2xl mx-auto">
                    <h2 className="font-mono text-xl uppercase tracking-widest mb-4">
                      The Pack
                    </h2>
                    <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                      8 core variants. 94 in the full pack. Each with its own personality, 
                      each approved for merchandise. Stroke-only aesthetics. Zero tolerance policy.
                    </p>
                  </div>

                  {/* Mascot Editorial Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {CORE_VARIANTS.map((variant, index) => (
                      <div 
                        key={variant.id}
                        className="group border border-border bg-card overflow-hidden hover:border-logo-green/50 transition-all duration-500"
                      >
                        <div className="flex">
                          {/* Mascot Display */}
                          <div className="w-1/2 aspect-square bg-background border-r border-border flex items-center justify-center p-8 group-hover:bg-logo-green/5 transition-colors">
                            <variant.Component className="w-full h-full max-w-32 max-h-32 text-logo-green group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          
                          {/* Info Panel */}
                          <div className="w-1/2 p-6 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <span className="font-mono text-[9px] text-logo-green uppercase tracking-widest">
                                  #{String(index + 1).padStart(2, '0')}
                                </span>
                                <span className="w-2 h-px bg-logo-green/50" />
                                <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">
                                  Core Variant
                                </span>
                              </div>
                              <h3 className="font-mono text-lg uppercase tracking-wider mb-2">
                                {variant.name}
                              </h3>
                              <p className="font-mono text-[10px] text-muted-foreground italic">
                                "{variant.quote}"
                              </p>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-border">
                              <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest block mb-1">
                                Personality
                              </span>
                              <span className="font-mono text-xs text-foreground">
                                {variant.personality}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Brand Guidelines Footer */}
                  <div className="border border-logo-green/30 bg-logo-green/5 p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div>
                        <h4 className="font-mono text-xs uppercase tracking-widest text-logo-green mb-3">
                          Zero Tolerance
                        </h4>
                        <ul className="space-y-1">
                          <li className="font-mono text-[10px] text-muted-foreground">• Black fabric only</li>
                          <li className="font-mono text-[10px] text-muted-foreground">• Stroke graphics only</li>
                          <li className="font-mono text-[10px] text-muted-foreground">• No AI modifications</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-mono text-xs uppercase tracking-widest text-logo-green mb-3">
                          Approved Colors
                        </h4>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-logo-green border border-logo-green" />
                            <span className="font-mono text-[10px] text-muted-foreground">#66ff66</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-white border border-border" />
                            <span className="font-mono text-[10px] text-muted-foreground">#ffffff</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-mono text-xs uppercase tracking-widest text-logo-green mb-3">
                          Product Lines
                        </h4>
                        <ul className="space-y-1">
                          <li className="font-mono text-[10px] text-muted-foreground">• Green Line Collection</li>
                          <li className="font-mono text-[10px] text-muted-foreground">• White Line Collection</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Lookbook;
