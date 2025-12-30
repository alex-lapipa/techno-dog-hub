import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import PageSEO from "@/components/PageSEO";
import { Link, useSearchParams } from "react-router-dom";
import { dogVariants } from "@/components/DogPack";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Share2, Download, Mail, ArrowLeft, Smartphone, Copy } from "lucide-react";
import { toast } from "sonner";
import HexagonLogo from "@/components/HexagonLogo";
import { SocialShareButtons } from "@/components/social/SocialShareButtons";
import { useActiveDoggyVariants, useLogDoggyAction } from "@/hooks/useDoggyData";
import { DoggyPageFooter, trackDoggyEvent, DoggyShareLeaderboard, recordShare } from "@/components/doggy";
import ParticleBackground from "@/components/ParticleBackground";
import { trackShareEvent, trackClickThrough } from "@/hooks/useShareTracking";
import DoggyEmbedCode from "@/components/DoggyEmbedCode";
import { getWhatsAppShareText } from "@/data/doggyWhatsAppMessages";

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
  
  // Mobile-safe platform detection
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop');
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        setPlatform('ios');
      } else if (/Android/.test(navigator.userAgent)) {
        setPlatform('android');
      }
    }
  }, []);

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
  // Read URL parameter for shared dog links
  const [searchParams] = useSearchParams();
  const sharedDogSlug = searchParams.get('dog');

  useEffect(() => {
    if (!initialDogSet && activeVariants.length > 0) {
      let initialIndex: number;
      
      // Check for shared dog in URL first
      if (sharedDogSlug) {
        const sharedIndex = activeVariants.findIndex(
          d => d.name.toLowerCase().replace(/\s+/g, '-') === sharedDogSlug.toLowerCase()
        );
        initialIndex = sharedIndex >= 0 ? sharedIndex : getInitialDogIndex(activeVariants);
        
        // Track click-through from shared link
        trackClickThrough();
      } else {
        initialIndex = getInitialDogIndex(activeVariants);
      }
      
      setCurrentDogIndex(initialIndex);
      setInitialDogSet(true);
      
      // Track visit and store last shown dog
      const visitCount = parseInt(localStorage.getItem('doggy_visit_count') || '0', 10);
      localStorage.setItem('doggy_visit_count', String(visitCount + 1));
      localStorage.setItem('doggy_last_shown', activeVariants[initialIndex]?.name || 'Happy');
    }
  }, [activeVariants, initialDogSet, sharedDogSlug]);

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
      }, 250);
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
    }, 250);
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
    
    // Share the specific dog the user selected
    const dogSlugForEmail = currentDog?.name?.toLowerCase().replace(/\s+/g, '-') || 'techno';
    const emailShareUrl = `https://techno.dog/doggies?dog=${dogSlugForEmail}`;
    const subject = encodeURIComponent(`I'm ${currentDog?.name || 'a Techno Dog'}! 🖤`);
    const body = encodeURIComponent(
      `🖤 I'm ${currentDog?.name || 'a Techno Dog'}!\n\n` +
      `Join the techno.dog pack — ${activeVariants.length}+ unique doggies for the underground.\n\n` +
      `Find yours:\n` +
      `${emailShareUrl}\n\n` +
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

  // Use state-based platform detection for mobile reliability
  const isIOS = platform === 'ios';
  const isAndroid = platform === 'android';

  // Download/share sticker-ready version for WhatsApp (512x512 WebP, no text, transparent)
  const downloadForWhatsApp = async () => {
    const svg = document.querySelector('#current-dog-display svg');
    if (!svg) {
      toast.error("Couldn't find the doggy!");
      return;
    }

    logAction.mutate({
      variantId: currentDbData?.id,
      variantName: currentDog?.name || "Unknown",
      actionType: "download_whatsapp_sticker",
    });
    trackDoggyEvent('main_page', 'download_whatsapp_sticker', undefined, currentDog?.name);

    toast.loading("Creating sticker...");
    
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
    
    img.onload = async () => {
      ctx!.clearRect(0, 0, 512, 512);
      ctx!.drawImage(img, 0, 0, 512, 512);
      
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/webp', 0.95);
      });
      
      if (!blob) {
        toast.dismiss();
        toast.error("Failed to create sticker");
        return;
      }
      
      const filename = `techno-${currentDog?.name.toLowerCase().replace(/\s+/g, '-')}-sticker.webp`;
      
      // iOS: Use share sheet for better UX
      if (isIOS && navigator.canShare) {
        try {
          const file = new File([blob], filename, { type: 'image/webp' });
          if (navigator.canShare({ files: [file] })) {
            toast.dismiss();
            await navigator.share({
              files: [file],
              title: `${currentDog?.name} Sticker`,
              text: "Save to Photos → Import to Sticker Maker → Add to WhatsApp",
            });
            toast.success("Sticker saved!", {
              description: "Now open Sticker Maker app → Import from Photos",
              duration: 6000,
            });
            return;
          }
        } catch (error) {
          if ((error as Error).name === 'AbortError') {
            toast.dismiss();
            return;
          }
          // Fall through to download
        }
      }
      
      // Android/Desktop: Direct download
      const link = document.createElement('a');
      link.download = filename;
      link.href = URL.createObjectURL(blob);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
      toast.dismiss();
      if (isAndroid) {
        toast.success("Sticker downloaded!", {
          description: "Open Sticker Maker → Import from Gallery → Add to WhatsApp",
          duration: 8000,
        });
      } else {
        toast.success("Sticker downloaded!", {
          description: "Transfer to phone → Use Sticker Maker app → Add to WhatsApp",
          duration: 6000,
        });
      }
    };
    
    img.onerror = () => {
      toast.dismiss();
      toast.error("Failed to generate sticker");
    };
    
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    img.src = URL.createObjectURL(svgBlob);
  };

  // Download full sticker pack - iOS uses share sheet, others download sequentially
  const downloadStickerPack = async () => {
    toast.loading("Creating your sticker pack... This may take a moment");
    trackDoggyEvent('main_page', 'download_sticker_pack', undefined, 'all');
    
    const stickers: { name: string; blob: Blob }[] = [];
    const maxStickers = isIOS ? 10 : Math.min(activeVariants.length, 30); // iOS: limit to 10 for share sheet
    
    // Generate stickers - use the static dogVariants to avoid DOM manipulation issues
    for (let i = 0; i < maxStickers; i++) {
      const dog = activeVariants[i];
      if (!dog) continue;
      
      try {
        // Find matching static variant
        const staticVariant = dogVariants.find(v => v.name.toLowerCase() === dog.name.toLowerCase());
        if (!staticVariant) continue;
        
        // Create SVG programmatically
        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('width', '512');
        svg.setAttribute('height', '512');
        svg.setAttribute('viewBox', '0 0 100 100');
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        
        // Render to temp container
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        document.body.appendChild(container);
        
        // Temporarily switch to render this dog
        const originalIndex = currentDogIndex;
        setCurrentDogIndex(i);
        await new Promise(resolve => setTimeout(resolve, 150));
        
        const currentSvg = document.querySelector('#current-dog-display svg');
        if (currentSvg) {
          const resolvedSvg = resolveCssVariables(currentSvg as SVGElement);
          resolvedSvg.querySelectorAll('text').forEach(t => t.remove());
          resolvedSvg.setAttribute('width', '512');
          resolvedSvg.setAttribute('height', '512');
          resolvedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
          
          const svgData = new XMLSerializer().serializeToString(resolvedSvg);
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          canvas.width = 512;
          canvas.height = 512;
          
          const blob = await new Promise<Blob | null>((resolve) => {
            img.onload = () => {
              ctx!.clearRect(0, 0, 512, 512);
              ctx!.drawImage(img, 0, 0, 512, 512);
              canvas.toBlob(resolve, 'image/webp', 0.9);
            };
            img.onerror = () => resolve(null);
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            img.src = URL.createObjectURL(svgBlob);
          });
          
          if (blob) {
            stickers.push({ 
              name: `techno-${dog.name.toLowerCase().replace(/\s+/g, '-')}.webp`,
              blob 
            });
          }
        }
        
        document.body.removeChild(container);
        setCurrentDogIndex(originalIndex);
      } catch (e) {
        console.error(`Failed to generate sticker for ${dog.name}`, e);
      }
    }
    
    if (stickers.length === 0) {
      toast.dismiss();
      toast.error("Failed to create sticker pack");
      return;
    }
    
    // iOS: Use Web Share API with multiple files
    if (isIOS && navigator.canShare) {
      try {
        const files = stickers.map(s => 
          new File([s.blob], s.name, { type: 'image/webp' })
        );
        
        if (navigator.canShare({ files })) {
          toast.dismiss();
          toast.success(`${stickers.length} stickers ready!`, {
            description: "Tap Share → Save to Photos → Then import to Sticker Maker",
            duration: 4000,
          });
          
          await navigator.share({
            files,
            title: "Techno Dog Sticker Pack",
            text: "Save these to Photos, then add to WhatsApp via Sticker Maker app!",
          });
          
          // Show post-share instructions
          setTimeout(() => {
            toast.info("Next steps for WhatsApp:", {
              description: "1. Open Sticker Maker app\n2. Create new pack\n3. Import from Photos\n4. Tap 'Add to WhatsApp'",
              duration: 12000,
            });
          }, 1000);
          return;
        }
      } catch (error) {
        // User cancelled or API not supported - fall through to download
        if ((error as Error).name === 'AbortError') {
          toast.dismiss();
          toast.info("Sharing cancelled");
          return;
        }
      }
    }
    
    // Android/Desktop: Download files sequentially
    toast.dismiss();
    toast.success(`Downloading ${stickers.length} stickers...`, {
      description: "Files will save one by one",
      duration: 3000,
    });
    
    for (let i = 0; i < stickers.length; i++) {
      const sticker = stickers[i];
      const link = document.createElement('a');
      link.download = sticker.name;
      link.href = URL.createObjectURL(sticker.blob);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
      // Small delay between downloads to prevent browser blocking
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    
    // Show final instructions
    setTimeout(() => {
      if (isAndroid) {
        toast.info("How to add stickers to WhatsApp:", {
          description: "1. Open 'Sticker Maker' from Play Store\n2. Create new pack → Add from Downloads\n3. Tap 'Add to WhatsApp'\n4. Open any chat → Sticker icon → Enjoy!",
          duration: 15000,
        });
      } else {
        toast.info("How to use on WhatsApp:", {
          description: "Transfer stickers to your phone, then use 'Sticker Maker' app to create a WhatsApp sticker pack",
          duration: 10000,
        });
      }
    }, 1000);
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
    // Legacy tracking
    logAction.mutate({
      variantId: currentDbData?.id,
      variantName: currentDog?.name || "Unknown",
      actionType: `share_${platform}`,
    });
    trackDoggyEvent('main_page', 'share', platform, currentDog?.name);
    
    // Enhanced share tracking with full metadata
    await trackShareEvent({
      doggyName: currentDog?.name || 'Unknown',
      doggySlug: currentDog?.name?.toLowerCase().replace(/\s+/g, '-'),
      variantId: currentDbData?.id,
      platform,
      shareUrl: `https://techno.dog/doggies?dog=${currentDog?.name?.toLowerCase().replace(/\s+/g, '-') || 'techno'}`,
    });
    
    // Record share for leaderboard
    await recordShare();
  };

  // Dynamic share URL with selected dog
  const dogSlug = currentDog?.name?.toLowerCase().replace(/\s+/g, '-') || 'techno';
  const shareUrl = `https://techno.dog/doggies?dog=${dogSlug}`;
  // Dynamic share message based on selected dog
  const dogName = currentDog?.name || 'Techno Dog';
  
  // Personalized WhatsApp message with unique quote per doggy
  const whatsAppShareText = getWhatsAppShareText(currentDog?.name || 'Techno');
  
  const shareText = `I'm ${dogName} 🖤 Join the techno.dog pack! Find your spirit doggy at`;
  const twitterShareText = `I'm ${dogName} 🖤 No NPCs allowed. Find your spirit doggy #Techno #TechnoDog`;
  const telegramShareText = `🖤 I'm ${dogName}!\n\nJoin the techno.dog pack and find your spirit doggy. 70+ unique doggies waiting for you.`;
  const discordShareText = `🖤 **I'm ${dogName}!**\n\nJoin the techno.dog pack — 70+ unique doggies for the underground. Find yours:`;
  const blueskyShareText = `🖤 I'm ${dogName}!\n\nJoin the techno.dog pack — 70+ unique doggies for the underground.\n\nFind yours ↓`;

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
        <title>{sharedDogSlug ? `I'm ${dogName}! | techno.dog` : 'Techno Doggies - Create & Share Your Pack | techno.dog'}</title>
        <meta name="description" content={sharedDogSlug ? `${dogName} from the techno.dog pack — ${activeVariants.length}+ unique doggies for the underground.` : 'Create and share your own pack of Techno Doggies! Fun, shareable dog characters for the techno community. Bark bark!'} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:title" content={sharedDogSlug ? `I'm ${dogName}! 🖤` : 'Techno Doggies - Create & Share Your Pack'} />
        <meta property="og:description" content={sharedDogSlug ? `Join the techno.dog pack — ${activeVariants.length}+ unique doggies for the underground. Find yours!` : 'Create and share your own pack of Techno Doggies! Fun, shareable dog characters for the techno community. Spread the barks!'} />
        <meta property="og:image" content="https://techno.dog/og-doggies.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={sharedDogSlug ? `${dogName} - Techno Dog` : 'Techno Dog - Happy dog face icon'} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={shareUrl} />
        <meta name="twitter:title" content={sharedDogSlug ? `I'm ${dogName}! 🖤` : 'Techno Doggies - Create & Share Your Pack'} />
        <meta name="twitter:description" content={sharedDogSlug ? `Join the techno.dog pack — ${activeVariants.length}+ unique doggies for the underground.` : 'Create and share your own pack of Techno Doggies! Fun, shareable dog characters for the techno community.'} />
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
              <svg className="w-4 h-4 text-logo-green animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
              </svg>
              <span className="font-mono text-[10px] uppercase tracking-widest text-logo-green">
                Woof woof!
              </span>
              <svg className="w-4 h-4 text-logo-green animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
              </svg>
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
                      className={`flex-shrink-0 cursor-pointer transition-all duration-500 ease-out hover:opacity-80 hover:scale-110 ${offset === -2 ? 'hidden sm:block' : ''}`}
                    >
                      <Dog className={`${scale} [&_svg]:!stroke-[2.5] [&_svg]:[shape-rendering:geometricPrecision]`} />
                    </div>
                  );
                })}
                
                {/* CENTER HERO DOG */}
                <div 
                  id="current-dog-display"
                  onClick={() => !isDogSelected && selectDog(currentDogIndex)}
                  className={`flex-shrink-0 flex flex-col items-center transition-all duration-500 ease-out cursor-pointer ${
                    isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                  } ${isDogSelected ? 'scale-105' : 'hover:scale-105'}`}
                >
                  {/* Subtle halo effect - reduced opacity for better visibility */}
                  <div className="relative">
                    <div className={`absolute inset-0 rounded-full blur-2xl transition-all ${isDogSelected ? 'bg-logo-green/15 scale-110' : 'bg-logo-green/8'}`} />
                    <DogComponent 
                      className="w-32 h-32 sm:w-44 sm:h-44 relative z-10 [&_svg]:!stroke-[3] [&_svg]:[shape-rendering:geometricPrecision]" 
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
                      className={`flex-shrink-0 cursor-pointer transition-all duration-500 ease-out hover:opacity-80 hover:scale-110 ${offset === 2 ? 'hidden sm:block' : ''}`}
                    >
                      <Dog className={`${scale} [&_svg]:!stroke-[2.5] [&_svg]:[shape-rendering:geometricPrecision]`} />
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
            
            {/* Share Actions - WhatsApp Focus */}
            <div className="transition-all duration-300">
              <div className="px-4 pb-4 pt-2 border-t border-logo-green/20">
                {/* WhatsApp Share - Primary Action */}
                <div className="flex flex-col gap-3 mb-4">
                  {/* Share as Image (Web Share API) - Primary for Mobile */}
                  <Button 
                    onClick={async () => {
                      const svg = document.querySelector('#current-dog-display svg');
                      if (!svg) {
                        toast.error("Couldn't find the doggy!");
                        return;
                      }

                      toast.loading("Preparing your doggy...");

                      try {
                        // Convert SVG to PNG blob for sharing
                        const resolvedSvg = resolveCssVariables(svg as SVGElement);
                        resolvedSvg.querySelectorAll('text').forEach(t => t.remove());
                        resolvedSvg.setAttribute('width', '512');
                        resolvedSvg.setAttribute('height', '512');
                        resolvedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                        
                        const svgData = new XMLSerializer().serializeToString(resolvedSvg);
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        const img = new Image();
                        
                        canvas.width = 512;
                        canvas.height = 512;

                        await new Promise<void>((resolve, reject) => {
                          img.onload = () => {
                            ctx!.clearRect(0, 0, 512, 512);
                            ctx!.drawImage(img, 0, 0, 512, 512);
                            resolve();
                          };
                          img.onerror = reject;
                          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                          img.src = URL.createObjectURL(svgBlob);
                        });

                        // Create PNG blob
                        const pngBlob = await new Promise<Blob | null>((resolve) => {
                          canvas.toBlob(resolve, 'image/png', 1.0);
                        });

                        if (!pngBlob) {
                          throw new Error("Failed to create image");
                        }

                        // Create file for sharing
                        const file = new File([pngBlob], `techno-${currentDog?.name?.toLowerCase().replace(/\s+/g, '-') || 'doggy'}.png`, { type: 'image/png' });

                        // Check if Web Share API with files is supported
                        if (navigator.canShare && navigator.canShare({ files: [file] })) {
                          await navigator.share({
                            files: [file],
                            title: `I'm ${currentDog?.name || 'a Techno Dog'}!`,
                            text: whatsAppShareText,
                          });
                          
                          toast.dismiss();
                          toast.success("Shared successfully!");
                          handleSocialShare("whatsapp_image");
                          await recordShare();
                        } else {
                          // Fallback for browsers that don't support file sharing
                          toast.dismiss();
                          
                          // Download the image first
                          const link = document.createElement('a');
                          link.download = `techno-${currentDog?.name?.toLowerCase().replace(/\s+/g, '-') || 'doggy'}.png`;
                          link.href = URL.createObjectURL(pngBlob);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          URL.revokeObjectURL(link.href);

                          toast.success("Image downloaded! Now share on WhatsApp", {
                            description: "Open WhatsApp → Attach → Gallery → Select image",
                            duration: 6000,
                          });
                          handleSocialShare("whatsapp_download");
                          await recordShare();
                        }
                      } catch (error) {
                        toast.dismiss();
                        if ((error as Error).name !== 'AbortError') {
                          // User cancelled - try text fallback with personalized message
                          window.open(`https://wa.me/?text=${encodeURIComponent(whatsAppShareText)}`, '_blank');
                          handleSocialShare("whatsapp_text");
                          await recordShare();
                        }
                      }
                    }}
                    className="w-full font-mono text-sm h-14 bg-[#25D366] hover:bg-[#25D366]/90 text-white shadow-lg shadow-[#25D366]/30"
                  >
                    <svg className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Share on WhatsApp
                  </Button>

                  {/* Individual Sticker Download */}
                  <Button 
                    variant="outline"
                    onClick={downloadForWhatsApp}
                    className="w-full font-mono text-xs h-10 border-[#25D366]/50 text-[#25D366] hover:bg-[#25D366]/10 hover:border-[#25D366]"
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    {isIOS ? "Save This Sticker (512x512)" : "Download This Sticker (512x512)"}
                  </Button>

                  {/* Full Pack Download */}
                  <Button 
                    variant="outline"
                    onClick={downloadStickerPack}
                    className="w-full font-mono text-xs h-10 border-logo-green/50 text-logo-green hover:bg-logo-green/10 hover:border-logo-green"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isIOS ? "Save Sticker Pack (10 Doggies)" : "Download Full Sticker Pack (30 Doggies)"}
                  </Button>
                </div>

                {/* Platform-specific instructions */}
                <div className="mt-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <p className="font-mono text-[10px] text-muted-foreground text-center mb-2">
                    <span className="text-logo-green font-bold">How to add stickers to WhatsApp:</span>
                  </p>
                  <ol className="font-mono text-[9px] text-muted-foreground space-y-1 list-decimal list-inside">
                    {isIOS ? (
                      <>
                        <li>Download "Sticker Maker" from App Store (free)</li>
                        <li>Create new pack → Import downloaded stickers</li>
                        <li>Tap "Add to WhatsApp"</li>
                        <li>Open any chat → Sticker icon → Your pack is ready!</li>
                      </>
                    ) : isAndroid ? (
                      <>
                        <li>Download "Sticker Maker" from Play Store (free)</li>
                        <li>Create new pack → Add from Gallery</li>
                        <li>Tap "Add to WhatsApp"</li>
                        <li>Open any chat → Sticker icon → Enjoy!</li>
                      </>
                    ) : (
                      <>
                        <li>Transfer stickers to your phone</li>
                        <li>Download "Sticker Maker" app</li>
                        <li>Create pack → Import stickers</li>
                        <li>Add to WhatsApp → Use in chats!</li>
                      </>
                    )}
                  </ol>
                </div>

                {/* Secondary Actions */}
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
                    onClick={deselectDog}
                    className="font-mono text-[10px] h-9 px-3 border-crimson/60 text-crimson bg-crimson/10 hover:bg-crimson/20 hover:text-crimson hover:border-crimson/80 hover:shadow-[0_0_12px_hsl(var(--crimson)/0.3)]"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    PICK ANOTHER
                  </Button>
                </div>

                {/* Hidden other platforms - TODO: re-enable when WhatsApp is verified */}
                {/* Instagram, X, Telegram, Discord, Bluesky, Copy buttons temporarily hidden */}
              </div>
            </div>
            
            {/* Tap hint when no dog selected */}
            {!isDogSelected && (
              <div className="text-center py-3 border-t border-logo-green/20">
                <p className="font-mono text-[10px] text-muted-foreground animate-pulse">
                  ↑ Tap any doggy above to share
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
                <svg className="w-4 h-4 text-logo-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="7" r="3"/>
                  <circle cx="15" cy="7" r="3"/>
                  <path d="M5.5 21c0-3.5 2-6 3.5-7M18.5 21c0-3.5-2-6-3.5-7" strokeLinecap="round"/>
                </svg>
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
                          <svg className="w-2 h-2 text-background" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 16.4 5.7 21l2.3-7-6-4.6h7.6z"/>
                          </svg>
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

          {/* 5. EMBED WIDGET - For developers & fans */}
          <div className="mb-8">
            <DoggyEmbedCode />
          </div>

          {/* 6. SHARE LEADERBOARD */}
          <div className="mb-8">
            <DoggyShareLeaderboard />
          </div>

        </main>
        
        {/* Sticky Mobile Action Bar - WhatsApp focused */}
        <div className="fixed bottom-0 left-0 right-0 z-50 p-2.5 bg-background/95 backdrop-blur-md border-t border-[#25D366]/40 sm:hidden">
          <div className="flex gap-2 max-w-lg mx-auto">
            {isDogSelected ? (
              <>
                <Button 
                  onClick={async () => {
                    const svg = document.querySelector('#current-dog-display svg');
                    if (!svg) {
                      toast.error("Couldn't find the doggy!");
                      return;
                    }

                    toast.loading("Sharing...");

                    try {
                      const resolvedSvg = resolveCssVariables(svg as SVGElement);
                      resolvedSvg.querySelectorAll('text').forEach(t => t.remove());
                      resolvedSvg.setAttribute('width', '512');
                      resolvedSvg.setAttribute('height', '512');
                      resolvedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                      
                      const svgData = new XMLSerializer().serializeToString(resolvedSvg);
                      const canvas = document.createElement('canvas');
                      const ctx = canvas.getContext('2d');
                      const img = new Image();
                      
                      canvas.width = 512;
                      canvas.height = 512;

                      await new Promise<void>((resolve, reject) => {
                        img.onload = () => {
                          ctx!.clearRect(0, 0, 512, 512);
                          ctx!.drawImage(img, 0, 0, 512, 512);
                          resolve();
                        };
                        img.onerror = reject;
                        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                        img.src = URL.createObjectURL(svgBlob);
                      });

                      const pngBlob = await new Promise<Blob | null>((resolve) => {
                        canvas.toBlob(resolve, 'image/png', 1.0);
                      });

                      if (!pngBlob) throw new Error("Failed to create image");

                      const file = new File([pngBlob], `techno-${currentDog?.name?.toLowerCase().replace(/\s+/g, '-') || 'doggy'}.png`, { type: 'image/png' });

                      if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        await navigator.share({
                          files: [file],
                          title: `I'm ${currentDog?.name || 'a Techno Dog'}!`,
                          text: `Join the techno.dog pack! ${shareUrl}`,
                        });
                        toast.dismiss();
                        toast.success("Shared!");
                        handleSocialShare("whatsapp_mobile");
                        await recordShare();
                      } else {
                        toast.dismiss();
                        window.open(`https://wa.me/?text=${encodeURIComponent(`I'm ${currentDog?.name || 'a Techno Dog'}! Join the pack: ${shareUrl}`)}`, '_blank');
                        handleSocialShare("whatsapp_text_mobile");
                        await recordShare();
                      }
                    } catch (error) {
                      toast.dismiss();
                      if ((error as Error).name !== 'AbortError') {
                        window.open(`https://wa.me/?text=${encodeURIComponent(`I'm ${currentDog?.name || 'a Techno Dog'}! Join the pack: ${shareUrl}`)}`, '_blank');
                        handleSocialShare("whatsapp_fallback");
                        await recordShare();
                      }
                    }
                  }}
                  className="flex-1 font-mono text-xs h-12 bg-[#25D366] hover:bg-[#25D366]/90 text-white shadow-lg shadow-[#25D366]/30"
                >
                  <svg className="h-5 w-5 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </Button>
                <Button 
                  onClick={downloadForWhatsApp}
                  className="font-mono text-xs h-12 px-4 bg-logo-green hover:bg-logo-green/90 text-background"
                >
                  <Smartphone className="w-4 h-4 mr-1" />
                  Sticker
                </Button>
                <Button 
                  variant="outline"
                  onClick={deselectDog}
                  className="font-mono text-xs h-12 px-3 border-logo-green/50"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => selectDog(currentDogIndex)}
                className="flex-1 font-mono text-xs h-12 bg-[#25D366] hover:bg-[#25D366]/90 text-white shadow-lg shadow-[#25D366]/30"
              >
                <svg className="h-5 w-5 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Pick & Share on WhatsApp
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
