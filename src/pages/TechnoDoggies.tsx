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
      `Spread the barks!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    toast.success("Opening email...");
  };

  // Download as ultra-light SVG (~1-3KB)
  const downloadDog = async () => {
    const svg = document.querySelector('#current-dog-display svg');
    if (!svg) {
      toast.error("Couldn't find the doggy!");
      return;
    }

    logAction.mutate({
      variantId: currentDbData?.id,
      variantName: currentDog?.name || "Unknown",
      actionType: "download_svg",
    });
    trackDoggyEvent('main_page', 'download_svg', undefined, currentDog?.name);

    // Clone and clean the SVG (remove text, optimize)
    const svgClone = svg.cloneNode(true) as SVGElement;
    svgClone.querySelectorAll('text').forEach(t => t.remove());
    svgClone.setAttribute('width', '512');
    svgClone.setAttribute('height', '512');
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    
    const svgData = new XMLSerializer().serializeToString(svgClone);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
    
    const link = document.createElement('a');
    link.download = `techno-${currentDog?.name.toLowerCase().replace(/\s+/g, '-')}.svg`;
    link.href = URL.createObjectURL(svgBlob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Downloaded ${currentDog?.name} Dog!`, {
      description: "~2KB SVG • Transparent • Perfect quality",
    });
  };

  // Download sticker-ready version for WhatsApp (512x512 WebP, no text, transparent)
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
    
    // Clone SVG and remove text elements for clean sticker
    const svgClone = svg.cloneNode(true) as SVGElement;
    svgClone.querySelectorAll('text').forEach(t => t.remove());
    
    const svgData = new XMLSerializer().serializeToString(svgClone);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    // WhatsApp stickers must be 512x512
    canvas.width = 512;
    canvas.height = 512;
    
    img.onload = () => {
      // Clear for transparency
      ctx!.clearRect(0, 0, 512, 512);
      ctx!.drawImage(img, 0, 0, 512, 512);
      
      // Convert to WebP for WhatsApp (smaller file size, transparent background)
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
      }, 'image/webp', 0.95);
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
        <meta name="description" content="Create and share your own pack of Techno Doggies! Fun, shareable dog characters for the techno community. Bark bark!" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://techno.dog/doggies" />
        <meta property="og:title" content="Techno Doggies - Create & Share Your Pack" />
        <meta property="og:description" content="Create and share your own pack of Techno Doggies! Fun, shareable dog characters for the techno community. Spread the barks!" />
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
          
          {/* 1. HERO HEADER - Brand Identity */}
          <div className="text-center mb-8">
            <div className="flex justify-center gap-1 mb-2">
              <Sparkles className="w-4 h-4 text-logo-green animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-logo-green">
                Woof woof!
              </span>
              <Sparkles className="w-4 h-4 text-logo-green animate-pulse" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground font-mono mb-2">
              techno.dog
            </h1>
            <p className="text-sm sm:text-base text-logo-green font-mono font-semibold mb-1">
              Join the Doggy Movement
            </p>
            <p className="text-xs text-muted-foreground font-mono max-w-xs mx-auto">
              {activeVariants.length} unique doggies. Infinite barks. Zero NPCs.
            </p>
          </div>

          {/* 2. FEATURED DOGGY - The Star */}
          <div className="mb-8">
            <div 
              id="current-dog-display"
              className={`flex flex-col items-center transition-all duration-150 ${
                isAnimating ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
              }`}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-logo-green/20 rounded-full blur-2xl animate-pulse" />
                <DogComponent className="w-32 h-32 sm:w-40 sm:h-40 relative z-10" animated />
              </div>
              <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-foreground font-mono">
                {currentDog?.name} Dog
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground text-center mt-1 font-mono px-4">
                "{currentDbData?.personality || currentDog?.personality}"
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
                Next Doggy
              </Button>
              <Button variant="outline" size="sm" onClick={randomDog} className="font-mono text-xs h-9 px-4">
                <RefreshCw className="w-3 h-3 mr-1" />
                Surprise Me!
              </Button>
            </div>
          </div>

          {/* 3. MEET THE PACK - One by One with Download */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <h2 className="font-mono text-base font-bold text-foreground mb-1">
                Meet the Full Pack
              </h2>
              <p className="font-mono text-[10px] text-muted-foreground">
                {activeVariants.length} doggies • Tap to download for WhatsApp
              </p>
            </div>
            
            {/* One by One Carousel with Download */}
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
              {activeVariants.map((dog: any, index: number) => {
                const Dog = dog.Component;
                const isFeatured = dog.dbData?.is_featured;
                
                // Download as ultra-light SVG (~1-3KB) - best for sharing
                const downloadSingleDog = async () => {
                  const svgElement = document.querySelector(`#dog-${index} svg`);
                  if (!svgElement) {
                    toast.error("Couldn't find doggy");
                    return;
                  }
                  
                  // Clone and clean the SVG
                  const svgClone = svgElement.cloneNode(true) as SVGElement;
                  svgClone.querySelectorAll('text').forEach(t => t.remove()); // Remove text
                  svgClone.setAttribute('width', '512');
                  svgClone.setAttribute('height', '512');
                  svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                  
                  // Serialize to minimal SVG string
                  const svgData = new XMLSerializer().serializeToString(svgClone);
                  const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
                  
                  const link = document.createElement('a');
                  link.download = `techno-${dog.name.toLowerCase().replace(/\s+/g, '-')}.svg`;
                  link.href = URL.createObjectURL(svgBlob);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  
                  logAction.mutate({
                    variantId: dog.dbData?.id,
                    variantName: dog.name,
                    actionType: "download_svg",
                  });
                  
                  toast.success(`${dog.name} downloaded!`, {
                    description: "~2KB SVG • Perfect for sharing",
                    duration: 3000,
                  });
                };
                
                // WhatsApp needs WebP - offer as secondary option
                const downloadForWhatsAppSingle = async () => {
                  const svgElement = document.querySelector(`#dog-${index} svg`);
                  if (!svgElement) {
                    toast.error("Couldn't find doggy");
                    return;
                  }
                  
                  toast.loading("Creating sticker...");
                  
                  const svgClone = svgElement.cloneNode(true) as SVGElement;
                  svgClone.querySelectorAll('text').forEach(t => t.remove());
                  svgClone.setAttribute('width', '512');
                  svgClone.setAttribute('height', '512');
                  
                  const svgData = new XMLSerializer().serializeToString(svgClone);
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');
                  const img = new Image();
                  
                  canvas.width = 512;
                  canvas.height = 512;
                  
                  img.onload = () => {
                    ctx!.clearRect(0, 0, 512, 512);
                    ctx!.drawImage(img, 0, 0, 512, 512);
                    
                    // Lower quality for smaller file (0.7 = ~15-25KB)
                    canvas.toBlob((blob) => {
                      if (blob) {
                        const link = document.createElement('a');
                        link.download = `techno-${dog.name.toLowerCase().replace(/\s+/g, '-')}-sticker.webp`;
                        link.href = URL.createObjectURL(blob);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        logAction.mutate({
                          variantId: dog.dbData?.id,
                          variantName: dog.name,
                          actionType: "download_whatsapp",
                        });
                        
                        toast.dismiss();
                        toast.success(`${dog.name} sticker ready!`, {
                          description: "Add via WhatsApp > Stickers > Create",
                          duration: 3000,
                        });
                      } else {
                        toast.dismiss();
                        toast.error("Failed");
                      }
                    }, 'image/webp', 0.7); // Lower quality = smaller file
                  };
                  
                  img.onerror = () => {
                    toast.dismiss();
                    toast.error("Failed");
                  };
                  
                  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                  img.src = URL.createObjectURL(svgBlob);
                };
                
                return (
                  <div
                    key={dog.name}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      isFeatured 
                        ? 'border-logo-green/50 bg-logo-green/10' 
                        : 'border-border/30 hover:border-logo-green/30 bg-card/50'
                    }`}
                  >
                    {/* Dog Icon */}
                    <div id={`dog-${index}`} className="flex-shrink-0">
                      <Dog className="w-12 h-12" animated />
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-mono text-sm font-bold text-foreground truncate">
                          {dog.name}
                        </h3>
                        {isFeatured && <Star className="w-3 h-3 text-logo-green flex-shrink-0" />}
                      </div>
                      <p className="font-mono text-[10px] text-muted-foreground truncate">
                        {dog.dbData?.personality || dog.personality}
                      </p>
                    </div>
                    
                    {/* Download Buttons */}
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadSingleDog}
                        className="h-8 px-2 font-mono text-[9px] border-logo-green/30 hover:bg-logo-green/20"
                        title="SVG ~2KB"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadForWhatsAppSingle}
                        className="h-8 px-2 font-mono text-[9px] border-logo-green/30 hover:bg-logo-green/20"
                        title="WhatsApp sticker"
                      >
                        <Smartphone className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. CREATE YOUR OWN - Interactive AI Generator */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <h2 className="font-mono text-base font-bold text-foreground mb-1">
                Create Your Own Techno Doggy
              </h2>
              <p className="font-mono text-[10px] text-muted-foreground">
                Powered by AI • Describe your dream doggy
              </p>
            </div>
            <CustomDoggyCreator />
          </div>

          {/* 5. SHARE & JOIN - Community CTA */}
          <Card id="share-section" className="mb-8 border-logo-green/30 bg-gradient-to-br from-logo-green/10 via-transparent to-logo-green/5">
            <CardContent className="p-5">
              <div className="text-center mb-4">
                <h2 className="font-mono text-base font-bold text-foreground mb-1">
                  Share Your Doggy
                </h2>
                <p className="font-mono text-[10px] text-muted-foreground">
                  Make your friends jealous • Spread the barks
                </p>
              </div>

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
                  <span className="font-mono text-[9px] text-muted-foreground">Barks</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3 text-logo-green" />
                    <span className="font-mono text-sm font-bold text-foreground">∞</span>
                  </div>
                  <span className="font-mono text-[9px] text-muted-foreground">Tail Wags</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Share2 className="w-3 h-3 text-logo-green" />
                    <span className="font-mono text-sm font-bold text-foreground">4ever</span>
                  </div>
                  <span className="font-mono text-[9px] text-muted-foreground">Vibes</span>
                </div>
              </div>
              
              <div className="flex justify-center mb-3" onClick={() => handleSocialShare("social")}>
                <SocialShareButtons url={shareUrl} text={shareText} showAll showLabel />
              </div>

              <div className="flex flex-wrap gap-2 justify-center mb-4">
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
                  Full Pack
                </Button>
              </div>
              
              {/* WhatsApp Sticker Button - Prominent for Mobile */}
              <div className="pt-3 border-t border-border/30">
                <Button 
                  onClick={downloadForWhatsApp}
                  className="w-full font-mono text-xs h-10 bg-[#25D366] hover:bg-[#25D366]/90 text-white shadow-[0_0_15px_hsl(142_70%_49%/0.3)]"
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  Add to Phone for WhatsApp
                </Button>
                <p className="text-[9px] text-muted-foreground text-center mt-2 font-mono">
                  Downloads 512×512 sticker • Save to Photos • Share everywhere
                </p>
              </div>

              <p className="mt-4 font-mono text-[10px] text-muted-foreground italic text-center">
                "Life's too short for NPCs :: Become a techno dog."
              </p>
            </CardContent>
          </Card>

        </main>
        
        {/* Doggy Footer with copyright and site links */}
        <DoggyPageFooter pageSource="main_page" currentDoggyName={currentDog?.name} />
      </div>
    </>
  );
};

export default TechnoDoggies;
