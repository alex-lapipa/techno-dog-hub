import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import PageSEO from "@/components/PageSEO";
import { Link } from "react-router-dom";
import { dogVariants } from "@/components/DogPack";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Share2, Download, Mail, ArrowLeft, Star, Sparkles, Users, Heart, Package, Smartphone, Copy } from "lucide-react";
import { toast } from "sonner";
import HexagonLogo from "@/components/HexagonLogo";
import { SocialShareButtons } from "@/components/social/SocialShareButtons";
import { useActiveDoggyVariants, useLogDoggyAction } from "@/hooks/useDoggyData";
import { DoggyPageFooter, trackDoggyEvent, DoggyShareLeaderboard, recordShare } from "@/components/doggy";
import ParticleBackground from "@/components/ParticleBackground";

// Doggies that should NEVER be shown first - too grumpy or confusing for first impressions
const excludedFirstImpressionDogs = ['grumpy', 'sven marquardt', 'bouncer', 'security'];

// Positive, fun, easy-to-understand doggies that make great first impressions
const preferredFirstImpressionDogs = [
  'techno', 'happy', 'dj', 'vinyl', 'headphones', 'dancer', 'rave', 
  'sunrise', 'festival', 'party', 'love', 'peace', 'bartender'
];

// Get initial dog index based on visit history, analytics, and positivity
const getInitialDogIndex = (variants: typeof dogVariants): number => {
  const visitCount = parseInt(localStorage.getItem('doggy_visit_count') || '0', 10);
  const lastVisitedDog = localStorage.getItem('doggy_last_shown');
  
  // TODO: When analytics mature, fetch most popular dogs from doggy_analytics
  // For now, use curated positive doggies list
  
  // Find preferred doggies that exist in current variants
  const preferredIndices = variants
    .map((d, i) => ({ name: d.name.toLowerCase(), index: i }))
    .filter(d => preferredFirstImpressionDogs.includes(d.name))
    .map(d => d.index);
  
  // Find excluded doggies
  const excludedNames = excludedFirstImpressionDogs;
  
  if (visitCount === 0) {
    // First visit: show Techno dog (our official mascot)
    const technoIndex = variants.findIndex(d => d.name.toLowerCase() === 'techno');
    return technoIndex >= 0 ? technoIndex : (preferredIndices[0] ?? 0);
  } else {
    // Returning visitor: pick from preferred list, avoiding excluded and last shown
    const lastIndex = variants.findIndex(d => d.name === lastVisitedDog);
    
    // Filter to get safe indices (not excluded, not last shown)
    const safeIndices = preferredIndices.length > 0 
      ? preferredIndices.filter(i => i !== lastIndex)
      : variants
          .map((d, i) => ({ name: d.name.toLowerCase(), index: i }))
          .filter(d => !excludedNames.includes(d.name) && d.index !== lastIndex)
          .map(d => d.index);
    
    if (safeIndices.length > 0) {
      return safeIndices[Math.floor(Math.random() * safeIndices.length)];
    }
    
    // Fallback: any dog except excluded ones
    let newIndex = Math.floor(Math.random() * variants.length);
    const variant = variants[newIndex];
    if (variant && excludedNames.includes(variant.name.toLowerCase())) {
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
    
    // Doggies leave nameless - just the pack, no individual names
    const subject = encodeURIComponent("Join the techno.dog pack!");
    const body = encodeURIComponent(
      `Woof woof! Check out the techno.dog pack!\n\n` +
      `${activeVariants.length}+ unique doggies waiting to be adopted.\n\n` +
      `Create your own pack & download your favorites:\n` +
      `https://techno.dog/doggies\n\n` +
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
  // Doggies leave nameless - the techno.dog pack philosophy
  const shareText = "Join the techno.dog pack! Create your own doggies at techno.dog";

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
            <p className="text-xs text-muted-foreground font-mono whitespace-nowrap">
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
              {/* Subtle halo effect */}
              <div className="relative">
                <div className="absolute inset-0 bg-logo-green/15 rounded-full blur-2xl" />
                <DogComponent 
                  className="w-36 h-36 sm:w-44 sm:h-44 relative z-10" 
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
              <Button 
                size="sm" 
                onClick={async () => {
                  if (navigator.share) {
                    try {
                      // Doggies leave nameless when shared externally
                      await navigator.share({
                        title: "techno.dog pack",
                        text: shareText,
                        url: shareUrl,
                      });
                      await handleSocialShare('native');
                    } catch (err) {
                      // User cancelled or share failed, scroll to share section
                      document.getElementById('share-section')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  } else {
                    document.getElementById('share-section')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="font-mono text-xs h-9 px-4 bg-logo-green hover:bg-logo-green/90 text-background"
              >
                <Share2 className="w-3 h-3 mr-1" />
                Share Me
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

              {/* PRIMARY ROW - Green buttons: WhatsApp, Instagram, Discord, Bluesky, Copy */}
              <div className="flex justify-center gap-2 mb-3">
                <Button 
                  onClick={downloadForWhatsApp}
                  className="h-10 w-10 p-0 bg-logo-green hover:bg-logo-green/90 text-background shadow-[0_0_15px_hsl(var(--logo-green)/0.4)]"
                  title="WhatsApp"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </Button>
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
                    toast.success("Copied! Now paste in Instagram");
                    handleSocialShare("social");
                  }}
                  className="h-10 w-10 p-0 bg-logo-green hover:bg-logo-green/90 text-background shadow-[0_0_15px_hsl(var(--logo-green)/0.4)]"
                  title="Instagram"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.757-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                </Button>
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
                    toast.success("Copied! Now paste in Discord");
                    handleSocialShare("social");
                  }}
                  className="h-10 w-10 p-0 bg-logo-green hover:bg-logo-green/90 text-background shadow-[0_0_15px_hsl(var(--logo-green)/0.4)]"
                  title="Discord"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
                  </svg>
                </Button>
                <Button 
                  onClick={() => window.open(`https://bsky.app/intent/compose?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, '_blank')}
                  className="h-10 w-10 p-0 bg-logo-green hover:bg-logo-green/90 text-background shadow-[0_0_15px_hsl(var(--logo-green)/0.4)]"
                  title="Bluesky"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"/>
                  </svg>
                </Button>
                <Button 
                  onClick={async () => {
                    await navigator.clipboard.writeText(shareUrl);
                    toast.success("Link copied!");
                    handleSocialShare("social");
                  }}
                  className="h-10 w-10 p-0 bg-logo-green hover:bg-logo-green/90 text-background shadow-[0_0_15px_hsl(var(--logo-green)/0.4)]"
                  title="Copy Link"
                >
                  <Copy className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-[9px] text-muted-foreground text-center mb-4 font-mono">
                WhatsApp downloads sticker • Others copy link
              </p>

              {/* SECONDARY ROW - X and Telegram */}
              <div className="flex justify-center flex-wrap gap-1.5 mb-4">
                <Button 
                  variant="outline"
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')}
                  className="h-8 w-8 p-0"
                  title="X (Twitter)"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank')}
                  className="h-8 w-8 p-0"
                  title="Telegram"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </Button>
              </div>

              {/* Secondary actions */}
              <div className="flex flex-wrap gap-2 justify-center pt-3 border-t border-border/30">
                <Button variant="outline" size="sm" onClick={shareViaEmail} className="font-mono text-[10px] h-8">
                  <Mail className="w-3 h-3 mr-1" />
                  Email
                </Button>
                <Button size="sm" onClick={downloadDog} className="font-mono text-[10px] h-8 bg-logo-green hover:bg-logo-green/90 text-background">
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
