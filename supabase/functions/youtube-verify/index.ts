import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { videoIds, gearName } = await req.json();
    
    if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
      return errorResponse('Video IDs array is required', 400);
    }

    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      console.error('YOUTUBE_API_KEY is not configured');
      return errorResponse('YouTube API key not configured', 500);
    }

    console.log(`Verifying ${videoIds.length} videos for ${gearName || 'gear'}`);

    // Use YouTube Data API v3 to verify videos exist and get their details
    const idsParam = videoIds.slice(0, 50).join(','); // Max 50 per request
    const videosUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    videosUrl.searchParams.set('part', 'snippet,status');
    videosUrl.searchParams.set('id', idsParam);
    videosUrl.searchParams.set('key', YOUTUBE_API_KEY);

    const response = await fetch(videosUrl.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('YouTube API error:', response.status, errorText);
      
      // Return fallback with assumed valid
      return jsonResponse({
        videos: videoIds.map(id => ({
          id,
          isValid: true,
          title: null,
          channelTitle: null,
          thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`
        })),
        error: 'API temporarily unavailable, using fallback'
      });
    }

    const data = await response.json();
    
    // Map response to include validity status
    const verifiedVideos = videoIds.map(id => {
      const item = data.items?.find((v: any) => v.id === id);
      
      if (!item) {
        console.log(`Video ${id} not found or unavailable`);
        return {
          id,
          isValid: false,
          title: null,
          channelTitle: null,
          thumbnail: null
        };
      }

      // Check if video is embeddable and public
      const isEmbeddable = item.status?.embeddable !== false;
      const isPublic = item.status?.privacyStatus === 'public';
      const isValid = isEmbeddable && isPublic;

      if (!isValid) {
        console.log(`Video ${id} is not embeddable or not public`);
      }

      return {
        id,
        isValid,
        title: item.snippet?.title,
        channelTitle: item.snippet?.channelTitle,
        thumbnail: item.snippet?.thumbnails?.high?.url || 
                   item.snippet?.thumbnails?.medium?.url ||
                   `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        publishedAt: item.snippet?.publishedAt
      };
    });

    const validCount = verifiedVideos.filter(v => v.isValid).length;
    console.log(`Verified ${validCount}/${videoIds.length} videos as valid for ${gearName || 'gear'}`);

    return jsonResponse({ 
      videos: verifiedVideos,
      totalChecked: videoIds.length,
      validCount
    });

  } catch (error) {
    console.error('Error in youtube-verify function:', error);
    return errorResponse(error instanceof Error ? error.message : 'Unknown error');
  }
});