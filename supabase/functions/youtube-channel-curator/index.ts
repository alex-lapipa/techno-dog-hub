import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Target channel - LA PIPA is LA PIPA
const CHANNEL_HANDLE = "@lapipaislapipa";
const CHANNEL_ID = "UCYourChannelId"; // Will be resolved dynamically

interface PlaylistItem {
  playlistId: string;
  playlistTitle: string;
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
}

interface VideoMatch {
  videoId: string;
  title: string;
  pageType: string;
  entitySlug: string | null;
  reason: string;
  relevanceScore: number;
}

// Fetch all playlists from a channel
async function fetchChannelPlaylists(apiKey: string, channelId: string): Promise<any[]> {
  try {
    const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&channelId=${channelId}&maxResults=50&key=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Playlist fetch error:", await response.text());
      return [];
    }
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return [];
  }
}

// Resolve channel handle to channel ID
async function resolveChannelId(apiKey: string, handle: string): Promise<string | null> {
  try {
    // Try handle lookup first
    const handleUrl = `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${handle.replace('@', '')}&key=${apiKey}`;
    const handleResponse = await fetch(handleUrl);
    if (handleResponse.ok) {
      const data = await handleResponse.json();
      if (data.items && data.items.length > 0) {
        return data.items[0].id;
      }
    }
    
    // Fallback: search for channel
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(handle)}&key=${apiKey}`;
    const searchResponse = await fetch(searchUrl);
    if (searchResponse.ok) {
      const data = await searchResponse.json();
      if (data.items && data.items.length > 0) {
        return data.items[0].id?.channelId || data.items[0].snippet?.channelId;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error resolving channel ID:", error);
    return null;
  }
}

// Fetch videos from a playlist
async function fetchPlaylistVideos(apiKey: string, playlistId: string, playlistTitle: string): Promise<PlaylistItem[]> {
  const videos: PlaylistItem[] = [];
  let nextPageToken: string | undefined = undefined;
  
  try {
    let hasMore = true;
    while (hasMore) {
      const apiUrl: string = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50&key=${apiKey}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
      const apiResponse: Response = await fetch(apiUrl);
      
      if (!apiResponse.ok) {
        console.error(`Error fetching playlist ${playlistId}:`, await apiResponse.text());
        break;
      }
      
      const responseData: any = await apiResponse.json();
      
      for (const item of responseData.items || []) {
        const videoId = item.contentDetails?.videoId;
        if (videoId) {
          videos.push({
            playlistId,
            playlistTitle,
            videoId,
            title: item.snippet?.title || '',
            description: item.snippet?.description || '',
            thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || '',
            publishedAt: item.snippet?.publishedAt || '',
          });
        }
      }
      
      nextPageToken = responseData.nextPageToken;
      hasMore = !!nextPageToken;
    }
  } catch (error) {
    console.error(`Error processing playlist ${playlistId}:`, error);
  }
  
  return videos;
}

// Use Gemini to analyze videos and match to site content
async function analyzeVideosWithGemini(
  videos: PlaylistItem[], 
  siteContent: { crews: string[], venues: string[], festivals: string[], artists: string[] }
): Promise<VideoMatch[]> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    console.error("LOVABLE_API_KEY not configured");
    return [];
  }

  const systemPrompt = `You are a techno music curator for techno.dog, analyzing YouTube videos to match them to relevant pages on the site.

Site sections:
- Crews: Sound systems, collectives, party crews (${siteContent.crews.slice(0, 10).join(', ')}...)
- Venues: Clubs, warehouses (${siteContent.venues.slice(0, 10).join(', ')}...)
- Festivals: Music festivals (${siteContent.festivals.slice(0, 10).join(', ')}...)
- Artists: DJs, producers
- Doggies: Dog-themed content, especially galgo/greyhound rescue
- Homepage: Featured cultural content about techno
- Technopedia: Educational techno content

Analyze each video and return matches in JSON format.`;

  const videoSummary = videos.slice(0, 30).map((v, i) => 
    `${i + 1}. [${v.playlistTitle}] "${v.title}" - ${v.description?.slice(0, 100)}...`
  ).join('\n');

  const userPrompt = `Analyze these videos from LA PIPA is LA PIPA channel and match them to relevant techno.dog pages:

${videoSummary}

Return JSON array of matches:
[{"videoIndex": 1, "pageType": "crew|venue|festival|artist|doggies|homepage|technopedia", "entitySlug": "spiral-tribe or null for general pages", "reason": "brief reason", "relevanceScore": 0.0-1.0}]

Focus on:
- Free party/rave footage → crews like spiral-tribe, teknival
- Club footage → venues like tresor, berghain
- Festival footage → festivals
- Galgo/dog content → doggies page
- Cultural/educational → homepage or technopedia
- Live coding/music production → gear or technopedia

Only return high-confidence matches (score > 0.6). Return empty array if no strong matches.`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error("Gemini API error:", await response.text());
      return [];
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.log("No JSON found in Gemini response");
      return [];
    }

    const matches = JSON.parse(jsonMatch[0]);
    
    // Map back to video data
    return matches.map((match: any) => {
      const video = videos[match.videoIndex - 1];
      if (!video) return null;
      return {
        videoId: video.videoId,
        title: video.title,
        pageType: match.pageType,
        entitySlug: match.entitySlug || null,
        reason: match.reason,
        relevanceScore: match.relevanceScore,
      };
    }).filter(Boolean);
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!YOUTUBE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "YOUTUBE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = await req.json().catch(() => ({}));
    const action = body.action || "sync";

    // Action: Get current status
    if (action === "status") {
      const { data: videos, count: videoCount } = await supabase
        .from("curated_channel_videos")
        .select("*", { count: "exact" });

      const { data: assignments, count: assignmentCount } = await supabase
        .from("curated_video_assignments")
        .select("*", { count: "exact" });

      const { data: syncStatus } = await supabase
        .from("youtube_channel_sync")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      return new Response(
        JSON.stringify({
          success: true,
          stats: {
            videosStored: videoCount || 0,
            assignmentsCreated: assignmentCount || 0,
            lastSync: syncStatus?.[0] || null,
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: Sync channel videos
    if (action === "sync") {
      console.log("Starting channel sync for:", CHANNEL_HANDLE);
      
      // Resolve channel ID
      const channelId = await resolveChannelId(YOUTUBE_API_KEY, CHANNEL_HANDLE);
      if (!channelId) {
        return new Response(
          JSON.stringify({ error: "Could not resolve channel ID" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Resolved channel ID:", channelId);

      // Fetch playlists
      const playlists = await fetchChannelPlaylists(YOUTUBE_API_KEY, channelId);
      console.log(`Found ${playlists.length} playlists`);

      // Fetch all videos from playlists
      const allVideos: PlaylistItem[] = [];
      for (const playlist of playlists) {
        const videos = await fetchPlaylistVideos(
          YOUTUBE_API_KEY, 
          playlist.id, 
          playlist.snippet?.title || "Unknown"
        );
        allVideos.push(...videos);
        console.log(`Fetched ${videos.length} videos from "${playlist.snippet?.title}"`);
      }

      // Deduplicate by video ID
      const uniqueVideos = Array.from(
        new Map(allVideos.map(v => [v.videoId, v])).values()
      );
      console.log(`Total unique videos: ${uniqueVideos.length}`);

      // Store videos in database
      let storedCount = 0;
      for (const video of uniqueVideos) {
        const { error } = await supabase
          .from("curated_channel_videos")
          .upsert({
            video_id: video.videoId,
            title: video.title,
            description: video.description,
            thumbnail_url: video.thumbnail,
            playlist_id: video.playlistId,
            playlist_title: video.playlistTitle,
            published_at: video.publishedAt || null,
          }, { onConflict: "video_id" });

        if (!error) storedCount++;
      }

      // Update sync status
      await supabase
        .from("youtube_channel_sync")
        .upsert({
          channel_id: channelId,
          channel_handle: CHANNEL_HANDLE,
          last_sync_at: new Date().toISOString(),
          videos_synced: storedCount,
          playlists_synced: playlists.length,
          sync_status: "completed",
        }, { onConflict: "channel_id" });

      return new Response(
        JSON.stringify({
          success: true,
          channelId,
          playlistsFound: playlists.length,
          videosStored: storedCount,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: Analyze and match videos to pages
    if (action === "analyze") {
      // Fetch stored videos
      const { data: videos, error: fetchError } = await supabase
        .from("curated_channel_videos")
        .select("*")
        .is("ai_analyzed_at", null)
        .limit(50);

      if (fetchError || !videos?.length) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "No unanalyzed videos found",
            videosAnalyzed: 0 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Site content for matching
      const siteContent = {
        crews: ["spiral-tribe", "teknival", "underground-resistance-crew", "mord-crew", "bassiani-crew", "sandwell-district"],
        venues: ["berghain", "tresor", "about-blank", "bassiani", "concrete", "de-school"],
        festivals: ["awakenings", "dekmantel", "time-warp", "atonal", "sonar", "lev", "aquasella", "unsound"],
        artists: ["jeff-mills", "robert-hood", "ben-klock", "helena-hauff"],
      };

      // Convert to PlaylistItem format for analysis
      const videoItems: PlaylistItem[] = videos.map(v => ({
        playlistId: v.playlist_id || "",
        playlistTitle: v.playlist_title || "",
        videoId: v.video_id,
        title: v.title,
        description: v.description || "",
        thumbnail: v.thumbnail_url || "",
        publishedAt: v.published_at || "",
      }));

      // Analyze with Gemini
      const matches = await analyzeVideosWithGemini(videoItems, siteContent);
      console.log(`Found ${matches.length} video matches`);

      // Store matches as assignments
      let assignmentsCreated = 0;
      for (const match of matches) {
        // Get video UUID
        const { data: videoData } = await supabase
          .from("curated_channel_videos")
          .select("id")
          .eq("video_id", match.videoId)
          .single();

        if (videoData) {
          const { error: assignError } = await supabase
            .from("curated_video_assignments")
            .upsert({
              video_id: videoData.id,
              page_type: match.pageType,
              entity_slug: match.entitySlug,
              assigned_by: "ai",
              assignment_reason: match.reason,
              is_active: true,
            }, { onConflict: "video_id,page_type,entity_slug" });

          if (!assignError) assignmentsCreated++;

          // Mark video as analyzed
          await supabase
            .from("curated_channel_videos")
            .update({
              ai_relevance_score: match.relevanceScore,
              ai_analyzed_at: new Date().toISOString(),
            })
            .eq("id", videoData.id);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          videosAnalyzed: videos.length,
          matchesFound: matches.length,
          assignmentsCreated,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: Get videos for a specific page
    if (action === "get-page-videos") {
      const { pageType, entitySlug } = body;
      
      if (!pageType) {
        return new Response(
          JSON.stringify({ error: "pageType required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // First get assignments
      let assignmentQuery = supabase
        .from("curated_video_assignments")
        .select("id, video_id, display_order, is_featured, assignment_reason")
        .eq("page_type", pageType)
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("display_order", { ascending: true })
        .limit(6);

      if (entitySlug) {
        assignmentQuery = assignmentQuery.eq("entity_slug", entitySlug);
      } else {
        assignmentQuery = assignmentQuery.is("entity_slug", null);
      }

      const { data: assignments, error: assignmentError } = await assignmentQuery;

      if (assignmentError) {
        console.error("Error fetching assignments:", assignmentError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch videos" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!assignments || assignments.length === 0) {
        return new Response(
          JSON.stringify({ success: true, videos: [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get video details
      const videoIds = assignments.map((a: any) => a.video_id);
      const { data: videosData, error: videosError } = await supabase
        .from("curated_channel_videos")
        .select("id, video_id, title, description, thumbnail_url, playlist_title, published_at")
        .in("id", videoIds);

      if (videosError) {
        console.error("Error fetching video details:", videosError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch video details" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Merge assignments with video data
      const videoMap = new Map((videosData || []).map((v: any) => [v.id, v]));
      const videos = assignments.map((item: any) => {
        const videoData = videoMap.get(item.video_id) as any;
        if (!videoData) return null;
        return {
          id: videoData.video_id,
          title: videoData.title,
          description: videoData.description,
          thumbnail: videoData.thumbnail_url,
          playlist: videoData.playlist_title,
          publishedAt: videoData.published_at,
          isFeatured: item.is_featured,
          reason: item.assignment_reason,
        };
      }).filter(Boolean);

      return new Response(
        JSON.stringify({ success: true, videos }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use: status, sync, analyze, get-page-videos" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("YouTube channel curator error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
