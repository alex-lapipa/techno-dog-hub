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
  const [isDogSelected, setIsDogSelected] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  // Get the active variants from DB, fallback to static if loading
  // Deduplicate by name to avoid showing same dog twice
  const activeVariants = (() => {
    const variants = dbVariants?.map(dbDog => {
      const match = dogVariants.find(d => d.name.toLowerCase() === dbDog.name.toLowerCase());
      return match ? { ...match, dbData: dbDog } : null;
    }).filter(Boolean) || dogVariants;
    
    // Remove duplicates by name
    const seen = new Set<string>();
    return variants.filter(v => {
      const name = v?.name?.toLowerCase();
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });
  })();

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

  // Auto-cycle through dogs every 5 seconds (stops when selected)
  useEffect(() => {
    if (isCarouselPaused || isDogSelected) return;
    
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentDogIndex((prev) => (prev + 1) % activeVariants.length);
        setIsAnimating(false);
      }, 150);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isCarouselPaused, isDogSelected, activeVariants.length]);

  // Select a dog and stop auto-rotation
  const selectDog = (index: number) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentDogIndex(index);
      setIsDogSelected(true);
      setIsAnimating(false);
      
      const selectedDog = activeVariants[index];
      if (selectedDog) {
        logAction.mutate({
          variantId: (selectedDog as any)?.dbData?.id,
          variantName: selectedDog.name,
          actionType: "select",
        });
        trackDoggyEvent('main_page', 'select', undefined, selectedDog.name);
      }
      
      // Scroll to share section
      setTimeout(() => {
        document.getElementById('share-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }, 150);
  };

  // Deselect and resume auto-rotation
  const deselectDog = () => {
    setIsDogSelected(false);
  };

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

  // Resolve CSS variables in SVG for proper export
  const resolveCssVariables = (svgElement: SVGElement): SVGElement => {
    const clone = svgElement.cloneNode(true) as SVGElement;
    const computedStyle = getComputedStyle(document.documentElement);
    
    // Get the actual color value for --logo-green
    const logoGreen = computedStyle.getPropertyValue('--logo-green').trim();
    const resolvedColor = logoGreen ? `hsl(${logoGreen})` : '#22c55e';
    
    // Replace all instances of hsl(var(--logo-green)) with the actual color
    const serialized = new XMLSerializer().serializeToString(clone);
    const resolved = serialized
      .replace(/hsl\(var\(--logo-green\)\)/g, resolvedColor)
      .replace(/hsl\(var\(--foreground\)\)/g, computedStyle.getPropertyValue('--foreground').trim() ? `hsl(${computedStyle.getPropertyValue('--foreground').trim()})` : '#ffffff')
      .replace(/hsl\(var\(--background\)\)/g, computedStyle.getPropertyValue('--background').trim() ? `hsl(${computedStyle.getPropertyValue('--background').trim()})` : '#000000');
    
    // Parse back to SVG element
    const parser = new DOMParser();
    const doc = parser.parseFromString(resolved, 'image/svg+xml');
    return doc.documentElement as unknown as SVGElement;
  };

  // Generate a proper base64 PNG from SVG
  const generateDoggyImage = async (): Promise<string | null> => {
    const svg = document.querySelector('#current-dog-display svg');
    if (!svg) return null;

    return new Promise((resolve) => {
      const resolvedSvg = resolveCssVariables(svg as SVGElement);
      resolvedSvg.setAttribute('width', '512');
      resolvedSvg.setAttribute('height', '512');
      resolvedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      
      const svgData = new XMLSerializer().serializeToString(resolvedSvg);
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

    // Clone, resolve CSS variables, and clean the SVG
    const resolvedSvg = resolveCssVariables(svg as SVGElement);
    resolvedSvg.querySelectorAll('text').forEach(t => t.remove());
    resolvedSvg.setAttribute('width', '512');
    resolvedSvg.setAttribute('height', '512');
    resolvedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    
    const svgData = new XMLSerializer().serializeToString(resolvedSvg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
    
    const link = document.createElement('a');
    link.download = `techno-${currentDog?.name.toLowerCase().replace(/\s+/g, '-')}.svg`;
    link.href = URL.createObjectURL(svgBlob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    
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
    
    // Clone SVG, resolve CSS variables, and remove text elements for clean sticker
    const resolvedSvg = resolveCssVariables(svg as SVGElement);
    resolvedSvg.querySelectorAll('text').forEach(t => t.remove());
    resolvedSvg.setAttribute('width', '512');
    resolvedSvg.setAttribute('height', '512');
    resolvedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    
    const svgData = new XMLSerializer().serializeToString(resolvedSvg);
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
          URL.revokeObjectURL(link.href);
          
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
        // Use CSS variable resolution for proper export with transparency
        const resolvedSvg = resolveCssVariables(currentSvg as SVGElement);
        resolvedSvg.setAttribute('width', '512');
        resolvedSvg.setAttribute('height', '512');
        resolvedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        
        const svgData = new XMLSerializer().serializeToString(resolvedSvg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        canvas.width = 512;
        canvas.height = 512;
        
        await new Promise<void>((resolve) => {
          img.onload = () => {
            // Clear for transparent background
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
  // Share message for social platforms
  const shareText = "Join the techno.dog community! Create your own pack of doggies at";

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
          <div className="text-center mb-6">
            <div className="flex justify-center gap-1 mb-2">
              <Sparkles className="w-4 h-4 text-logo-green animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-logo-green">
                Woof woof!
              </span>
              <Sparkles className="w-4 h-4 text-logo-green animate-pulse" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground font-mono mb-1">
              techno.dog
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              {activeVariants.length} unique doggies. Infinite barks. Zero NPCs.
            </p>
          </div>

          {/* 2. UNIFIED FOCUS CAROUSEL - Hero + Selector + Share in one */}
          <div 
            id="share-section" 
            className="mb-8 rounded-2xl bg-gradient-to-br from-logo-green/15 via-logo-green/5 to-transparent border border-logo-green/30 overflow-hidden"
          >
            {/* Focus Carousel - Center dog is hero, sides are smaller */}
            <div 
              ref={carouselRef}
              onMouseEnter={() => setIsCarouselPaused(true)}
              onMouseLeave={() => !isDogSelected && setIsCarouselPaused(false)}
              onTouchStart={() => setIsCarouselPaused(true)}
              onTouchEnd={() => !isDogSelected && setTimeout(() => setIsCarouselPaused(false), 3000)}
              className="relative py-6 px-4"
            >
              {/* Carousel Container */}
              <div className="flex items-center justify-center gap-2 sm:gap-4 overflow-hidden">
                {/* Previous Dogs (smaller) */}
                {[-2, -1].map((offset) => {
                  const index = (currentDogIndex + offset + activeVariants.length) % activeVariants.length;
                  const dog = activeVariants[index];
                  if (!dog) return null;
                  const Dog = dog.Component;
                  const scale = offset === -1 ? 'w-16 h-16 sm:w-20 sm:h-20 opacity-60' : 'w-10 h-10 sm:w-14 sm:h-14 opacity-30 hidden sm:block';
                  
                  return (
                    <div
                      key={`prev-${offset}`}
                      onClick={() => selectDog(index)}
                      className={`flex-shrink-0 cursor-pointer transition-all duration-300 hover:opacity-80 hover:scale-110 ${offset === -2 ? 'hidden sm:block' : ''}`}
                    >
                      <Dog className={scale} />
                    </div>
                  );
                })}
                
                {/* CENTER HERO DOG */}
                <div 
                  id="current-dog-display"
                  onClick={() => !isDogSelected && selectDog(currentDogIndex)}
                  className={`flex-shrink-0 flex flex-col items-center transition-all duration-300 cursor-pointer ${
                    isAnimating ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
                  } ${isDogSelected ? 'scale-105' : 'hover:scale-105'}`}
                >
                  {/* Subtle halo effect - reduced opacity for better visibility */}
                  <div className="relative">
                    <div className={`absolute inset-0 rounded-full blur-2xl transition-all ${isDogSelected ? 'bg-logo-green/15 scale-110' : 'bg-logo-green/8'}`} />
                    <DogComponent 
                      className="w-32 h-32 sm:w-44 sm:h-44 relative z-10" 
                      animated 
                    />
                  </div>
                  
                  {/* Dog info */}
                  <h2 className="mt-3 text-xl sm:text-2xl font-bold text-foreground font-mono text-center">
                    {currentDog?.name === 'Techno' ? 'Techno Dog' : `${currentDog?.name}`}
                  </h2>
                  <p className="text-[10px] sm:text-xs text-muted-foreground text-center font-mono px-2 max-w-[200px]">
                    "{currentDbData?.personality || currentDog?.personality}"
                  </p>
                  
                  {/* Status badge */}
                  {isDogSelected && (
                    <span className="mt-2 px-3 py-1 text-[9px] uppercase tracking-wider rounded-full bg-logo-green text-background font-mono">
                      Selected • Share below!
                    </span>
                  )}
                </div>
                
                {/* Next Dogs (smaller) */}
                {[1, 2].map((offset) => {
                  const index = (currentDogIndex + offset) % activeVariants.length;
                  const dog = activeVariants[index];
                  if (!dog) return null;
                  const Dog = dog.Component;
                  const scale = offset === 1 ? 'w-16 h-16 sm:w-20 sm:h-20 opacity-60' : 'w-10 h-10 sm:w-14 sm:h-14 opacity-30 hidden sm:block';
                  
                  return (
                    <div
                      key={`next-${offset}`}
                      onClick={() => selectDog(index)}
                      className={`flex-shrink-0 cursor-pointer transition-all duration-300 hover:opacity-80 hover:scale-110 ${offset === 2 ? 'hidden sm:block' : ''}`}
                    >
                      <Dog className={scale} />
                    </div>
                  );
                })}
              </div>
              
              {/* Navigation Arrows */}
              <div className="absolute inset-y-0 left-2 flex items-center">
                <button 
                  onClick={(e) => { e.stopPropagation(); const newIndex = (currentDogIndex - 1 + activeVariants.length) % activeVariants.length; selectDog(newIndex); }}
                  className="w-8 h-8 rounded-full bg-background/80 border border-logo-green/30 flex items-center justify-center hover:bg-logo-green/20 transition-colors"
                >
                  <svg className="w-4 h-4 text-logo-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
              </div>
              <div className="absolute inset-y-0 right-2 flex items-center">
                <button 
                  onClick={(e) => { e.stopPropagation(); nextDog(); }}
                  className="w-8 h-8 rounded-full bg-background/80 border border-logo-green/30 flex items-center justify-center hover:bg-logo-green/20 transition-colors"
                >
                  <svg className="w-4 h-4 text-logo-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
              
              {/* Swipe hint */}
              {!isDogSelected && (
                <p className="text-center mt-3 text-[10px] text-muted-foreground font-mono animate-pulse">
                  ← Swipe or tap arrows • Tap center to select →
                </p>
              )}
            </div>
            
            {/* Share Actions - appears when dog is selected */}
            <div className={`transition-all duration-300 overflow-hidden ${isDogSelected ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="px-4 pb-4 pt-2 border-t border-logo-green/20">
                {/* Primary Share Row */}
                <div className="grid grid-cols-7 gap-1.5 mb-3">
                  <button 
                    onClick={() => {
                      window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, '_blank');
                      handleSocialShare("whatsapp");
                    }}
                    className="flex flex-col items-center p-2 rounded-lg hover:bg-logo-green/20 transition-colors group"
                    title="Share on WhatsApp"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center group-hover:bg-[#25D366] transition-colors">
                      <svg className="h-5 w-5 text-[#25D366] group-hover:text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <span className="text-[8px] text-muted-foreground mt-1 font-mono">WhatsApp</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
                      toast.success("Copied! Now paste in Instagram", {
                        description: "Open Instagram → Create Story or DM → Paste",
                        duration: 4000,
                      });
                      handleSocialShare("instagram");
                    }}
                    className="flex flex-col items-center p-2 rounded-lg hover:bg-logo-green/20 transition-colors group"
                    title="Instagram"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-400/20 flex items-center justify-center group-hover:from-purple-500 group-hover:via-pink-500 group-hover:to-orange-400 transition-colors">
                      <svg className="h-5 w-5 text-pink-500 group-hover:text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.757-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                      </svg>
                    </div>
                    <span className="text-[8px] text-muted-foreground mt-1 font-mono">Insta</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
                      handleSocialShare("twitter");
                    }}
                    className="flex flex-col items-center p-2 rounded-lg hover:bg-logo-green/20 transition-colors group"
                    title="X/Twitter"
                  >
                    <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center group-hover:bg-foreground transition-colors">
                      <svg className="h-5 w-5 text-foreground group-hover:text-background" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </div>
                    <span className="text-[8px] text-muted-foreground mt-1 font-mono">X</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
                      handleSocialShare("telegram");
                    }}
                    className="flex flex-col items-center p-2 rounded-lg hover:bg-logo-green/20 transition-colors group"
                    title="Telegram"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#0088cc]/20 flex items-center justify-center group-hover:bg-[#0088cc] transition-colors">
                      <svg className="h-5 w-5 text-[#0088cc] group-hover:text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                    </div>
                    <span className="text-[8px] text-muted-foreground mt-1 font-mono">Tele</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
                      toast.success("Link copied!");
                      handleSocialShare("discord");
                    }}
                    className="flex flex-col items-center p-2 rounded-lg hover:bg-logo-green/20 transition-colors group"
                    title="Discord"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#5865F2]/20 flex items-center justify-center group-hover:bg-[#5865F2] transition-colors">
                      <svg className="h-5 w-5 text-[#5865F2] group-hover:text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
                      </svg>
                    </div>
                    <span className="text-[8px] text-muted-foreground mt-1 font-mono">Discord</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      window.open(`https://bsky.app/intent/compose?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, '_blank');
                      handleSocialShare("bluesky");
                    }}
                    className="flex flex-col items-center p-2 rounded-lg hover:bg-logo-green/20 transition-colors group"
                    title="Bluesky"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#0085ff]/20 flex items-center justify-center group-hover:bg-[#0085ff] transition-colors">
                      <svg className="h-5 w-5 text-[#0085ff] group-hover:text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"/>
                      </svg>
                    </div>
                    <span className="text-[8px] text-muted-foreground mt-1 font-mono">Bsky</span>
                  </button>
                  
                  <button 
                    onClick={async () => {
                      await navigator.clipboard.writeText(shareUrl);
                      toast.success("Link copied!");
                      handleSocialShare("copy");
                    }}
                    className="flex flex-col items-center p-2 rounded-lg hover:bg-logo-green/20 transition-colors group"
                    title="Copy Link"
                  >
                    <div className="w-10 h-10 rounded-full bg-logo-green/20 flex items-center justify-center group-hover:bg-logo-green transition-colors">
                      <Copy className="h-5 w-5 text-logo-green group-hover:text-background" />
                    </div>
                    <span className="text-[8px] text-muted-foreground mt-1 font-mono">Copy</span>
                  </button>
                </div>
                
                {/* Download Actions */}
                <div className="flex gap-2 justify-center">
                  <Button 
                    size="sm" 
                    onClick={downloadDog} 
                    className="font-mono text-[10px] h-9 px-4 bg-logo-green hover:bg-logo-green/90 text-background"
                  >
                    <Download className="w-3 h-3 mr-1.5" />
                    Download PNG
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={shareViaEmail} 
                    className="font-mono text-[10px] h-9 px-4 border-logo-green/50"
                  >
                    <Mail className="w-3 h-3 mr-1.5" />
                    Email
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={deselectDog}
                    className="font-mono text-[10px] h-9 px-3 border-crimson/60 text-crimson bg-crimson/10 hover:bg-crimson/20 hover:text-crimson hover:border-crimson/80 hover:shadow-[0_0_12px_hsl(var(--crimson)/0.3)]"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    PICK ANOTHER
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Tap hint when no dog selected */}
            {!isDogSelected && (
              <div className="text-center py-3 border-t border-logo-green/20">
                <p className="font-mono text-[10px] text-muted-foreground animate-pulse">
                  👆 Tap any doggy above to share
                </p>
              </div>
            )}
            
            {/* Quote */}
            <div className="text-center py-3 px-4 bg-logo-green/5">
              <p className="font-mono text-[10px] text-muted-foreground italic">
                "Life's too short for NPCs :: Become a techno dog."
              </p>
            </div>
          </div>

          {/* 4. THE FULL PACK - Impressive showcase grid */}
          <div className="mb-8">
            {/* Header with count */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-logo-green/10 border border-logo-green/30 mb-3">
                <Users className="w-4 h-4 text-logo-green" />
                <span className="font-mono text-sm font-bold text-logo-green">{activeVariants.length} Doggies</span>
              </div>
              <h3 className="font-mono text-xl font-bold text-foreground mb-1">The Full Pack</h3>
              <p className="font-mono text-xs text-muted-foreground">Tap any doggy to adopt & share</p>
            </div>
            
            {/* Impressive grid with staggered animation */}
            <div className="relative rounded-2xl bg-gradient-to-br from-logo-green/10 via-background to-logo-green/5 border border-logo-green/20 p-5 sm:p-6 overflow-hidden">
              {/* Decorative corner elements */}
              <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-logo-green/20 to-transparent rounded-br-full" />
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-logo-green/20 to-transparent rounded-tl-full" />
              
              {/* Grid - mobile-first with larger icons (4 cols mobile, 6 tablet, 8 desktop) */}
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 sm:gap-4 relative z-10">
                {activeVariants.map((dog: any, index: number) => {
                  const Dog = dog.Component;
                  const isActive = currentDogIndex === index;
                  const isFeatured = dog.dbData?.is_featured;
                  
                  return (
                    <div
                      key={`grid-${dog.name}`}
                      onClick={() => selectDog(index)}
                      style={{ 
                        animationDelay: `${index * 15}ms`,
                        opacity: 0,
                        animation: 'fade-in 0.3s ease-out forwards'
                      }}
                      className={`aspect-square rounded-xl p-1.5 cursor-pointer transition-all duration-200 group relative ${
                        isActive 
                          ? 'bg-logo-green/40 ring-2 ring-logo-green scale-110 z-20 shadow-[0_0_15px_hsl(var(--logo-green)/0.5)]' 
                          : isFeatured
                            ? 'bg-logo-green/20 hover:bg-logo-green/30 hover:scale-110'
                            : 'bg-background/50 hover:bg-logo-green/20 hover:scale-110 hover:z-10'
                      }`}
                    >
                      <Dog className="w-full h-full transition-transform group-hover:scale-105" />
                      
                      {/* Tooltip on hover */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-background/95 border border-logo-green/30 rounded text-[9px] font-mono text-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
                        {dog.name}
                      </div>
                      
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-logo-green animate-pulse" />
                      )}
                      
                      {/* Featured star */}
                      {isFeatured && !isActive && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-logo-green flex items-center justify-center">
                          <Star className="w-2 h-2 text-background" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Bottom stats */}
              <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-logo-green/20">
                <div className="text-center">
                  <div className="font-mono text-lg font-bold text-logo-green">{activeVariants.length}</div>
                  <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">Total Pack</div>
                </div>
                <div className="text-center">
                  <div className="font-mono text-lg font-bold text-foreground">∞</div>
                  <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">Barks</div>
                </div>
                <div className="text-center">
                  <div className="font-mono text-lg font-bold text-logo-green">0</div>
                  <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">NPCs</div>
                </div>
              </div>
            </div>
            
            {/* Quote */}
            <p className="text-center mt-4 font-mono text-[10px] text-muted-foreground italic">
              "Life's too short for NPCs :: Become a techno dog."
            </p>
          </div>

          {/* 5. SHARE LEADERBOARD */}
          <div className="mb-8">
            <DoggyShareLeaderboard />
          </div>

        </main>
        
        {/* Sticky Mobile Action Bar - simplified */}
        <div className="fixed bottom-0 left-0 right-0 z-50 p-2.5 bg-background/95 backdrop-blur-md border-t border-logo-green/30 sm:hidden">
          <div className="flex gap-2 max-w-lg mx-auto">
            {isDogSelected ? (
              <>
                <Button 
                  onClick={downloadForWhatsApp}
                  className="flex-1 font-mono text-xs h-10 bg-[#25D366] hover:bg-[#25D366]/90 text-white"
                >
                  <Smartphone className="w-4 h-4 mr-1.5" />
                  Sticker
                </Button>
                <Button 
                  onClick={downloadDog}
                  className="flex-1 font-mono text-xs h-10 bg-logo-green hover:bg-logo-green/90 text-background"
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  PNG
                </Button>
                <Button 
                  variant="outline"
                  onClick={deselectDog}
                  className="font-mono text-xs h-10 px-3 border-logo-green/50"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => {
                  const shareSection = document.getElementById('share-section');
                  shareSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex-1 font-mono text-xs h-10 bg-logo-green hover:bg-logo-green/90 text-background"
              >
                <Share2 className="w-4 h-4 mr-1.5" />
                Pick & Share a Doggy
              </Button>
            )}
          </div>
        </div>
        
        {/* Spacer for sticky bar on mobile */}
        <div className="h-16 sm:hidden" />
        
        {/* Doggy Footer with copyright and site links */}
        <DoggyPageFooter pageSource="main_page" currentDoggyName={currentDog?.name} />
      </div>
    </>
  );
};

export default TechnoDoggies;
