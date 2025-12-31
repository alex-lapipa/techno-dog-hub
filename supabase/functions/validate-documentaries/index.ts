import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VideoValidation {
  id: string;
  youtube_video_id: string;
  title: string;
  status: "valid" | "invalid" | "private" | "deleted";
  duration_minutes?: number;
  current_title?: string;
  error?: string;
}

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

    const { action } = await req.json().catch(() => ({ action: "validate" }));

    // Fetch all published documentaries
    const { data: docs, error: fetchError } = await supabase
      .from("documentaries")
      .select("id, youtube_video_id, title, duration")
      .eq("status", "published");

    if (fetchError) throw fetchError;

    console.log(`Validating ${docs?.length || 0} documentaries...`);

    const results: VideoValidation[] = [];
    const batchSize = 50;

    for (let i = 0; i < (docs?.length || 0); i += batchSize) {
      const batch = docs!.slice(i, i + batchSize);
      const videoIds = batch.map(d => d.youtube_video_id).join(",");

      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,status&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`YouTube API error: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const foundIds = new Set((data.items || []).map((item: any) => item.id));

      // Check each video in batch
      for (const doc of batch) {
        const item = (data.items || []).find((i: any) => i.id === doc.youtube_video_id);
        
        if (!item) {
          // Video not found - deleted or invalid ID
          results.push({
            id: doc.id,
            youtube_video_id: doc.youtube_video_id,
            title: doc.title,
            status: "deleted",
            error: "Video not found or deleted"
          });
        } else if (item.status?.privacyStatus === "private") {
          results.push({
            id: doc.id,
            youtube_video_id: doc.youtube_video_id,
            title: doc.title,
            status: "private",
            error: "Video is private"
          });
        } else if (!item.status?.embeddable) {
          results.push({
            id: doc.id,
            youtube_video_id: doc.youtube_video_id,
            title: doc.title,
            status: "invalid",
            error: "Video is not embeddable"
          });
        } else {
          // Parse duration to minutes
          const duration = item.contentDetails?.duration || "";
          const durationMinutes = parseDurationToMinutes(duration);
          
          results.push({
            id: doc.id,
            youtube_video_id: doc.youtube_video_id,
            title: doc.title,
            status: "valid",
            duration_minutes: durationMinutes,
            current_title: item.snippet?.title
          });
        }
      }
    }

    // Separate valid and invalid
    const validDocs = results.filter(r => r.status === "valid");
    const invalidDocs = results.filter(r => r.status !== "valid");
    const underFortyMinutes = validDocs.filter(r => (r.duration_minutes || 0) < 40);

    console.log(`Validation complete:`);
    console.log(`- Valid: ${validDocs.length}`);
    console.log(`- Invalid/Deleted/Private: ${invalidDocs.length}`);
    console.log(`- Under 40 minutes: ${underFortyMinutes.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        total: docs?.length || 0,
        valid: validDocs.length,
        invalid: invalidDocs.length,
        underFortyMinutes: underFortyMinutes.length,
        invalidDocumentaries: invalidDocs,
        shortDocumentaries: underFortyMinutes.map(d => ({
          id: d.id,
          title: d.title,
          duration_minutes: d.duration_minutes
        })),
        allResults: results
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Validation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function parseDurationToMinutes(isoDuration: string): number {
  // Parse ISO 8601 duration (PT1H30M45S)
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  
  return hours * 60 + minutes + Math.round(seconds / 60);
}
