import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";

// Entity lists - imported inline to avoid cross-file imports in edge functions
const ARTISTS = [
  "Jeff Mills", "Robert Hood", "Underground Resistance", "Rrose", "D.Dan",
  "Kwartz", "Surgeon", "Regis", "Paula Temple", "Rebekah", "James Ruskin",
  "Helena Hauff", "Blawan", "Perc", "Ben Klock", "Marcel Dettmann",
  "Len Faki", "Oscar Mulero", "Exium", "Reeko", "Dax J", "VTSS",
  "I Hate Models", "Anetha", "SPFDJ", "999999999", "Amelie Lens",
  "Charlotte de Witte", "Adam Beyer", "Richie Hawtin", "Carl Cox"
];

const VENUES = [
  "Berghain Berlin", "Tresor Berlin", "about blank Berlin", "Bassiani Tbilisi",
  "Khidi Tbilisi", "Fabric London", "De School Amsterdam", "Shelter Amsterdam",
  "Concrete Paris", "Fuse Brussels", "D-Edge Sao Paulo", "Nowadays Brooklyn"
];

const FESTIVALS = [
  "Awakenings festival", "Dekmantel festival", "Time Warp Mannheim",
  "Berlin Atonal", "Sonar Barcelona", "Movement Detroit", "MIRA Barcelona",
  "Unsound Krakow", "Katharsis festival", "Neopop Portugal"
];

const GEAR = [
  "Roland TR-808 drum machine", "Roland TR-909 drum machine", 
  "Roland TB-303 synthesizer", "Roland SH-101 synthesizer",
  "Roland Juno-106 synthesizer", "Korg MS-20 synthesizer",
  "Sequential Prophet-5", "Oberheim OB-X synthesizer",
  "Moog Minimoog synthesizer", "Elektron Analog Rytm"
];

// Helper to normalize artist name for matching
function normalizeForMatch(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Check if video title/channel contains entity name
function videoMatchesEntity(video: any, entityName: string): boolean {
  const normalizedEntity = normalizeForMatch(entityName);
  const entityParts = normalizedEntity.split(' ').filter(p => p.length > 2);
  
  const titleNorm = normalizeForMatch(video.title || '');
  const channelNorm = normalizeForMatch(video.channelTitle || '');
  const descNorm = normalizeForMatch(video.description || '');
  
  // Check for entity name match
  if (titleNorm.includes(normalizedEntity) || 
      channelNorm.includes(normalizedEntity) ||
      descNorm.includes(normalizedEntity)) {
    return true;
  }
  
  // For multi-word names, check if all parts appear
  if (entityParts.length > 1) {
    const allPartsInTitle = entityParts.every(part => 
      titleNorm.includes(part) || channelNorm.includes(part)
    );
    if (allPartsInTitle) return true;
  }
  
  return false;
}

// Score video relevance
function scoreVideo(video: any, entityName: string): number {
  let score = 0;
  const titleLower = (video.title || '').toLowerCase();
  const channelLower = (video.channelTitle || '').toLowerCase();
  const entityLower = entityName.toLowerCase();
  
  if (titleLower.includes(entityLower)) score += 50;
  if (channelLower.includes(entityLower)) score += 30;
  
  const officialChannels = ['boiler room', 'cercle', 'resident advisor', 'hate', 'awakenings', 'drumcode', 'time warp'];
  if (officialChannels.some(ch => channelLower.includes(ch))) score += 25;
  
  const goodKeywords = ['dj set', 'live set', 'boiler room', 'cercle', 'awakenings', 'fabric', 'berghain', 'dekmantel', 'mixmag'];
  goodKeywords.forEach(kw => {
    if (titleLower.includes(kw)) score += 10;
  });
  
  const badKeywords = ['reaction', 'tutorial', 'how to', 'review', 'unboxing', 'parody', 'cover'];
  badKeywords.forEach(kw => {
    if (titleLower.includes(kw)) score -= 20;
  });
  
  return score;
}

// Search YouTube for an entity
async function searchYouTube(entityName: string, entityType: string, apiKey: string): Promise<any[]> {
  const searchQueries: Record<string, string[]> = {
    artist: [`"${entityName}" techno DJ set`, `"${entityName}" boiler room`],
    venue: [`"${entityName}" techno DJ set`, `"${entityName}" club night`],
    festival: [`"${entityName}" techno DJ set`, `"${entityName}" live performance`],
    gear: [`"${entityName}" demo`, `"${entityName}" techno tutorial`]
  };

  const queries = searchQueries[entityType] || searchQueries.artist;
  const allVideos: any[] = [];
  const seenIds = new Set<string>();

  for (const searchQuery of queries.slice(0, 2)) {
    try {
      const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
      searchUrl.searchParams.set('part', 'snippet');
      searchUrl.searchParams.set('q', searchQuery);
      searchUrl.searchParams.set('type', 'video');
      searchUrl.searchParams.set('maxResults', '10');
      searchUrl.searchParams.set('order', 'relevance');
      searchUrl.searchParams.set('videoDuration', entityType === 'gear' ? 'medium' : 'long');
      searchUrl.searchParams.set('key', apiKey);

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
        
        if (videoMatchesEntity(video, entityName)) {
          seenIds.add(videoId);
          allVideos.push({
            ...video,
            score: scoreVideo(video, entityName)
          });
        }
      }
    } catch (error) {
      console.error(`Search error for "${searchQuery}":`, error);
    }
  }

  allVideos.sort((a, b) => b.score - a.score);
  return allVideos.slice(0, 6).map(({ score, ...video }) => video);
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      return errorResponse('YouTube API key not configured', 500);
    }

    const supabase = createServiceClient();
    const { entityType, batchSize = 5, forceAll = false } = await req.json().catch(() => ({}));

    // Select entities to refresh
    let entities: { name: string; type: string }[] = [];
    
    if (entityType === 'artist' || !entityType) {
      entities = [...entities, ...ARTISTS.map(name => ({ name, type: 'artist' }))];
    }
    if (entityType === 'venue' || !entityType) {
      entities = [...entities, ...VENUES.map(name => ({ name, type: 'venue' }))];
    }
    if (entityType === 'festival' || !entityType) {
      entities = [...entities, ...FESTIVALS.map(name => ({ name, type: 'festival' }))];
    }
    if (entityType === 'gear' || !entityType) {
      entities = [...entities, ...GEAR.map(name => ({ name, type: 'gear' }))];
    }

    // Check which entities need refresh (cache expired or missing)
    const entitiesToRefresh: { name: string; type: string }[] = [];
    
    if (forceAll) {
      entitiesToRefresh.push(...entities.slice(0, batchSize));
    } else {
      for (const entity of entities) {
        if (entitiesToRefresh.length >= batchSize) break;
        
        const normalizedName = entity.name.toLowerCase().trim();
        const { data: cached } = await supabase
          .from('youtube_cache')
          .select('expires_at')
          .ilike('artist_name', normalizedName)
          .single();
        
        const needsRefresh = !cached || new Date(cached.expires_at) < new Date();
        if (needsRefresh) {
          entitiesToRefresh.push(entity);
        }
      }
    }

    console.log(`Refreshing ${entitiesToRefresh.length} entities`);
    
    const results: { name: string; type: string; videoCount: number; error?: string }[] = [];

    for (const entity of entitiesToRefresh) {
      try {
        console.log(`Searching YouTube for ${entity.type}: ${entity.name}`);
        const videos = await searchYouTube(entity.name, entity.type, YOUTUBE_API_KEY);
        
        const normalizedName = entity.name.toLowerCase().trim();
        
        if (videos.length > 0) {
          await supabase
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
        }
        
        results.push({ name: entity.name, type: entity.type, videoCount: videos.length });
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error processing ${entity.name}:`, error);
        results.push({ 
          name: entity.name, 
          type: entity.type, 
          videoCount: 0, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    const totalVideos = results.reduce((sum, r) => sum + r.videoCount, 0);
    console.log(`Completed: ${results.length} entities, ${totalVideos} total videos`);

    return jsonResponse({
      processed: results.length,
      totalVideos,
      results
    });

  } catch (error) {
    console.error('Error in youtube-cache-refresh:', error);
    return errorResponse(error instanceof Error ? error.message : 'Unknown error');
  }
});