import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createServiceClient, getRequiredEnv } from "../_shared/supabase.ts";

// Normalize artist name for matching
function normalizeForMatch(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Check if video title/channel contains artist name
function videoMatchesArtist(video: any, artistName: string): boolean {
  const normalizedArtist = normalizeForMatch(artistName);
  const artistParts = normalizedArtist.split(' ');
  
  const titleNorm = normalizeForMatch(video.title || '');
  const channelNorm = normalizeForMatch(video.channelTitle || '');
  const descNorm = normalizeForMatch(video.description || '');
  
  if (titleNorm.includes(normalizedArtist) || 
      channelNorm.includes(normalizedArtist) ||
      descNorm.includes(normalizedArtist)) {
    return true;
  }
  
  if (artistParts.length > 1) {
    const allPartsInTitle = artistParts.every(part => 
      part.length > 2 && (titleNorm.includes(part) || channelNorm.includes(part))
    );
    if (allPartsInTitle) return true;
  }
  
  if (artistParts.length === 1 && artistParts[0].length >= 4) {
    const regex = new RegExp(`\\b${artistParts[0]}\\b`, 'i');
    if (regex.test(video.title) || regex.test(video.channelTitle)) {
      return true;
    }
  }
  
  return false;
}

// Score video relevance
function scoreVideo(video: any, artistName: string): number {
  let score = 0;
  const titleLower = (video.title || '').toLowerCase();
  const channelLower = (video.channelTitle || '').toLowerCase();
  const artistLower = artistName.toLowerCase();
  
  if (titleLower.includes(artistLower)) score += 50;
  if (channelLower.includes(artistLower)) score += 30;
  
  const officialChannels = ['boiler room', 'cercle', 'resident advisor', 'hate', 'awakenings', 'drumcode', 'time warp', 'mixmag', 'fabric london', 'dekmantel'];
  if (officialChannels.some(ch => channelLower.includes(ch))) score += 25;
  
  const goodKeywords = ['dj set', 'live set', 'boiler room', 'cercle', 'awakenings', 'fabric', 'berghain', 'dekmantel', 'mixmag', 'tresor', 'ostgut ton', 'full set'];
  goodKeywords.forEach(kw => {
    if (titleLower.includes(kw)) score += 10;
  });
  
  const badKeywords = ['reaction', 'tutorial', 'how to', 'review', 'unboxing', 'parody', 'cover', 'remix tutorial'];
  badKeywords.forEach(kw => {
    if (titleLower.includes(kw)) score -= 20;
  });
  
  return score;
}

// Verify videos with OpenAI
async function verifyWithOpenAI(videos: any[], artistName: string): Promise<Set<number>> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY || videos.length === 0) return new Set();

  try {
    const videoList = videos.map((v, i) => 
      `${i + 1}. Title: "${v.title}" | Channel: "${v.channelTitle}"`
    ).join('\n');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You verify YouTube videos for a techno music database. Return only valid JSON.' },
          { role: 'user', content: `Artist: "${artistName}" (techno/electronic artist)

Videos:
${videoList}

Return {"valid": [numbers]} for videos that are DJ sets, live sets, or performances by this specific techno artist.
Reject videos about different people with similar names, tutorials, reactions.` }
        ],
        temperature: 0.1,
        max_tokens: 200
      }),
    });

    if (!response.ok) return new Set();
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return new Set();
    
    const result = JSON.parse(jsonMatch[0]);
    return new Set(result.valid || []);
  } catch (error) {
    console.error('OpenAI verification error:', error);
    return new Set();
  }
}

// Verify videos with Gemini
async function verifyWithGemini(videos: any[], artistName: string): Promise<Set<number>> {
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
  if (!GEMINI_API_KEY || videos.length === 0) return new Set();

  try {
    const videoList = videos.map((v, i) => 
      `${i + 1}. "${v.title}" by ${v.channelTitle}`
    ).join('\n');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Verify these videos are by the techno artist "${artistName}".

${videoList}

Return JSON: {"valid": [1, 2, ...]} for videos that are DJ sets or live performances by this artist.
Reject mismatches, tutorials, reactions. Only return the JSON.`
          }]
        }],
        generationConfig: { temperature: 0.1 }
      }),
    });

    if (!response.ok) return new Set();
    
    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return new Set();
    
    const result = JSON.parse(jsonMatch[0]);
    return new Set(result.valid || []);
  } catch (error) {
    console.error('Gemini verification error:', error);
    return new Set();
  }
}

// Multi-model consensus verification
async function verifyVideosMultiModel(videos: any[], artistName: string): Promise<any[]> {
  if (videos.length === 0) return [];

  // Run both models in parallel
  const [openaiValid, geminiValid] = await Promise.all([
    verifyWithOpenAI(videos, artistName),
    verifyWithGemini(videos, artistName)
  ]);

  console.log(`Verification for ${artistName}: OpenAI=${openaiValid.size}, Gemini=${geminiValid.size}`);

  // Mark videos as verified if either model confirms (union for max coverage)
  return videos.map((v, i) => ({
    ...v,
    aiVerified: openaiValid.has(i + 1) || geminiValid.has(i + 1),
    verifiedBy: [
      openaiValid.has(i + 1) ? 'openai' : null,
      geminiValid.has(i + 1) ? 'gemini' : null
    ].filter(Boolean)
  }));
}

// Search YouTube with multiple query strategies
async function searchYouTube(artistName: string, realName: string | null, apiKey: string): Promise<any[]> {
  const searchQueries = [
    `"${artistName}" techno DJ set`,
    `"${artistName}" boiler room`,
    `"${artistName}" live set techno`,
    `"${artistName}" awakenings festival`,
    `"${artistName}" dekmantel`,
    `"${artistName}" cercle`,
    `"${artistName}" fabric london`,
    `${artistName} electronic music live`
  ];
  
  if (realName && realName.toLowerCase() !== artistName.toLowerCase()) {
    searchQueries.unshift(`"${realName}" "${artistName}" techno`);
    searchQueries.unshift(`"${realName}" DJ set`);
  }

  const allVideos: any[] = [];
  const seenIds = new Set<string>();

  // Search up to 4 queries to maximize results
  for (const searchQuery of searchQueries.slice(0, 4)) {
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.set('part', 'snippet');
    searchUrl.searchParams.set('q', searchQuery);
    searchUrl.searchParams.set('type', 'video');
    searchUrl.searchParams.set('maxResults', '15');
    searchUrl.searchParams.set('order', 'relevance');
    searchUrl.searchParams.set('videoDuration', 'long');
    searchUrl.searchParams.set('key', apiKey);

    try {
      const response = await fetch(searchUrl.toString());
      if (!response.ok) continue;

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
        
        if (videoMatchesArtist(video, artistName)) {
          seenIds.add(videoId);
          allVideos.push({
            ...video,
            score: scoreVideo(video, artistName)
          });
        }
      }
    } catch (error) {
      console.error(`Search error for "${searchQuery}":`, error);
    }

    // Stop early if we have enough candidates
    if (allVideos.length >= 15) break;
  }

  return allVideos;
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { artistName, realName, maxResults = 6, forceRefresh = false } = await req.json();
    
    if (!artistName) {
      return errorResponse('Artist name is required', 400);
    }

    const supabase = createServiceClient();
    const normalizedName = artistName.toLowerCase().trim();
    
    // Check cache
    if (!forceRefresh) {
      const { data: cachedResult } = await supabase
        .from('youtube_cache')
        .select('videos, expires_at')
        .ilike('artist_name', normalizedName)
        .single();

      if (cachedResult) {
        const expiresAt = new Date(cachedResult.expires_at);
        const videos = cachedResult.videos || [];
        // Only use cache if it has 6 videos and hasn't expired
        if (expiresAt > new Date() && videos.length >= 6) {
          console.log(`Cache hit for ${artistName} (${videos.length} videos)`);
          return jsonResponse({ videos: videos.slice(0, 6), cached: true, aiVerified: true });
        }
      }
    }

    console.log(`Fetching videos for ${artistName}`);

    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      return errorResponse('YouTube API key not configured', 500);
    }

    // Search YouTube
    const allVideos = await searchYouTube(artistName, realName, YOUTUBE_API_KEY);
    
    // Sort by score
    allVideos.sort((a, b) => b.score - a.score);
    
    // Take top candidates for verification
    let candidates = allVideos.slice(0, 12).map(({ score, ...video }) => video);

    // Multi-model verification
    let verifiedVideos: any[] = [];
    if (candidates.length > 0) {
      console.log(`Verifying ${candidates.length} videos for ${artistName}`);
      const verified = await verifyVideosMultiModel(candidates, artistName);
      
      // Prioritize verified videos
      const confirmed = verified.filter(v => v.aiVerified);
      const unconfirmed = verified.filter(v => !v.aiVerified);
      
      verifiedVideos = [...confirmed, ...unconfirmed];
      console.log(`Verified: ${confirmed.length}, Unverified: ${unconfirmed.length}`);
    }

    // Take exactly 6 videos
    const finalVideos = verifiedVideos.slice(0, 6);

    console.log(`Returning ${finalVideos.length} videos for ${artistName}`);

    // Cache results
    if (finalVideos.length > 0) {
      await supabase
        .from('youtube_cache')
        .upsert({
          artist_name: normalizedName,
          videos: finalVideos,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }, { onConflict: 'artist_name' });
    }

    return jsonResponse({ 
      videos: finalVideos, 
      cached: false,
      totalFound: allVideos.length,
      aiVerified: true
    });

  } catch (error) {
    console.error('Error in youtube-search:', error);
    return errorResponse(error instanceof Error ? error.message : 'Unknown error');
  }
});
