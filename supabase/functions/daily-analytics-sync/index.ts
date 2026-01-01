import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// GA4 property ID - extract from your GA4 property
const GA4_PROPERTY_ID = "properties/477911498"; // Update this with your actual GA4 property ID

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("Daily Analytics Sync: Starting...");

  try {
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get yesterday's date for daily sync
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    console.log(`Fetching GA4 data for date: ${dateStr}`);

    // Fetch data from GA4 Data API
    const ga4Response = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/${GA4_PROPERTY_ID}:runReport?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: dateStr, endDate: dateStr }],
          dimensions: [
            { name: "pagePath" },
            { name: "eventName" },
            { name: "hour" },
            { name: "deviceCategory" },
            { name: "country" }
          ],
          metrics: [
            { name: "eventCount" },
            { name: "activeUsers" },
            { name: "sessions" },
            { name: "engagementRate" },
            { name: "averageSessionDuration" }
          ]
        }),
      }
    );

    if (!ga4Response.ok) {
      const errorText = await ga4Response.text();
      console.error("GA4 API Error:", errorText);
      
      // If GA4 API fails, aggregate from internal tracking instead
      console.log("Falling back to internal analytics aggregation...");
      return await aggregateInternalAnalytics(supabase, dateStr, corsHeaders);
    }

    const ga4Data = await ga4Response.json();
    console.log("GA4 Data received:", JSON.stringify(ga4Data).substring(0, 500));

    // Process GA4 response
    const rows = ga4Data.rows || [];
    const dimensionHeaders = ga4Data.dimensionHeaders || [];
    const metricHeaders = ga4Data.metricHeaders || [];

    // Aggregate metrics
    let totalEvents = 0;
    let totalUsers = 0;
    let totalSessions = 0;
    let totalEngagement = 0;
    let totalDuration = 0;
    const pageCounts: Record<string, number> = {};
    const eventCounts: Record<string, number> = {};
    const hourlyActivity: Record<number, number> = {};
    const deviceBreakdown: Record<string, number> = {};
    const countryCounts: Record<string, number> = {};

    rows.forEach((row: any) => {
      const dimensions = row.dimensionValues || [];
      const metrics = row.metricValues || [];

      const pagePath = dimensions[0]?.value || '/';
      const eventName = dimensions[1]?.value || 'unknown';
      const hour = parseInt(dimensions[2]?.value || '0');
      const device = dimensions[3]?.value || 'unknown';
      const country = dimensions[4]?.value || 'unknown';

      const eventCount = parseInt(metrics[0]?.value || '0');
      const activeUsers = parseInt(metrics[1]?.value || '0');
      const sessions = parseInt(metrics[2]?.value || '0');
      const engagementRate = parseFloat(metrics[3]?.value || '0');
      const avgDuration = parseFloat(metrics[4]?.value || '0');

      totalEvents += eventCount;
      totalUsers += activeUsers;
      totalSessions += sessions;
      totalEngagement += engagementRate * eventCount;
      totalDuration += avgDuration * sessions;

      // Aggregate by dimensions
      pageCounts[pagePath] = (pageCounts[pagePath] || 0) + eventCount;
      eventCounts[eventName] = (eventCounts[eventName] || 0) + eventCount;
      hourlyActivity[hour] = (hourlyActivity[hour] || 0) + eventCount;
      deviceBreakdown[device] = (deviceBreakdown[device] || 0) + eventCount;
      countryCounts[country] = (countryCounts[country] || 0) + eventCount;
    });

    // Calculate averages
    const avgEngagement = totalEvents > 0 ? totalEngagement / totalEvents : 0;
    const avgSessionDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;

    // Store daily aggregate in analytics_insights
    const dailyReport = {
      insight_type: 'daily_ga4_sync',
      title: `Daily GA4 Report: ${dateStr}`,
      content: `Synced ${totalEvents} events from ${totalUsers} users across ${totalSessions} sessions. Average engagement: ${(avgEngagement * 100).toFixed(1)}%`,
      data: {
        date: dateStr,
        source: 'google_analytics_4',
        metrics: {
          totalEvents,
          uniqueUsers: totalUsers,
          totalSessions,
          avgEngagementRate: avgEngagement,
          avgSessionDuration
        },
        topPages: Object.entries(pageCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 20),
        topEvents: Object.entries(eventCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 20),
        hourlyActivity: Object.entries(hourlyActivity)
          .map(([hour, count]) => ({ hour: parseInt(hour), count }))
          .sort((a, b) => a.hour - b.hour),
        deviceBreakdown,
        topCountries: Object.entries(countryCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
      },
      expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days
    };

    const { error: insertError } = await supabase
      .from('analytics_insights')
      .insert(dailyReport);

    if (insertError) {
      console.error("Failed to insert daily report:", insertError);
    } else {
      console.log("Daily GA4 report stored successfully");
    }

    // Also create agent report for dashboard
    await supabase.from('agent_reports').insert({
      agent_name: 'GA4 Daily Sync',
      agent_category: 'growth',
      report_type: 'daily_sync',
      severity: 'info',
      title: `GA4 Daily: ${totalEvents} events`,
      description: `${totalUsers} users, ${totalSessions} sessions. Engagement: ${(avgEngagement * 100).toFixed(1)}%`,
      details: dailyReport.data
    });

    console.log("Daily Analytics Sync: Complete");

    return new Response(
      JSON.stringify({
        success: true,
        date: dateStr,
        source: 'google_analytics_4',
        metrics: {
          totalEvents,
          uniqueUsers: totalUsers,
          totalSessions,
          avgEngagementRate: avgEngagement
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Daily Analytics Sync error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Fallback: aggregate from internal analytics_events table
async function aggregateInternalAnalytics(supabase: any, dateStr: string, corsHeaders: Record<string, string>) {
  console.log("Aggregating internal analytics for:", dateStr);

  const startOfDay = `${dateStr}T00:00:00.000Z`;
  const endOfDay = `${dateStr}T23:59:59.999Z`;

  const { data: events, error } = await supabase
    .from('analytics_events')
    .select('*')
    .gte('created_at', startOfDay)
    .lte('created_at', endOfDay);

  if (error) {
    throw new Error(`Failed to fetch internal events: ${error.message}`);
  }

  const uniqueUsers = new Set<string>();
  const uniqueSessions = new Set<string>();
  const pageCounts: Record<string, number> = {};
  const eventCounts: Record<string, number> = {};
  const hourlyActivity: Record<number, number> = {};

  (events || []).forEach((event: any) => {
    if (event.user_id) uniqueUsers.add(event.user_id);
    if (event.session_id) uniqueSessions.add(event.session_id);
    
    if (event.page_path) {
      pageCounts[event.page_path] = (pageCounts[event.page_path] || 0) + 1;
    }
    
    const eventKey = `${event.event_type}:${event.event_name}`;
    eventCounts[eventKey] = (eventCounts[eventKey] || 0) + 1;
    
    const hour = new Date(event.created_at).getHours();
    hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
  });

  const dailyReport = {
    insight_type: 'daily_internal_sync',
    title: `Daily Internal Report: ${dateStr}`,
    content: `Aggregated ${events?.length || 0} events from ${uniqueUsers.size} users across ${uniqueSessions.size} sessions.`,
    data: {
      date: dateStr,
      source: 'internal_tracking',
      metrics: {
        totalEvents: events?.length || 0,
        uniqueUsers: uniqueUsers.size,
        totalSessions: uniqueSessions.size
      },
      topPages: Object.entries(pageCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20),
      topEvents: Object.entries(eventCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20),
      hourlyActivity: Object.entries(hourlyActivity)
        .map(([hour, count]) => ({ hour: parseInt(hour), count }))
        .sort((a, b) => a.hour - b.hour)
    },
    expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
  };

  await supabase.from('analytics_insights').insert(dailyReport);

  await supabase.from('agent_reports').insert({
    agent_name: 'Daily Analytics Sync',
    agent_category: 'growth',
    report_type: 'daily_sync',
    severity: 'info',
    title: `Internal Daily: ${events?.length || 0} events`,
    description: `${uniqueUsers.size} users, ${uniqueSessions.size} sessions (internal tracking fallback)`,
    details: dailyReport.data
  });

  return new Response(
    JSON.stringify({
      success: true,
      date: dateStr,
      source: 'internal_tracking',
      metrics: {
        totalEvents: events?.length || 0,
        uniqueUsers: uniqueUsers.size,
        totalSessions: uniqueSessions.size
      }
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
