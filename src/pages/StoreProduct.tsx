import { useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowLeft, Check } from "lucide-react";
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
  useState(() => {
    if (!carouselApi) return;
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  });

  // Scroll to selected thumbnail
  const scrollToImage = (index: number) => {
    setSelectedImageIndex(index);
    carouselApi?.scrollTo(index);
  };

  // Fetch product
  const { data: product, isLoading } = useQuery({
    queryKey: ["shopify-product", handle],
    queryFn: () => fetchProductByHandle(handle!),
    enabled: !!handle,
  });

  // Initialize options when product loads
  useState(() => {
    if (product?.options) {
      const initial: Record<string, string> = {};
      product.options.forEach(opt => {
        if (opt.values.length > 0) {
          initial[opt.name] = opt.values[0];
        }
      });
      setSelectedOptions(initial);
    }
  });

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="pt-24 lg:pt-16">
          <div className="container mx-auto px-4 md:px-8 py-24 text-center">
            <h1 className="font-mono text-2xl uppercase tracking-wider mb-4">
              Product not found
            </h1>
            <Link to="/store">
              <Button variant="outline" className="font-mono text-xs uppercase">
                <ArrowLeft className="w-3 h-3 mr-2" />
                Back to Store
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const images = product.images.edges;
  const hasVariantOptions = product.options.some(opt => opt.values.length > 1 || opt.name !== 'Title');

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* SVG Filter for glitch effect */}
      <GlitchSVGFilter />
      
      <PageSEO
        title={`${product.title} | techno.dog Store`}
        description={product.description || `${product.title} - Official techno.dog merchandise`}
        path={`/store/product/${handle}`}
      />
      <Header />
      <CartDrawer />

      <main className="pt-24 lg:pt-16">
        {/* Breadcrumb */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link 
                to="/store" 
                className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to Store
              </Link>
              <CartButton />
            </div>
          </div>
        </section>

        {/* Product */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Images Carousel */}
              <div className="space-y-4">
                {/* Main carousel */}
                <Carousel
                  setApi={setCarouselApi}
                  className="w-full"
                  opts={{
                    loop: images.length > 1,
                  }}
                >
                  <CarouselContent>
                    {images.map((img, index) => (
                      <CarouselItem key={index}>
                        <div className="aspect-square overflow-hidden">
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
                      <CarouselPrevious className="left-2 bg-background/80 border-border hover:bg-background" />
                      <CarouselNext className="right-2 bg-background/80 border-border hover:bg-background" />
                    </>
                  )}
                </Carousel>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => scrollToImage(index)}
                        className={`flex-shrink-0 transition-all ${
                          selectedImageIndex === index 
                            ? 'opacity-100 ring-2 ring-foreground ring-offset-2 ring-offset-background' 
                            : 'opacity-60 hover:opacity-80'
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

              {/* Details */}
              <div className="space-y-6">
                {product.productType && (
                  <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                    {product.productType}
                  </span>
                )}

                <h1 className="font-mono text-2xl md:text-3xl uppercase tracking-tight">
                  {product.title}
                </h1>

                <p className="font-mono text-xl">
                  {selectedVariant && formatPrice(selectedVariant.price.amount, selectedVariant.price.currencyCode)}
                </p>

                {/* Options */}
                {hasVariantOptions && (
                  <div className="space-y-4 py-4 border-t border-border">
                    {product.options.map(option => {
                      if (option.name === 'Title' && option.values.length === 1) return null;
                      return (
                        <div key={option.name}>
                          <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground block mb-2">
                            {option.name}
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {option.values.map(value => {
                              const isSelected = selectedOptions[option.name] === value;
                              return (
                                <button
                                  key={value}
                                  onClick={() => handleOptionChange(option.name, value)}
                                  className={`px-4 py-2 border font-mono text-xs uppercase tracking-wider transition-colors ${
                                    isSelected 
                                      ? 'border-foreground bg-foreground text-background' 
                                      : 'border-border hover:border-foreground/50'
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
                <div className="pt-4">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!selectedVariant?.availableForSale}
                    className="w-full font-mono text-xs uppercase tracking-widest py-6"
                    size="lg"
                  >
                    {selectedVariant?.availableForSale ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                </div>

                {/* Description */}
                {product.description && (
                  <div className="pt-6 border-t border-border">
                    <p className="font-mono text-sm text-muted-foreground leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Production note */}
                <div className="p-4 border border-border bg-card">
                  <div className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-logo-green mt-0.5 shrink-0" />
                    <div>
                      <p className="font-mono text-xs uppercase tracking-wider mb-1">
                        Print-on-demand
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        Made to order. Produced only when you buy. Zero waste.
                      </p>
                    </div>
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
