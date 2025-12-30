import { supabase } from "@/integrations/supabase/client";

/**
 * Enhanced share tracking for Techno Doggies
 * Tracks shares with platform, reshare detection, and virality chain
 */

interface ShareEventData {
  doggyName: string;
  doggySlug?: string;
  variantId?: string;
  platform: string;
  shareUrl?: string;
}

// Detect device type from user agent
function getDeviceType(): string {
  const ua = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad|tablet/.test(ua)) {
    return /tablet|ipad/.test(ua) ? 'tablet' : 'mobile';
  }
  return 'desktop';
}

// Detect if this is a reshare (user came from a shared link)
function detectReshare(): { isReshare: boolean; parentId?: string; chainDepth: number } {
  const urlParams = new URLSearchParams(window.location.search);
  const shareId = urlParams.get('sid'); // Share ID from previous share
  const chainParam = urlParams.get('chain');
  
  if (shareId) {
    const chainDepth = chainParam ? parseInt(chainParam, 10) + 1 : 1;
    return { isReshare: true, parentId: shareId, chainDepth };
  }
  
  return { isReshare: false, chainDepth: 0 };
}

// Detect referrer platform
function detectReferrerPlatform(): string | null {
  const referrer = document.referrer.toLowerCase();
  
  const platforms: Record<string, string[]> = {
    'twitter': ['twitter.com', 't.co', 'x.com'],
    'facebook': ['facebook.com', 'fb.com', 'fb.me'],
    'instagram': ['instagram.com'],
    'whatsapp': ['whatsapp.com', 'wa.me'],
    'telegram': ['telegram.org', 't.me'],
    'discord': ['discord.com', 'discord.gg'],
    'bluesky': ['bsky.app'],
    'reddit': ['reddit.com'],
    'linkedin': ['linkedin.com'],
  };
  
  for (const [platform, domains] of Object.entries(platforms)) {
    if (domains.some(domain => referrer.includes(domain))) {
      return platform;
    }
  }
  
  return null;
}

// Get UTM parameters
function getUtmParams(): { source?: string; medium?: string; campaign?: string } {
  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get('utm_source') || undefined,
    medium: params.get('utm_medium') || undefined,
    campaign: params.get('utm_campaign') || undefined,
  };
}

// Get or create session ID
function getSessionId(): string {
  let sessionId = localStorage.getItem('doggy_session_id');
  if (!sessionId) {
    sessionId = `doggy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('doggy_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Track a share event with full metadata
 */
export async function trackShareEvent(data: ShareEventData): Promise<string | null> {
  try {
    const { isReshare, parentId, chainDepth } = detectReshare();
    const utm = getUtmParams();
    const sessionId = getSessionId();
    
    // Generate share URL with tracking
    const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const baseUrl = data.shareUrl || `https://techno.dog/doggies?dog=${data.doggySlug}`;
    const trackedUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}sid=${shareId}&chain=${chainDepth}`;
    
    const { error } = await supabase.from('doggy_share_events').insert({
      session_id: sessionId,
      doggy_name: data.doggyName,
      doggy_slug: data.doggySlug,
      variant_id: data.variantId,
      platform: data.platform,
      share_type: isReshare ? 'reshare' : 'initial',
      share_url: trackedUrl,
      referrer: document.referrer || null,
      referrer_platform: detectReferrerPlatform(),
      utm_source: utm.source,
      utm_medium: utm.medium,
      utm_campaign: utm.campaign,
      parent_share_id: parentId,
      chain_depth: chainDepth,
      user_agent: navigator.userAgent,
      device_type: getDeviceType(),
    });
    
    if (error) {
      console.error('[trackShareEvent] Error:', error);
      return null;
    }
    
    console.log(`[trackShareEvent] Tracked ${data.platform} share for ${data.doggyName}`);
    return shareId;
  } catch (err) {
    console.error('[trackShareEvent] Exception:', err);
    return null;
  }
}

/**
 * Track a click-through (someone arrived via a shared link)
 */
export async function trackClickThrough(): Promise<void> {
  const urlParams = new URLSearchParams(window.location.search);
  const shareId = urlParams.get('sid');
  
  if (!shareId) return;
  
  try {
    // We can't update by share_url, so we'll insert a page view event instead
    await supabase.from('doggy_page_analytics').insert({
      page_source: 'shared_link',
      event_type: 'click_through',
      link_clicked: shareId,
      session_id: getSessionId(),
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      metadata: { share_id: shareId }
    });
    
    console.log('[trackClickThrough] Recorded for share:', shareId);
  } catch (err) {
    console.error('[trackClickThrough] Error:', err);
  }
}

/**
 * Get share analytics summary
 */
export async function getShareAnalytics(timeRange: '1h' | '24h' | '7d' | '30d' = '24h') {
  try {
    const { data, error } = await supabase.functions.invoke('doggy-analytics-insights', {
      body: { action: 'platform-performance', timeRange }
    });
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[getShareAnalytics] Error:', err);
    return null;
  }
}

/**
 * Trigger AI analysis of share dynamics
 */
export async function triggerShareAnalysis(timeRange: '1h' | '24h' | '7d' | '30d' = '24h') {
  try {
    const { data, error } = await supabase.functions.invoke('doggy-analytics-insights', {
      body: { action: 'consensus', timeRange }
    });
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[triggerShareAnalysis] Error:', err);
    return null;
  }
}
