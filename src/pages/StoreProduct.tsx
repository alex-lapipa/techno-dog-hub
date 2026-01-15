import { useState, useCallback, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowLeft, Check, Package, Truck, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { CartDrawer, CartButton } from "@/components/store/CartDrawer";
import { GlitchImage, GlitchSVGFilter } from "@/components/store/GlitchImage";
import { fetchProductByHandle, formatPrice, ShopifyVariant } from "@/lib/shopify";
import { useCartStore, CartItem } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";

// Doggy character mapping for product descriptions
const doggyCharacters: Record<string, { personality: string; quote: string; traits: string[] }> = {
  'dj-dog': {
    personality: 'The selector, dropping beats',
    quote: 'The kick is the heartbeat. Everything else is just atmosphere.',
    traits: ['confident', 'skilled', 'authoritative']
  },
  'ninja-dog': {
    personality: 'Silent warrior of the night',
    quote: 'Move in silence. Let the bass speak.',
    traits: ['mysterious', 'stealthy', 'legendary']
  },
  'space-dog': {
    personality: 'Cosmic explorer of sound',
    quote: 'Beyond the stars, there\'s only rhythm.',
    traits: ['dreamy', 'transcendent', 'otherworldly']
  },
  'grumpy-dog': {
    personality: 'The cynical veteran',
    quote: 'Back in my day, we had REAL 303s.',
    traits: ['sarcastic', 'experienced', 'secretly passionate']
  },
  'happy-dog': {
    personality: 'Pure positive energy',
    quote: 'Every beat is a blessing!',
    traits: ['enthusiastic', 'uplifting', 'contagious']
  },
  'techno-dog': {
    personality: 'Glitched out & digital',
    quote: '01001011 01001001 01000011 01001011',
    traits: ['technical', 'glitchy', 'futuristic']
  },
  'dancing-dog': {
    personality: 'Always moving',
    quote: 'Can\'t stop, won\'t stop. The floor is life.',
    traits: ['energetic', 'rhythmic', 'unstoppable']
  },
  'acid-dog': {
    personality: 'Deep repetitive vibes',
    quote: 'The 303 knows all. Surrender to the squelch.',
    traits: ['trippy', 'deep', 'mesmerizing']
  }
};

// Extract doggy key from product title
const extractDoggyKey = (title: string): string | null => {
  const lowercased = title.toLowerCase();
  const matches = Object.keys(doggyCharacters).find(key => 
    lowercased.includes(key.replace('-', ' ')) || lowercased.includes(key)
  );
  return matches || null;
};

const StoreProduct = () => {
  const { handle } = useParams<{ handle: string }>();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  
  const addItem = useCartStore(state => state.addItem);
  const setCartOpen = useCartStore(state => state.setOpen);

  // Sync carousel with thumbnail selection
  const onSelect = useCallback(() => {
    if (!carouselApi) return;
    setSelectedImageIndex(carouselApi.selectedScrollSnap());
  }, [carouselApi]);

  // Set up carousel event listener
  useEffect(() => {
    if (!carouselApi) return;
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi, onSelect]);

  // Fetch product
  const { data: product, isLoading } = useQuery({
    queryKey: ["shopify-product", handle],
    queryFn: () => fetchProductByHandle(handle!),
    enabled: !!handle,
  });

  // Initialize options when product loads
  useEffect(() => {
    if (product?.options) {
      const initial: Record<string, string> = {};
      product.options.forEach(opt => {
        if (opt.values.length > 0) {
          initial[opt.name] = opt.values[0];
        }
      });
      setSelectedOptions(initial);
    }
  }, [product]);

  // Scroll to selected thumbnail
  const scrollToImage = (index: number) => {
    setSelectedImageIndex(index);
    carouselApi?.scrollTo(index);
  };

  // Find matching variant based on selected options
  const findMatchingVariant = (): ShopifyVariant | undefined => {
    if (!product) return undefined;
    
    return product.variants.edges.find(({ node }) => {
      return node.selectedOptions.every(
        opt => selectedOptions[opt.name] === opt.value
      );
    })?.node;
  };

  const selectedVariant = findMatchingVariant() || product?.variants.edges[0]?.node;

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [optionName]: value }));
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;

    const cartItem: CartItem = {
      product,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions,
    };

    addItem(cartItem);
    toast.success("Added to cart", {
      description: product.title,
      position: "top-center",
    });
    setCartOpen(true);
  };

  // Get doggy character info
  const doggyKey = product ? extractDoggyKey(product.title) : null;
  const doggyInfo = doggyKey ? doggyCharacters[doggyKey] : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-logo-green mx-auto" />
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground animate-pulse">
            Loading product...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="pt-24 lg:pt-16">
          <div className="container mx-auto px-4 md:px-8 py-24 text-center">
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-16 h-16 border-2 border-logo-green/30 rounded-lg mx-auto flex items-center justify-center">
                <Package className="w-8 h-8 text-logo-green/50" />
              </div>
              <h1 className="font-mono text-2xl uppercase tracking-wider">
                Product not found
              </h1>
              <p className="font-mono text-sm text-muted-foreground">
                This product might have been removed or doesn't exist.
              </p>
              <Link to="/store">
                <Button variant="outline" className="font-mono text-xs uppercase border-logo-green/30 hover:border-logo-green hover:bg-logo-green/10">
                  <ArrowLeft className="w-3 h-3 mr-2" />
                  Back to Store
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const images = product.images.edges;
  const hasVariantOptions = product.options.some(opt => opt.values.length > 1 || opt.name !== 'Title');
  const isBlackLine = product.title.toLowerCase().includes('black line');
  const isWhiteLine = product.title.toLowerCase().includes('white line');

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* SVG Filter for glitch effect */}
      <GlitchSVGFilter />
      
      <PageSEO
        title={`${product.title} | techno.dog Store`}
        description={product.description || `${product.title} - Official Techno Doggy merchandise. ${doggyInfo?.personality || 'Underground techno apparel.'}`}
        path={`/store/product/${handle}`}
      />
      <Header />
      <CartDrawer />

      <main className="pt-24 lg:pt-16">
        {/* Breadcrumb with scanline effect */}
        <section className="border-b border-border relative">
          <div className="absolute inset-0 scanlines opacity-30 pointer-events-none" />
          <div className="container mx-auto px-4 md:px-8 py-4 relative z-10">
            <div className="flex items-center justify-between">
              <Link 
                to="/store" 
                className="font-mono text-xs text-muted-foreground hover:text-logo-green transition-colors inline-flex items-center gap-2 group"
              >
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                Back to Store
              </Link>
              <CartButton />
            </div>
          </div>
        </section>

        {/* Product Section */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Images Carousel */}
              <div className="space-y-4">
                {/* Main carousel with VHS border */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-logo-green/20 via-transparent to-logo-green/20 blur-sm opacity-50" />
                  <Carousel
                    setApi={setCarouselApi}
                    className="w-full relative"
                    opts={{
                      loop: images.length > 1,
                    }}
                  >
                    <CarouselContent>
                      {images.map((img, index) => (
                        <CarouselItem key={index}>
                          <div className="aspect-square overflow-hidden border border-border bg-card">
                            <GlitchImage
                              src={img.node.url}
                              alt={img.node.altText || `${product.title} ${index + 1}`}
                              className="w-full h-full"
                              frameNumber={String(index + 1).padStart(2, '0')}
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {images.length > 1 && (
                      <>
                        <CarouselPrevious className="left-2 bg-background/90 border-logo-green/30 hover:bg-background hover:border-logo-green" />
                        <CarouselNext className="right-2 bg-background/90 border-logo-green/30 hover:bg-background hover:border-logo-green" />
                      </>
                    )}
                  </Carousel>
                  
                  {/* Frame counter */}
                  <div className="absolute bottom-3 left-3 font-mono text-[10px] text-logo-green/80 bg-background/80 px-2 py-1 border border-logo-green/20">
                    {String(selectedImageIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
                  </div>
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => scrollToImage(index)}
                        className={`flex-shrink-0 transition-all border ${
                          selectedImageIndex === index 
                            ? 'opacity-100 border-logo-green shadow-[0_0_10px_rgba(102,255,102,0.3)]' 
                            : 'opacity-60 hover:opacity-80 border-border hover:border-logo-green/50'
                        }`}
                      >
                        <GlitchImage
                          src={img.node.url}
                          alt={img.node.altText || `${product.title} ${index + 1}`}
                          className="w-20 h-20"
                          frameNumber={String(index + 1).padStart(2, '0')}
                          size="thumbnail"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                {/* Line badge */}
                <div className="flex items-center gap-3">
                  {product.productType && (
                    <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest border border-border px-2 py-1">
                      {product.productType}
                    </span>
                  )}
                  {(isBlackLine || isWhiteLine) && (
                    <span className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 border ${
                      isBlackLine 
                        ? 'text-logo-green border-logo-green/30 bg-logo-green/5' 
                        : 'text-foreground border-foreground/30 bg-foreground/5'
                    }`}>
                      {isBlackLine ? 'Green Line' : 'White Line'}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="font-mono text-2xl md:text-3xl uppercase tracking-tight leading-tight">
                  {product.title}
                </h1>

                {/* Doggy Character Quote */}
                {doggyInfo && (
                  <div className="p-4 border-l-2 border-logo-green/50 bg-logo-green/5">
                    <p className="font-mono text-sm italic text-logo-green/90 mb-2">
                      "{doggyInfo.quote}"
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                      — {doggyInfo.personality}
                    </p>
                  </div>
                )}

                {/* Price */}
                <p className="font-mono text-2xl text-logo-green">
                  {selectedVariant && formatPrice(selectedVariant.price.amount, selectedVariant.price.currencyCode)}
                </p>

                {/* Options */}
                {hasVariantOptions && (
                  <div className="space-y-4 py-4 border-t border-border">
                    {product.options.map(option => {
                      if (option.name === 'Title' && option.values.length === 1) return null;
                      return (
                        <div key={option.name}>
                          <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground block mb-3">
                            {option.name}
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {option.values.map(value => {
                              const isSelected = selectedOptions[option.name] === value;
                              return (
                                <button
                                  key={value}
                                  onClick={() => handleOptionChange(option.name, value)}
                                  className={`px-4 py-2 border font-mono text-xs uppercase tracking-wider transition-all ${
                                    isSelected 
                                      ? 'border-logo-green bg-logo-green/10 text-logo-green shadow-[0_0_10px_rgba(102,255,102,0.2)]' 
                                      : 'border-border hover:border-logo-green/50 hover:bg-logo-green/5'
                                  }`}
                                >
                                  {value}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add to cart */}
                <div className="pt-4 space-y-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!selectedVariant?.availableForSale}
                    className="w-full font-mono text-xs uppercase tracking-widest py-6 bg-logo-green text-background hover:bg-logo-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_20px_rgba(102,255,102,0.3)]"
                    size="lg"
                  >
                    {selectedVariant?.availableForSale ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                  
                  {!selectedVariant?.availableForSale && (
                    <p className="font-mono text-[10px] text-destructive text-center uppercase tracking-wider">
                      Currently unavailable - check back soon
                    </p>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <div className="pt-6 border-t border-border">
                    <p className="font-mono text-sm text-muted-foreground leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Character traits */}
                {doggyInfo && (
                  <div className="flex flex-wrap gap-2">
                    {doggyInfo.traits.map(trait => (
                      <span 
                        key={trait}
                        className="font-mono text-[10px] uppercase tracking-widest px-2 py-1 border border-logo-green/20 text-logo-green/70"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                )}

                {/* Production info cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                  <div className="p-4 border border-border bg-card hover:border-logo-green/30 transition-colors group">
                    <div className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-logo-green mt-0.5 shrink-0" />
                      <div>
                        <p className="font-mono text-xs uppercase tracking-wider mb-1 group-hover:text-logo-green transition-colors">
                          Print-on-demand
                        </p>
                        <p className="font-mono text-[10px] text-muted-foreground">
                          Made to order. Zero waste.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-border bg-card hover:border-logo-green/30 transition-colors group">
                    <div className="flex items-start gap-3">
                      <Truck className="w-4 h-4 text-logo-green mt-0.5 shrink-0" />
                      <div>
                        <p className="font-mono text-xs uppercase tracking-wider mb-1 group-hover:text-logo-green transition-colors">
                          Worldwide shipping
                        </p>
                        <p className="font-mono text-[10px] text-muted-foreground">
                          Ships from EU & USA.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Design system note */}
                <div className="p-4 border border-logo-green/20 bg-logo-green/5 relative overflow-hidden">
                  <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-3 h-3 text-logo-green" />
                      <p className="font-mono text-[10px] uppercase tracking-widest text-logo-green">
                        Techno Doggies Collection
                      </p>
                    </div>
                    <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
                      Official mascot merchandise featuring stroke-based SVG designs. 
                      Each Doggy represents a unique personality from the underground techno scene.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default StoreProduct;
