import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseDoggyInstallOptions {
  onSuccess?: (type: 'single' | 'pack') => void;
  onError?: (error: Error) => void;
}

// Resolve CSS variables in SVG for proper export
const resolveCssVariables = (svgElement: SVGElement): SVGElement => {
  const clone = svgElement.cloneNode(true) as SVGElement;
  const computedStyle = getComputedStyle(document.documentElement);
  
  const logoGreen = computedStyle.getPropertyValue('--logo-green').trim();
  const resolvedColor = logoGreen ? `hsl(${logoGreen})` : '#22c55e';
  
  const serialized = new XMLSerializer().serializeToString(clone);
  const resolved = serialized
    .replace(/hsl\(var\(--logo-green\)\)/g, resolvedColor)
    .replace(/hsl\(var\(--foreground\)\)/g, computedStyle.getPropertyValue('--foreground').trim() ? `hsl(${computedStyle.getPropertyValue('--foreground').trim()})` : '#ffffff')
    .replace(/hsl\(var\(--background\)\)/g, computedStyle.getPropertyValue('--background').trim() ? `hsl(${computedStyle.getPropertyValue('--background').trim()})` : '#000000');
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(resolved, 'image/svg+xml');
  return doc.documentElement as unknown as SVGElement;
};

// Generate PNG blob from SVG element
export const generatePngBlob = async (
  svgSelector: string,
  size: number = 512
): Promise<Blob | null> => {
  const svg = document.querySelector(svgSelector) as SVGElement | null;
  if (!svg) return null;

  return new Promise((resolve) => {
    const resolvedSvg = resolveCssVariables(svg);
    resolvedSvg.querySelectorAll('text').forEach(t => t.remove());
    resolvedSvg.setAttribute('width', String(size));
    resolvedSvg.setAttribute('height', String(size));
    resolvedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    
    const svgData = new XMLSerializer().serializeToString(resolvedSvg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    canvas.width = size;
    canvas.height = size;
    
    img.onload = async () => {
      ctx!.clearRect(0, 0, size, size);
      ctx!.drawImage(img, 0, 0, size, size);
      canvas.toBlob(resolve, 'image/webp', 0.95);
    };
    
    img.onerror = () => resolve(null);
    
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    img.src = URL.createObjectURL(svgBlob);
  });
};

// Generate SVG string with resolved CSS variables
export const generateSvgString = (svgSelector: string): string | null => {
  const svg = document.querySelector(svgSelector) as SVGElement | null;
  if (!svg) return null;

  const resolvedSvg = resolveCssVariables(svg);
  resolvedSvg.querySelectorAll('text').forEach(t => t.remove());
  resolvedSvg.setAttribute('width', '512');
  resolvedSvg.setAttribute('height', '512');
  resolvedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  
  return new XMLSerializer().serializeToString(resolvedSvg);
};

export function useDoggyInstall(options: UseDoggyInstallOptions = {}) {
  const [isInstalling, setIsInstalling] = useState(false);
  const [progress, setProgress] = useState(0);

  // Detect platform
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = typeof navigator !== 'undefined' && /Android/.test(navigator.userAgent);
  const isMobile = isIOS || isAndroid;

  // Download single sticker
  const downloadSingleSticker = useCallback(async (
    dogName: string,
    svgSelector: string = '#current-dog-display svg'
  ) => {
    setIsInstalling(true);
    toast.loading("Creating sticker...");

    try {
      const blob = await generatePngBlob(svgSelector);
      if (!blob) throw new Error("Failed to generate sticker");

      const filename = `techno-${dogName.toLowerCase().replace(/\s+/g, '-')}-sticker.webp`;

      // iOS: Use share sheet
      if (isIOS && navigator.canShare) {
        const file = new File([blob], filename, { type: 'image/webp' });
        if (navigator.canShare({ files: [file] })) {
          toast.dismiss();
          await navigator.share({
            files: [file],
            title: `${dogName} Sticker`,
            text: "Save to Photos → Import to Sticker Maker → Add to WhatsApp",
          });
          toast.success("Sticker saved!", {
            description: "Now open Sticker Maker app → Import from Photos",
            duration: 6000,
          });
          options.onSuccess?.('single');
          return;
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
      toast.success("Sticker downloaded!", {
        description: isAndroid 
          ? "Open Sticker Maker → Import from Gallery → Add to WhatsApp"
          : "Transfer to phone → Use Sticker Maker app → Add to WhatsApp",
        duration: 8000,
      });
      options.onSuccess?.('single');

    } catch (error) {
      toast.dismiss();
      if ((error as Error).name !== 'AbortError') {
        toast.error("Failed to create sticker");
        options.onError?.(error as Error);
      }
    } finally {
      setIsInstalling(false);
    }
  }, [isIOS, isAndroid, options]);

  // Share sticker via Web Share API with image
  const shareWithImage = useCallback(async (
    dogName: string,
    shareText: string,
    svgSelector: string = '#current-dog-display svg'
  ): Promise<boolean> => {
    if (!isMobile || !navigator.canShare) return false;

    try {
      const blob = await generatePngBlob(svgSelector);
      if (!blob) return false;

      const file = new File(
        [blob], 
        `techno-${dogName.toLowerCase().replace(/\s+/g, '-')}.png`, 
        { type: 'image/png' }
      );

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${dogName}`,
          text: shareText,
        });
        return true;
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return false;
      console.log("Web Share with image failed", error);
    }
    return false;
  }, [isMobile]);

  return {
    isInstalling,
    progress,
    isIOS,
    isAndroid,
    isMobile,
    downloadSingleSticker,
    shareWithImage,
    generatePngBlob,
    generateSvgString,
  };
}

export default useDoggyInstall;
