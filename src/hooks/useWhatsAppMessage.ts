import { useMemo, useCallback } from 'react';

/**
 * Pre-computed hashtag and message generation for Techno Doggies
 * 
 * Performance optimizations:
 * - Memoized message lookup
 * - O(1) hashtag generation
 * - Cached message building
 */

export interface DoggyMessage {
  intro: string;
  quote: string;
  packInvite: string;
}

// Lazy-loaded message map - only imported when needed
let messageCache: Record<string, DoggyMessage> | null = null;

const getMessageMap = async (): Promise<Record<string, DoggyMessage>> => {
  if (messageCache) return messageCache;
  const { doggyMessages } = await import('@/data/doggyWhatsAppMessages');
  messageCache = doggyMessages;
  return messageCache;
};

// Synchronous fallback for already-loaded messages
const getMessageMapSync = (): Record<string, DoggyMessage> => {
  if (messageCache) return messageCache;
  // Import synchronously as fallback
  const { doggyMessages } = require('@/data/doggyWhatsAppMessages');
  messageCache = doggyMessages;
  return messageCache;
};

// O(1) hashtag generation - pure function
export const generateHashtag = (dogName: string): string => {
  return `#${dogName.toLowerCase().replace(/\s+/g, '')}doggy`;
};

// Default fallback message
const DEFAULT_MESSAGE: DoggyMessage = {
  intro: "I'm the Techno Dog — no vocals, no nonsense, no mercy",
  quote: "Four to the floor. Eight hours straight. Zero small talk. This is the way.",
  packInvite: "Submit to the rhythm"
};

interface UseWhatsAppMessageOptions {
  includeQuirky?: boolean;
  customMessage?: string;
}

interface UseWhatsAppMessageResult {
  hashtag: string;
  quirkyText: string;
  hasQuirkyText: boolean;
  message: DoggyMessage;
  buildShareText: (options?: UseWhatsAppMessageOptions) => string;
  getFullShareText: () => string;
}

/**
 * Hook for memoized WhatsApp message generation
 * 
 * @param dogName - Name of the doggy (e.g., "Acid", "Techno")
 * @returns Memoized message data and builder functions
 */
export const useWhatsAppMessage = (dogName: string): UseWhatsAppMessageResult => {
  // Memoize the normalized dog name key
  const dogKey = useMemo(() => dogName.toLowerCase(), [dogName]);
  
  // Memoize hashtag (O(1) operation)
  const hashtag = useMemo(() => generateHashtag(dogName), [dogName]);
  
  // Memoize message lookup
  const message = useMemo(() => {
    const messages = getMessageMapSync();
    return messages[dogKey] || DEFAULT_MESSAGE;
  }, [dogKey]);
  
  // Memoize quirky text
  const quirkyText = useMemo(() => message.quote, [message]);
  const hasQuirkyText = useMemo(() => quirkyText.length > 0, [quirkyText]);
  
  // Memoized share text builder
  const buildShareText = useCallback((options: UseWhatsAppMessageOptions = {}) => {
    const { includeQuirky = true, customMessage = '' } = options;
    const parts: string[] = [];
    
    // Add quirky text if enabled
    if (includeQuirky && hasQuirkyText) {
      parts.push(`🖤 "${quirkyText}"`);
    }
    
    // Add custom message if provided
    if (customMessage.trim()) {
      parts.push(customMessage.trim());
    }
    
    // Always add hashtag and link (mandatory)
    parts.push(`\n${hashtag}`);
    parts.push('techno.dog/doggies');
    
    return parts.join('\n');
  }, [quirkyText, hasQuirkyText, hashtag]);
  
  // Full share text (default format)
  const getFullShareText = useCallback(() => {
    return `🖤 ${message.intro}

"${message.quote}"

${message.packInvite}!

${hashtag}
techno.dog/doggies`;
  }, [message, hashtag]);
  
  return {
    hashtag,
    quirkyText,
    hasQuirkyText,
    message,
    buildShareText,
    getFullShareText,
  };
};

export default useWhatsAppMessage;
