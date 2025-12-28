import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createServiceClient, getRequiredEnv } from "../_shared/supabase.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { artistName, maxResults = 6 } = await req.json();
    
    if (!artistName) {
      return errorResponse('Artist name is required', 400);
    }

    const supabase = createServiceClient();

    // Check cache first
    const normalizedName = artistName.toLowerCase().trim();
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

    console.log(`Cache miss for ${artistName}, fetching from YouTube API`);

    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      console.error('YOUTUBE_API_KEY is not configured');
      return errorResponse('YouTube API key not configured', 500);
    }

    // Search for techno DJ sets and live performances
    const searchQuery = `${artistName} techno DJ set OR live performance OR boiler room`;
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.set('part', 'snippet');
    searchUrl.searchParams.set('q', searchQuery);
    searchUrl.searchParams.set('type', 'video');
    searchUrl.searchParams.set('maxResults', String(maxResults));
    searchUrl.searchParams.set('order', 'relevance');
    searchUrl.searchParams.set('videoDuration', 'long');
    searchUrl.searchParams.set('key', YOUTUBE_API_KEY);

    console.log(`Searching YouTube for: ${searchQuery}`);

    const response = await fetch(searchUrl.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('YouTube API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'YouTube API error', details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();

    // Transform the response to a cleaner format
    const videos = data.items?.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
    })) || [];

    console.log(`Found ${videos.length} videos for ${artistName}`);

    // Store in cache (upsert)
    if (videos.length > 0) {
      const { error: upsertError } = await supabase
        .from('youtube_cache')
        .upsert({
          artist_name: normalizedName,
          videos: videos,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        }, {
          onConflict: 'artist_name',
          ignoreDuplicates: false
        });

      if (upsertError) {
        console.error('Cache upsert error:', upsertError);
      } else {
        console.log(`Cached results for ${artistName}`);
      }
    }

    return jsonResponse({ videos, cached: false });

  } catch (error) {
    console.error('Error in youtube-search function:', error);
    return errorResponse(error instanceof Error ? error.message : 'Unknown error');
  }
});
