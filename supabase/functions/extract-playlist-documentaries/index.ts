import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Parse ISO 8601 duration to minutes
function parseDurationToMinutes(isoDuration: string): number {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  return hours * 60 + minutes + (seconds > 30 ? 1 : 0);
}

// Documentary categories for techno.dog
const CATEGORY_MAPPING: Record<string, string> = {
  "pioneers": "f469002d-da5d-41a1-9a12-0604e3ac4efc",
  "artists": "f469002d-da5d-41a1-9a12-0604e3ac4efc",
  "clubs": "a6d3b5bb-526b-4c6b-afe8-2875a0ce0908",
  "venues": "a6d3b5bb-526b-4c6b-afe8-2875a0ce0908",
  "gear": "3fbd8da5-60ed-47ef-84d9-ec3c18460aeb",
  "technology": "3fbd8da5-60ed-47ef-84d9-ec3c18460aeb",
  "synth": "3fbd8da5-60ed-47ef-84d9-ec3c18460aeb",
  "rave": "780a24b0-c21b-4118-afa7-680d56ed252f",
  "acid": "780a24b0-c21b-4118-afa7-680d56ed252f",
  "party": "780a24b0-c21b-4118-afa7-680d56ed252f",
  "scenes": "a267d44d-841f-4508-afe3-96d128a16e81",
  "movements": "a267d44d-841f-4508-afe3-96d128a16e81",
  "berlin": "a267d44d-841f-4508-afe3-96d128a16e81",
  "detroit": "a267d44d-841f-4508-afe3-96d128a16e81",
  "collectives": "8a2a2653-aad9-4610-b5e7-6186923147b0",
  "labels": "8a2a2653-aad9-4610-b5e7-6186923147b0",
  "sound": "285290fe-59c2-4959-8a77-d2e5b3d1ed96",
  "production": "285290fe-59c2-4959-8a77-d2e5b3d1ed96",
  "philosophy": "5d24f0f8-9cb4-4ccc-a282-5c61944b6dd8",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { playlistId } = await req.json();
    
    const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!YOUTUBE_API_KEY) {
      throw new Error("YOUTUBE_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const targetPlaylistId = playlistId || "PLfcYOdV5W3jBLl8mTmrX426gYdLMStunL";

    console.log(`Extracting documentaries from playlist: ${targetPlaylistId}`);

    // Fetch all videos from the playlist
    const allVideos: any[] = [];
    let nextPageToken: string | undefined;

    do {
      const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${targetPlaylistId}&maxResults=50&key=${YOUTUBE_API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ""}`;
      
      const playlistResponse = await fetch(playlistUrl);
      if (!playlistResponse.ok) {
        const errorText = await playlistResponse.text();
        console.error("Playlist fetch error:", errorText);
        throw new Error(`Failed to fetch playlist: ${errorText}`);
      }

      const playlistData = await playlistResponse.json();
      
      for (const item of playlistData.items || []) {
        const videoId = item.contentDetails?.videoId;
        if (videoId) {
          allVideos.push({
            videoId,
            title: item.snippet?.title || "",
            description: item.snippet?.description || "",
            thumbnail: item.snippet?.thumbnails?.maxres?.url || 
                       item.snippet?.thumbnails?.high?.url ||
                       `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            channelTitle: item.snippet?.videoOwnerChannelTitle || "La Pipa",
          });
        }
      }

      nextPageToken = playlistData.nextPageToken;
    } while (nextPageToken);

    console.log(`Found ${allVideos.length} videos in playlist`);

    // Get video details in batches of 50 (API limit)
    const allVideoDetails: any[] = [];
    for (let i = 0; i < allVideos.length; i += 50) {
      const batch = allVideos.slice(i, i + 50);
      const videoIds = batch.map(v => v.videoId).join(",");
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics,status&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
      
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();
      allVideoDetails.push(...(detailsData.items || []));
    }

    console.log(`Got details for ${allVideoDetails.length} videos`);

    // Analyze all videos with their durations
    const allWithDurations: any[] = [];
    const qualifyingVideos: any[] = [];
    
    for (const video of allVideos) {
      const details = allVideoDetails.find((d: any) => d.id === video.videoId);
      if (!details) continue;

      const durationMinutes = parseDurationToMinutes(details.contentDetails?.duration || "");
      const isPublic = details.status?.privacyStatus === "public";
      const isEmbeddable = details.status?.embeddable !== false;

      allWithDurations.push({
        title: video.title,
        durationMinutes,
        isPublic,
        isEmbeddable,
      });

      if (durationMinutes >= 40 && isPublic && isEmbeddable) {
        qualifyingVideos.push({
          ...video,
          duration: details.contentDetails?.duration,
          durationMinutes,
          viewCount: parseInt(details.statistics?.viewCount || "0", 10),
        });
      }
    }

    // Log duration distribution
    const over30 = allWithDurations.filter(v => v.durationMinutes >= 30).length;
    const over20 = allWithDurations.filter(v => v.durationMinutes >= 20).length;
    console.log(`Duration distribution: ${qualifyingVideos.length} >= 40min, ${over30} >= 30min, ${over20} >= 20min`);
    console.log(`Top 10 longest videos:`, allWithDurations.sort((a, b) => b.durationMinutes - a.durationMinutes).slice(0, 10));

    // Check which ones are already in documentaries table
    const { data: existingDocs } = await supabase
      .from("documentaries")
      .select("youtube_video_id")
      .in("youtube_video_id", qualifyingVideos.map(v => v.videoId));

    const existingIds = new Set((existingDocs || []).map(d => d.youtube_video_id));
    const newVideos = qualifyingVideos.filter(v => !existingIds.has(v.videoId));

    console.log(`${newVideos.length} are new (not already in database)`);

    // Use Gemini to analyze and categorize new videos
    const analyzedVideos: any[] = [];

    if (GEMINI_API_KEY && newVideos.length > 0) {
      const prompt = `Analyze these documentary videos for a techno/electronic music archive called techno.dog. 
      
For each video, determine:
1. If it fits the techno/electronic music culture archive (return true/false)
2. The best category from: pioneers (artists), clubs (venues), gear (technology/synths), rave (acid house/parties), scenes (movements/cities), collectives (labels), sound (production), philosophy
3. A brief "why watch" description (1-2 sentences)

Videos to analyze:
${newVideos.map((v, i) => `${i + 1}. "${v.title}" - ${v.description?.slice(0, 200) || "No description"}`).join("\n")}

Respond in JSON format:
{
  "analyses": [
    { "index": 1, "fits": true, "category": "pioneers", "whyWatch": "Essential viewing..." },
    ...
  ]
}`;

      try {
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 4096,
              },
            }),
          }
        );

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
          
          // Extract JSON from response
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            
            for (const analysis of parsed.analyses || []) {
              const video = newVideos[analysis.index - 1];
              if (video && analysis.fits) {
                analyzedVideos.push({
                  ...video,
                  category: analysis.category,
                  whyWatch: analysis.whyWatch,
                  categoryId: CATEGORY_MAPPING[analysis.category] || CATEGORY_MAPPING.scenes,
                });
              }
            }
          }
        }
      } catch (geminiError) {
        console.error("Gemini analysis error:", geminiError);
        // Fallback: add all new videos with default category
        for (const video of newVideos) {
          analyzedVideos.push({
            ...video,
            category: "scenes",
            whyWatch: "Documentary from La Pipa's curated collection on electronic music culture.",
            categoryId: CATEGORY_MAPPING.scenes,
          });
        }
      }
    } else {
      // No Gemini key, use simple matching
      for (const video of newVideos) {
        const titleLower = video.title.toLowerCase();
        let category = "scenes";
        
        for (const [keyword, catId] of Object.entries(CATEGORY_MAPPING)) {
          if (titleLower.includes(keyword)) {
            category = keyword;
            break;
          }
        }
        
        analyzedVideos.push({
          ...video,
          category,
          whyWatch: "Documentary from La Pipa's curated collection.",
          categoryId: CATEGORY_MAPPING[category] || CATEGORY_MAPPING.scenes,
        });
      }
    }

    console.log(`${analyzedVideos.length} videos analyzed and ready to add`);

    // Insert new documentaries
    const inserted: any[] = [];
    const errors: any[] = [];

    for (const video of analyzedVideos) {
      try {
        const { error: insertError } = await supabase
          .from("documentaries")
          .insert({
            youtube_video_id: video.videoId,
            title: video.title,
            channel_name: video.channelTitle,
            duration: video.duration,
            view_count: video.viewCount,
            thumbnail_url: video.thumbnail,
            why_watch: video.whyWatch,
            category_id: video.categoryId,
            status: "published",
            discovery_source: "la_pipa_playlist",
          });

        if (insertError) {
          errors.push({ video: video.title, error: insertError.message });
        } else {
          inserted.push({ title: video.title, category: video.category, durationMinutes: video.durationMinutes });
        }
      } catch (e) {
        errors.push({ video: video.title, error: String(e) });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        playlistId: targetPlaylistId,
        totalInPlaylist: allVideos.length,
        qualifying40Plus: qualifyingVideos.length,
        alreadyExists: existingIds.size,
        newVideosAnalyzed: analyzedVideos.length,
        inserted: inserted.length,
        insertedVideos: inserted,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Extract playlist error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
