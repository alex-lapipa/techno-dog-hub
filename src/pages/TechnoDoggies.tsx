import { useState, useEffect, useRef } from "react";
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
import { DoggyPageFooter, trackDoggyEvent, DoggyShareLeaderboard, recordShare } from "@/components/doggy";
import ParticleBackground from "@/components/ParticleBackground";

// Get initial dog index based on visit history and popularity
const getInitialDogIndex = (variants: typeof dogVariants): number => {
  const visitCount = parseInt(localStorage.getItem('doggy_visit_count') || '0', 10);
  const lastVisitedDog = localStorage.getItem('doggy_last_shown');
  
  // TODO: When analytics mature, fetch most popular dogs from doggy_analytics
  // Default: Techno dog for first visit, random different dog for returning visitors
  const technoIndex = variants.findIndex(d => d.name.toLowerCase() === 'techno');
  
  if (visitCount === 0) {
    // First visit: show Techno dog (our official mascot)
    return technoIndex >= 0 ? technoIndex : 0;
  } else {
    // Returning visitor: show a different dog than last time
    let newIndex = Math.floor(Math.random() * variants.length);
    const lastIndex = variants.findIndex(d => d.name === lastVisitedDog);
    
    // Ensure we don't show the same dog twice in a row
    if (newIndex === lastIndex && variants.length > 1) {
      newIndex = (newIndex + 1) % variants.length;
    }
    return newIndex;
  }
};

const TechnoDoggies = () => {
  const { data: dbVariants, isLoading } = useActiveDoggyVariants();
  const logAction = useLogDoggyAction();
  
  const [currentDogIndex, setCurrentDogIndex] = useState(0);
  const [initialDogSet, setInitialDogSet] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedDogs, setSelectedDogs] = useState<number[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  // Get the active variants from DB, fallback to static if loading
  const activeVariants = dbVariants?.map(dbDog => {
    const match = dogVariants.find(d => d.name.toLowerCase() === dbDog.name.toLowerCase());
    return match ? { ...match, dbData: dbDog } : null;
  }).filter(Boolean) || dogVariants;

  // Set initial dog based on visit history (runs once when variants load)
  useEffect(() => {
    if (!initialDogSet && activeVariants.length > 0) {
      const initialIndex = getInitialDogIndex(activeVariants);
      setCurrentDogIndex(initialIndex);
      setInitialDogSet(true);
      
      // Track visit and store last shown dog
      const visitCount = parseInt(localStorage.getItem('doggy_visit_count') || '0', 10);
      localStorage.setItem('doggy_visit_count', String(visitCount + 1));
      localStorage.setItem('doggy_last_shown', activeVariants[initialIndex]?.name || 'Happy');
    }
  }, [activeVariants, initialDogSet]);

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

  // Auto-scroll carousel every 2 seconds
  useEffect(() => {
    if (isCarouselPaused || !carouselRef.current) return;
    
    const interval = setInterval(() => {
      const carousel = carouselRef.current;
      if (!carousel) return;
      
      const cardWidth = 144 + 16; // w-36 (144px) + gap-4 (16px)
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      
      if (carousel.scrollLeft >= maxScroll - 10) {
        carousel.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        carousel.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isCarouselPaused, activeVariants.length]);

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
    await recordShare();
    
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

  const handleSocialShare = async (platform: string) => {
    logAction.mutate({
      variantId: currentDbData?.id,
      variantName: currentDog?.name || "Unknown",
      actionType: `share_${platform}`,
    });
    trackDoggyEvent('main_page', 'share', platform, currentDog?.name);
    
    // Record share for leaderboard
    await recordShare();
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

      <div className="min-h-screen bg-background relative">
        <ParticleBackground />
        {/* Minimal Mobile Header - transparent to not clip dog animations */}
        <header className="border-b border-border/20 bg-transparent sticky top-0 z-40">
          <div className="px-4 py-3 flex items-center justify-between bg-background/60 backdrop-blur-sm">
            <Link to="/" className="flex items-center gap-2 group relative z-50">
              <HexagonLogo className="w-7 h-7 drop-shadow-[0_0_6px_hsl(100_100%_60%/0.5)]" />
              <span className="font-mono text-xs tracking-[0.15em] text-foreground">
                techno.dog
              </span>
            </Link>
            <Link to="/" className="relative z-50">
              <Button variant="ghost" size="sm" className="font-mono text-[10px] h-8 px-2">
                <ArrowLeft className="w-3 h-3 mr-1" />
                Home
              </Button>
            </Link>
          </div>
        </header>

        <main className="px-4 py-6 max-w-lg mx-auto relative z-10">
          
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
              {/* Enhanced glow effects like floating button */}
              <div className="relative group">
                {/* Outer pulsing glow ring */}
                <div className="absolute inset-0 rounded-full bg-logo-green/30 animate-ping" style={{ animationDuration: '2.5s' }} />
                {/* Inner soft glow */}
                <div className="absolute inset-0 bg-logo-green/25 rounded-full blur-3xl animate-pulse" />
                {/* Secondary glow layer */}
                <div className="absolute -inset-4 bg-logo-green/10 rounded-full blur-2xl" />
                {/* The dog with drop shadow */}
                <DogComponent 
                  className="w-36 h-36 sm:w-44 sm:h-44 relative z-10 drop-shadow-[0_0_20px_hsl(100_100%_60%/0.6)] transition-transform duration-300 hover:scale-105 hover:rotate-3" 
                  animated 
                />
              </div>
              <h2 className="mt-5 text-2xl sm:text-3xl font-bold text-foreground font-mono drop-shadow-[0_0_10px_hsl(100_100%_60%/0.3)]">
                {currentDog?.name === 'Techno' ? 'Techno Dog' : `${currentDog?.name} Doggy`}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground text-center mt-1 font-mono px-4">
                "{currentDbData?.personality || currentDog?.personality}"
              </p>
              <span className="mt-3 px-4 py-1.5 text-[10px] uppercase tracking-wider rounded-full border border-logo-green/50 text-logo-green font-mono bg-logo-green/10 shadow-[0_0_15px_hsl(100_100%_60%/0.2)]">
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

          {/* 3. MEET THE PACK - Auto-Scrolling Carousel */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <h2 className="font-mono text-base font-bold text-foreground mb-1">
                Meet the Full Pack
              </h2>
              <p className="font-mono text-[10px] text-muted-foreground">
                {activeVariants.length} doggies • Auto-scrolling
              </p>
            </div>
            
            {/* Auto-Scrolling Carousel */}
            <div 
              ref={carouselRef}
              onMouseEnter={() => setIsCarouselPaused(true)}
              onMouseLeave={() => setIsCarouselPaused(false)}
              onTouchStart={() => setIsCarouselPaused(true)}
              onTouchEnd={() => setTimeout(() => setIsCarouselPaused(false), 3000)}
              className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-thin scroll-smooth"
            >
              {activeVariants.map((dog: any, index: number) => {
                const Dog = dog.Component;
                const isFeatured = dog.dbData?.is_featured;
                
                // Download as ultra-light SVG (~1-3KB)
                const downloadSingleDog = async () => {
                  const svgElement = document.querySelector(`#dog-${index} svg`);
                  if (!svgElement) {
                    toast.error("Couldn't find doggy");
                    return;
                  }
                  
                  const svgClone = svgElement.cloneNode(true) as SVGElement;
                  svgClone.querySelectorAll('text').forEach(t => t.remove());
                  svgClone.setAttribute('width', '512');
                  svgClone.setAttribute('height', '512');
                  svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                  
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
                  
                  toast.success(`${dog.name} downloaded!`);
                };
                
                // WhatsApp WebP download
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
                        toast.success(`${dog.name} sticker ready!`);
                      } else {
                        toast.dismiss();
                        toast.error("Failed");
                      }
                    }, 'image/webp', 0.7);
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
                    className={`flex-shrink-0 w-36 snap-center rounded-xl border p-3 transition-all ${
                      isFeatured 
                        ? 'border-logo-green/50 bg-logo-green/10' 
                        : 'border-border/30 bg-card/50'
                    }`}
                  >
                    {/* Large Dog Image */}
                    <div id={`dog-${index}`} className="flex justify-center mb-2">
                      <Dog className="w-24 h-24" animated />
                    </div>
                    
                    {/* Name */}
                    <div className="text-center mb-2">
                      <div className="flex items-center justify-center gap-1">
                        <h3 className="font-mono text-xs font-bold text-foreground">
                          {dog.name}
                        </h3>
                        {isFeatured && <Star className="w-3 h-3 text-logo-green" />}
                      </div>
                    </div>
                    
                    {/* Buttons Under Image */}
                    <div className="flex gap-1 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadSingleDog}
                        className="h-7 px-2 font-mono text-[9px] border-logo-green/30 hover:bg-logo-green/20"
                        title="SVG"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        SVG
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadForWhatsAppSingle}
                        className="h-7 px-2 font-mono text-[9px] border-logo-green/30 hover:bg-logo-green/20"
                        title="WhatsApp"
                      >
                        <Smartphone className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
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

          {/* 6. SHARE LEADERBOARD */}
          <div className="mb-8">
            <DoggyShareLeaderboard />
          </div>

        </main>
        
        {/* Sticky Mobile Share Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-background/95 backdrop-blur-md border-t border-border/30 sm:hidden">
          <div className="flex gap-2 max-w-lg mx-auto">
            <Button 
              onClick={downloadForWhatsApp}
              className="flex-1 font-mono text-xs h-11 bg-[#25D366] hover:bg-[#25D366]/90 text-white"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              WhatsApp Sticker
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                const shareSection = document.getElementById('share-section');
                shareSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="font-mono text-xs h-11 px-4 border-logo-green/50 text-logo-green"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Spacer for sticky bar on mobile */}
        <div className="h-20 sm:hidden" />
        
        {/* Doggy Footer with copyright and site links */}
        <DoggyPageFooter pageSource="main_page" currentDoggyName={currentDog?.name} />
      </div>
    </>
  );
};

export default TechnoDoggies;
