import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Fetch recent analytics events (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: events, error: eventsError } = await supabase
      .from("analytics_events")
      .select("*")
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(1000);

    if (eventsError) {
      throw new Error(`Failed to fetch events: ${eventsError.message}`);
    }

    if (!events || events.length === 0) {
      return new Response(
        JSON.stringify({ 
          insights: [{
            type: "info",
            title: "No Data Yet",
            content: "Start tracking events to generate AI-powered insights."
          }]
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Aggregate data for AI analysis
    const eventCounts: Record<string, number> = {};
    const pageCounts: Record<string, number> = {};
    const hourlyDistribution: Record<number, number> = {};
    const uniqueUsers = new Set<string>();

    events.forEach((event) => {
      // Event type counts
      const key = `${event.event_type}:${event.event_name}`;
      eventCounts[key] = (eventCounts[key] || 0) + 1;

      // Page counts
      if (event.page_path) {
        pageCounts[event.page_path] = (pageCounts[event.page_path] || 0) + 1;
      }

      // Hourly distribution
      const hour = new Date(event.created_at).getHours();
      hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;

      // Unique users
      if (event.user_id) {
        uniqueUsers.add(event.user_id);
      }
    });

    const analyticsContext = {
      totalEvents: events.length,
      uniqueUsers: uniqueUsers.size,
      eventCounts,
      topPages: Object.entries(pageCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10),
      peakHours: Object.entries(hourlyDistribution)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([hour, count]) => ({ hour: parseInt(hour), count })),
      timeRange: "Last 7 days"
    };

    // Call Gemini via Lovable AI Gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an analytics expert for a techno music knowledge platform. Analyze user behavior data and provide actionable insights. Be concise and focus on:
1. User engagement patterns
2. Popular content areas
3. Usage trends
4. Recommendations for improvement

Format your response as JSON with this structure:
{
  "summary": "Brief overall summary",
  "insights": [
    { "type": "engagement|content|trend|recommendation", "title": "Short title", "content": "Detailed insight" }
  ],
  "metrics": { "engagementScore": 0-100, "growthTrend": "up|down|stable" }
}`
          },
          {
            role: "user",
            content: `Analyze this analytics data from the past 7 days:\n${JSON.stringify(analyticsContext, null, 2)}`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || "";
    
    // Parse AI response
    let parsedInsights;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                        aiContent.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, aiContent];
      parsedInsights = JSON.parse(jsonMatch[1] || aiContent);
    } catch {
      parsedInsights = {
        summary: aiContent,
        insights: [{ type: "info", title: "Analysis", content: aiContent }],
        metrics: { engagementScore: 50, growthTrend: "stable" }
      };
    }

    // Store insights in database
    const insightsToStore = parsedInsights.insights.map((insight: any) => ({
      insight_type: insight.type,
      title: insight.title,
      content: insight.content,
      data: { metrics: parsedInsights.metrics, raw: analyticsContext }
    }));

    await supabase.from("analytics_insights").insert(insightsToStore);

    return new Response(
      JSON.stringify({
        summary: parsedInsights.summary,
        insights: parsedInsights.insights,
        metrics: parsedInsights.metrics,
        rawData: analyticsContext
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Analytics insights error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
