import { useCallback, useRef } from 'react';

/**
 * Sticker Generator Hook
 * 
 * Optimized SVG-to-image conversion with:
 * - CSS variable resolution
 * - Canvas caching
 * - Blob URL management
 */

interface StickerOptions {
  size?: number;
  format?: 'webp' | 'png';
  quality?: number;
  removeText?: boolean;
}

interface GeneratedSticker {
  blob: Blob;
  dataUrl: string;
  filename: string;
}

// CSS variable resolution cache
const cssVarCache = new Map<string, string>();

/**
 * Resolve CSS variables to actual values
 */
const resolveCssVariable = (varName: string): string => {
  if (cssVarCache.has(varName)) {
    return cssVarCache.get(varName)!;
  }
  
  const computedStyle = getComputedStyle(document.documentElement);
  const value = computedStyle.getPropertyValue(varName).trim();
  cssVarCache.set(varName, value);
  return value;
};

/**
 * Resolve CSS variables in SVG element for proper export
 */
const resolveCssVariables = (svgElement: SVGElement): SVGElement => {
  const clone = svgElement.cloneNode(true) as SVGElement;
  
  // Get resolved colors
  const logoGreen = resolveCssVariable('--logo-green');
  const foreground = resolveCssVariable('--foreground');
  const background = resolveCssVariable('--background');
  
  const resolvedLogoGreen = logoGreen ? `hsl(${logoGreen})` : '#22c55e';
  const resolvedForeground = foreground ? `hsl(${foreground})` : '#ffffff';
  const resolvedBackground = background ? `hsl(${background})` : '#000000';
  
  // Replace all CSS variable references
  const serialized = new XMLSerializer().serializeToString(clone);
  const resolved = serialized
    .replace(/hsl\(var\(--logo-green\)\)/g, resolvedLogoGreen)
    .replace(/hsl\(var\(--foreground\)\)/g, resolvedForeground)
    .replace(/hsl\(var\(--background\)\)/g, resolvedBackground);
  
  // Parse back to SVG element
  const parser = new DOMParser();
  const doc = parser.parseFromString(resolved, 'image/svg+xml');
  return doc.documentElement as unknown as SVGElement;
};

/**
 * Convert SVG to image blob
 */
const svgToBlob = async (
  svgElement: SVGElement,
  options: StickerOptions = {}
): Promise<Blob | null> => {
  const { 
    size = 512, 
    format = 'webp', 
    quality = 0.95,
    removeText = true 
  } = options;
  
  return new Promise((resolve) => {
    const resolvedSvg = resolveCssVariables(svgElement);
    
    // Remove text elements for clean stickers
    if (removeText) {
      resolvedSvg.querySelectorAll('text').forEach(t => t.remove());
    }
    
    // Set dimensions
    resolvedSvg.setAttribute('width', String(size));
    resolvedSvg.setAttribute('height', String(size));
    resolvedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    
    const svgData = new XMLSerializer().serializeToString(resolvedSvg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    canvas.width = size;
    canvas.height = size;
    
    img.onload = () => {
      ctx!.clearRect(0, 0, size, size);
      ctx!.drawImage(img, 0, 0, size, size);
      
      const mimeType = format === 'webp' ? 'image/webp' : 'image/png';
      canvas.toBlob((blob) => resolve(blob), mimeType, quality);
    };
    
    img.onerror = () => resolve(null);
    
    // Use blob URL for better Unicode support
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    img.src = URL.createObjectURL(svgBlob);
  });
};

/**
 * Hook for generating stickers from SVG elements
 */
export const useStickerGenerator = () => {
  // Track blob URLs for cleanup
  const blobUrlsRef = useRef<string[]>([]);
  
  /**
   * Generate a sticker from the current dog SVG
   */
  const generateSticker = useCallback(async (
    svgElement: SVGElement | null,
    dogName: string,
    options: StickerOptions = {}
  ): Promise<GeneratedSticker | null> => {
    if (!svgElement) return null;
    
    const { format = 'webp' } = options;
    const blob = await svgToBlob(svgElement, options);
    
    if (!blob) return null;
    
    const filename = `techno-${dogName.toLowerCase().replace(/\s+/g, '-')}-sticker.${format}`;
    const dataUrl = URL.createObjectURL(blob);
    
    // Track for cleanup
    blobUrlsRef.current.push(dataUrl);
    
    return { blob, dataUrl, filename };
  }, []);
  
  /**
   * Generate multiple stickers (for pack download)
   */
  const generateStickerPack = useCallback(async (
    getSvgElement: (index: number) => Promise<SVGElement | null>,
    dogNames: string[],
    options: StickerOptions = {}
  ): Promise<GeneratedSticker[]> => {
    const stickers: GeneratedSticker[] = [];
    
    for (let i = 0; i < dogNames.length; i++) {
      const svg = await getSvgElement(i);
      if (svg) {
        const sticker = await generateSticker(svg, dogNames[i], options);
        if (sticker) {
          stickers.push(sticker);
        }
      }
    }
    
    return stickers;
  }, [generateSticker]);
  
  /**
   * Download a sticker blob
   */
  const downloadSticker = useCallback((sticker: GeneratedSticker) => {
    const link = document.createElement('a');
    link.download = sticker.filename;
    link.href = sticker.dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);
  
  /**
   * Share sticker via Web Share API (mobile)
   */
  const shareSticker = useCallback(async (
    sticker: GeneratedSticker,
    shareText?: string
  ): Promise<boolean> => {
    if (!navigator.canShare) return false;
    
    try {
      const file = new File([sticker.blob], sticker.filename, { type: sticker.blob.type });
      
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: sticker.filename.replace(/\.[^.]+$/, ''),
          text: shareText,
        });
        return true;
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return false;
      }
      console.error('Share failed:', error);
    }
    
    return false;
  }, []);
  
  /**
   * Cleanup blob URLs
   */
  const cleanup = useCallback(() => {
    blobUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    blobUrlsRef.current = [];
  }, []);
  
  /**
   * Get SVG element from DOM
   */
  const getSvgFromDom = useCallback((selector: string = '#current-dog-display svg'): SVGElement | null => {
    return document.querySelector(selector) as SVGElement | null;
  }, []);
  
  return {
    generateSticker,
    generateStickerPack,
    downloadSticker,
    shareSticker,
    cleanup,
    getSvgFromDom,
    resolveCssVariables,
  };
};

export default useStickerGenerator;
