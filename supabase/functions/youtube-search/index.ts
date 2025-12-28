import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createServiceClient, getRequiredEnv } from "../_shared/supabase.ts";

// Helper to normalize artist name for matching
function normalizeForMatch(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Check if video title/channel contains artist name (with variations)
function videoMatchesArtist(video: any, artistName: string): boolean {
  const normalizedArtist = normalizeForMatch(artistName);
  const artistParts = normalizedArtist.split(' ');
  
  const titleNorm = normalizeForMatch(video.title || '');
  const channelNorm = normalizeForMatch(video.channelTitle || '');
  const descNorm = normalizeForMatch(video.description || '');
  
  // Check for exact artist name match
  if (titleNorm.includes(normalizedArtist) || 
      channelNorm.includes(normalizedArtist) ||
      descNorm.includes(normalizedArtist)) {
    return true;
  }
  
  // For multi-word names, check if all parts appear
  if (artistParts.length > 1) {
    const allPartsInTitle = artistParts.every(part => 
      part.length > 2 && (titleNorm.includes(part) || channelNorm.includes(part))
    );
    if (allPartsInTitle) return true;
  }
  
  // Special handling for single-word artist names - be stricter
  if (artistParts.length === 1 && artistParts[0].length >= 4) {
    // For single word names, require it appears as a distinct word
    const regex = new RegExp(`\\b${artistParts[0]}\\b`, 'i');
    if (regex.test(video.title) || regex.test(video.channelTitle)) {
      return true;
    }
  }
  
  return false;
}

// Score video relevance for sorting
function scoreVideo(video: any, artistName: string): number {
  let score = 0;
  const titleLower = (video.title || '').toLowerCase();
  const channelLower = (video.channelTitle || '').toLowerCase();
  const artistLower = artistName.toLowerCase();
  
  // Artist name in title is highly relevant
  if (titleLower.includes(artistLower)) score += 50;
  
  // Artist name in channel name
  if (channelLower.includes(artistLower)) score += 30;
  
  // Official channels get bonus
  const officialChannels = ['boiler room', 'cercle', 'resident advisor', 'hate', 'awakenings', 'drumcode', 'time warp'];
  if (officialChannels.some(ch => channelLower.includes(ch))) score += 25;
  
  // Keywords that indicate quality content
  const goodKeywords = ['dj set', 'live set', 'boiler room', 'cercle', 'awakenings', 'fabric', 'berghain', 'dekmantel', 'mixmag'];
  goodKeywords.forEach(kw => {
    if (titleLower.includes(kw)) score += 10;
  });
  
  // Penalize likely mismatches
  const badKeywords = ['reaction', 'tutorial', 'how to', 'review', 'unboxing', 'parody', 'cover'];
  badKeywords.forEach(kw => {
    if (titleLower.includes(kw)) score -= 20;
  });
  
  return score;
}

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { artistName, maxResults = 6, forceRefresh = false } = await req.json();
    
    if (!artistName) {
      return errorResponse('Artist name is required', 400);
    }

    const supabase = createServiceClient();

    // Check cache first (unless force refresh)
    const normalizedName = artistName.toLowerCase().trim();
    
    if (!forceRefresh) {
      const { data: cachedResult, error: cacheError } = await supabase
        .from('youtube_cache')
        .select('videos, expires_at')
        .ilike('artist_name', normalizedName)
        .single();

      if (!cacheError && cachedResult) {
        const expiresAt = new Date(cachedResult.expires_at);
        if (expiresAt > new Date()) {
          console.log(`Cache hit for ${artistName}`);
          return jsonResponse({ videos: cachedResult.videos, cached: true });
        } else {
          console.log(`Cache expired for ${artistName}`);
        }
      }
    }

    console.log(`Fetching from YouTube API for ${artistName}`);

    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      console.error('YOUTUBE_API_KEY is not configured');
      return errorResponse('YouTube API key not configured', 500);
    }

    // Multiple search strategies for better accuracy
    const searchQueries = [
      `"${artistName}" techno DJ set`,
      `"${artistName}" boiler room`,
      `"${artistName}" live set techno`,
      `"${artistName}" awakenings festival`
    ];

    const allVideos: any[] = [];
    const seenIds = new Set<string>();

    // Search with first two queries to balance API usage
    for (const searchQuery of searchQueries.slice(0, 2)) {
      const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
      searchUrl.searchParams.set('part', 'snippet');
      searchUrl.searchParams.set('q', searchQuery);
      searchUrl.searchParams.set('type', 'video');
      searchUrl.searchParams.set('maxResults', '10');
      searchUrl.searchParams.set('order', 'relevance');
      searchUrl.searchParams.set('videoDuration', 'long');
      searchUrl.searchParams.set('key', YOUTUBE_API_KEY);

      console.log(`Searching: ${searchQuery}`);

      try {
        const response = await fetch(searchUrl.toString());
        
        if (!response.ok) {
          console.error('YouTube API error:', response.status);
          continue;
        }

        const data = await response.json();
        
        for (const item of (data.items || [])) {
          const videoId = item.id?.videoId;
          if (!videoId || seenIds.has(videoId)) continue;
          
          const video = {
            id: videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
          };
          
          // Only include if video actually matches artist
          if (videoMatchesArtist(video, artistName)) {
            seenIds.add(videoId);
            allVideos.push({
              ...video,
              score: scoreVideo(video, artistName)
            });
          }
        }
      } catch (searchError) {
        console.error(`Search error for "${searchQuery}":`, searchError);
      }
    }

    // Sort by relevance score and take top results
    allVideos.sort((a, b) => b.score - a.score);
    const videos = allVideos.slice(0, maxResults).map(({ score, ...video }) => video);

    console.log(`Found ${allVideos.length} matching videos, returning ${videos.length} for ${artistName}`);

    // Store in cache
    if (videos.length > 0) {
      const { error: upsertError } = await supabase
        .from('youtube_cache')
        .upsert({
          artist_name: normalizedName,
          videos: videos,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }, {
          onConflict: 'artist_name',
          ignoreDuplicates: false
        });

      if (upsertError) {
        console.error('Cache upsert error:', upsertError);
      }
    }

    return jsonResponse({ 
      videos, 
      cached: false,
      totalMatched: allVideos.length 
    });

  } catch (error) {
    console.error('Error in youtube-search function:', error);
    return errorResponse(error instanceof Error ? error.message : 'Unknown error');
  }
});
