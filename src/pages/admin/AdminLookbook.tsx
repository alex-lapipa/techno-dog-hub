import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Camera, Filter, Loader2, ShoppingBag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import FilmFrame from "@/components/FilmFrame";
import { fetchProducts } from "@/lib/shopify";

const AdminLookbook = () => {
  const [activeFilter, setActiveFilter] = useState<string>("All");

  // Fetch products from Shopify
  const { data: products, isLoading, refetch } = useQuery({
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
    <AdminPageLayout
      title="Lookbook"
      description="Product gallery and visual assets"
      icon={ShoppingBag}
      iconColor="text-logo-green"
      onRefresh={() => refetch()}
      isLoading={isLoading}
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">
              Total Images
            </span>
            <span className="font-mono text-2xl text-foreground">
              {allImages.length}
            </span>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">
              Products
            </span>
            <span className="font-mono text-2xl text-foreground">
              {products?.length || 0}
            </span>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">
              Categories
            </span>
            <span className="font-mono text-2xl text-foreground">
              {productTypes.length}
            </span>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">
              Filtered
            </span>
            <span className="font-mono text-2xl text-foreground">
              {filteredImages.length}
            </span>
          </div>
        </div>

        {/* Filters */}
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

        {/* Image Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-lg">
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

        {/* Quick Links */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
          <Link 
            to="/lookbook" 
            target="_blank"
            className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest hover:text-logo-green transition-colors"
          >
            View Public Lookbook →
          </Link>
          <Link 
            to="/admin/store" 
            className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest hover:text-logo-green transition-colors"
          >
            Store →
          </Link>
        </div>
      </div>
    </AdminPageLayout>
  );
};

export default AdminLookbook;
