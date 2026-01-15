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
        description="Premium underground streetwear. Pure black. Thin green line. Objects for people who live inside sound."
        path="/store"
      />
      <Header />
      <CartDrawer />

      <main className="pt-24 lg:pt-16">
        {/* Coming Soon Notice */}
        <section className="bg-logo-green/5 border-b border-logo-green/20">
          <div className="container mx-auto px-4 md:px-8 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
                  <span className="font-mono text-[10px] uppercase tracking-wider">You're on the list</span>
                </div>
              ) : (
                <form onSubmit={handleNotifySubmit} className="flex gap-2 w-full md:w-auto">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    className="font-mono text-[10px] h-7 bg-transparent border-border/50 focus:border-logo-green/50 w-full md:w-48"
                    disabled={isSubmitting}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    className="font-mono text-[9px] uppercase tracking-widest h-7 border-logo-green/30 text-logo-green hover:bg-logo-green/10 shrink-0"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      "Notify"
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Hero */}
        <section className="border-b border-border/50">
          <div className="container mx-auto px-4 md:px-8 py-20 md:py-32">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-px bg-logo-green" />
                <span className="font-mono text-[9px] text-logo-green uppercase tracking-[0.3em]">
                  Black Line Collection
                </span>
              </div>
              
              <h1 className="font-mono text-2xl md:text-4xl lg:text-5xl uppercase tracking-tight leading-tight">
                Pure black.
                <br />
                <span className="text-muted-foreground">Thin green line.</span>
              </h1>
              
              <p className="font-mono text-xs text-muted-foreground mt-8 max-w-md leading-relaxed">
                Premium underground streetwear. Minimal graphics. Maximum quality. 
                Collector-grade pieces for those who live inside sound.
              </p>

              <div className="mt-10 flex items-center gap-6">
                <CartButton />
                <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                  View cart
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        {productTypes.length > 0 && (
          <section className="border-b border-border/30">
            <div className="container mx-auto px-4 md:px-8 py-4">
              <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`font-mono text-[10px] uppercase tracking-widest whitespace-nowrap transition-colors ${
                    !activeCategory
                      ? "text-logo-green"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All
                </button>
                {productTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setActiveCategory(type)}
                    className={`font-mono text-[10px] uppercase tracking-widest whitespace-nowrap transition-colors ${
                      activeCategory === type
                        ? "text-logo-green"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {type}
                  </button>
                ))}
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

        {/* Collection Info */}
        <section className="border-b border-border/30">
          <div className="container mx-auto px-4 md:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-logo-green mb-3">
                  Materials
                </h3>
                <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
                  400gsm organic cotton fleece. 220gsm premium cotton tees. 
                  Built to last.
                </p>
              </div>
              <div>
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-logo-green mb-3">
                  Production
                </h3>
                <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
                  Print-on-demand. Zero inventory waste. 
                  Made when you order.
                </p>
              </div>
              <div>
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-logo-green mb-3">
                  Shipping
                </h3>
                <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
                  Worldwide delivery. 2-3 weeks production. 
                  Tracked shipping.
                </p>
              </div>
              <div>
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-logo-green mb-3">
                  Returns
                </h3>
                <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
                  30-day returns on unworn items. 
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
              <span className="text-border">·</span>
              <Link 
                to="/store/info" 
                className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest hover:text-logo-green transition-colors"
              >
                Size Guide
              </Link>
              <span className="text-border">·</span>
              <Link 
                to="/store/info" 
                className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest hover:text-logo-green transition-colors"
              >
                Contact
              </Link>
            </div>
            <p className="font-mono text-[9px] text-muted-foreground/50 text-center mt-8">
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
