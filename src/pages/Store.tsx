import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Package, Clock, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { ProductCard } from "@/components/store/ProductCard";
import { CartDrawer, CartButton } from "@/components/store/CartDrawer";
import { fetchProducts } from "@/lib/shopify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Store = () => {
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
  const { data: products, isLoading: productsLoading } = useQuery({
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
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO
        title="Black Line Collection | Techno Doggy"
        description="Premium underground streetwear. Pure black. Thin green line. Collector-grade pieces for those who live inside sound."
        path="/store"
      />
      <Header />
      <CartDrawer />

      <main className="pt-24 lg:pt-16">
        {/* Pre-order Banner */}
        <section className="bg-logo-green/5 border-b border-logo-green/20">
          <div className="container mx-auto px-4 md:px-8 py-3">
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
        </section>

        {/* Hero - Editorial Style */}
        <section className="border-b border-border/30 overflow-hidden">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[70vh]">
              {/* Left: Story */}
              <div className="flex flex-col justify-center py-16 lg:py-24 lg:pr-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-px bg-logo-green" />
                  <span className="font-mono text-[9px] text-logo-green uppercase tracking-[0.4em]">
                    Issue 001
                  </span>
                </div>
                
                <h1 className="font-mono text-3xl md:text-4xl lg:text-5xl uppercase tracking-tight leading-[1.1] mb-8">
                  The Black
                  <br />
                  Line
                  <br />
                  <span className="text-logo-green">Collection</span>
                </h1>
                
                <div className="space-y-4 max-w-md">
                  <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                    Berlin 4am. Tokyo basement. London warehouse. 
                    The floor doesn't care what you're wearing—but you do.
                  </p>
                  <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                    Pure black. Thin green line. Insiders only.
                  </p>
                </div>

                <div className="mt-10 flex items-center gap-6">
                  <CartButton />
                  <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                    {products?.length || 0} pieces
                  </span>
                </div>
              </div>

              {/* Right: Featured Image Collage */}
              <div className="relative lg:border-l border-border/30 bg-muted/5">
                {products && products.length > 0 && (
                  <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                    {products.slice(0, 4).map((product, i) => (
                      <Link 
                        key={product.node.id}
                        to={`/product/${product.node.handle}`}
                        className="relative overflow-hidden group"
                      >
                        {product.node.images?.edges?.[0]?.node && (
                          <img
                            src={product.node.images.edges[0].node.url}
                            alt={product.node.title}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="font-mono text-[9px] text-logo-green uppercase tracking-widest">
                            {product.node.productType}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                {productsLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Manifesto Strip */}
        <section className="border-b border-border/30 bg-muted/5">
          <div className="container mx-auto px-4 md:px-8 py-8">
            <div className="flex items-center gap-8 overflow-x-auto scrollbar-hide">
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em] whitespace-nowrap">
                No logos
              </span>
              <span className="text-logo-green/30">·</span>
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em] whitespace-nowrap">
                No hype
              </span>
              <span className="text-logo-green/30">·</span>
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em] whitespace-nowrap">
                Just the line
              </span>
              <span className="text-logo-green/30">·</span>
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em] whitespace-nowrap">
                Collector grade
              </span>
              <span className="text-logo-green/30">·</span>
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em] whitespace-nowrap">
                Zero waste
              </span>
              <span className="text-logo-green/30">·</span>
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em] whitespace-nowrap">
                Made when ordered
              </span>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        {productTypes.length > 0 && (
          <section className="border-b border-border/30 sticky top-16 z-40 bg-background/95 backdrop-blur-sm">
            <div className="container mx-auto px-4 md:px-8 py-4">
              <div className="flex items-center gap-8 overflow-x-auto scrollbar-hide">
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
            </div>
          </section>
        )}

        {/* Products Grid */}
        <section className="border-b border-border/30">
          <div className="container mx-auto px-4 md:px-8 py-16">
            {productsLoading ? (
              <div className="flex items-center justify-center py-32">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : !filteredProducts || filteredProducts.length === 0 ? (
              <div className="text-center py-32">
                <Package className="w-10 h-10 text-muted-foreground mx-auto mb-6 opacity-20" />
                <h2 className="font-mono text-sm uppercase tracking-widest mb-3">
                  No products yet
                </h2>
                <p className="font-mono text-[10px] text-muted-foreground max-w-xs mx-auto">
                  The first collection is in production.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product.node.id} product={product.node} index={index} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Story Block */}
        <section className="border-b border-border/30">
          <div className="container mx-auto px-4 md:px-8 py-20">
            <div className="max-w-2xl mx-auto text-center">
              <span className="font-mono text-[9px] text-logo-green uppercase tracking-[0.3em] block mb-6">
                The Story
              </span>
              <p className="font-mono text-sm md:text-base text-foreground leading-relaxed mb-6">
                "We didn't want another loud streetwear brand. We wanted something for the people who actually go out—who know the difference between a warm-up set and peak time."
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                — Techno Doggy, somewhere dark, 2026
              </p>
            </div>
          </div>
        </section>

        {/* Specs Grid */}
        <section className="border-b border-border/30">
          <div className="container mx-auto px-4 md:px-8 py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              <div className="space-y-3">
                <span className="font-mono text-[9px] text-logo-green uppercase tracking-widest block">
                  01
                </span>
                <h3 className="font-mono text-xs uppercase tracking-widest">
                  Materials
                </h3>
                <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
                  400gsm organic cotton fleece. 220gsm premium tees. 
                  Built heavy. Built to last.
                </p>
              </div>
              <div className="space-y-3">
                <span className="font-mono text-[9px] text-logo-green uppercase tracking-widest block">
                  02
                </span>
                <h3 className="font-mono text-xs uppercase tracking-widest">
                  Production
                </h3>
                <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
                  Print-on-demand. Zero inventory waste. 
                  Your piece, made for you.
                </p>
              </div>
              <div className="space-y-3">
                <span className="font-mono text-[9px] text-logo-green uppercase tracking-widest block">
                  03
                </span>
                <h3 className="font-mono text-xs uppercase tracking-widest">
                  Shipping
                </h3>
                <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
                  Worldwide. 2-3 weeks production. 
                  Tracked all the way.
                </p>
              </div>
              <div className="space-y-3">
                <span className="font-mono text-[9px] text-logo-green uppercase tracking-widest block">
                  04
                </span>
                <h3 className="font-mono text-xs uppercase tracking-widest">
                  Returns
                </h3>
                <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
                  30 days on unworn items. 
                  Quality guaranteed.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Links */}
        <section>
          <div className="container mx-auto px-4 md:px-8 py-12">
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
              <Link 
                to="/store/info" 
                className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest hover:text-logo-green transition-colors"
              >
                Shipping & Returns
              </Link>
              <span className="text-border hidden md:inline">·</span>
              <Link 
                to="/store/info" 
                className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest hover:text-logo-green transition-colors"
              >
                Size Guide
              </Link>
              <span className="text-border hidden md:inline">·</span>
              <Link 
                to="/store/info" 
                className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest hover:text-logo-green transition-colors"
              >
                Contact
              </Link>
            </div>
            <p className="font-mono text-[9px] text-muted-foreground/40 text-center mt-8">
              Operated by Miramonte Somió SL
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Store;
