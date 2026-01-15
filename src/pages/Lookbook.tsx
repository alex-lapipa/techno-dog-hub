import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Camera, Filter, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import FilmFrame from "@/components/FilmFrame";
import FilmGrainOverlay from "@/components/FilmGrainOverlay";
import { fetchProducts } from "@/lib/shopify";

const Lookbook = () => {
  const [activeFilter, setActiveFilter] = useState<string>("All");

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
                    // Lookbook
                  </span>
                </div>
                <h1 className="font-mono text-3xl md:text-5xl uppercase tracking-tight">
                  The Green Line.
                  <br />
                  <span className="text-logo-green">The White Line.</span>
                </h1>
                <p className="font-mono text-sm text-muted-foreground mt-6 max-w-lg leading-relaxed">
                  Raw shots from Berlin basements, London warehouses, Tokyo late nights. 
                  Our pieces in their natural habitat.
                </p>
              </div>
            </div>
          </section>

          {/* Filters */}
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

          {/* Image Grid */}
          <section className="border-b border-border">
            <div className="container mx-auto px-4 md:px-8 py-12">
              {isLoading ? (
                <div className="flex items-center justify-center py-32">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : filteredImages.length === 0 ? (
                <div className="text-center py-32">
                  <Camera className="w-10 h-10 text-muted-foreground mx-auto mb-6 opacity-20" />
                  <h2 className="font-mono text-sm uppercase tracking-widest mb-3">
                    Coming soon
                  </h2>
                  <p className="font-mono text-[10px] text-muted-foreground max-w-xs mx-auto">
                    Product photography in production.
                  </p>
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
