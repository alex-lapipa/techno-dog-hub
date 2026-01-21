import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Package, Clock, CheckCircle, Store } from "lucide-react";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { ProductCard } from "@/components/store/ProductCard";
import { CartDrawer, CartButton } from "@/components/store/CartDrawer";
import { fetchProducts } from "@/lib/shopify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminStore = () => {
  const [notifyEmail, setNotifyEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailToSubmit = notifyEmail.toLowerCase().trim();
    if (!emailToSubmit || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToSubmit)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("launch_notifications")
        .insert({ email: emailToSubmit });

      if (error) {
        if (error.code === "23505") {
          toast.info("You're already on the list!");
          setIsSubscribed(true);
        } else {
          throw error;
        }
      } else {
        supabase.functions.invoke("launch-notification-email", {
          body: { email: emailToSubmit },
        }).then(({ error: emailError }) => {
          if (emailError) {
            console.error("Failed to send confirmation email:", emailError);
          }
        });

        toast.success("You're on the list!");
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch products from Shopify
  const { data: products, isLoading: productsLoading, refetch } = useQuery({
    queryKey: ["shopify-products"],
    queryFn: () => fetchProducts(50),
    staleTime: 1000 * 60 * 5,
  });

  // Get unique product types for filtering
  const productTypes = products
    ? [...new Set(products.map((p) => p.node.productType).filter(Boolean))]
    : [];

  // Filter products by category
  const filteredProducts = activeCategory
    ? products?.filter((p) => p.node.productType === activeCategory)
    : products;

  return (
    <AdminPageLayout
      title="Store"
      description="Manage storefront and products"
      icon={Store}
      iconColor="text-logo-green"
      onRefresh={() => refetch()}
      isLoading={productsLoading}
    >
      <CartDrawer />

      <div className="space-y-6">
        {/* Pre-order Banner */}
        <div className="bg-logo-green/5 border border-logo-green/20 rounded-lg p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <Clock className="w-3.5 h-3.5 text-logo-green shrink-0" />
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                <span className="text-logo-green">Pre-order</span>
                <span className="mx-2">·</span>
                Ships early 2026
              </p>
            </div>
            
            {isSubscribed ? (
              <div className="flex items-center gap-2 text-logo-green">
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="font-mono text-[10px] uppercase tracking-wider">You're in</span>
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="flex gap-2 w-full md:w-auto">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  className="font-mono text-[10px] h-7 bg-transparent border-border/50 focus:border-logo-green/50 w-full md:w-44"
                  disabled={isSubmitting}
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  className="font-mono text-[9px] uppercase tracking-widest h-7 border-logo-green/30 text-logo-green hover:bg-logo-green/10 shrink-0"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Notify"}
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              Status
            </span>
            <span className="font-mono text-sm text-logo-green uppercase">
              Pre-order
            </span>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">
              Cart
            </span>
            <CartButton />
          </div>
        </div>

        {/* Category Filter */}
        {productTypes.length > 0 && (
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide py-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`font-mono text-[10px] uppercase tracking-widest whitespace-nowrap transition-colors pb-1 ${
                !activeCategory
                  ? "text-logo-green border-b border-logo-green"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({products?.length || 0})
            </button>
            {productTypes.map((type) => {
              const count = products?.filter(p => p.node.productType === type).length || 0;
              return (
                <button
                  key={type}
                  onClick={() => setActiveCategory(type)}
                  className={`font-mono text-[10px] uppercase tracking-widest whitespace-nowrap transition-colors pb-1 ${
                    activeCategory === type
                      ? "text-logo-green border-b border-logo-green"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {type} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Products Grid */}
        {productsLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : !filteredProducts || filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-lg">
            <Package className="w-10 h-10 text-muted-foreground mx-auto mb-6 opacity-20" />
            <h2 className="font-mono text-sm uppercase tracking-widest mb-3">
              No products yet
            </h2>
            <p className="font-mono text-[10px] text-muted-foreground max-w-xs mx-auto">
              The first collection is in production.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.node.id} product={product.node} index={index} />
            ))}
          </div>
        )}

        {/* Quick Links */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
          <Link 
            to="/store" 
            target="_blank"
            className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest hover:text-logo-green transition-colors"
          >
            View Public Store →
          </Link>
          <Link 
            to="/admin/lookbook" 
            className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest hover:text-logo-green transition-colors"
          >
            Lookbook →
          </Link>
        </div>
      </div>
    </AdminPageLayout>
  );
};

export default AdminStore;
