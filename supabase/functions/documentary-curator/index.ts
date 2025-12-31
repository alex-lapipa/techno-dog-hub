import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

// La PiPa's YouTube channel - @MusicEncoderTV / @lapipaislapipa
const LAPIPA_CHANNEL_HANDLE = "@MusicEncoderTV";

// Documentary search queries for different categories
const SEARCH_QUERIES = {
  scenes: [
    "techno documentary Berlin",
    "Detroit techno documentary",
    "Tbilisi techno scene documentary",
    "underground techno movement documentary",
    "techno music culture documentary",
    "electronic music scene documentary"
  ],
  pioneers: [
    "Jeff Mills documentary",
    "Underground Resistance documentary",
    "Derrick May techno documentary",
    "Juan Atkins documentary",
    "Carl Craig documentary",
    "techno pioneers interview",
    "electronic music legend interview"
  ],
  sound: [
    "techno production documentary",
    "synthesizer sound design documentary",
    "electronic music production documentary",
    "techno sound design masterclass",
    "analog synthesis documentary"
  ],
  gear: [
    "Roland TR-909 documentary",
    "Roland TB-303 documentary",
    "modular synthesizer documentary",
    "drum machine history documentary",
    "vintage synthesizer documentary",
    "electronic music gear documentary"
  ],
  clubs: [
    "Berghain documentary",
    "Tresor Berlin documentary",
    "legendary nightclub documentary",
    "techno club documentary",
    "warehouse party documentary"
  ],
  collectives: [
    "Underground Resistance collective documentary",
    "techno collective documentary",
    "electronic music label documentary",
    "rave collective documentary"
  ],
  rave: [
    "free party documentary",
    "illegal rave documentary",
    "spiral tribe documentary",
    "UK rave scene documentary",
    "acid house documentary",
    "second summer of love documentary"
  ],
  philosophy: [
    "techno philosophy documentary",
    "electronic music and technology documentary",
    "dance music culture impact documentary",
    "rave culture documentary"
  ]
};

interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  channelName: string;
  channelId: string;
  thumbnailUrl: string;
  publishedAt: string;
  duration?: string;
  viewCount?: number;
  playlistTitle?: string;
}

// Resolve channel handle to channel ID
async function resolveChannelId(handle: string): Promise<string | null> {
  if (!YOUTUBE_API_KEY) return null;
  
  try {
    // Try the channels endpoint with forHandle
    const url = `https://www.googleapis.com/youtube/v3/channels?part=id,snippet&forHandle=${handle.replace('@', '')}&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to resolve channel: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      console.log(`Resolved channel ${handle} to ID: ${data.items[0].id}`);
      return data.items[0].id;
    }
    
    // Fallback: try search
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(handle)}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`;
    const searchResponse = await fetch(searchUrl);
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      if (searchData.items && searchData.items.length > 0) {
        return searchData.items[0].id.channelId || searchData.items[0].snippet.channelId;
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error resolving channel ID:`, error);
    return null;
  }
}

// Fetch all playlists from a channel
async function fetchChannelPlaylists(channelId: string): Promise<{ id: string; title: string }[]> {
  if (!YOUTUBE_API_KEY) return [];
  
  const playlists: { id: string; title: string }[] = [];
  let nextPageToken = "";
  
  try {
    do {
      const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=${channelId}&maxResults=50${nextPageToken ? `&pageToken=${nextPageToken}` : ""}&key=${YOUTUBE_API_KEY}`;
      const response = await fetch(url);
      if (!response.ok) break;
      
      const data = await response.json();
      for (const item of data.items || []) {
        playlists.push({
          id: item.id,
          title: item.snippet.title
        });
      }
      
      nextPageToken = data.nextPageToken || "";
    } while (nextPageToken);
    
    console.log(`Found ${playlists.length} playlists from channel`);
    return playlists;
  } catch (error) {
    console.error(`Error fetching playlists:`, error);
    return playlists;
  }
}

// Fetch videos from a playlist
async function fetchPlaylistVideos(playlistId: string, playlistTitle: string, maxItems = 50): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) return [];
  
  const videos: YouTubeVideo[] = [];
  let nextPageToken = "";
  
  try {
    do {
      const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50${nextPageToken ? `&pageToken=${nextPageToken}` : ""}&key=${YOUTUBE_API_KEY}`;
      const response = await fetch(url);
      if (!response.ok) break;
      
      const data = await response.json();
      
      // Get video IDs for details
      const videoIds = (data.items || []).map((item: any) => item.contentDetails.videoId).join(",");
      
      if (videoIds) {
        const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics,snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = detailsResponse.ok ? await detailsResponse.json() : { items: [] };
        
        for (const item of detailsData.items || []) {
          videos.push({
            videoId: item.id,
            title: item.snippet.title,
            description: item.snippet.description || "",
            channelName: item.snippet.channelTitle,
            channelId: item.snippet.channelId,
            thumbnailUrl: item.snippet.thumbnails?.maxres?.url || 
                          item.snippet.thumbnails?.high?.url || 
                          item.snippet.thumbnails?.medium?.url ||
                          `https://img.youtube.com/vi/${item.id}/maxresdefault.jpg`,
            publishedAt: item.snippet.publishedAt,
            duration: item.contentDetails?.duration,
            viewCount: parseInt(item.statistics?.viewCount || "0", 10),
            playlistTitle
          });
        }
      }
      
      nextPageToken = data.nextPageToken || "";
      if (videos.length >= maxItems) break;
    } while (nextPageToken);
    
    return videos.slice(0, maxItems);
  } catch (error) {
    console.error(`Error fetching playlist videos:`, error);
    return videos;
  }
}

// Search YouTube for documentaries
async function searchYouTube(query: string, maxResults = 10): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) {
    console.error("No YouTube API key configured");
    return [];
  }

  try {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoDuration=long&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`;
    
    const response = await fetch(searchUrl);
    if (!response.ok) {
      console.error(`YouTube API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return [];
    }

    // Get video details for duration and view count
    const videoIds = data.items.map((item: any) => item.id.videoId).join(",");
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
    
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = detailsResponse.ok ? await detailsResponse.json() : { items: [] };
    
    const detailsMap = new Map();
    for (const item of detailsData.items || []) {
      detailsMap.set(item.id, {
        duration: item.contentDetails?.duration,
        viewCount: parseInt(item.statistics?.viewCount || "0", 10)
      });
    }

    return data.items.map((item: any) => {
      const details = detailsMap.get(item.id.videoId) || {};
      return {
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        channelName: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
        publishedAt: item.snippet.publishedAt,
        duration: details.duration,
        viewCount: details.viewCount
      };
    });
  } catch (error) {
    console.error(`Error searching YouTube for "${query}":`, error);
    return [];
  }
}

// Use AI to curate and categorize videos
async function curateVideosWithAI(videos: YouTubeVideo[], categoryMapping: Map<string, string>): Promise<{
  curatedVideos: Array<YouTubeVideo & { categoryId: string; whyWatch: string }>;
}> {
  if (!LOVABLE_API_KEY || videos.length === 0) {
    return { curatedVideos: [] };
  }

  const categoryList = Array.from(categoryMapping.entries())
    .map(([name, id]) => `- "${name}" (ID: ${id})`)
    .join("\n");

  try {
    const prompt = `You are a techno documentary curator for techno.dog. Review these YouTube videos and select the BEST documentaries about techno culture, electronic music, rave culture, gear, artists, scenes, and related topics.

Available categories:
${categoryList}

Videos to review:
${videos.map((v, i) => `${i + 1}. "${v.title}" by ${v.channelName}
   Playlist: ${v.playlistTitle || "N/A"}
   Description: ${v.description?.substring(0, 150) || "No description"}
   Duration: ${v.duration || "Unknown"}
   Views: ${v.viewCount?.toLocaleString() || "Unknown"}`).join("\n\n")}

For EACH video that is a quality documentary about techno/electronic music, provide:
1. The video number
2. The most appropriate category ID
3. A brief "Why Watch" (2-3 sentences explaining its value)

Exclude:
- DJ sets or live performances (unless they're documentary content about a set)
- Music compilations without documentary content
- Content shorter than 5 minutes
- Low quality or amateur content
- Content not primarily about techno/electronic music culture

Respond in JSON format:
{
  "selections": [
    {"number": 1, "categoryId": "category-uuid-here", "whyWatch": "Essential viewing because..."},
    {"number": 5, "categoryId": "another-uuid", "whyWatch": "Deep dive into..."}
  ]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a techno culture expert and documentary curator. Return only valid JSON. Be selective - only choose high-quality documentary content." },
          { role: "user", content: prompt }
        ],
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      console.error("AI curation failed:", await response.text());
      return { curatedVideos: [] };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in AI response");
      return { curatedVideos: [] };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const curatedVideos: Array<YouTubeVideo & { categoryId: string; whyWatch: string }> = [];

    for (const sel of parsed.selections || []) {
      const idx = sel.number - 1;
      if (idx >= 0 && idx < videos.length) {
        curatedVideos.push({
          ...videos[idx],
          categoryId: sel.categoryId,
          whyWatch: sel.whyWatch
        });
      }
    }

    console.log(`AI curated ${curatedVideos.length} documentaries from ${videos.length} videos`);
    return { curatedVideos };
  } catch (error) {
    console.error("AI curation error:", error);
    return { curatedVideos: [] };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, categorySlug, maxVideos = 50 } = await req.json();

    // Get all categories for mapping
    const { data: categories } = await supabase
      .from("documentary_categories")
      .select("id, name, slug")
      .order("display_order");
    
    const categoryMapping = new Map<string, string>();
    const categoryBySlug = new Map<string, { id: string; name: string }>();
    for (const cat of categories || []) {
      categoryMapping.set(cat.name, cat.id);
      categoryBySlug.set(cat.slug, { id: cat.id, name: cat.name });
    }

    if (action === "curate-lapipa") {
      // Curate documentaries from La PiPa's YouTube channel
      console.log("Starting La PiPa channel curation...");
      
      // Resolve channel ID
      const channelId = await resolveChannelId(LAPIPA_CHANNEL_HANDLE);
      if (!channelId) {
        // Try alternative handle
        const altChannelId = await resolveChannelId("@lapipaislapipa");
        if (!altChannelId) {
          return new Response(
            JSON.stringify({ error: "Could not resolve La PiPa channel ID" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      const resolvedChannelId = channelId || await resolveChannelId("@lapipaislapipa");
      if (!resolvedChannelId) {
        return new Response(
          JSON.stringify({ error: "Channel not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Fetch all playlists
      const playlists = await fetchChannelPlaylists(resolvedChannelId);
      
      // Filter for documentary-relevant playlists
      const docKeywords = ["documentary", "doc", "film", "interview", "history", "culture", "story", "legacy", "archive", "techno", "electronic", "rave", "underground", "gear", "synth"];
      const relevantPlaylists = playlists.filter(p => 
        docKeywords.some(kw => p.title.toLowerCase().includes(kw)) ||
        p.title.toLowerCase().includes("best of") ||
        p.title.toLowerCase().includes("classic")
      );

      // If no keyword matches, take all playlists
      const playlistsToProcess = relevantPlaylists.length > 0 ? relevantPlaylists : playlists.slice(0, 10);
      
      console.log(`Processing ${playlistsToProcess.length} playlists...`);

      // Fetch videos from each playlist
      let allVideos: YouTubeVideo[] = [];
      for (const playlist of playlistsToProcess) {
        const videos = await fetchPlaylistVideos(playlist.id, playlist.title, 20);
        allVideos = [...allVideos, ...videos];
        await new Promise(r => setTimeout(r, 300)); // Rate limiting
      }

      // Deduplicate by videoId
      const uniqueVideos = Array.from(
        new Map(allVideos.map(v => [v.videoId, v])).values()
      );

      console.log(`Found ${uniqueVideos.length} unique videos from playlists`);

      // Curate with AI in batches
      const batchSize = 30;
      const results: any[] = [];
      
      for (let i = 0; i < uniqueVideos.length && results.length < maxVideos; i += batchSize) {
        const batch = uniqueVideos.slice(i, i + batchSize);
        const { curatedVideos } = await curateVideosWithAI(batch, categoryMapping);
        
        for (const video of curatedVideos) {
          if (results.length >= maxVideos) break;
          
          const { error } = await supabase
            .from("documentaries")
            .upsert({
              youtube_video_id: video.videoId,
              title: video.title,
              description: video.description,
              channel_name: video.channelName,
              channel_id: video.channelId,
              thumbnail_url: video.thumbnailUrl,
              duration: video.duration,
              published_at: video.publishedAt,
              view_count: video.viewCount,
              category_id: video.categoryId,
              why_watch: video.whyWatch,
              discovery_source: "lapipa-channel",
              status: "published"
            }, {
              onConflict: "youtube_video_id",
              ignoreDuplicates: false
            });

          if (error) {
            console.error(`Error storing: ${error.message}`);
          } else {
            results.push({ 
              videoId: video.videoId, 
              title: video.title,
              playlist: video.playlistTitle 
            });
          }
        }
        
        await new Promise(r => setTimeout(r, 500)); // Rate limiting between batches
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Curated ${results.length} documentaries from La PiPa channel`,
          channelId: resolvedChannelId,
          playlistsProcessed: playlistsToProcess.length,
          results 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "discover") {
      // Discover documentaries via YouTube search
      const categoriesToProcess = categorySlug 
        ? [categorySlug]
        : Object.keys(SEARCH_QUERIES);

      const results: any[] = [];

      for (const catSlug of categoriesToProcess) {
        const queries = SEARCH_QUERIES[catSlug as keyof typeof SEARCH_QUERIES];
        if (!queries) continue;

        const catInfo = categoryBySlug.get(catSlug);
        if (!catInfo) continue;

        console.log(`Processing category: ${catInfo.name}`);

        // Search YouTube for each query
        let allVideos: YouTubeVideo[] = [];
        for (const query of queries.slice(0, 3)) {
          const videos = await searchYouTube(query, 5);
          allVideos = [...allVideos, ...videos];
          await new Promise(r => setTimeout(r, 500));
        }

        // Deduplicate
        const uniqueVideos = Array.from(
          new Map(allVideos.map(v => [v.videoId, v])).values()
        );

        // Curate with AI
        const { curatedVideos } = await curateVideosWithAI(uniqueVideos, categoryMapping);

        for (const video of curatedVideos) {
          const { error } = await supabase
            .from("documentaries")
            .upsert({
              youtube_video_id: video.videoId,
              title: video.title,
              description: video.description,
              channel_name: video.channelName,
              channel_id: video.channelId,
              thumbnail_url: video.thumbnailUrl,
              duration: video.duration,
              published_at: video.publishedAt,
              view_count: video.viewCount,
              category_id: catInfo.id,
              why_watch: video.whyWatch,
              discovery_source: "youtube-api",
              status: "published"
            }, {
              onConflict: "youtube_video_id",
              ignoreDuplicates: false
            });

          if (error) {
            console.error(`Error storing: ${error.message}`);
          } else {
            results.push({ videoId: video.videoId, title: video.title, category: catInfo.name });
          }
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Discovered ${results.length} documentaries`,
          results 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "list") {
      // List documentaries
      let query = supabase
        .from("documentaries")
        .select(`
          *,
          category:documentary_categories(id, name, slug)
        `)
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (categorySlug) {
        const catInfo = categoryBySlug.get(categorySlug);
        if (catInfo) {
          query = query.eq("category_id", catInfo.id);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, documentaries: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action. Use: curate-lapipa, discover, or list" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Documentary curator error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
