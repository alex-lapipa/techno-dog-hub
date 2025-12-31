import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
    if (!YOUTUBE_API_KEY) {
      throw new Error("YOUTUBE_API_KEY not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, docId, newVideoId, title, searchQuery } = await req.json();

    if (action === "search") {
      // Search YouTube for a documentary
      const query = encodeURIComponent(searchQuery + " documentary full");
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&videoDuration=long&maxResults=5&key=${YOUTUBE_API_KEY}`;
      
      const searchResponse = await fetch(url);
      if (!searchResponse.ok) {
        throw new Error(`YouTube search failed: ${searchResponse.status}`);
      }
      
      const searchData = await searchResponse.json();
      const videoIds = (searchData.items || []).map((i: any) => i.id.videoId).join(",");
      
      if (!videoIds) {
        return new Response(
          JSON.stringify({ success: false, error: "No videos found" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get video details
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,status,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();

      const validVideos = (detailsData.items || [])
        .filter((v: any) => v.status?.embeddable && v.status?.privacyStatus === "public")
        .map((v: any) => ({
          videoId: v.id,
          title: v.snippet.title,
          channelName: v.snippet.channelTitle,
          duration: v.contentDetails.duration,
          durationMinutes: parseDurationToMinutes(v.contentDetails.duration),
          viewCount: parseInt(v.statistics?.viewCount || "0", 10),
          thumbnailUrl: v.snippet.thumbnails?.maxres?.url || v.snippet.thumbnails?.high?.url
        }))
        .filter((v: any) => v.durationMinutes >= 40);

      return new Response(
        JSON.stringify({ success: true, videos: validVideos }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "replace") {
      // Replace a documentary's video ID with a new working one
      if (!docId || !newVideoId) {
        throw new Error("docId and newVideoId required");
      }

      // First verify the new video is valid
      const verifyUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,status,statistics&id=${newVideoId}&key=${YOUTUBE_API_KEY}`;
      const verifyResponse = await fetch(verifyUrl);
      const verifyData = await verifyResponse.json();

      if (!verifyData.items?.length) {
        throw new Error("New video ID is invalid");
      }

      const video = verifyData.items[0];
      if (!video.status?.embeddable || video.status?.privacyStatus !== "public") {
        throw new Error("New video is not embeddable or not public");
      }

      const thumbnailUrl = 
        video.snippet.thumbnails?.maxres?.url ||
        video.snippet.thumbnails?.standard?.url ||
        video.snippet.thumbnails?.high?.url ||
        `https://img.youtube.com/vi/${newVideoId}/hqdefault.jpg`;

      const { error: updateError } = await supabase
        .from("documentaries")
        .update({
          youtube_video_id: newVideoId,
          title: title || video.snippet.title,
          channel_name: video.snippet.channelTitle,
          duration: video.contentDetails.duration,
          view_count: parseInt(video.statistics?.viewCount || "0", 10),
          thumbnail_url: thumbnailUrl,
          updated_at: new Date().toISOString()
        })
        .eq("id", docId);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Updated documentary with new video: ${video.snippet.title}`,
          videoId: newVideoId
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "add") {
      // Add a new documentary
      if (!newVideoId) {
        throw new Error("newVideoId required");
      }

      // Check if already exists
      const { data: existing } = await supabase
        .from("documentaries")
        .select("id")
        .eq("youtube_video_id", newVideoId)
        .single();

      if (existing) {
        return new Response(
          JSON.stringify({ success: false, error: "Documentary already exists" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get video details
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,status,statistics&id=${newVideoId}&key=${YOUTUBE_API_KEY}`;
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();

      if (!detailsData.items?.length) {
        throw new Error("Video not found");
      }

      const video = detailsData.items[0];
      if (!video.status?.embeddable || video.status?.privacyStatus !== "public") {
        throw new Error("Video is not embeddable or not public");
      }

      const durationMinutes = parseDurationToMinutes(video.contentDetails.duration);
      if (durationMinutes < 40) {
        return new Response(
          JSON.stringify({ success: false, error: `Video too short: ${durationMinutes} minutes` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const thumbnailUrl = 
        video.snippet.thumbnails?.maxres?.url ||
        video.snippet.thumbnails?.standard?.url ||
        video.snippet.thumbnails?.high?.url ||
        `https://img.youtube.com/vi/${newVideoId}/hqdefault.jpg`;

      const { error: insertError } = await supabase
        .from("documentaries")
        .insert({
          youtube_video_id: newVideoId,
          title: title || video.snippet.title,
          channel_name: video.snippet.channelTitle,
          duration: video.contentDetails.duration,
          view_count: parseInt(video.statistics?.viewCount || "0", 10),
          thumbnail_url: thumbnailUrl,
          status: "published",
          discovery_source: "manual_curation"
        });

      if (insertError) throw insertError;

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Added documentary: ${video.snippet.title}`,
          durationMinutes
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "archive-short") {
      // Archive documentaries under 40 minutes
      const { data: shortDocs, error: fetchError } = await supabase
        .from("documentaries")
        .select("id, title, duration")
        .eq("status", "published");

      if (fetchError) throw fetchError;

      const toArchive: string[] = [];
      for (const doc of shortDocs || []) {
        const minutes = parseDurationToMinutes(doc.duration || "");
        if (minutes > 0 && minutes < 40) {
          toArchive.push(doc.id);
        }
      }

      if (toArchive.length > 0) {
        const { error: archiveError } = await supabase
          .from("documentaries")
          .update({ status: "archived" })
          .in("id", toArchive);

        if (archiveError) throw archiveError;
      }

      return new Response(
        JSON.stringify({ success: true, archived: toArchive.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Fix documentaries error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function parseDurationToMinutes(isoDuration: string): number {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  
  return hours * 60 + minutes + Math.round(seconds / 60);
}
