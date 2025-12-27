import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Project structure for AI analysis
const PROJECT_STRUCTURE = {
  adminPages: [
    { name: "Admin Dashboard", path: "/admin", file: "Admin.tsx", purpose: "Main admin login and navigation hub" },
    { name: "Media Curator", path: "/admin/media", file: "MediaAdmin.tsx", purpose: "Photo retrieval, verification, and management" },
    { name: "Submissions Admin", path: "/admin/submissions", file: "SubmissionsAdmin.tsx", purpose: "Review community submissions" },
    { name: "Content Moderation", path: "/admin/moderation", file: "AdminModeration.tsx", purpose: "Moderate photos and corrections" },
    { name: "News Agent", path: "/admin/news-agent", file: "NewsAgentAdmin.tsx", purpose: "AI news generation management" },
    { name: "DJ Artists Admin", path: "/admin/dj-artists", file: "DJArtistsAdmin.tsx", purpose: "Manage DJ artist database" },
    { name: "Analytics", path: "/analytics", file: "Analytics.tsx", purpose: "Site usage and AI insights" },
  ],
  edgeFunctions: [
    { name: "admin-auth", purpose: "Admin password authentication" },
    { name: "media-curator", purpose: "Fetch images from Wikimedia/MusicBrainz" },
    { name: "media-verify", purpose: "OpenAI vision to verify image quality" },
    { name: "media-scheduler", purpose: "Process media job queue" },
    { name: "media-api", purpose: "API for media asset management" },
    { name: "news-agent", purpose: "AI news story discovery and generation" },
    { name: "write-article", purpose: "AI article writing" },
    { name: "content-sync", purpose: "Sync content with AI verification" },
    { name: "submission-notification", purpose: "Email notifications for submissions" },
    { name: "community-signup", purpose: "Community member registration" },
    { name: "analytics-insights", purpose: "AI-generated analytics insights" },
    { name: "rag-chat", purpose: "RAG-based techno knowledge chat" },
    { name: "api-keys", purpose: "Developer API key management" },
    { name: "webhook-dispatch", purpose: "Webhook event dispatching" },
    { name: "youtube-search", purpose: "YouTube video search for artists" },
  ],
  databaseTables: [
    { name: "media_assets", purpose: "Curated images for entities" },
    { name: "media_pipeline_jobs", purpose: "Image processing queue" },
    { name: "community_submissions", purpose: "User-submitted content" },
    { name: "community_profiles", purpose: "Community member profiles" },
    { name: "content_sync", purpose: "Content verification status" },
    { name: "td_news_articles", purpose: "AI-generated news articles" },
    { name: "td_news_agent_runs", purpose: "News agent execution logs" },
    { name: "td_knowledge_entities", purpose: "Knowledge graph entities" },
    { name: "dj_artists", purpose: "DJ artist database with embeddings" },
    { name: "documents", purpose: "RAG document chunks" },
    { name: "analytics_events", purpose: "User behavior tracking" },
    { name: "analytics_insights", purpose: "AI-generated insights" },
    { name: "api_keys", purpose: "Developer API keys" },
    { name: "api_usage", purpose: "API rate limiting" },
    { name: "webhooks", purpose: "Webhook subscriptions" },
    { name: "webhook_deliveries", purpose: "Webhook delivery logs" },
    { name: "user_roles", purpose: "Admin role assignments" },
    { name: "profiles", purpose: "User profiles" },
  ],
  entityTypes: ["artist", "venue", "festival", "label", "release", "crew", "gear"],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Gather current stats from database
    const [
      mediaAssetsRes,
      pipelineJobsRes,
      submissionsRes,
      articlesRes,
      djArtistsRes,
      documentsRes,
      apiKeysRes,
      webhooksRes,
      communityProfilesRes,
    ] = await Promise.all([
      supabase.from("media_assets").select("id, final_selected, openai_verified, entity_type", { count: "exact" }),
      supabase.from("media_pipeline_jobs").select("id, status", { count: "exact" }),
      supabase.from("community_submissions").select("id, status", { count: "exact" }),
      supabase.from("td_news_articles").select("id, status", { count: "exact" }),
      supabase.from("dj_artists").select("id", { count: "exact" }),
      supabase.from("documents").select("id", { count: "exact" }),
      supabase.from("api_keys").select("id, status", { count: "exact" }),
      supabase.from("webhooks").select("id, status", { count: "exact" }),
      supabase.from("community_profiles").select("id, status", { count: "exact" }),
    ]);

    const currentStats = {
      mediaAssets: {
        total: mediaAssetsRes.count || 0,
        selected: mediaAssetsRes.data?.filter(a => a.final_selected).length || 0,
        verified: mediaAssetsRes.data?.filter(a => a.openai_verified).length || 0,
        byType: {
          artist: mediaAssetsRes.data?.filter(a => a.entity_type === "artist").length || 0,
          venue: mediaAssetsRes.data?.filter(a => a.entity_type === "venue").length || 0,
          festival: mediaAssetsRes.data?.filter(a => a.entity_type === "festival").length || 0,
        }
      },
      pipelineJobs: {
        total: pipelineJobsRes.count || 0,
        queued: pipelineJobsRes.data?.filter(j => j.status === "queued").length || 0,
        running: pipelineJobsRes.data?.filter(j => j.status === "running").length || 0,
        complete: pipelineJobsRes.data?.filter(j => j.status === "complete").length || 0,
        failed: pipelineJobsRes.data?.filter(j => j.status === "failed").length || 0,
      },
      submissions: {
        total: submissionsRes.count || 0,
        pending: submissionsRes.data?.filter(s => s.status === "pending").length || 0,
        approved: submissionsRes.data?.filter(s => s.status === "approved").length || 0,
        rejected: submissionsRes.data?.filter(s => s.status === "rejected").length || 0,
      },
      articles: {
        total: articlesRes.count || 0,
        published: articlesRes.data?.filter(a => a.status === "published").length || 0,
        draft: articlesRes.data?.filter(a => a.status === "draft").length || 0,
      },
      djArtists: djArtistsRes.count || 0,
      documents: documentsRes.count || 0,
      apiKeys: {
        total: apiKeysRes.count || 0,
        active: apiKeysRes.data?.filter(k => k.status === "active").length || 0,
      },
      webhooks: {
        total: webhooksRes.count || 0,
        active: webhooksRes.data?.filter(w => w.status === "active").length || 0,
      },
      communityProfiles: {
        total: communityProfilesRes.count || 0,
        verified: communityProfilesRes.data?.filter(p => p.status === "verified").length || 0,
      },
    };

    console.log("Current stats gathered:", JSON.stringify(currentStats, null, 2));

    if (action === "get-stats") {
      return new Response(JSON.stringify({ 
        stats: currentStats,
        structure: PROJECT_STRUCTURE 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // AI Analysis
    const systemPrompt = `You are a senior software architect specializing in admin dashboard design for content management systems.
    
You are analyzing a techno music encyclopedia website called "techno.dog" (Global Techno Knowledge).

The site manages:
- Artists (DJs, producers)
- Venues (clubs, warehouse spaces)
- Festivals (Awakenings, Dekmantel, etc.)
- Labels (record labels)
- Releases (albums, EPs)
- Crews (DJ collectives)
- Gear (synthesizers, drum machines)

Current admin tools exist for:
${PROJECT_STRUCTURE.adminPages.map(p => `- ${p.name}: ${p.purpose}`).join("\n")}

Edge functions available:
${PROJECT_STRUCTURE.edgeFunctions.map(f => `- ${f.name}: ${f.purpose}`).join("\n")}

Database tables:
${PROJECT_STRUCTURE.databaseTables.map(t => `- ${t.name}: ${t.purpose}`).join("\n")}

Your task is to:
1. Analyze the current admin architecture
2. Identify GAPS in functionality
3. Suggest SPECIFIC new admin tools needed
4. Evaluate if existing tools are complete and functional
5. Prioritize recommendations by importance

Be specific, actionable, and technical. Focus on what's MISSING, not what exists.
Consider: security, scalability, monitoring, content quality, automation, user management.`;

    const userPrompt = `Here are the current database statistics:
${JSON.stringify(currentStats, null, 2)}

Based on this data and the project structure, please provide:

1. **MISSING ADMIN TOOLS** - List 5-8 specific admin tools that should be added, with:
   - Tool name
   - Purpose
   - Priority (critical/high/medium/low)
   - Implementation complexity (simple/moderate/complex)
   - Key features

2. **FUNCTIONALITY GAPS** - For each EXISTING admin page, identify:
   - What's working well
   - What's missing or incomplete
   - Suggested improvements

3. **END-TO-END VERIFICATION** - Check if these flows are complete:
   - Media pipeline (enqueue → fetch → verify → select → display)
   - Submission flow (submit → review → approve/reject → notify)
   - News agent (scan → select → write → publish)
   - Community flow (signup → verify → contribute → trust score)
   - API access (register → key → usage → rate limit → notify)

4. **SECURITY RECOMMENDATIONS** - Any security concerns with current admin setup

5. **AUTOMATION OPPORTUNITIES** - Tasks that could be automated

Return your analysis as structured JSON with sections for each area.`;

    console.log("Calling Lovable AI for analysis...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices?.[0]?.message?.content || "";

    console.log("AI analysis received, length:", analysisText.length);

    // Try to parse as JSON, otherwise return raw
    let analysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = analysisText.match(/```json\n?([\s\S]*?)\n?```/) || 
                        analysisText.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : analysisText;
      analysis = JSON.parse(jsonStr);
    } catch {
      analysis = { rawAnalysis: analysisText };
    }

    return new Response(JSON.stringify({ 
      success: true,
      stats: currentStats,
      analysis,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Admin audit error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
