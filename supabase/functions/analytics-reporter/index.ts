import { corsHeaders, handleCors, jsonResponse } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const supabase = createServiceClient();

  console.log("Analytics Reporter: Generating weekly insights...");

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

  // Get current week stats
  const { count: thisWeekEvents } = await supabase
    .from('analytics_events')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', oneWeekAgo);

  // Get last week stats for comparison
  const { count: lastWeekEvents } = await supabase
    .from('analytics_events')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', twoWeeksAgo)
    .lt('created_at', oneWeekAgo);

  // Get top pages
  const { data: topPages } = await supabase
    .from('analytics_events')
    .select('page_path')
    .eq('event_type', 'page_view')
    .gte('created_at', oneWeekAgo);

  const pageCounts: Record<string, number> = {};
  if (topPages) {
    for (const event of topPages) {
      if (event.page_path) {
        pageCounts[event.page_path] = (pageCounts[event.page_path] || 0) + 1;
      }
    }
  }

  const sortedPages = Object.entries(pageCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Get error count
  const { count: errorCount } = await supabase
    .from('analytics_events')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'error')
    .gte('created_at', oneWeekAgo);

  // Get search terms
  const { data: searchEvents } = await supabase
    .from('analytics_events')
    .select('metadata')
    .eq('event_type', 'search')
    .gte('created_at', oneWeekAgo)
    .limit(100);

  const searchTerms: Record<string, number> = {};
  if (searchEvents) {
    for (const event of searchEvents) {
      const term = (event.metadata as any)?.query?.toLowerCase();
      if (term) {
        searchTerms[term] = (searchTerms[term] || 0) + 1;
      }
    }
  }

  const topSearches = Object.entries(searchTerms)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  // Calculate week-over-week change
  const currentEvents = thisWeekEvents || 0;
  const previousEvents = lastWeekEvents || 1;
  const weekOverWeekChange = ((currentEvents - previousEvents) / previousEvents * 100).toFixed(1);

  const insights = {
    period: 'Last 7 days',
    totalEvents: currentEvents,
    weekOverWeekChange: `${weekOverWeekChange}%`,
    topPages: sortedPages.map(([path, count]) => ({ path, views: count })),
    topSearches: topSearches.map(([term, count]) => ({ term, searches: count })),
    errorCount: errorCount || 0,
    healthScore: errorCount && errorCount > 50 ? 'Needs attention' : 'Good'
  };

  // Store insight
  await supabase.from('analytics_insights').insert({
    insight_type: 'weekly_summary',
    title: `Weekly Report: ${new Date().toLocaleDateString()}`,
    content: `${currentEvents} events tracked (${weekOverWeekChange}% vs last week). ${errorCount || 0} errors.`,
    data: insights,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  });

  // Create agent report summary
  await supabase.from('agent_reports').insert({
    agent_name: 'Analytics Reporter',
    agent_category: 'growth',
    report_type: 'summary',
    severity: 'info',
    title: `Weekly Analytics: ${currentEvents} events`,
    description: `${weekOverWeekChange}% change vs last week. Top page: ${sortedPages[0]?.[0] || 'N/A'}`,
    details: insights
  });

  console.log("Analytics Reporter: Complete");

  return jsonResponse({
    success: true,
    timestamp: new Date().toISOString(),
    insights
  });
});