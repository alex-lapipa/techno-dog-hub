import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

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
}

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

async function curateVideosWithAI(videos: YouTubeVideo[], categoryName: string): Promise<{
  selectedVideos: YouTubeVideo[];
  whyWatch: Map<string, string>;
}> {
  if (!LOVABLE_API_KEY || videos.length === 0) {
    return { selectedVideos: videos, whyWatch: new Map() };
  }

  try {
    const prompt = `You are a techno documentary curator. Review these YouTube videos and select the most relevant, high-quality documentaries about ${categoryName}.

Videos to review:
${videos.map((v, i) => `${i + 1}. "${v.title}" by ${v.channelName}
   Description: ${v.description?.substring(0, 200) || "No description"}
   Views: ${v.viewCount?.toLocaleString() || "Unknown"}`).join("\n\n")}

For each video you recommend, provide:
1. The video number (1-${videos.length})
2. A brief "Why Watch" description (2-3 sentences explaining its value to techno enthusiasts)

Exclude:
- Low quality or amateur content
- Music compilations that aren't documentaries
- Content shorter than 10 minutes
- Non-English content without subtitles
- Clickbait or misleading titles

Respond in JSON format:
{
  "recommendations": [
    {"number": 1, "whyWatch": "Essential viewing because..."},
    {"number": 3, "whyWatch": "Deep dive into..."}
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
          { role: "system", content: "You are a techno culture expert and documentary curator. Return only valid JSON." },
          { role: "user", content: prompt }
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      console.error("AI curation failed:", await response.text());
      return { selectedVideos: videos.slice(0, 5), whyWatch: new Map() };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { selectedVideos: videos.slice(0, 5), whyWatch: new Map() };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const selectedVideos: YouTubeVideo[] = [];
    const whyWatch = new Map<string, string>();

    for (const rec of parsed.recommendations || []) {
      const idx = rec.number - 1;
      if (idx >= 0 && idx < videos.length) {
        selectedVideos.push(videos[idx]);
        whyWatch.set(videos[idx].videoId, rec.whyWatch);
      }
    }

    return { selectedVideos, whyWatch };
  } catch (error) {
    console.error("AI curation error:", error);
    return { selectedVideos: videos.slice(0, 5), whyWatch: new Map() };
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

    const { action, categorySlug } = await req.json();

    if (action === "discover") {
      // Discover documentaries for a specific category or all categories
      const categoriesToProcess = categorySlug 
        ? [categorySlug]
        : Object.keys(SEARCH_QUERIES);

      const results: any[] = [];

      for (const catSlug of categoriesToProcess) {
        const queries = SEARCH_QUERIES[catSlug as keyof typeof SEARCH_QUERIES];
        if (!queries) continue;

        // Get category ID
        const { data: category } = await supabase
          .from("documentary_categories")
          .select("id, name")
          .eq("slug", catSlug)
          .single();

        if (!category) continue;

        console.log(`Processing category: ${category.name}`);

        // Search YouTube for each query
        let allVideos: YouTubeVideo[] = [];
        for (const query of queries.slice(0, 3)) { // Limit queries per category
          const videos = await searchYouTube(query, 5);
          allVideos = [...allVideos, ...videos];
          await new Promise(r => setTimeout(r, 500)); // Rate limiting
        }

        // Deduplicate by videoId
        const uniqueVideos = Array.from(
          new Map(allVideos.map(v => [v.videoId, v])).values()
        );

        // Curate with AI
        const { selectedVideos, whyWatch } = await curateVideosWithAI(
          uniqueVideos,
          category.name
        );

        // Store in database
        for (const video of selectedVideos) {
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
              category_id: category.id,
              why_watch: whyWatch.get(video.videoId) || null,
              discovery_source: "youtube-api",
              status: "published"
            }, {
              onConflict: "youtube_video_id",
              ignoreDuplicates: false
            });

          if (error) {
            console.error(`Error storing documentary: ${error.message}`);
          } else {
            results.push({ videoId: video.videoId, title: video.title, category: category.name });
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
      // List documentaries, optionally filtered by category
      let query = supabase
        .from("documentaries")
        .select(`
          *,
          category:documentary_categories(id, name, slug)
        `)
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (categorySlug) {
        const { data: cat } = await supabase
          .from("documentary_categories")
          .select("id")
          .eq("slug", categorySlug)
          .single();
        
        if (cat) {
          query = query.eq("category_id", cat.id);
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
      JSON.stringify({ error: "Unknown action" }),
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
