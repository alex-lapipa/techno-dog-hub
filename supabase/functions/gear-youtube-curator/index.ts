import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface GearItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  youtube_videos: any[] | null;
}

interface YouTubeVideo {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  url: string;
}

// Search YouTube for gear-related videos
async function searchYouTubeForGear(gearName: string, brand: string): Promise<any[]> {
  if (!YOUTUBE_API_KEY) {
    console.error('No YouTube API key configured');
    return [];
  }

  // Build search queries focused on tutorials and demos
  const searchQueries = [
    `${brand} ${gearName} tutorial`,
    `${brand} ${gearName} demo sound`,
    `${gearName} review techno`,
    `${gearName} walkthrough synthesizer`,
  ];

  const allVideos: any[] = [];
  const seenIds = new Set<string>();

  for (const query of searchQueries.slice(0, 3)) {
    try {
      const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
      searchUrl.searchParams.set('part', 'snippet');
      searchUrl.searchParams.set('q', query);
      searchUrl.searchParams.set('type', 'video');
      searchUrl.searchParams.set('maxResults', '10');
      searchUrl.searchParams.set('order', 'relevance');
      searchUrl.searchParams.set('key', YOUTUBE_API_KEY);

      console.log(`[YouTube] Searching: ${query}`);

      const response = await fetch(searchUrl.toString());
      if (!response.ok) {
        console.error(`[YouTube] API error: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const items = data.items || [];

      for (const item of items) {
        const videoId = item.id?.videoId;
        if (!videoId || seenIds.has(videoId)) continue;

        seenIds.add(videoId);
        allVideos.push({
          id: videoId,
          title: item.snippet?.title || '',
          description: item.snippet?.description || '',
          channel: item.snippet?.channelTitle || '',
          thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || '',
          publishedAt: item.snippet?.publishedAt,
        });
      }

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`[YouTube] Search error for "${query}":`, error);
    }
  }

  console.log(`[YouTube] Found ${allVideos.length} total videos for ${gearName}`);
  return allVideos;
}

// Use Gemini to select the best tutorial/demo videos
async function selectBestVideosWithGemini(
  gearName: string, 
  brand: string, 
  category: string,
  videos: any[]
): Promise<YouTubeVideo[]> {
  if (!LOVABLE_API_KEY || videos.length === 0) {
    console.log('[Gemini] No API key or no videos to analyze');
    return [];
  }

  try {
    const videoList = videos.map((v, i) => 
      `${i + 1}. "${v.title}" by ${v.channel} - ${v.description?.substring(0, 100)}...`
    ).join('\n');

    const prompt = `You are a gear expert selecting the best YouTube videos for an electronic music equipment database.

GEAR: ${brand} ${gearName}
CATEGORY: ${category}

Available videos:
${videoList}

SELECTION CRITERIA:
1. PREFER tutorials showing how to use the gear
2. PREFER sound demos and patch walkthroughs
3. PREFER in-depth reviews with audio examples
4. PREFER official manufacturer content
5. AVOID reaction videos, unboxing-only content, or off-topic videos
6. The video must be SPECIFICALLY about this exact piece of gear (not similar models)

TRUSTED CHANNELS for gear content:
- Sonicstate, Sonic LAB, BoBeats, Loopop, True Cuckoo, Starsky Carr, 
- Red Means Recording, Benn Jordan, mylarmelodies, Hainbach,
- Official brand channels (Roland, Moog, Elektron, etc.)

Return ONLY valid JSON with your top 4 selections:
{
  "selections": [
    {"index": 1, "reason": "brief reason"},
    {"index": 3, "reason": "brief reason"}
  ]
}

If no videos are suitable, return: {"selections": []}`;

    console.log(`[Gemini] Analyzing ${videos.length} videos for ${gearName}...`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      console.error('[Gemini] API error:', await response.text());
      return [];
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[Gemini] Could not parse response');
      return [];
    }

    const result = JSON.parse(jsonMatch[0]);
    const selections = result.selections || [];

    console.log(`[Gemini] Selected ${selections.length} videos for ${gearName}`);

    // Map selections back to video data
    const selectedVideos: YouTubeVideo[] = [];
    for (const sel of selections) {
      const idx = sel.index - 1;
      if (idx >= 0 && idx < videos.length) {
        const video = videos[idx];
        selectedVideos.push({
          id: video.id,
          title: video.title,
          channel: video.channel,
          thumbnail: video.thumbnail,
          url: `https://www.youtube.com/watch?v=${video.id}`,
        });
      }
    }

    return selectedVideos;
  } catch (error) {
    console.error('[Gemini] Error:', error);
    return [];
  }
}

// Process a single gear item
async function processGearItem(supabase: any, gear: GearItem): Promise<{ success: boolean; videoCount: number; error?: string }> {
  console.log(`\n=== Processing: ${gear.brand} ${gear.name} ===`);

  try {
    // Step 1: Search YouTube
    const searchResults = await searchYouTubeForGear(gear.name, gear.brand);

    if (searchResults.length === 0) {
      return { success: false, videoCount: 0, error: 'No videos found on YouTube' };
    }

    // Step 2: Use Gemini to select best videos
    const selectedVideos = await selectBestVideosWithGemini(
      gear.name, 
      gear.brand, 
      gear.category || 'synthesizer',
      searchResults
    );

    if (selectedVideos.length === 0) {
      // Fallback: take top 3 from search results
      console.log(`[Fallback] Using top search results for ${gear.name}`);
      const fallbackVideos = searchResults.slice(0, 3).map(v => ({
        id: v.id,
        title: v.title,
        channel: v.channel,
        thumbnail: v.thumbnail,
        url: `https://www.youtube.com/watch?v=${v.id}`,
      }));

      if (fallbackVideos.length > 0) {
        await supabase
          .from('gear_catalog')
          .update({ youtube_videos: fallbackVideos, updated_at: new Date().toISOString() })
          .eq('id', gear.id);

        return { success: true, videoCount: fallbackVideos.length };
      }

      return { success: false, videoCount: 0, error: 'Gemini could not select suitable videos' };
    }

    // Step 3: Update database
    const { error: updateError } = await supabase
      .from('gear_catalog')
      .update({ 
        youtube_videos: selectedVideos,
        updated_at: new Date().toISOString()
      })
      .eq('id', gear.id);

    if (updateError) {
      console.error(`[DB] Update error for ${gear.name}:`, updateError);
      return { success: false, videoCount: 0, error: updateError.message };
    }

    console.log(`✓ Updated ${gear.name} with ${selectedVideos.length} videos`);
    return { success: true, videoCount: selectedVideos.length };

  } catch (error) {
    console.error(`Error processing ${gear.name}:`, error);
    return { success: false, videoCount: 0, error: String(error) };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { action = 'batch', limit = 3, gear_id } = body;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log('=== Gear YouTube Curator ===');
    console.log(`YouTube API: ${YOUTUBE_API_KEY ? '✓' : '✗'}`);
    console.log(`Gemini API: ${LOVABLE_API_KEY ? '✓' : '✗'}`);

    if (action === 'status') {
      // Get stats
      const { count: totalGear } = await supabase
        .from('gear_catalog')
        .select('*', { count: 'exact', head: true });

      const { data: withVideos } = await supabase
        .from('gear_catalog')
        .select('id, youtube_videos')
        .not('youtube_videos', 'is', null);

      const hasVideos = (withVideos || []).filter(g => 
        Array.isArray(g.youtube_videos) && g.youtube_videos.length > 0
      ).length;

      return new Response(JSON.stringify({
        success: true,
        stats: {
          total_gear: totalGear || 0,
          with_videos: hasVideos,
          missing_videos: (totalGear || 0) - hasVideos,
          coverage: totalGear ? Math.round(hasVideos / totalGear * 100) : 0
        }
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'single' && gear_id) {
      // Process single gear item
      const { data: gear } = await supabase
        .from('gear_catalog')
        .select('id, name, brand, category, youtube_videos')
        .eq('id', gear_id)
        .single();

      if (!gear) {
        return new Response(JSON.stringify({ success: false, error: 'Gear not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const result = await processGearItem(supabase, gear);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Batch processing - get gear items with missing or empty videos
    const { data: allGear } = await supabase
      .from('gear_catalog')
      .select('id, name, brand, category, youtube_videos')
      .order('name');

    // Filter to items without valid videos
    const gearNeedingVideos = (allGear || []).filter(g => 
      !g.youtube_videos || !Array.isArray(g.youtube_videos) || g.youtube_videos.length === 0
    ).slice(0, limit);

    if (gearNeedingVideos.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'All gear items have videos!',
        processed: 0
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log(`\n>>> BATCH: Processing ${gearNeedingVideos.length} gear items <<<\n`);

    const results: Array<{ name: string; success: boolean; videoCount: number; error?: string }> = [];

    for (const gear of gearNeedingVideos) {
      const result = await processGearItem(supabase, gear);
      results.push({ name: `${gear.brand} ${gear.name}`, ...result });

      // Delay between items
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    const successful = results.filter(r => r.success).length;
    const totalVideos = results.reduce((sum, r) => sum + r.videoCount, 0);

    return new Response(JSON.stringify({
      success: true,
      processed: results.length,
      successful,
      failed: results.length - successful,
      totalVideosAdded: totalVideos,
      results
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
