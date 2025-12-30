import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";

// Search YouTube with a query
async function searchYouTubeQuery(query: string, apiKey: string): Promise<any[]> {
  const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
  searchUrl.searchParams.set('part', 'snippet');
  searchUrl.searchParams.set('q', query);
  searchUrl.searchParams.set('type', 'video');
  searchUrl.searchParams.set('maxResults', '20');
  searchUrl.searchParams.set('order', 'relevance');
  searchUrl.searchParams.set('videoDuration', 'long');
  searchUrl.searchParams.set('key', apiKey);

  try {
    const response = await fetch(searchUrl.toString());
    if (!response.ok) return [];

    const data = await response.json();
    return (data.items || []).map((item: any) => ({
      id: item.id?.videoId,
      title: item.snippet?.title,
      description: item.snippet?.description,
      thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url,
      channelTitle: item.snippet?.channelTitle,
      publishedAt: item.snippet?.publishedAt,
    })).filter((v: any) => v.id);
  } catch (error) {
    console.error(`Search error:`, error);
    return [];
  }
}

// Verify with Gemini
async function verifyWithAI(videos: any[], artistInfo: any): Promise<number[]> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY || videos.length === 0) return [];

  try {
    const videoList = videos.map((v, i) => 
      `${i + 1}. "${v.title}" by "${v.channelTitle}"`
    ).join('\n');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You verify YouTube videos for a techno/electronic music artist database. Be strict - only approve videos definitively by or featuring the specific artist.' },
          { role: 'user', content: `Artist: "${artistInfo.name}"
City: ${artistInfo.city || 'unknown'}
Context: ${artistInfo.bio || 'Electronic/techno DJ'}

IMPORTANT: Only approve videos that are DEFINITELY by this specific artist "${artistInfo.name}".
Do NOT approve videos by different artists with similar names.

Videos:
${videoList}

Return JSON: {"verified": [array of video numbers that are CONFIRMED to be by this artist]}` }
        ],
        temperature: 0.1
      }),
    });

    if (!response.ok) return [];
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return [];
    
    const result = JSON.parse(jsonMatch[0]);
    return result.verified || [];
  } catch (error) {
    console.error('AI verification error:', error);
    return [];
  }
}

// Process a single artist
async function processArtist(
  artist: any,
  youtubeApiKey: string,
  supabase: any
): Promise<{ slug: string; success: boolean; videoCount: number; error?: string }> {
  const artistInfo = {
    name: artist.canonical_name,
    city: artist.city,
    bio: artist.artist_profiles?.[0]?.bio_short || artist.artist_profiles?.[0]?.bio_long,
  };

  console.log(`Processing: ${artistInfo.name}`);

  try {
    // Search YouTube
    const queries = [
      `"${artistInfo.name}" DJ set techno`,
      `"${artistInfo.name}" ${artistInfo.city || ''} live`,
    ];

    const allVideos: any[] = [];
    const seenIds = new Set<string>();

    for (const query of queries.slice(0, 2)) {
      const videos = await searchYouTubeQuery(query, youtubeApiKey);
      for (const video of videos) {
        if (!seenIds.has(video.id)) {
          seenIds.add(video.id);
          allVideos.push(video);
        }
      }
    }

    if (allVideos.length === 0) {
      return { slug: artist.slug, success: false, videoCount: 0, error: 'No videos found' };
    }

    // Verify with AI
    const verified = await verifyWithAI(allVideos, artistInfo);
    
    // Build final list
    const finalVideos: any[] = [];
    for (const idx of verified) {
      if (finalVideos.length < 6) {
        const video = allVideos[idx - 1];
        if (video) {
          finalVideos.push({ ...video, aiVerified: true });
        }
      }
    }

    // If AI didn't verify any, take top 3 from search (fallback)
    if (finalVideos.length === 0 && allVideos.length > 0) {
      for (let i = 0; i < Math.min(3, allVideos.length); i++) {
        finalVideos.push({ ...allVideos[i], aiVerified: false });
      }
    }

    // Cache results
    if (finalVideos.length > 0) {
      const cacheKey = artistInfo.name.toLowerCase().trim();
      await supabase
        .from('youtube_cache')
        .upsert({
          artist_name: cacheKey,
          videos: finalVideos,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }, { onConflict: 'artist_name' });
    }

    return { slug: artist.slug, success: true, videoCount: finalVideos.length };
  } catch (error) {
    return { 
      slug: artist.slug, 
      success: false, 
      videoCount: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { slugs, limit = 10 } = await req.json();
    
    const supabase = createServiceClient();
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    
    if (!YOUTUBE_API_KEY) {
      return errorResponse('YouTube API key not configured', 500);
    }

    let artistsToProcess;

    if (slugs && Array.isArray(slugs)) {
      // Process specific artists
      const { data, error } = await supabase
        .from('canonical_artists')
        .select(`canonical_name, slug, city, country, artist_profiles (bio_short, bio_long)`)
        .in('slug', slugs);
      
      if (error) throw error;
      artistsToProcess = data || [];
    } else {
      // Get artists missing from cache
      const { data: cached } = await supabase
        .from('youtube_cache')
        .select('artist_name');
      
      const cachedNames = new Set((cached || []).map((c: any) => c.artist_name));
      
      const { data: allArtists, error } = await supabase
        .from('canonical_artists')
        .select(`canonical_name, slug, city, country, artist_profiles (bio_short, bio_long)`)
        .order('canonical_name');
      
      if (error) throw error;
      
      // Filter to artists not in cache
      artistsToProcess = (allArtists || []).filter((a: any) => 
        !cachedNames.has(a.canonical_name.toLowerCase().trim())
      ).slice(0, limit);
    }

    console.log(`Processing ${artistsToProcess.length} artists`);

    const results = [];
    for (const artist of artistsToProcess) {
      const result = await processArtist(artist, YOUTUBE_API_KEY, supabase);
      results.push(result);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return jsonResponse({
      success: true,
      processed: results.length,
      successful,
      failed,
      results
    });

  } catch (error) {
    console.error('Error in youtube-batch-verify:', error);
    return errorResponse(error instanceof Error ? error.message : 'Unknown error');
  }
});
