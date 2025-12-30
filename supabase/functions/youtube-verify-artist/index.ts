import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";

// Search YouTube with a query
async function searchYouTubeQuery(query: string, apiKey: string): Promise<any[]> {
  const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
  searchUrl.searchParams.set('part', 'snippet');
  searchUrl.searchParams.set('q', query);
  searchUrl.searchParams.set('type', 'video');
  searchUrl.searchParams.set('maxResults', '25');
  searchUrl.searchParams.set('order', 'relevance');
  searchUrl.searchParams.set('videoDuration', 'long');
  searchUrl.searchParams.set('key', apiKey);

  console.log(`Searching YouTube: ${query}`);
  
  try {
    const response = await fetch(searchUrl.toString());
    if (!response.ok) {
      console.error(`YouTube API error: ${response.status}`);
      return [];
    }

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
async function verifyWithGemini(videos: any[], artistInfo: any): Promise<number[]> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY || videos.length === 0) return [];

  try {
    const videoList = videos.map((v, i) => 
      `${i + 1}. "${v.title}" by channel "${v.channelTitle}" - ${v.description?.substring(0, 100) || 'no desc'}`
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
          { role: 'system', content: `You are an expert at verifying YouTube videos for electronic music artists. You must be VERY STRICT - only approve videos that are definitively by or featuring the specific artist.` },
          { role: 'user', content: `ARTIST: "${artistInfo.name}"
ALIASES: ${artistInfo.aliases?.join(', ') || 'none'}
VENUE: ${artistInfo.venue || 'unknown'}
CITY: ${artistInfo.city || 'unknown'}
BIO: ${artistInfo.bio || 'techno DJ'}

IMPORTANT: This is a specific artist "${artistInfo.name}" from ${artistInfo.city}. 
Do NOT approve videos that just contain the word "men" generically.
Do NOT approve videos by other artists with similar names.
Only approve if the video is SPECIFICALLY about/by this exact artist.

Videos to verify:
${videoList}

Return ONLY valid JSON: {"verified": [array of numbers for videos that are DEFINITELY by this specific artist]}` }
        ],
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.status);
      return [];
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    console.log('Gemini response:', content);
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return [];
    
    const result = JSON.parse(jsonMatch[0]);
    return result.verified || [];
  } catch (error) {
    console.error('Gemini verification error:', error);
    return [];
  }
}

// Verify with GPT-5
async function verifyWithGPT(videos: any[], artistInfo: any): Promise<number[]> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY || videos.length === 0) return [];

  try {
    const videoList = videos.map((v, i) => 
      `${i + 1}. "${v.title}" by channel "${v.channelTitle}" - ${v.description?.substring(0, 100) || 'no desc'}`
    ).join('\n');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5-mini',
        messages: [
          { role: 'system', content: `You verify YouTube content for a specific electronic music artist database. Be extremely precise - only confirm videos that definitively feature the exact artist requested, not similarly named artists.` },
          { role: 'user', content: `Target Artist: "${artistInfo.name}"
Known As: ${artistInfo.aliases?.join(', ') || artistInfo.name}
Location: ${artistInfo.city}, ${artistInfo.country || ''}
Venue Association: ${artistInfo.venue || 'N/A'}
Context: ${artistInfo.bio || 'Electronic/techno DJ'}

CRITICAL: "${artistInfo.name}" is a SPECIFIC artist. Reject any videos that:
- Are by different artists who happen to have similar names
- Just contain the word "${artistInfo.name?.toLowerCase()}" in a generic context
- Are not actually DJ sets/performances/music by THIS exact artist

Videos:
${videoList}

Respond with JSON only: {"confirmed": [list of video numbers that are DEFINITELY by "${artistInfo.name}"]}` }
        ],
      }),
    });

    if (!response.ok) {
      console.error('GPT API error:', response.status);
      return [];
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    console.log('GPT response:', content);
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return [];
    
    const result = JSON.parse(jsonMatch[0]);
    return result.confirmed || [];
  } catch (error) {
    console.error('GPT verification error:', error);
    return [];
  }
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { artistSlug, forceRefresh = true } = await req.json();
    
    if (!artistSlug) {
      return errorResponse('Artist slug is required', 400);
    }

    const supabase = createServiceClient();
    
    // Get artist info from canonical_artists
    const { data: artist, error: artistError } = await supabase
      .from('canonical_artists')
      .select(`
        canonical_name,
        slug,
        city,
        country,
        artist_profiles (
          bio_short,
          bio_long,
          labels
        )
      `)
      .eq('slug', artistSlug)
      .single();

    if (artistError || !artist) {
      return errorResponse(`Artist not found: ${artistSlug}`, 404);
    }

    const profile = artist.artist_profiles?.[0];
    const artistInfo = {
      name: artist.canonical_name,
      aliases: [],
      city: artist.city,
      country: artist.country,
      venue: profile?.bio_short?.includes('Moog') ? 'Moog Barcelona' : null,
      bio: profile?.bio_short || profile?.bio_long,
      labels: profile?.labels || []
    };

    console.log(`Verifying videos for: ${artistInfo.name} (${artistInfo.city})`);

    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      return errorResponse('YouTube API key not configured', 500);
    }

    // Craft specific search queries
    const searchQueries = [
      `"${artistInfo.name}" DJ set techno`,
      `"${artistInfo.name}" ${artistInfo.city || ''} DJ`,
      `"${artistInfo.name}" Moog Barcelona`,
      `${artistInfo.name} techno set 2024`,
      `${artistInfo.name} live techno`
    ];

    const allVideos: any[] = [];
    const seenIds = new Set<string>();

    // Search with multiple queries
    for (const query of searchQueries.slice(0, 3)) {
      const videos = await searchYouTubeQuery(query, YOUTUBE_API_KEY);
      for (const video of videos) {
        if (!seenIds.has(video.id)) {
          seenIds.add(video.id);
          allVideos.push(video);
        }
      }
    }

    console.log(`Found ${allVideos.length} candidate videos`);

    if (allVideos.length === 0) {
      return jsonResponse({ 
        success: false, 
        message: 'No videos found',
        videos: []
      });
    }

    // Cross-validate with both AI models
    console.log('Verifying with Gemini...');
    const geminiVerified = await verifyWithGemini(allVideos, artistInfo);
    console.log(`Gemini verified: ${geminiVerified}`);

    console.log('Verifying with GPT...');
    const gptVerified = await verifyWithGPT(allVideos, artistInfo);
    console.log(`GPT verified: ${gptVerified}`);

    // Cross-validation: require both models to agree OR high-confidence single match
    const confirmedByBoth = geminiVerified.filter(idx => gptVerified.includes(idx));
    const allConfirmed = [...new Set([...geminiVerified, ...gptVerified])];
    
    console.log(`Confirmed by both: ${confirmedByBoth}`);
    console.log(`All confirmed: ${allConfirmed}`);

    // Prioritize videos confirmed by both, then single confirmations
    const finalVideos: any[] = [];
    
    // Add videos confirmed by both first
    for (const idx of confirmedByBoth) {
      if (finalVideos.length < 6) {
        const video = allVideos[idx - 1];
        if (video) {
          finalVideos.push({ ...video, aiVerified: true, confirmedBy: 'both' });
        }
      }
    }
    
    // Then add videos confirmed by at least one (if we need more)
    for (const idx of allConfirmed) {
      if (finalVideos.length < 6 && !confirmedByBoth.includes(idx)) {
        const video = allVideos[idx - 1];
        if (video) {
          finalVideos.push({ ...video, aiVerified: true, confirmedBy: 'single' });
        }
      }
    }

    console.log(`Final verified videos: ${finalVideos.length}`);

    // Update cache
    if (finalVideos.length > 0) {
      const cacheKey = artistInfo.name.toLowerCase().trim();
      
      await supabase
        .from('youtube_cache')
        .upsert({
          artist_name: cacheKey,
          videos: finalVideos,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        }, { onConflict: 'artist_name' });

      console.log(`Cache updated for: ${cacheKey}`);
    }

    return jsonResponse({ 
      success: true, 
      artist: artistInfo.name,
      candidatesFound: allVideos.length,
      geminiVerified: geminiVerified.length,
      gptVerified: gptVerified.length,
      confirmedByBoth: confirmedByBoth.length,
      videos: finalVideos,
      allCandidates: allVideos.slice(0, 10).map(v => ({ title: v.title, channel: v.channelTitle }))
    });

  } catch (error) {
    console.error('Error in youtube-verify-artist:', error);
    return errorResponse(error instanceof Error ? error.message : 'Unknown error');
  }
});
