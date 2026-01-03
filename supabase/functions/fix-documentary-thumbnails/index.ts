import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ThumbnailFix {
  id: string;
  title: string;
  youtube_video_id: string;
  old_thumbnail: string | null;
  new_thumbnail: string | null;
  status: "fixed" | "unavailable" | "already_valid" | "error";
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

    const { action, dryRun = false } = await req.json().catch(() => ({ action: "scan", dryRun: false }));

    // Fetch all published documentaries
    const { data: docs, error: fetchError } = await supabase
      .from("documentaries")
      .select("id, youtube_video_id, title, thumbnail_url")
      .eq("status", "published");

    if (fetchError) throw fetchError;

    console.log(`Checking thumbnails for ${docs?.length || 0} documentaries...`);

    const results: ThumbnailFix[] = [];
    const batchSize = 50;

    for (let i = 0; i < (docs?.length || 0); i += batchSize) {
      const batch = docs!.slice(i, i + batchSize);
      const videoIds = batch.map(d => d.youtube_video_id).join(",");

      // Get video details from YouTube API
      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,status&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`YouTube API error: ${response.status}`);
        // Mark all in batch as error
        for (const doc of batch) {
          results.push({
            id: doc.id,
            title: doc.title,
            youtube_video_id: doc.youtube_video_id,
            old_thumbnail: doc.thumbnail_url,
            new_thumbnail: null,
            status: "error",
            error: `YouTube API error: ${response.status}`
          });
        }
        continue;
      }

      const data = await response.json();

      // Process each video in batch
      for (const doc of batch) {
        const item = (data.items || []).find((i: any) => i.id === doc.youtube_video_id);
        
        if (!item) {
          // Video not found - mark as unavailable
          results.push({
            id: doc.id,
            title: doc.title,
            youtube_video_id: doc.youtube_video_id,
            old_thumbnail: doc.thumbnail_url,
            new_thumbnail: null,
            status: "unavailable",
            error: "Video not found or deleted"
          });
          continue;
        }

        // Get best available thumbnail
        const thumbnails = item.snippet?.thumbnails || {};
        const bestThumbnail = 
          thumbnails.maxres?.url || 
          thumbnails.standard?.url || 
          thumbnails.high?.url || 
          thumbnails.medium?.url || 
          thumbnails.default?.url;

        if (!bestThumbnail) {
          results.push({
            id: doc.id,
            title: doc.title,
            youtube_video_id: doc.youtube_video_id,
            old_thumbnail: doc.thumbnail_url,
            new_thumbnail: null,
            status: "unavailable",
            error: "No thumbnail available from YouTube"
          });
          continue;
        }

        // Check if current thumbnail matches YouTube's best
        const currentThumbnail = doc.thumbnail_url;
        const needsUpdate = !currentThumbnail || 
          currentThumbnail !== bestThumbnail ||
          // Also fix if using lower quality version
          (currentThumbnail?.includes("hqdefault") && bestThumbnail.includes("maxres"));

        if (needsUpdate) {
          if (!dryRun && action === "fix") {
            // Update the database
            const { error: updateError } = await supabase
              .from("documentaries")
              .update({ thumbnail_url: bestThumbnail })
              .eq("id", doc.id);

            if (updateError) {
              results.push({
                id: doc.id,
                title: doc.title,
                youtube_video_id: doc.youtube_video_id,
                old_thumbnail: currentThumbnail,
                new_thumbnail: bestThumbnail,
                status: "error",
                error: updateError.message
              });
              continue;
            }
          }

          results.push({
            id: doc.id,
            title: doc.title,
            youtube_video_id: doc.youtube_video_id,
            old_thumbnail: currentThumbnail,
            new_thumbnail: bestThumbnail,
            status: "fixed"
          });
        } else {
          results.push({
            id: doc.id,
            title: doc.title,
            youtube_video_id: doc.youtube_video_id,
            old_thumbnail: currentThumbnail,
            new_thumbnail: bestThumbnail,
            status: "already_valid"
          });
        }
      }
    }

    // Summary
    const fixed = results.filter(r => r.status === "fixed");
    const unavailable = results.filter(r => r.status === "unavailable");
    const alreadyValid = results.filter(r => r.status === "already_valid");
    const errors = results.filter(r => r.status === "error");

    console.log(`Thumbnail check complete:`);
    console.log(`- Fixed/To Fix: ${fixed.length}`);
    console.log(`- Already Valid: ${alreadyValid.length}`);
    console.log(`- Unavailable: ${unavailable.length}`);
    console.log(`- Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        dryRun,
        action,
        total: docs?.length || 0,
        summary: {
          fixed: fixed.length,
          alreadyValid: alreadyValid.length,
          unavailable: unavailable.length,
          errors: errors.length
        },
        fixedDocumentaries: fixed,
        unavailableDocumentaries: unavailable,
        errorDocumentaries: errors
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Thumbnail fix error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
