import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";

// Extract clean artist name (remove parenthetical info)
function cleanArtistName(name: string): string {
  // Remove content in parentheses like "(Mad Mike Banks)"
  let cleaned = name.replace(/\s*\([^)]*\)\s*/g, '').trim();
  // Remove common suffixes
  cleaned = cleaned.replace(/\s+(dj|producer|live|aka)$/i, '').trim();
  return cleaned || name;
}

// Normalize for matching
function normalizeForMatch(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Check if video relates to artist - more permissive
function videoMatchesArtist(video: any, artistName: string, altNames: string[]): boolean {
  const titleNorm = normalizeForMatch(video.title || '');
  const channelNorm = normalizeForMatch(video.channelTitle || '');
  const descNorm = normalizeForMatch(video.description || '');
  const combined = `${titleNorm} ${channelNorm} ${descNorm}`;
  
  // Check all name variations
  const namesToCheck = [artistName, ...altNames].map(n => normalizeForMatch(n));
  
  for (const nameNorm of namesToCheck) {
    if (!nameNorm) continue;
    
    // Direct match
    if (combined.includes(nameNorm)) return true;
    
    // Check individual words for multi-word names
    const parts = nameNorm.split(' ').filter(p => p.length > 2);
    if (parts.length > 1) {
      const matchCount = parts.filter(part => combined.includes(part)).length;
      if (matchCount >= Math.ceil(parts.length * 0.7)) return true;
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
  
  const officialChannels = ['boiler room', 'cercle', 'resident advisor', 'hate', 'awakenings', 'drumcode', 'time warp', 'mixmag', 'dekmantel', 'tresor'];
  if (officialChannels.some(ch => channelLower.includes(ch))) score += 25;
  
  const goodKeywords = ['dj set', 'live set', 'boiler room', 'cercle', 'awakenings', 'fabric', 'berghain', 'dekmantel', 'mixmag', 'full set', 'live', 'festival'];
  goodKeywords.forEach(kw => {
    if (titleLower.includes(kw)) score += 10;
  });
  
  const badKeywords = ['reaction', 'tutorial', 'how to', 'review', 'unboxing', 'parody', 'cover'];
  badKeywords.forEach(kw => {
    if (titleLower.includes(kw)) score -= 20;
  });
  
  return score;
}

// Search YouTube with a query
async function searchYouTubeQuery(query: string, apiKey: string): Promise<any[]> {
  const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
  searchUrl.searchParams.set('part', 'snippet');
  searchUrl.searchParams.set('q', query);
  searchUrl.searchParams.set('type', 'video');
  searchUrl.searchParams.set('maxResults', '15');
  searchUrl.searchParams.set('order', 'relevance');
  searchUrl.searchParams.set('videoDuration', 'long');
  searchUrl.searchParams.set('key', apiKey);

  console.log(`Searching: ${query}`);
  
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

// Verify videos with AI (using Lovable AI gateway)
async function verifyWithAI(videos: any[], artistName: string): Promise<any[]> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY || videos.length === 0) {
    return videos.map(v => ({ ...v, aiVerified: true }));
  }

  try {
    const videoList = videos.map((v, i) => 
      `${i + 1}. "${v.title}" by ${v.channelTitle}`
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
          { role: 'system', content: 'You verify YouTube videos for a techno music database. Return only valid JSON.' },
          { role: 'user', content: `Artist: "${artistName}" (techno/electronic artist)

Videos:
${videoList}

Return {"valid": [numbers]} for videos that are likely DJ sets, live performances, or music by this artist or related to them.
Be permissive - include videos that feature, mention, or are about this artist.` }
        ],
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      console.log('AI verification skipped - API error');
      return videos.map(v => ({ ...v, aiVerified: true }));
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      return videos.map(v => ({ ...v, aiVerified: true }));
    }
    
    const result = JSON.parse(jsonMatch[0]);
    const validIndices = new Set(result.valid || []);
    
    console.log(`AI verified ${validIndices.size}/${videos.length} videos`);
    
    return videos.map((v, i) => ({
      ...v,
      aiVerified: validIndices.has(i + 1)
    }));
  } catch (error) {
    console.error('AI verification error:', error);
    return videos.map(v => ({ ...v, aiVerified: true }));
  }
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
    const cleanName = cleanArtistName(artistName);
    const cleanNameNorm = cleanName.toLowerCase().trim();
    
    // Check cache with multiple name variations
    if (!forceRefresh) {
      // Try full name first, then clean name
      const namesToTry = [normalizedName, cleanNameNorm];
      console.log(`Checking cache for: ${namesToTry.join(', ')}`);
      
      for (const cacheName of namesToTry) {
        const { data: cachedResult, error: cacheError } = await supabase
          .from('youtube_cache')
          .select('videos, expires_at')
          .ilike('artist_name', cacheName)
          .single();

        if (cacheError) {
          console.log(`Cache lookup error for ${cacheName}: ${cacheError.message}`);
          continue;
        }

        if (cachedResult) {
          const expiresAt = new Date(cachedResult.expires_at);
          const videos = cachedResult.videos || [];
          console.log(`Found cache for ${cacheName}: ${videos.length} videos, expires ${expiresAt.toISOString()}`);
          if (expiresAt > new Date() && videos.length >= 1) {
            console.log(`Cache hit for ${cacheName} (${videos.length} videos)`);
            return jsonResponse({ videos: videos.slice(0, 6), cached: true, aiVerified: true });
          }
        }
      }
    }

    console.log(`Fetching videos for ${artistName}`);

    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      return errorResponse('YouTube API key not configured', 500);
    }

    // Use already-computed clean name for search
    const altNames = [cleanName];
    
    // Add real name as alternative
    if (realName && realName.toLowerCase() !== cleanName.toLowerCase()) {
      altNames.push(realName);
    }
    
    // Extract any parenthetical content as alternative name
    const parenMatch = artistName.match(/\(([^)]+)\)/);
    if (parenMatch && parenMatch[1]) {
      altNames.push(parenMatch[1]);
    }

    console.log(`Searching for: ${cleanName}, alternatives: ${altNames.join(', ')}`);

    // Build search queries with clean name
    const searchQueries = [
      `${cleanName} techno DJ set`,
      `${cleanName} boiler room`,
      `${cleanName} live set`,
      `${cleanName} electronic music`
    ];
    
    // Add alternative name searches
    if (altNames.length > 1) {
      searchQueries.push(`${altNames[1]} DJ set`);
      searchQueries.push(`${altNames[1]} techno`);
    }

    const allVideos: any[] = [];
    const seenIds = new Set<string>();

    // Search with multiple queries in parallel
    const searchPromises = searchQueries.slice(0, 4).map(q => searchYouTubeQuery(q, YOUTUBE_API_KEY));
    const searchResults = await Promise.all(searchPromises);

    for (const videos of searchResults) {
      for (const video of videos) {
        if (seenIds.has(video.id)) continue;
        
        // More permissive matching
        if (videoMatchesArtist(video, cleanName, altNames)) {
          seenIds.add(video.id);
          allVideos.push({
            ...video,
            score: scoreVideo(video, cleanName)
          });
        }
      }
    }

    console.log(`Found ${allVideos.length} matching videos`);

    // Sort by score
    allVideos.sort((a, b) => b.score - a.score);
    
    // Take top candidates
    let candidates = allVideos.slice(0, 12).map(({ score, ...video }) => video);

    // AI verification
    let finalVideos: any[] = [];
    if (candidates.length > 0) {
      const verified = await verifyWithAI(candidates, cleanName);
      const confirmed = verified.filter(v => v.aiVerified);
      const unconfirmed = verified.filter(v => !v.aiVerified);
      finalVideos = [...confirmed, ...unconfirmed].slice(0, 6);
    }

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
