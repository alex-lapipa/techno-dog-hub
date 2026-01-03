import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Package, Clock, Mail, CheckCircle, Sparkles, Zap } from "lucide-react";
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
import eulogioIcon from "@/assets/eulogio-e-icon.jpg";
import eulogioHeroImage from "@/assets/products/lifestyle-eulogio-crew-festival.jpg";
import eulogioHoodieClub from "@/assets/products/lifestyle-eulogio-hoodie-club.jpg";
import { DJDog, RavingDog, NinjaDog, SpaceDog, GrumpyDog } from "@/components/DogPack";

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

  // Check if there are any collaboration products
  const hasCollaborations = products?.some(p => 
    p.node.tags?.some(tag => tag.toLowerCase().includes('collaboration'))
  );

  // Check if there are Techno Doggies products
  const hasTechnoDoggies = products?.some(p => 
    p.node.vendor === 'Techno Doggies' || p.node.tags?.some(tag => tag.toLowerCase() === 'techno-doggies')
  );

  // Get Techno Doggies products
  const technoDoggiesProducts = products?.filter(p => 
    p.node.vendor === 'Techno Doggies' || p.node.tags?.some(tag => tag.toLowerCase() === 'techno-doggies')
  );

  // Filter products by type or special filters
  const filteredProducts = selectedType === "collaborations"
    ? products?.filter(p => p.node.tags?.some(tag => tag.toLowerCase().includes('collaboration')))
    : selectedType === "techno-doggies"
    ? technoDoggiesProducts
    : selectedType
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
        {(productTypes.length > 0 || hasCollaborations) && (
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
                
                {/* Collaborations filter - shown first if exists */}
                {hasCollaborations && (
                  <Button
                    variant={selectedType === "collaborations" ? "default" : "outline"}
                    size="sm"
                    className={`font-mono text-[10px] uppercase tracking-wider shrink-0 ${
                      selectedType === "collaborations" 
                        ? "" 
                        : "border-logo-green/50 text-logo-green hover:bg-logo-green/10"
                    }`}
                    onClick={() => setSelectedType("collaborations")}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Collaborations
                  </Button>
                )}

                {/* Techno Doggies filter */}
                {hasTechnoDoggies && (
                  <Button
                    variant={selectedType === "techno-doggies" ? "default" : "outline"}
                    size="sm"
                    className={`font-mono text-[10px] uppercase tracking-wider shrink-0 ${
                      selectedType === "techno-doggies" 
                        ? "bg-logo-green text-background" 
                        : "border-logo-green/50 text-logo-green hover:bg-logo-green/10"
                    }`}
                    onClick={() => setSelectedType("techno-doggies")}
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Techno Doggies
                  </Button>
                )}
                
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

        {/* Eulogio Collaboration Section */}
        {products?.some(p => p.node.title.toLowerCase().includes('eulogio')) && (
          <section className="border-b border-border overflow-hidden">
            {/* Hero Image Banner */}
            <div className="relative h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden">
              <div className="absolute inset-0">
                <img 
                  src={eulogioHeroImage}
                  alt="Eulogio × techno.dog collaboration at festival"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
              </div>
              
              {/* Content Overlay */}
              <div className="absolute inset-0 flex items-end">
                <div className="container mx-auto px-4 md:px-8 pb-8 md:pb-12">
                  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                    <div className="max-w-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-[#1a1a1a] p-2">
                          <img 
                            src={eulogioIcon}
                            alt="Eulogio" 
                            className="h-8 md:h-10 w-auto object-contain"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span className="font-mono text-[10px] text-amber-400 uppercase tracking-widest">
                            Limited Collaboration
                          </span>
                        </div>
                      </div>
                      <h2 className="font-mono text-3xl md:text-4xl lg:text-5xl uppercase tracking-tight text-foreground drop-shadow-lg">
                        Eulogio × techno.dog
                      </h2>
                      <p className="font-mono text-sm text-foreground/80 mt-3 max-w-md leading-relaxed drop-shadow-md">
                        Berlin techno heritage meets underground culture. Two exclusive pieces celebrating the raw energy of warehouse nights.
                      </p>
                    </div>
                    
                    <div className="shrink-0">
                      <Button
                        variant="default"
                        size="lg"
                        className="font-mono text-xs uppercase tracking-wider bg-amber-500 text-background hover:bg-amber-400"
                        onClick={() => setSelectedType("collaborations")}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Shop Collection
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-500/50" />
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-500/50" />
            </div>
            
            {/* Products Grid */}
            <div className="container mx-auto px-4 md:px-8 py-12 bg-gradient-to-b from-background to-amber-950/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {products
                  ?.filter(p => p.node.title.toLowerCase().includes('eulogio'))
                  .map((product, index) => (
                    <div key={product.node.id} className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative">
                        <ProductCard product={product.node} index={index} />
                      </div>
                    </div>
                  ))}
              </div>
              
              {/* Lifestyle Preview */}
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="aspect-square overflow-hidden border border-amber-500/20">
                  <img 
                    src={eulogioHoodieClub}
                    alt="Eulogio hoodie in warehouse"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="aspect-square overflow-hidden border border-amber-500/20 hidden md:block">
                  <img 
                    src={eulogioHeroImage}
                    alt="Eulogio crew at festival"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <Link 
                  to="/store/lookbook"
                  className="aspect-square border border-amber-500/30 bg-amber-950/10 flex flex-col items-center justify-center text-center p-4 hover:bg-amber-950/20 transition-colors col-span-2 md:col-span-2"
                >
                  <span className="font-mono text-[10px] text-amber-500 uppercase tracking-widest mb-2">
                    // Lookbook
                  </span>
                  <span className="font-mono text-lg uppercase tracking-tight">
                    See the full story
                  </span>
                  <span className="font-mono text-xs text-muted-foreground mt-2">
                    Festival shots, club nights, warehouse vibes →
                  </span>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Techno Doggies Collection Section */}
        {hasTechnoDoggies && technoDoggiesProducts && technoDoggiesProducts.length > 0 && (
          <section className="border-b border-border overflow-hidden">
            {/* Hero Banner */}
            <div className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-br from-background via-logo-green/5 to-background">
              {/* Animated background grid */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'linear-gradient(hsl(var(--logo-green)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--logo-green)) 1px, transparent 1px)',
                  backgroundSize: '40px 40px'
                }} />
              </div>
              
              {/* Floating doggies decoration */}
              <div className="absolute top-8 left-8 opacity-20 hidden lg:block">
                <DJDog className="w-24 h-24" animated />
              </div>
              <div className="absolute top-12 right-12 opacity-20 hidden lg:block">
                <RavingDog className="w-20 h-20" animated />
              </div>
              <div className="absolute bottom-8 left-1/4 opacity-20 hidden lg:block">
                <SpaceDog className="w-16 h-16" animated />
              </div>
              <div className="absolute bottom-12 right-1/4 opacity-20 hidden lg:block">
                <GrumpyDog className="w-14 h-14" />
              </div>
              
              <div className="container mx-auto px-4 md:px-8 relative z-10">
                <div className="max-w-3xl mx-auto text-center">
                  {/* Collection badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-logo-green/10 border border-logo-green/30 mb-6">
                    <Zap className="w-4 h-4 text-logo-green" />
                    <span className="font-mono text-[10px] text-logo-green uppercase tracking-widest">
                      New Collection
                    </span>
                  </div>
                  
                  {/* Title with doggies */}
                  <div className="flex items-center justify-center gap-4 md:gap-6 mb-6">
                    <DJDog className="w-12 h-12 md:w-16 md:h-16 shrink-0" animated />
                    <h2 className="font-mono text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight text-foreground">
                      Techno Doggies
                    </h2>
                    <RavingDog className="w-12 h-12 md:w-16 md:h-16 shrink-0" animated />
                  </div>
                  
                  <p className="font-mono text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed mb-8">
                    5 unique characters. 15 pieces. The pack is here.
                    <br />
                    <span className="text-logo-green">Caps. Tees. Hoodies.</span>
                  </p>
                  
                  {/* Character showcase */}
                  <div className="flex items-center justify-center gap-3 md:gap-6 mb-8">
                    <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setSelectedType("techno-doggies")}>
                      <div className="p-3 bg-logo-green/10 border border-logo-green/30 group-hover:border-logo-green/60 transition-colors">
                        <DJDog className="w-8 h-8 md:w-10 md:h-10" />
                      </div>
                      <span className="font-mono text-[8px] md:text-[10px] text-muted-foreground uppercase tracking-wider">DJ</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setSelectedType("techno-doggies")}>
                      <div className="p-3 bg-logo-green/10 border border-logo-green/30 group-hover:border-logo-green/60 transition-colors">
                        <RavingDog className="w-8 h-8 md:w-10 md:h-10" />
                      </div>
                      <span className="font-mono text-[8px] md:text-[10px] text-muted-foreground uppercase tracking-wider">Raving</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setSelectedType("techno-doggies")}>
                      <div className="p-3 bg-logo-green/10 border border-logo-green/30 group-hover:border-logo-green/60 transition-colors">
                        <NinjaDog className="w-8 h-8 md:w-10 md:h-10" />
                      </div>
                      <span className="font-mono text-[8px] md:text-[10px] text-muted-foreground uppercase tracking-wider">Ninja</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setSelectedType("techno-doggies")}>
                      <div className="p-3 bg-logo-green/10 border border-logo-green/30 group-hover:border-logo-green/60 transition-colors">
                        <SpaceDog className="w-8 h-8 md:w-10 md:h-10" />
                      </div>
                      <span className="font-mono text-[8px] md:text-[10px] text-muted-foreground uppercase tracking-wider">Space</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setSelectedType("techno-doggies")}>
                      <div className="p-3 bg-logo-green/10 border border-logo-green/30 group-hover:border-logo-green/60 transition-colors">
                        <GrumpyDog className="w-8 h-8 md:w-10 md:h-10" />
                      </div>
                      <span className="font-mono text-[8px] md:text-[10px] text-muted-foreground uppercase tracking-wider">Grumpy</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="default"
                    size="lg"
                    className="font-mono text-xs uppercase tracking-wider bg-logo-green text-background hover:bg-logo-green/80"
                    onClick={() => setSelectedType("techno-doggies")}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Shop the Pack
                  </Button>
                </div>
              </div>
              
              {/* Decorative corners */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-logo-green/30" />
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-logo-green/30" />
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-logo-green/30" />
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-logo-green/30" />
            </div>
            
            {/* Products Preview Grid - Show first 6 */}
            <div className="container mx-auto px-4 md:px-8 py-12 bg-gradient-to-b from-logo-green/5 to-background">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {technoDoggiesProducts.slice(0, 6).map((product, index) => (
                  <div key={product.node.id} className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-logo-green/20 to-logo-green/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                      <ProductCard product={product.node} index={index} />
                    </div>
                  </div>
                ))}
              </div>
              
              {technoDoggiesProducts.length > 6 && (
                <div className="text-center mt-8">
                  <Button
                    variant="outline"
                    size="lg"
                    className="font-mono text-xs uppercase tracking-wider border-logo-green/50 text-logo-green hover:bg-logo-green/10"
                    onClick={() => setSelectedType("techno-doggies")}
                  >
                    View All {technoDoggiesProducts.length} Products →
                  </Button>
                </div>
              )}
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

        {/* Lookbook CTA */}
        <section className="border-b border-border bg-gradient-to-br from-background via-background to-logo-green/5">
          <div className="container mx-auto px-4 md:px-8 py-12">
            <Link 
              to="/store/lookbook" 
              className="group block p-8 border border-logo-green/30 hover:border-logo-green/60 transition-all bg-gradient-to-r from-logo-green/5 to-transparent"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <span className="font-mono text-[10px] text-logo-green uppercase tracking-widest">
                    // Lookbook
                  </span>
                  <h3 className="font-mono text-xl uppercase tracking-tight mt-2 group-hover:text-logo-green transition-colors">
                    From the warehouse floor
                  </h3>
                  <p className="font-mono text-xs text-muted-foreground mt-2">
                    See our pieces in their natural habitat — clubs, festivals, and studios.
                  </p>
                </div>
                <div className="font-mono text-xs text-logo-green group-hover:translate-x-1 transition-transform">
                  View Lookbook →
                </div>
              </div>
            </Link>
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
