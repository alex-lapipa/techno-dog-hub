import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { useWhatsAppMessage } from './useWhatsAppMessage';
import { trackDoggyEvent, recordShare } from '@/components/doggy';
import { trackShareEvent } from '@/hooks/useShareTracking';

type Platform = 'ios' | 'android' | 'desktop';
type SharePlatform = 'whatsapp' | 'email' | 'twitter' | 'telegram' | 'discord' | 'bluesky' | 'copy';

interface UseDoggyShareOptions {
  dogName: string;
  dogSlug?: string;
  variantId?: string;
  onShare?: (platform: SharePlatform) => void;
}

interface ShareResult {
  success: boolean;
  platform: SharePlatform;
}

interface UseDoggyShareResult {
  // Platform detection
  platform: Platform;
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  
  // Share URLs
  shareUrl: string;
  
  // Message data (from useWhatsAppMessage)
  hashtag: string;
  quirkyText: string;
  whatsAppShareText: string;
  
  // Share actions
  shareViaWhatsApp: (customText?: string) => Promise<ShareResult>;
  shareViaWhatsAppWithImage: (imageBlob: Blob) => Promise<ShareResult>;
  shareViaEmail: () => Promise<ShareResult>;
  shareViaCopy: () => Promise<ShareResult>;
  
  // Utility
  buildCustomShareText: (options: { includeQuirky?: boolean; customMessage?: string }) => string;
}

/**
 * Centralized hook for Techno Doggy sharing functionality
 * 
 * Features:
 * - Platform detection (memoized)
 * - WhatsApp message generation (via useWhatsAppMessage)
 * - Share tracking
 * - Mobile-first optimizations
 */
export const useDoggyShare = ({
  dogName,
  dogSlug,
  variantId,
  onShare,
}: UseDoggyShareOptions): UseDoggyShareResult => {
  // Platform detection (memoized, runs once)
  const platform = useMemo<Platform>(() => {
    if (typeof navigator === 'undefined') return 'desktop';
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
    if (/Android/.test(ua)) return 'android';
    return 'desktop';
  }, []);
  
  const isIOS = platform === 'ios';
  const isAndroid = platform === 'android';
  const isMobile = isIOS || isAndroid;
  
  // Compute slug from name if not provided
  const computedSlug = useMemo(() => {
    return dogSlug || dogName.toLowerCase().replace(/\s+/g, '-');
  }, [dogSlug, dogName]);
  
  // Share URL
  const shareUrl = useMemo(() => {
    return `https://techno.dog/doggies?dog=${computedSlug}`;
  }, [computedSlug]);
  
  // Get memoized message data
  const {
    hashtag,
    quirkyText,
    getFullShareText,
    buildShareText,
  } = useWhatsAppMessage(dogName);
  
  const whatsAppShareText = useMemo(() => getFullShareText(), [getFullShareText]);
  
  // Track share event helper
  const trackShare = useCallback(async (shareType: SharePlatform) => {
    trackDoggyEvent('share', shareType, undefined, dogName);
    await recordShare();
    trackShareEvent({
      doggyName: dogName,
      doggySlug: computedSlug,
      variantId,
      platform: shareType,
      shareUrl,
    });
    onShare?.(shareType);
  }, [dogName, computedSlug, variantId, shareUrl, onShare]);
  
  // WhatsApp share (text only)
  const shareViaWhatsApp = useCallback(async (customText?: string): Promise<ShareResult> => {
    const text = customText || whatsAppShareText;
    const encodedText = encodeURIComponent(text);
    
    await trackShare('whatsapp');
    
    // Use wa.me for universal compatibility
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
    
    toast.success('Opening WhatsApp...', {
      description: hashtag,
    });
    
    return { success: true, platform: 'whatsapp' };
  }, [whatsAppShareText, hashtag, trackShare]);
  
  // WhatsApp share with image (mobile only)
  const shareViaWhatsAppWithImage = useCallback(async (imageBlob: Blob): Promise<ShareResult> => {
    await trackShare('whatsapp');
    
    // Check if Web Share API with files is supported
    if (navigator.canShare && isMobile) {
      try {
        const file = new File([imageBlob], `techno-${computedSlug}.webp`, { type: 'image/webp' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `${dogName} Sticker`,
            text: whatsAppShareText,
          });
          
          toast.success('Shared successfully!', { description: hashtag });
          return { success: true, platform: 'whatsapp' };
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return { success: false, platform: 'whatsapp' };
        }
        // Fall through to text-only share
      }
    }
    
    // Fallback to text-only share
    return shareViaWhatsApp();
  }, [isMobile, computedSlug, dogName, whatsAppShareText, hashtag, trackShare, shareViaWhatsApp]);
  
  // Email share
  const shareViaEmail = useCallback(async (): Promise<ShareResult> => {
    await trackShare('email');
    
    const subject = encodeURIComponent(`I'm ${dogName}! 🖤`);
    const body = encodeURIComponent(
      `🖤 I'm ${dogName}!\n\n` +
      `Join the techno.dog pack — 90+ unique doggies for the underground.\n\n` +
      `Find yours:\n${shareUrl}\n\n` +
      `${hashtag}`
    );
    
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    toast.success('Opening email...');
    
    return { success: true, platform: 'email' };
  }, [dogName, shareUrl, hashtag, trackShare]);
  
  // Copy to clipboard
  const shareViaCopy = useCallback(async (): Promise<ShareResult> => {
    await trackShare('copy');
    
    try {
      await navigator.clipboard.writeText(`${whatsAppShareText}\n${shareUrl}`);
      toast.success('Copied to clipboard!', { description: hashtag });
      return { success: true, platform: 'copy' };
    } catch {
      toast.error('Failed to copy');
      return { success: false, platform: 'copy' };
    }
  }, [whatsAppShareText, shareUrl, hashtag, trackShare]);
  
  return {
    // Platform
    platform,
    isIOS,
    isAndroid,
    isMobile,
    
    // URLs
    shareUrl,
    
    // Messages
    hashtag,
    quirkyText,
    whatsAppShareText,
    
    // Actions
    shareViaWhatsApp,
    shareViaWhatsAppWithImage,
    shareViaEmail,
    shareViaCopy,
    
    // Utility
    buildCustomShareText: buildShareText,
  };
};

export default useDoggyShare;
