import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import PageSEO from "@/components/PageSEO";
import { Link } from "react-router-dom";
import { dogVariants } from "@/components/DogPack";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Share2, Download, Mail, ArrowLeft, Star, Sparkles, Users, Heart, Package, Smartphone } from "lucide-react";
import { toast } from "sonner";
import HexagonLogo from "@/components/HexagonLogo";
import { SocialShareButtons } from "@/components/social/SocialShareButtons";
import { useActiveDoggyVariants, useLogDoggyAction } from "@/hooks/useDoggyData";
import CustomDoggyCreator from "@/components/CustomDoggyCreator";
import { DoggyPageFooter, trackDoggyEvent } from "@/components/doggy";

const TechnoDoggies = () => {
  const { data: dbVariants, isLoading } = useActiveDoggyVariants();
  const logAction = useLogDoggyAction();
  
  const [currentDogIndex, setCurrentDogIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedDogs, setSelectedDogs] = useState<number[]>([]);

  // Get the active variants from DB, fallback to static if loading
  const activeVariants = dbVariants?.map(dbDog => {
    const match = dogVariants.find(d => d.name.toLowerCase() === dbDog.name.toLowerCase());
    return match ? { ...match, dbData: dbDog } : null;
  }).filter(Boolean) || dogVariants;

  const currentDog = activeVariants[currentDogIndex] || activeVariants[0];
  const DogComponent = currentDog?.Component || dogVariants[0].Component;
  const currentDbData = (currentDog as any)?.dbData;

  // Log view on mount and track page view
  useEffect(() => {
    if (currentDog) {
      logAction.mutate({
        variantId: currentDbData?.id,
        variantName: currentDog.name,
        actionType: "view",
      });
      // Track page view for analytics
      trackDoggyEvent('main_page', 'page_view', undefined, currentDog.name);
    }
  }, []);

  const nextDog = () => {
    setIsAnimating(true);
    setTimeout(() => {
      const newIndex = (currentDogIndex + 1) % activeVariants.length;
      setCurrentDogIndex(newIndex);
      setIsAnimating(false);
      
      const nextDog = activeVariants[newIndex];
      if (nextDog) {
        logAction.mutate({
          variantId: (nextDog as any)?.dbData?.id,
          variantName: nextDog.name,
          actionType: "view",
        });
      }
    }, 150);
  };

  const randomDog = () => {
    setIsAnimating(true);
    setTimeout(() => {
      const newIndex = Math.floor(Math.random() * activeVariants.length);
      setCurrentDogIndex(newIndex);
      setIsAnimating(false);
      
      const randomDog = activeVariants[newIndex];
      if (randomDog) {
        logAction.mutate({
          variantId: (randomDog as any)?.dbData?.id,
          variantName: randomDog.name,
          actionType: "view",
        });
      }
    }, 150);
  };

  const toggleDogSelection = (index: number) => {
    setSelectedDogs(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  // Generate a proper base64 PNG from SVG
  const generateDoggyImage = async (): Promise<string | null> => {
    const svg = document.querySelector('#current-dog-display svg');
    if (!svg) return null;

    return new Promise((resolve) => {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      canvas.width = 512;
      canvas.height = 512;
      
      img.onload = () => {
        // Fill with transparent background
        ctx!.clearRect(0, 0, 512, 512);
        ctx!.drawImage(img, 0, 0, 512, 512);
        resolve(canvas.toDataURL('image/png'));
      };
      
      img.onerror = () => {
        console.error('Failed to load SVG image');
        resolve(null);
      };
      
      // Use blob URL instead of base64 for better Unicode support
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      img.src = URL.createObjectURL(svgBlob);
    });
  };

  const shareViaEmail = async () => {
    logAction.mutate({
      variantId: currentDbData?.id,
      variantName: currentDog?.name || "Unknown",
      actionType: "share_email",
    });
    trackDoggyEvent('main_page', 'share', 'email', currentDog?.name);
    
    const dogNames = activeVariants.slice(0, 5).map((d: any) => d.name).join(', ');
    const subject = encodeURIComponent(`Join the Techno Dog Pack! - ${currentDog?.name} Dog`);
    const body = encodeURIComponent(
      `Woof woof! Check out my Techno Doggy!\n\n` +
      `Meet the ${currentDog?.name} Dog: ${currentDog?.personality}\n\n` +
      `The full pack includes: ${dogNames} and more!\n\n` +
      `Create your own pack & download your favorite doggies:\n` +
      `https://techno.dog/doggies\n\n` +
      `Each doggy is available for individual download as a high-quality PNG.\n\n` +
      `Spread the borks!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    toast.success("Opening email...");
  };

  const downloadDog = async () => {
    const svg = document.querySelector('#current-dog-display svg');
    if (!svg) {
      toast.error("Couldn't find the doggy!");
      return;
    }

    logAction.mutate({
      variantId: currentDbData?.id,
      variantName: currentDog?.name || "Unknown",
      actionType: "download",
    });
    trackDoggyEvent('main_page', 'download', undefined, currentDog?.name);

    toast.loading("Generating your doggy...");
    
    const imageData = await generateDoggyImage();
    if (!imageData) {
      toast.dismiss();
      toast.error("Failed to generate image. Try again!");
      return;
    }
    
    const link = document.createElement('a');
    link.download = `techno-${currentDog?.name.toLowerCase().replace(/\s+/g, '-')}-dog.png`;
    link.href = imageData;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.dismiss();
    toast.success(`Downloaded ${currentDog?.name} Dog!`);
  };

  // Download sticker-ready version for WhatsApp (512x512 WebP)
  const downloadForWhatsApp = async () => {
    const svg = document.querySelector('#current-dog-display svg');
    if (!svg) {
      toast.error("Couldn't find the doggy!");
      return;
    }

    logAction.mutate({
      variantId: currentDbData?.id,
      variantName: currentDog?.name || "Unknown",
      actionType: "download_whatsapp",
    });
    trackDoggyEvent('main_page', 'download_whatsapp', undefined, currentDog?.name);

    toast.loading("Creating WhatsApp sticker...");
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    // WhatsApp stickers must be 512x512
    canvas.width = 512;
    canvas.height = 512;
    
    img.onload = () => {
      ctx!.clearRect(0, 0, 512, 512);
      ctx!.drawImage(img, 0, 0, 512, 512);
      
      // Convert to WebP for WhatsApp (smaller file size, better quality)
      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement('a');
          link.download = `techno-${currentDog?.name.toLowerCase().replace(/\s+/g, '-')}-sticker.webp`;
          link.href = URL.createObjectURL(blob);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          toast.dismiss();
          toast.success(`Sticker ready! Save to Photos, then add to WhatsApp`, {
            description: "Open WhatsApp > Stickers > Create > Add from Photos",
            duration: 6000,
          });
        } else {
          toast.dismiss();
          toast.error("Failed to create sticker");
        }
      }, 'image/webp', 0.9);
    };
    
    img.onerror = () => {
      toast.dismiss();
      toast.error("Failed to generate sticker");
    };
    
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    img.src = URL.createObjectURL(svgBlob);
  };

  // Download all doggies as individual files
  const downloadAllDoggies = async () => {
    toast.loading("Generating your pack...");
    trackDoggyEvent('main_page', 'download_pack', undefined, 'all');
    
    let downloadCount = 0;
    for (let i = 0; i < Math.min(activeVariants.length, 10); i++) {
      const dog = activeVariants[i];
      const Dog = dog.Component;
      
      // Create a temporary container to render each dog
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      document.body.appendChild(container);
      
      // Render the SVG
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('width', '512');
      svg.setAttribute('height', '512');
      svg.setAttribute('viewBox', '0 0 100 100');
      container.appendChild(svg);
      
      // Get the current dog's SVG from the main display temporarily
      const originalIndex = currentDogIndex;
      setCurrentDogIndex(i);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const currentSvg = document.querySelector('#current-dog-display svg');
      if (currentSvg) {
        const svgData = new XMLSerializer().serializeToString(currentSvg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        canvas.width = 512;
        canvas.height = 512;
        
        await new Promise<void>((resolve) => {
          img.onload = () => {
            ctx!.clearRect(0, 0, 512, 512);
            ctx!.drawImage(img, 0, 0, 512, 512);
            
            const link = document.createElement('a');
            link.download = `techno-${dog.name.toLowerCase().replace(/\s+/g, '-')}-dog.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            downloadCount++;
            resolve();
          };
          
          img.onerror = () => resolve();
          
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          img.src = URL.createObjectURL(svgBlob);
        });
      }
      
      document.body.removeChild(container);
    }
    
    setCurrentDogIndex(0);
    toast.dismiss();
    toast.success(`Downloaded ${downloadCount} doggies to your device!`);
  };

  const handleSocialShare = (platform: string) => {
    logAction.mutate({
      variantId: currentDbData?.id,
      variantName: currentDog?.name || "Unknown",
      actionType: `share_${platform}`,
    });
    trackDoggyEvent('main_page', 'share', platform, currentDog?.name);
  };

  const shareUrl = "https://techno.dog/doggies";
  const shareText = `Check out the ${currentDog?.name} Techno Dog! Create your own pack at techno.dog`;

  // Get featured dogs
  const featuredDogs = activeVariants.filter((dog: any) => dog.dbData?.is_featured);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="font-mono text-xs text-muted-foreground animate-pulse">Loading doggies...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Techno Doggies - Create & Share Your Pack | techno.dog</title>
        <meta name="description" content="Create and share your own pack of Techno Doggies! Fun, shareable dog characters for the techno community. Bork bork!" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://techno.dog/doggies" />
        <meta property="og:title" content="Techno Doggies - Create & Share Your Pack" />
        <meta property="og:description" content="Create and share your own pack of Techno Doggies! Fun, shareable dog characters for the techno community. Spread the borks!" />
        <meta property="og:image" content="https://techno.dog/og-doggies.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Techno Dog DJ with headphones and turntables" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://techno.dog/doggies" />
        <meta name="twitter:title" content="Techno Doggies - Create & Share Your Pack" />
        <meta name="twitter:description" content="Create and share your own pack of Techno Doggies! Fun, shareable dog characters for the techno community." />
        <meta name="twitter:image" content="https://techno.dog/og-doggies.png" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Minimal Mobile Header */}
        <header className="border-b border-border/30 bg-background/90 backdrop-blur-md sticky top-0 z-50">
          <div className="px-4 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <HexagonLogo className="w-7 h-7 drop-shadow-[0_0_6px_hsl(100_100%_60%/0.5)]" />
              <span className="font-mono text-xs tracking-[0.15em] text-foreground">
                techno.dog
              </span>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm" className="font-mono text-[10px] h-8 px-2">
                <ArrowLeft className="w-3 h-3 mr-1" />
                Home
              </Button>
            </Link>
          </div>
        </header>

        <main className="px-4 py-6 max-w-lg mx-auto">
          {/* JOIN THE PACK CTA - Fun & Quirky (Top Priority) */}
          <div className="mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-logo-green/10 via-transparent to-logo-green/5 rounded-2xl" />
            <div className="relative p-4 sm:p-6 text-center border border-logo-green/30 rounded-2xl bg-card/30 backdrop-blur-sm">
              <div className="flex justify-center gap-1 mb-2">
                <Sparkles className="w-4 h-4 text-logo-green animate-pulse" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-logo-green">
                  Woof woof!
                </span>
                <Sparkles className="w-4 h-4 text-logo-green animate-pulse" />
              </div>
              
              <h1 className="text-xl sm:text-2xl font-bold text-foreground font-mono mb-2 leading-tight">
                Join the Pack!
              </h1>
              <p className="text-xs text-muted-foreground font-mono mb-4 max-w-xs mx-auto">
                Every techno lover deserves a doggy. Find yours. Share the borks. Keep tails wagging worldwide!
              </p>
              
              {/* Fun Stats */}
              <div className="flex justify-center gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="w-3 h-3 text-logo-green" />
                    <span className="font-mono text-sm font-bold text-foreground">{activeVariants.length}</span>
                  </div>
                  <span className="font-mono text-[9px] text-muted-foreground">Doggies</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Heart className="w-3 h-3 text-logo-green" />
                    <span className="font-mono text-sm font-bold text-foreground">∞</span>
                  </div>
                  <span className="font-mono text-[9px] text-muted-foreground">Borks</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Share2 className="w-3 h-3 text-logo-green" />
                    <span className="font-mono text-sm font-bold text-foreground">4ever</span>
                  </div>
                  <span className="font-mono text-[9px] text-muted-foreground">Vibes</span>
                </div>
              </div>

              <Button 
                onClick={() => {
                  trackDoggyEvent('main_page', 'cta_click', 'join_pack');
                  document.getElementById('share-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="font-mono text-xs h-10 px-6 bg-logo-green text-background hover:bg-logo-green/90 shadow-[0_0_20px_hsl(100_100%_60%/0.3)]"
              >
                <Share2 className="w-3 h-3 mr-2" />
                Share & Spread the Borks
              </Button>
              
              <p className="mt-3 font-mono text-[9px] text-muted-foreground italic">
                "Life's too short for boring profiles. Be a techno dog."
              </p>
            </div>
          </div>

          {/* Hero - Current Dog Display */}
          <div className="mb-6">
            <div 
              id="current-dog-display"
              className={`flex flex-col items-center transition-all duration-150 ${
                isAnimating ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
              }`}
            >
              <DogComponent className="w-28 h-28 sm:w-36 sm:h-36" animated />
              <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-foreground font-mono">
                {currentDog?.name} Dog
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground text-center mt-1 font-mono px-4">
                {currentDbData?.personality || currentDog?.personality}
              </p>
              <span className="mt-2 px-3 py-1 text-[10px] uppercase tracking-wider rounded-full border border-logo-green/30 text-logo-green font-mono">
                {currentDbData?.status || currentDog?.status}
              </span>
              {currentDbData?.is_featured && (
                <Badge variant="secondary" className="mt-2 text-[10px]">
                  <Star className="w-3 h-3 mr-1" /> Featured
                </Badge>
              )}
            </div>

            {/* Quick Controls */}
            <div className="flex gap-2 justify-center mt-4">
              <Button variant="outline" size="sm" onClick={nextDog} className="font-mono text-xs h-9 px-4">
                Next
              </Button>
              <Button variant="outline" size="sm" onClick={randomDog} className="font-mono text-xs h-9 px-4">
                <RefreshCw className="w-3 h-3 mr-1" />
                Random
              </Button>
            </div>
          </div>

          {/* Share Section (High Priority for Virality) */}
          <Card id="share-section" className="mb-6 border-logo-green/30 bg-card/50">
            <CardContent className="p-4">
              <h2 className="font-mono text-xs uppercase tracking-wider text-logo-green mb-1 text-center">
                Share Your Doggy
              </h2>
              <p className="font-mono text-[9px] text-muted-foreground text-center mb-3">
                Make your friends jealous of your new pack member
              </p>
              
              <div className="flex justify-center mb-3" onClick={() => handleSocialShare("social")}>
                <SocialShareButtons url={shareUrl} text={shareText} showAll showLabel />
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={shareViaEmail} className="font-mono text-[10px] h-8">
                  <Mail className="w-3 h-3 mr-1" />
                  Email
                </Button>
                <Button variant="outline" size="sm" onClick={downloadDog} className="font-mono text-[10px] h-8">
                  <Download className="w-3 h-3 mr-1" />
                  Save PNG
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={downloadAllDoggies} 
                  className="font-mono text-[10px] h-8"
                >
                  <Package className="w-3 h-3 mr-1" />
                  Pack
                </Button>
              </div>
              
              {/* WhatsApp Sticker Button - Prominent for Mobile */}
              <div className="mt-3 pt-3 border-t border-border/30">
                <Button 
                  onClick={downloadForWhatsApp}
                  className="w-full font-mono text-xs h-10 bg-[#25D366] hover:bg-[#25D366]/90 text-white shadow-[0_0_15px_hsl(142_70%_49%/0.3)]"
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  Add to Phone for WhatsApp
                </Button>
                <p className="text-[9px] text-muted-foreground text-center mt-2 font-mono">
                  Downloads 512×512 sticker • Save to Photos • Add to WhatsApp
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Featured Dogs (Quick Access) */}
          {featuredDogs.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Star className="w-3 h-3 text-logo-green" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-logo-green">Featured</span>
              </div>
              <div className="flex justify-center gap-3 flex-wrap">
                {featuredDogs.map((dog: any) => {
                  const Dog = dog.Component;
                  return (
                    <button
                      key={dog.name}
                      onClick={() => {
                        const fullIndex = activeVariants.findIndex(v => v.name === dog.name);
                        setCurrentDogIndex(fullIndex >= 0 ? fullIndex : 0);
                      }}
                      className="p-2 rounded-lg border border-logo-green/50 bg-logo-green/10 hover:bg-logo-green/20 transition-all active:scale-95"
                    >
                      <Dog className="w-8 h-8 mx-auto" />
                      <p className="text-[9px] font-mono text-logo-green mt-1">{dog.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Doggy Creator */}
          <div className="mb-6">
            <CustomDoggyCreator />
          </div>

          {/* Full Pack Grid */}
          <div className="mb-6">
            <h2 className="font-mono text-sm text-center mb-4 text-foreground">
              Meet the Full Pack
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
              {activeVariants.map((dog: any, index: number) => {
                const Dog = dog.Component;
                const isSelected = selectedDogs.includes(index);
                const isCurrent = index === currentDogIndex;
                const isFeatured = dog.dbData?.is_featured;
                return (
                  <button
                    key={dog.name}
                    onClick={() => {
                      setCurrentDogIndex(index);
                      toggleDogSelection(index);
                      // Scroll to top on mobile to show selected dog
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`p-2 sm:p-3 rounded-lg border transition-all active:scale-95 ${
                      isCurrent
                        ? 'border-logo-green bg-logo-green/20 ring-2 ring-logo-green/50'
                        : isSelected 
                          ? 'border-logo-green bg-logo-green/10' 
                          : isFeatured 
                            ? 'border-logo-green/50 hover:border-logo-green'
                            : 'border-border/50 hover:border-logo-green/50'
                    }`}
                  >
                    <Dog className="w-8 h-8 sm:w-10 sm:h-10 mx-auto" />
                    <p className="text-[9px] sm:text-[10px] font-mono text-muted-foreground mt-1 text-center truncate">
                      {dog.name}
                    </p>
                    {isFeatured && <Star className="w-2 h-2 sm:w-3 sm:h-3 mx-auto mt-0.5 text-logo-green" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info Text */}
          <p className="text-center text-muted-foreground font-mono text-[10px] mb-6">
            Tap any doggy to select • Share your favorites
          </p>

        </main>
        
        {/* Doggy Footer with copyright and site links */}
        <DoggyPageFooter pageSource="main_page" currentDoggyName={currentDog?.name} />
      </div>
    </>
  );
};

export default TechnoDoggies;
