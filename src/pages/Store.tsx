import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Package, Clock, Mail, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { ProductCard } from "@/components/store/ProductCard";
import { CartDrawer, CartButton } from "@/components/store/CartDrawer";
import { GlitchSVGFilter } from "@/components/store/GlitchImage";
import { fetchProducts, fetchCollections, ShopifyProductEdge, ShopifyCollection } from "@/lib/shopify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Store = () => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

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
        // Send confirmation email
        supabase.functions.invoke("launch-notification-email", {
          body: { email: emailToSubmit },
        }).then(({ error: emailError }) => {
          if (emailError) {
            console.error("Failed to send confirmation email:", emailError);
          }
        });

        toast.success("You're on the list! Check your inbox for confirmation.");
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["shopify-products"],
    queryFn: () => fetchProducts(50),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch collections
  const { data: collections } = useQuery({
    queryKey: ["shopify-collections"],
    queryFn: () => fetchCollections(20),
    staleTime: 1000 * 60 * 5,
  });

  // Get unique product types for filtering
  const productTypes = products
    ? [...new Set(products.map(p => p.node.productType).filter(Boolean))]
    : [];

  // Filter products by type
  const filteredProducts = selectedType
    ? products?.filter(p => p.node.productType === selectedType)
    : products;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* SVG Filter for glitch effect - render once */}
      <GlitchSVGFilter />
      
      <PageSEO
        title="Store | techno.dog"
        description="Objects for people who live inside sound. Official techno.dog merchandise."
        path="/store"
      />
      <Header />
      <CartDrawer />

      <main className="pt-24 lg:pt-16">
        {/* Coming Soon Notice with Email Signup */}
        <section className="bg-logo-green/10 border-b border-logo-green/30">
          <div className="container mx-auto px-4 md:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-logo-green shrink-0" />
                <p className="font-mono text-xs text-foreground">
                  <span className="text-logo-green font-semibold uppercase">Coming Soon</span>
                  <span className="text-muted-foreground mx-2">—</span>
                  <span className="text-muted-foreground">
                    Orders will ship in early 2026.
                  </span>
                </p>
              </div>
              
              {isSubscribed ? (
                <div className="flex items-center gap-2 text-logo-green">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-mono text-xs">You're on the list!</span>
                </div>
              ) : (
                <form onSubmit={handleNotifySubmit} className="flex gap-2 w-full md:w-auto">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    className="font-mono text-xs h-8 bg-background/50 border-logo-green/30 focus:border-logo-green w-full md:w-56"
                    disabled={isSubmitting}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="font-mono text-[10px] uppercase tracking-wider h-8 bg-logo-green text-background hover:bg-logo-green/80 shrink-0"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <>
                        <Mail className="w-3 h-3 mr-1" />
                        Notify Me
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Hero */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-16 md:py-24">
            <div className="max-w-2xl">
              <span className="font-mono text-[10px] text-logo-green uppercase tracking-widest">
                // Store
              </span>
              <h1 className="font-mono text-3xl md:text-5xl uppercase tracking-tight mt-4">
                Objects for people who live inside sound.
              </h1>
              <p className="font-mono text-sm text-muted-foreground mt-6 max-w-lg leading-relaxed">
                Quality over quantity. Limited editions. Print-on-demand production for zero waste.
              </p>
            </div>

            {/* Cart button for mobile */}
            <div className="mt-8 flex items-center gap-4">
              <CartButton />
              <span className="font-mono text-xs text-muted-foreground">View cart</span>
            </div>
          </div>
        </section>

        {/* Filters */}
        {productTypes.length > 0 && (
          <section className="border-b border-border">
            <div className="container mx-auto px-4 md:px-8 py-4">
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider shrink-0">
                  Filter:
                </span>
                <Button
                  variant={selectedType === null ? "default" : "outline"}
                  size="sm"
                  className="font-mono text-[10px] uppercase tracking-wider shrink-0"
                  onClick={() => setSelectedType(null)}
                >
                  All
                </Button>
                {productTypes.map(type => (
                  <Button
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    size="sm"
                    className="font-mono text-[10px] uppercase tracking-wider shrink-0"
                    onClick={() => setSelectedType(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Products Grid */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-12">
            {productsLoading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : !filteredProducts || filteredProducts.length === 0 ? (
              <div className="text-center py-24">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                <h2 className="font-mono text-lg uppercase tracking-wider mb-2">
                  No products yet
                </h2>
                <p className="font-mono text-xs text-muted-foreground max-w-md mx-auto">
                  We're preparing the first collection. Check back soon for limited edition objects.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product.node.id} product={product.node} index={index} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Info Links */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link 
                to="/store/info" 
                className="p-6 border border-border hover:border-foreground/30 transition-colors group"
              >
                <h3 className="font-mono text-xs uppercase tracking-widest mb-2 group-hover:text-logo-green transition-colors">
                  Shipping & Returns
                </h3>
                <p className="font-mono text-[10px] text-muted-foreground">
                  Worldwide delivery. 30-day returns.
                </p>
              </Link>
              <Link 
                to="/store/info" 
                className="p-6 border border-border hover:border-foreground/30 transition-colors group"
              >
                <h3 className="font-mono text-xs uppercase tracking-widest mb-2 group-hover:text-logo-green transition-colors">
                  Production
                </h3>
                <p className="font-mono text-[10px] text-muted-foreground">
                  Print-on-demand. Zero inventory waste.
                </p>
              </Link>
              <Link 
                to="/store/info" 
                className="p-6 border border-border hover:border-foreground/30 transition-colors group"
              >
                <h3 className="font-mono text-xs uppercase tracking-widest mb-2 group-hover:text-logo-green transition-colors">
                  Legal
                </h3>
                <p className="font-mono text-[10px] text-muted-foreground">
                  Operated by Miramonte Somío SL
                </p>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Store;
